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
      pathToIcons: '/icons'
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
