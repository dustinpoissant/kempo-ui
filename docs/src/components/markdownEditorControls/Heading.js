import e from"./MarkdownEditorControl.js";import{html as t}from"../../lit-all.min.js";import"../Icon.js";import{bound as i}from"../../utils/number.js";export default class r extends e{static properties={...e.properties,level:{type:Number,reflect:!0}};constructor(){super(),this.level=2,this.label="Heading"}command(){const e=i(Number(this.level)||2,1,6);this.insertLinePrefix("#".repeat(e)+" ",/^#{1,6} /)}render(){const e=i(Number(this.level)||2,1,6);return t`
      <button
        type="button"
        class=${this.btnClass}
        title="${this.label} ${e}"
        aria-label="${this.label} ${e}"
        @click=${this.handleClick}
      >
        <k-icon name="format_h${e}"></k-icon>
      </button>
    `}}customElements.define("k-md-heading",r);