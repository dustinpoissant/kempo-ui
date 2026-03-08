---
name: highlight-code
description: Generates syntax-highlighted HTML for use in documentation code examples. USE THIS instead of creating temporary scripts.
---

# Highlight Code

## When to Use

Use this skill whenever you need syntax-highlighted HTML to embed in a documentation page — for example, when updating a `<pre><code class="hljs ...">` block in a `docs/components/*.html` file. **Do not create temporary `.mjs` scripts to do this.**

## Usage

```bash
npm run highlightcode -- <lang> "<code>"
```

Or via npx:
```bash
npx kempo-highlightcode <lang> "<code>"
```

**Supported languages:** `html`, `css`, `js` / `javascript`, `ts` / `typescript`, `json`, `md` / `markdown`, `sh` / `bash`, `xml`

## Output

The script returns the **inner highlighted content only** — the hljs span markup without any `<pre><code>` wrapper. Paste it directly inside an existing `<pre><code class="hljs <lang>">...</code></pre>` block.

## Example

```bash
npm run highlightcode -- html "<p>Hello World</p>"
```

Returns:
```
<span class="hljs-tag">&lt;<span class="hljs-name">p</span>&gt;</span>Hello World<span class="hljs-tag">&lt;/<span class="hljs-name">p</span>&gt;</span>
```

## Multi-line Code

For multi-line code, use a here-string in PowerShell:

```powershell
$code = @"
class Foo extends Bar {
  render(){ return html`<p>hello</p>`; }
}
"@
node bin/highlight_code.js js $code
```

## Workflow for Updating Doc Code Samples

1. Run `npm run highlightcode -- <lang> "<new code>"` to get the highlighted HTML.
2. Replace the inner content of the matching `<pre><code class="hljs ...">` block in the doc file with the output.
3. Also update the live demo `<script type="module">` block with the raw (unhighlighted) code.
