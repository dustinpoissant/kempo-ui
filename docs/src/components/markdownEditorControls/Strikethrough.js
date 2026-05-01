import t from"./MarkdownEditorControl.js";import{html as r}from"../../lit-all.min.js";import"../Icon.js";export default class e extends t{constructor(){super(),this.label="Strikethrough"}command(){this.wrapSelection("~~","~~","strikethrough")}render(){return r`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="format_strikethrough"></k-icon>
      </button>
    `}}customElements.define("k-md-strikethrough",e);