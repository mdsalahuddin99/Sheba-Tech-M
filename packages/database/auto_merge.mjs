import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function autoMergeZeroStockDuplicates() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null }
  });

  const nameMap = new Map();
  for (const p of products) {
    const name = p.name.trim().toLowerCase();
    if (!nameMap.has(name)) nameMap.set(name, []);
    nameMap.get(name).push(p);
  }

  let mergedCount = 0;
  let deletedCount = 0;

  for (const [name, list] of nameMap.entries()) {
    if (list.length > 1) {
      const hasStock = list.some(p => p.stock > 0);
      const hasZeroStock = list.some(p => p.stock === 0);
      
      if (hasStock && hasZeroStock) {
        // Find the product with the highest stock to act as the primary
        const primary = list.reduce((prev, current) => (prev.stock > current.stock) ? prev : current);
        
        // Find all 0-stock duplicates
        const zeroStockDuplicates = list.filter(p => p.stock === 0 && p.id !== primary.id);
        
        if (zeroStockDuplicates.length > 0) {
          const newTags = new Set(primary.searchTags || []);
          
          for (const dup of zeroStockDuplicates) {
            if (dup.barcode) newTags.add(dup.barcode);
            if (dup.sku) newTags.add(dup.sku);
            
            // Soft delete the duplicate
            await prisma.product.update({
              where: { id: dup.id },
              data: { deletedAt: new Date() }
            });
            deletedCount++;
          }
          
          // Update primary product with new search tags
          await prisma.product.update({
            where: { id: primary.id },
            data: { searchTags: Array.from(newTags) }
          });
          mergedCount++;
          console.log(`Merged ${zeroStockDuplicates.length} duplicates into '${primary.name}' (SKU: ${primary.sku})`);
        }
      }
    }
  }

  console.log(`\nOperation complete! Updated ${mergedCount} primary products and soft-deleted ${deletedCount} zero-stock duplicates.`);
  await prisma.$disconnect();
}

autoMergeZeroStockDuplicates().catch(e => { console.error(e); process.exit(1); });
