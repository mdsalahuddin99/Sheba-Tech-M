import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sales = await prisma.sale.findMany({
    include: { customer: true }
  });
  console.log(`Total sales: ${sales.length}`);
  
  if (sales.length > 0) {
    console.log("First sale:", sales[0]);
    console.log("First sale customer:", sales[0].customer?.name);
  }

  const customerId = await prisma.customer.findFirst({
    where: { phone: "01971494745" }
  });
  console.log(`Customer Mamunur Rashid ID: ${customerId?.id}`);

  const mamunSales = await prisma.sale.findMany({
    where: { customerId: customerId?.id }
  });
  console.log(`Mamunur Rashid sales count: ${mamunSales.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
