import crypto from "crypto";
import client from "./redis.js";


export const generateKey = async () => {
    const keyId = `key_${Date.now()}`;
    const key = crypto.randomBytes(32);
    await client.set(`keys:${keyId}`, key.toString('base64'));
    await client.set('keys:current_key_id', keyId);

    return keyId;
}

export async function getCurrentKey() {
    const keyId = await client.get('keys:current_key_id');
    const key = await client.get(`keys:${keyId}`);
    return Buffer.from(key, 'base64');
}