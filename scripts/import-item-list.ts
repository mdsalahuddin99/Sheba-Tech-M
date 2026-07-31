import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const filePath = "c:\\Users\\user\\Downloads\\shebatech-backup-2026-07-30.json";
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  const backupJson = JSON.parse(rawData);

  const itemLists = backupJson.data?.itemLists;

  if (!itemLists || itemLists.length === 0) {
    console.log("No ItemList data found in the backup.");
    return;
  }

  console.log(`Found ${itemLists.length} ItemList records. Importing...`);
  
  try {
    await prisma.itemList.createMany({
      data: itemLists,
      skipDuplicates: true
    });
    console.log(`✅ Successfully imported ${itemLists.length} ItemList records!`);
  } catch (error) {
    console.error("❌ Error importing ItemList:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
