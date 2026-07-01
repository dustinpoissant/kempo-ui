---
name: component-setup
description: This global skill sets up a new component for a repo that has kempo-ui as a dependency
---

# Setup Component

## When to Use
When asked to create a new component, use this skill to create the file and scaffold the component.

## Steps

### Step 0: Determine if you need a new component

Before creating a new component, check if one already exists that meets your needs. First, look in kempo-ui, then check this repo’s `src/components/*` directory for reusable components.

If you find a similar component, consider whether extending or updating it would be better than creating a new one. If you’re unsure, ask the user if they would prefer to update an existing component or proceed with a new one.

To get the most up-to-date list of available components in kempo-ui, the LLM should run: `(Invoke-RestMethod "https://api.github.com/repos/dustinpoissant/kempo-ui/git/trees/main?recursive=1").tree | Where-Object { $_.path -like "src/components/*" -and $_.type -eq "blob" } | ForEach-Object { $_.path }`. Users do not need to run this themselves.


### Step 1: Determine the name of the component
This may have been provided by the user, or if the user simply described what the component should do, you should ask them what they would like it to be called.

### Step 2: Create the file
Create a new JavaScript file at `src/components/*`. It should be the name of the component class. For example, if the component is called MyComponent, the file should be `src/components/MyComponent.js`.

### Step 3: Choose the Base Component
For most cases `ShadowComponent` is the correct base class, but here are the options:

#### `ShadowComponent`
Use when the component needs shadow DOM encapsulation. The base class automatically injects the `/kempo.css` stylesheet into the shadow root.

#### `LightComponent`
Use when the component renders to the light DOM (no encapsulation, inherits page styles).

#### `HybridComponent`
Use when the component needs both a shadow DOM portion and a light DOM portion (e.g. slotted children that also need managed light DOM output).

### Step 4: Imports
Import the base component and Lit functions that are needed. If the server is configured properly (and it should be) requests to `/kempo-ui` should be redirected to `node_modules/kempo-ui/dist/` so that means you should use an absolute path to `/kempo-ui/` to import the base component and Lit functions.

```javascript
import { html, css } from '/kempo-ui/lit-all.min.js';
import ShadowComponent from '/kempo-ui/components/ShadowComponent.js';
```

### Step 5: Create and Export the class
After the imports, create the new class (extending the base class) and export it as the default export.

```javascript
export default class MyComponent extends ShadowComponent {
  // The "code-component" skill should be used to generate the actual component structure and logic. This "setup-component" is only the boilerplate, so nothing goes here.
}
```

### Step 6: Regsiter the custom element
The custom element name should be the hyphen-case version of the component name, and should always be prefixed with `k-`. For example, `MyComponent` will be registered with:
```javascript
// below the component class definition
window.customElements.define('k-my-component', MyComponent);
```

### Step 7: Code the component
Now that the file has been properly set up for this repo, use the global ["code-component"](C:\Users\dusti\.copilot\skills\code-component\SKILL.md) skill to write the actual logic and structure of the component.

### Repo-Specific Conventions
All custom element tags must be prefixed with `k-` (or as specified for this repo). 
Follow any repo-specific conventions for naming, imports, or registration. See the `code-conventions` skill for naming and code style rules. If unsure, check that skill for guidance.
