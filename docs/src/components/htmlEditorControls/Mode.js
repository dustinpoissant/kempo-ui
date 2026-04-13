import t from"./HtmlEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static properties={mode:{type:String,reflect:!0}};connectedCallback(){super.connectedCallback(),this.updateMode(),this.editor?.addEventListener("mode-changed",()=>this.updateMode())}handleClick=()=>{this.editor&&this.editor.toggleMode()};updateMode(){this.editor&&(this.mode=this.editor.mode)}static styles=[t.styles,o`
      :host {
        display: inline-flex;
      }
    `];render(){const t="code"===this.mode?`${this.buttonClasses} bg-primary`:this.buttonClasses;return e`
      <button class="${t}" @click="${this.handleClick}">
        <k-icon name="code"></k-icon>
      </button>
    `}}customElements.define("k-hec-mode",s);