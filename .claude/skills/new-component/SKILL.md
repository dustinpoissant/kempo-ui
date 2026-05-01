---
name: new-component
description: Creates a new Kempo UI web component end-to-end — choosing the right base class, writing the source file, registering the custom element, adding the docs page, wiring up the nav/index/llms.txt, AND writing tests. Use any time you are asked to create a new component or add a new custom element.
---

# New Component

## When to Use

Use this skill any time you are asked to create a new component or add a new custom element to the project.

---

## Overview

Creating a component involves six steps. Do not skip steps — especially the tests.

1. **Choose the base component** — pick the right rendering strategy
2. **Write the source file** in `src/components/` (also registers the custom element)
3. **Read the templating primer** so the docs page is structured correctly
4. **Add the documentation page** in `docs-src/components/` and wire up nav/index/llms.txt
5. **Write and run unit tests** in `tests/components/`
6. **Verify in the browser** at `http://localhost:8083`

---

## Step 1: Choose the Base Component

Three base classes are available. Pick based on rendering needs:

### `ShadowComponent`
Use when the component needs shadow DOM encapsulation. The base class automatically injects the kempo-css stylesheet into the shadow root. **This is the default for most components.**

```javascript
import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

export default class MyComponent extends ShadowComponent {
  render() {
    return html`<p>Shadow DOM content with scoped styles</p>`;
  }
}
```

### `LightComponent`
Use when the component renders to the light DOM (no encapsulation, inherits page styles). Override `renderLightDom()`.

### `HybridComponent`
Use when the component needs both a shadow DOM portion and a light DOM portion (e.g. slotted children that also need managed light DOM output). Override both `render()` and `renderLightDom()`.

**Important:** Always call `super.updated(...)` when overriding `updated()` in any base class.

---

## Step 2: Write the Source File

Create `src/components/MyComponent.js`. Follow these conventions (also see [AGENTS.md](../../AGENTS.md)):

- Use multi-line comments to separate logical sections: `Lifecycle Callbacks`, `Event Handlers`, `Public Methods`, `Utility`, `Rendering`, `Styles`.
- Declare reactive properties with `static properties = { ... }` and initialize defaults in the constructor.
- Use `static styles = css\`...\`` for component-scoped CSS (shadow DOM only).
- Use **arrow functions** for class methods to avoid `.bind(this)`.
- For private fields use native JS private fields (`#field`) — never underscore-prefixed.
- For form-associated components: set `static formAssociated = true`, call `this.attachInternals()` in the constructor, and use `internals.setFormValue(...)` / `internals.setValidity(...)`.
- **Buttons inside the shadow DOM should have `class="no-btn"`** to opt out of kempo-css's default button styling. Add explicit `display: inline-flex; align-items: center; justify-content: center;` in the component CSS to keep content centered after stripping. The same applies to `class="no-style"` on selects/inputs if you need to fully opt out, but most form controls render fine with kempo-css defaults.

Example skeleton:

```javascript
import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

export default class MyComponent extends ShadowComponent {
  static properties = {
    value: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true }
  };

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.value = '';
    this.disabled = false;
  }

  /*
    Event Handlers
  */
  handleClick = () => {
    if(this.disabled) return;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true
    }));
  };

  /*
    Rendering
  */
  render() {
    return html`
      <button class="no-btn btn" ?disabled=${this.disabled} @click=${this.handleClick}>
        ${this.value}
      </button>
    `;
  }

  /*
    Styles
  */
  static styles = css`
    :host { display: inline-block; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacer_h) var(--spacer);
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
      background: var(--c_bg);
      color: var(--tc);
      cursor: pointer;
    }
  `;
}

customElements.define('k-my-component', MyComponent);
```

### Custom element naming
- All elements use the `k-` prefix (e.g. `k-spinner`, `k-color-picker`).
- Use kebab-case for multi-word names.
- The `customElements.define(...)` call goes at the **bottom** of the file, after the class.

---

## Step 3: kempo-server Templating Primer

The docs site is built with the **kempo-server v3 templating system**. Source files live in `docs-src/`; production pages are pre-rendered into `docs/` at build time. **Do not edit anything inside `docs/components/` directly — those files are generated.**

### File types

| Suffix | Purpose | Example |
|---|---|---|
| `*.page.html` | An individual page. Wraps content in `<page>` and fills template slots with `<content>` blocks. | `docs-src/components/slider.page.html` |
| `*.template.html` | Shared layout. Defines named slots with `<location>` and pulls in fragments with `<fragment name="..." />`. | `docs-src/default.template.html` |
| `*.fragment.html` | Reusable HTML partial. Included via `<fragment name="..." />` from templates or pages. | `docs-src/nav.fragment.html` |
| `*.global.html` | Site-wide content auto-injected into matching `<location>` tags across every page. | (none currently) |

### How a page renders

