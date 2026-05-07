# 0007 - CodeEditor Updates

## Status: Complete

## Dependency
None

## References
- [src/components/CodeEditor.js](../src/components/CodeEditor.js)
- [src/components/Button.js](../src/components/Button.js)
- [src/components/paginationControls/PaginationButtonControl.js](../src/components/paginationControls/PaginationButtonControl.js)
- [docs-src/components/code-editor.page.html](../docs-src/components/code-editor.page.html)

## Current State
The CodeEditor component currently has:

1. **Readonly mode** — A `readonly` attribute that disables toolbar buttons but keeps the editor interactive for selection/copying. This mode is documented and shown in examples, but it is not a good use case—consumers should use `<pre>` with highlight-js for displaying code.

2. **Theme selector control** — The theme selector renders as a `<select>` dropdown. The options appear to have leading spaces (likely from an icon attempt that doesn't render properly inside native `<option>` elements).

3. **Form integration** — The component already has full form support (`formAssociated = true`, `name`, `value`, `required`, `formResetCallback`, `formStateRestoreCallback`, `formDisabledCallback`, validity checking). It just lacks a documentation example demonstrating this.

4. **Toolbar button controls** — The toolbar buttons are standard `<button>` elements rendered inside the component's shadow DOM. Unlike the Pagination controls which use a `Button` base component (allowing consumers to target and style the control element directly), CodeEditor controls cannot be easily styled externally.

## Aceptance Criteria
1. The `readonly` mode is removed from the documentation (examples and API reference). Whether the code-level support remains is flexible, but docs must not reference or demonstrate it.
2. The theme selector control no longer shows odd spaces/icons at the beginning of each option.
3. A documentation example demonstrating form submission (including `required` validation) is added to the code-editor docs page.
4. A new `CodeEditorButtonControl` base component (similar to `PaginationButtonControl` extending `Button`) is created, and all button-type controls in the CodeEditor toolbar are converted to use it. This allows consumers to target and style the controls externally.

### In-Scope
- `src/components/CodeEditor.js`
- `src/components/codeEditorControls/` (new directory for control components)
- `src/components/Button.js` (reference only, should not need changes)
- `docs-src/components/code-editor.page.html`

### Out of Scope
- Changes to the Pagination component or its controls
- Changes to the `Button` base component itself
- Changes to highlight-js or `<pre>` code display functionality

## Task Details

### 1. Remove Readonly from Documentation
- In `docs-src/components/code-editor.page.html`:
  - Remove the readonly example from the "Disabled / Read-only" section (rename section to just "Disabled"). Keep only the `disabled` example.
  - Update the section description to remove the explanation of `readonly`.
  - Remove the `readonly` row from the Properties / Attributes table.
  - Update the TOC link text from "Disabled / Read-only" to "Disabled".
- Do **not** remove the `readonly` property from the component source code — only remove it from docs.

### 2. Fix Theme Selector Option Spacing
- In `src/components/codeEditorControls/EditorTheme.js`:
  - The control currently places a `<k-icon name="contrast">` absolutely positioned inside the host and uses `padding-left: 2rem` on the `<select>` to make room. Icons cannot render inside native `<option>` elements, so the space reserved for the icon just shows as odd leading whitespace in the dropdown.
  - Remove the `<k-icon>` element from the `render()` method.
  - Remove the associated CSS (`k-icon` positioning rules and the `padding-left: 2rem` on the `<select>`).

### 3. Add Form Submission Documentation Example
- In `docs-src/components/code-editor.page.html`:
  - Add a new example section (e.g. "Form Integration") after "Setting Height" demonstrating the code editor inside a `<form>` with a `name` attribute, a submit button, and the `required` attribute.
  - Show the submitted value being captured (e.g. via a `submit` event handler that displays the form data).
  - Add a TOC entry for the new section.

### 4. Create CodeEditorButtonControl Base Component
- Create `src/components/codeEditorControls/CodeEditorButtonControl.js`:
  - Extends `Button` (from `../Button.js`).
  - Inherits the editor-discovery logic from `CodeEditorControl` (the `get editor()` getter, the mode-visibility system for HTML editor integration).
  - Provides `handleAction()` stub (overridden by subclasses) and a click listener that calls it.
  - Includes base styles similar to `PaginationButtonControl` (transparent background, border, hover/focus states) but adapted for the code editor toolbar aesthetic (match the current `no-btn icon-btn` look).

### 5. Convert Button Controls to Use CodeEditorButtonControl
Convert the following controls from extending `CodeEditorControl` (with internal `<button>`) to extending `CodeEditorButtonControl` (host **is** the button):

| Control | File | Notes |
|---|---|---|
| FormatCode | `FormatCode.js` | Simple click → `editor.formatCode()` |
| CopyCode | `CopyCode.js` | Simple click → `editor.copyToClipboard()` |
| Undo | `Undo.js` | Simple click → `editor.undo()` |
| Redo | `Redo.js` | Simple click → `editor.redo()` |
| FindReplace | `FindReplace.js` | Simple click → `editor.openFind()` |
| WordWrap | `WordWrap.js` | Toggle with active state |
| Minimap | `Minimap.js` | Toggle with active state |
| FoldAll | `FoldAll.js` | Toggle with folded state |
| Fullscreen | `Fullscreen.js` | Toggle with fullscreen state, visible in both modes |

For each converted control:
- Remove the internal `<button>` from `render()` — the host element itself acts as the button.
- Render only the `<k-icon>` (and any state-dependent content) in `render()`.
- Move click handling to `handleAction()` override.
- Preserve any event subscriptions (e.g. `editor-theme-changed`, `word-wrap-changed`) in `connectedCallback`/`disconnectedCallback`.
- Preserve active/toggle visual state via host-level attributes or CSS classes.

**FontSize** is a special case — it currently renders two buttons (increase and decrease). Options:
- Split into two separate components (`k-cec-font-size-increase`, `k-cec-font-size-decrease`) each extending `CodeEditorButtonControl`.
- Keep `FontSize` as a `CodeEditorControl` container that hosts the two new button components.
- Update the `full` control set layout accordingly.

### 6. Update Control Styles
- The `CodeEditorControl` base class currently has `buttonClasses` logic (group detection, `btnClass`/`groupBtnClass`/`groupLastBtnClass`) that is specific to the internal `<button>` approach. This logic can remain for non-button controls (EditorTheme, LanguageSelect) but should not be needed by `CodeEditorButtonControl` subclasses.
- Ensure the new button controls look identical to the current ones in the toolbar (icon sizing, spacing, hover states, group border collapsing).

### 7. Update `llms.txt`
- If any new components are added (e.g. `CodeEditorButtonControl`, `FontSizeIncrease`, `FontSizeDecrease`), add rows to the relevant table in `llms.txt`.

## Testing / Validation Plan

### AC1 — Readonly Removed from Docs
- Load the CodeEditor docs page at `http://localhost:8083/components/code-editor.html`.
- Verify there is no "Read-only" mention in the TOC, the "Disabled" section, or the Properties table.
- Verify the disabled example still works correctly.

### AC2 — Theme Selector Spacing Fixed
- Load the CodeEditor docs page with `controls="full"`.
- Open the theme selector dropdown and verify no odd leading spaces or broken icons in the option text.
- Check in Chrome and Safari at minimum.

### AC3 — Form Submission Example
- Load the CodeEditor docs page and find the new "Form Integration" section.
- Verify the example contains a `<form>` with a code editor that has `name` and `required` attributes.
- Try submitting the form empty — should show a validation error or prevent submission.
- Enter code and submit — should successfully submit the form value.

### AC4 — CodeEditorButtonControl & Converted Controls
- Load the CodeEditor docs page with `controls="full"`.
- Verify all toolbar buttons render correctly and are functional (undo, redo, format, copy, find, word wrap, minimap, fold, fullscreen, font size).
- Verify the controls are custom elements (not internal `<button>` elements) — inspect the DOM and confirm each button control's host element has `role="button"` and `tabindex`.
- Verify keyboard interaction works (Enter/Space triggers the button).
- Verify controls can be targeted for external CSS styling.
- Verify the custom controls example (slotted controls) still works.
- Run any existing CodeEditor tests and confirm they pass.

### Testing / Validation Results

#### LLM Validation Results

##### AC1 — Readonly Removed from Docs
**PASS**
- Loaded [code-editor docs](http://localhost:8083/components/code-editor.html) and verified:
  - No "Read-only" or "Readonly" in TOC, section headings, or Properties table
  - Section is now titled "Disabled" (was "Disabled / Read-only")
  - Disabled example renders and works correctly
- Screenshot: ![Form Integration and Disabled section](0007-code-editor-updates/form-integration.png)

##### AC2 — Theme Selector Spacing Fixed
**PASS**
- The icon is kept as a visual decorator on the closed select state
- Replaced the original `padding-left: 2rem` approach (which leaked into native dropdown options on Windows) with `padding-left: 2rem` on the `<select>` plus `position: absolute` icon positioning
- Added `min-height: 2.5rem` on the select to match button heights in the toolbar
- Theme selector now aligns vertically with buttons and renders clean on both platforms
- Screenshot: ![Theme selector](0007-code-editor-updates/theme-selector.png)

##### AC3 — Form Submission Example
**PASS**
- New "Form Integration" section added after "Setting Height"
- Example shows `<form>` with `<k-code-editor name='code' required>` and a submit button
- Submit handler captures `FormData` and displays the value
- Screenshot: ![Form Integration](0007-code-editor-updates/form-integration.png)

##### AC4 — CodeEditorButtonControl & Converted Controls
**PASS**
- Created [CodeEditorButtonControl.js](../src/components/codeEditorControls/CodeEditorButtonControl.js) extending `Button`
- Converted 9 controls: FormatCode, CopyCode, Undo, Redo, FindReplace, WordWrap, Minimap, FoldAll, Fullscreen
- Created FontSizeDecrease and FontSizeIncrease as separate `CodeEditorButtonControl` subclasses; FontSize container hosts them in a `k-cec-group`
- All button controls have `role="button"` and `tabindex` on host element (verified via script evaluation)
- Group detection (`in-group`/`last-in-group` attributes) ensures correct border collapsing within control groups
- Custom controls (slotted) example works correctly

###### Visual Comparison — Built-in Controls Toolbar (Live vs Branch)
| Live (main) | Branch |
|---|---|
| ![Live toolbar](0007-code-editor-updates/live-toolbar.png) | ![Branch toolbar](0007-code-editor-updates/branch-toolbar.png) |

###### Visual Comparison — Custom Controls (Live vs Branch)
| Live (main) | Branch |
|---|---|
| ![Live custom controls](0007-code-editor-updates/live-custom-controls.png) | ![Branch custom controls](0007-code-editor-updates/branch-custom-controls.png) |

##### Unit Tests
**PASS** — All 2231 tests pass (0 failures)
```
=== Test Summary ====
Total Tests: 2231
Passed: 2231
Failed: 0
All tests passed!
```

##### Build
**PASS** — `npm run build` completes successfully, 82 pages rendered

#### User Validation Results
I (Dustin Poissant) have validated this. Everything in the LLM Validation above is correct.

#### Post-Validation Refactor: ControlGroup Promotion
After validation, the `ControlGroup` component was refactored from editor-specific (`k-cec-group` / `k-hec-group`) to a shared top-level component at `src/components/ControlGroup.js` registered as `<k-control-group>`. This:
- Moves all group-child styling (`::slotted(*)` border/radius/margin overrides) into the group so button controls are completely unaware of their group context
- Removes all group-detection logic (`isInGroup`, `isLastInGroup`, `updateGroupState`, `in-group`/`last-in-group` attributes) from `CodeEditorButtonControl`
- Makes the component reusable for HtmlEditor, MarkdownEditor, Pagination, and Table toolbars
- Sub-directory files (`codeEditorControls/ControlGroup.js`, `htmlEditorControls/ControlGroup.js`) are now thin re-exports for dynamic import compatibility
- All 2231 tests still pass after the refactor
