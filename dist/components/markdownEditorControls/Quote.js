import t from"./MarkdownEditorControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class o extends t{constructor(){super(),this.label="Quote"}command(){this.insertLinePrefix("> ")}render(){return e`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="format_quote"></k-icon>
      </button>
    `}}customElements.define("k-md-quote",o);