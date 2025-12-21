import fs from 'fs/promises';
import path from 'path';
import { promptUser } from 'kempo-server/utils/cli';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFiles = async (dir, extensions) => {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for(const entry of entries){
    const fullPath = path.join(dir, entry.name);
    if(entry.isDirectory()){
      files.push(...await getFiles(fullPath, extensions));
    } else if(extensions.some(ext => entry.name.endsWith(ext))){
      files.push(fullPath);
    }
  }
  return files;
};

const rootDir = path.resolve('.');
const srcDir = path.resolve('./src');
const cdnPattern = /https:\/\/cdn\.jsdelivr\.net\/npm\/kempo-ui@[\d.]+\/icons\//g;

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
const currentVersion = packageJson.version;

console.log(`Current kempo-ui version: ${currentVersion}`);
const newVersion = await promptUser(`Enter the new kempo-ui CDN version (default: ${currentVersion})`);
const versionToUse = newVersion || currentVersion;

if(!/^\d+\.\d+\.\d+$/.test(versionToUse)){
  console.error('Invalid version format. Please use semantic versioning (e.g., 0.0.49)');
  process.exit(1);
}

const newCdnUrl = `https://cdn.jsdelivr.net/npm/kempo-ui@${versionToUse}/icons/`;

console.log(`\nUpdating kempo-ui CDN references to version ${versionToUse}...`);

const srcFiles = await getFiles(srcDir, ['.js']);

let updatedCount = 0;
for(const file of srcFiles){
  const content = await fs.readFile(file, 'utf-8');
  if(cdnPattern.test(content)){
    const newContent = content.replace(cdnPattern, newCdnUrl);
    await fs.writeFile(file, newContent, 'utf-8');
    console.log(`Updated: ${path.relative(rootDir, file)}`);
    updatedCount++;
  }
}

if(updatedCount === 0){
  console.log('No files found with kempo-ui CDN references.');
} else {
  console.log(`\nDone! Updated ${updatedCount} file(s) to version ${versionToUse}.`);
}
