import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.jsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Check if we need to add import
  const hasAlert = /alert\(/.test(content);
  const hasConfirm = /confirm\(/.test(content);
  const hasPrompt = /prompt\(/.test(content);

  if (!hasAlert && !hasConfirm && !hasPrompt) return;

  const imports = [];
  if (hasAlert) imports.push('showAlert');
  if (hasConfirm) imports.push('showConfirm');
  if (hasPrompt) imports.push('showPrompt');

  // Inject import
  if (!content.includes('from \'../utils/alert\'') && !content.includes('from \'./utils/alert\'')) {
    const importPath = file.split(/[\\/]/).length > 2 ? '../utils/alert' : './utils/alert';
    const importStmt = `import { ${imports.join(', ')} } from '${importPath}';\n`;
    // Add import after the last import statement or at the top
    content = content.replace(/(import [^\n]+;\n)+(?!import)/, match => `${match}${importStmt}`);
    changed = true;
  }

  // Replace alert
  if (hasAlert) {
    content = content.replace(/\balert\(([^)]+)\)/g, "showAlert('Thông báo', $1)");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
