import "server-only";
import { prisma } from "@/server/db/client";
import { requireRole } from "@/server/auth/rbac";
import type { Ctx } from "@/server/lib/ctx";

export const trashService = {
  async listDeletedProducts(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.product.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },
  
  async listDeletedCustomers(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.customer.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },
  
  async listDeletedSuppliers(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.supplier.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },
  
  async listDeletedCategories(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.category.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedSales(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.sale.findMany({
      where: { deletedAt: { not: null } },
      include: { customer: true },
      orderBy: { deletedAt: "desc" },
    });
  },

  async restoreItem(ctx: Ctx, type: string, id: string) {
    requireRole(ctx, "ADMIN");
    const data = { deletedAt: null };
    
    switch (type) {
      case "product":
        return prisma.product.update({ where: { id }, data });
      case "customer":
        return prisma.customer.update({ where: { id }, data });
      case "supplier":
        return prisma.supplier.update({ where: { id }, data });
      case "category":
        return prisma.category.update({ where: { id }, data });
      case "sale":
        return prisma.sale.update({ where: { id }, data });
      default:
        throw new Error(`Unknown type ${type}`);
    }
  },

  async forceDeleteItem(ctx: Ctx, type: string, id: string) {
    requireRole(ctx, "ADMIN");
    // To force delete, we have to bypass the middleware by using raw query or a special flag.
    // Raw query is safest to bypass middleware.
    switch (type) {
      case "product":
        return prisma.$executeRaw`DELETE FROM "Product" WHERE id = ${id}`;
      case "customer":
        return prisma.$executeRaw`DELETE FROM "Customer" WHERE id = ${id}`;
      case "supplier":
        return prisma.$executeRaw`DELETE FROM "Supplier" WHERE id = ${id}`;
      case "category":
        return prisma.$executeRaw`DELETE FROM "Category" WHERE id = ${id}`;
      case "sale":
        return prisma.$executeRaw`DELETE FROM "Sale" WHERE id = ${id}`;
      default:
        throw new Error(`Unknown type ${type}`);
    }
  },
};
