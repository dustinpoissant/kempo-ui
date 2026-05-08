import t from"./HtmlEditorControl.js";import{html as e,css as r}from"../../lit-all.min.js";export default class s extends t{static properties={count:{type:Number,state:!0}};constructor(){super(),this.count=0}connectedCallback(){super.connectedCallback(),this.editor&&(this.editor.addEventListener("ready",()=>{this.updateCount()}),this.editor.addEventListener("change",()=>{this.updateCount()}),setTimeout(()=>this.updateCount(),0))}updateCount=()=>{if(!this.editor)return;const t=(new DOMParser).parseFromString(this.editor.getValue(),"text/html").body.innerText||"";this.count=t.length};render(){return e`
			<span class="character-count">
				<slot name="label">Characters:</slot> ${this.count}
			</span>
		`}static styles=[t.styles,r`
			:host {
				align-items: center;
				padding: 0 0.5rem;
				font-size: 0.875rem;
				color: var(--text-color-secondary, #666);
			}
			.character-count {
				display: flex;
				align-items: center;
				gap: 0.25rem;
			}
		`]}customElements.define("k-hec-character-count",s);