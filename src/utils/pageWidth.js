/*
  Publishes the width of the page without its scrollbar as the custom property --page-width on the root element, and keeps it
  up to date. The Page Builder's Fullscreen breakout (and a Hero's breakout) is as wide as this: 100vw includes the vertical
  scrollbar in most browsers, which would make the page scroll sideways. Import it for its effect; it exports nothing.
*/
const root = document.documentElement;

new ResizeObserver(() => root.style.setProperty('--page-width', `${root.clientWidth}px`)).observe(root);
root.style.setProperty('--page-width', `${root.clientWidth}px`);
