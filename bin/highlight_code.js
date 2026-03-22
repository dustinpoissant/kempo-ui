#!/usr/bin/env node
import hljs from 'highlight.js';
import beautify from 'js-beautify';

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

const BEAUTIFY_OPTIONS = {
  indent_size: 2,
  wrap_line_length: 0,
  preserve_newlines: false,
  max_preserve_newlines: 0
};

const args = process.argv.slice(2);

if(args.length < 1){
  console.error('Usage: node bin/highlight_code.js <lang> <code>');
  console.error('       echo "<code>" | node bin/highlight_code.js <lang>');
  process.exit(1);
}

const [langArg, ...rest] = args;
const lang = LANG_ALIASES[langArg.toLowerCase()];

if(!lang){
  console.error(`Unknown language: "${langArg}"`);
  console.error(`Supported: ${Object.keys(LANG_ALIASES).join(', ')}`);
  process.exit(1);
}

const beautifyFns = { javascript: beautify.js, css: beautify.css, html: beautify.html, xml: beautify.html };

const run = code => {
  const formatted = (beautifyFns[lang] || beautify.js)(code, BEAUTIFY_OPTIONS);
  const highlighted = hljs.highlight(formatted, { language: lang }).value;
  process.stdout.write(`<pre><code class="hljs ${lang}">${highlighted.replace(/\n/g, '<br>')}</code></pre>\n`);
};

if(rest.length > 0){
  run(rest.join(' '));
} else {
  const chunks = [];
  process.stdin.on('data', chunk => chunks.push(chunk));
  process.stdin.on('end', () => run(chunks.join('')));
}
