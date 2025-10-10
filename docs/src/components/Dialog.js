import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";import{boolExists}from"../utils/propConverters.js";import"./Icon.js";import"./FocusCapture.js";const firstFocusable=t=>t.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')[0];export default class Dialog extends ShadowComponent{static properties={opened:{type:Boolean,reflect:!0,converter:boolExists},closeBtn:{type:Boolean,reflect:!0,attribute:"close-btn",converter:boolExists},overlayClose:{type:Boolean,reflect:!0,attribute:"overlay-close",converter:boolExists},confirmText:{type:String,reflect:!0,attribute:"confirm-text"},confirmClasses:{type:String,reflect:!0,attribute:"confirm-classes"},cancelText:{type:String,reflect:!0,attribute:"cancel-text"},cancelClasses:{type:String,reflect:!0,attribute:"cancel-classes"}};constructor(){super(),this.opened=!1,this.closeBtn=!0,this.overlayClose=!0,this.confirmText="",this.confirmClasses="success ml",this.cancelText="",this.cancelClasses="",this.confirmAction=()=>{},this.cancelAction=()=>{},this.closeCallback=()=>{},this.previousFocus=null}handleClick=t=>{const{target:e}=t,o=e.id||e.closest("[id]")?.id;"overlay"===o&&this.overlayClose||"close"===o?this.close():"cancel"===o?(this.cancelAction(t),t.defaultPrevented||this.close()):"confirm"===o&&(this.confirmAction(t),t.defaultPrevented||this.close())};handleKeydown=t=>{27===t.keyCode&&this.close()};connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.handleKeydown)}updated(t){super.updated(t),t.has("opened")&&this.dispatchEvent(new CustomEvent(this.opened?"opened":"close"))}open(){this.opened=!0,window.addEventListener("keydown",this.handleKeydown);const t=this.updateComplete||this.requestUpdate();t&&t.then?t.then(()=>{const t=this.shadowRoot.querySelector("[autofocus]")||firstFocusable(this.shadowRoot);t&&t.focus()}):setTimeout(()=>{const t=this.shadowRoot.querySelector("[autofocus]")||firstFocusable(this.shadowRoot);t&&t.focus()},0)}close(){this.opened=!1,this.blur(),this.closeCallback(),window.removeEventListener("keydown",this.handleKeydown)}toggle(){this.opened?this.close():this.open()}focus(){const t=firstFocusable(this.shadowRoot);t&&(this.previousFocus=document.activeElement,t.focus())}blur(){this.previousFocus&&this.previousFocus.focus()}hasTitle(){return!!this.querySelector('[slot="title"]')}static styles=css`
		:host {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 100;
			display: none;
			justify-content: center;
			align-items: center;
		}
		:host([opened]) {
			display: flex;
		}
		#overlay {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: var(--c_overlay);
			border: 0px solid transparent;
			box-shadow: 0 0 0 transparent;
		}
		#wrapper {
			position: relative;
			z-index: 1;
			pointer-events: none;
		}
		#dialog {
			display: flex;
			flex-direction: column;
			min-width: var(--min_width, 20rem);
			width: var(--width, fit-content);
			max-width: var(--max_width, calc(100vw - 4rem));
			min-height: var(--min_height, 12rem);
			height: var(--height, fit-content);
			max-height: var(--max_height, calc(100vh - 4rem));
			background-color: var(--c_bg);
			box-shadow: var(--drop_shadow);
			border-radius: var(--radius);
			pointer-events: all;
		}
		#header {
			display: flex;
			align-items: center;
		}
		#header.has-title {
			border-bottom: 1px solid var(--c_border);
		}
		#title {
			flex: 1 1 auto;
		}
		#close {
			border: 0px;
			background: transparent;
			box-shadow: 0 0 0 transparent;
			color: var(--tc);
			transition: box-shadow var(--animation_ms);
			border-radius: var(--radius);
		}
		#close:focus {
			box-shadow: var(--focus_shadow);
		}
		#close k-icon {
			pointer-events: none;
		}
		#body {
			flex: 1 1 auto;
		}
		#footer {
			display: flex;
			justify-content: flex-end;
			padding: var(--spacer_h);
		}
	`;render(){return html`
			<button id="overlay" aria-label="Close the Dialog" @click=${this.handleClick}></button>
			<div id="wrapper">
				<div
					id="dialog"
					role="dialog"
					aria-modal="true"
					aria-labelledby="title"
				>
					<k-focus-capture>
						<div
							id="header"
							class="${this.hasTitle()?"has-title":""}"
						>
							<div id="title">
								<slot name="title"></slot>
							</div>
							${this.closeBtn?html`
								<button id="close" @click=${this.handleClick}>
									<k-icon name="close"></k-icon>
								</button>
							`:""}
						</div>
						<div id="body">
							<slot></slot>
						</div>
						${this.cancelText||this.confirmText?html`
							<div id="footer">
								${this.cancelText?html`
									<button id="cancel" class="${this.cancelClasses}" @click=${this.handleClick}>
										${this.cancelText}
									</button>
								`:""}
								${this.confirmText?html`
									<button id="confirm" class="${this.confirmClasses}" @click=${this.handleClick}>
										${this.confirmText}
									</button>
								`:""}
							</div>
						`:""}
					</k-focus-capture>
				</div>
			</div>
		`}static create(t="",e={}){!1!==e.closeExisting&&document.querySelectorAll("k-dialog").forEach(t=>t.close());const{removeOnClose:o=!0,closeCallback:s=()=>{}}=e,i=new Dialog;return Object.assign(i,{opened:!0,...e,closeCallback:(...t)=>{o&&i.remove(),s(...t)}}),t instanceof HTMLElement||t instanceof DocumentFragment?i.appendChild(t):t&&(i.innerHTML=t),e.width&&i.style.setProperty("--width",e.width),e.minWidth&&i.style.setProperty("--min_width",e.minWidth),e.maxWidth&&i.style.setProperty("--max_width",e.maxWidth),e.height&&i.style.setProperty("--height",e.height),e.minHeight&&i.style.setProperty("--min_height",e.minHeight),e.maxHeight&&i.style.setProperty("--max_height",e.maxHeight),document.body.appendChild(i),i.open(),i}static confirm(t,e,o={}){const s=o.title||"Confirm";return Dialog.create(`\n\t\t\t<h5 slot="title" class="pyh px m0">${s}</h5>\n\t\t\t<p class="p">${t}</p>\n\t\t`,{closeBtn:!1,overlayClose:!1,confirmText:"Yes",confirmClasses:"success ml",confirmAction:()=>e(!0),cancelText:"No",cancelClasses:"danger",cancelAction:()=>e(!1),...o})}static alert(t,e,o={}){const s=o.title||"Alert";return Dialog.create(`\n\t\t\t<h5 slot="title" class="pyh px m0">${s}</h5>\n\t\t\t<p class="p">${t}</p>\n\t\t`,{closeCallback:e,cancelText:"Ok",...o})}static error(t,e,o={}){const s=o.title||"Error";return Dialog.create(`\n\t\t\t<h5 slot="title" class="pyh px m0 tc-danger">${s}</h5>\n\t\t\t<p class="p">${t}</p>\n\t\t`,{closeCallback:e,cancelText:"Ok",...o})}static success(t,e,o={}){const s=o.title||"Success";return Dialog.create(`\n\t\t\t<h5 slot="title" class="pyh px m0 tc-success">${s}</h5>\n\t\t\t<p class="p">${t}</p>\n\t\t`,{closeCallback:e,cancelText:"Ok",...o})}}customElements.define("k-dialog",Dialog);