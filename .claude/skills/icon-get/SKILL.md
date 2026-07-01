---
name: icon-get
description: Fetches icons from the Google Material Design Icon set, saves it to this project, and then formats it.
---

# Get Icon

## When to Use

Use this skill any time an icon is needed — whether the user explicitly asks for one or you determine that a UI element (button, control, action, etc.) would benefit from one.

## Overview

Depending on the repo you are working in, icons might be stored in different locations. The way they are loaded is by an array of directories to look in for the icon. It will search through the directories in order until it finds the icon or runs out of directories to search.

**Note:** `pathsToIcons` is a property on the global `kempo` config object (e.g., `window.kempo.pathsToIcons`). Its location may vary by repo—search the codebase for "pathsToIcons" to find where it is set up.


In most repos, the order is simple: look in the server's root `icons/` directory first, then fall back to the kempo-ui ones in `node_modules/kempo-ui/icons/`.


If this does not appear to be the case in the current repo, search the codebase for "pathsToIcons" to understand how the fallback structure is set up. You may need to also check the server config (probably `.config.json`) to see how those paths are mapped.


## Step 0: Check Local Icons First


Check all of the "pathsToIcons" paths first to see if they already have the icon.

- If a **clear match** exists, use it—no download needed.
- If a **reasonable match** exists for a directional icon (e.g., you want "chevron" and find "chevron_up", "chevron_down", etc.), use it with the `direction` attribute (see the Directional Icons section below).
- If **nothing fits**, provide the user this link "https://fonts.google.com/icons" and tell them to tell you which icon to use.


## Step 1: Find the Icon Name


Search Google Material Symbols via npx:

```powershell
npx kempo-listicons <search_term>
```


Search matches both icon names **and tags**. Try multiple terms if the first returns nothing.

## Step 2: Fetch, Format, and Save

Save icons to the correct directory using `--dir`. For example, if you want the icons saved in `src/admin/icons`, pass that in as the value of the `--dir` flag.

**When to use `custom_name`:**
- For directional icons, always download the "right" version and use `custom_name` to remove the direction suffix (e.g., download `chevron_right` and rename it to `chevron`).
- Use `custom_name` if the Material Symbols name is unclear, inconsistent, or doesn't match how the icon will be used. For example, if the icon is named `travel` but is actually an airplane, and the user asked for an airplane, rename it to `airplane`. Likewise, you might rename `floppy_disc` to `save` if that better matches the intended use. Use your judgment or follow the user's preference.

```powershell
npx kempo-geticon <icon_name> [custom_name] --dir src/admin/icons [-y]
```

- `icon_name` — the Material Symbols name from the search
- `custom_name` — optional rename
- `--dir src/admin/icons` — save to admin icons folder
- `-y` — auto-accept the directional prompt


Examples:
```powershell
# Non-directional
npx kempo-geticon format_bold --dir src/admin/icons
```

## Icon Naming Conventions

Follow the Material Symbols naming style for icons: all lowercase, with underscores between words (e.g., `chevron_right`, `format_bold`). Avoid spaces or other separators. In almost all cases, use the name provided by Material Symbols unless you have a specific reason to rename (see above for guidance on using `custom_name`).

## Directional Icons and `<k-icon>`
The way that we use directional icons (like arrows) is to always download and use the "right" facing icon, and then rotate it using the `direction` attribute in the component.

For example, if there are 4 "nifty arrows" and we want the left-facing one, download the right-facing one, rename it (see below) without the direction, and then specify the direction in the attribute. The component will auto-rotate it with CSS.

```html

<k-icon name="nifty-arrow" direction="left"></k-icon>
```


This will be a "nifty arrow" facing left, even though we downloaded the "right" one.


### Directional with auto-accept
When you attempt to download an icon that ends in a direction other than `_right` (i.e., `_up`, `_down`, `_left`, `_back`), it will prompt if you want to download the `_right` (or `_forward`) one instead. Use the `-y` flag to just auto-accept this prompt.

```
npx kempo-geticon chevron_left --dir src/admin/icons -y
```
