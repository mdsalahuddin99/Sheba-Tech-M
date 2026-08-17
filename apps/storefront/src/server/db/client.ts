/**
 * Prisma client singleton (HMR-safe).
 *
 * Uses Neon direct connection (no Prisma Accelerate — the Accelerate pooled URL
 * pointed to a different database that had no tables, causing all queries to
 * return "table does not exist" errors).
 *
 * In development Next.js hot-reloads modules, which would create a new
 * PrismaClient on every reload. We cache the instance on `globalThis`
 * to avoid exhausting database connections.
 */
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Removed Keep-Alive ───────────────────────────────────────────────────────
// (setInterval does not work as intended in Vercel serverless functions and causes build timeouts)
