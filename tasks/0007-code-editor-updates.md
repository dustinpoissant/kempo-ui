# 0007 - Unified Control Architecture

## Status: Planning

## Dependency
None

## References
- [src/components/Button.js](../src/components/Button.js)
- [src/components/ControlGroup.js](../src/components/ControlGroup.js)
- [src/components/codeEditorControls/](../src/components/codeEditorControls/)
- [src/components/htmlEditorControls/](../src/components/htmlEditorControls/)
- [src/components/markdownEditorControls/](../src/components/markdownEditorControls/)
- [src/components/tableControls/](../src/components/tableControls/)
- [src/components/paginationControls/](../src/components/paginationControls/)

## Current State
Each "controllable" host component (CodeEditor, HtmlEditor, MarkdownEditor, Table, Pagination) has its own dedicated control directory and base class hierarchy:

- `codeEditorControls/` — `CodeEditorControl`, `CodeEditorButtonControl extends Button` (recently refactored).
- `htmlEditorControls/` — `HtmlEditorControl`, `DropdownControl extends HtmlEditorControl`. ~20 subclasses each render an internal `<button>` with `this.buttonClasses` and call methods like `this.editor.bold()`.
- `markdownEditorControls/` — `MarkdownEditorControl`. Subclasses render internal `<button>` with `btnClass`.
- `tableControls/` — `TableControl`. Subclasses render internal `<button class="no-btn icon-btn">` and call methods on `this.table`.
- `paginationControls/` — `PaginationControl`, `PaginationButtonControl extends Button`.

Problems with the current architecture:
1. **Duplication of base logic** — Every control directory reimplements editor/host discovery, button click wiring, hidden-state propagation, and group detection.
2. **Duplication of behavior** — `Bold` only exists for HtmlEditor even though MarkdownEditor needs the exact same control. `WordWrap`/`FindReplace` exist only for CodeEditor even though HtmlEditor in code-mode could use them. `CopyCode` could work for any host that exposes a `copyToClipboard` method.
3. **Tight coupling** — Each control hardcodes its host tag (`K-CODE-EDITOR`, `K-HTML-EDITOR`, etc.), making cross-host reuse impossible.
4. **Many `static styles` duplications** — Recently cleaned up, but the underlying base-class fragmentation invites the duplication to creep back.

## Aceptance Criteria
1. **Controllable host pattern**: Any component intended to host controls (CodeEditor, HtmlEditor, MarkdownEditor, Table, Pagination, and any future component) automatically sets a `controlled` attribute on itself in `connectedCallback`. Consumers do **not** need to add this attribute manually.
2. **Single merged controls directory**: All controls live in `src/components/controls/`. The per-host directories (`codeEditorControls/`, `htmlEditorControls/`, `markdownEditorControls/`, `tableControls/`, `paginationControls/`) are removed.
3. **Three base classes**:
   - `Control` — base for any control (replaces all per-host base controls). Provides `closest('[controlled]')` host discovery, hidden-state handling, and `control_visibility_change` event dispatch.
   - `ButtonControl extends Control` (and extends `Button` semantics) — for clickable controls. Host element IS the button.
   - `ControlMenu extends Control` — for dropdown-style controls (replaces `DropdownControl`).
4. **Auto-disable when host doesn't support the action**: Each control declares which method(s) it calls on its host. If `closest('[controlled]')` returns a host that does not implement those methods, the control disables itself (sets `disabled` and shows in disabled state). Example: dropping `<k-control-bold>` inside `<k-table>` shows a disabled bold button rather than throwing.
5. **Cross-host reusability via shared controls**: Controls that have the same semantics across hosts are unified into one component. Examples (non-exhaustive):
   - `<kc-bold>` works in HtmlEditor and MarkdownEditor
   - `<kc-italic>`, `<kc-underline>`, `<kc-strikethrough>` — same as above
   - `<kc-undo>`, `<kc-redo>` — work in CodeEditor, HtmlEditor, MarkdownEditor
   - `<kc-copy>` — works in CodeEditor, HtmlEditor, MarkdownEditor
   - `<kc-word-wrap>` — works in CodeEditor and HtmlEditor (code mode)
   - `<kc-find-replace>` — works in CodeEditor and HtmlEditor (code mode)
   - `<kc-fullscreen>` — works in any host that supports a fullscreen toggle
