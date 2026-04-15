import t from"./CodeEditorControl.js";import{html as i,css as e}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static properties={active:{type:Boolean,state:!0}};constructor(){super(),this.active=!1}connectedCallback(){super.connectedCallback(),this.editor&&(this.active=this.editor.minimapEnabled)}handleClick=()=>{this.active=!this.active,this.editor?.setMinimap(this.active)};static styles=[t.styles,e`
			:host { display: inline-flex; }
			button.active { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`];render(){return i`
			<button class="${this.buttonClasses} ${this.active?"active":""}" @click="${this.handleClick}" title="Toggle Minimap">
				<k-icon name="map"></k-icon>
			</button>
		`}}customElements.define("k-cec-minimap",s);