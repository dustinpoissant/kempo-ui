import t from"./HtmlEditorControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class o extends t{static properties={editorMode:{type:String,state:!0}};connectedCallback(){super.connectedCallback(),this.updateEditorMode(),this.editor?.addEventListener("mode-changed",()=>this.updateEditorMode())}handleClick=()=>{this.editor&&this.editor.alignLeft()};updateEditorMode(){this.editor&&(this.editorMode=this.editor.mode)}render(){return this.hidden="code"===this.editorMode,e`
			<button class="${this.buttonClasses}" @click="${this.handleClick}">
				<slot name="icon">
					<k-icon name="format_align_left"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`}}customElements.define("k-hec-align-left",o);