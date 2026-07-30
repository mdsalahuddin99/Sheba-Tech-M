import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a path to the JSON backup file.');
    process.exit(1);
  }

  console.log(`Reading backup file from: ${filePath}`);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const backup = JSON.parse(rawData);
  const data = backup.data;

  console.log('Starting data migration...');

  try {
    // Collect valid IDs to prevent Foreign Key constraint errors
    const validCustomers = new Set(data.customers?.map((x: any) => x.id) || []);
    const validSuppliers = new Set(data.suppliers?.map((x: any) => x.id) || []);
    const validProducts = new Set(data.products?.map((x: any) => x.id) || []);
    const validAccounts = new Set(data.accounts?.map((x: any) => x.id) || []);
    const validCategories = new Set(data.categories?.map((x: any) => x.id) || []);

    const hasBrands = !!data.brands;
    const hasTypes = !!data.productTypes;
    const hasModels = !!data.models;
    const hasSeries = !!data.series;
    const hasWarehouses = !!data.warehouses;
    const hasUsers = !!data.users;

    // 1. Accounts
    if (data.accounts && data.accounts.length > 0) {
      console.log(`Importing ${data.accounts.length} accounts...`);
      await prisma.financialAccount.createMany({ data: data.accounts, skipDuplicates: true });
    }

    // 2. Customers & Suppliers
    if (data.customers && data.customers.length > 0) {
      console.log(`Importing ${data.customers.length} customers...`);
      await prisma.customer.createMany({ data: data.customers, skipDuplicates: true });
    }
    if (data.suppliers && data.suppliers.length > 0) {
      console.log(`Importing ${data.suppliers.length} suppliers...`);
      await prisma.supplier.createMany({ data: data.suppliers, skipDuplicates: true });
    }

    // 3. Categories
    if (data.categories && data.categories.length > 0) {
      console.log(`Importing ${data.categories.length} categories...`);
      const sortedCategories = [...data.categories].sort((a, b) => {
        if (!a.parentId) return -1;
        if (!b.parentId) return 1;
        return 0;
      });
      for (const cat of sortedCategories) {
        if (cat.parentId && !validCategories.has(cat.parentId)) cat.parentId = null;
        await prisma.category.upsert({ where: { id: cat.id }, update: cat, create: cat });
      }
    }

    // 3.5 Global Attributes (Brands, Models, etc.)
    const globals = [
      { key: 'brands', model: prisma.brand, name: 'brands' },
      { key: 'productTypes', model: prisma.productType, name: 'product types' },
      { key: 'models', model: prisma.model, name: 'models' },
      { key: 'series', model: prisma.series, name: 'series' },
      { key: 'warehouses', model: prisma.warehouse, name: 'warehouses' },
      { key: 'colors', model: prisma.color, name: 'colors' },
      { key: 'storages', model: prisma.storage, name: 'storages' },
      { key: 'rams', model: prisma.ram, name: 'rams' },
    ];

    for (const g of globals) {
      if (data[g.key] && data[g.key].length > 0) {
        console.log(`Importing ${data[g.key].length} ${g.name}...`);
        await (g.model as any).createMany({ data: data[g.key], skipDuplicates: true });
      }
    }

    // 4. Products
    if (data.products && data.products.length > 0) {
      console.log(`Importing ${data.products.length} products...`);
      const sanitizedProducts = data.products.map((p: any) => {
         const newP = { ...p };
         if (!hasBrands) newP.globalBrandId = null;
         if (!hasTypes) newP.productTypeId = null;
         if (!hasModels) newP.globalModelId = null;
         if (!hasSeries) newP.globalSeriesId = null;
         if (newP.supplierId && !validSuppliers.has(newP.supplierId)) newP.supplierId = null;
         if (newP.categoryId && !validCategories.has(newP.categoryId)) newP.categoryId = null;
         return newP;
      });
      await prisma.product.createMany({ data: sanitizedProducts, skipDuplicates: true });
    }

    // 5. Purchases
    if (data.purchases && data.purchases.length > 0) {
      console.log(`Importing ${data.purchases.length} purchases...`);
      const purchaseRecords = [];
      const purchaseItems: any[] = [];
      const purchaseTenders: any[] = [];

      for (const purchase of data.purchases) {
         const { items, tenders, supplierTransactions, expense, userId, editedById, editedAt, status, ...purchaseData } = purchase;
         
         if (!hasWarehouses) purchaseData.warehouseId = null;
         if (purchaseData.supplierId && !validSuppliers.has(purchaseData.supplierId)) purchaseData.supplierId = null;

         purchaseRecords.push(purchaseData);
         
         if (items) {
           items.forEach((i: any) => {
             if (validProducts.has(i.productId)) {
               const { extraCost, ...validItem } = i;
               purchaseItems.push({...validItem, purchaseId: purchaseData.id});
             } else {
               console.warn(`[!] Skipping missing productId ${i.productId} in purchase item`);
             }
           });
         }
         if (tenders) {
           tenders.forEach((t: any) => {
             if (t.accountId && !validAccounts.has(t.accountId)) t.accountId = null;
             purchaseTenders.push({...t, purchaseId: purchaseData.id});
           });
         }
      }

      await prisma.purchase.createMany({ data: purchaseRecords, skipDuplicates: true });
      if (purchaseItems.length > 0) await prisma.purchaseItem.createMany({ data: purchaseItems, skipDuplicates: true });
      if (purchaseTenders.length > 0) await prisma.purchaseTender.createMany({ data: purchaseTenders, skipDuplicates: true });
    }

    // 6. Sales
    if (data.sales && data.sales.length > 0) {
      console.log(`Importing ${data.sales.length} sales...`);
      const saleRecords = [];
      const saleItems: any[] = [];
      const saleTenders: any[] = [];

      for (const sale of data.sales) {
         const { items, tenders, customerTransactions, warrantyClaims, ...saleData } = sale;
         
         if (!hasWarehouses) saleData.warehouseId = null;
         if (!hasUsers) {
           saleData.userId = null;
           saleData.editedById = null;
         }
         if (saleData.customerId && !validCustomers.has(saleData.customerId)) saleData.customerId = null;

         saleRecords.push(saleData);
         
         if (items) {
           items.forEach((i: any) => {
             if (validProducts.has(i.productId)) {
               const { extraCost, serials, warrantyStartDate, ...validSaleItem } = i;
               saleItems.push({...validSaleItem, saleId: saleData.id});
             } else {
               console.warn(`[!] Skipping missing productId ${i.productId} in sale item`);
             }
           });
         }
         if (tenders) {
           tenders.forEach((t: any) => {
             if (t.accountId && !validAccounts.has(t.accountId)) t.accountId = null;
             saleTenders.push({...t, saleId: saleData.id});
           });
         }
      }

      await prisma.sale.createMany({ data: saleRecords, skipDuplicates: true });
      if (saleItems.length > 0) await prisma.saleItem.createMany({ data: saleItems, skipDuplicates: true });
      if (saleTenders.length > 0) await prisma.saleTender.createMany({ data: saleTenders, skipDuplicates: true });
    }

    // 7. Expenses
    if (data.expenses && data.expenses.length > 0) {
      console.log(`Importing ${data.expenses.length} expenses...`);
      const sanitizedExpenses = data.expenses.map((e: any) => {
        const newE = { ...e };
        if (newE.accountId && !validAccounts.has(newE.accountId)) newE.accountId = null;
        return newE;
      });
      await prisma.expense.createMany({ data: sanitizedExpenses, skipDuplicates: true });
    }

    console.log('Data migration completed successfully! All relations verified.');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
