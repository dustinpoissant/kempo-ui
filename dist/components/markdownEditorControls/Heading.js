import t from"./MarkdownEditorControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class i extends t{static properties={...t.properties,level:{type:Number,reflect:!0}};constructor(){super(),this.level=2,this.label="Heading"}command(){const t=Math.min(6,Math.max(1,Number(this.level)||2));this.insertLinePrefix("#".repeat(t)+" ",/^#{1,6} /)}render(){const t=Math.min(6,Math.max(1,Number(this.level)||2));return e`
      <button
        type="button"
        class=${this.btnClass}
        title="${this.label} ${t}"
        aria-label="${this.label} ${t}"
        @click=${this.handleClick}
      >
        <k-icon name="format_h${t}"></k-icon>
      </button>
    `}}customElements.define("k-md-heading",i);