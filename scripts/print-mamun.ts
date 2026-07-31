import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { phone: "01971494745" },
    include: { sales: true }
  });
  
  if (!customer) {
    console.log("Customer not found");
  } else {
    console.log("Customer found:", customer.name);
    console.log("Customer ID:", customer.id);
    console.log("Sales count:", customer.sales.length);
    
    const allSales = await prisma.sale.findMany({
      include: { customer: true }
    });
    console.log("Total sales in DB:", allSales.length);
    console.log("Some customers with sales:", Array.from(new Set(allSales.map(s => s.customer?.name))));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
