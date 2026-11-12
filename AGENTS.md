# Code Contribution Guidelines

## Project Structure

 - All code should be in the `src/` directory, with the exception of npm scripts.
 - All components should be in the `src/components/` directory.
 - All utility function module files should be in the `src/utils/` directory.
 - All documnentation should be in the `docs/` directory. This directory is used by GitHub as the "GitHub Pages", so all links need to be relative, and there will be a build script which copies all code to the `docs/` directory.
 - Documentation source files (templates, fragments, page files) are in the `docs-src/` directory. These use the kempo-server v3 templating system and are pre-rendered to `docs/` during build.
 - Each component and utility has a small plain-text doc (`docs-src/components/<name>.txt`, `docs-src/utils/<name>.txt`) next to its docs page, and `docs-src/overview.txt` lists what each is for. The build copies them to `docs/` so an LLM can read just the one it needs. **Keep them up to date** when a component or utility changes.
 - `llms.txt` in the root is the consumer-facing LLM reference for this library. **Keep it up to date**: when adding a new component or utility, add a row to the relevant table in `llms.txt`.
 
## Form Components

Any component that holds a value the user enters (an input, select, toggle, picker, list, editor) is form-associated and supports `readonly`.

 - `static formAssociated = true`, `this.internals = this.attachInternals()`, and `setFormValue` whenever the value changes (`null` for no value, a `FormData` for several values).
 - `name` (reflected) submits the value. `required` reports `valueMissing` through `setValidity`, anchored to a focusable element.
 - `formResetCallback` restores the value from when the element was added, `formStateRestoreCallback` restores a saved state, and `formDisabledCallback` mirrors a disabled `<fieldset>`.
 - `readonly` (reflected) blocks every user path (clicks, keys, drops, typing, change events) but keeps the value in the form and in the tab order. Programmatic changes are not blocked, the same as `disabled`.
 - Native `select`, `checkbox`, `radio` and `color` inputs ignore `readonly`. Give a select or checkbox both `disabled` and `readonly` (kempo-css styles that pair as read only), and disable a color input while readonly.
 - Test the readonly and form behaviour in `tests/components/<Name>.browser-test.js`, and document it in the component's page, its `.txt`, its `llms.txt` row and `docs-src/overview.txt`.

