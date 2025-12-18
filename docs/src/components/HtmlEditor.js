import{html,css}from"../lit-all.min.js";import ShadowComponent from"./ShadowComponent.js";export default class HtmlEditor extends ShadowComponent{static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},mode:{type:String,reflect:!0}};constructor(){super(),this.internals=this.attachInternals(),this.name="",this.value="",this.mode="markup"}connectedCallback(){super.connectedCallback(),this.hasAttribute("value")&&(this.value=this.getAttribute("value"))}updated(t){super.updated(t),t.has("value")&&(this.updateFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))),t.has("mode")&&this.syncContent()}firstUpdated(){this.editorEl=this.shadowRoot.querySelector(".editor"),this.textareaEl=this.shadowRoot.querySelector("textarea"),this.value&&this.syncContent()}updateFormValue(){this.internals.setFormValue(this.value)}formResetCallback(){this.value=""}formStateRestoreCallback(t){this.value=t}handleEditorInput=()=>{"markup"===this.mode&&(this.value=this.editorEl.innerHTML)};handleTextareaInput=t=>{"code"===this.mode&&(this.value=t.target.value)};handleEditorPaste=t=>{t.preventDefault();const e=t.clipboardData.getData("text/plain");document.execCommand("insertText",!1,e)};setMode(t){return["markup","code"].includes(t)&&(this.mode=t),this}toggleMode(){return this.mode="markup"===this.mode?"code":"markup",this}getValue(){return this.value}setValue(t){return this.value=t,this.syncContent(),this}clear(){return this.value="",this.syncContent(),this}bold(){return this.execCommand("bold"),this}italic(){return this.execCommand("italic"),this}underline(){return this.execCommand("underline"),this}strikethrough(){return this.execCommand("strikeThrough"),this}orderedList(){return this.execCommand("insertOrderedList"),this}unorderedList(){return this.execCommand("insertUnorderedList"),this}alignLeft(){return this.execCommand("justifyLeft"),this}alignCenter(){return this.execCommand("justifyCenter"),this}alignRight(){return this.execCommand("justifyRight"),this}alignJustify(){return this.execCommand("justifyFull"),this}removeFormat(){return this.execCommand("removeFormat"),this}formatBlock(t){return this.execCommand("formatBlock",t),this}insertHTML(t){return this.execCommand("insertHTML",t),this}getSelection(){if("markup"!==this.mode)return null;this.editorEl.focus();const t=window.getSelection();if(!t.rangeCount)return null;const e=t.getRangeAt(0);return this.editorEl.contains(e.commonAncestorContainer)?{text:t.toString(),html:e.cloneContents().textContent?(new XMLSerializer).serializeToString(e.cloneContents()):"",range:e,selection:t}:null}getSelectedText(){const t=this.getSelection();return t?t.text:""}getSelectedHTML(){const t=this.getSelection();return t?t.html:""}setSelection(t,e,r,i){if("markup"!==this.mode)return this;this.editorEl.focus();const o=window.getSelection(),n=document.createRange();return n.setStart(t,e),n.setEnd(r,i),o.removeAllRanges(),o.addRange(n),this}selectAll(){return"markup"===this.mode?this.execCommand("selectAll"):this.textareaEl.select(),this}replaceSelection(t){if("markup"!==this.mode)return this;const e=this.getSelection();if(!e)return this;e.range.deleteContents();const r=e.range.createContextualFragment(t);return e.range.insertNode(r),this.value=this.editorEl.innerHTML,this}deleteSelection(){if("markup"===this.mode)this.execCommand("delete");else{const t=this.textareaEl.selectionStart,e=this.textareaEl.selectionEnd;this.textareaEl.value=this.textareaEl.value.substring(0,t)+this.textareaEl.value.substring(e),this.value=this.textareaEl.value}return this}insertAtCursor(t){return this.insertHTML(t),this}createLink(t){return this.execCommand("createLink",t),this}unlink(){return this.execCommand("unlink"),this}insertImage(t){return this.execCommand("insertImage",t),this}undo(){return this.execCommand("undo"),this}redo(){return this.execCommand("redo"),this}execCommand(t,e=null){"markup"===this.mode&&(this.editorEl.focus(),document.execCommand(t,!1,e),this.value=this.editorEl.innerHTML)}syncContent(){this.editorEl&&this.textareaEl&&("markup"===this.mode?this.editorEl.innerHTML=this.value:this.textareaEl.value=this.value)}static styles=css`
		:host {
			display: flex;
			flex-direction: column;
			gap: 0;
		}

		.toolbar-top,
		.toolbar-bottom {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem;
			background: var(--bg-secondary);
			border: 1px solid var(--border-color);
		}

		.toolbar-top {
			border-bottom: none;
		}

		.toolbar-bottom {
			border-top: none;
		}

		.editor-container {
			position: relative;
			flex: 1;
			min-height: 200px;
		}

		.editor,
		textarea {
			width: 100%;
			height: 100%;
			min-height: 200px;
			padding: 1rem;
			border: 1px solid var(--border-color);
			background: var(--bg-primary);
			color: var(--text-primary);
			font-family: inherit;
			font-size: inherit;
			line-height: 1.5;
			overflow: auto;
		}

		.editor {
			outline: none;
		}

		.editor:focus {
			border-color: var(--primary-color);
		}

		textarea {
			resize: vertical;
			font-family: monospace;
		}

		textarea:focus {
			outline: none;
			border-color: var(--primary-color);
		}

		.editor[hidden],
		textarea[hidden] {
			display: none;
		}
	`;render(){return html`
			<div class="toolbar-top">
				<slot name="toolbar-top"></slot>
			</div>
			
			<div class="editor-container">
				<div 
					class="editor" 
					contenteditable="true"
					?hidden=${"markup"!==this.mode}
					@input=${this.handleEditorInput}
					@paste=${this.handleEditorPaste}
				></div>
				
				<textarea
					?hidden=${"code"!==this.mode}
					@input=${this.handleTextareaInput}
				></textarea>
			</div>
			
			<div class="toolbar-bottom">
				<slot name="toolbar-bottom"></slot>
			</div>
		`}}customElements.define("kempo-html-editor",HtmlEditor);