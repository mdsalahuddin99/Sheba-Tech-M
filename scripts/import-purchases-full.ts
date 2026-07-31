import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const backupPath = "c:\\Users\\user\\Downloads\\shebatech-backup-2026-07-30.json";
  
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found at ${backupPath}`);
    return;
  }

  const rawData = fs.readFileSync(backupPath, "utf-8");
  const backupJson = JSON.parse(rawData);

  const rawPurchases = backupJson.data?.purchases || [];
  if (rawPurchases.length === 0) {
    console.log("No Purchases found in backup.");
  } else {
    console.log(`Found ${rawPurchases.length} Purchases. Preparing for import...`);

    const validSuppliers = new Set((await prisma.supplier.findMany({ select: { id: true } })).map(x => x.id));
    const validProducts = new Set((await prisma.product.findMany({ select: { id: true } })).map(x => x.id));

    const purchasesToInsert = [];
    const purchaseItemsToInsert = [];
    const purchaseTendersToInsert = [];
    let skippedPurchases = 0;

    for (const p of rawPurchases) {
      if (p.supplierId && !validSuppliers.has(p.supplierId)) {
        skippedPurchases++;
        continue;
      }

      const { items, tenders, ...purchaseData } = p;

      // Parse Dates
      if (purchaseData.createdAt) purchaseData.createdAt = new Date(purchaseData.createdAt);
      if (purchaseData.editedAt) purchaseData.editedAt = new Date(purchaseData.editedAt);

      purchasesToInsert.push(purchaseData);

      // Prepare items
      if (Array.isArray(items)) {
        for (const item of items) {
          if (!validProducts.has(item.productId)) continue;
          
          const newItem = {
            id: item.id,
            purchaseId: purchaseData.id,
            productId: item.productId,
            qty: item.qty,
            cost: item.cost,
            name: item.name,
            salePrice: item.salePrice,
            serials: item.serials || [],
            warrantyStartDate: item.warrantyStartDate ? new Date(item.warrantyStartDate) : null,
            warrantyMonths: item.warrantyMonths
          };
          
          purchaseItemsToInsert.push(newItem);
        }
      }

      // Prepare tenders
      if (Array.isArray(tenders)) {
        for (const tender of tenders) {
          purchaseTendersToInsert.push({ ...tender, purchaseId: purchaseData.id });
        }
      }
    }

    console.log(`Skipped ${skippedPurchases} Purchases due to missing suppliers.`);
    
    // 1. Insert Purchases
    if (purchasesToInsert.length > 0) {
      console.log(`Inserting ${purchasesToInsert.length} Purchases...`);
      await prisma.purchase.createMany({ data: purchasesToInsert, skipDuplicates: true });
    }

    // 2. Insert Purchase Items
    if (purchaseItemsToInsert.length > 0) {
      console.log(`Inserting ${purchaseItemsToInsert.length} Purchase Items...`);
      await prisma.purchaseItem.createMany({ data: purchaseItemsToInsert, skipDuplicates: true });
    }

    // 3. Insert Purchase Tenders
    if (purchaseTendersToInsert.length > 0) {
      console.log(`Inserting ${purchaseTendersToInsert.length} Purchase Tenders...`);
      await prisma.purchaseTender.createMany({ data: purchaseTendersToInsert, skipDuplicates: true });
    }

    console.log("✅ Purchases imported successfully!");
  }

  // Restore SerialNumber purchase relations
  const snPath = "c:\\Users\\user\\Downloads\\SerialNumber.json";
  if (fs.existsSync(snPath)) {
    console.log("Found SerialNumber.json, restoring links to purchases...");
    const snRaw = fs.readFileSync(snPath, "utf-8");
    const serialNumbers = JSON.parse(snRaw);
    let linked = 0;

    for (const sn of serialNumbers) {
      if (sn.purchaseItemId) {
        try {
          await prisma.serialNumber.update({
            where: { serial: sn.serial },
            data: { purchaseItemId: sn.purchaseItemId }
          });
          linked++;
        } catch (err) { }
      }
    }
    console.log(`✅ Restored ${linked} Serial Number to Purchase links!`);
  }

  // Import Supplier Transactions
  const stPath = "c:\\Users\\user\\Downloads\\SupplierTransaction.json";
  if (fs.existsSync(stPath)) {
    console.log("Found SupplierTransaction.json, importing...");
    const stRaw = fs.readFileSync(stPath, "utf-8");
    let supplierTransactions = [];
    try {
      supplierTransactions = JSON.parse(stRaw);
    } catch (e) {
      console.error("Error parsing SupplierTransaction.json", e);
    }

    if (supplierTransactions.length > 0) {
      const validSuppliers = new Set((await prisma.supplier.findMany({ select: { id: true } })).map(x => x.id));
      const validPurchases = new Set((await prisma.purchase.findMany({ select: { id: true } })).map(x => x.id));

      const stToInsert = [];
      for (const st of supplierTransactions) {
        if (!validSuppliers.has(st.supplierId)) continue;
        
        const newSt = {
          id: st.id,
          supplierId: st.supplierId,
          type: st.type,
          amount: st.amount,
          balanceBefore: st.balanceBefore,
          balanceAfter: st.balanceAfter,
          purchaseId: (st.purchaseId && validPurchases.has(st.purchaseId)) ? st.purchaseId : null,
          accountId: st.accountId || null,
          reference: st.reference || null,
          notes: st.notes || null,
          createdById: st.createdById || null,
          createdAt: st.createdAt ? new Date(st.createdAt) : undefined
        };
        
        stToInsert.push(newSt);
      }

      if (stToInsert.length > 0) {
        try {
          await prisma.supplierTransaction.createMany({
            data: stToInsert,
            skipDuplicates: true
          });
          console.log(`✅ Imported ${stToInsert.length} Supplier Transactions!`);
        } catch (e) {
          console.error("❌ Error importing Supplier Transactions:", e);
        }
      }
    }
  }

}

main().catch(console.error).finally(() => prisma.$disconnect());
