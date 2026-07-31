import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { phone: "01971494745" },
    include: {
      sales: true,
      transactions: true,
    }
  });

  if (!customer) {
    console.log("Customer not found!");
    return;
  }

  console.log(`Customer: ${customer.name} (ID: ${customer.id})`);
  console.log(`Number of sales (invoices): ${customer.sales.length}`);
  console.log(`Number of transactions: ${customer.transactions.length}`);

  const totalSales = await prisma.sale.count();
  console.log(`Total Sales in DB: ${totalSales}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
