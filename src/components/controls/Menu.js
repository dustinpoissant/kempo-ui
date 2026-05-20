import Control from './Control.js';
import { css, html } from '../../lit-all.min.js';
import '../Dropdown.js';
import '../Icon.js';

/*
  Base class for dropdown-style controls. The trigger button is provided
  by this base; subclasses just provide children via the default slot
  (and optionally <slot name="icon"> / <slot name="label">).

  Items slotted into the menu have their individual borders/radii
  overridden so the menu reads as a single unified surface.
*/
export default class ControlMenu extends Control {
  static properties = {
    ...Control.properties,
    opened: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.opened = false;
  }

  /*
    Event Handlers
  */
  handleToggle = () => { this.opened = !this.opened; };
  handleOpened = () => { this.opened = true; };
  handleClosed = () => { this.opened = false; };

  /*
    Rendering
  */
  render() {
    return html`
      <k-dropdown
        ?opened=${this.opened}
        @opened=${this.handleOpened}
        @closed=${this.handleClosed}
      >
        <button slot="trigger" class="no-btn icon-btn">
          <slot name="icon"><k-icon name="arrow_drop_down"></k-icon></slot>
          <slot name="label"></slot>
        </button>
        <slot></slot>
      </k-dropdown>
    `;
  }

  /*
    Styles
  */
  static styles = [
    Control.styles,
    css`
      :host {
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        margin: var(--spacer_q);
      }

      k-dropdown {
        display: inline-flex;
      }

      button[slot="trigger"] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-width: 2.5rem;
        min-height: 2.5rem;
        padding: 0 0.75rem;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: inherit;
      }

      /* Slotted menu items: remove individual borders/radii so the menu
         reads as a single unified surface. */
      ::slotted(:not([slot="icon"]):not([slot="label"])) {
        display: block !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        border-bottom: 1px solid var(--c_border) !important;
      }
      ::slotted(:not([slot="icon"]):not([slot="label"]):last-child) {
        border-bottom: none !important;
      }
    `
  ];
}

customElements.define('kc-menu', ControlMenu);
