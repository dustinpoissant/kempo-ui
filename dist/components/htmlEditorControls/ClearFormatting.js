import t from"./HtmlEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static properties={editorMode:{type:String,state:!0}};static styles=[t.styles,o`
			:host {
				display: inline-flex;
			}
		`];connectedCallback(){super.connectedCallback(),this.updateEditorMode(),this.editor?.addEventListener("mode-changed",()=>this.updateEditorMode())}handleMouseDown=t=>{t.preventDefault(),t.stopPropagation(),this.editor&&this.editor.removeFormat()};updateEditorMode(){this.editor&&(this.editorMode=this.editor.mode)}render(){return this.hidden="code"===this.editorMode,e`
			<button class="${this.buttonClasses}" @mousedown="${this.handleMouseDown}">
				<slot name="icon">
					<k-icon name="format_clear"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`}}customElements.define("k-hec-clear-formatting",s);