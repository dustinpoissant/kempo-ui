import Control from './Control.js';
import { html, css, nothing } from '../../lit-all.min.js';

/*
  A link for a navigation bar (k-nav, k-control-bar). Put the icon (or any content) in the default slot, like
  the other controls. Its label, shown only while it is in the "more" menu, is the `menu-text` slot, which
  falls back to the `title` attribute. It does not need a controlled host.
*/
export default class NavLink extends Control {
  static properties = {
    ...Control.properties,
    href: { type: String, reflect: true },
    target: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.href = '';
    this.target = '';
  }

  updateHostSupport() {}

  render() {
    return html`
      <a
        href=${this.href || nothing}
        target=${this.target || nothing}
        rel=${this.target === '_blank' ? 'noopener' : nothing}
        aria-label=${this.title || nothing}
      ><slot></slot><slot name="menu-text">${this.title}</slot></a>
    `;
  }

  static styles = [
    Control.styles,
    css`
      a {
        display: inline-flex;
        align-items: center;
        gap: var(--spacer_h);
        box-sizing: border-box;
        height: 100%;
        min-width: var(--control_height, 40px);
        padding: 0 var(--spacer_h);
        justify-content: center;
        color: var(--tc_link);
        text-decoration: none;
        border-radius: var(--radius);
        outline: none;
        white-space: nowrap;
      }
      a:hover {
        background: oklch(from currentColor l c h / 0.15);
        color: var(--tc_link);
      }
      a:focus-visible {
        box-shadow: var(--focus_shadow);
      }
      :host([in-menu]) {
        padding: 0;
      }
      :host([in-menu]) a {
        width: 100%;
        height: auto;
        min-height: 2rem;
        justify-content: flex-start;
        padding: var(--spacer_h) var(--spacer);
        border-radius: 0;
        color: var(--tc);
      }
      :host([in-menu]) a:hover {
        color: var(--tc);
      }
    `
  ];
}

customElements.define('kc-nav-link', NavLink);
