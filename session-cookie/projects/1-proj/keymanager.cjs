// keyManager.js

const crypto = require('crypto');

// Function to generate a cryptographically secure random key
function generateSecureKey(lengthBytes) {
    return crypto.randomBytes(lengthBytes).toString('hex'); // Returns a hex string
}

let signingKeys = {
    current: generateSecureKey(32),
    previous: [] // Array to hold older keys
};

let encryptionKeys = {
    current: generateSecureKey(32),
    previous: [] // Array to hold older keys
};



console.log("Generated Signing Key (hex):", SIGNING_KEY);
console.log("Generated Encryption Key (hex):", ENCRYPTION_KEY);

// In a real application, these keys would be loaded securely,
// e.g., from environment variables, and not exposed in logs.

// We will export these keys so other modules can use them.
module.exports = {
    SIGNING_KEY,
    ENCRYPTION_KEY
};