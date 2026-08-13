export const runtime = "nodejs";

import { apiHandler } from "@/server/lib/apiHandler";
import type { Ctx } from "@/server/lib/ctx";
import { prisma } from "@/server/db/client";
import { cache } from "@/lib/cache";

const respond = apiHandler(async (ctx: Ctx) => {
  // Delete all data for the current shop (delete children first to avoid foreign key errors)
  await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: {} }),
    prisma.notification.deleteMany({ where: {} }),
    prisma.stockAdjustment.deleteMany({ where: {} }),
    prisma.transferItem.deleteMany({ where: {} }),
    prisma.transfer.deleteMany({ where: {} }),
    prisma.purchaseTender.deleteMany({ where: {} }),
    prisma.serialNumber.deleteMany({ where: {} }),
    prisma.warrantyClaim.deleteMany({ where: {} }), // ADDED
    prisma.purchaseItem.deleteMany({ where: {} }),
    prisma.expense.deleteMany({ where: {} }),
    prisma.supplierTransaction.deleteMany({ where: {} }), // ADDED
    prisma.purchase.deleteMany({ where: {} }),
    prisma.saleTender.deleteMany({ where: {} }),
    prisma.saleItem.deleteMany({ where: {} }),
    prisma.customerTransaction.deleteMany({ where: {} }), // ADDED
    prisma.$executeRawUnsafe('DELETE FROM "Sale"'),
    prisma.heldSale.deleteMany({ where: {} }), // ADDED
    prisma.restockItem.deleteMany({ where: {} }), // ADDED
    prisma.restockOrder.deleteMany({ where: {} }), // ADDED
    prisma.accountTransfer.deleteMany({ where: {} }),
    prisma.cashShift.deleteMany({ where: {} }),
    prisma.supplierPayment.deleteMany({ where: {} }),
    prisma.productImage.deleteMany({ where: {} }),
    prisma.productVariant.deleteMany({ where: {} }),
    prisma.warehouseStock.deleteMany({ where: {} }),
    prisma.productReview.deleteMany({ where: {} }), // ADDED
    prisma.$executeRawUnsafe('DELETE FROM "Product"'),
    prisma.itemList.deleteMany({ where: {} }),
    prisma.seriesModel.deleteMany({ where: {} }), // ADDED (Cascade should handle, but to be safe)
    prisma.modelProductType.deleteMany({ where: {} }), // ADDED
    prisma.productTypeBrand.deleteMany({ where: {} }), // ADDED
    prisma.brandSubcategory.deleteMany({ where: {} }), // ADDED
    prisma.series.deleteMany({ where: {} }),
    prisma.model.deleteMany({ where: {} }),
    prisma.productType.deleteMany({ where: {} }),
    prisma.brand.deleteMany({ where: {} }),
    prisma.$executeRawUnsafe('DELETE FROM "Category"'),
    prisma.color.deleteMany({ where: {} }),
    prisma.storage.deleteMany({ where: {} }),
    prisma.ram.deleteMany({ where: {} }),
    prisma.$executeRawUnsafe('DELETE FROM "Customer"'),
    prisma.$executeRawUnsafe('DELETE FROM "Supplier"'),
    prisma.financialAccount.deleteMany({ where: {} }),
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
