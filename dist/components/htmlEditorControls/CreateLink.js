import e from"./HtmlEditorControl.js";import{html as t}from"../../lit-all.min.js";import"../Icon.js";import i from"../Dialog.js";export default class o extends e{static properties={editorMode:{type:String,state:!0}};constructor(){super()}connectedCallback(){super.connectedCallback(),this.editor&&(this.editorMode=this.editor.mode,this.editor?.addEventListener("mode-changed",()=>{this.editor&&(this.editorMode=this.editor.mode)}))}handleClick=()=>{if(!this.editor)return;const e=this.editor.getSelectedText(),t=document.createElement("input");t.type="text",t.placeholder="https://example.com",t.style.cssText="padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;";const o=document.createElement("input");o.type="text",o.placeholder="Enter link text",o.value=e,o.style.cssText="padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;";const l=document.createElement("div");l.className="p",l.style.cssText="display: flex; flex-direction: column; gap: 1rem;",l.innerHTML='\n\t\t\t<div style="display: flex; flex-direction: column; gap: 0.5rem;">\n\t\t\t\t<label style="font-weight: bold;">URL</label>\n\t\t\t</div>\n\t\t\t<div style="display: flex; flex-direction: column; gap: 0.5rem;">\n\t\t\t\t<label style="font-weight: bold;">Link Text</label>\n\t\t\t</div>\n\t\t',l.children[0].appendChild(t),l.children[1].appendChild(o),i.create(l,{title:"Create Link",cancelText:"Cancel",confirmText:"Insert Link",confirmClasses:"success ml",confirmAction:i=>{const l=t.value.trim(),s=o.value.trim();l?!this.editor.selection||s&&s!==e?this.editor.createLinkWithText(l,s||l):this.editor.createLink(l):i.keepDialogOpen=!0}})};render(){return this.hidden="code"===this.editorMode,t`
			<button
				class="${this.buttonClasses}"
				@click="${this.handleClick}"
			>
				<slot name="icon">
					<k-icon name="link"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`}static styles=[e.styles,css`
			:host {
				display: inline-flex;
			}
		`]}customElements.define("k-hec-create-link",o);