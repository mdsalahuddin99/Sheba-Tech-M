const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Fix: assign all IN_STOCK serials with NULL warehouseId to "HQ Warehouse"
  const result = await prisma.serialNumber.updateMany({
    where: { status: "IN_STOCK", warehouseId: null },
    data: { warehouseId: "seed-wh-hq" },
  });

  console.log("Fixed", result.count, "serial numbers - assigned to HQ Warehouse");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
