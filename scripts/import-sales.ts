import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const filePath = "c:\\Users\\user\\Downloads\\shebatech-backup-2026-07-30.json";
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  const backupJson = JSON.parse(rawData);

  const sales = backupJson.data?.sales;

  if (!sales || sales.length === 0) {
    console.log("No Sales data found in the backup.");
    return;
  }

  console.log(`Found ${sales.length} Sales records. Validating...`);
  
  // Get valid customers
  const validCustomers = new Set((await prisma.customer.findMany({ select: { id: true } })).map(x => x.id));
  
  const validSales = [];
  let skipped = 0;

  for (const sale of sales) {
    if (!validCustomers.has(sale.customerId)) {
      skipped++;
      continue;
    }
    
    // Parse Dates
    if (sale.createdAt) sale.createdAt = new Date(sale.createdAt);
    if (sale.updatedAt) sale.updatedAt = new Date(sale.updatedAt);
    if (sale.date) sale.date = new Date(sale.date);
    
    validSales.push(sale);
  }

  console.log(`Skipped ${skipped} sales due to missing customer.`);
  console.log(`Ready to import ${validSales.length} valid sales...`);

  if (validSales.length > 0) {
    try {
      await prisma.sale.createMany({
        data: validSales,
        skipDuplicates: true
      });
      console.log(`✅ Successfully imported ${validSales.length} Sales (Invoices)!`);
    } catch (error) {
      console.error("❌ Error importing Sales:", error);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
