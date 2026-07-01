---
name: code-highlight
description: Generates syntax-highlighted HTML for documentation code samples. USE THIS instead of hand-writing <pre><code class="hljs ..."> blocks or creating temporary scripts. Run via `npx kempo-highlightcode <lang>` with code piped on stdin.
---

# Highlight Code

## When to Use

Use this skill whenever you need syntax-highlighted HTML to embed in a documentation page — for example, when adding or updating a `<pre><code class="hljs ...">` block in a `docs-src/components/*.page.html` file. **Do not hand-write the highlighted markup, and do not create temporary scripts to do this.**

> Source files live in `docs-src/` and are rendered to `docs/` by the kempo-server templating system. Always edit the `*.page.html` source — never the generated `docs/*.html`.

## Usage

Pipe code via stdin (supports multi-line):

**bash / zsh:**
```bash
cat <<'EOF' | npx kempo-highlightcode <lang>
<div class='container'>
  <h1>Hello</h1>
</div>
EOF
```

**PowerShell:**
```powershell
@"
<div class='container'>
  <h1>Hello</h1>
</div>
"@ | npx kempo-highlightcode <lang>
```

Or pass minified code as an argument (works in any shell):
```bash
npx kempo-highlightcode <lang> "<div class='container'><h1>Hello</h1></div>"
```

**Supported languages:** `html`, `css`, `js` / `javascript`, `ts` / `typescript`, `json`, `md` / `markdown`, `sh` / `bash`, `xml`

## Output

Prints a complete `<pre><code class="hljs {lang}">…</code></pre>` block to stdout, with `<br>` tags instead of newlines — a single line suitable for embedding directly in HTML.

Input is automatically beautified before highlighting, so you can pass minified code.

## Workflow for Updating Doc Code Samples

1. Capture the highlighted block to a shell variable (or a temp file):

   **bash / zsh:**
   ```bash
   HL=$(cat <<'EOF' | npx kempo-highlightcode xml
   <k-table id=myExample></k-table>
   <script type=module>
     doSomething('foo');
   </script>
   EOF
   )
   ```

   **PowerShell:**
   ```powershell
   $hl = @"
   <k-table id=myExample></k-table>
   <script type=module>
     doSomething('foo');
   </script>
   "@ | npx kempo-highlightcode xml
   ```

2. Replace the existing `<pre><code class="hljs xml">…</code></pre>` block in the documentation page with the new value:
   - **In an editor / Claude Edit tool / VS Code Copilot edit:** find the existing `<pre><code class="hljs xml">…</code></pre>` block and replace it. This handles escaping correctly.
   - **In PowerShell scripts** (legacy): use `[System.IO.File]::ReadAllText` + `.Replace()` (not `-replace`) to avoid regex interpretation:
     ```powershell
     $path = Resolve-Path 'docs-src/components/my-component.page.html'
     $html = [System.IO.File]::ReadAllText($path)
     $old = [regex]::Match($html, '(?s)<pre><code class="hljs xml">.*?</code></pre>').Value
     [System.IO.File]::WriteAllText($path, $html.Replace($old, $hl))
     ```

## Important Notes

- Use **single-quotes** for JS string literals inside the code. This preserves all quoting correctly through to node.
- HTML attribute values can be **unquoted** in the argument (`id=foo` not `id="foo"`) — the beautifier adds consistent formatting anyway.
- When piping multi-line code in bash/zsh, use a **quoted heredoc** (`<<'EOF'`) so the shell does not interpolate `$`, backticks, or backslashes inside the code. PowerShell here-strings (`@"…"@`) handle this without extra quoting.
- If a page has multiple `<pre><code>` blocks, include enough surrounding context in your replace target to make the match unique (e.g. include the nearby `<h3>` or `<k-card label="HTML">` wrapper).
- The beautifier handles indentation and formatting automatically.
- Output uses `<br>` instead of `\n`, keeping the block on one line in the HTML source.
