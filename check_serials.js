const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      trackSerials: true,
      deletedAt: null,
      stock: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      stock: true,
      trackSerials: true,
      _count: {
        select: {
          serialNumbers: {
            where: { status: "IN_STOCK" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log("\n=== Products with Serial Tracking ON & Stock > 0 ===\n");
  console.log("%-40s | %-6s | %-8s | %-10s", "Product Name", "Stock", "Serials", "Status");
  console.log("-".repeat(75));

  let problemCount = 0;
  for (const p of products) {
    const serialCount = p._count.serialNumbers;
    const status = serialCount >= p.stock ? "OK" : "MISSING SERIALS";
    if (status !== "OK") problemCount++;
    console.log(
      "%-40s | %-6d | %-8d | %-10s",
      p.name.substring(0, 40),
      p.stock,
      serialCount,
      status
    );
  }

  console.log("-".repeat(75));
  console.log(`\nTotal: ${products.length} products, ${problemCount} with missing serials\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
