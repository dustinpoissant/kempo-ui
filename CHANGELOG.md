# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
