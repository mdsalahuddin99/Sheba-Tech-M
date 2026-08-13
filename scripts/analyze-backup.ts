import fs from 'fs';
import path from 'path';

function analyzeBackup() {
  const backupPath = path.join(process.cwd(), 'backup.txt');
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  
  let md = '# Backup Analysis\n\n';
  
  for (const key in data) {
    const items = data[key];
    md += `## Table: ${key}\n`;
    md += `- **Record Count**: ${items.length}\n`;
    if (items.length > 0) {
      md += `- **Schema Fields**:\n`;
      const firstItem = items[0];
      for (const field in firstItem) {
        md += `  - \`${field}\`: ${typeof firstItem[field]} (e.g. ${JSON.stringify(firstItem[field]).slice(0, 30)})\n`;
      }
    }
    md += '\n';
  }
  
  fs.writeFileSync('backup_analysis.md', md);
  console.log('Analysis complete! Check backup_analysis.md');
}

analyzeBackup();
