const fs = require('fs');
const data = JSON.parse(fs.readFileSync('backup.txt', 'utf8'));
const schema = {};
for (const key in data) {
  schema[key] = {
    count: data[key].length,
    firstItem: data[key][0]
  };
}
fs.writeFileSync('analyze_backup.json', JSON.stringify(schema, null, 2));
