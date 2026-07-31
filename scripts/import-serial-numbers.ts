import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const filePath = "c:\\Users\\user\\Downloads\\SerialNumber.json";
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  let serialNumbers: any[] = [];
  try {
    serialNumbers = JSON.parse(rawData);
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return;
  }

  if (serialNumbers.length === 0) {
    console.log("No Serial Numbers found in the file.");
    return;
  }

  console.log(`Found ${serialNumbers.length} Serial Numbers. Validating relations...`);
  
  // Fetch valid IDs to prevent Foreign Key Constraint errors
  const validProducts = new Set((await prisma.product.findMany({ select: { id: true } })).map(x => x.id));
  const validSaleItems = new Set((await prisma.saleItem.findMany({ select: { id: true } })).map(x => x.id));
  const validPurchaseItems = new Set((await prisma.purchaseItem.findMany({ select: { id: true } })).map(x => x.id));
  const validWarehouses = new Set((await prisma.warehouse.findMany({ select: { id: true } })).map(x => x.id));
  
  const validRecords = [];
  let skipped = 0;
  let orphanedSales = 0;

  for (const sn of serialNumbers) {
    // productId is required
    if (!validProducts.has(sn.productId)) {
      skipped++;
      continue;
    }

    const newSn = { ...sn };

    // Nullify optional relations if they don't exist
    if (newSn.saleItemId && !validSaleItems.has(newSn.saleItemId)) {
      newSn.saleItemId = null;
      orphanedSales++;
    }
    if (newSn.purchaseItemId && !validPurchaseItems.has(newSn.purchaseItemId)) {
      newSn.purchaseItemId = null;
    }
    if (newSn.warehouseId && !validWarehouses.has(newSn.warehouseId)) {
      newSn.warehouseId = null;
    }
    
    // Parse Dates
    if (newSn.soldAt) newSn.soldAt = new Date(newSn.soldAt);
    if (newSn.createdAt) newSn.createdAt = new Date(newSn.createdAt);
    if (newSn.warrantyExpiryDate) newSn.warrantyExpiryDate = new Date(newSn.warrantyExpiryDate);
    
    validRecords.push(newSn);
  }

  console.log(`Skipped ${skipped} records due to missing Product.`);
  if (orphanedSales > 0) {
    console.log(`⚠️ WARNING: ${orphanedSales} Serial Numbers had their 'saleItemId' set to null because the Sales/Invoices do not exist in the database yet!`);
  }
  console.log(`Ready to import ${validRecords.length} valid Serial Numbers...`);

  if (validRecords.length > 0) {
    try {
      await prisma.serialNumber.createMany({
        data: validRecords,
        skipDuplicates: true
      });
      console.log(`✅ Successfully imported ${validRecords.length} Serial Numbers!`);
    } catch (error) {
      console.error("❌ Error importing Serial Numbers:", error);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
