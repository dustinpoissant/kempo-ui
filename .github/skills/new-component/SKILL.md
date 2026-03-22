---
name: new-component
description: Creates a new Kempo UI web component — choosing the right base class, writing the source file, registering the custom element, and adding documentation.
---

# New Component

## When to Use

Use this skill any time you are asked to create a new component or add a new custom element to the project.

---

## Overview

Creating a component involves six steps:

1. **Choose the base component** — pick the right rendering strategy
2. **Write the source file** in `src/components/`
3. **Register the custom element** at the bottom of the source file
4. **Add documentation** in `docs/components/`
5. **Write and run unit tests** in `tests/components/`
6. **Update `llm.txt.md`** — add a row to the Components table

---

## Step 1: Choose the Base Component

Three base classes are available. Pick based on rendering needs:

### `ShadowComponent`
Use when the component needs shadow DOM encapsulation. The base class automatically injects the `/kempo.css` stylesheet into the shadow root.

```javascript
import { html } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

export default class MyComponent extends ShadowComponent {
  render() {
    return html`<p>Shadow DOM content with scoped styles</p>`;
  }
}
```

### `LightComponent`
Use when the component renders to the light DOM (no encapsulation, inherits page styles).

```javascript
import { html } from '../lit-all.min.js';
import LightComponent from './LightComponent.js';

export default class MyComponent extends LightComponent {
  renderLightDom() {
    return html`<p>Light DOM content</p>`;
  }
}
```

### `HybridComponent`
Use when the component needs both a shadow DOM portion and a light DOM portion (e.g. slotted children that also need managed light DOM output).

```javascript
import { html } from '../lit-all.min.js';
import HybridComponent from './HybridComponent.js';

export default class MyComponent extends HybridComponent {
  render() {
    return html`<p>Shadow DOM content</p>`;
  }

  renderLightDom() {
    return html`<p>Light DOM content alongside natural children</p>`;
  }
}
```

**Important:** Always call `super.updated()` when overriding the `updated()` method in `LightComponent` or `HybridComponent`.

---

## Step 2: Write the Source File

Create `src/components/MyComponent.js`. Follow these conventions:

- Use multi-line comments to separate logical sections: `Lifecycle Callbacks`, `Event Handlers`, `Public Methods`, `Utility Functions`, `Rendering`, `Styles`.
- Declare reactive properties with `static properties = { ... }` and initialize defaults in the constructor.
- Use `static styles = css\`...\`` for component-scoped CSS (shadow DOM only).
- Use arrow functions for class methods to avoid `.bind(this)`.
- Do not prefix private fields with underscores — use native JS private fields (`#field`) when true privacy is needed.

Example skeleton:

```javascript
import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

export default class MyComponent extends ShadowComponent {
  static properties = {
    value: { type: String, reflect: true }
  };
  
  /*
    Lifecycle Calblacks
  */
  constructor(){
    super();
    this.value = 'default value';
  }
  connectedCallback(){
    super.connectedCallback();
    // Do things
  }

  /*
    Event Handlers
  */
  handleClick = () => {
    this.dispatchEvent(new CustomEvent('my-event', { bubbles: true, composed: true }));
  };

  /*
    Rendering
  */
  render() {
    return html`
      <button @click=${this.handleClick}>${this.value}</button>
    `;
  }
  /*
    Styles
  */
  static styles = css`
    :host {
      display: block;
    }
  `;
  
  /*
    Static Methods
  */
  static staticMethod(){
    // Do things
  }
}

customElements.define('k-my-component', MyComponent);
```

### Custom element naming
- All elements use the `k-` prefix (e.g. `k-spinner`, `k-color-picker`).
- Use kebab-case for multi-word names.
- The `customElements.define(...)` call goes at the **bottom** of the file, after the class.

---

## Step 3: Register in the Nav, Search, and Index (if it should appear in docs)

There are **two** nav include files that must both be updated:

- `docs/nav.inc.html` — used on the homepage (paths start with `./`)
- `docs/nav-1.inc.html` — used on sub-pages (paths start with `../`)

In **each** file, add the component in **three** places, all in alphabetical order:

### 1. Search dropdown filter item

Inside the `<k-filter-list id="navSearchList">`, add a `<k-filter-item>` in alphabetical order among the other component entries:

```html
<!-- nav.inc.html (homepage) -->
<k-filter-item filter-keywords="my component mycomponent components"><a href="./components/my-component.html">My Component<br><small>Component</small></a></k-filter-item>

<!-- nav-1.inc.html (sub-pages) -->
<k-filter-item filter-keywords="my component mycomponent components"><a href="../components/my-component.html">My Component<br><small>Component</small></a></k-filter-item>
```

