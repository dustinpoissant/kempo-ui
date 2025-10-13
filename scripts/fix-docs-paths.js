import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsComponentsDir = path.join(__dirname, '..', 'docs', 'components');
const docsUtilsDir = path.join(__dirname, '..', 'docs', 'utils');

async function fixComponentHtmlFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;

  // Replace the inline script block with script src to init.js
  const scriptPattern = /<script type="module">\s*import.*?(ShadowComponent|Import|Icon).*?<\/script>/s;
  if (scriptPattern.test(content)) {
    content = content.replace(
      scriptPattern,
      '<script type="module" src="./init.js"></script>'
    );
    modified = true;
  }

  // Fix the backtick-n issue in stylesheets
  if (content.includes('`n')) {
    content = content.replace(/`n/g, '\n');
    modified = true;
  }

  if (modified) {
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`Fixed: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

async function fixAllFilesInDirectory(dir, dirName) {
  const files = await fs.readdir(dir);
  let fixedCount = 0;

  for (const file of files) {
    if (file.endsWith('.html')) {
      const filePath = path.join(dir, file);
      const fixed = await fixComponentHtmlFile(filePath);
      if (fixed) fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} HTML files in ${dirName}/`);
}

async function fixAllComponentFiles() {
  console.log('Fixing components...');
  await fixAllFilesInDirectory(docsComponentsDir, 'docs/components');
  
  console.log('\nFixing utils...');
  await fixAllFilesInDirectory(docsUtilsDir, 'docs/utils');
}

fixAllComponentFiles().catch(console.error);
