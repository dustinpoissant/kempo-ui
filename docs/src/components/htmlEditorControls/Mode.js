import e from"./HtmlEditorControl.js";import{html as t,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class s extends e{static properties={mode:{type:String,reflect:!0}};hidesInCodeMode=!1;connectedCallback(){super.connectedCallback(),this.updateMode(),this.editor?.addEventListener("mode-changed",()=>this.updateMode())}handleClick=()=>{this.editor&&this.editor.toggleMode()};updateMode(){this.editor&&(this.mode=this.editor.mode)}static styles=[e.styles,o`
      :host {
        display: inline-flex;
      }
    `];render(){const e="code"===this.mode?`${this.buttonClasses} bg-primary`:this.buttonClasses;return t`
      <button class="${e}" @click="${this.handleClick}">
        <k-icon name="code"></k-icon>
      </button>
    `}}customElements.define("k-hec-mode",s);