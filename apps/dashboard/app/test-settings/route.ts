import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const shop = await prisma.shop.findFirst({ select: { settings: true } });
  return NextResponse.json(shop?.settings || {});
}
