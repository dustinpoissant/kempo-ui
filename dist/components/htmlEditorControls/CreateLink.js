import e from"./HtmlEditorControl.js";import{html as t,css as i}from"../../lit-all.min.js";import"../Icon.js";import o from"../Dialog.js";export default class n extends e{static properties={editorMode:{type:String,state:!0}};constructor(){super()}connectedCallback(){super.connectedCallback(),this.editor&&(this.editorMode=this.editor.mode,this.editor?.addEventListener("mode-changed",()=>{this.editor&&(this.editorMode=this.editor.mode)}))}handleMouseDown=e=>{if(!this.editor)return;e.preventDefault(),e.stopPropagation();const t=this.editor.selection?.text||"",i=document.createElement("input");i.type="text",i.placeholder="https://example.com",i.style.cssText="padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;";const n=document.createElement("input");n.type="text",n.placeholder="Enter link text",n.value=t,n.style.cssText="padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;";const s=document.createElement("div");s.className="p",s.style.cssText="display: flex; flex-direction: column; gap: 1rem;",s.innerHTML='\n\t\t\t<div style="display: flex; flex-direction: column; gap: 0.5rem;">\n\t\t\t\t<label style="font-weight: bold;">URL</label>\n\t\t\t</div>\n\t\t\t<div style="display: flex; flex-direction: column; gap: 0.5rem;">\n\t\t\t\t<label style="font-weight: bold;">Link Text</label>\n\t\t\t</div>\n\t\t',s.children[0].appendChild(i),s.children[1].appendChild(n),o.create(s,{title:"Create Link",cancelText:"Cancel",confirmText:"Insert Link",confirmClasses:"success ml",confirmAction:e=>{const o=i.value.trim(),s=n.value.trim();o?!this.editor.selection||s&&s!==t?this.editor.createLinkWithText(o,s||o):this.editor.createLink(o):e.keepDialogOpen=!0}})};render(){return this.hidden="code"===this.editorMode,t`
			<button
				class="${this.buttonClasses}"
				@mousedown="${this.handleMouseDown}"
			>
				<slot name="icon">
					<k-icon name="link"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`}static styles=[e.styles,i`
			:host {
				display: inline-flex;
			}
		`]}customElements.define("k-hec-create-link",n);