import fs from "fs";

const filePath = "c:\\Users\\user\\Downloads\\shebatech-backup-2026-07-30.json";
const rawData = fs.readFileSync(filePath, "utf-8");
const backupJson = JSON.parse(rawData);

console.log("Keys in data:", Object.keys(backupJson.data));
if (backupJson.data.sales && backupJson.data.sales.length > 0) {
    console.log("First sale keys:", Object.keys(backupJson.data.sales[0]));
}
