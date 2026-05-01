import t from"./MarkdownEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";import"../Dropdown.js";export default class s extends t{constructor(){super(),this.label="Menu"}command(){}render(){return e`
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
    `}static styles=[t.styles,o`
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
    `]}customElements.define("k-md-menu",s);