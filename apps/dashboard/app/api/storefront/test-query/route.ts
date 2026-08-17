import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET(req: Request) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      }
    });
    return NextResponse.json({ warehouses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
