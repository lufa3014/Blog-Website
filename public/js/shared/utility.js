import * as crypto from 'node:crypto';
const iterations = 10000;
const keylen = 64;
const digest = 'sha512';
export function createHash(password) {
    const salt = process.env.AUTH_SALT;
    if (!salt) {
        throw new Error('AUTH_SALT is not defined in .env file');
    }
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
}
