# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
 - `CardGrid`: a new component, a generic version of `Table` for content that reads better as a grid of `Card` tiles than table rows. Its selection, pagination and record-CRUD API deliberately match `Table` method-for-method and event-for-event (`getSelectedRecords`, `selectAllOnPage`, `deselectAllOnPage`, `allOnPageSelected`, `selectionChange`, `deleteSelected`, `requestDelete`, etc.), and — like `Table` — it sets `controlled` on itself in `connectedCallback`, which is what `Control`'s `closest('[controlled]')` host lookup relies on. The practical result: any `kc-tc-*` control (or a custom one built the same way on `Control`/`ButtonControl`) works inside a `CardGrid`'s `slot="top"` exactly as it would inside a `Table`'s, with no changes to the control itself. One `cardTemplate(record, host)` function stands in for `Table`'s per-column `fields`/`calculator`, since a card is one opaque unit rather than a row of independently addressable cells — sorting, filtering, search and inline editing are all column-shaped concepts with no equivalent here, and are intentionally not implemented. Also matches `Table`'s per-row `slot="before"`/`slot="after"` controls: a control template registered once as a light-DOM child gets cloned fresh into every tile (top or bottom of the card respectively), the same limitation and all — only tag and attributes survive the clone, not properties, so a per-tile control resolves its own record by walking up to its own `.tile`'s `data-index` and reading `host.records[index]`, the same pattern kempo core's own `AdminTableControl.record` uses for `Table`. The selection checkbox renders as the first item inside that same `slot="before"` strip rather than as a separate absolutely-positioned overlay — from the tile's perspective it IS the first before-control, just one `CardGrid` supplies itself. `.tile-controls-before` is right-aligned; `.tile-controls-after` is a plain flex row with no alignment opinion of its own — a consumer wanting its content pushed to the far edge (an actions menu, say) adds its own flex-spacer control rather than relying on `justify-content`, since a control registered for either strip can legitimately choose to render hidden for a given record (a file-only control cloned onto a folder tile, for instance), and `justify-content` has no way to account for that. Either strip collapses to nothing — `display: none`, no leftover padding — once every one of its children is hidden, rather than showing an empty band.
 - Four new icons: `public`, `public_off`, `check_circle`, `cancel` (Material Symbols), for anything needing a visibility or approval toggle distinct from the existing `show`/`hide`/`star_filled`/`warning` status icons.
 - `Card`: `--card_padding` and `--card_margin` custom properties. Both were hardcoded to `var(--spacer)` inside the shadow root and so unreachable from outside, which made a card unusable as a grid tile — media could not sit flush to the border, and the trailing margin fought the grid's own gap. Defaults are unchanged. Follows the existing `--aside_padding` convention on `Aside`.
 - `SegmentedControl`: `persistent-id`, matching the existing convention on `Aside`, `Tabs` and `Accordion` — set it and the chosen value survives a reload via `localStorage` (`segmented-control-persistent-id-<id>`), restored on connect and saved on every change, including from a form reset. A stored value overrides whatever the `value` attribute was authored with, same as the other components.

