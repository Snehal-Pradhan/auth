import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config(path.resolve(__dirname, "../.env"));

const CRYPTO_CONSTANTS = {
    HMAC_ALGORITHM: "sha256",
    AES_ALGORITHM: "aes-256-gcm",
    AES_IV_LENGTH: 16,
    AES_AUTH_TAG_LENGTH: 16,
    KEY_ENCODING: 'hex',
    DATA_ENCODING: 'base64',
    DEFAULT_COOKIE_TTL_MS: 24 * 60 * 60 * 1000,
    NONCE_VALIDITY_WINDOW_MS: 5 * 60 * 1000,
}

const SECRETS = {
    SIGNING_KEY_CURRENT: process.env.SIGNING_KEY_CURRENT,
    ENCRYPTION_KEY_CURRENT: process.env.ENCRYPTION_KEY_CURRENT
};

if (!SECRETS.SIGNING_KEY_CURRENT || !SECRETS.ENCRYPTION_KEY_CURRENT) {
    console.error('ERROR: Missing SIGNING_KEY_CURRENT or ENCRYPTION_KEY_CURRENT environment variables.');
    console.error('Please ensure they are set in your .env file or environment.');
    process.exit(1); 
}

export default {CRYPTO_CONSTANTS,SECRETS};