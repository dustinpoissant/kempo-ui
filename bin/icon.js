#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { search, input, confirm } from '@inquirer/prompts';

const CWD = process.cwd();
const CACHE_DIR = path.join(CWD, 'node_modules', '.cache', 'kempo-ui');
const CACHE_FILE = path.join(CACHE_DIR, 'icons-cache.json');
const SYMBOLS_URL = 'https://api.github.com/repos/google/material-design-icons/contents/symbols';

const RIGHT_SUFFIXES = ['_right', '_forward'];
const ALL_SUFFIXES = ['_right', '_forward', '_left', '_backward', '_up', '_down'];

const fetchJson = async (url) => {
	const response = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
	if(!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
	return response.json();
};

const fetchSvg = async (name) => {
	const res = await fetch(`https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${name}/default/24px.svg`);
	return res.ok ? res.text() : null;
};

let cache = null;

try {
	cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
} catch {
	// no cache yet
}

const currentSha = await (async () => {
	const entries = await fetchJson(SYMBOLS_URL);
	return entries.find(e => e.name === 'web')?.sha;
})();

if(cache?.sha !== currentSha){
	process.stderr.write('Updating icon list cache...\n');
	const [tree, metaRes] = await Promise.all([
		fetchJson(`https://api.github.com/repos/google/material-design-icons/git/trees/${currentSha}`),
		fetch('https://fonts.google.com/metadata/icons').then(r => r.text())
	]);
	const icons = tree.tree.map(e => e.path);
	const meta = JSON.parse(metaRes.replace(/^\)\]\}'\n/, ''));
	const tagMap = {};
	for(const icon of meta.icons) tagMap[icon.name] = icon.tags || [];
	cache = { sha: currentSha, icons, tagMap };
	await fs.mkdir(CACHE_DIR, { recursive: true });
	await fs.writeFile(CACHE_FILE, JSON.stringify(cache), 'utf8');
}

const tagMap = cache.tagMap || {};

const matchesQuery = (name, query) => {
	if(name.includes(query)) return true;
	return (tagMap[name] || []).some(t => t.includes(query));
};

const rankMatch = (name, query) => {
	if(name === query) return 0;
	if(name.startsWith(query)) return 1;
	return 2;
};

const iconName = await search({
	message: 'Search for an icon',
	source: (query) => {
		if(!query) return [];
		return cache.icons
			.filter(name => matchesQuery(name, query))
			.sort((a, b) => rankMatch(a, query) - rankMatch(b, query))
			.map(name => ({ name, value: name }));
	}
});

const dirSuffix = ALL_SUFFIXES.find(s => iconName.endsWith(s));
const baseName = dirSuffix ? iconName.slice(0, -dirSuffix.length) : iconName;

const customName = await input({
	message: 'Save as',
	default: baseName
});

const fileName = customName || baseName;
let raw;

if(dirSuffix && !RIGHT_SUFFIXES.includes(dirSuffix)){
	for(const rs of RIGHT_SUFFIXES){
		raw = await fetchSvg(`${baseName}${rs}`);
		if(raw) break;
	}
	if(!raw){
		console.error(`Error: No right-facing variant found for "${baseName}"`);
		process.exit(1);
	}
	const ok = await confirm({ message: `"${iconName}" is directional. kempo-ui stores right-facing only and uses CSS rotation. Download right-facing variant as "${fileName}.svg"?`, default: true });
	if(!ok) process.exit(0);
} else {
	raw = await fetchSvg(iconName);
	if(raw && dirSuffix){
		const ok = await confirm({ message: `"${iconName}" is directional. kempo-ui stores right-facing only and uses CSS rotation. Save as "${fileName}.svg"?`, default: true });
		if(!ok) process.exit(0);
	} else if(!raw){
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
		const ok = await confirm({ message: `"${iconName}" appears directional (found "${rightName}"). kempo-ui stores right-facing only and uses CSS rotation. Save as "${fileName}.svg"?`, default: true });
		if(!ok) process.exit(0);
	}
}

const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1];
const paths = [...raw.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1]);

if(!viewBox || !paths.length){
	console.error('Error: Unexpected SVG structure');
	process.exit(1);
}

const iconDir = 'icons';
const formatted = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${paths.map(d => `<path fill="currentColor" d="${d}"/>`).join('')}</svg>\n`;
const outputDir = path.resolve(CWD, iconDir);

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, `${fileName}.svg`), formatted, 'utf8');
console.log(`✓ Saved ${iconDir}/${fileName}.svg`);

spawn('npm', ['run', 'build', '--if-present'], { stdio: 'inherit', shell: true, cwd: CWD });
