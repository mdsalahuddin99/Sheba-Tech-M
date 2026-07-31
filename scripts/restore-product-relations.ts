import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const backupPath = "c:\\Users\\user\\Downloads\\shebatech-backup-2026-07-30.json";
  
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found at ${backupPath}`);
    return;
  }

  console.log("Reading backup file...");
  const rawData = fs.readFileSync(backupPath, "utf-8");
  const backupJson = JSON.parse(rawData);

  const products = backupJson.data?.products;

  if (!products || products.length === 0) {
    console.log("No products found in the backup.");
    return;
  }

  console.log(`Found ${products.length} products. Updating relations...`);
  
  let successCount = 0;
  let failCount = 0;

  for (const product of products) {
    try {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          globalBrandId: product.globalBrandId || null,
          globalModelId: product.globalModelId || null,
          globalSeriesId: product.globalSeriesId || null,
          productTypeId: product.productTypeId || null,
        }
      });
      successCount++;
    } catch (error) {
      failCount++;
      // Ignore if product doesn't exist
    }
  }

  console.log(`Completed. Successfully updated: ${successCount}. Failed: ${failCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
