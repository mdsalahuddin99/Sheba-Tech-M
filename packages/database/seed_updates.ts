import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.systemUpdate.create({
    data: {
      version: "v1.2.0",
      date: new Date(),
      features: [
        "Added 'Updates & Changelog' page to system menu.",
        "New 'System Updates' feature so clients can stay informed."
      ],
      improvements: [
        "Optimized sidebar layout for better visibility.",
        "Minor UI enhancements in settings."
      ],
      fixes: [
        "Fixed an issue with trailing spaces in environment variables.",
        "Fixed port assignment bug in storefront."
      ]
    }
  });

  console.log("Update seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
