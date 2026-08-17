const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const warehouseId = "seed-wh-hq";

  // ALL products (including stock=0), excluding deleted and service products
  const products = await prisma.product.findMany({
    where: { deletedAt: null, isService: false },
    select: { id: true, name: true, stock: true },
  });

  const existingWarehouseStocks = await prisma.warehouseStock.findMany({
    where: { warehouseId },
    select: { productId: true, qty: true },
  });
  const existingMap = new Map(existingWarehouseStocks.map(ws => [ws.productId, ws.qty]));

  let created = 0;
  let updated = 0;
  let alreadyOk = 0;

  for (const product of products) {
    const existingQty = existingMap.get(product.id);

    if (existingQty === undefined) {
      await prisma.warehouseStock.create({
        data: { warehouseId, productId: product.id, qty: product.stock },
      });
      console.log("CREATED:", product.name, "| Stock:", product.stock);
      created++;
    } else if (existingQty !== product.stock) {
      await prisma.warehouseStock.update({
        where: { warehouseId_productId: { warehouseId, productId: product.id } },
        data: { qty: product.stock },
      });
      console.log("SYNCED:", product.name, "| Was:", existingQty, "-> Now:", product.stock);
      updated++;
    } else {
      alreadyOk++;
    }
  }

  console.log("\n=== Summary ===");
  console.log("Total products:", products.length);
  console.log("Created:", created);
  console.log("Synced:", updated);
  console.log("Already OK:", alreadyOk);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
