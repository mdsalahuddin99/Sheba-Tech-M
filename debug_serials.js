const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Find all products with trackSerials=true that have mismatched serial counts
  const products = await prisma.product.findMany({
    where: { trackSerials: true, deletedAt: null },
    select: {
      id: true, name: true, stock: true, trackSerials: true,
      serialNumbers: { where: { status: "IN_STOCK" }, select: { id: true, warehouseId: true } },
    },
    orderBy: { name: "asc" },
  });

  // Get warehouses
  const warehouses = await prisma.warehouse.findMany({ select: { id: true, name: true } });
  console.log("\n=== Warehouses ===");
  for (const w of warehouses) {
    console.log("  ID:", w.id, "| Name:", w.name);
  }

  console.log("\n=== Products where IN_STOCK serials DON'T match in a specific warehouse ===\n");
  
  for (const p of products) {
    const totalSerials = p.serialNumbers.length;
    
    for (const w of warehouses) {
      const serialsInWarehouse = p.serialNumbers.filter(s => s.warehouseId === w.id).length;
      const serialsWithNull = p.serialNumbers.filter(s => s.warehouseId === null).length;
      
      if (p.stock > 0 && serialsInWarehouse < p.stock && totalSerials > 0) {
        console.log("Product:", p.name);
        console.log("  Stock:", p.stock);
        console.log("  Total IN_STOCK serials:", totalSerials);
        console.log("  Serials in", w.name, "(" + w.id + "):", serialsInWarehouse);
        console.log("  Serials with NULL warehouse:", serialsWithNull);
        console.log("---");
      }
    }
  }

  // Also search for the specific router
  const router = await prisma.product.findFirst({
    where: { name: { contains: "300", mode: "insensitive" } },
    select: {
      id: true, name: true, stock: true, trackSerials: true,
      serialNumbers: { select: { serial: true, status: true, warehouseId: true } },
    },
  });
  
  if (router) {
    console.log("\n=== Router Product ===");
    console.log("Name:", router.name);
    console.log("Stock:", router.stock);
    console.log("Track Serials:", router.trackSerials);
    console.log("Serials:");
    for (const s of router.serialNumbers) {
      console.log("  ", s.serial, "| Status:", s.status, "| WarehouseId:", s.warehouseId || "NULL");
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
