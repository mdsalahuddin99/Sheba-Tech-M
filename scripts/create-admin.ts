import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

const SCRYPT_PARAMS = "16384:8:1"; // N, r, p
const KEY_LENGTH = 64; // 512-bit output
const SALT_LENGTH = 32; // 256-bit salt

function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return `scrypt:${SCRYPT_PARAMS}:${salt}$${derivedKey.toString("hex")}`;
}

async function main() {
  const email = "onlinetaiba@gmail.com";
  const password = "123456";
  const hash = hashPassword(password);

  console.log(`Creating/updating admin user: ${email}`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      role: 'ADMIN',
      name: 'System Admin',
      active: true,
    },
    create: {
      email,
      passwordHash: hash,
      role: 'ADMIN',
      name: 'System Admin',
      active: true,
    }
  });

  console.log(`Success! Admin user created with ID: ${user.id}`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
