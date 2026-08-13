import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const backupPath = path.join(process.cwd(), 'backup.txt');
  if (!fs.existsSync(backupPath)) {
    console.error('Error: backup.txt not found in the root directory.');
    process.exit(1);
  }

  console.log('Reading backup.txt...');
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  console.log('Starting data migration...');

  try {
    // 1. Users
    if (data.User?.length > 0) {
      console.log(`Importing ${data.User.length} Users...`);
      const users = data.User.map((u: any) => ({
        ...u,
        role: u.role === 'VIEWER' ? 'USER' : u.role,
      }));
      await prisma.user.createMany({ data: users, skipDuplicates: true });
    }

    // 2. Shops & Warehouses
    if (data.Shop?.length > 0) {
      console.log(`Importing ${data.Shop.length} Shops...`);
      await prisma.shop.createMany({ data: data.Shop, skipDuplicates: true });
    }
    if (data.Warehouse?.length > 0) {
      console.log(`Importing ${data.Warehouse.length} Warehouses...`);
      await prisma.warehouse.createMany({ data: data.Warehouse, skipDuplicates: true });
    }

    // 3. Financial Accounts
    if (data.FinancialAccount?.length > 0) {
      console.log(`Importing ${data.FinancialAccount.length} Accounts...`);
      await prisma.financialAccount.createMany({ data: data.FinancialAccount, skipDuplicates: true });
    }

    // 4. Customers & Suppliers
    if (data.Customer?.length > 0) {
      console.log(`Importing ${data.Customer.length} Customers...`);
      await prisma.customer.createMany({ data: data.Customer, skipDuplicates: true });
    }
    if (data.Supplier?.length > 0) {
      console.log(`Importing ${data.Supplier.length} Suppliers...`);
      await prisma.supplier.createMany({ data: data.Supplier, skipDuplicates: true });
    }

    // 5. Catalog Attributes
    const catalogs = [
      { key: 'Category', model: prisma.category },
      { key: 'Brand', model: prisma.brand },
      { key: 'ProductType', model: prisma.productType },
      { key: 'Model', model: prisma.model },
      { key: 'Series', model: prisma.series },
      { key: 'Color', model: prisma.color },
      { key: 'Storage', model: prisma.storage },
      { key: 'Ram', model: prisma.ram },
    ];

    for (const cat of catalogs) {
      if (data[cat.key]?.length > 0) {
        console.log(`Importing ${data[cat.key].length} ${cat.key} records...`);
        // For categories, sort so parents are inserted first
        let records = data[cat.key];
        if (cat.key === 'Category') {
          records = [...records].sort((a, b) => {
            if (!a.parentId) return -1;
            if (!b.parentId) return 1;
            return 0;
          });
          for (const record of records) {
            await (cat.model as any).upsert({ where: { id: record.id }, update: record, create: record });
          }
        } else {
          await (cat.model as any).createMany({ data: records, skipDuplicates: true });
        }
      }
    }

    // 6. Generate Cascading Relations from Products
    if (data.Product?.length > 0) {
      console.log('Generating cascading relations from Products...');
      const brandSubSet = new Set<string>();
      const typeBrandSet = new Set<string>();
      const modelTypeSet = new Set<string>();
      const seriesModelSet = new Set<string>();

      const brandSubArr: any[] = [];
      const typeBrandArr: any[] = [];
      const modelTypeArr: any[] = [];
      const seriesModelArr: any[] = [];

      for (const p of data.Product) {
        if (p.globalBrandId && p.subcategory) {
          const k = `${p.globalBrandId}-${p.subcategory}`;
          if (!brandSubSet.has(k)) {
            brandSubSet.add(k);
            brandSubArr.push({ brandId: p.globalBrandId, subcategory: p.subcategory });
          }
        }
        if (p.productTypeId && p.globalBrandId) {
          const k = `${p.productTypeId}-${p.globalBrandId}`;
          if (!typeBrandSet.has(k)) {
            typeBrandSet.add(k);
            typeBrandArr.push({ productTypeId: p.productTypeId, brandId: p.globalBrandId });
          }
        }
        if (p.globalModelId && p.productTypeId) {
          const k = `${p.globalModelId}-${p.productTypeId}`;
          if (!modelTypeSet.has(k)) {
            modelTypeSet.add(k);
            modelTypeArr.push({ modelId: p.globalModelId, productTypeId: p.productTypeId });
          }
        }
        if (p.globalSeriesId && p.globalModelId) {
          const k = `${p.globalSeriesId}-${p.globalModelId}`;
          if (!seriesModelSet.has(k)) {
            seriesModelSet.add(k);
            seriesModelArr.push({ seriesId: p.globalSeriesId, modelId: p.globalModelId });
          }
        }
      }

      if (brandSubArr.length) {
        console.log(`Inserting ${brandSubArr.length} BrandSubcategory...`);
        await prisma.brandSubcategory.createMany({ data: brandSubArr, skipDuplicates: true });
      }
      if (typeBrandArr.length) {
        console.log(`Inserting ${typeBrandArr.length} ProductTypeBrand...`);
        await prisma.productTypeBrand.createMany({ data: typeBrandArr, skipDuplicates: true });
      }
      if (modelTypeArr.length) {
        console.log(`Inserting ${modelTypeArr.length} ModelProductType...`);
        await prisma.modelProductType.createMany({ data: modelTypeArr, skipDuplicates: true });
      }
      if (seriesModelArr.length) {
        console.log(`Inserting ${seriesModelArr.length} SeriesModel...`);
        await prisma.seriesModel.createMany({ data: seriesModelArr, skipDuplicates: true });
      }
      
      // 7. Products
      console.log(`Importing ${data.Product.length} Products...`);
      const sanitizedProducts = data.Product.map((p: any) => {
        // Ensure price & cost are handled as strings (Decimal accepts strings)
        return p;
      });
      await prisma.product.createMany({ data: sanitizedProducts, skipDuplicates: true });
    }

    // 8. Other Models
    const relatedModels = [
      { key: 'ProductImage', model: prisma.productImage },
      { key: 'WarehouseStock', model: prisma.warehouseStock },
      { key: 'Purchase', model: prisma.purchase },
      { key: 'PurchaseItem', model: prisma.purchaseItem },
      { key: 'PurchaseTender', model: prisma.purchaseTender },
      { key: 'Sale', model: prisma.sale },
      { key: 'SaleItem', model: prisma.saleItem },
      { key: 'SaleTender', model: prisma.saleTender },
      { key: 'SerialNumber', model: prisma.serialNumber },
      { key: 'CustomerTransaction', model: prisma.customerTransaction },
      { key: 'SupplierTransaction', model: prisma.supplierTransaction },
      { key: 'AccountTransfer', model: prisma.accountTransfer },
    ];

    for (const rm of relatedModels) {
      if (data[rm.key]?.length > 0) {
        console.log(`Importing ${data[rm.key].length} ${rm.key} records...`);
        await (rm.model as any).createMany({ data: data[rm.key], skipDuplicates: true });
      }
    }

    console.log('✅ Data migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during data migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
