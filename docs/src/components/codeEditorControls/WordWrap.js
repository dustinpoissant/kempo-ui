import t from"./CodeEditorControl.js";import{html as e,css as r}from"../../lit-all.min.js";import"../Icon.js";export default class a extends t{static properties={active:{type:Boolean,state:!0}};constructor(){super(),this.active=!0}connectedCallback(){super.connectedCallback();const t=this.editor;t&&(this.active=t.wordWrap,this.wordWrapHandler=t=>{this.active=t.detail.wordWrap},t.addEventListener("word-wrap-changed",this.wordWrapHandler))}disconnectedCallback(){super.disconnectedCallback(),this.editor?.removeEventListener("word-wrap-changed",this.wordWrapHandler),this.wordWrapHandler=null}handleClick=()=>{this.editor?.toggleWordWrap()};static styles=[t.styles,r`
			:host { display: inline-flex; }
			button.active { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`];render(){return e`
			<button class="${this.buttonClasses} ${this.active?"active":""}" @click="${this.handleClick}" title="Word Wrap">
				<k-icon name="wrap_text"></k-icon>
			</button>
		`}}customElements.define("k-cec-word-wrap",a);