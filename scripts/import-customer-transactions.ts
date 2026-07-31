import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const filePath = "g:\\CLIENT PROJECT\\Sheba Tech\\transactions.json";
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    return;
  }

  console.log("Reading transactions file...");
  const rawData = fs.readFileSync(filePath, "utf-8");
  let transactions: any[] = [];
  
  try {
    transactions = JSON.parse(rawData);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }

  if (!Array.isArray(transactions) || transactions.length === 0) {
    console.log("No transactions found in the file.");
    return;
  }

  console.log(`Found ${transactions.length} transactions. Validating relations...`);

  // Fetch valid IDs from DB
  const validCustomers = new Set((await prisma.customer.findMany({ select: { id: true } })).map(x => x.id));
  const validAccounts = new Set((await prisma.financialAccount.findMany({ select: { id: true } })).map(x => x.id));
  const validSales = new Set((await prisma.sale.findMany({ select: { id: true } })).map(x => x.id));
  // Not checking User (createdById) because it's optional, but it is String?

  const validTransactions = [];
  let skippedBecauseNoCustomer = 0;

  for (const t of transactions) {
    // customerId is required
    if (!validCustomers.has(t.customerId)) {
      skippedBecauseNoCustomer++;
      continue;
    }

    const newT = { ...t };

    // Nullify optional relations if they don't exist
    if (newT.saleId && !validSales.has(newT.saleId)) {
      newT.saleId = null;
    }
    if (newT.accountId && !validAccounts.has(newT.accountId)) {
      newT.accountId = null;
    }
    // Convert amounts to proper Decimal format or keep as string (Prisma handles string decimals)
    // Dates need to be parsed
    if (newT.createdAt) {
      newT.createdAt = new Date(newT.createdAt);
    }
    // same for updatedAt if it exists
    if (newT.updatedAt) {
      newT.updatedAt = new Date(newT.updatedAt);
    }

    validTransactions.push(newT);
  }

  console.log(`Skipped ${skippedBecauseNoCustomer} transactions due to missing Customers.`);
  console.log(`Ready to import ${validTransactions.length} valid transactions...`);

  if (validTransactions.length > 0) {
    try {
      await prisma.customerTransaction.createMany({
        data: validTransactions,
        skipDuplicates: true
      });
      console.log(`✅ Successfully imported ${validTransactions.length} transactions!`);
    } catch (error) {
      console.error("❌ Error during createMany:", error);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
