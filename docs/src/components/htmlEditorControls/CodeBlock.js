import t from"./HtmlEditorControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class i extends t{static properties={editorMode:{type:String,state:!0}};static styles=[t.styles,o`
			:host {
				display: inline-flex;
			}
		`];connectedCallback(){super.connectedCallback(),this.updateEditorMode(),this.editor?.addEventListener("mode-changed",()=>this.updateEditorMode())}handleMouseDown=t=>{t.preventDefault(),t.stopPropagation(),this.editor&&this.editor.formatBlock(this.isInCodeBlock()?"p":"pre")};isInCodeBlock(){if(!this.editor?.lexicalEditor)return!1;let t=!1;const{lexical:e,code:o}=this.editor.lx;return this.editor.lexicalEditor.getEditorState().read(()=>{const i=e.$getSelection();if(!e.$isRangeSelection(i))return;const s=i.anchor.getNode().getTopLevelElementOrThrow();t=o.$isCodeNode(s)}),t}updateEditorMode(){this.editor&&(this.editorMode=this.editor.mode)}render(){return this.hidden="code"===this.editorMode,e`
			<button class="${this.buttonClasses}" @mousedown="${this.handleMouseDown}">
				<slot name="icon">
					<k-icon name="code_blocks"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`}}customElements.define("k-hec-code-block",i);