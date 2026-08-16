import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const fromDate = new Date('2020-01-01');
  const toDate = new Date('2026-12-31');
  const pmSql = Prisma.empty;
  const res = await prisma.$queryRaw`
        WITH SaleAgg AS (
          SELECT 
            s.id,
            s."customerId",
            s."createdAt",
            s.total,
            s.paid,
            s.due,
            s.discount as sale_discount,
            COALESCE((SELECT SUM(si.qty * COALESCE(si.cost, 0)) FROM "SaleItem" si WHERE si."saleId" = s.id), 0) as cogs,
            COALESCE((SELECT SUM(si.qty * si.price) FROM "SaleItem" si WHERE si."saleId" = s.id), 0) as subtotal,
            COALESCE((SELECT SUM(si.discount) FROM "SaleItem" si WHERE si."saleId" = s.id), 0) as items_discount
          FROM "Sale" s
          WHERE s."createdAt" >= ${fromDate} AND s."createdAt" <= ${toDate}
          AND s.status = 'COMPLETED'
        )
        SELECT 
          COALESCE(c.name, 'Walk-in Customer') as name,
          SUM(sa.cogs) as cost,
          SUM(sa.subtotal) as price,
          SUM(sa.sale_discount + sa.items_discount) as discount,
          SUM(sa.total) as payable,
          SUM(sa.paid) as paid,
          SUM(sa.due) as due,
          MAX(sa."createdAt") as "createdAt"
        FROM SaleAgg sa
        LEFT JOIN "Customer" c ON sa."customerId" = c.id
        GROUP BY c.id, c.name
        ORDER BY MAX(sa."createdAt") DESC
  `;
  console.log(res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
