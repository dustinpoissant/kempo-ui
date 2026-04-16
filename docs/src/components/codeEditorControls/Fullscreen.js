import e from"./CodeEditorControl.js";import{html as l,css as s}from"../../lit-all.min.js";import"../Icon.js";export default class t extends e{static properties={fullscreen:{type:Boolean,state:!0}};constructor(){super(),this.fullscreen=!1}connectedCallback(){super.connectedCallback();const e=this.editor;e&&(this.fullscreen=e.fullscreen,this.fullscreenHandler=()=>{this.fullscreen=e.fullscreen},e.addEventListener("fullscreen-changed",this.fullscreenHandler))}disconnectedCallback(){super.disconnectedCallback(),this.editor?.removeEventListener("fullscreen-changed",this.fullscreenHandler),this.fullscreenHandler=null}updateModeVisibility(){}handleClick=()=>{this.editor?.toggleFullscreen()};static styles=[e.styles,s`
			:host { display: inline-flex; }
			button.active { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`];render(){return l`
			<button
				class="${this.buttonClasses} ${this.fullscreen?"active":""}"
				@click="${this.handleClick}"
				title="${this.fullscreen?"Exit Fullscreen":"Fullscreen"}"
			>
				<k-icon name="${this.fullscreen?"fullscreen_exit":"fullscreen"}"></k-icon>
			</button>
		`}}customElements.define("k-cec-fullscreen",t);