const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /Sheba Tech/g, to: 'Sheba Tech' },
  { from: /sheba-tech/g, to: 'sheba-tech' },
  { from: /ShebaTech/g, to: 'ShebaTech' },
  { from: /shebatech/g, to: 'shebatech' },
  { from: /sheba_tech/g, to: 'sheba_tech' }
];

const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.turbo'];

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    for (const { from, to } of replacements) {
      content = content.replace(from, to);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error reading/writing file ${filePath}:`, err);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!ignoreDirs.includes(file)) {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        // Only process specific extensions or files
        if (
          file.endsWith('.ts') ||
          file.endsWith('.tsx') ||
          file.endsWith('.js') ||
          file.endsWith('.jsx') ||
          file.endsWith('.json') ||
          file.endsWith('.md') ||
          file.startsWith('.env')
        ) {
          // Do not replace inside package-lock.json (we can just npm install later or let it be for now, but better exclude it to avoid corruption)
          if (file === 'package-lock.json') continue;
          replaceInFile(fullPath);
        }
      }
    } catch (e) {
      console.error(`Error stat file ${fullPath}:`, e);
    }
  }
}

traverse(process.cwd());
console.log("Replacement complete.");
