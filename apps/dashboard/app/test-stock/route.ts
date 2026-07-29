import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const p = await prisma.product.findFirst({
    where: { sku: 'SKU-58284' },
    include: { warehouseStocks: true, serialNumbers: { where: { status: 'IN_STOCK' } } }
  });
  return NextResponse.json(p);
}
