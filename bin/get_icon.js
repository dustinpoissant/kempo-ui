#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline';

const CWD = process.cwd();
const CACHE_DIR = path.join(CWD, 'node_modules', '.cache', 'kempo-ui');

const yFlag = process.argv.includes('-y') || process.argv.includes('--yes') || process.env.npm_config_yes === 'true';
const rawArgs = process.argv.slice(2).filter(a => a !== '-y' && a !== '--yes');

let iconDir = 'icons';
const dirIdx = rawArgs.indexOf('--dir');
if(dirIdx !== -1){
	iconDir = rawArgs[dirIdx + 1];
	rawArgs.splice(dirIdx, 2);
}

const iconName = rawArgs[0];
const customName = rawArgs[1];

if(!iconName){
	console.error('Usage: kempo-geticon <icon_name> [custom_name] [--dir <path>] [-y]');
	console.error('Example: kempo-geticon format_bold');
	console.error('Example: kempo-geticon content_copy copy');
	console.error('Example: kempo-geticon chevron_left --dir src/assets/icons');
	process.exit(1);
}

const RIGHT_SUFFIXES = ['_right', '_forward'];
const ALL_SUFFIXES = ['_right', '_forward', '_left', '_backward', '_up', '_down'];

const fetchSvg = async (name) => {
	const res = await fetch(`https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`);
	return res.ok ? res.text() : null;
};

const confirm = async (question) => {
	if(yFlag) return true;
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	return new Promise(resolve => {
		rl.question(question, answer => {
			rl.close();
			resolve(answer.trim().toLowerCase() !== 'n');
		});
	});
};

const dirSuffix = ALL_SUFFIXES.find(s => iconName.endsWith(s));
const baseName = dirSuffix ? iconName.slice(0, -dirSuffix.length) : iconName;
const fileName = customName || baseName;

let raw;

if(dirSuffix && !RIGHT_SUFFIXES.includes(dirSuffix)){
	// Passed a non-right directional (e.g. chevron_left) — find right-facing equivalent
	for(const rs of RIGHT_SUFFIXES){
		raw = await fetchSvg(`${baseName}${rs}`);
		if(raw) break;
	}
	if(!raw){
		console.error(`Error: No right-facing variant found for "${baseName}"`);
		process.exit(1);
	}
	const ok = await confirm(`"${iconName}" is a directional icon. kempo-ui uses right direction only and applies CSS rotation.\nSave right-facing variant as "${fileName}.svg"? (Y/n) `);
	if(!ok) process.exit(0);
} else {
	raw = await fetchSvg(iconName);
	if(raw && dirSuffix){
		// Passed chevron_right or chevron_forward explicitly
		const ok = await confirm(`"${iconName}" is a directional icon. kempo-ui uses right direction only and applies CSS rotation.\nSave as "${fileName}.svg"? (Y/n) `);
		if(!ok) process.exit(0);
	} else if(!raw){
		// No exact match — check if right-facing variants exist
		let rightName;
		for(const rs of RIGHT_SUFFIXES){
			const candidate = `${iconName}${rs}`;
			raw = await fetchSvg(candidate);
			if(raw){ rightName = candidate; break; }
		}
		if(!raw){
			console.error(`Error: "${iconName}" not found`);
			process.exit(1);
		}
		const ok = await confirm(`"${iconName}" appears to be a directional icon (found "${rightName}"). kempo-ui uses right direction only and applies CSS rotation.\nSave as "${fileName}.svg"? (Y/n) `);
		if(!ok) process.exit(0);
	}
}

const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1];
const paths = [...raw.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1]);

if(!viewBox || !paths.length){
	console.error('Error: Unexpected SVG structure');
	process.exit(1);
}

const formatted = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${paths.map(d => `<path fill="currentColor" d="${d}"/>`).join('')}</svg>\n`;
const outputDir = path.resolve(CWD, iconDir);

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, `${fileName}.svg`), formatted, 'utf8');
console.log(`✓ Saved ${iconDir}/${fileName}.svg`);

spawn('npm', ['run', 'build', '--if-present'], { stdio: 'inherit', shell: true, cwd: CWD });
