# Kempo UI

A modern, lightweight web component library built with Lit, providing accessible and customizable UI components for web applications.

## Features

- **Web Components**: Standards-based, framework-agnostic components
- **Accessible**: Built with accessibility best practices
- **Customizable**: Easy theming and styling
- **Lightweight**: Minimal bundle size with minimal dependecnies/

## Getting Started

```bash
npm install kempo-ui
```

#### Set your configuration
```html
<html>
<head>
  <script>
    window.kempo = {
      pathToStylesheet: '/kempo.min.css',
      pathsToIcons: ['/icons']
    };
  </script>
</head>
<body>
  <!-- Content -->
</body>
</html>
```

## Quick Start

Import and use components in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <script type="module" src="node_modules/kempo-ui/index.js"></script>
</head>
<body>
  <k-tabs>
    <k-tab for="home">Home</k-tab>
    <k-tab for="about">About</k-tab>
    <k-tab-content name="home">
      <h2>Welcome Home</h2>
      <p>This is the home tab content.</p>
    </k-tab-content>
    <k-tab-content name="about">
      <h2>About Us</h2>
      <p>Learn more about our project.</p>
    </k-tab-content>
  </k-tabs>
</body>
</html>
```


## Icons

kempo-ui ships a small set of icons used internally by its components. The `<k-icon>` component can also serve icons from your own directory, so you can add project-specific icons alongside the built-in ones.

### Interactive picker (for humans)

Run a single command, type to filter, arrow keys to navigate, Enter to select:

```bash
npx kempo-icon
```

### Finding an icon (for scripts/LLMs)

Search the full Material Symbols library by name or tag:

```bash
npx kempo-listicons <search_term>
```

```bash
npx kempo-listicons chevron
# → chevron_right
#   chevron_left
#   keyboard_arrow_right
#   ...
```

### Downloading an icon

```bash
npx kempo-geticon <icon_name> [custom_name] [--dir <path>] [-y]
```

By default icons are saved to `icons/` in your project root. Use `--dir` to point to your own assets directory:

```bash
# Save to icons/ (default)
npx kempo-geticon format_bold

# Save to a custom directory
npx kempo-geticon format_bold --dir src/assets/icons

# Rename on download
npx kempo-geticon content_copy copy

# Auto-accept directional icon prompt
npx kempo-geticon chevron_left -y
```

**Directional icons:** Material Symbols has separate icons for each direction (`chevron_left`, `chevron_right`, etc.). kempo-ui only stores the right-facing version and uses the `direction` attribute to rotate it, so you only need one file per icon. If you pass a non-right directional name, the script will prompt you to download the right-facing variant instead and save it under the base name.

### Configuring icon directories

Tell kempo-ui where to look for icons in your page config. It checks directories in order and uses the first match, so your icons override the built-in ones:

```html
<script>
  window.kempo = {
    pathToStylesheet: '/kempo.min.css',
    pathsToIcons: ['/my-icons', '/node_modules/kempo-ui/icons']
  };
</script>
```

### Using icons in markup

```html
<k-icon name="format_bold"></k-icon>
<k-icon name="chevron" direction="left"></k-icon>
<k-icon name="chevron" direction="down"></k-icon>
```

| `direction` | Rotation |
|---|---|
| *(omitted)* | 0° — right |
| `down` | 90° |
| `left` | 180° |
| `up` | 270° |

---

## Documentation

 **Full Documentation**: [https://dustinpoissant.github.io/kempo-ui/](https://dustinpoissant.github.io/kempo-ui/)

The documentation includes:
- Component API references
- Interactive examples
- Usage guides
- Accessibility information
- Customization options

## Development

```bash
# Clone the repository
git clone https://github.com/dustinpoissant/kempo-ui.git
cd kempo-ui

# Install dependencies
npm install

# Start development server
npm run docs

# Run tests
npm test

# Build for production
npm run build
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style and conventions
- Testing guidelines
- Pull request process

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 2.0 Generic License](https://creativecommons.org/licenses/by-nc-sa/2.0/) - see the [LICENSE.md](LICENSE.md) file for details.

Built using [Lit](https://lit.dev/)
