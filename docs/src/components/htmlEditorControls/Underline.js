import t from"./HtmlEditorControl.js";import{html as e,css as i}from"../../lit-all.min.js";import"../Icon.js";export default class o extends t{static properties={editorMode:{type:String,state:!0}};static styles=[t.styles,i`
			:host {
				display: inline-flex;
			}
		`];connectedCallback(){super.connectedCallback(),this.updateEditorMode(),this.editor?.addEventListener("mode-changed",()=>this.updateEditorMode())}handleClick=()=>{this.editor&&this.editor.underline()};updateEditorMode(){this.editor&&(this.editorMode=this.editor.mode)}render(){return this.hidden="code"===this.editorMode,e`
			<button class="${this.buttonClasses}" @click="${this.handleClick}">
				<slot name="icon">
					<k-icon name="format_underlined"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`}}customElements.define("k-hec-underline",o);