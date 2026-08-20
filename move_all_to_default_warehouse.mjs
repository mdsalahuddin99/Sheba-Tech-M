/**
 * Move all products to the default warehouse (seed-wh-hq).
 * 
 * This script:
 * 1. Finds the default warehouse
 * 2. For each non-deleted, non-service product:
 *    - Creates a WarehouseStock record if none exists
 *    - Updates existing WarehouseStock if qty doesn't match product.stock
 * 3. Reports a summary of changes
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Step 1: Find the default warehouse
  const warehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });

  console.log("=== Available Warehouses ===");
  warehouses.forEach((w) => console.log(`  - ${w.name} (${w.id})`));
  console.log("");

  if (warehouses.length === 0) {
    console.error("ERROR: No active warehouses found!");
    process.exit(1);
  }

  // Use the first (and only) warehouse as default
  const defaultWarehouse = warehouses[0];
  const warehouseId = defaultWarehouse.id;
  console.log(`Using default warehouse: "${defaultWarehouse.name}" (${warehouseId})\n`);

  // Step 2: Get ALL products (excluding deleted and service products)
  const products = await prisma.product.findMany({
    where: { deletedAt: null, isService: false },
    select: { id: true, name: true, stock: true, sku: true },
  });

  console.log(`Total products found: ${products.length}\n`);

  // Step 3: Get existing warehouse stock records for this warehouse
  const existingWarehouseStocks = await prisma.warehouseStock.findMany({
    where: { warehouseId },
    select: { productId: true, qty: true },
  });
  const existingMap = new Map(
    existingWarehouseStocks.map((ws) => [ws.productId, ws.qty])
  );

  console.log(`Existing warehouse stock records: ${existingWarehouseStocks.length}\n`);

  let created = 0;
  let updated = 0;
  let alreadyOk = 0;
  let errors = 0;

  // Step 4: Create or update WarehouseStock for each product
  for (const product of products) {
    try {
      const existingQty = existingMap.get(product.id);

      if (existingQty === undefined) {
        // No warehouse stock record exists — create one
        await prisma.warehouseStock.create({
          data: { warehouseId, productId: product.id, qty: product.stock },
        });
        console.log(
          `✅ CREATED: [${product.sku}] ${product.name} | Stock: ${product.stock}`
        );
        created++;
      } else if (existingQty !== product.stock) {
        // Warehouse stock doesn't match product stock — sync it
        await prisma.warehouseStock.update({
          where: {
            warehouseId_productId: { warehouseId, productId: product.id },
          },
          data: { qty: product.stock },
        });
        console.log(
          `🔄 SYNCED: [${product.sku}] ${product.name} | Was: ${existingQty} -> Now: ${product.stock}`
        );
        updated++;
      } else {
        alreadyOk++;
      }
    } catch (err) {
      console.error(`❌ ERROR: [${product.sku}] ${product.name} - ${err.message}`);
      errors++;
    }
  }

  // Step 5: Summary
  console.log("\n" + "=".repeat(50));
  console.log("=== SUMMARY ===");
  console.log("=".repeat(50));
  console.log(`Warehouse:        ${defaultWarehouse.name} (${warehouseId})`);
  console.log(`Total products:   ${products.length}`);
  console.log(`Created (new):    ${created}`);
  console.log(`Synced (updated): ${updated}`);
  console.log(`Already OK:       ${alreadyOk}`);
  console.log(`Errors:           ${errors}`);
  console.log("=".repeat(50));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
