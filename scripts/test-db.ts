import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Checking database records...");
    const customerCount = await prisma.customer.count();
    const productCount = await prisma.product.count();
    const saleCount = await prisma.sale.count();
    
    console.log(`Customers: ${customerCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Sales: ${saleCount}`);
    
    if (customerCount > 0) {
      const firstCustomer = await prisma.customer.findFirst();
      console.log("First Customer sample:", firstCustomer);
    }
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
