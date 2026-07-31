import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const ITERATIONS = 10000; 
const KEY_LENGTH = 64; 
const SALT_LENGTH = 32; 

function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  return `pbkdf2:${ITERATIONS}:${salt}$${derivedKey.toString("hex")}`;
}

async function main() {
  const email = "onlinetaiba@gmail.com";
  const newPassword = "123456";

  const passwordHash = hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  console.log(`✅ Successfully reset password for ${updatedUser.email} to '${newPassword}' using PBKDF2`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
