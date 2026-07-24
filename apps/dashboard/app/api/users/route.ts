export const runtime = "nodejs";

import { z } from "zod";
import { prisma } from "@/server/db/client";
import { hashPassword } from "@/server/lib/password";
import { apiHandler } from "@/server/lib/apiHandler";
import type { Ctx } from "@/server/lib/ctx";

// ─── Schema ─────────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["CASHIER", "ADMIN"]),
});

const updateUserSchema = z.object({
  role: z.enum(["CASHIER", "ADMIN", "USER"]).optional(),
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(255).optional(),
  password: z.string().min(8).max(128).optional(),
  permissions: z.array(z.string()).optional(),
});

// ─── GET: List users in the shop ────────────────────────────────────────────

export const GET = apiHandler(async (ctx: Ctx) => {
  const users = await prisma.user.findMany({
    where: { role: { not: "USER" } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { items: users };
}, "users:list", ["ADMIN"]);

// ─── POST: Create a new user (staff) ───────────────────────────────────────

export const POST = apiHandler(async (ctx: Ctx, req: Request) => {
  const body = await req.json();
  const parsed = createUserSchema.parse(body);

  // Check existing email
  const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existing) {
    throw new (await import("@/server/lib/errors")).ServiceError(
      "CONFLICT",
      "A user with this email already exists",
      409,
    );
  }

  const passwordHash = hashPassword(parsed.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      role: parsed.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
    },
  });

  return { success: true, user };
}, "users:create", ["ADMIN"]);

// ─── PATCH: Update user role, profile or password ───────────────────────────

export const PATCH = apiHandler(async (ctx: Ctx, req: Request) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get("id");
  if (!userId) throw new (await import("@/server/lib/errors")).ServiceError("BAD_REQUEST", "User ID is required", 400);

  const body = await req.json();
  const parsed = updateUserSchema.parse(body);
  const updateData: any = { ...parsed };

  if (parsed.email) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing && existing.id !== userId) {
      throw new (await import("@/server/lib/errors")).ServiceError("CONFLICT", "Email already in use", 409);
    }
  }

  if (parsed.password) {
    updateData.passwordHash = hashPassword(parsed.password);
    delete updateData.password;
  }

  const result = await prisma.user.updateMany({
    where: { id: userId },
    data: updateData,
  });

  if (result.count === 0) {
    throw new (await import("@/server/lib/errors")).ServiceError("NOT_FOUND", "User not found", 404);
  }

  return { success: true };
}, "users:update", ["ADMIN"]);

// ─── DELETE: Deactivate a user ─────────────────────────────────────────────

export const DELETE = apiHandler(async (ctx: Ctx, req: Request) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get("id");
  if (!userId) throw new (await import("@/server/lib/errors")).ServiceError("BAD_REQUEST", "User ID is required", 400);

  const result = await prisma.user.updateMany({
    where: { id: userId },
    data: { active: false },
  });

  if (result.count === 0) {
    throw new (await import("@/server/lib/errors")).ServiceError("NOT_FOUND", "User not found", 404);
  }

  return { success: true };
}, "users:delete", ["ADMIN"]);
