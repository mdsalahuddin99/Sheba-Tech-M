import "server-only";
import { prisma } from "@/server/db/client";
import { ServiceError } from "@/server/lib/errors";
import { requireRole } from "@/server/auth/rbac";
import type { Ctx } from "@/server/lib/ctx";
import { auditLogService } from "../auditLogService";
import { cache } from "@/lib/cache";

/** Delete a purchase. Requires ADMIN.
 *  If the purchase has items that have already affected inventory,
 *  this will REVERSE the stock changes (decrement stock, remove IN_STOCK serials)
 *  to keep inventory consistent. */
export async function remove(ctx: Ctx, id: string) {
  requireRole(ctx, "ADMIN");

  // Fetch the purchase with all items and their associated serial numbers
  const purchase = await prisma.purchase.findFirst({
    where: { id },
    include: {
      items: {
        include: {
          serialNumbers: { where: { status: "IN_STOCK" } },
        },
      },
      tenders: true,
    },
  });

  if (!purchase) {
    throw new ServiceError("NOT_FOUND", "Purchase not found", 404);
  }

  const affectedProductIds = [...new Set(purchase.items.map((i) => i.productId))];

  await prisma.$transaction(async (tx) => {
    // ── 1. Reverse stock for each item ──────────────────────────────────────
    await Promise.all(
      purchase.items.map(async (item) => {
        const qty = item.qty;

        // Decrement global product stock (floor at 0)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        if (product) {
          const newStock = Math.max(0, (product.stock ?? 0) - qty);
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          });
        }

        // Decrement warehouse stock if applicable
        if (purchase.warehouseId) {
          const wStock = await tx.warehouseStock.findUnique({
            where: {
              warehouseId_productId: {
                warehouseId: purchase.warehouseId,
                productId: item.productId,
              },
            },
            select: { qty: true },
          });
          if (wStock) {
            await tx.warehouseStock.update({
              where: {
                warehouseId_productId: {
                  warehouseId: purchase.warehouseId!,
                  productId: item.productId,
                },
              },
              data: { qty: { decrement: Math.min(qty, wStock.qty) } },
            });
          }
        }

        // ── 2. Delete IN_STOCK serial numbers that came from this purchase item ──
        if (item.serialNumbers.length > 0) {
          await tx.serialNumber.deleteMany({
            where: {
              purchaseItemId: item.id,
              status: "IN_STOCK",
            },
          });
        }
      })
    );

    // ── 3. Reverse supplier payable and restore funds ───────────────────────────
    if (purchase.supplierId) {
      const due = Number(purchase.due ?? 0);
      if (due > 0) {
        await tx.supplier.update({
          where: { id: purchase.supplierId },
          data: { payable: { decrement: due } },
        });
      }
    }

    const walletTenders = purchase.tenders.filter(t => t.type === "WALLET");
    const accountTenders = purchase.tenders.filter(t => t.type !== "WALLET" && t.accountId && Number(t.amount) > 0);

    if (walletTenders.length > 0 && purchase.supplierId) {
      const walletAmount = walletTenders.reduce((sum, t) => sum + Number(t.amount), 0);
      
      const supp = await tx.supplier.findUnique({
        where: { id: purchase.supplierId },
        select: { advanceBalance: true }
      });
      const currentAdvance = Number(supp?.advanceBalance || 0);
      const newAdvance = currentAdvance + walletAmount;
      
      await tx.supplier.update({
        where: { id: purchase.supplierId },
        data: { advanceBalance: newAdvance }
      });
      
      await tx.supplierTransaction.create({
        data: {
          supplierId: purchase.supplierId,
          type: "WRITE_OFF",
          amount: walletAmount,
          balanceBefore: currentAdvance,
          balanceAfter: newAdvance,
          purchaseId: purchase.id,
          notes: `Advance restored (purchase deleted: ${purchase.invoiceNo || purchase.id.slice(0, 8)})`
        }
      });
    }

    await Promise.all(accountTenders.map((t) =>
      tx.financialAccount.update({
        where: { id: t.accountId! },
        data: { balance: { increment: Number(t.amount) } },
      })
    ));

    // ── 4. Delete the purchase (cascades to items, tenders, supplierTransactions) ──
    await tx.purchase.delete({ where: { id } });
  }, { timeout: 30000 });

  // ── 5. Invalidate caches ─────────────────────────────────────────────────
  await cache.invalidatePurchases();
  if (affectedProductIds.length > 0) {
    await cache.invalidateSpecificProducts(affectedProductIds);
  }

  await auditLogService.log(ctx, {
    entity: "Purchase",
    entityId: id,
    action: "DELETE",
    diff: {
      invoiceNo: purchase.invoiceNo,
      total: Number(purchase.total),
      itemsReversed: purchase.items.length,
      productsAffected: affectedProductIds.length,
    },
  });
}
