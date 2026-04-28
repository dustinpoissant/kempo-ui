---
name: get-icon
description: Fetches icons from the Google Material Design Icon set, saves it to this project, and then formats it.
---

# Get Icon

## When to Use

Use this skill any time an icon is needed — whether the user explicitly asks for one or you determine that a UI element (button, control, action, etc.) would benefit from one. For example, if a user asks you to build a "bold" button for a WYSIWYG toolbar, you should proactively source an appropriate icon without being explicitly told to.

## Overview

Icons live in the `icons/` directory as SVG files. The project uses the **Material Symbols Outlined** style from Google's CDN. The workflow has three stages:

1. **Check local icons first** — the icon may already exist
2. **Find** the correct Material Symbols name if it doesn't
3. **Fetch, format, and save** using the script (directional handling is automatic)

---

## Stage 1: Check Local Icons First

Before going to the internet, list the contents of `icons/` and look for an existing icon that fits the need. Use `file_search` or `list_dir` on the `icons/` directory.

- If a **clear match** exists (e.g. `icons/format_bold.svg` for a bold button), use it — no download needed.
- If a **reasonable match** exists for a directional icon (e.g. `icons/arrow.svg` for a left-arrow), use it with the appropriate `direction` attribute — no download needed.
- If **nothing fits**, proceed to Stage 2.

---

## Stage 2: Find the Icon Name

If the user describes an icon but doesn't supply an exact name, search Google Material Symbols to find the right one.

Run the search script, which fetches icon names and tags from GitHub and caches them locally in `node_modules/.cache/kempo-ui/`. On subsequent runs it only re-downloads if the icon list has changed (SHA check — ~1KB request vs ~500KB full list). Search matches both icon names **and tags**, so searching `chevron` will also surface `keyboard_arrow_right` because it has a `chevron` tag:

```bash
npm run listicons -- <search_term>
```

Example:
```bash
npm run listicons -- bold
# → format_bold
```

```bash
npm run listicons -- chevron
# → chevron_right
#   chevron_left
#   keyboard_arrow_right
#   keyboard_arrow_left
#   ...
```

The results show **full icon names including direction suffixes** so you can see what variants are available. Pick the best match for the user's intent. If no results are returned, try different search terms (e.g. `type` instead of `font`, `text` instead of `word`).

---

## Stage 3: Fetch, Format, and Save

Run the fetch script with the chosen icon name. The script automatically handles directional icons — if the name you pass is directional (has a `_left`, `_up`, `_down`, `_backward` suffix, or has no exact match but a `_right`/`_forward` variant exists), it will prompt:

```
"chevron_left" is a directional icon. kempo-ui uses right direction only and applies CSS rotation.
Save right-facing variant as "chevron.svg"? (Y/n)
```

```bash
npm run geticon -- <icon_name> [custom_name] [-y]
```

- `icon_name` — the Material Symbols name as returned by the search script
- `custom_name` — optional rename (e.g. `keyboard_double_arrow_right double_chevron` saves as `double_chevron.svg`)
- `-y` — auto-accept the directional prompt without user interaction

Examples:
```bash
# Non-directional — downloads silently
npm run geticon -- format_bold

# Directional — prompts to confirm saving right-facing variant as "chevron"
npm run geticon -- chevron_left

# Directional with rename and auto-accept
npm run geticon -- keyboard_double_arrow_up double_chevron -y
```

If the script exits with a non-zero code mentioning a 404, the icon name is wrong — return to Stage 2 and search for the correct name.

The script produces minified output with only `xmlns` and `viewBox` on `<svg>`, and only `fill="currentColor"` and `d` on each `<path>`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path fill="currentColor" d="..."/></svg>
```

---

## Directional Icons and `<k-icon>`

When the script saves a right-facing icon (after a directional prompt), the `<k-icon>` component handles rotation via its `direction` attribute:

| `direction` value | Rotation applied |
|---|---|
| *(omitted)* | 0° — points right |
| `down` | 90° |
| `left` | 180° |
| `up` | 270° |

**Example:** A user asking for a "left arrow" after downloading `arrow.svg`:
```html
<k-icon name="arrow" direction="left"></k-icon>
```

---

## Complete Example

**User asks to "add a bold button" (implicit icon need)**

1. **Local check:** `icons/format_bold.svg` exists → use it directly, no download needed
2. **Use:** `<k-icon name="format_bold"></k-icon>`

**User asks to "add a thumbs up icon" (explicit, not in local icons)**

1. **Local check:** No match in `icons/`
2. **Find:** `npm run listicons -- thumbs+up` → `thumb_up`
3. **Arrow check:** Not directional, proceed normally
4. **Run:** `npm run geticon -- thumb_up`
5. **Result:** `icons/thumb_up.svg` saved and build triggered

**User asks for a "left arrow icon"**

1. **Local check:** `icons/arrow.svg` exists and is right-facing
2. **Arrow check:** Directional — right-facing variant already present
3. **No download needed:** use `<k-icon name="arrow" direction="left"></k-icon>`

**User asks for a "left arrow icon" (no arrow in local icons)**

1. **Local check:** No arrow icon found
2. **Find:** `npm run listicons -- arrow` → consider `arrow_forward` or `arrow_right`
3. **Arrow check:** Directional — download the right-facing variant with a generic name
4. **Run:** `npm run geticon -- arrow_forward arrow`
5. **Use:** `<k-icon name="arrow" direction="left"></k-icon>`
