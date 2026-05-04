# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
