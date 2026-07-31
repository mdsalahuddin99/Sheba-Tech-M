import fs from "fs";

function main() {
  const backupPath = "c:\\Users\\user\\Downloads\\shebatech-backup-2026-07-30.json";
  const rawData = fs.readFileSync(backupPath, "utf-8");
  const backupJson = JSON.parse(rawData);

  const rawSales = backupJson.data?.sales || [];
  console.log(`Total Sales in Backup: ${rawSales.length}`);

  const mamunSales = rawSales.filter(s => s.customerId === "cmqruxje50000l204arhqyg9e");
  console.log(`Mamunur Rashid (ID: cmqruxje50000l204arhqyg9e) sales in backup: ${mamunSales.length}`);

  // check if any sale matches his phone or name inside 'data' or similar
  const rawCustomers = backupJson.data?.customers || [];
  const mamuns = rawCustomers.filter(c => c.name.toLowerCase().includes("mamun") || (c.phone && c.phone.includes("01971494745")));
  console.log("Customers in backup matching Mamun/01971494745:");
  for (const c of mamuns) {
    const sCount = rawSales.filter(s => s.customerId === c.id).length;
    console.log(`- ${c.name} (${c.phone}) [ID: ${c.id}] -> Sales: ${sCount}`);
  }
}

main();
