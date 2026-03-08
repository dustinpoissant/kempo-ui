---
name: highlight-code
description: Generates syntax-highlighted HTML for use in documentation code examples. USE THIS instead of creating temporary scripts.
---

# Highlight Code

## When to Use

Use this skill whenever you need syntax-highlighted HTML to embed in a documentation page — for example, when updating a `<pre><code class="hljs ...">` block in a `docs/components/*.html` file. **Do not create temporary `.mjs` scripts to do this.**

## Usage

```powershell
node bin/highlight_code.js <lang> <code>
```

**Supported languages:** `html`, `css`, `js` / `javascript`, `ts` / `typescript`, `json`, `md` / `markdown`, `sh` / `bash`, `xml`

## Output

Prints the inner highlighted content (hljs spans, no `<pre><code>` wrapper) to stdout, with `<br>` tags instead of newlines — a single line suitable for embedding in HTML.

Input is automatically beautified before highlighting, so you can pass minified code.

## Workflow for Updating Doc Code Samples

Run the script with minified code as a single argument, capture to `$hl`, then use PowerShell's `.Replace()` to patch the HTML file:

```powershell
$hl = node bin/highlight_code.js xml "<k-table id=myExample></k-table><script type=module>doSomething('foo');</script>"
$html = [System.IO.File]::ReadAllText((Resolve-Path 'docs/components/my-component.html'))
$old = [regex]::Match($html, '(?s)<pre><code class="hljs xml">.*?</code></pre>').Value
[System.IO.File]::WriteAllText((Resolve-Path 'docs/components/my-component.html'), $html.Replace($old, "<pre><code class=`"hljs xml`">$hl</code></pre>"))
```

## Important Notes

- Use **outer double-quotes** for the PowerShell argument string, and **single-quotes** for JS string literals inside. This preserves all quoting correctly through to node.
- HTML attribute values should be **unquoted** in the argument (`id=foo` not `id="foo"`) — the beautifier adds consistent formatting anyway.
- Use `[System.IO.File]::ReadAllText` / `WriteAllText` + `.Replace()` (not `-replace`) to avoid regex interpretation of the replacement string.
- If a page has multiple `<pre><code>` blocks, adjust the regex to match the specific one (e.g. match by a nearby unique string, or loop with an index).
- The beautifier handles indentation and formatting automatically.
- Output uses `<br>` instead of `\n`, keeping the block on one line in the HTML source.
