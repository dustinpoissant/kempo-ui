import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import '../Dropdown.js';

/*
  Menu control. Renders as a single toolbar button that, when clicked, opens
  a Dropdown containing whatever child controls have been slotted in. Useful
  for grouping less-frequent actions (like the heading picker) so they don't
  take up space in the main toolbar.

  The trigger button content is fully customizable via the `trigger` slot —
  drop in whatever combination of icons / text you want. If nothing is
  slotted, a default `menu` icon is shown.

  The default slot is the menu's items.

  Example (default trigger):
    <k-md-menu label="Heading">
      <k-md-format-block tag="h1"></k-md-format-block>
      ...
    </k-md-menu>

  Example (custom trigger showing a heading-range icon):
    <k-md-menu label="Heading">
      <span slot="trigger">
        <k-icon name="format_h1"></k-icon> - <k-icon name="format_h6"></k-icon>
      </span>
      <k-md-format-block tag="h1"></k-md-format-block>
      ...
    </k-md-menu>
*/
export default class MarkdownMenu extends MarkdownEditorControl {
  constructor() {
    super();
    this.label = 'Menu';
  }

  /*
    The trigger is wired to Dropdown's own click handling, so the
    base-class handleClick (which calls command()) would fire on top and
    create a feedback loop. command() is a no-op here; child controls inside
    the dropdown drive their own commands.
  */
  command() {}

  render() {
    return html`
      <k-dropdown>
        <button
          slot="trigger"
          type="button"
          class=${this.btnClass}
          title=${this.label}
          aria-label=${this.label}
        >
          <slot name="trigger">
            <k-icon name="menu"></k-icon>
          </slot>
        </button>
        <slot></slot>
      </k-dropdown>
    `;
  }

  static styles = [
    MarkdownEditorControl.styles,
    css`
      :host {
        display: inline-flex;
      }
      k-dropdown {
        display: inline-flex;
      }
      /* Stretch slotted menu items so each one fills the dropdown
         horizontally — Dropdown's built-in styles only target raw
         <a>/<button> children, so custom-element items need this themselves. */
      ::slotted(:not([slot="trigger"])) {
        display: block;
        width: 100%;
      }
    `
  ];
}

customElements.define('k-md-menu', MarkdownMenu);
