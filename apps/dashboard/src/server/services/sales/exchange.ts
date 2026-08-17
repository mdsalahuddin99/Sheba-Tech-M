import "server-only";
import { prisma } from "@/server/db/client";
import { ServiceError } from "@/server/lib/errors";
import type { Ctx } from "@/server/lib/ctx";
import { serializeSale } from "@/server/lib/serialize";
import { auditLogService } from "../auditLogService";
import { cache } from "@/lib/cache";
import { create } from "./create";

type ExchangeReturnItemInput = {
  id: string;
  productId: string;
  qty: number;
  price: number;
};

type SaleExchangeInput = {
  exchangeSaleId: string;
  returnItems: ExchangeReturnItemInput[];
  newItems?: any[];
  reason: string;
  tenders?: any[];
};

export async function exchange(ctx: Ctx, input: SaleExchangeInput) {
  const { exchangeSaleId, returnItems, newItems, reason, tenders } = input;

  // 1. Fetch original sale
  const originalSale = await prisma.sale.findUnique({
    where: { id: exchangeSaleId },
    include: { items: { include: { serialNumbers: true } }, customer: true },
  });

  if (!originalSale) {
    throw new ServiceError("NOT_FOUND", "Original sale not found");
  }

  if (originalSale.status !== "COMPLETED") {
    throw new ServiceError("INVALID_STATE", `Cannot exchange a sale in ${originalSale.status} status`);
  }

  // 2. Wrap everything in a transaction
  const result = await prisma.$transaction(async (tx) => {
    let totalReturnAmount = 0;
    const warehouseId = originalSale.warehouseId;

    // A. Process Return Items
    for (const retItem of returnItems) {
      const origItem = originalSale.items.find((i) => i.id === retItem.id);
      if (!origItem) {
        throw new ServiceError("INVALID_INPUT", `Return item ${retItem.id} not found in original sale`);
      }
      if (retItem.qty > origItem.qty) {
        throw new ServiceError("INVALID_INPUT", `Cannot return more than originally purchased for ${origItem.name}`);
      }

      const returnLineTotal = retItem.qty * Number(retItem.price);
      totalReturnAmount += returnLineTotal;

      // Restore stock
      await tx.product.update({
        where: { id: retItem.productId },
        data: { stock: { increment: retItem.qty } },
      });

      if (warehouseId) {
        const ws = await tx.warehouseStock.findUnique({
          where: { warehouseId_productId: { warehouseId, productId: retItem.productId } },
        });
        if (ws) {
          await tx.warehouseStock.update({
            where: { id: ws.id },
            data: { qty: { increment: retItem.qty } },
          });
        } else {
          await tx.warehouseStock.create({
            data: { warehouseId, productId: retItem.productId, qty: retItem.qty },
          });
        }
      }

      // Restore serials if tracked
      const serialsToRestore = origItem.serialNumbers.slice(0, retItem.qty);
      for (const serial of serialsToRestore) {
        await tx.serialNumber.update({
          where: { id: serial.id },
          data: { status: "IN_STOCK", saleItemId: null },
        });
      }
    }

    // B. Handle Financials for Return
    if (originalSale.customerId && totalReturnAmount > 0) {
      // Create an adjustment transaction to add the returned value back to customer balance
      const customer = await tx.customer.findUnique({ where: { id: originalSale.customerId } });
      if (customer) {
        const currentDue = Number(customer.due);
        const currentBalance = Number(customer.balance);
        
        let dueDecrement = 0;
        let balanceIncrement = 0;
        
        if (currentDue > 0) {
          if (totalReturnAmount <= currentDue) {
            dueDecrement = totalReturnAmount;
          } else {
            dueDecrement = currentDue;
            balanceIncrement = totalReturnAmount - currentDue;
          }
        } else {
          balanceIncrement = totalReturnAmount;
        }
        
        const newDue = currentDue - dueDecrement;
        const newBalance = currentBalance + balanceIncrement;
        
        if (dueDecrement > 0) {
          await tx.customerTransaction.create({
            data: {
              customerId: customer.id,
              type: "ADJUSTMENT",
              amount: dueDecrement,
              balanceBefore: currentBalance,
              balanceAfter: currentBalance,
              saleId: originalSale.id,
              notes: `Exchange Return Offset. Due reduced. Reason: ${reason}`,
              createdById: ctx.userId,
            },
          });
        }
        
        if (balanceIncrement > 0) {
          await tx.customerTransaction.create({
            data: {
              customerId: customer.id,
              type: "ADJUSTMENT",
              amount: balanceIncrement,
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
              saleId: originalSale.id,
              notes: `Exchange Return Adjustment. Wallet credited. Reason: ${reason}`,
              createdById: ctx.userId,
            },
          });
        }

        await tx.customer.update({
          where: { id: customer.id },
          data: { balance: newBalance, due: newDue },
        });
      }
    }

    // Update original sale status
    await tx.sale.update({
      where: { id: originalSale.id },
      data: {
        status: "EXCHANGED",
        notes: originalSale.notes ? `${originalSale.notes}\nExchanged. Reason: ${reason}` : `Exchanged. Reason: ${reason}`,
      },
    });

    return { totalReturnAmount, warehouseId };
  });

  // C. Create New Sale (if there are new items)
  let newSale = null;
  if (newItems && newItems.length > 0) {
    const saleInput = {
      customerId: originalSale.customerId || undefined,
      warehouseId: result.warehouseId || undefined,
      items: newItems,
      tenders: tenders || [],
      notes: `Exchange for Sale ID: ${originalSale.id}. ${reason}`,
      channel: originalSale.channel,
    };
    newSale = await create(ctx, saleInput as any);

    // Link original sale to the newly created sale
    await prisma.sale.update({
      where: { id: originalSale.id },
      data: { exchangeNewSaleId: newSale.id },
    });
  } else if (!newItems || newItems.length === 0) {
    // If it's a pure return with no new items, we can mark it REFUNDED
    await prisma.sale.update({
      where: { id: originalSale.id },
      data: { status: "REFUNDED" },
    });
  }

  // Post-process
  await auditLogService.log(ctx, {
    entity: "Sale",
    entityId: originalSale.id,
    action: "UPDATE",
    diff: { status: newSale ? "EXCHANGED" : "REFUNDED", reason },
  });
  cache.invalidateSales();

  return { originalSaleId: originalSale.id, newSale: newSale ? serializeSale(newSale) : null };
}