### 2. Sidebar menu link

Inside the `<menu>` under the `Components` `<div>`, add an `<a>` tag in alphabetical order:

```html
<!-- nav.inc.html -->
<a href="./components/my-component.html">My Component</a>

<!-- nav-1.inc.html -->
<a href="../components/my-component.html">My Component</a>
```

### 3. Homepage card

Add a card in `docs/index.html` inside the `<div class="row -mx">` under the `<h2>Components</h2>` section, in alphabetical order:

```html
<div class="span-12 t-span-6 d-span-4 px">
  <a href="./components/my-component.html" class="card mb no-link d-b">
    <h3 class="tc-primary">My Component</h3>
    <p class="tc-muted">One-sentence description of what the component does.</p>
  </a>
</div>
```

---

## Step 4: Add Documentation

Create `docs/components/my-component.html`. Use an existing docs page (e.g. `docs/components/spinner.html`) as a reference for structure and conventions.

Key requirements:
- Consistent `<head>` with title, stylesheets, and `window.litDisableBundleWarning = true`.
- `<k-import src="../nav-1.inc.html"></k-import>` at the top of `<body>`.
- A Table of Contents accordion.
- Sections for: examples/usage, and a JavaScript Reference covering constructor, attributes/properties, CSS variables, events, and public methods (as applicable).
- Use the `highlight-code` skill for all code examples that need syntax highlighting.
- At the bottom of the file, load the component and its dependencies as `<script type="module">` tags:

```html
  <script type="module" src="../src/components/MyComponent.js"></script>
  <script type="module" src="../src/components/Import.js"></script>
  <script type="module" src="../src/components/Accordion.js"></script>
  <script type="module" src="../src/components/Card.js"></script>
```

---

## Step 5: Write and Run Unit Tests

Create `tests/components/MyComponent.browser-test.js`. Use an existing test file (e.g. `tests/components/Toggle.browser-test.js`) as a reference.

Key conventions:
- Import the component class at the top.
- Define an async `createMyComponent()` helper that builds the DOM, appends it to `document.body`, awaits `el.updateComplete`, and returns `{ container, el }`.
- Define a `cleanup(container)` helper that removes the container from the DOM.
- Export a default plain object where each key is a test description and each value is an `async ({pass, fail}) => {}` function.
- Always call `cleanup(container)` before every `pass()` or `fail()` call.
- Use multi-line comments to group related tests (e.g. `/* Element Creation */`, `/* Properties */`).

Tests to include at minimum:
- Element is created and is an instance of the component class
- Element has a shadow root
- Default property values are correct
- Attribute reflection works (if applicable)
- Public methods behave correctly
- Events are dispatched correctly (if applicable)

Example skeleton:

```javascript
import MyComponent from '../../src/components/MyComponent.js';

const createMyComponent = async () => {
  const container = document.createElement('div');
  container.innerHTML = `<k-my-component></k-my-component>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-my-component');
  await el.updateComplete;
  return { container, el };
};

const cleanup = (container) => {
  if(container && container.parentNode){
    container.parentNode.removeChild(container);
  }
};

export default {
  /*
    Element Creation
  */
  'should create my-component element': async ({pass, fail}) => {
    const { container, el } = await createMyComponent();
    if(!(el instanceof MyComponent)){
      cleanup(container);
      return fail('Element should be instance of MyComponent');
    }
    cleanup(container);
    pass('MyComponent element created correctly');
  },
};
```

After writing the tests, run them to confirm they all pass:

```
npm run test -- MyComponent
```

The partial string `MyComponent` will match any test file whose path contains that string. Fix any failures before considering the component complete.

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
| 7 | 70 | Dropdown | Floating menus; above navbar and overlay|
| 8 | 80 | Dialog, PhotoViewer | Full-screen modals and lightboxes |
| 9 | 90 | Toast | Notification toasts; always topmost |

Levels 1, 4 are intentional buffer zones for user customization.

When deciding a new component's elevation:
- If it is a panel or drawer in `push` mode (shifts page content), use level 3.
- If it is a panel or drawer in `overlay` mode (floats over content), use level 6.
- If it covers the entire viewport (modal/dialog), use level 8.
- If it is a temporary notification, use level 9.

---

## Step 6: Update `llm.txt.md`

Add a row for the new component to the **Components** table in `llm.txt.md` at the root of the repository. Keep the table in alphabetical order by element name.

```markdown
| `<k-my-component>` | `MyComponent.js` | One-sentence description | [my-component.html](https://dustinpoissant.github.io/kempo-ui/components/my-component.html) |
```

If the component registers multiple elements (e.g. a parent + child pair), list all element names in the first column separated by spaces.