## Dependencies

 - [Kempo-CSS](https://raw.githubusercontent.com/dustinpoissant/kempo-css/refs/heads/main/llms.txt) - Injected into the shadow root of all components extending ShadowCompoentn or Hybrid Component. Do not assume bootstrap styles, some may be similar, but these are not compatible with bootstrap, read the docs.
   - It is a **dev dependency**, so a site that installs only kempo-ui does not get it: `ShadowComponent` falls back to the jsdelivr CDN (`kempo-css@2`) unless `window.kempo.pathToStylesheet` is set.
   - The docs use the installed copy: `npm run build` copies `node_modules/kempo-css/dist/kempo.min.css` to `docs/kempo.min.css` and writes `docs/init.js`, which sets `pathToStylesheet` to it (both docs templates load `init.js`). The dev server (`docs-src/.config.js`) routes `kempo.min.css` to `node_modules/kempo-css/dist/kempo.min.css` and `init.js` to `docs/init.js`. Do not pass `--config` to `npm run dev`: it is resolved from the root and the server finds `docs-src/.config.js` on its own.
   - After updating it, run `npm run build` so `docs/kempo.min.css` matches.
 - [Kempo-TestingFramework](https://raw.githubusercontent.com/dustinpoissant/kempo-testing-framework/refs/heads/main/llm.txt) - Used to create and run tests inside the `tests` directory. Do not assume you know the syntax, read the docs.
 - [Kempo-Server](https://raw.githubusercontent.com/dustinpoissant/kempo-server/refs/heads/main/llm.txt) - A node server with file-based routing and robust configution options, this is used to run the docs servers.

## Coding Style Guidelines

### Code Organization
Use multi-line comments to separate code into logical sections. Group related functionality together.
  - Example: In Lit components, group lifecycle callbacks, event handlers, public methods, utility functions, and rendering logic separately.

```javascript
/*
  Lifecycle Callbacks
*/
```

### Avoid single-use variables/functions
Avoid defining a variable or function to only use it once; inline the logic where needed. Some exceptions include:
  - recursion
  - scope encapsulation (IIFE)
  - context changes

### Minimal Comments, Empty Lines, and Spacing

Use minimal comments. Assume readers understand the language. Some exceptions include:
  - complex logic
  - anti-patterns
  - code organization

Do not put random empty lines within code; put them where they make sense for readability, for example:
  - above and below definitions for functions and classes.
  - to help break up large sections of logic to be more readable. If there are 100 lines of code with no breaks, it gets hard to read.
  - above multi-line comments to indicate the comment belongs to the code below

No  empty lines in css.

End each file with an empty line.

End each line with a `;` when possible, even if it is optional.

Avoid unnecessary spacing, for example:
  - after the word `if`
  - within parentheses for conditional statements

```javascript
let count = 1;

const incrementOdd = (n) => {
  if(n % 2 !== 0){
    return n++;
  }
  return n;
};

count = incrementOdd(count);
```

### Prefer Arrow Functions
Prefer the use of arrow functions when possible, especially for class methods to avoid binding. Use normal functions if needed for preserving the proper context.
 - For very basic logic, use implicit returns
 - If there is a single parameter, omit the parentheses.
```javascript
const addOne = n => n + 1;
```

### Module Exports
  - If a module has only one export, use the "default" export, not a named export.
    - Do not declare the default export as a const or give it a name; just export the value.

```javascript
export default (n) => n + 1;
```
  - If a module has multiple exports, use named exports and do not use a "default" export.

### Code Reuse
Create utility functions for shared logic.
  - If the shared logic is used in a single file, define a utility function in that file.
  - If the shared logic is used in multiple files, create a utility function module file in `src/utils/`.

### Naming
Do not prefix identifiers with underscores.
  - Never use leading underscores (`_`) for variable, property, method, or function names.
  - Use clear, descriptive names without prefixes.
  - When true privacy is needed inside classes, prefer native JavaScript private fields (e.g., `#myField`) instead of simulated privacy via underscores.

## Controls (`kc-*`)

Applies to every control in `src/components/controls/` and to any new one: toolbar buttons, inputs, selects, popup triggers, the video/audio controls, and so on.

### Height: 40px, unless told otherwise
 - Every control is **40px tall** by default. This comes from the `--control_height` custom property (`var(--control_height, 40px)`), already applied by the `Control` base class, so a control that extends `Control` or `ButtonControl` gets it for free.
 - Do not hard-code a different height (`2rem`, `1.5rem`, `24px`, ...) on a control, and do not add a smaller `min-height`. Size any inner part from the same variable so the visible element fills the control: an input or select stretches (the base already does this), and a trigger button inside a bordered host is `calc(var(--control_height, 40px) - 2px)`.
 - Only deviate when the user explicitly says so for that control (for example a list such as `kc-audio-playlist`, the canvas `kc-audio-visualizer` sized by `--visualizer_height`, or the big play overlay `kc-vid-play-big`). When you do, set `height: auto` on its `:host` and say why in the reply.
 - The `--control_height` variable is also how consumers resize every control at once, so never replace it with a fixed value.
 - Verify a new control on the docs page: its host, and any input, select or button inside it, should measure 40px.
 - Rows inside a menu (`in-menu`) are the exception to the 40px rule; the base class handles their height.

### Preconfigured control sets
 - The `controls="minimal|normal|full"` sets of `k-html-editor`, `k-code-editor`, `k-markdown-editor`, `k-audio`, `k-video`, `k-pagination` and `k-table` put their controls in a `<k-control-bar>` (left in the default slot, `slot="center"`, `slot="right"`), so they collapse into the "more" menu on narrow screens. Follow the existing pattern: the set is the fallback content of the widget's toolbar slot, and `Control.load` imports the control modules.
 - Rank the controls with `priority="n"` (0 by default; higher stays in the bar longer): what people use constantly gets 2-3 (bold/italic, undo/redo, lists, links, prev/next page), occasional ones 1, rarely used ones 0. A play button gets a very high priority (10). Never-hide controls get `no-collapse`, such as a media seek bar. Menus (`kc-menu`) and groups never need either: menus never move, a `k-control-group` moves as one unit.
 - A widget whose toolbar region shrinks to fit its content needs `:host([has-control-bar]) .region { flex: 1 1 0; min-width: 0 }` so the bar can fill it; the bar sets `has-control-bar` on its widget.

### Menu text
 - A control with only an icon must also fill the `menu-text` slot with its label, after the default slot: `<slot><k-icon name="..."></k-icon></slot><slot name="menu-text">Label</slot>`. It is hidden except while the control is in a menu (`in-menu` attribute, set by `kc-menu` and `k-control-bar`). Use the same text as the control's `title`, and make it follow the control's state when the icon does (play/pause, mute/unmute).
 - Controls whose trigger is a popup (a `.trigger` button) put the `menu-text` slot inside that button, after the icon.

## Template and File Structure Rules

### Follow Templates Exactly
When using templates (task templates, component scaffolds, etc.), follow them **exactly as written**. Do not:
- Add placeholder text or instructions to sections marked "leave blank"
- Deviate from the template structure
- Make creative changes or improvements to the template format
- Add commentary or helper text beyond what is explicitly requested

### Task Validation Result Sections - Critical Rules
Task files have two validation sections that follow specific timing rules:

**LLM Validation Results** (fill during step 6: task-validate)
- **Leave blank** during task-create and task-prepare skills
- **Fill in completely** during task-validate skill with:
  - Subheading for each acceptance criterion tested
  - Subheading for each testing plan item
  - Pass/fail status with supporting evidence/screenshots
  - At least one screenshot for visual changes

**User Validation Results** (optionally filled by user during step 7)
- **Always leave completely blank** — the user may optionally add notes here if they have additional information beyond what was documented in LLM Validation Results
- Never add placeholder text, never auto-fill this section

## Development Workflow

### Local Development Server
- **DO NOT** start a development server - one is already running
- Default port: **8083**
- Base URL: `http://localhost:8083`
- Documentation URLs follow the directory/file structure in `docs-src/` (e.g., source `docs-src/components/color-picker.page.html` → URL `http://localhost:8083/components/color-picker.html`). Edit the `*.page.html` source — never the generated `docs/` output.
- Use this server for all testing and verification

### Testing and Verification
- **ALWAYS** verify changes using the live documentation on the running server
- Use Chrome DevTools Protocol (chrome-devtools-mcp) for interactive testing
- **DO NOT** create one-off test files or framework-less tests
- Test components in their natural documentation environment
- Validate both functionality and visual appearance
- **ALL tests must pass — ZERO failures are acceptable.** If a test fails after a change, fix it immediately. There are no "pre-existing failures" in this project.

### Building
The docs use the kempo-server v3 templating system. Source files are in `docs-src/` using `.page.html`, `.template.html`, and `.fragment.html` files. For development, `npm run dev` starts kempo-server with SSR (server-side rendering) from `docs-src/`, so page changes are reflected on refresh without rebuilding. Static assets (CSS, media, manifest) live in `docs/` and are served via customRoutes during dev. For production, `npm run build` minifies JS, copies icons, and pre-renders all pages from `docs-src/` to `docs/`.
