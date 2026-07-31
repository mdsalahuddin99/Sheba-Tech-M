import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting cascade fix script...');

  // 1. Fetch existing records from ItemList and Product
  console.log('Fetching ItemLists and Products...');
  const itemLists = await prisma.itemList.findMany({
    select: { subcategory: true, brandId: true, productTypeId: true, modelId: true, seriesId: true }
  });

  const products = await prisma.product.findMany({
    select: { subcategory: true, globalBrandId: true, productTypeId: true, globalModelId: true, globalSeriesId: true }
  });

  // 2. We use Sets to keep unique pairs so we don't spam the database with duplicate queries
  const brandSubs = new Set<string>();
  const prodBrands = new Set<string>();
  const modelProds = new Set<string>();
  const seriesModels = new Set<string>();

  // Extract from ItemLists
  for (const item of itemLists) {
    if (item.brandId && item.subcategory) brandSubs.add(`${item.brandId}||${item.subcategory}`);
    if (item.productTypeId && item.brandId) prodBrands.add(`${item.productTypeId}||${item.brandId}`);
    if (item.modelId && item.productTypeId) modelProds.add(`${item.modelId}||${item.productTypeId}`);
    if (item.seriesId && item.modelId) seriesModels.add(`${item.seriesId}||${item.modelId}`);
  }

  // Extract from Products
  for (const prod of products) {
    if (prod.globalBrandId && prod.subcategory) brandSubs.add(`${prod.globalBrandId}||${prod.subcategory}`);
    if (prod.productTypeId && prod.globalBrandId) prodBrands.add(`${prod.productTypeId}||${prod.globalBrandId}`);
    if (prod.globalModelId && prod.productTypeId) modelProds.add(`${prod.globalModelId}||${prod.productTypeId}`);
    if (prod.globalSeriesId && prod.globalModelId) seriesModels.add(`${prod.globalSeriesId}||${prod.globalModelId}`);
  }

  console.log(`Found unique relationships to insert:`);
  console.log(`- Brand -> Subcategory: ${brandSubs.size}`);
  console.log(`- ProductName -> Brand: ${prodBrands.size}`);
  console.log(`- Model -> ProductName: ${modelProds.size}`);
  console.log(`- Series -> Model:      ${seriesModels.size}`);

  let insertedCount = 0;

  // 3. Upsert unique pairs into their respective bridge tables
  console.log('Saving relationships to database...');
  
  for (const bs of brandSubs) {
    const [brandId, subcategory] = bs.split('||');
    await prisma.brandSubcategory.upsert({
      where: { brandId_subcategory: { brandId, subcategory } },
      create: { brandId, subcategory },
      update: {}
    });
    insertedCount++;
  }

  for (const pb of prodBrands) {
    const [productTypeId, brandId] = pb.split('||');
    await prisma.productTypeBrand.upsert({
      where: { productTypeId_brandId: { productTypeId, brandId } },
      create: { productTypeId, brandId },
      update: {}
    });
    insertedCount++;
  }

  for (const mp of modelProds) {
    const [modelId, productTypeId] = mp.split('||');
    await prisma.modelProductType.upsert({
      where: { modelId_productTypeId: { modelId, productTypeId } },
      create: { modelId, productTypeId },
      update: {}
    });
    insertedCount++;
  }

  for (const sm of seriesModels) {
    const [seriesId, modelId] = sm.split('||');
    await prisma.seriesModel.upsert({
      where: { seriesId_modelId: { seriesId, modelId } },
      create: { seriesId, modelId },
      update: {}
    });
    insertedCount++;
  }

  console.log(`\n🎉 Successfully completed! Inserted or verified ${insertedCount} relationships.`);
}

main()
  .catch((e) => {
    console.error('Error executing script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
