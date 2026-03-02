// Password hashing using Node.js built-in crypto (PBKDF2)
import { randomBytes, pbkdf2Sync } from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(password: string): string {
    const salt = randomBytes(32).toString("hex");
    const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, originalHash] = stored.split(":");
    if (!salt || !originalHash) return false;
    const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
    return hash === originalHash;
}
