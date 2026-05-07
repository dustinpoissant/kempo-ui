import t from"../Button.js";import{css as e}from"../../lit-all.min.js";export default class i extends t{static properties={hidden:{type:Boolean,reflect:!0}};constructor(){super(),this.hidden=!1}connectedCallback(){super.connectedCallback(),this.addEventListener("click",this.handleActionClick),this.updateGroupState(),this.updateModeVisibility();const t=this.editor;"K-HTML-EDITOR"===t?.tagName&&(this.modeHandler=()=>this.updateModeVisibility(),t.addEventListener("mode-changed",this.modeHandler))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.handleActionClick),this.modeHandler&&(this.editor?.removeEventListener("mode-changed",this.modeHandler),this.modeHandler=null)}updated(t){super.updated(t),t.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}updateModeVisibility(){const t=this.editor;if("K-HTML-EDITOR"===t?.tagName){const e="code"!==t.mode;this.hidden!==e&&(this.hidden=e,this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0})))}}get editor(){const t=t=>"K-CODE-EDITOR"===t?.tagName||"K-HTML-EDITOR"===t?.tagName;let e=this.getRootNode();for(;e instanceof ShadowRoot;){const i=e.host;if(t(i))return i;let r=i.parentElement;for(;r;){if(t(r))return r;r=r.parentElement}e=i.getRootNode()}let i=this.parentElement;for(;i;){if(t(i))return i;i=i.parentElement}return null}get isInGroup(){return"K-CEC-GROUP"===this.parentElement?.tagName}get isLastInGroup(){if(!this.isInGroup)return!1;const t=Array.from(this.parentElement.children).filter(t=>t.tagName.startsWith("K-CEC-")&&"K-CEC-SPACER"!==t.tagName);return t[t.length-1]===this}updateGroupState(){this.isLastInGroup?(this.setAttribute("last-in-group",""),this.setAttribute("in-group","")):this.isInGroup?(this.setAttribute("in-group",""),this.removeAttribute("last-in-group")):(this.removeAttribute("in-group"),this.removeAttribute("last-in-group"))}handleAction(){}handleActionClick=()=>this.handleAction();static styles=e`
		:host {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 2rem;
			min-height: 2rem;
			background: transparent;
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			margin: var(--spacer_q);
			padding: var(--spacer_h);
			color: inherit;
			box-shadow: none;
			cursor: pointer;
			outline: none;
			font-size: inherit;
			user-select: none;
			transition: background-color var(--animation_ms), box-shadow var(--animation_ms);
		}
		:host([in-group]) {
			border: 0;
			border-right: 1px solid var(--c_border);
			border-radius: 0;
			margin: 0;
		}
		:host([last-in-group]) {
			border: 0;
			border-radius: 0;
			margin: 0;
		}
		:host(:not([disabled]):hover) {
			background: oklch(from var(--c_bg__inv) l c h / 0.15);
			color: inherit;
			box-shadow: none;
		}
		:host(:not([disabled]):focus),
		:host(:not([disabled]):focus-visible) {
			box-shadow: var(--focus_shadow);
			z-index: 1;
		}
		:host([disabled]) {
			opacity: 0.6;
			cursor: default;
		}
		:host([hidden]) {
			display: none !important;
		}
	`}