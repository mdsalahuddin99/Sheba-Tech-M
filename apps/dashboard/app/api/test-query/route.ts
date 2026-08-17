import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        price: true
      },
      take: 10
    });
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
