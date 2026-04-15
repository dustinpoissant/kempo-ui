import t from"./CodeEditorControl.js";import{html as e,css as i}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static properties={active:{type:Boolean,state:!0}};constructor(){super(),this.active=!0}connectedCallback(){super.connectedCallback(),this.editor&&(this.active=this.editor.wordWrap)}handleClick=()=>{this.active=!this.active,this.editor?.setWordWrap(this.active)};static styles=[t.styles,i`
			:host { display: inline-flex; }
			button.active { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`];render(){return e`
			<button class="${this.buttonClasses} ${this.active?"active":""}" @click="${this.handleClick}" title="Word Wrap">
				<k-icon name="wrap_text"></k-icon>
			</button>
		`}}customElements.define("k-cec-word-wrap",s);