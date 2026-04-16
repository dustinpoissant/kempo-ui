export default {
  customRoutes: {
    "icons/**": "../icons/**",
    "src/**": "../src/**",
    "media/**": "../docs/media/**",
    "kempo-hljs.css": "../docs/kempo-hljs.css",
    "kempo-vars.css": "../docs/kempo-vars.css",
    "kempo.min.css": "../docs/kempo.min.css",
    "styles.css": "../docs/styles.css",
    "manifest.json": "../docs/manifest.json"
  },
  templating: {
    ssr: true,
    ssrPriority: true
  },
  "middleware": {
    "security": {
      "enabled": true,
      "headers": {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "X-XSS-Protection": "1; mode=block"
      }
    }
  }
};
