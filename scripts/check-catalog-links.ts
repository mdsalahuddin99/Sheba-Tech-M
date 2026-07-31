import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCatalogLinks() {
  const brandSubcatCount = await prisma.brandSubcategory.count();
  const productTypeBrandCount = await prisma.productTypeBrand.count();
  const modelProductTypeCount = await prisma.modelProductType.count();
  const seriesModelCount = await prisma.seriesModel.count();

  const totalProducts = await prisma.product.count();
  const productsWithBrand = await prisma.product.count({ where: { globalBrandId: { not: null } } });
  const productsWithSubcat = await prisma.product.count({ where: { subcategory: { not: null } } });

  console.log("Catalog Links Counts:");
  console.log(`BrandSubcategory: ${brandSubcatCount}`);
  console.log(`ProductTypeBrand: ${productTypeBrandCount}`);
  console.log(`ModelProductType: ${modelProductTypeCount}`);
  console.log(`SeriesModel: ${seriesModelCount}`);
  console.log(`Total Products: ${totalProducts}`);
  console.log(`Products with globalBrandId: ${productsWithBrand}`);
  console.log(`Products with subcategory: ${productsWithSubcat}`);
}

checkCatalogLinks().catch(console.error).finally(() => prisma.$disconnect());
