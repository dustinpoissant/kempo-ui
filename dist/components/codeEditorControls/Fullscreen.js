import e from"./CodeEditorControl.js";import{html as t,css as s}from"../../lit-all.min.js";import"../Icon.js";export default class l extends e{static properties={fullscreen:{type:Boolean,state:!0}};constructor(){super(),this.fullscreen=!1}disconnectedCallback(){super.disconnectedCallback(),this.fullscreen&&this.exitFullscreen()}updateModeVisibility(){}handleClick=()=>{this.fullscreen?this.exitFullscreen():this.enterFullscreen()};enterFullscreen(){const e=this.editor;e&&(e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100vw",e.style.height="100vh",e.style.zIndex="9999",document.body.classList.add("no-scroll"),this.fullscreen=!0)}exitFullscreen(){const e=this.editor;e&&(e.style.position="",e.style.top="",e.style.left="",e.style.width="",e.style.height="",e.style.zIndex="",document.body.classList.remove("no-scroll"),this.fullscreen=!1)}static styles=[e.styles,s`
			:host { display: inline-flex; }
			button.active { background: var(--primary-bg, rgba(0,120,212,0.15)); }
		`];render(){return t`
			<button
				class="${this.buttonClasses} ${this.fullscreen?"active":""}"
				@click="${this.handleClick}"
				title="${this.fullscreen?"Exit Fullscreen":"Fullscreen"}"
			>
				<k-icon name="${this.fullscreen?"fullscreen_exit":"fullscreen"}"></k-icon>
			</button>
		`}}customElements.define("k-cec-fullscreen",l);