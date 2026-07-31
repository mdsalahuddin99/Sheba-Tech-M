import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting specific users...");
  try {
    const emailsToDelete = [
      "pentester.harun@gmail.com",
      "Mamuncomputers2025@gmail.com"
    ];

    const result = await prisma.user.deleteMany({
      where: {
        email: {
          in: emailsToDelete
        }
      }
    });
    
    console.log(`Successfully deleted ${result.count} users!`);
  } catch (error) {
    console.error("Failed to delete users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
