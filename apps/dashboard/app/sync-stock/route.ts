import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await prisma.product.findMany({ where: { trackSerials: true }, select: { id: true } });
  
  for (const p of products) {
    const serials = await prisma.serialNumber.groupBy({
      by: ['warehouseId'],
      where: { productId: p.id, status: 'IN_STOCK' },
      _count: { warehouseId: true }
    });
    
    for (const s of serials) {
      if (s.warehouseId) {
        await prisma.warehouseStock.upsert({
          where: { warehouseId_productId: { warehouseId: s.warehouseId, productId: p.id } },
          create: { warehouseId: s.warehouseId, productId: p.id, qty: s._count.warehouseId },
          update: { qty: s._count.warehouseId }
        });
      }
    }
    
    const total = await prisma.serialNumber.count({ where: { productId: p.id, status: 'IN_STOCK' } });
    await prisma.product.update({ where: { id: p.id }, data: { stock: total } });
    
    const allWs = await prisma.warehouseStock.findMany({ where: { productId: p.id } });
    for (const ws of allWs) {
      if (!serials.find(s => s.warehouseId === ws.warehouseId)) {
        await prisma.warehouseStock.update({ where: { id: ws.id }, data: { qty: 0 } });
      }
    }
  }

  return NextResponse.json({ success: true });
}
