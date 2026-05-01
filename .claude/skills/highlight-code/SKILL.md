---
name: highlight-code
description: Generates syntax-highlighted HTML for documentation code samples. USE THIS instead of hand-writing <pre><code class="hljs ..."> blocks or creating temporary scripts. Run via `npx kempo-highlightcode <lang>` with code piped on stdin.
---

# Highlight Code

## When to Use

Use this skill whenever you need syntax-highlighted HTML to embed in a documentation page — for example, when adding or updating a `<pre><code class="hljs ...">` block in a `docs-src/components/*.page.html` file. **Do not hand-write the highlighted markup, and do not create temporary scripts to do this.**

> Source files live in `docs-src/` and are pre-rendered to `docs/` by the kempo-server templating system. Always edit the `*.page.html` source — never the generated `docs/*.html`.

## Usage

Pipe code via stdin (supports multi-line):
```bash
cat <<'EOF' | npx kempo-highlightcode <lang>
<div class='container'>
  <h1>Hello</h1>
</div>
EOF
```

Or pass minified code as an argument:
```bash
npx kempo-highlightcode <lang> "<div class='container'><h1>Hello</h1></div>"
```

**Supported languages:** `html`, `css`, `js` / `javascript`, `ts` / `typescript`, `json`, `md` / `markdown`, `sh` / `bash`, `xml`

## Output

Prints a complete `<pre><code class="hljs {lang}">…</code></pre>` block to stdout, with `<br>` tags instead of newlines — a single line suitable for embedding directly in HTML.

Input is automatically beautified before highlighting, so you can pass minified code.

## Workflow for Updating Doc Code Samples

1. Capture the highlighted block to a file or shell variable:

   ```bash
   HL=$(cat <<'EOF' | npx kempo-highlightcode xml
   <k-table id=myExample></k-table>
   <script type=module>
     doSomething('foo');
   </script>
   EOF
   )
   ```

2. Use the **Edit tool** to replace the existing `<pre><code class="hljs xml">…</code></pre>` block in the target page with `$HL`. Do not use `sed` or shell-based file editing — Edit handles escaping correctly.

   - Read the file first to find the exact `old_string` to replace.
   - If the page has multiple `<pre><code>` blocks, include enough surrounding context in `old_string` to make it unique.

## Important Notes

- Use **single-quotes** for JS string literals inside the code. This preserves all quoting correctly through to node.
- HTML attribute values can be **unquoted** in the argument (`id=foo` not `id="foo"`) — the beautifier adds consistent formatting anyway.
- When piping multi-line code, use a **quoted heredoc** (`<<'EOF'`) so the shell does not interpolate `$`, backticks, or backslashes inside the code.
- Output uses `<br>` instead of `\n`, keeping the block on one line in the HTML source.
