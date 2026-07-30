import { PrismaClient } from '@prisma/client';
import { scryptSync, timingSafeEqual } from "crypto";

const prisma = new PrismaClient();

const KEY_LENGTH = 64; 

function verifyPassword(password: string, hash: string): boolean {
  const parts = hash.split("$");
  if (parts.length !== 2) return false;

  const meta = parts[0];
  const storedHash = parts[1];

  const metaParts = meta.split(":");
  if (metaParts.length !== 5 || metaParts[0] !== "scrypt") return false;

  const N = Number(metaParts[1]) || 16384;
  const r = Number(metaParts[2]) || 8;
  const p = Number(metaParts[3]) || 1;
  const salt = metaParts[4]; 

  const derivedKey = scryptSync(password, salt, KEY_LENGTH, { N, r, p });
  const derivedHex = derivedKey.toString("hex");

  if (derivedHex.length !== storedHash.length) return false;
  return timingSafeEqual(Buffer.from(derivedHex), Buffer.from(storedHash));
}

async function main() {
  console.log("Checking DB connection...");
  const user = await prisma.user.findUnique({
    where: { email: 'onlinetaiba@gmail.com' }
  });
  console.log("User role:", user?.role);
  
  if (!user) {
    console.log("ERROR: User 'onlinetaiba@gmail.com' NOT FOUND in the database!");
    return;
  }
  
  console.log("User found in DB. ID:", user.id);
  console.log("Password Hash:", user.passwordHash);

  const pwd = "Mizan@2027";
  const isValid = verifyPassword(pwd, user.passwordHash!);
  
  if (isValid) {
    console.log(`SUCCESS: The password '${pwd}' is VALID for this hash!`);
    console.log("If you still can't log in, the issue is on the frontend/Auth.js side.");
  } else {
    console.log(`FAILURE: The password '${pwd}' does NOT match the hash in the DB!`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
