import crypto from "crypto";
import { ENCRYPTION_KEY } from "./keymanager.cjs";

const AES_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export function encrypt(text) {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex')
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(AES_ALGORITHM, keyBuffer, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    const combined = iv.toString('hex') + encrypted + authTag.toString('hex');

    return combined;
}

export function decrypt(combinedData) {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(combinedData.substring(0, IV_LENGTH * 2), 'hex');
    const encryptedText = combinedData.substring(IV_LENGTH * 2, combinedData.length - AUTH_TAG_LENGTH * 2);
    const authTag = Buffer.from(combinedData.substring(combinedData.length - AUTH_TAG_LENGTH * 2), 'hex');

    const decipher = crypto.createDecipheriv(AES_ALGORITHM, keyBuffer, iv);

    decipher.setAuthTag(authTag);

    try {
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error.message);
        return null;
    }
}

const sensitiveData = "user_email=john.doe@example.com&premium=true";

console.log("\nOriginal Sensitive Data:", sensitiveData);

const encryptedData = encrypt(sensitiveData);
console.log("Encrypted Data (IV+Ciphertext+AuthTag):", encryptedData);

const decryptedData = decrypt(encryptedData);
console.log("Decrypted Data:", decryptedData);

const tamperedEncryptedData = encryptedData.slice(0, -10) + 'abc123def4567890';
console.log("\nTampered Encrypted Data:", tamperedEncryptedData);
const tamperedDecryptedData = decrypt(tamperedEncryptedData);
console.log("Decrypted Tampered Data:", tamperedDecryptedData);

