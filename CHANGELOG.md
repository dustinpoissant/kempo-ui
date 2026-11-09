# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-11-09

### Added

- **Media gallery: a video's poster is a frame of it.** Adding a video from the library sets its poster to the frame kempo-thumbs made (medium size, taken at the kempo-thumbs *video frame* setting, one second in by default). *Use a frame of the video* sets it by hand. The poster is also the video's thumbnail in the strip.
- **Media gallery: a sound's *Use album cover* button** sets its Thumbnail to the album cover its file carries. It shows for sounds when a media library is installed, and says so when the file has no cover.
- **A sound's own file is never its thumbnail.** A Media gallery item whose Thumbnail is its own address (which a sound picked into a picture field could be, and which drew as a broken image) now shows its icon instead.
- **Audio in the Media gallery plays and takes its album cover as the thumbnail.** A file picked from the library was drawn as a picture (its address has no extension, so the gallery guessed image). The item now gets the type the library reports, and a sound gets its embedded album cover as its thumbnail, unless its Thumbnail is set. Items added before this need their Type set to Audio once.
- **The Media gallery adds several items at once.** Its settings have an *Add media* button (with a media library installed) that opens the library with pictures, videos and sounds selectable together; each one chosen becomes an item, in order, in one step. The type is automatic, from the file. Without a library the *Add item* button stays.
- **The Photo viewer adds several photos at once.** With a media library installed, its settings have an *Add photos* button that opens the library with several pictures selectable, and each one chosen becomes a photo, in order, in one step (their sizes are measured as they are added). Without a library it keeps *Add photo*, which adds one empty photo to fill in.
- **The File widget's address has the media library picker.** Its address is a file field (`type: 'file'`), so a site with a media library gets a Choose button for it. Without one it is a text box, as before.
- **A named slot of a widget is a place to drop into in the page builder.** A widget with several slots (`slots: [{ name: 'actions' }, { name: 'footer' }]`) had only the first one to drag into. Each slot that is not `default` is now drawn in the builder as an element of its own, `<div slot="footer" data-pb-id data-pb-slot="footer" data-pb-title="…">`, holding the widgets in it, so it shows as a labelled, empty-looking place to drop even when nothing is in it. The page is unchanged: it still writes each widget with `slot="footer"`. A widget with no `default` slot is no longer marked as a drop place for one.
- **`<k-sortable>` can sort a grid of tiles.** `grid` on the container is for items in a row or a wrapping grid (the drop place is the nearest item and its side, shown as a vertical bar), `controlled` leaves the DOM alone and only reports where the item was dropped (for lists that another renderer such as Lit owns), and `bare` on an item removes the handle, border and padding so the whole item is dragged, only after the pointer has moved a few pixels and never from a button, link or field inside it. The `sort` event now has `detail: { item, from, to }`. The default vertical list is unchanged.
- **`drag(options)` takes `threshold` and `ignore`**, and its callbacks get `clientX` and `clientY`. With a threshold, a click that does not move that far calls no callback; `ignore` is a selector for things inside the element that are not a drag (a button).
- **`<k-dropzone>`:** an area with a dashed border to drop files on, or to click (or press Enter or Space) to open the file picker. It only collects files and reports them in a `files` event (`detail.files` and `detail.rejected`). `accept` limits the types (the picker, and drops are checked too), `multiple` takes more than one file, `disabled`, `label`, and a slot for your own content. There is a new `upload` icon, also in the Icon Selector.
- **`<k-page-builder>` `markSaved(page)`.** Counts a page as saved: the one given (`detail.value` of a `saverequest` event), or the one shown now. Changes made since stay unsaved. The builder keeps track of unsaved changes with it: it warns before the page is left and turns the save button green while there are any.
- **`<k-page-builder>` `stylesheets`:** addresses of stylesheets the page is drawn with besides the ones of the page the builder is in, for a builder in an admin whose own stylesheets are not the site's.

### Fixed

