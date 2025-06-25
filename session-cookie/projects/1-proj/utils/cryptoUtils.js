function generateRandomBytes(length) {
    if (typeof length !== 'number' || length <= 0) {
        throw new Error('Invalid length for random bytes generation.');
    }
    try {
        return crypto.randomBytes(length);
    } catch (error) {
        console.error('Error generating random bytes:', error.message);
        throw new Error('Failed to generate random bytes.');
    }
}