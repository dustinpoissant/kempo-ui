/**
 * Highlight Tool
 * Highlights code using Highlight.js and returns a <pre><code> HTML block.
 *
 * CLI Usage:
 *   echo '<div>hello</div>' | node tools/highlight.js --lang html
 *   node tools/highlight.js --lang javascript --file path/to/code.js
 *
 * Options:
 *   --lang <language>  Language for syntax highlighting (required for CLI)
 *   --file <path>      Read code from a file instead of stdin
 *
 * Module Usage:
 *   import { highlight } from './tools/highlight.js';
 *   const html = highlight(code, 'javascript');
 */

import hljs from 'highlight.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

export const highlight = (code, lang) => {
  const result = hljs.highlight(code, { language: lang });
  return `<pre><code class="hljs ${lang}">${result.value}</code></pre>`;
};

const isMain = path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if(isMain){
  const args = process.argv.slice(2);
  const getArg = name => {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const lang = getArg('--lang');
  const filePath = getArg('--file');

  if(!lang){
    console.error('Error: --lang <language> is required');
    console.error('Example: echo "const x = 1;" | node tools/highlight.js --lang javascript');
    process.exit(1);
  }

  const code = filePath
    ? readFileSync(filePath, 'utf8')
    : readFileSync(0, 'utf8');

  process.stdout.write(highlight(code, lang) + '\n');
}
