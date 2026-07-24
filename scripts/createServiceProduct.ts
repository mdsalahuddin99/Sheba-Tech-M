import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const serviceProduct = await prisma.product.upsert({
    where: {
      slug: "all-services",
    },
    update: {},
    create: {
      name: "All Services",
      slug: "all-services",
      sku: "SVC-ALL",
      price: 0,
      cost: 0,
      stock: 0,
      unit: "service",
      isService: true,
      trackSerials: false,
      emoji: "🛠️",
      isPublished: true,
      description: "General product for handling all kinds of repair/maintenance services",
      shortDescription: "All Services",
    },
  });

  console.log("Created service product:", serviceProduct);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
