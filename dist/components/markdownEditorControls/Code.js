import t from"./MarkdownEditorControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class o extends t{constructor(){super(),this.label="Code"}command(){this.getSelection().text.includes("\n")?this.wrapSelection("```\n","\n```","code"):this.wrapSelection("`","`","code")}render(){return e`
      <button
        type="button"
        class=${this.btnClass}
        title=${this.label}
        aria-label=${this.label}
        @click=${this.handleClick}
      >
        <k-icon name="code"></k-icon>
      </button>
    `}}customElements.define("k-md-code",o);