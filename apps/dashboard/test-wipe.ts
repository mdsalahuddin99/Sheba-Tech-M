import { prisma } from "./src/server/db/client";

async function main() {
  try {
    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.stockAdjustment.deleteMany(),
      prisma.transferItem.deleteMany(),
      prisma.transfer.deleteMany(),
      prisma.purchaseTender.deleteMany(),
      prisma.serialNumber.deleteMany(),
      prisma.warrantyClaim.deleteMany(),
      prisma.purchaseItem.deleteMany(),
      prisma.expense.deleteMany(),
      prisma.supplierTransaction.deleteMany(),
      prisma.purchase.deleteMany(),
      prisma.saleTender.deleteMany(),
      prisma.saleItem.deleteMany(),
      prisma.customerTransaction.deleteMany(),
      prisma.sale.deleteMany(),
      prisma.heldSale.deleteMany(),
      prisma.restockItem.deleteMany(),
      prisma.restockOrder.deleteMany(),
      prisma.accountTransfer.deleteMany(),
      prisma.cashShift.deleteMany(),
      prisma.supplierPayment.deleteMany(),
      prisma.productImage.deleteMany(),
      prisma.productVariant.deleteMany(),
      prisma.warehouseStock.deleteMany(),
      prisma.product.deleteMany(),
      prisma.itemList.deleteMany(),
      prisma.seriesModel.deleteMany(),
      prisma.modelProductType.deleteMany(),
      prisma.productTypeBrand.deleteMany(),
      prisma.brandSubcategory.deleteMany(),
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
    console.log("Success");
  } catch (err) {
    console.error("Prisma error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
