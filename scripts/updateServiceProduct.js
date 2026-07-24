const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: {
      name: { contains: "All Services" }
    },
    data: {
      isService: true
    }
  });
  console.log("Updated All Services to isService=true");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
