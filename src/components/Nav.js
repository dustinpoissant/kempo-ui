import { html, css } from '../lit-all.min.js';
import ControlBar from './ControlBar.js';

/*
  A navigation bar that never wraps: the links and buttons that no longer fit are moved, one at a time,
  into a vertical-ellipsis "more" menu, and come back as the bar grows. It is a k-control-bar with the
  default slot (the left, which also holds spacers that push the rest to the right), `center` and `right`.
  Every child can move (links, buttons, a search box, a theme switcher) except spacers (`.flex`), menus, dropdowns and
  anything marked `no-collapse`. `priority` and `soft-min-width` work as in k-control-bar.
*/
export default class Nav extends ControlBar {
  static nonCollapsible = `${ControlBar.nonCollapsible}, .flex`;

  static properties = {
    ...ControlBar.properties,
    fixed: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.fixed = false;
  }

  /* A nav is not inside a controlled component, so there is no host to mark. */
  findControlHost = () => null;

  /*
    Rendering
  */
  render() {
    return html`
      <nav id="bar">
        <div class="section"><slot></slot></div>
        <div class="section" id="center"><slot name="center"></slot></div>
        <div class="section">
          <slot name="right"></slot>
          <kc-menu id="more" title="More" hidden>
            <k-icon slot="icon" name="more_vert"></k-icon>
            <div><div id="tray"><slot name="overflow"></slot></div></div>
          </kc-menu>
        </div>
      </nav>
    `;
  }

  /*
    Styles
  */
  static styles = [
    ControlBar.styles,
    css`
      :host {
        display: block;
        flex: none;
        min-width: 0;
        --bar_border: transparent;
      }
      :host([fixed]) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
      }
      #bar {
        width: 100%;
      }
      .section:first-child {
        flex: 1 1 auto;
      }
      ::slotted(a) {
        display: inline-block;
        padding: var(--spacer);
        text-decoration: none !important;
      }
      ::slotted(.link) {
        display: inline-block;
        padding: var(--spacer) !important;
        text-decoration: none !important;
      }
    `
  ];
}

customElements.define('k-nav', Nav);
