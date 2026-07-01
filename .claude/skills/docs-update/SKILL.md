---
name: docs-update
description: After making any functionality changes (code or default configuration), update the documentation. Do not use this when you are fixing a bug which aligns the functionality with the current docs
---

# Update Documentation

## When to Use
Use this skill immediately after making any functionality change—such as adding features, changing behavior, or updating default configuration. Do not use this when only fixing a bug to match the current docs.

## Types of Documentation
After making a functionality change, review each type of documentation below and update as needed. The description of each doc will help you decide what to update. Compare the old functionality described there to your changes.

### README.md
The README.md is the "quick start guide" documentation for each repo. It gives a basic overview of what the repo is and how it works, but is not the full documentation.

### AGENTS.md
The AGENTS.md file contains instructions for LLMs on how to **develop** in this repo.

### llms.txt
The `llms.txt` file contains instructions for LLMs on how to **use** this repo as a dependency of the repo it is working in.

### GitHub Pages
The full documentation is in `docs/*`, but **do not** edit these files directly. These are the *built* static assets that are hosted on GitHub Pages (`github.io`). The actual **source code** for these docs is in `docs-src/*`. These use the [kempo-server Templating System](https://dustinpoissant.github.io/kempo-server/templating.html), so the docs are in `*.page.html` files. These files are likely where you will need to make the edits.

**Workflow:**
- Edit the documentation source files in `docs-src/*` (not `docs/*`).
- After making changes, **always** run `npm run build` to rebuild the static docs. This ensures your changes are reflected in the built output and avoids missing updates when committing.
- If you are running the dev server with `npm run dev`, you do not need to restart the server—changes are picked up automatically via on-demand SSR directly from `docs-src`.
- If you are running the server with `npm run docs`, it serves the static files in `docs/` and you must rebuild and restart the server to see changes.

When creating **new** documentation pages, you may need to add them to the index page (home page) and the navigation (probably `nav.fragment.html`), and possibly the search results (also in `nav.fragment.html`) if the docs have a search feature. Simple projects with few pages do not need a search.

#### Code Examples
When creating code examples in documentation pages, use the ["code-highlight" skill](../code-highlight/SKILL.md) to create properly highlighted code blocks.

#### Styles
**Important**:  Use the ["styles" skill](../styles/SKILL.md) when creating or modifying doc pages.