// window.kempo.overlayRoot lets a host page keep fixed-position portal elements (toasts,
// dialogs, and anything else meant to render above the whole app) out of chrome it draws
// itself — e.g. a custom titlebar in an Electron app — by naming a CSS selector to append
// them into instead of document.body. Resolved lazily, only when a portal element is
// actually created, so it can be set at any point before that — no load-order requirement
// on the host page.
export default () => (window.kempo?.overlayRoot && document.querySelector(window.kempo.overlayRoot)) || document.body;
