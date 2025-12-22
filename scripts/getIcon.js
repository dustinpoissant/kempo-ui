import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconName = process.argv[2];
const customName = process.argv[3];

if(!iconName){
	console.error('Error: Please provide an icon name');
	console.log('Usage: npm run geticon <icon_name> [custom_name]');
	console.log('Example: npm run geticon format_bold');
	console.log('Example: npm run geticon content_copy copy');
	process.exit(1);
}

const fileName = customName || iconName;
const url = `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${iconName}/default/24px.svg`;
const outputPath = path.join(__dirname, '..', 'icons', `${fileName}.svg`);

console.log(`Downloading ${iconName}...`);

try {
	const response = await fetch(url);
	
	if(!response.ok){
		throw new Error(`Failed to fetch icon: ${response.status} ${response.statusText}`);
	}
	
	let svgContent = await response.text();
	
	svgContent = svgContent.replace(/ height="24"/g, '');
	svgContent = svgContent.replace(/ width="24"/g, '');
	svgContent = svgContent.replace(/<path d=/g, '<path fill="currentColor" d=');
	
	await fs.writeFile(outputPath, svgContent, 'utf8');
	
	console.log(`✓ Successfully downloaded and formatted ${fileName}.svg`);
	console.log(`  Saved to: icons/${fileName}.svg`);
	
	console.log('\nStarting build in background...');
	spawn('npm', ['run', 'build'], {
		stdio: 'inherit',
		shell: true
	});
} catch(error){
	console.error(`Error: ${error.message}`);
	process.exit(1);
}
