const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const warehouseId = "seed-wh-hq";

  // Find all products with stock > 0 that DON'T have a WarehouseStock record in HQ
  const products = await prisma.product.findMany({
    where: { deletedAt: null, stock: { gt: 0 }, isService: false },
    select: { id: true, name: true, stock: true },
  });

  const existingWarehouseStocks = await prisma.warehouseStock.findMany({
    where: { warehouseId },
    select: { productId: true, qty: true },
  });
  const existingMap = new Map(existingWarehouseStocks.map(ws => [ws.productId, ws.qty]));

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const existingQty = existingMap.get(product.id);

    if (existingQty === undefined) {
      // No warehouse stock record exists - create one
      await prisma.warehouseStock.create({
        data: { warehouseId, productId: product.id, qty: product.stock },
      });
      console.log("CREATED:", product.name, "| Stock:", product.stock);
      created++;
    } else if (existingQty < product.stock) {
      // Warehouse stock is less than global stock - sync it
      await prisma.warehouseStock.update({
        where: { warehouseId_productId: { warehouseId, productId: product.id } },
        data: { qty: product.stock },
      });
      console.log("UPDATED:", product.name, "| Was:", existingQty, "-> Now:", product.stock);
      updated++;
    }
  }

  console.log("\n=== Summary ===");
  console.log("Created:", created, "new warehouse stock records");
  console.log("Updated:", updated, "existing warehouse stock records");
  console.log("Total products checked:", products.length);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
