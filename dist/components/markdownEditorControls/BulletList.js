import t from"./MarkdownEditorControl.js";import{html as l}from"../../lit-all.min.js";import"../Icon.js";export default class e extends t{constructor(){super(),this.label="Bulleted list"}command(){this.insertLinePrefix("- ")}render(){return l`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="format_list_bulleted"></k-icon>
      </button>
    `}}customElements.define("k-md-bullet-list",e);