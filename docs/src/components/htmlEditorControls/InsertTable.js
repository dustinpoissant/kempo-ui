import e from"./HtmlEditorControl.js";import{html as t}from"../../lit-all.min.js";import"../Icon.js";import l from"../Dialog.js";export default class i extends e{static properties={editorMode:{type:String,state:!0}};constructor(){super()}connectedCallback(){super.connectedCallback(),this.editor&&(this.editorMode=this.editor.mode,this.editor?.addEventListener("mode-changed",()=>{this.editor&&(this.editorMode=this.editor.mode)}))}handleClick=()=>{if(!this.editor)return;const e=this.editor.getTableAtSelection(),t=!!e,i=e?.rows??3,s=e?.cols??3,n=e?.hasHeaders??!0,o=e?.cellData??null,r=document.createElement("input");r.type="number",r.min="1",r.max="20",r.value=i.toString(),r.style.cssText="padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;";const d=document.createElement("input");d.type="number",d.min="1",d.max="10",d.value=s.toString(),d.style.cssText="padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;";const c=document.createElement("input");c.type="checkbox",c.checked=n,c.id="table-headers-checkbox";const a=document.createElement("div");a.className="p",a.style.cssText="display: flex; flex-direction: column; gap: 1rem;",a.innerHTML='\n\t\t\t<div style="display: flex; flex-direction: column; gap: 0.5rem;">\n\t\t\t\t<label style="font-weight: bold;">Rows</label>\n\t\t\t</div>\n\t\t\t<div style="display: flex; flex-direction: column; gap: 0.5rem;">\n\t\t\t\t<label style="font-weight: bold;">Columns</label>\n\t\t\t</div>\n\t\t\t<div style="display: flex; align-items: center; gap: 0.5rem;">\n\t\t\t\t<label for="table-headers-checkbox" style="font-weight: bold;">Include Headers</label>\n\t\t\t</div>\n\t\t',a.children[0].appendChild(r),a.children[1].appendChild(d),a.children[2].insertBefore(c,a.children[2].firstChild),l.create(a,{title:t?"Edit Table":"Insert Table",cancelText:"Cancel",confirmText:t?"Update Table":"Insert Table",confirmClasses:"success",confirmAction:()=>{const l=parseInt(r.value)||3,i=parseInt(d.value)||3,s=c.checked;t&&this.editor.removeTableByKey(e.key),this.editor.insertTable(l,i,s,o)}})};render(){return this.hidden="code"===this.editorMode,t`
			<button
				class="${this.buttonClasses}"
				@click="${this.handleClick}"
			>
				<slot name="icon">
					<k-icon name="table"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`}static styles=[e.styles,css`
			:host {
				display: inline-flex;
			}
		`]}customElements.define("k-hec-insert-table",i);