import { generateKey, getCurrentKey } from '../key-service.js';

async function testKeys() {
    const keyId = await generateKey();
    console.log('Generated key ID:', keyId);

    const key = await getCurrentKey();
    console.log('Current key:', key.toString('base64'));
}

testKeys().catch(console.error);