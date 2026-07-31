import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixCatalogLinks() {
  console.log("Analyzing existing products to build catalog links...");
  const products = await prisma.product.findMany();
  
  let brandSubcatAdded = 0;
  let typeBrandAdded = 0;
  let modelTypeAdded = 0;
  let seriesModelAdded = 0;

  for (const p of products) {
    // 1. Link Brand to Subcategory
    if (p.globalBrandId && p.subcategory) {
      try {
        await prisma.brandSubcategory.create({
          data: { brandId: p.globalBrandId, subcategory: p.subcategory }
        });
        brandSubcatAdded++;
      } catch (e) { /* Ignore duplicates */ }
    }

    // 2. Link Product Type to Brand
    if (p.productTypeId && p.globalBrandId) {
      try {
        await prisma.productTypeBrand.create({
          data: { productTypeId: p.productTypeId, brandId: p.globalBrandId }
        });
        typeBrandAdded++;
      } catch (e) { /* Ignore duplicates */ }
    }

    // 3. Link Model to Product Type
    if (p.globalModelId && p.productTypeId) {
      try {
        await prisma.modelProductType.create({
          data: { modelId: p.globalModelId, productTypeId: p.productTypeId }
        });
        modelTypeAdded++;
      } catch (e) { /* Ignore duplicates */ }
    }

    // 4. Link Series to Model
    if (p.globalSeriesId && p.globalModelId) {
      try {
        await prisma.seriesModel.create({
          data: { seriesId: p.globalSeriesId, modelId: p.globalModelId }
        });
        seriesModelAdded++;
      } catch (e) { /* Ignore duplicates */ }
    }
  }

  console.log("Migration Fix Complete:");
  console.log(`Brand <-> Subcategory links added: ${brandSubcatAdded}`);
  console.log(`Product Type <-> Brand links added: ${typeBrandAdded}`);
  console.log(`Model <-> Product Type links added: ${modelTypeAdded}`);
  console.log(`Series <-> Model links added: ${seriesModelAdded}`);
}

fixCatalogLinks().catch(console.error).finally(() => prisma.$disconnect());
