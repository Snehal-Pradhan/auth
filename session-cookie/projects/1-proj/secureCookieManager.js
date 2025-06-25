import { encrypt, decrypt } from "./cookieEncryption.js";
import { sign, verify } from "./cookieSigner.js";

const COOKIE_DELIMITER = '.';

export function createSecureCookie(payload) {
    const encryptedPayload = encrypt(payload);

    if (!encryptedPayload) {
        throw new Error("Failed to encrypt payload for cookie.");
    }

    const signature = sign(encryptedPayload);

    return `${encryptedPayload}${COOKIE_DELIMITER}${signature}`;
}

export function verifyAndDecryptCookie(cookieValue) {
    const parts = cookieValue.split(COOKIE_DELIMITER);

    if (parts.length !== 2) {
        console.warn("Invalid cookie format: Does not contain expected delimiter.");
        return null;
    }

    const encryptedPayload = parts[0];
    const receivedSignature = parts[1];

    const isSignatureValid = verify(encryptedPayload, receivedSignature);

    if (!isSignatureValid) {
        console.warn("Cookie signature is invalid or tampered!");
        return null;
    }
    const decryptedPayload = decrypt(encryptedPayload);

    if (decryptedPayload === null) {
        console.warn("Cookie decryption failed (likely internal tampering detected by GCM or incorrect key/IV).");
        return null;
    }

    return decryptedPayload;
}
