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

const SOFT_DELETE_MODELS = ["Product", "Customer", "Supplier", "Category", "Sale"];

prisma.$use(async (params, next) => {
  if (SOFT_DELETE_MODELS.includes(params.model || "")) {
    if (params.action === "findMany" || params.action === "findFirst" || params.action === "count") {
      if (params.args === undefined) params.args = {};
      if (params.args.where === undefined) params.args.where = {};
      
      // If deletedAt is explicitly provided (e.g. for fetching deleted items), don't override
      if (params.args.where.deletedAt === undefined) {
        params.args.where = { ...params.args.where, deletedAt: null };
      }
    }
    
    // Intercept delete
    if (params.action === "delete") {
      params.action = "update";
      params.args["data"] = { deletedAt: new Date() };
    }
    if (params.action === "deleteMany") {
      params.action = "updateMany";
      if (params.args.data !== undefined) {
        params.args.data.deletedAt = new Date();
      } else {
        params.args.data = { deletedAt: new Date() };
      }
    }
  }
  return next(params);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Neon Keep-Alive ──────────────────────────────────────────────────────────
// Neon free-tier suspends after 5 min of inactivity.  This ping keeps the DB
// warm so the first query after a lull doesn't pay a 3-5 s cold-start penalty.
function pingDb() {
  prisma.$queryRaw`SELECT 1`.catch(() => {});
}

let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

export function startKeepAlive() {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(pingDb, 3 * 60 * 1000);
  pingDb();
}

export function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

startKeepAlive();
