export const runtime = "nodejs";

import { apiHandler } from "@/server/lib/apiHandler";
import type { Ctx } from "@/server/lib/ctx";
import { prisma } from "@/server/db/client";
import { cache } from "@/lib/cache";

const respond = apiHandler(async (ctx: Ctx) => {
  // Delete all data for the current shop (delete children first to avoid foreign key errors)
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.stockAdjustment.deleteMany(),
    prisma.transferItem.deleteMany(),
    prisma.transfer.deleteMany(),
    prisma.purchaseTender.deleteMany(),
    prisma.serialNumber.deleteMany(),
    prisma.warrantyClaim.deleteMany(), // ADDED
    prisma.purchaseItem.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.supplierTransaction.deleteMany(), // ADDED
    prisma.purchase.deleteMany(),
    prisma.saleTender.deleteMany(),
    prisma.saleItem.deleteMany(),
    prisma.customerTransaction.deleteMany(), // ADDED
    prisma.sale.deleteMany(),
    prisma.heldSale.deleteMany(), // ADDED
    prisma.restockItem.deleteMany(), // ADDED
    prisma.restockOrder.deleteMany(), // ADDED
    prisma.accountTransfer.deleteMany(),
    prisma.cashShift.deleteMany(),
    prisma.supplierPayment.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.warehouseStock.deleteMany(),
    prisma.product.deleteMany(),
    prisma.itemList.deleteMany(),
    prisma.seriesModel.deleteMany(), // ADDED (Cascade should handle, but to be safe)
    prisma.modelProductType.deleteMany(), // ADDED
    prisma.productTypeBrand.deleteMany(), // ADDED
    prisma.brandSubcategory.deleteMany(), // ADDED
    prisma.series.deleteMany(),
    prisma.model.deleteMany(),
    prisma.productType.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.category.deleteMany(),
    prisma.color.deleteMany(),
    prisma.storage.deleteMany(),
    prisma.ram.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.financialAccount.deleteMany(),
  ]);

  await cache.invalidate("app:*");
  await cache.invalidate("products:storefront:*");

  return { ok: true, message: "All shop data cleared" };
}, "backup:wipe", ["ADMIN"]);

export const DELETE = respond;
export const GET = respond;
export const POST = respond;
export const PUT = respond;
export const PATCH = respond;
