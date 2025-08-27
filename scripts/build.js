import fs from 'fs/promises';
import { minify } from 'terser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDir, copyDir, emptyDir } from '../src/utils/fs-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Loading utils');

const components = [];
async function buildComponents(dir) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.lstat(fullPath);
    if (stat.isDirectory()) {
      await buildComponents(fullPath);
    } else if (file.endsWith('.js')) {
      components.push(fullPath);
    }
  }
}

const componentsDir = path.join(__dirname, '..', 'src', 'components');
await buildComponents(componentsDir);

let complete = 0;

console.log('Loading Component Source Code');
process.stdout.write(`0/${components.length} = 0%`);
const componentCode = {};
await Promise.all(components.map(async component => {
  componentCode[component] = await fs.readFile(component, 'utf-8');
  process.stdout.write("\r");
  complete++;
  process.stdout.write(`${complete}/${components.length} = ${Math.round((complete/components.length)*100)}%`);
}));
process.stdout.write("\n");

complete = 0;
console.log('Minifying Component Source Code');
process.stdout.write(`0/${components.length} = 0%`);
const minifiedComponents = {};
await Promise.all(components.map(async componentFile => {
  minifiedComponents[componentFile] = (await minify(componentCode[componentFile])).code;
  process.stdout.write("\r");
  complete++;
  process.stdout.write(`${complete}/${components.length} = ${Math.round((complete/components.length)*100)}%`);
}));
process.stdout.write("\n");

complete = 0;
console.log('Saving Minified Components to dist/');
process.stdout.write(`0/${components.length} = 0%`);
await Promise.all(components.map(async component => {
  const relativePath = path.relative(componentsDir, component);
  const destPath = path.join('./dist/components', relativePath);
  await ensureDir(path.dirname(destPath));
  await fs.writeFile(destPath, minifiedComponents[component], 'utf-8');
  process.stdout.write("\r");
  complete++;
  process.stdout.write(`${complete}/${components.length} = ${Math.round((complete/components.length)*100)}%`);
}));
process.stdout.write("\n");

console.log('Checking for Utils');
let utils = [];
try {
  const utilsFiles = await fs.readdir('./src/utils/');
  utils = utilsFiles.filter(f => f.endsWith('.js')).map(f => f.substring(0, f.length - 3));
} catch (error) {
  console.log('No utils directory found, skipping utils processing');
}

if(utils.length > 0) {
  complete = 0;

  console.log('Loading Utils Source Code');
  process.stdout.write(`0/${utils.length} = 0%`);
  const utilCode = {};
  await Promise.all(utils.map(async util => {
    utilCode[util] = await fs.readFile(`./src/utils/${util}.js`, 'utf-8');
    process.stdout.write("\r");
    complete++;
    process.stdout.write(`${complete}/${utils.length} = ${Math.round((complete/utils.length) * 100)}%`);
  }));
  process.stdout.write("\n");

  complete = 0;
  console.log('Minifying Utils Source Code');
  process.stdout.write(`0/${utils.length} = 0%`);
  const minifiedUtils = {};
  await Promise.all(utils.map(async utilFile => {
    minifiedUtils[utilFile] = (await minify(utilCode[utilFile])).code;
    process.stdout.write("\r");
    complete++;
    process.stdout.write(`${complete}/${utils.length} = ${Math.round((complete/utils.length) * 100)}%`);
  }));
  process.stdout.write("\n");

  complete = 0;
  console.log('Saving Minified Utils to dist/');
  process.stdout.write(`0/${utils.length} = 0%`);
  await ensureDir('./dist/utils');
  await Promise.all(utils.map(async util => {
    await fs.writeFile(`./dist/utils/${util}.js`, minifiedUtils[util], 'utf-8');
    process.stdout.write("\r");
    complete++;
    process.stdout.write(`${complete}/${utils.length} = ${Math.round((complete/utils.length) * 100)}%`);
  }));
  process.stdout.write("\n");
}

console.log('Loading kempo-vars.css');
const kempoVarsCSS = await fs.readFile('./src/kempo-vars.css', 'utf-8');
console.log('Minifying kempo-vars.css');
const minifiedKempoVarsCSS = kempoVarsCSS.replace(/\s*\{\s*/g, '{').replace(/\s*\}\s*/g, '}').replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, ' ').replace(/\s*\:\s*/g, ':').replace(/\s*\;\s*/g, ';').replace(/;\}/g, '}');
console.log('Saving kempo-vars.css');
await fs.writeFile('./dist/kempo-vars.css', minifiedKempoVarsCSS, 'utf-8');

console.log('Copying base kempo.css from external package');
const kempoCssSource = './node_modules/kempo-css/dist/kempo.min.css';
const kempoCssDest = './dist/kempo.min.css';
try {
  await ensureDir('./dist');
  const kempoCssContent = await fs.readFile(kempoCssSource, 'utf-8');
  await fs.writeFile(kempoCssDest, kempoCssContent, 'utf-8');
  console.log('Successfully copied kempo.min.css from kempo-css package');
} catch (error) {
  console.warn('Warning: Could not copy kempo.min.css:', error.message);
}

console.log('Copying dist/ to docs/');
await ensureDir('./docs/');
await copyDir('./dist', './docs/');

console.log('Build Complete');