### Fixed
 - `Aside`: a pushed aside could be toggled into `offscreen`, which took `k-aside-toggle` — the only control that reopens it — offscreen with it. With `persistent-id` set, that state was then saved, so reloading restored the lockout and the only way out was deleting the key from localStorage by hand. Toggling a `main="push"` aside now collapses it to its rail, where the toggle stays reachable; `main="overlay"` still dismisses outright, since a backdrop and Escape remain. Separately, `offscreen` is no longer written to localStorage at all (it describes "dismissed right now", not a layout preference), and a previously stored `offscreen` is discarded on load rather than restored — so anyone already stuck is recovered by upgrading, without clearing anything themselves.
 - `Aside`: the same lockout was still reachable a second way — the document-level Escape handler called `hide()` unconditionally, regardless of `main`, so pressing Escape anywhere on the page while a pushed aside was expanded (or collapsed) sent it fully offscreen. Since the handler listens on `document`, not the aside itself, this fired even when focus was nowhere near it. Escape now collapses a `main="push"` aside instead, mirroring the `toggle()` fix above; `main="overlay"` is unaffected.
 - `Dropdown`: `ControlMenu` (`kc-menu`) is explicitly meant to hold real `Control`/`ButtonControl`-based items as its menu items, not just `<a>`/`<button>` markup — `HtmlEditor`'s own toolbar already slots `kc-format-block` into a `kc-menu` this way — but three separate places here still only recognized the `<a>`/`<button>` tags specifically. Clicking a real-control item never closed the menu (the interactive-element check behind close-on-select didn't match it); arrow-key navigation skipped it entirely (`getMenuItems()` had the same tag check); and Enter/Space on a focused one — reachable via a plain Tab, since keyboard nav couldn't reach it any other way — fired its action twice, because the item's own keydown handler (every `ButtonControl` has one, since a custom element gets no free Enter/Space activation the way a native `<button>` does) ran first and called `preventDefault()`, and the handler here synthesized a second `.click()` regardless. All three now also match `[role="button"]`, which `ButtonControl` already sets on itself in `connectedCallback`; the double-fire is fixed by skipping the synthesized click once `e.defaultPrevented` is already true.
 - `Table`, `CardGrid`: `slot="top"`/`slot="bottom"` content laid out as normal block/inline flow (`#top slot`/`#bottom slot` were `display: block`, present only for the divider border), not flex — a plain flex-spacer div placed among a group of `slot="top"` controls to push the rest to the far edge silently did nothing, since `flex` only has an effect on the direct children of an actual flex container. Both slots are now `display: flex; flex-wrap: wrap` instead, so a spacer (or any other flex-based layout) among slotted controls works the same way it already does inside `CardGrid`'s own `.tile-controls-before`/`-after` strips.
 - `Table`: `kc-tc-hidden-count`, `kc-tc-page-select`, `kc-tc-page-size` and `kc-tc-search` never set their own `margin`, unlike every button-shaped `kc-tc-*` control (`margin: var(--spacer_q)`, from `ButtonControl`) — sitting in the same `slot="top"`/`slot="bottom"` row as one of those, they landed flush against it with no gap between. All four now carry the same `margin: var(--spacer_q)`.

## [0.4.52] - 2026-08-13
### Fixed
 - `Table`: `kc-tc-edit`'s row-edit pencil had no spacing before it — flush against the left edge of its cell, unlike `kc-tc-delete-record` sitting right next to it. `td.controls`/`td.controls-after` intentionally zero their own padding and rely entirely on each control's own `margin` for spacing (matching `ButtonControl`'s `margin: var(--spacer_q)`), but `kc-tc-edit`'s `:host` never set one

## [0.4.51] - 2026-08-13
### Fixed
 - `Table`: `kc-tc-edit`'s row-edit pencil (and its save/cancel pair) rendered with a solid filled background instead of a normal icon-button look, and at a fixed 2rem box with no padding — smaller than `kc-tc-delete-record` and every other `ButtonControl`-based row action sitting right next to it. Same root cause as the earlier toolbar fixes: a raw `<button>` without kempo-css's `no-btn` escape hatch loses to its global button rule on specificity. Added `no-btn` and matched `ButtonControl`'s box model (`min-width`/`min-height: 2rem` + `padding: var(--spacer_h)` instead of a flat `width`/`height: 2rem`), so it's now visually identical to `kc-tc-delete-record`

## [0.4.50] - 2026-08-13
### Fixed
 - `HtmlEditor`/`MarkdownEditor`: `kc-text-color`, `kc-text-background-color`, `kc-insert-image`, `kc-md-image`, and `kc-md-table`'s toolbar buttons were a few pixels larger than every other toolbar button. Their `.trigger` used a flat `min-width`/`min-height: 2.5rem` with no padding, instead of `ButtonControl`'s actual recipe — `min-width`/`min-height: 2rem` plus `padding: var(--spacer_h)` — so the rendered box came out larger even though nothing else about them differs visually. These can't literally extend `ButtonControl` (they need a `<k-dropdown>` wrapping a separate trigger and content panel, where `ButtonControl`'s host element *is* the button), but there was no reason their size shouldn't match it exactly. Now it does

