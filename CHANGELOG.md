# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.19] - 2026-05-04
### Added
- **Pagination component** (`<k-pagination>`): Full-featured pagination with composable control sub-components
  - `total-items` and `items-per-page` attributes control page count; `items-per-page` defaults to 10
  - `controls` attribute accepts `"simple"` (prev / page-info / next) or `"full"` (first / prev / goto-page / next / last / items-per-page) preconfigured sets, or leave blank to slot controls manually
  - `setPage(n)`, `nextPage()`, `previousPage()` methods for programmatic navigation; all clamp to valid range
  - Fires `page-change` event on every navigation with `{ currentPage, totalPages, itemsPerPage, totalItems }` detail
  - **Control sub-components** (all auto-wire to their nearest parent `<k-pagination>`):
    - `<k-pg-first>` — navigates to page 1; disabled when already on first page
    - `<k-pg-prev>` — navigates to previous page; disabled on first page
    - `<k-pg-next>` — navigates to next page; disabled on last page
    - `<k-pg-last>` — navigates to last page; disabled when already on last page
    - `<k-pg-page-info>` — static "Page X of Y" text display
    - `<k-pg-goto-page>` — dropdown `<select>` listing every page for direct navigation
    - `<k-pg-count>` — inline text node showing total page count
    - `<k-pg-items-per-page>` — dropdown to change items per page (10 / 25 / 50 / 100)

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
