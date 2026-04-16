import i from"./CodeEditorControl.js";import{html as t,css as e}from"../../lit-all.min.js";import"../Icon.js";export default class n extends i{static properties={active:{type:Boolean,state:!0}};constructor(){super(),this.active=!1}connectedCallback(){super.connectedCallback();const i=this.editor;i&&(this.active=i.minimapEnabled,this.minimapHandler=i=>{this.active=i.detail.minimapEnabled},i.addEventListener("minimap-changed",this.minimapHandler))}disconnectedCallback(){super.disconnectedCallback(),this.editor?.removeEventListener("minimap-changed",this.minimapHandler),this.minimapHandler=null}handleClick=()=>{this.editor?.toggleMinimap()};static styles=[i.styles,e`
			:host { display: inline-flex; }
			button.active { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`];render(){return t`
			<button class="${this.buttonClasses} ${this.active?"active":""}" @click="${this.handleClick}" title="Toggle Minimap">
				<k-icon name="map"></k-icon>
			</button>
		`}}customElements.define("k-cec-minimap",n);