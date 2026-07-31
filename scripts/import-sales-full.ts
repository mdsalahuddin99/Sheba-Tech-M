import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const backupPath = "c:\\Users\\user\\Downloads\\shebatech-backup-2026-07-30.json";
  
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found at ${backupPath}`);
    return;
  }

  const rawData = fs.readFileSync(backupPath, "utf-8");
  const backupJson = JSON.parse(rawData);

  const rawSales = backupJson.data?.sales || [];
  if (rawSales.length === 0) {
    console.log("No Sales found in backup.");
    return;
  }

  console.log(`Found ${rawSales.length} Sales. Preparing for import...`);

  const validCustomers = new Set((await prisma.customer.findMany({ select: { id: true } })).map(x => x.id));
  const validProducts = new Set((await prisma.product.findMany({ select: { id: true } })).map(x => x.id));

  const salesToInsert = [];
  const saleItemsToInsert = [];
  const saleTendersToInsert = [];
  let skippedSales = 0;

  for (const s of rawSales) {
    if (s.customerId && !validCustomers.has(s.customerId)) {
      skippedSales++;
      continue;
    }

    const { items, tenders, ...saleData } = s;

    // Parse Dates
    if (saleData.createdAt) saleData.createdAt = new Date(saleData.createdAt);
    if (saleData.editedAt) saleData.editedAt = new Date(saleData.editedAt);

    salesToInsert.push(saleData);

    // Prepare items
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!validProducts.has(item.productId)) {
           continue; // Skip items with non-existent products
        }
        saleItemsToInsert.push({ ...item, saleId: saleData.id });
      }
    }

    // Prepare tenders
    if (Array.isArray(tenders)) {
      for (const tender of tenders) {
        saleTendersToInsert.push({ ...tender, saleId: saleData.id });
      }
    }
  }

  console.log(`Skipped ${skippedSales} Sales due to missing customers.`);
  
  // 1. Insert Sales
  console.log(`Inserting ${salesToInsert.length} Sales...`);
  await prisma.sale.createMany({ data: salesToInsert, skipDuplicates: true });

  // 2. Insert Sale Items
  console.log(`Inserting ${saleItemsToInsert.length} Sale Items...`);
  await prisma.saleItem.createMany({ data: saleItemsToInsert, skipDuplicates: true });

  // 3. Insert Sale Tenders
  console.log(`Inserting ${saleTendersToInsert.length} Sale Tenders...`);
  await prisma.saleTender.createMany({ data: saleTendersToInsert, skipDuplicates: true });

  console.log("✅ Invoices imported successfully!");

  // 4. Restore SerialNumber relations
  const snPath = "c:\\Users\\user\\Downloads\\SerialNumber.json";
  if (fs.existsSync(snPath)) {
    console.log("Found SerialNumber.json, restoring links to invoices...");
    const snRaw = fs.readFileSync(snPath, "utf-8");
    const serialNumbers = JSON.parse(snRaw);
    let linked = 0;

    for (const sn of serialNumbers) {
      if (sn.saleItemId) {
        try {
          await prisma.serialNumber.update({
            where: { serial: sn.serial },
            data: { saleItemId: sn.saleItemId }
          });
          linked++;
        } catch (err) {
          // Ignore if serial not found or saleItem not found
        }
      }
    }
    console.log(`✅ Restored ${linked} Serial Number to Invoice links!`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
