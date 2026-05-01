import t from"./MarkdownEditorControl.js";import{html as i}from"../../lit-all.min.js";import"../Icon.js";export default class l extends t{constructor(){super(),this.label="Italic (Cmd/Ctrl+I)"}command(){this.wrapSelection("_","_","italic text")}render(){return i`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="format_italic"></k-icon>
      </button>
    `}}customElements.define("k-md-italic",l);