import fs from 'fs/promises';
import { minify } from 'terser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDir, copyDir, emptyDir } from 'kempo-server/utils/fs-utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Loading utils');

// Clear dist directory first
await emptyDir('./dist');

const allJSFiles = [];
async function buildAllJSFiles(dir, baseSrcDir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.lstat(fullPath);
    if (stat.isDirectory()) {
      await buildAllJSFiles(fullPath, baseSrcDir);
    } else if (file.endsWith('.js')) {
      allJSFiles.push(fullPath);
    }
  }
}

const srcDir = path.join(__dirname, '..', 'src');
await buildAllJSFiles(srcDir, srcDir);

let complete = 0;

console.log('Loading JS Source Code');
process.stdout.write(`0/${allJSFiles.length} = 0%`);
const jsCode = {};
await Promise.all(allJSFiles.map(async jsFile => {
  jsCode[jsFile] = await fs.readFile(jsFile, 'utf-8');
  process.stdout.write("\r");
  complete++;
  process.stdout.write(`${complete}/${allJSFiles.length} = ${Math.round((complete/allJSFiles.length)*100)}%`);
}));
process.stdout.write("\n");

complete = 0;
console.log('Processing JS Files (minifying or copying)');
process.stdout.write(`0/${allJSFiles.length} = 0%`);
const processedJS = {};
await Promise.all(allJSFiles.map(async jsFile => {
  const filename = path.basename(jsFile);
  let code = jsCode[jsFile];
  
  if (filename.endsWith('.min.js')) {
    // Already minified, just copy
    processedJS[jsFile] = code;
  } else {
    // Minify the file
    code = (await minify(code)).code;
  }
  
  // Convert absolute paths to relative paths for GitHub Pages compatibility
  // This handles paths in ShadowComponent and Icon
  code = code.replace(/stylesheetPath\s*=\s*"\/kempo\.min\.css"/g, 'stylesheetPath="./kempo.min.css"');
  code = code.replace(/pathToIcons\s*=\s*\["\/icons"\]/g, 'pathToIcons=["./icons"]');
  
  processedJS[jsFile] = code;
  
  process.stdout.write("\r");
  complete++;
  process.stdout.write(`${complete}/${allJSFiles.length} = ${Math.round((complete/allJSFiles.length)*100)}%`);
}));
process.stdout.write("\n");

complete = 0;
console.log('Saving JS Files to dist/');
process.stdout.write(`0/${allJSFiles.length} = 0%`);
await Promise.all(allJSFiles.map(async jsFile => {
  const relativePath = path.relative(srcDir, jsFile);
  const destPath = path.join('./dist', relativePath);
  await ensureDir(path.dirname(destPath));
  await fs.writeFile(destPath, processedJS[jsFile], 'utf-8');
  process.stdout.write("\r");
  complete++;
  process.stdout.write(`${complete}/${allJSFiles.length} = ${Math.round((complete/allJSFiles.length)*100)}%`);
}));
process.stdout.write("\n");

console.log('Cleaning docs/src/ directory');
await emptyDir('./docs/src/');

console.log('Copying dist/ to docs/src/');
await ensureDir('./docs/src/');
await copyDir('./dist', './docs/src/');

console.log('Copying icons/ to docs/icons/');
await copyDir('./icons', './docs/icons/');

console.log('Pre-rendering docs-src → docs...');
import { renderDir } from 'kempo-server/templating';
const count = await renderDir('./docs-src', './docs');
console.log(`Rendered ${count} pages`);

console.log('Build Complete');