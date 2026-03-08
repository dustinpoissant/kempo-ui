#!/usr/bin/env node
import { highlight } from '../tools/highlight.js';

const LANG_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  sh: 'bash',
  bash: 'bash',
  xml: 'xml',
  javascript: 'javascript',
  typescript: 'typescript',
  markdown: 'markdown'
};

const args = process.argv.slice(2);

if(args.length < 2){
  console.error('Usage: kempo-highlightcode <lang> <code>');
  console.error('Example: kempo-highlightcode html "<p>Hello World</p>"');
  process.exit(1);
}

const [langArg, ...rest] = args;
const lang = LANG_ALIASES[langArg.toLowerCase()];

if(!lang){
  console.error(`Unknown language: "${langArg}"`);
  console.error(`Supported: ${Object.keys(LANG_ALIASES).join(', ')}`);
  process.exit(1);
}

const code = rest.join(' ');
const full = highlight(code, lang);
// Strip the <pre><code> wrapper — return just the inner highlighted content
process.stdout.write(full.replace(/^<pre><code class="hljs [^"]*">/, '').replace(/<\/code><\/pre>\n?$/, '') + '\n');
