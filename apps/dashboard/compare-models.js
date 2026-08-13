const fs = require('fs');

const schema = fs.readFileSync('g:/CLIENT PROJECT/Sheba Tech/packages/database/prisma/schema.prisma', 'utf8');
const route = fs.readFileSync('g:/CLIENT PROJECT/Sheba Tech/apps/dashboard/app/api/backup/wipe/route.ts', 'utf8');

const schemaModels = [...schema.matchAll(/model\s+(\w+)/g)].map(m => m[1]);
const deletedModels = [...route.matchAll(/prisma\.(\w+)\.deleteMany\(\)/g)].map(m => m[1].toLowerCase());

console.log("Models in schema:");
const notDeleted = [];
for (const model of schemaModels) {
  if (!deletedModels.includes(model.toLowerCase())) {
    notDeleted.push(model);
  }
}
console.log("NOT DELETED:", notDeleted);
