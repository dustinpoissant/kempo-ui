import{html,css}from"../lit-all.min.js";import ShadowComponent from"./ShadowComponent.js";import{boolTrueFalse}from"../utils/propConverters.js";const openDropdowns=new Set;export default class Dropdown extends ShadowComponent{static properties={opened:{type:Boolean,reflect:!0},openDirection:{type:String,reflect:!0,attribute:"open-direction"},closeOnSelect:{type:Boolean,reflect:!0,attribute:"close-on-select",converter:boolTrueFalse},closeOnClickOutside:{type:Boolean,reflect:!0,attribute:"close-on-click-outside",converter:boolTrueFalse}};anchorId=`dropdown-anchor-${Math.random().toString(36).slice(2,11)}`;constructor(){super(),this.opened=!1,this.openDirection="down left",this.closeOnSelect=!0,this.closeOnClickOutside=!0}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this.handleDocumentClick),document.addEventListener("keydown",this.handleKeydown)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this.handleDocumentClick),document.removeEventListener("keydown",this.handleKeydown),openDropdowns.delete(this)}updated(t){super.updated(t),t.has("opened")&&(this.opened?openDropdowns.add(this):openDropdowns.delete(this),this.dispatchEvent(new CustomEvent(this.opened?"opened":"closed",{bubbles:!0})))}handleDocumentClick=t=>{const e=t.target.closest("k-dropdown"),o=t.target.closest('[slot="trigger"]');if(e&&e!==this&&o)return void(this.opened&&this.close());if(!this.opened)return;if(e!==this)return void(this.closeOnClickOutside&&this.close());if(o)return;t.target.closest("a, button")&&this.closeOnSelect&&this.close()};handleTriggerClick=t=>{t.stopPropagation(),this.opened||openDropdowns.forEach(t=>{t!==this&&t.close()}),this.toggle()};handleMenuClick=t=>{const e=t.target.closest("a, button");if(e&&!e.hasAttribute("disabled")){const t=e.dataset?.value||e.textContent.trim();this.dispatchEvent(new CustomEvent("select",{detail:{value:t,item:e},bubbles:!0}))}};handleKeydown=t=>{if(this.opened)if("Escape"===t.key)t.preventDefault(),this.close(),this.focusTrigger();else if("ArrowDown"===t.key)t.preventDefault(),this.focusNextItem();else if("ArrowUp"===t.key)t.preventDefault(),this.focusPreviousItem();else if("Enter"===t.key||" "===t.key){const e=this.querySelector("a:focus, button:focus");e&&(t.preventDefault(),e.click())}};open(){return openDropdowns.forEach(t=>{t!==this&&t.close()}),this.opened=!0,requestAnimationFrame(()=>this.focusFirstItem()),this}close(){return this.opened=!1,this}toggle(){return this.opened?this.close():this.open()}focusTrigger(){const t=this.querySelector('[slot="trigger"]');t&&t.focus()}getMenuItems(){return[...this.querySelectorAll("a, button")].filter(t=>!t.hasAttribute("disabled")&&!t.closest('[slot="trigger"]'))}focusFirstItem(){const t=this.getMenuItems();t.length>0&&t[0].focus()}focusNextItem(){const t=this.getMenuItems(),e=document.activeElement,o=t.indexOf(e),n=t[o+1]||t[0];n&&n.focus()}focusPreviousItem(){const t=this.getMenuItems(),e=document.activeElement,o=t.indexOf(e),n=t[o-1]||t[t.length-1];n&&n.focus()}getPositionArea(){const t=this.openDirection.toLowerCase().trim().split(/\s+/),e={down:"bottom",up:"top",left:"left",right:"right",center:"center"};return t.map(t=>e[t]||t).join(" ")}getFallbacks(){this.getPositionArea().split(" ");const t=[];return t.push("flip-block"),t.push("flip-inline"),t.push("flip-block flip-inline"),t.join(", ")}static styles=css`
		:host {
			display: inline-block;
			position: relative;
		}
		#trigger {
			cursor: pointer;
			anchor-name: --dropdown-trigger;
		}
		#menu {
			display: none;
			position: fixed;
			position-anchor: --dropdown-trigger;
			z-index: 1000;
			min-width: anchor-size(width);
			background: var(--c_bg);
			border: 1px solid var(--c_border);
			box-shadow: var(--drop_shadow);
			margin: 0.25rem;
		}
		:host([opened]) #menu {
			display: block;
		}
		/* Default: down left */
		#menu {
			position-area: bottom span-right;
			position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
		}
		/* down right */
		:host([open-direction="down right"]) #menu {
			position-area: bottom span-left;
		}
		/* down center */
		:host([open-direction="down center"]) #menu,
		:host([open-direction="down"]) #menu {
			position-area: bottom center;
		}
		/* up left */
		:host([open-direction="up left"]) #menu {
			position-area: top span-right;
		}
		/* up right */
		:host([open-direction="up right"]) #menu {
			position-area: top span-left;
		}
		/* up center */
		:host([open-direction="up center"]) #menu,
		:host([open-direction="up"]) #menu {
			position-area: top center;
		}
		/* left up */
		:host([open-direction="left up"]) #menu {
			position-area: left span-top;
		}
		/* left down */
		:host([open-direction="left down"]) #menu {
			position-area: left span-bottom;
		}
		/* left center */
		:host([open-direction="left center"]) #menu,
		:host([open-direction="left"]) #menu {
			position-area: left center;
		}
		/* right up */
		:host([open-direction="right up"]) #menu {
			position-area: right span-top;
		}
		/* right down */
		:host([open-direction="right down"]) #menu {
			position-area: right span-bottom;
		}
		/* right center */
		:host([open-direction="right center"]) #menu,
		:host([open-direction="right"]) #menu {
			position-area: right center;
		}
		/* Slotted menu item styles (not trigger) */
		::slotted(a:not([slot="trigger"])),
		::slotted(button:not([slot="trigger"])) {
			all: unset !important;
			display: block !important;
			box-sizing: border-box !important;
			width: 100% !important;
			padding: var(--spacer_h) var(--spacer) !important;
			color: var(--tc) !important;
			background: transparent !important;
			border: none !important;
			border-top: 1px solid var(--c_border) !important;
			border-radius: 0 !important;
			font: inherit !important;
			text-align: left !important;
			cursor: pointer !important;
			white-space: nowrap !important;
			transition: background var(--animation_ms) !important;
		}
		::slotted(a.k-dropdown-first),
		::slotted(button.k-dropdown-first) {
			border-top: none !important;
		}
		::slotted(a:not([slot="trigger"]):hover),
		::slotted(a:not([slot="trigger"]):focus-visible),
		::slotted(button:not([slot="trigger"]):hover),
		::slotted(button:not([slot="trigger"]):focus-visible) {
			background: var(--c_bg__alt) !important;
			outline: none !important;
		}
		::slotted(a:not([slot="trigger"])[disabled]),
		::slotted(button:not([slot="trigger"])[disabled]) {
			opacity: 0.5 !important;
			cursor: not-allowed !important;
			pointer-events: none !important;
		}
		::slotted(hr) {
			display: none !important;
		}
	`;handleSlotChange=t=>{t.target.assignedElements().filter(t=>t.matches("a, button")).forEach((t,e)=>t.classList.toggle("k-dropdown-first",0===e))};render(){return html`
			<div id="trigger" @click=${this.handleTriggerClick}>
				<slot name="trigger"></slot>
			</div>
			<div id="menu" role="menu" @click=${this.handleMenuClick}>
				<slot @slotchange=${this.handleSlotChange}></slot>
			</div>
		`}}customElements.define("k-dropdown",Dropdown);