1. The `<page>` tag chooses a template (defaults to `default`, looked up upward from the page directory). For component docs that's `docs-src/default.template.html`.
2. Each `<content>` block in the page fills a `<location>` slot in the template:
   - `<content>` (no `location`) fills `<location />` (the unnamed default slot — body content).
   - `<content location="scripts">` fills `<location name="scripts" />` (`<script type="module">` tags at the end of `<body>`).
   - `<content location="header">` fills `<location name="header">` (overrides the default `<h1>` heading).
3. Page tag attributes become template variables: `<page pageName="Slider" title="...">` makes `{{pageName}}` and `{{title}}` available throughout the template.
4. The `<fragment name="nav" />` call in the template pulls in `docs-src/nav.fragment.html`, which renders the navbar and side menu.
5. Path variables: **`{{pathToRoot}}`** is the relative path back to `docs-src/` — use it for every asset reference. The renderer substitutes the correct number of `../` segments based on the page's depth. Other built-ins include `{{year}}`, `{{date}}`, `{{datetime}}`, `{{timestamp}}`, `{{version}}`, `{{env}}`.
6. Templates and fragments resolve **upward** from the referencing page directory (nearest match wins). Pages and globals scan **downward** (recursively).

### Conditionals and loops

The templating engine supports:
- `<if condition="..."> … </if>` with `===`, `!==`, `>`, `<`, `>=`, `<=`, `&&`, `||`, `!`
- `<foreach in="arrayName" as="item"> {{item.name}} </foreach>` with dot-path access

### Dev server

A dev server is already running on `http://localhost:8083` (started via `npm run dev`). It uses SSR for `docs-src/`, so your changes appear on refresh without a build. Static assets in `docs/` (CSS, media, manifest) are served via customRoutes. **Do not start another server.**

For production, `npm run build` minifies the JS, copies icons, and pre-renders all pages from `docs-src/` into `docs/`.

---

## Step 4: Add the Documentation Page

Create `docs-src/components/my-component.page.html`. Use an existing page (e.g. [`slider.page.html`](../../docs-src/components/slider.page.html), [`time.page.html`](../../docs-src/components/time.page.html)) as a structural reference. Recommended sections:

- A Table of Contents accordion at the top
- Examples (Basic Usage, Default Value, mode-specific examples, etc.)
- A `<h2 id="jsRef">JavaScript Reference</h2>` section covering: Constructor, Requirements, Properties, Methods, CSS Variables, Events
- Module script tags inside `<content location="scripts">`

```html
<page pageName="My Component" title="My Component - Components - Kempo Docs - A Web Components Solution">
  <content>
    <k-accordion persistent-id="toc" class="b r mb">
      <k-accordion-header for-panel="toc-panel">Table of Contents</k-accordion-header>
      <k-accordion-panel name="toc-panel">
        <!-- TOC links -->
      </k-accordion-panel>
    </k-accordion>

    <h3 id="basicUsage"><a href="#basicUsage" class="no-link">Basic Usage</a></h3>
    <!-- examples -->

    <h2 id="jsRef"><a href="#jsRef" class="no-link">JavaScript Reference</a></h2>
    <!-- properties / methods / events -->
  </content>
  <content location="scripts">
    <script type="module" src="{{pathToRoot}}src/components/MyComponent.js"></script>
    <script type="module" src="{{pathToRoot}}src/components/Accordion.js"></script>
    <script type="module" src="{{pathToRoot}}src/components/Card.js"></script>
  </content>
</page>
```

Use `{{pathToRoot}}` for any relative path (the templating system substitutes the correct `../` count per page depth).

### Code Samples in the Docs

For every `<pre><code class="hljs ...">` block, **use the highlight-code skill** to generate the markup. Do not hand-write the highlighted HTML — it is fragile and error-prone.

```bash
cat <<'EOF' | npx kempo-highlightcode xml
<k-my-component value="hello"></k-my-component>
EOF
```

Then paste the result into the page (Edit tool).

### Wire Up Nav, Index, and llms.txt

After creating the page, add the component in **four** places, all in alphabetical order:

#### 1. Search filter dropdown — [`docs-src/nav.fragment.html`](../../docs-src/nav.fragment.html)

Inside `<k-filter-list id="navSearchList">`, add a `<k-filter-item>`:

```html
<k-filter-item filter-keywords="my component mycomponent keywords here components"><a
    href="{{pathToRoot}}components/my-component.html"
  >My Component<br><small>Component</small></a></k-filter-item>
```

**WATCH OUT:** When using the Edit tool to insert a new filter-item, do **not** truncate the `<a` of the surrounding filter-item. The Edit tool's `old_string`/`new_string` boundaries must end on whole lines. Verify with Read after each edit.

#### 2. Sidebar menu link — same `nav.fragment.html`

Inside the `<menu>` block under `<h3>Components</h3>`, add an `<a>` tag in alphabetical order:

```html
<a href="{{pathToRoot}}components/my-component.html">My Component</a>
```

#### 3. Homepage card — [`docs-src/index.page.html`](../../docs-src/index.page.html)

Inside the `<div class="row -mx">` under `<h2>Components</h2>`, add a card in alphabetical order:

