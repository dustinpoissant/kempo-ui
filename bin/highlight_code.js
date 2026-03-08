#!/usr/bin/env node
import { highlight } from '../tools/highlight.js';
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
  process.exit(1);
}

const [langArg, ...rest] = args;
const lang = LANG_ALIASES[langArg.toLowerCase()];

if(!lang){
  console.error(`Unknown language: "${langArg}"`);
  console.error(`Supported: ${Object.keys(LANG_ALIASES).join(', ')}`);
  process.exit(1);
}

const beautifyCode = (code) => {
  const fns = { javascript: beautify.js, css: beautify.css, html: beautify.html, xml: beautify.html };
  const fn = fns[lang] || beautify.js;
  return fn(code, BEAUTIFY_OPTIONS);
};

const run = (code) => {
  const formatted = beautifyCode(code);
  const full = highlight(formatted, lang);
  process.stdout.write(
    full
      .replace(/^<pre><code class="hljs [^"]*">/, '')
      .replace(/<\/code><\/pre>\n?$/, '')
      .replace(/\n/g, '<br>') + '\n'
  );
};

if(rest.length > 0){
  run(rest.join(' '));
} else {
  const chunks = [];
  process.stdin.on('data', chunk => chunks.push(chunk));
  process.stdin.on('end', () => run(chunks.join('')));
}
