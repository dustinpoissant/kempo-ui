import fs from 'fs/promises';
import path from 'path';
import { promptUser } from 'kempo-server/utils/cli';

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
const docsDir = path.resolve('./docs');
const srcDir = path.resolve('./src');
const cdnPattern = /https:\/\/cdn\.jsdelivr\.net\/npm\/kempo-css@[\d.]+\/dist\/kempo\.min\.css/g;

const newVersion = await promptUser('Enter the new kempo-css version (e.g., 1.3.1)');
if(!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)){
  console.error('Invalid version format. Please use semantic versioning (e.g., 1.3.1)');
  process.exit(1);
}

const newCdnUrl = `https://cdn.jsdelivr.net/npm/kempo-css@${newVersion}/dist/kempo.min.css`;

console.log(`\nUpdating kempo-css CDN references to version ${newVersion}...`);

const docsFiles = await getFiles(docsDir, ['.html']);
const srcFiles = await getFiles(srcDir, ['.js']);
const allFiles = [...docsFiles, ...srcFiles];

let updatedCount = 0;
for(const file of allFiles){
  const content = await fs.readFile(file, 'utf-8');
  if(cdnPattern.test(content)){
    const newContent = content.replace(cdnPattern, newCdnUrl);
    await fs.writeFile(file, newContent, 'utf-8');
    console.log(`Updated: ${path.relative(rootDir, file)}`);
    updatedCount++;
  }
}

if(updatedCount === 0){
  console.log('No files found with kempo-css CDN references.');
} else {
  console.log(`\nDone! Updated ${updatedCount} file(s).`);
}
