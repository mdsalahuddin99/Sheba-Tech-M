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

  async listDeletedPurchases(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.purchase.findMany({
      where: { deletedAt: { not: null } },
      include: { supplier: true },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedExpenses(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.expense.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedQuotations(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.heldSale.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedBrands(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.brand.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedProductTypes(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.productType.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedModels(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.model.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedSeries(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.series.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedWarehouses(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.warehouse.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedStockAdjustments(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.stockAdjustment.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  },

  async listDeletedWarrantyClaims(ctx: Ctx) {
    requireRole(ctx, "ADMIN");
    return prisma.warrantyClaim.findMany({
      where: { deletedAt: { not: null } },
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
      case "purchase":
        return prisma.purchase.update({ where: { id }, data });
      case "expense":
        return prisma.expense.update({ where: { id }, data });
      case "quotation":
        return prisma.heldSale.update({ where: { id }, data });
      case "brand":
        return prisma.brand.update({ where: { id }, data });
      case "productType":
        return prisma.productType.update({ where: { id }, data });
      case "model":
        return prisma.model.update({ where: { id }, data });
      case "series":
        return prisma.series.update({ where: { id }, data });
      case "warehouse":
        return prisma.warehouse.update({ where: { id }, data });
      case "stockAdjustment":
        return prisma.stockAdjustment.update({ where: { id }, data });
      case "warrantyClaim":
        return prisma.warrantyClaim.update({ where: { id }, data });
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
      case "purchase":
        return prisma.$executeRaw`DELETE FROM "Purchase" WHERE id = ${id}`;
      case "expense":
        return prisma.$executeRaw`DELETE FROM "Expense" WHERE id = ${id}`;
      case "quotation":
        return prisma.$executeRaw`DELETE FROM "HeldSale" WHERE id = ${id}`;
      case "brand":
        return prisma.$executeRaw`DELETE FROM "Brand" WHERE id = ${id}`;
      case "productType":
        return prisma.$executeRaw`DELETE FROM "ProductType" WHERE id = ${id}`;
      case "model":
        return prisma.$executeRaw`DELETE FROM "Model" WHERE id = ${id}`;
      case "series":
        return prisma.$executeRaw`DELETE FROM "Series" WHERE id = ${id}`;
      case "warehouse":
        return prisma.$executeRaw`DELETE FROM "Warehouse" WHERE id = ${id}`;
      case "stockAdjustment":
        return prisma.$executeRaw`DELETE FROM "StockAdjustment" WHERE id = ${id}`;
      case "warrantyClaim":
        return prisma.$executeRaw`DELETE FROM "WarrantyClaim" WHERE id = ${id}`;
      default:
        throw new Error(`Unknown type ${type}`);
    }
  },
};