- **`<k-sortable>` no longer reads the global `event`, and no longer fails on a drop with nowhere to go.** The place an item is dropped was worked out from `window.event`, and a drop with no target threw while unpacking `null`. It now uses the pointer position the drag gives it, and a drop with no target does nothing.
- **`<k-table>` a search no longer leaves records hidden when it gets broader.** `search()` skipped every record that an earlier search had hidden, so backspacing (a broader search) showed fewer results than typing, and a search never brought anything back. Each search is now worked out again from every record, in a flag of its own, so records hidden by `hideRecord()` or by a filter stay hidden and an empty search shows the rest. `recordShown` fires when a search brings records back.
- **`<k-combobox>` the list is no longer cut off by a scrolling or clipping ancestor.** The list was positioned inside the combobox, so a settings panel, a dialog or any ancestor with `overflow` hid most of it (a product picker in the page builder's settings showed only its top edge). It is now a top-layer popover anchored to the input, as the Dropdown's menu is, as wide as the input and flipping above it when there is no room below. The component also had two `updated()` methods, so the first (which would have kept the form value in step) was silently ignored; they are one now.
- **`<k-page-builder>` a click on a link inside a widget no longer takes the page away.** The frame cancels the click on a link or form so the builder stays where it is, but it only looked at the clicked element, which is the widget itself for a link inside the widget's shadow DOM (a cart button, a button that goes to a page), so the frame followed the link and the builder broke. The whole path of the click is looked at now.
- **`<k-page-builder>` the controls of an extra spot look like the builder's own.** A spot is a group, but the group's styles do not reach controls slotted through it, so they kept their own borders, radius and margin (a bordered box inside the group's border). They now have none, with a line between them and none after the last, which is marked `data-pb-last`.
- **`<k-page-builder>` no flash of the wrong theme in the page frame.** The frame's document started without the `theme` and `auto-theme` attributes, which only the theme module (a deferred script) set, so a dark page flashed white every time the frame was drawn. The frame now starts with the page's `theme` and `auto-theme` on its root and a `color-scheme` meta (`light dark`).

### Changed

- **`<k-page-builder>` the settings panel fills the side and scrolls its own content.** The whole right side scrolled, so the widget's name, description and tabs moved away as a long settings list was read. The panel now uses the full height of the side, its heading stays, and the tabs (`<k-tabs fixed-height>`) give the tab content the rest of the height, which scrolls on its own. A widget with no Styles tab, and the page settings, scroll in the same place.
- **`<k-page-builder>` page settings can hold a site's own fields.** A child with `slot="page-settings"` is shown in the right panel, under the title and description, while nothing is selected.
- **The code editor dialog (HTML and Script widgets) and the text editor dialog open on the page.** They were drawn inside the settings panel, so a site's side navigation (an `<k-aside>`, which sits above the panel) covered the edge of a dialog that nearly fills the screen. They are opened with `Dialog.create` now, like the builder's other dialogs.
- **`<k-page-builder>` extra control spots are ranked by their controls.** A spot (`left-end`, `center-start`, `center-end`, `right-start`) was always priority 2. It now has the highest `priority` among its controls (a bare `priority` counts as 1, none counts as 0 and a negative one moves before the controls that have none), and a spot whose controls have none has no priority.
- **BREAKING: `<k-page-builder>` no longer saves.** The `save` event is now `saverequest` and `save()` is `requestSave()`. Ctrl+S and the save button only emit `saverequest` (`detail.value` is the page): the builder does not count the page as saved or show "Page saved". The site stores the page, tells the person how it went, and calls `markSaved(detail.value)`. The docs example saves to `localStorage` and shows a `Toast.success`.

## [1.3.0] - 2026-11-08

Versions 1.1.0 and 1.2.0 were never published to npm (npm reserves version numbers used by an earlier, unpublished package of the same name), so this release also includes the 1.1.0 changes below.

### Added

- **`<k-page-builder>`:** a controlled page editor. Pick from 26 widgets (text, markdown, images, video, audio, files, a photo viewer, a media gallery, a hero, embeds, groups, columns, a fullscreen breakout, tables, buttons, icons, accordions, tabs, a content slider and more) in the Add list, arrange them in the widget tree or on the page, and change the settings of each. The page is kept as JSON: `value` in, a `change` event out, `save` on Ctrl+S, with undo and redo, templates, a device preview and keyboard shortcuts. The toolbar is a `<k-control-bar>` of new `kc-pb-*` controls, and `PageBuilder.addWidget` adds your own widgets.
- **`<k-page-renderer>`:** shows the page JSON from `<k-page-builder>` as a page in the browser. `PageRenderer.toHTML(value)` gives the HTML as a string.
- **Rendering pages on a server:** `renderPage`, `pageWidgets` and `pageTree` have no DOM and no Lit, so they run in Node and in the browser. A server has to pass its own `sanitize` function (used for the text widget and table cells), because `sanitizeHtml` needs a browser DOM. The html widget always writes its HTML as given, so only trusted editors should use it.
- **`<k-media-gallery>`:** a product-style gallery of images, videos, audio and any media type you register, with a thumbnail strip, arrows, swipe and a fullscreen viewer.
- **`<k-icon-selector>`:** a form-associated icon picker that opens a searchable grid of icons.
- **`<k-audio controls="playlist">`:** lists the `<k-audio-track>` children above the bar, with previous and next in place of skip, loop and shuffle. `<k-audio>` also has `top`, `bottom` and `visualizer` slots.
- **`<kc-audio-visualizer>`:** a canvas that draws the playing sound as bars or a wave.
- **`<k-control-group split>` and `<k-menu split>`:** inside a `<k-control-bar>`, their controls move into the "more" menu one at a time, each by its own `priority`, instead of the whole group moving as one unit.
- **`<k-main full-width>`:** removes the width limit and the side padding of the content.
- **`<k-photo-viewer no-fullscreen>`:** turns the fullscreen view off.
- **`<k-content-slider min-height>`:** a minimum height for the slide area, as any CSS length.
- **`<k-html-editor>`:** the read-only `floatingRoom` property gives the pixels of room the floating toolbars need above and below.
- **New icons** used by the page builder.

### Changed

- **BREAKING: `kc-audio-track` is now `<k-audio-track>`.** It is a component of its own, in `AudioTrack.js`, and not a control.
- **`kempo-css` is now a dev dependency.** Installing kempo-ui no longer installs it. Without `pathToStylesheet`, components load kempo-css from the jsdelivr CDN (`kempo-css@2`), and `pathToStylesheet` can point at your own copy. The docs use the installed copy, which `npm run build` copies to `docs/kempo.min.css`.
- **`<k-main>`:** the content is clipped at the sides (`overflow-x: clip`), so a fullscreen breakout, which is as wide as the page, cannot give the page a horizontal scrollbar.
- **`<k-content-slider>`:** the previous and next buttons are disabled on the first and last slide unless `loop` is on, and `previous()` and `next()` do nothing there, with no events.
- **`<k-control-bar>`:** a `<k-menu>` moves as one unit, a split group or menu hides once it is empty, and the play and skip controls of `<k-video>` and `<k-audio>` have priorities, with play/pause never collapsing.
- **`<k-audio>` and `<k-video>`:** the artist shown is the album artist when the file has one.
- **Controls disabled by the page:** a control that the page disables stays disabled, and only a disabled state set because its host lacks the methods it needs is cleared again.

## [1.1.0] - 2026-11-03
### Added

- **`<k-aside-btn>`:** a small floating button in a corner that opens and closes an `<k-aside>` (`for="id"`). It is hidden under an open aside by default, or `push` keeps it beside the aside. The menu icon is the default slot content and can be replaced; it extends `Button`, so classes restyle it. It is dimmed to 70% opacity until hovered or focused. Show or hide it by breakpoint with the kempo-css classes (`class="d-n m-d-b"`, mobile only).
- **`<k-aside mobile-main>`:** the aside uses `main` above 768px wide and `mobile-main` at or below it, e.g. `main="push" mobile-main="overlay"`. A collapsed overlay shows its rail over the content. `push-from-offscreen="collapsed"` and `overlay-from-collapsed="offscreen"` (both optional) set the state when the layout changes, so a hidden aside can be reopened on desktop and a rail does not stay over the content on mobile.

### Changed

- **`<k-aside>` breakpoint is 768px.** `mobile-main` applies at or below 768px and `main` above it, which matches kempo-css's mobile range (the `m-` classes).
- **`<k-aside>` overlay toggle is an X.** In the overlay layout the header toggle shows an X that hides the aside. A pushed aside keeps the arrow, which collapses it to its rail.
- **`<k-aside>` collapsed overlay shows its rail.** A collapsed aside with an overlay layout stays visible as a rail over the content, and `<k-main>` reserves room for it.

## [1.0.0] - 2026-11-02
### Added

- **`<k-chat-bubble>`:** a round floating chat button that opens a chat popup, for customer service or any LLM you connect.
- **`<k-audio>`:** a sound player with a playlist, built from the same `kc-media-*` controls as `<k-video>`.
- **`<k-control-bar>`:** a single-row toolbar that moves controls into a "more" menu when there is no room.
- **`kc-nav-link`:** a link control for navigation bars.
- **`conversations` util:** saves chat conversations in IndexedDB.
- **`promptApi` util:** talks to the browser's built-in language model. VERY EXPERIMENTAL: in testing it could not answer a single question correctly, so do not rely on it.
- **`<k-markdown-editor no-resize>`:** removes the drag handle, so the editor keeps the height of `--height`.
- **`<k-table controls="minimal|normal|full">`:** preconfigured toolbars.

### Changed

- **BREAKING: this release needs a major version bump (1.0.0).**
- **BREAKING: `<k-chat>` defaults to a plain box, not the editor.** The editor with tabs and a toolbar is `input="markdown-editor"`. The default has no drag handle; `markdown-resize` adds one under the editor and `resize` adds one under the whole chat. `<k-chat>` also gains `input`, `persistent-id`, `prompt-api`, `empty-message` and slots for your own controls.
- **BREAKING: the media controls are renamed.** The shared controls `kc-vid-*` are now `kc-media-*` (for example `kc-vid-play-pause` is `kc-media-play-pause`), and they work with `<k-audio>` too. The video-only controls `kc-vid-menu`, `kc-vid-pip` and `kc-vid-play-big` keep their names. `kc-media-loop` is now `kc-media-repeat` (it repeats the current track), and `kc-audio-loop` loops a playlist.
- **Package contents:** the npm package now contains only `src`, `dist`, `bin`, `icons`, `llms.txt`, the README, the licence and this changelog (it was about 107 MB and 1,400 files, including the docs source, tests and screenshots). The `main` entry, which pointed at a missing `index.js`, is removed: import components by file, as the README shows.
- **`<k-video>`:** the `top` slot is an overlay on the picture, not a bar above it. It reads the title, artist, album and year from the file.
- **`<k-nav>`** is now a `<k-control-bar>`: it has `center` and `right` slots, and its items move into a "more" menu when they no longer fit.
- **Preset toolbars** (`controls="minimal|normal|full"` on the editors, `<k-video>`, `<k-audio>`, `<k-pagination>` and `<k-table>`) are control bars that collapse into a "more" menu on narrow screens.
- **Controls are 40px tall** (`--control_height`). Icon-only controls show their label when they are in a menu.
- **`kc-pg-goto-page`** is a number input, not a combobox.
- **`<k-html-editor>`** gains `layout="floating"`, a `stylesheet` property, `nodes` that load from a URL, and a `toolbar-top-extra` slot.

### Fixed

- **`<k-code-editor>`** no longer keeps its widest width, so it shrinks with its container and does not force a horizontal scrollbar.
- **`<k-sortable-item>`** drag handles work again after an item is moved in the DOM.
- **`<k-tabs fixed-height>`** no longer shows a sideways scrollbar.
- **`<k-html-editor>`** toolbar presses keep the focus in the text, and the toolbar text colour follows `--tc`.
- **Code in `<k-chat>` messages** has its own background, so it stands out from the message bubble.
- **No flash of the wrong theme on load:** the theme util docs show a one-line script that sets the `theme` attribute before the first paint.

## [0.7.2] - 2026-10-27
### Fixed

- **`k-sortable-item` fills its row:** its content takes the full width of the item and the row is centred vertically, so a control in the row lines up with the text beside it.

## [0.7.0] - 2026-10-25
### Added

- **`Table` record links:** a record can carry a `_url` property. It is never rendered as a column (auto-extracted fields skip it), so it only reaches controls and the row click below.
- **`kc-tc-open` row control:** a `slot="before"` or `slot="after"` control that navigates to the record's `_url`, in the current tab, or in a new tab with `target="_blank"`. Its default icon is `visibility` (current tab) or `open_in_browser` (new tab); slot a `k-icon` into it to replace the icon.
- **`Table` `open-on-click`:** clicking a row that has a `_url` opens it in the current tab. Clicks on row controls, checkboxes and inputs, and rows being edited, do not trigger it. `row-target="_blank"` opens the row in a new tab instead, the same way `target` works on a link. Rows with a `_url` show a pointer cursor when this is set.
- **Icons:** `visibility` and `open_in_browser` (Material Symbols).
- **`k-tabs` fires `tabfirstshown`**: once for each tab, the first time it is shown, with `detail.tab`. A component inside a tab listens for it on the `k-tabs` and loads its data then, instead of when the page opens.
- **`k-tabs` hash routing:** `hash-routing` makes the open tab the address hash (`#tab3`). Refreshing reopens that tab, and back and forward move between tabs. Selecting the first tab clears the hash. Off by default; one per page, since tabs would share the hash.
- **Tab content no longer clips the focus ring:** `k-tab-content` scrolls, so the ring around a control as wide as the content was cut off at the sides and bottom. It now has a quarter rem of room inside, taken back with an equal negative margin, so nothing moves.
 - `AsideItem`: `icon-src` and `group-icon-src`, the path to an SVG file, for an icon that ships with an extension instead of one in the shared icon folders (`<k-aside-item icon-src="/products/icons/products.svg">`). It renders `<k-icon src>`, so `icon` and `group-icon`, which are names, are unchanged. `AsideMenu` has `icon-src` too. For a menu built from a `group`, the icon is `group-icons` (a name), then `group-icon-src`, then `group-icon`, then `folder`.
 - `Aside`: **item groups**. Give a `k-aside-item` a `group` and the aside builds the menu itself: a group name used by one item leaves that item a normal link, and as soon as two or more items share it (`group-min` on the aside, default `2`) they are wrapped in a `k-aside-menu` placed where the first one was. If the group falls back below the minimum, the menu is removed and the remaining item is a normal link again, so the result only depends on the items present. Meant for navigation that several independent parts of an app contribute to. The menu icon is, in order, the aside's `group-icons` (a JSON map of group name to icon), the first `group-icon` attribute among the items, then `folder`; a menu holding the `active` item opens by itself. Only direct children of the aside are considered, and `k-aside-menu`s written by hand are never touched.
 - `ImageCrop` (`<k-image-crop>`): a new component for uploading and cropping an image. Shows an **Upload Image** button and drop zone; once an image is loaded, a canvas-rendered editor with a draggable, 8-handle crop box (also keyboard-adjustable) lets the user crop it free-form, or locked to an `aspect-ratio` (`1`, `16/9`, `4:3`...). `max-width`/`max-height` cap the output size — larger crops are scaled down keeping their ratio, smaller ones are never upscaled — so e.g. any upload can be reduced to a 512×512 profile image. Form-associated: with a `name`, the cropped image is submitted as a `File` like `<input type="file">`, `required` participates in validation, and form reset clears it (or restores `src`). Script API: `loadImage()`, `clear()`, `toBlob()`, `toFile()`, `toDataURL()`, `getCroppedCanvas()`, the settable `crop` rectangle, `outputSize` and `hasImage`; fires `change`, `load` and `error`. Output type/quality are configurable via `type` and `quality`.
 - `CardGrid`: a new component, a generic version of `Table` for content that reads better as a grid of `Card` tiles than table rows. Its selection, pagination and record-CRUD API deliberately match `Table` method-for-method and event-for-event (`getSelectedRecords`, `selectAllOnPage`, `deselectAllOnPage`, `allOnPageSelected`, `selectionChange`, `deleteSelected`, `requestDelete`, etc.), and — like `Table` — it sets `controlled` on itself in `connectedCallback`, which is what `Control`'s `closest('[controlled]')` host lookup relies on. The practical result: any `kc-tc-*` control (or a custom one built the same way on `Control`/`ButtonControl`) works inside a `CardGrid`'s `slot="top"` exactly as it would inside a `Table`'s, with no changes to the control itself. One `cardTemplate(record, host)` function stands in for `Table`'s per-column `fields`/`calculator`, since a card is one opaque unit rather than a row of independently addressable cells — sorting, filtering, search and inline editing are all column-shaped concepts with no equivalent here, and are intentionally not implemented. Also matches `Table`'s per-row `slot="before"`/`slot="after"` controls: a control template registered once as a light-DOM child gets cloned fresh into every tile (top or bottom of the card respectively), the same limitation and all — only tag and attributes survive the clone, not properties, so a per-tile control resolves its own record by walking up to its own `.tile`'s `data-index` and reading `host.records[index]`, the same pattern kempo core's own `AdminTableControl.record` uses for `Table`. The selection checkbox renders as the first item inside that same `slot="before"` strip rather than as a separate absolutely-positioned overlay — from the tile's perspective it IS the first before-control, just one `CardGrid` supplies itself. `.tile-controls-before` is right-aligned; `.tile-controls-after` is a plain flex row with no alignment opinion of its own — a consumer wanting its content pushed to the far edge (an actions menu, say) adds its own flex-spacer control rather than relying on `justify-content`, since a control registered for either strip can legitimately choose to render hidden for a given record (a file-only control cloned onto a folder tile, for instance), and `justify-content` has no way to account for that. Either strip collapses to nothing — `display: none`, no leftover padding — once every one of its children is hidden, rather than showing an empty band.
 - Four new icons: `public`, `public_off`, `check_circle`, `cancel` (Material Symbols), for anything needing a visibility or approval toggle distinct from the existing `show`/`hide`/`star_filled`/`warning` status icons.
 - `Card`: `--card_padding` and `--card_margin` custom properties. Both were hardcoded to `var(--spacer)` inside the shadow root and so unreachable from outside, which made a card unusable as a grid tile — media could not sit flush to the border, and the trailing margin fought the grid's own gap. Defaults are unchanged. Follows the existing `--aside_padding` convention on `Aside`.
 - `SegmentedControl`: `persistent-id`, matching the existing convention on `Aside`, `Tabs` and `Accordion` — set it and the chosen value survives a reload via `localStorage` (`segmented-control-persistent-id-<id>`), restored on connect and saved on every change, including from a form reset. A stored value overrides whatever the `value` attribute was authored with, same as the other components.

### Changed
 - The `download` icon is the Material Symbols one (an arrow into a tray) instead of a hand-drawn arrow over a bar, so it matches the rest of the set. Turn it with `rotation="180"` for an upload or import button instead of a second icon.

### Fixed
 - `Dialog`: a dialog taller than the window ran off the screen, with its buttons out of reach. The body now scrolls inside the dialog, and the title and buttons stay in view.
 - `Toast`: a toast was always 32px narrower than its own content, so any message longer than its `min-width` (16rem) wrapped, and its action button wrapped with it ("View / cart"). `max-width: calc(100% - 2 * spacer)` was a percentage of the container, which is itself sized to its toasts. It is now `calc(100vw - 64px)`, so a toast is as wide as its content until it reaches the edge of the screen.
 - `Toast`: the action button's text was always the primary text colour (`--tc_primary`, blue), whatever the toast's background, so on a themed toast (`bg-success`, `bg-warning`, `bg-danger`) it was unreadable blue on green, orange or red. On a themed toast it now uses that theme's `--tc_on_success` / `--tc_on_warning` / `--tc_on_danger`, the same colour as the message, including on hover. Only the colour changes: a plain toast keeps `--tc_primary`.
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
