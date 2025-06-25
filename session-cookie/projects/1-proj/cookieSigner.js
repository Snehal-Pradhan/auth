import crypto from "crypto";
import { SIGNING_KEY } from "./keymanager.cjs";

export function sign(data) {
    const keyBuffer = Buffer.from(SIGNING_KEY, 'hex');
    const hmac = crypto.createHmac('sha256', keyBuffer);
    hmac.update(data, 'utf8');
    return hmac.digest('hex');
}

export function verify(data, signature) {
    const expectedSignature = sign(data);
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
}


const sampleData = "user_id=123&role=admin&exp=1700000000";

const generatedSignature = sign(sampleData);
console.log("\nSample Data:", sampleData);
console.log("Generated Signature:", generatedSignature);


const isValid = verify(sampleData, generatedSignature);
console.log("Is signature valid (correct data & signature)?", isValid);

const tamperedData = "user_id=123&role=guest&exp=1700000000";
const isTamperedInvalid = verify(tamperedData, generatedSignature);
console.log("Is signature valid (tampered data)?", isTamperedInvalid);


const incorrectSignature = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
const isIncorrectSigInvalid = verify(sampleData, incorrectSignature);
console.log("Is signature valid (incorrect signature)?", isIncorrectSigInvalid); 