6. **Tag naming**: All controls use the prefix `kc-*` ("kempo control"). This fully replaces the old `k-cec-*`, `k-hec-*`, `k-mec-*`, `k-tc-*`, `k-pg-*` prefixes. The project is in beta — no backward-compatibility aliases are required; old tags are simply removed.
7. **Preconfigured control set helper**: Hosts ship with a small set of named preset configurations (e.g. `controls="full"`, `controls="minimal"`). These presets are defined in code as Lit tagged-template-literal HTML fragments (e.g. `` html`<kc-bold></kc-bold><kc-italic></kc-italic>...` ``). A shared helper parses the template, discovers which `<kc-*>` tags it references, and dynamically imports the matching modules from `src/components/controls/` before rendering. This replaces the current per-editor `loadControls()` duplication.
8. **Mode-aware visibility preserved**: Controls that only make sense in a specific host mode (e.g., text-formatting controls in HtmlEditor visual mode, code-only controls in code mode) hide themselves automatically based on the host's mode events.
9. **No regressions**: Existing demo pages (`docs-src/components/code-editor.page.html`, `html-editor.page.html`, `markdown-editor.page.html`, `table.page.html`, `pagination.page.html`) work identically after the refactor — visually and functionally.
10. **Documentation updated**: `docs-src/` pages and `llms.txt` are updated to reflect the new tag names and the unified architecture.
11. **All tests pass**: 0 test failures across the suite.

### In-Scope
- `src/components/controls/` (new merged directory)
- `src/components/CodeEditor.js`, `HtmlEditor.js`, `MarkdownEditor.js`, `Table.js`, `Pagination.js` — add auto-set `controlled` attribute and ensure they expose the methods controls need to invoke
- `src/components/Button.js`, `ControlGroup.js` — reference, may need minor adjustments
- All files in `codeEditorControls/`, `htmlEditorControls/`, `markdownEditorControls/`, `tableControls/`, `paginationControls/` — to be migrated and removed
- `docs-src/components/*.page.html` — update tag names
- `llms.txt`
- Tests covering controls

### Out of Scope
- Changes to non-control components (Dropdown, Icon, etc.) beyond what's required for the new bases
- Changes to highlight-js or `<pre>` code display
- Adding net-new controls (only consolidate existing behavior)
- Visual redesign — the post-refactor toolbars should look the same as before

## Task Details
{To be filled in during task-prepare. Will need to define:
- Exact API for `Control`, `ButtonControl`, `ControlMenu` base classes
- Method-existence check mechanism (declared on the control class via a static property listing required methods? duck-typed at click time? something else?)
- Migration order — which host's controls to migrate first
- Implementation details for the control-loading helper:
  - Function signature (e.g. `loadControlsFromTemplate(htmlResult)` returning a Promise)
  - How to extract tag names from a Lit `TemplateResult` (walk the `strings` array with a regex for `<kc-[a-z-]+`?)
  - How tag → module path mapping works (kebab-case → PascalCase filename in `src/components/controls/`)
  - Whether preset configurations are also stored as Lit templates or as plain strings parsed by the same helper
- How `ControlGroup` interacts with the new bases (should remain unchanged)
- Confirm full removal of old prefixed tags (no aliases) and that all docs/tests reference only the new tags}

## Testing / Validation Plan
{To be filled in during task-prepare. Should cover:
- Each acceptance criterion individually
- Visual regression for each affected demo page (toolbar appearance unchanged)
- Functional regression for each editor's controls (bold still bolds, undo still undoes, etc.)
- Cross-host reuse: e.g. drop a `<k-control-bold>` into MarkdownEditor and verify it works; drop one into Table and verify it shows as disabled
- Group detection still works (`<k-control-group>` still collapses borders correctly)
- All existing unit tests pass}

### Testing / Validation Results

#### LLM Validation Results

#### User Validation Results
