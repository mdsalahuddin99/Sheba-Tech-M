const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { contains: 'HDD', mode: 'insensitive' } },
    include: {
      warehouseStocks: true,
      serialNumbers: true
    }
  });

  for (const p of products) {
    console.log(`\nProduct: ${p.name} (ID: ${p.id})`);
    console.log(`Global Stock: ${p.stock}`);
    console.log(`Track Serials: ${p.trackSerials}`);
    console.log(`Warehouse Stocks:`, JSON.stringify(p.warehouseStocks));
    
    // Group serials by status and warehouse
    const serialsGrouped = p.serialNumbers.reduce((acc, s) => {
      const key = `${s.status} | Warehouse: ${s.warehouseId || 'null'}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`Serials grouping:`, JSON.stringify(serialsGrouped, null, 2));
    
    const inStock = p.serialNumbers.filter(s => s.status === 'IN_STOCK');
    console.log(`IN_STOCK Serials: ${inStock.map(s => s.serial).join(', ')}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
