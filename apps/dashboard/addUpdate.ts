import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.systemUpdate.create({
    data: {
      version: 'v1.1.0', 
      date: new Date(),
      features: [
        'Fixed an issue in the Purchases module related to the delete function',
        'Added an interactive Eye icon with Popover for neatly viewing long customer addresses',
        'Fixed UI wrapping issues ensuring table columns and action buttons stay on a single line',
        'Optimized table space by compacting Contact and Address columns',
        'Added "Show entries" pagination control to Sales and Expenses pages'
      ]
    }
  })
  console.log("Update added successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
