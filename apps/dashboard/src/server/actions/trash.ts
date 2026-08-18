"use server";
import { auth } from "@/server/auth/config";
import { buildCtx } from "@/server/lib/ctx";
import { trashService } from "@/server/services/trashService";
import { revalidatePath } from "next/cache";

export async function listDeletedItemsAction(type: string) {
  const session = await auth();
  const ctx = buildCtx(session?.user);

  switch (type) {
    case "product":
      return trashService.listDeletedProducts(ctx);
    case "customer":
      return trashService.listDeletedCustomers(ctx);
    case "supplier":
      return trashService.listDeletedSuppliers(ctx);
    case "category":
      return trashService.listDeletedCategories(ctx);
    case "sale":
      return trashService.listDeletedSales(ctx);
    case "purchase":
      return trashService.listDeletedPurchases(ctx);
    case "expense":
      return trashService.listDeletedExpenses(ctx);
    case "quotation":
      return trashService.listDeletedQuotations(ctx);
    case "brand":
      return trashService.listDeletedBrands(ctx);
    case "productType":
      return trashService.listDeletedProductTypes(ctx);
    case "model":
      return trashService.listDeletedModels(ctx);
    case "series":
      return trashService.listDeletedSeries(ctx);
    case "warehouse":
      return trashService.listDeletedWarehouses(ctx);
    case "stockAdjustment":
      return trashService.listDeletedStockAdjustments(ctx);
    case "warrantyClaim":
      return trashService.listDeletedWarrantyClaims(ctx);
    default:
      return [];
  }
}

export async function restoreItemAction(type: string, id: string) {
  const session = await auth();
  const ctx = buildCtx(session?.user);
  
  await trashService.restoreItem(ctx, type, id);
  revalidatePath("/dashboard/trash");
  return { success: true };
}

export async function forceDeleteItemAction(type: string, id: string) {
  const session = await auth();
  const ctx = buildCtx(session?.user);
  
  await trashService.forceDeleteItem(ctx, type, id);
  revalidatePath("/dashboard/trash");
  return { success: true };
}
