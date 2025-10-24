import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";import{boolExists}from"../utils/propConverters.js";import"./Icon.js";import"./FocusCapture.js";const firstFocusable=e=>e.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')[0];export default class Dialog extends ShadowComponent{static properties={opened:{type:Boolean,reflect:!0,converter:boolExists},closeBtn:{type:Boolean,reflect:!0,attribute:"close-btn",converter:boolExists},overlayClose:{type:Boolean,reflect:!0,attribute:"overlay-close",converter:boolExists},confirmText:{type:String,reflect:!0,attribute:"confirm-text"},confirmClasses:{type:String,reflect:!0,attribute:"confirm-classes"},cancelText:{type:String,reflect:!0,attribute:"cancel-text"},cancelClasses:{type:String,reflect:!0,attribute:"cancel-classes"}};constructor(){super(),this.opened=!1,this.closeBtn=!0,this.overlayClose=!0,this.confirmText="",this.confirmClasses="success ml",this.cancelText="",this.cancelClasses="",this.confirmAction=()=>{},this.cancelAction=()=>{},this.closeCallback=()=>{},this.previousFocus=null}handleClick=e=>{const{target:t}=e,o=t.id||t.closest("[id]")?.id;"overlay"===o&&this.overlayClose||"close"===o?this.close():"cancel"===o?(this.cancelAction(e),e.defaultPrevented||this.close()):"confirm"===o&&(this.confirmAction(e),e.defaultPrevented||this.close())};handleKeydown=e=>{27===e.keyCode&&this.close()};connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this.handleKeydown)}updated(e){super.updated(e),e.has("opened")&&this.dispatchEvent(new CustomEvent(this.opened?"opened":"close"))}open(){this.opened=!0,window.addEventListener("keydown",this.handleKeydown);const e=this.updateComplete||this.requestUpdate();e&&e.then?e.then(()=>{const e=this.shadowRoot.querySelector("[autofocus]")||firstFocusable(this.shadowRoot);e&&e.focus()}):setTimeout(()=>{const e=this.shadowRoot.querySelector("[autofocus]")||firstFocusable(this.shadowRoot);e&&e.focus()},0)}close(){this.opened=!1,this.blur(),this.closeCallback(),window.removeEventListener("keydown",this.handleKeydown)}toggle(){this.opened?this.close():this.open()}focus(){const e=firstFocusable(this.shadowRoot);e&&(this.previousFocus=document.activeElement,e.focus())}blur(){this.previousFocus&&this.previousFocus.focus()}hasTitle(){return!!this.querySelector('[slot="title"]')}static styles=css`
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
				<k-focus-capture>
					<div
						id="dialog"
						role="dialog"
						aria-modal="true"
						aria-labelledby="title"
					>
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
					</div>
				</k-focus-capture>
			</div>
		`}static create(e="",t={}){!1!==t.closeExisting&&document.querySelectorAll("k-dialog").forEach(e=>e.close());const{removeOnClose:o=!0,closeCallback:s=()=>{},title:i="",titleClasses:l="pyh px m0"}=t,n=new Dialog;if(Object.assign(n,{opened:!0,...t,closeCallback:(...e)=>{o&&n.remove(),s(...e)}}),i){const e=document.createElement("h5");e.slot="title",e.className=l,i instanceof HTMLElement?e.appendChild(i):e.innerHTML=i,n.appendChild(e)}if(e instanceof HTMLElement||e instanceof DocumentFragment)n.appendChild(e);else if(e){if(/<[^>]+>/.test(e))n.innerHTML+=e;else{const t=document.createElement("p");t.className="p",t.textContent=e,n.appendChild(t)}}return t.width&&n.style.setProperty("--width",t.width),t.minWidth&&n.style.setProperty("--min_width",t.minWidth),t.maxWidth&&n.style.setProperty("--max_width",t.maxWidth),t.height&&n.style.setProperty("--height",t.height),t.minHeight&&n.style.setProperty("--min_height",t.minHeight),t.maxHeight&&n.style.setProperty("--max_height",t.maxHeight),document.body.appendChild(n),n.open(),n}static confirm(e,t,o={}){return Dialog.create(e,{title:o.title||"Confirm",closeBtn:!1,overlayClose:!1,confirmText:"Yes",confirmClasses:"success ml",confirmAction:()=>t(!0),cancelText:"No",cancelClasses:"danger",cancelAction:()=>t(!1),...o})}static alert(e,t=()=>{},o={}){return Dialog.create(e,{title:o.title||"Alert",closeCallback:t,cancelText:"Ok",...o})}static error(e,t=()=>{},o={}){return Dialog.create(e,{title:o.title||"Error",titleClasses:"pyh px m0 tc-danger",closeCallback:t,cancelText:"Ok",...o})}static success(e,t=()=>{},o={}){return Dialog.create(e,{title:o.title||"Success",titleClasses:"pyh px m0 tc-success",closeCallback:t,cancelText:"Ok",...o})}}customElements.define("k-dialog",Dialog);