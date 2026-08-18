import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkDuplicates() {
  const products = await prisma.product.findMany({
    select: { name: true, stock: true, sku: true, barcode: true, id: true },
    where: { deletedAt: null }
  });

  const nameMap = new Map();
  for (const p of products) {
    const name = p.name.trim().toLowerCase();
    if (!nameMap.has(name)) nameMap.set(name, []);
    nameMap.get(name).push(p);
  }

  const issues = [];
  for (const [name, list] of nameMap.entries()) {
    if (list.length > 1) {
      const hasStock = list.some(p => p.stock > 0);
      const hasZeroStock = list.some(p => p.stock === 0);
      if (hasStock && hasZeroStock) {
        issues.push({ name, list });
      }
    }
  }

  console.log(JSON.stringify(issues, null, 2));
  await prisma.$disconnect();
}

checkDuplicates().catch(e => { console.error(e); process.exit(1); });
