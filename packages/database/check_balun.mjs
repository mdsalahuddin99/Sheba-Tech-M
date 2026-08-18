import { PrismaClient } from "./node_modules/.prisma/client/index.js";

const prisma = new PrismaClient();

async function main() {
  // Search for "Video Balun" product
  const products = await prisma.product.findMany({
    where: { name: { contains: "Video", mode: "insensitive" } },
    select: { id: true, name: true, stock: true, trackSerials: true, sku: true },
  });

  console.log("=== Products matching 'Video' ===");
  for (const p of products) {
    console.log(`  ${p.name} | stock: ${Number(p.stock)} | trackSerials: ${p.trackSerials} | sku: ${p.sku} | id: ${p.id}`);
    
    // Check warehouse stock
    const whStocks = await prisma.warehouseStock.findMany({
      where: { productId: p.id },
      include: { warehouse: { select: { name: true } } },
    });
    for (const ws of whStocks) {
      console.log(`    -> Warehouse: ${ws.warehouse.name} | qty: ${ws.qty}`);
    }

    // Check serial numbers
    if (p.trackSerials) {
      const serialCounts = await prisma.serialNumber.groupBy({
        by: ["status"],
        where: { productId: p.id },
        _count: { id: true },
      });
      console.log(`    -> Serial counts:`, serialCounts.map(c => `${c.status}: ${c._count.id}`).join(", "));
    }

    if (whStocks.length === 0) {
      console.log(`    -> [WARNING] No WarehouseStock entry for this product!`);
    }
  }

  // Also check "Balun"
  const balunProducts = await prisma.product.findMany({
    where: { name: { contains: "Balun", mode: "insensitive" } },
    select: { id: true, name: true, stock: true, trackSerials: true, sku: true },
  });

  console.log("\n=== Products matching 'Balun' ===");
  for (const p of balunProducts) {
    console.log(`  ${p.name} | stock: ${Number(p.stock)} | trackSerials: ${p.trackSerials} | sku: ${p.sku} | id: ${p.id}`);
    
    const whStocks = await prisma.warehouseStock.findMany({
      where: { productId: p.id },
      include: { warehouse: { select: { name: true } } },
    });
    for (const ws of whStocks) {
      console.log(`    -> Warehouse: ${ws.warehouse.name} | qty: ${ws.qty}`);
    }

    if (p.trackSerials) {
      const serialCounts = await prisma.serialNumber.groupBy({
        by: ["status"],
        where: { productId: p.id },
        _count: { id: true },
      });
      console.log(`    -> Serial counts:`, serialCounts.map(c => `${c.status}: ${c._count.id}`).join(", "));
    }

    if (whStocks.length === 0) {
      console.log(`    -> [WARNING] No WarehouseStock entry for this product!`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
