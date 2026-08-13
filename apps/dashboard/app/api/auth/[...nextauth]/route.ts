import { NextRequest } from "next/server";
import { handlers } from "@/server/auth/config";

export const runtime = "nodejs";

// Next.js 15+ requires awaiting params in dynamic routes.
// Auth.js beta versions may access them synchronously, causing a 500 HTML error.
export async function GET(req: NextRequest, props: { params: Promise<any> }) {
  const params = await props.params;
  return (handlers.GET as any)(req, { params });
}

export async function POST(req: NextRequest, props: { params: Promise<any> }) {
  const params = await props.params;
  return (handlers.POST as any)(req, { params });
}
