import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const productId = "cmrx876y10003jv04fhsavoe3";
  
  // Check if the product exists (including deleted)
  const product = await p.product.findUnique({
    where: { id: productId },
    select: { 
      id: true, name: true, sku: true, stock: true, 
      deletedAt: true, isService: true,
      warehouseStocks: true,
    },
  });
  
  if (product) {
    console.log("✅ Product FOUND:");
    console.log(JSON.stringify(product, null, 2));
  } else {
    console.log("❌ Product NOT FOUND in database with ID:", productId);
    
    // Check if there are similar IDs
    const similar = await p.product.findMany({
      where: { id: { startsWith: "cmrx876" } },
      select: { id: true, name: true, deletedAt: true },
    });
    console.log("\nSimilar IDs:", JSON.stringify(similar, null, 2));
  }

  await p.$disconnect();
}
main().catch((e) => { console.error(e); p.$disconnect(); process.exit(1); });
