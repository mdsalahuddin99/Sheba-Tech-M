import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

const prisma = new PrismaClient();
const downloadsDir = path.join(os.homedir(), 'Downloads');

async function importData() {
  console.log('Starting catalog import...');

  // 1. Read files
  const brands = JSON.parse(fs.readFileSync(path.join(downloadsDir, 'Brand.json'), 'utf-8'));
  const productTypes = JSON.parse(fs.readFileSync(path.join(downloadsDir, 'ProductType.json'), 'utf-8'));
  const models = JSON.parse(fs.readFileSync(path.join(downloadsDir, 'Model.json'), 'utf-8'));
  const series = JSON.parse(fs.readFileSync(path.join(downloadsDir, 'Series.json'), 'utf-8'));
  const products = JSON.parse(fs.readFileSync(path.join(downloadsDir, 'Product.json'), 'utf-8'));

  console.log(`Loaded ${brands.length} Brands, ${productTypes.length} ProductTypes, ${models.length} Models, ${series.length} Series, ${products.length} Products.`);

  // 2. Insert Base Entities
  console.log('Importing Brands...');
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: { name: b.name },
      create: { id: b.id, name: b.name }
    });
  }

  console.log('Importing ProductTypes...');
  for (const pt of productTypes) {
    await prisma.productType.upsert({
      where: { id: pt.id },
      update: { name: pt.name },
      create: { id: pt.id, name: pt.name }
    });
  }

  console.log('Importing Models...');
  for (const m of models) {
    await prisma.model.upsert({
      where: { id: m.id },
      update: { name: m.name },
      create: { id: m.id, name: m.name }
    });
  }

  console.log('Importing Series...');
  for (const s of series) {
    await prisma.series.upsert({
      where: { id: s.id },
      update: { name: s.name },
      create: { id: s.id, name: s.name }
    });
  }

  // 3. Build Relationships from Product data
  console.log('Building Relationships from Product data...');
  const brandSubcat = new Set<string>();
  const prodBrands = new Set<string>();
  const modelProds = new Set<string>();
  const seriesModels = new Set<string>();

  for (const p of products) {
    if (p.globalBrandId && p.subcategory) {
      brandSubcat.add(`${p.globalBrandId}||${p.subcategory}`);
    }
    if (p.productTypeId && p.globalBrandId) {
      prodBrands.add(`${p.productTypeId}||${p.globalBrandId}`);
    }
    if (p.globalModelId && p.productTypeId) {
      modelProds.add(`${p.globalModelId}||${p.productTypeId}`);
    }
    if (p.globalSeriesId && p.globalModelId) {
      seriesModels.add(`${p.globalSeriesId}||${p.globalModelId}`);
    }
  }

  console.log('Importing BrandSubcategory...');
  for (const item of brandSubcat) {
    const [brandId, subcategory] = item.split('||');
    await prisma.brandSubcategory.upsert({
      where: { brandId_subcategory: { brandId, subcategory } },
      update: {},
      create: { brandId, subcategory }
    });
  }

  console.log('Importing ProductTypeBrand...');
  for (const item of prodBrands) {
    const [productTypeId, brandId] = item.split('||');
    await prisma.productTypeBrand.upsert({
      where: { productTypeId_brandId: { productTypeId, brandId } },
      update: {},
      create: { productTypeId, brandId }
    });
  }

  console.log('Importing ModelProductType...');
  for (const item of modelProds) {
    const [modelId, productTypeId] = item.split('||');
    await prisma.modelProductType.upsert({
      where: { modelId_productTypeId: { modelId, productTypeId } },
      update: {},
      create: { modelId, productTypeId }
    });
  }

  console.log('Importing SeriesModel...');
  for (const item of seriesModels) {
    const [seriesId, modelId] = item.split('||');
    await prisma.seriesModel.upsert({
      where: { seriesId_modelId: { seriesId, modelId } },
      update: {},
      create: { seriesId, modelId }
    });
  }

  // 4. Import Products
  console.log('Importing Products...');
  let importedCount = 0;
  for (const p of products) {
    try {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          slug: p.slug,
          description: p.description,
          categoryId: p.categoryId,
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          reorderLevel: p.reorderLevel,
          unit: p.unit,
          isPublished: p.isPublished,
          color: p.color,
          condition: p.condition,
          emoji: p.emoji,
          ram: p.ram,
          storage: p.storage,
          subcategory: p.subcategory,
          supplierId: p.supplierId,
          trackSerials: p.trackSerials,
          wholesalePrice: p.wholesalePrice,
          warrantyMonths: p.warrantyMonths,
          shortDescription: p.shortDescription,
          isTrending: p.isTrending,
          globalBrandId: p.globalBrandId,
          globalModelId: p.globalModelId,
          globalSeriesId: p.globalSeriesId,
          productTypeId: p.productTypeId,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        },
        create: {
          id: p.id,
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          slug: p.slug,
          description: p.description,
          categoryId: p.categoryId,
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          reorderLevel: p.reorderLevel,
          unit: p.unit,
          isPublished: p.isPublished,
          color: p.color,
          condition: p.condition,
          emoji: p.emoji,
          ram: p.ram,
          storage: p.storage,
          subcategory: p.subcategory,
          supplierId: p.supplierId,
          trackSerials: p.trackSerials,
          wholesalePrice: p.wholesalePrice,
          warrantyMonths: p.warrantyMonths,
          shortDescription: p.shortDescription,
          isTrending: p.isTrending,
          globalBrandId: p.globalBrandId,
          globalModelId: p.globalModelId,
          globalSeriesId: p.globalSeriesId,
          productTypeId: p.productTypeId,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }
      });
      importedCount++;
    } catch (error: any) {
      console.error(`Failed to import product ${p.name} (${p.id}):`, error.message);
    }
  }

  console.log(`Successfully imported ${importedCount} out of ${products.length} products!`);
  console.log('🎉 Catalog import complete!');
}

importData().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