## [0.4.49] - 2026-08-13
### Fixed
 - `ShadowComponent`: a subclass whose `static styles` wraps a parent class's own `static styles` array without spreading it — e.g. `[ButtonControl.styles, css\`...\`]`, since `ButtonControl.styles` is itself `[Control.styles, css\`...\`]` — produced a style array nested one level deep. `createRenderRoot()` mapped over it without flattening first, so the inner array had no `.cssText` of its own and fell through to JS's default `Array.prototype` stringification, which joins elements with a bare `,`. A comma sitting between two closed `}` blocks is not valid anywhere a CSS rule is expected, so the browser silently dropped the entire next rule rather than misapplying one property — in practice, all of `ButtonControl`'s own styling (sizing, padding, hover/focus/active states) on any affected subclass. `createRenderRoot()` now flattens the styles array before mapping, so it no longer matters how many layers of "wrap the parent's styles" a subclass chain adds
 - `FormatBlock` (the `kc-menu` heading picker's items), `TcExportCsv`, `TcExportJson`: hit the bug above directly — `static styles = [ButtonControl.styles, css\`...\`]` without the spread `VidLoop` already used correctly. In practice this meant `kc-format-block` items inside an open `kc-menu` (e.g. the Heading dropdown) rendered with no padding, no minimum size, and no hover feedback — flush against each other with the dropdown's edges. Fixed to spread, matching `VidLoop`'s existing pattern; also fixed by the `ShadowComponent` change above for any other instance of the same mistake
 - `HtmlEditor`/`MarkdownEditor`: the `kc-text-color`, `kc-text-background-color`, `kc-insert-image`, and `kc-md-image`/`kc-md-table` toolbar icons were off-center within their button — shifted toward the top-left by several pixels. Each renders its own `<button class="trigger">` for `k-dropdown`, and unlike `kc-bold`/`kc-insert-table`/etc. (whose host element *is* the button, centered via `ButtonControl`'s own flex layout) or `kc-menu`'s trigger (which sets flex centering explicitly), `.trigger` set a `min-width`/`min-height` larger than its icon but never `display: flex` — so the icon sat at its default inline position inside the oversized box instead of centered. Added the same flex centering the other triggers already have

## [0.4.48] - 2026-08-13
### Fixed
 - `HtmlEditor`/`MarkdownEditor`: the `kc-text-color`, `kc-text-background-color`, `kc-insert-image`, and `kc-md-image`/`kc-md-table` toolbar buttons rendered with a solid background instead of matching every other toolbar control's transparent one. Each renders its own `<button slot="trigger">` for `k-dropdown` rather than being the button itself the way `kc-bold`/`kc-insert-table`/etc. are, and kempo-css's global `button:not(.no-btn):not(.no-style)` rule outranks a plain `.trigger` class selector, so it was silently winning over the control's own transparent styling. Added the `no-btn` class kempo-css ships for exactly this, and gave `kc-insert-image`/`kc-md-image`/`kc-md-table` the same bordered box and hover tint their sibling controls already had

## [0.4.45] - 2026-08-13
### Added
 - `Video`: `--controls-bg` CSS custom property to override the control bar's default gradient background. The gradient (dark at the bottom edge, fading to transparent) can read poorly once whatever's playing is already dark near that edge; setting `--controls-bg` to a flat color gives a solid, evenly-legible overlay instead

## [0.4.44] - 2026-08-13
### Fixed
 - `HtmlEditor`: **images were silently discarded.** Lexical only builds nodes for types that are registered and ships none for images, so an `<img>` was dropped on the way in — whether it arrived through `insertImage()`, was pasted, or was already present in `value`. `insertImage()` had therefore never actually inserted anything. An image node is now registered alongside headings, lists, links and tables, so images survive insertion, paste, `value`, and the round trip back out through `value`. It is registered unconditionally rather than through the opt-in `nodes` attribute, because an editor that quietly deletes images is surprising in a way an editor without HTML-comment support is not

### Added
 - `HtmlEditor`: `kc-insert-image` control, the counterpart to `kc-md-image` for the WYSIWYG editor, added to the `normal` and `full` control sets. Typing a URL needs nothing from the host; a host that sets `window.kempo.openAssetPicker` also gets a **Browse…** button, reading the same hook `kc-md-image` does. The control knows nothing about where images come from, only how to ask, so a site, a CMS or an Electron app can each supply their own source
 - `HtmlEditor`: `insertImage(url, { alt })` now accepts alt text. It is HTML-escaped rather than URL-encoded — `encodeURI` incidentally neutralises a quote in the `src`, but alt is human-readable text where percent-encoding would show through, so it needs real attribute escaping to stop a quote closing the attribute early

## [0.4.43] - 2026-08-13
### Added
 - `MarkdownEditor`: optional `window.kempo.openAssetPicker` hook. The built-in image control (`kc-md-image`) has only ever accepted a typed URL, which is no use on a site that stores its images somewhere the author would have to go look them up. Providing the hook — an `async ({ alt }) => ({ url, alt }) | null` — adds a **Browse…** button that hands off to whatever picker the host supplies, and inserts the result through the same path as manual entry. It is resolved when the control's dropdown opens rather than at page load, so it can be installed at any point with no load-order requirement, in the spirit of `window.kempo.overlayRoot`. Every dismissal path resolves `null` and inserts nothing; a hook that throws is logged and leaves the editor untouched. With no hook installed the control is byte-for-byte what it was

## [0.4.42] - 2026-08-12
### Fixed
 - `Dropdown`: opening a `k-dropdown` now closes any other open one that shares its shadow root. `containsAcrossShadow()` — the "is that dropdown nested inside me?" check guarding every close path — reported a false positive for siblings: walking up from the other dropdown reached their common host, whose `.shadowRoot` is this one's root node, which it read as "contains". So a component rendering two or more `k-dropdown`s in its own shadow root (a toolbar or control bar with several menus) could stack them all open at once, and clicking one trigger never dismissed the others. Dropdowns in *different* components were unaffected, which is why this only showed up in that one shape
 - `containsAcrossShadow()` now walks the flattened tree via `assignedSlot` rather than inferring nesting from a shared root, so it answers the question it was written for exactly: a dropdown slotted in from another custom element's shadow root (e.g. `kc-vid-speed` inside `kc-vid-menu`) is still recognized as nested, while two that merely live side by side are not
 - `Video`: the fullscreen control could no longer exit fullscreen once `k-video` was nested two or more shadow roots deep inside a consumer's own components (e.g. a video player component slotted into a larger app shell, each with its own shadow root). `document.fullscreenElement` doesn't resolve to the actual fullscreen element in that case — per the Fullscreen API spec it only ever reports the *outermost* participating shadow host, with each shadow root along the chain reporting the next one down via its own `.fullscreenElement`. `exitFullscreen()` and the `fullscreen` property (which the `kc-fullscreen` control's icon and click handler both read) compared directly against `document.fullscreenElement`, which only ever matched when `k-video` was used with no shadow-DOM nesting at all — everywhere else, `fullscreen` stayed stuck `false`, so clicking the control while fullscreen kept calling `enterFullscreen()` again instead of exiting
 - Both now resolve the actual element by walking `shadowRoot.fullscreenElement` down from `document.fullscreenElement` (a new internal `deepestFullscreenElement()`), so entering and exiting fullscreen work correctly regardless of how deep `k-video` is nested in shadow DOM

## [0.4.38] - 2026-07-26
### Changed
 - `window.kempo.toastContainer` renamed to `window.kempo.overlayRoot` — generalized from a `Toast`-only setting to one shared by every component that portals fixed-position content to `document.body` (`Toast`, `Dialog`, `PhotoViewer`), since all three needed the identical override for the identical reason
 - `Dialog` now respects `overlayRoot`: dialogs (and their full-viewport backdrop) mount into the configured element instead of always `document.body` — fixes the same titlebar-overlap problem `Toast` had in 0.4.37, which `Dialog` shared but didn't yet handle
 - `PhotoViewer.open()`'s gallery mount point, and a nested `<k-photo-viewer>`'s scroll-lock ancestor lookup, now go through `overlayRoot` instead of a hardcoded `[data-overlay-root]` selector — same effective behavior for existing kempo-app consumers once they set the config (kempo-app itself does, as of its own next release), but `Dialog`/`PhotoViewer`/`Toast` now share one mechanism instead of `PhotoViewer` special-casing one specific attribute name
 - Extracted the shared resolution logic to `src/utils/overlayRoot.js` (`getOverlayRoot()`), used internally by all three components

## [0.4.37] - 2026-07-26
### Added
 - `window.kempo.toastContainer`: CSS selector for the element `Toast` containers should be appended into instead of `document.body`, for host pages that render their own chrome (e.g. a fixed header, or a custom titlebar in an Electron app) that toasts shouldn't render over. Resolved lazily on first use, so it can be set at any point; falls back to `document.body` if unset or the selector matches nothing

## [0.4.35] - 2026-07-19
### Added
 - `<k-rating>`: 5-star rating widget; stars render outlined by default and fill in up to the applied `value` (0-5); click a star to set the value, hover previews the fill without changing it; form-associated via `name`, supports `disabled`, fires `change`

## [0.4.34] - 2026-07-15
### Added
 - `<k-tags>`: inline autocomplete suggestions. Provide a `getSuggestions(query, callback)` function (which may call the callback, or return an array or a `Promise`) and the component shows the completion as muted "ghost" text ahead of the cursor after a configurable `suggestion-debounce` (default 300ms). Tab/Enter saves the suggested tag, and Backspace/Escape cancels the suggestion without deleting typed characters

## [0.4.33] - 2026-07-13
### Added
 - `<k-video>`: `idle-delay-ms`, `skip-flash-ms`, and `skip-duration` attributes to customize the auto-hide delay, skip-indicator flash duration, and double-click/tap skip amount (previously hardcoded)
 - `<kc-vid-menu>` control: groups less-common video controls into a dropdown menu button, injecting a matching icon and label for each slotted control automatically
 - `k-dropdown`: exposed `::part(trigger)` for styling the trigger wrapper from outside the component

### Changed
 - `k-dropdown`'s menu now renders as a native popover (top layer), so it's never clipped by an ancestor's `overflow: hidden` or stacking context
 - `<kc-vid-speed>` now switches into `k-dropdown`'s native "submenu" mode (hover-to-open, flyout, chevron) when nested inside `<kc-vid-menu>`, instead of its own bespoke up-popup, so it behaves consistently with other nested dropdown menus

### Fixed
 - `<k-video>` no longer stretches or crops its content when forced into a size/aspect ratio that doesn't match the actual video — it now letterboxes/pillarboxes to fit, centered both ways, with `k-video`'s own black background filling the bars
 - `<k-video>` auto-hide controls no longer disappear immediately when the mouse leaves the player while playing — the idle timer now runs its full duration regardless of `pointerleave`
 - `<k-video>` cursor now correctly hides during the idle state
 - `k-dropdown` submenus now open on a single tap on touch devices (previously required two taps due to a `mouseenter`/`click` race)
 - `k-dropdown` no longer closes an ancestor dropdown when a control nested inside it renders its own `k-dropdown` inside another component's shadow root (e.g. `<kc-vid-speed>` inside `<kc-vid-menu>`)
 - `k-dropdown` anchor positioning no longer collides between multiple dropdown instances on the same page
 - `<kc-vid-menu>` now shows the correct icon for Picture-in-Picture, and no longer overrides an active-state color set by a slotted control (e.g. `<kc-vid-loop>` while looping)

## [0.4.30]
### Fixed
 - Disabled pointer events on the `<video>` within the Video component to disable native controls.

## [0.4.30]
### Fixed
 - Fixed padding in sliders so that the handle does not leave the component when at 0 or 100%.

## [0.4.29]
### Added
- Video component (`<k-video>`) and its `kc-vid-*` controls, with docs and full test coverage

## [0.4.21] - 2026-06-02
### Added
- **ControlGroup** (`<k-control-group>`): Shared toolbar control-grouping component at `src/components/ControlGroup.js`; groups children visually with border separators via `::slotted(*)`; auto-hides when all children are hidden
- **CodeEditorButtonControl** base component — extends `Button` so toolbar button controls are proper accessible buttons (role, tabindex, keyboard interaction) that can be targeted externally for styling
- **FontSizeDecrease** (`<k-cec-font-size-decrease>`) and **FontSizeIncrease** (`<k-cec-font-size-increase>`) standalone button sub-components
- Form Integration documentation example for CodeEditor showing `name`, `required`, and submit handling

### Changed
- Promoted `ControlGroup` from editor-specific (`k-cec-group` / `k-hec-group`) to a shared top-level component registered as `<k-control-group>`; sub-directory files are now thin re-exports for dynamic import compatibility
- Group-child styling (border collapsing, radius removal) now lives entirely in `ControlGroup` via `::slotted(*)` — button controls no longer need group-detection logic
- Converted 9 CodeEditor toolbar button controls (FormatCode, CopyCode, Undo, Redo, FindReplace, WordWrap, Minimap, FoldAll, Fullscreen) from internal `<button>` elements to extending `CodeEditorButtonControl` — host element is now the button
- EditorTheme selector height now matches toolbar buttons; icon preserved with `padding-left` approach
- FontSize control now renders `FontSizeDecrease` and `FontSizeIncrease` sub-components inside a `ControlGroup`
- `<k-pg-items-per-page>` height now matches other pagination controls; label text is slotted so consumers can override it with custom children

### Removed
- Readonly mode removed from CodeEditor documentation (code-level support remains for backwards compatibility)


## [0.4.19] - 2026-05-06
### Added
- **Pagination component** (`<k-pagination>`): Full-featured pagination with composable control sub-components
  - `page` attribute reflects and controls the current page number (defaults to 1)
  - `total-items` and `items-per-page` attributes control page count; `items-per-page` defaults to 10
  - `page-sizes` attribute accepts a comma-separated list of valid page size options (defaults to `5,10,25,50,100`)
  - `controls` attribute accepts `"simple"` (prev / page-info / next) or `"full"` (first / prev / goto-page / next / last / items-per-page) preconfigured sets, or leave blank to slot controls manually
  - `nextPage()` and `previousPage()` methods for programmatic navigation; both clamp to valid range
  - Fires `page-change` event on page navigation and items-per-page changes with `{ currentPage, totalPages, itemsPerPage, totalItems }` detail
  - **Control sub-components** (all auto-wire to their nearest parent `<k-pagination>`):
    - `<k-pg-first>` — navigates to page 1; disabled when already on first page
    - `<k-pg-prev>` — navigates to previous page; disabled on first page
    - `<k-pg-next>` — navigates to next page; disabled on last page
    - `<k-pg-last>` — navigates to last page; disabled when already on last page
    - `<k-pg-page-info>` — static "Page X of Y" text display
    - `<k-pg-goto-page>` — dropdown `<select>` listing every page for direct navigation
    - `<k-pg-count>` — inline text node showing total page count
    - `<k-pg-items-per-page>` — dropdown to change items per page using values from `page-sizes`

## [0.4.18] - 2026-05-04
### Added
- **Combobox component**: `no-results-message` and `empty-message` attributes
  - `no-results-message` customizes the text shown when the user has typed something but no options match (default: `"No Matches"`)
  - `empty-message` customizes the text shown when the input is empty and no options are loaded, e.g. before a dynamic search has fetched results (default: `"Type to search..."`)
  - Both attributes map to `noResultsMessage` and `emptyMessage` properties respectively

### Fixed
- **Tabs component**: Test for `persistent-id` localStorage restore had a logic inversion — `content3.active` was checked instead of `!content3.active`, causing the test to fail precisely when restoration was working correctly

## [0.4.17] - 2026-05-03
### Added
- **Markdown Editor component**: CSS size variables `--min-height` and `--max-height`
  - New `--min-height` CSS variable to prevent editor from shrinking below a minimum size
  - New `--max-height` CSS variable to add vertical scrollbar when content exceeds max height
  - Works alongside existing `--height` variable for flexible sizing
  - Documentation updated with sizing example showing all three variables used together

## [0.4.16] - 2026-05-03
### Added
- **Markdown Editor component**: Debounced change event during input
  - `change` event now fires with a 300ms debounce when text is being typed
  - Previously, `change` events only fired on blur or native change events
  - Enables apps to use the `change` event for enable/disable logic during long typing sessions
  - Useful for "Save" button state management without waiting for blur

### Changed
- **Markdown Editor component**: Code style improvements
  - Converted from hash private members (`#field`) to Symbol-keyed properties for full browser compatibility (Safari support)
  - Reorganized comments to follow component-code skill pattern
  - Removed unnecessary multi-line comments, keeping only documentation for properties and complex logic

## [0.4.13] - 2026-05-03
### Added
- **Markdown Editor component**: spacing but
  - The spacer was reset to 0 in the MarkdownEditor component. I deleted that line to fix spacing.

## [0.4.13] - 2026-05-03
### Added
- **Tabs component**: `persistent-id` attribute for storing/restoring active tab state
  - New `persistentId` property (String type, reflects to `persistent-id` attribute)
  - Active tab state is automatically saved to localStorage when it changes
  - Previously active tab is automatically restored on page load
  - Fires `restored` event when state is restored from localStorage
  - Fires `tab` event on both manual change and state restoration
  - Supports multiple Tabs components with different `persistent-id` values for independent state management
  - Safe fallback when localStorage is unavailable
  - New unit test suite with 6 test cases covering all persistence scenarios

## [0.4.12] - 2026-05-03
### Added
- **SegmentedControl component**: New form-integrated segmented control component
  - Renders child `<k-sc-option>` elements as a button group using Kempo-CSS utility classes
  - Supports rich content in options including text and icon elements (via `<k-icon>`)
  - Full form integration using ElementInternals API (`formAssociated`) for proper form submission and reset
  - `name` attribute for form field identification
  - `value` property reflects and controls the selected option
  - Dispatches `change` events when selection changes
  - Comprehensive unit test suite with 13 test cases covering element creation, properties, option recognition, selection, styling, and events
  - Complete documentation with examples: Basic Usage, Selected By Default, JavaScript Usage, Icon Options, and Form Integration
  - Test file: `tests/components/SegmentedControl.browser-test.js`
  - Documentation: `docs-src/components/segmented-control.page.html`

## [0.4.11] - 2026-05-01
### Added
- **Chat component**: Comprehensive unit test suite with 62 test cases
  - Tests cover component initialization, properties, and attributes
  - Tests for message management (add, update, remove, clear operations)
  - Tests for send button styling and functionality
  - Tests for message rendering, status displays, and sender names
  - Tests for HTML sanitization and security
  - Test file: `tests/components/Chat.browser-test.js`

### Fixed
- **Chat component**: Send button now displays at its natural size instead of being artificially constrained
  - Changed from fixed `width` and `height` to `min-width` and `min-height` properties
  - Added proper padding using theme-configurable `--spacer_q` custom property for consistent spacing
  - Button maintains circular appearance and primary color styling

## [0.4.10] - 2026-05-01
### Added
- **MarkdownEditor component**: Comprehensive unit test suite with 40+ test cases
  - Tests cover component initialization, markdown rendering (basic and GFM), mode switching (write/preview tabs)
  - Tests for form integration (value, name, placeholder, required, readonly, disabled attributes)
  - Tests for public methods (setMode, togglePreview, clear, focus, getSelection, replaceSelection, insertAtCursor, insertLinePrefix, wrapSelection)
  - Tests for event handling (input, change, mode-change events) and HTML sanitization
  - Tests for edge cases, accessibility features, and component properties
  - Test file: `tests/components/MarkdownEditor.browser-test.js`

## [0.4.9] - 2026-05-01
### Changed
- **Timestamp component**: Enhanced documentation with comprehensive list of supported date/time input formats
  - Supports EPOCH milliseconds, ISO 8601 (full, date-only, with/without timezone), RFC 2822, JavaScript date strings, US date format, and named month formats
  - Added interactive examples and important notes about browser compatibility and timezone handling
  - Updated llms.txt component reference with full format information

## [0.4.3] - 2026-04-30
### Added
- Initial CHANGELOG entry. All prior work is condensed into this log entry.

[0.4.3]: https://github.com/dustinpoissant/kempo-ui/releases/tag/v0.4.3
