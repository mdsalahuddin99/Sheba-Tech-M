import { prisma } from "./apps/dashboard/src/server/db/client";

async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: "Nts Hdmi 1.5meter cable",
        mode: "insensitive"
      }
    }
  });
  console.log("PRODUCTS FOUND:", JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
