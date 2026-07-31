import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

const SCRYPT_PARAMS = "16384:8:1";
const KEY_LENGTH = 64;
const SALT_LENGTH = 32;

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
  const newPassword = "123456";

  const passwordHash = hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  console.log(`✅ Successfully reset password for ${updatedUser.email} to '${newPassword}'`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
