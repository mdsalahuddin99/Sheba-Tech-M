import { NextResponse } from "next/server";
import { verifyPassword } from "@/server/lib/password";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const password = url.searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "User not found or no password" });
  }

  const { hashPassword, verifyPassword } = await import("@/server/lib/password");
  
  const generatedInternalHash = hashPassword(password);

  await prisma.user.update({
    where: { email },
    data: { 
      passwordHash: generatedInternalHash,
      role: 'ADMIN'
    }
  });

  return NextResponse.json({
    success: true,
    message: "Admin password forcefully updated using Next.js runtime hash!",
    email,
    role: user.role,
    passwordLength: password.length,
    dbHashLength: generatedInternalHash.length
  });
}