```html
<div class="span-12 t-span-6 d-span-4 px">
  <a href="{{pathToRoot}}components/my-component.html" class="card mb no-link d-b">
    <h3 class="tc-primary">My Component</h3>
    <p class="tc-muted">One-sentence description of what the component does.</p>
  </a>
</div>
```

#### 4. LLM reference — [`llms.txt`](../../llms.txt)

Add a row to the **Components** table (alphabetical by element name):

```markdown
| `<k-my-component>` | `MyComponent.js` | One-sentence description with key attributes and events | [my-component.html](https://dustinpoissant.github.io/kempo-ui/components/my-component.html) |
```

If the component registers multiple elements (e.g. parent + child), list all element names in the first column separated by spaces.

---

## Step 5: Write and Run Unit Tests

**This step is required.** Skipping tests is a common mistake — the AGENTS.md says "ALL tests must pass — ZERO failures are acceptable."

Create `tests/components/MyComponent.browser-test.js`. Use [Toggle.browser-test.js](../../tests/components/Toggle.browser-test.js) or [Slider.browser-test.js](../../tests/components/Slider.browser-test.js) as a reference.

Conventions:
- Import the component class at the top.
- Define an async `createMyComponent(attrs = {})` helper that builds the DOM, appends to `document.body`, awaits `el.updateComplete`, and returns `{ container, el }`.
- Define a `cleanup(container)` helper that removes the container from the DOM.
- Export a default plain object where each key is a test description and each value is an `async ({pass, fail}) => {}` function.
- Always call `cleanup(container)` before every `pass()` or `fail()` call.
- Use multi-line comments to group related tests (`/* Element Creation */`, `/* Properties */`, etc.).

Tests to include at minimum:

- Element is created and is an instance of the component class
- Element has a shadow root (when applicable)
- Default property values are correct
- Attribute reflection works (when `reflect: true`)
- Public methods behave correctly
- Events are dispatched correctly with the right `detail` shape
- For form-associated components: form submission produces the expected value

Run the tests after writing them:

```bash
npm run test -- MyComponent
```

The partial string `MyComponent` matches any test file path containing it. Fix any failures before considering the component complete. Zero failures.

---

## Step 6: Verify in the Browser

A dev server is already running on `http://localhost:8083` — **do not start another**. Source pages render via SSR so changes appear on refresh without rebuilding.

- Navigate to `http://localhost:8083/components/my-component.html`
- Use chrome-devtools-mcp to interact with the rendered output
- Test the golden path AND edge cases
- Confirm form-associated behavior by submitting an actual `<form>`
- Watch for console errors that aren't pre-existing

If you cannot test the UI for some reason, say so explicitly rather than claiming success.

---

## Component Architecture and Communication

- Use **methods** to trigger actions. Events notify that something already happened; they should not be used to trigger logic.
  - Prefer `el.closest('k-parent')?.doSomething()` over dispatching an event and listening for it.
- Child components should locate their parent via `closest('k-parent-element')` and call its methods directly.
- Avoid `window` globals and global custom events for coordination. Scope events to the relevant element; reserve `window` events for global, non-visual concerns (e.g. settings changes).

---

## Elevation (Z-Index)

Any component using `position: fixed` must follow the kempo-css elevation system where `z-index = level × 10`.

| Level | z-index | Kempo UI Components | Notes |
|-------|---------|---------------------|-------|
| 2 | 20 | (page default) | No z-index needed for flow-position components |
| 3 | 30 | Aside (push) | Fixed panels that sit **below** a fixed navbar |
| 5 | 50 | *(navbar — user-defined)* | Reserved buffer for user-defined navbars |
| 6 | 60 | Aside (overlay) | Overlay drawers that sit **above** a fixed navbar |
| 7 | 70 | Dropdown | Floating menus; above navbar and overlay |
| 8 | 80 | Dialog, PhotoViewer | Full-screen modals and lightboxes |
| 9 | 90 | Toast | Notification toasts; always topmost |

Levels 1, 4 are intentional buffer zones for user customization.

When deciding a new component's elevation:
- If it is a panel or drawer in `push` mode (shifts page content), use level 3.
- If it is a panel or drawer in `overlay` mode (floats over content), use level 6.
- If it covers the entire viewport (modal/dialog), use level 8.
- If it is a temporary notification, use level 9.

---

## Common Mistakes To Avoid

- **Hand-writing the syntax-highlighted HTML** in code samples — use the `highlight-code` skill instead.
- **Skipping tests** — every component needs a `*.browser-test.js` file with the minimum coverage above.
- **Editing `docs/`** — that directory is generated by the build. Edit `docs-src/`.
- **Forgetting `class="no-btn"` on shadow-DOM `<button>` elements** — kempo-css aggressively styles native buttons; opt out and re-center with flex.
- **Editing only the search filter and forgetting the sidebar menu, index page, or llms.txt** — all four locations must be updated for a new component.
- **Truncating adjacent elements when editing `nav.fragment.html`** — Edit tool boundaries must include whole lines; always Read after editing to verify nothing was clipped.
