import { PrismaClient } from "./node_modules/.prisma/client/index.js";

const prisma = new PrismaClient();

async function main() {
  const warehouses = await prisma.warehouse.findMany();
  console.log("=== Warehouses ===");
  for (const wh of warehouses) {
    console.log(`  - ${wh.id}: ${wh.name} (active: ${wh.isActive})`);
  }
  console.log("");

  const productsWithStock = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    select: { id: true, name: true, stock: true, trackSerials: true },
    orderBy: { name: "asc" },
  });

  const warehouseStocks = await prisma.warehouseStock.findMany({
    select: { productId: true, warehouseId: true, qty: true },
  });

  const whStockByProduct = new Map();
  for (const ws of warehouseStocks) {
    if (!whStockByProduct.has(ws.productId)) whStockByProduct.set(ws.productId, []);
    whStockByProduct.get(ws.productId).push(ws);
  }

  console.log(`=== Products with stock > 0 but MISSING from WarehouseStock ===`);
  console.log(`Total products with stock > 0 (non-service): ${productsWithStock.length}`);
  console.log("");

  let missingCount = 0;
  for (const p of productsWithStock) {
    const hasAnyWarehouseStock = whStockByProduct.has(p.id);
    if (!hasAnyWarehouseStock) {
      missingCount++;
      console.log(`  [MISSING] ${p.name} | stock: ${Number(p.stock)} | trackSerials: ${p.trackSerials} | id: ${p.id}`);
    }
  }

  console.log("");
  console.log(`Total products missing from WarehouseStock: ${missingCount}`);

  console.log("");
  console.log("=== Products with stock > 0 but WarehouseStock qty = 0 ===");
  let zeroCount = 0;
  for (const p of productsWithStock) {
    const wsEntries = whStockByProduct.get(p.id);
    if (wsEntries) {
      const allZero = wsEntries.every((ws) => ws.qty <= 0);
      if (allZero) {
        zeroCount++;
        console.log(`  [ZERO WH] ${p.name} | product.stock: ${Number(p.stock)} | warehouseStock.qty: ${wsEntries.map(ws => ws.qty).join(",")} | id: ${p.id}`);
      }
    }
  }
  console.log(`Total products with zero warehouse stock: ${zeroCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
