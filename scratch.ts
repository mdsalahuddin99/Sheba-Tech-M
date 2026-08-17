import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { contains: 'HDD', mode: 'insensitive' } },
    include: {
      warehouseStocks: true,
      serialNumbers: {
        where: { status: 'IN_STOCK' }
      }
    }
  })

  for (const p of products) {
    console.log(`\nProduct: ${p.name} (ID: ${p.id})`)
    console.log(`Global Stock: ${p.stock}`)
    console.log(`Track Serials: ${p.trackSerials}`)
    console.log(`Warehouse Stocks:`, p.warehouseStocks)
    
    // Group serials by warehouseId
    const serialsByWarehouse = p.serialNumbers.reduce((acc, s) => {
      const wid = s.warehouseId || 'null'
      acc[wid] = (acc[wid] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log(`IN_STOCK Serials by Warehouse:`, serialsByWarehouse)
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
