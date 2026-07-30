/**
 * Password hashing utility using Node.js built-in crypto (scrypt).
 *
 * Avoids external bcrypt dependency while providing the same level of security.
 * Uses pbkdf2 with a random salt.
 *
 * Format: `pbkdf2:iterations:salt$hash` (self-describing for future algorithm migration).
 */
import "server-only";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 10000; 
const KEY_LENGTH = 64; 
const SALT_LENGTH = 32; 

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  return `pbkdf2:${ITERATIONS}:${salt}$${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  if (hash.startsWith("scrypt:")) {
    return false; // Force re-login/reset or handle legacy if needed, but here we just reset.
  }

  const parts = hash.split("$");
  if (parts.length !== 2) return false;

  const meta = parts[0];
  const storedHash = parts[1];

  const metaParts = meta.split(":");
  if (metaParts.length !== 3 || metaParts[0] !== "pbkdf2") return false;

  const iterations = Number(metaParts[1]) || ITERATIONS;
  const salt = metaParts[2];

  const derivedKey = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha512');
  const derivedHex = derivedKey.toString("hex");

  if (derivedHex.length !== storedHash.length) return false;
  return timingSafeEqual(Buffer.from(derivedHex), Buffer.from(storedHash));
}

export function isHashedPassword(hash: string): boolean {
  return hash.startsWith("pbkdf2:");
}
