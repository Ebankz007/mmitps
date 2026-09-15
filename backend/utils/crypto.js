const crypto = require('crypto');

// Use a secret key from environment variables or a fallback (for development)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vov7k799567995678912345678901234'; // Must be 32 characters
const IV_LENGTH = 16; // For AES-CBC-256

/**
 * Encrypts a string
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text in the format "iv:encrypted"
 */
function encrypt(text) {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

/**
 * Decrypts a string
 * @param {string} text - The encrypted text in the format "iv:encrypted"
 * @returns {string} - The decrypted text
 */
function decrypt(text) {
    if (!text) return null;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

module.exports = {
    encrypt,
    decrypt
};
