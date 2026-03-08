#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'node_modules', '.cache', 'kempo-ui');
const CACHE_FILE = path.join(CACHE_DIR, 'icons-cache.json');
const SYMBOLS_URL = 'https://api.github.com/repos/google/material-design-icons/contents/symbols';

const query = process.argv[2];

if(!query){
	console.error('Usage: kempo-listicons <search_term>');
	process.exit(1);
}

const fetchJson = async (url) => {
	const response = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
	if(!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
	return response.json();
};

const getCurrentSha = async () => {
	const entries = await fetchJson(SYMBOLS_URL);
	return entries.find(e => e.name === 'web')?.sha;
};

const fetchAllIcons = async (treeSha) => {
	const [tree, metaRes] = await Promise.all([
		fetchJson(`https://api.github.com/repos/google/material-design-icons/git/trees/${treeSha}`),
		fetch('https://fonts.google.com/metadata/icons').then(r => r.text())
	]);
	const icons = tree.tree.map(e => e.path);
	const meta = JSON.parse(metaRes.replace(/^\)\]\}'\n/, ''));
	const tagMap = {};
	for(const icon of meta.icons) tagMap[icon.name] = icon.tags || [];
	return { icons, tagMap };
};

let cache = null;

try {
	cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
} catch {
	// no cache yet
}

const currentSha = await getCurrentSha();

if(cache?.sha !== currentSha){
	process.stderr.write('Cache outdated or missing, fetching icon list...\n');
	const { icons, tagMap } = await fetchAllIcons(currentSha);
	cache = { sha: currentSha, icons, tagMap };
	await fs.mkdir(CACHE_DIR, { recursive: true });
	await fs.writeFile(CACHE_FILE, JSON.stringify(cache), 'utf8');
}

const tagMap = cache.tagMap || {};

const matchesQuery = (name) => {
	if(name.includes(query)) return true;
	return (tagMap[name] || []).some(t => t.includes(query));
};

const results = cache.icons.filter(matchesQuery);

if(results.length === 0){
	console.log(`No icons found matching "${query}"`);
} else {
	console.log(results.join('\n'));
}
