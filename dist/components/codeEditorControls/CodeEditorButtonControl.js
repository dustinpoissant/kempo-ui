import e from"../Button.js";import{css as t}from"../../lit-all.min.js";export default class o extends e{static properties={hidden:{type:Boolean,reflect:!0}};constructor(){super(),this.hidden=!1}connectedCallback(){super.connectedCallback(),this.updateModeVisibility();const e=this.editor;"K-HTML-EDITOR"===e?.tagName&&(this.modeHandler=()=>this.updateModeVisibility(),e.addEventListener("mode-changed",this.modeHandler))}disconnectedCallback(){super.disconnectedCallback(),this.modeHandler&&(this.editor?.removeEventListener("mode-changed",this.modeHandler),this.modeHandler=null)}updated(e){super.updated(e),e.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}updateModeVisibility(){const e=this.editor;if("K-HTML-EDITOR"===e?.tagName){const t="code"!==e.mode;this.hidden!==t&&(this.hidden=t,this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0})))}}get editor(){const e=e=>"K-CODE-EDITOR"===e?.tagName||"K-HTML-EDITOR"===e?.tagName;let t=this.getRootNode();for(;t instanceof ShadowRoot;){const o=t.host;if(e(o))return o;let i=o.parentElement;for(;i;){if(e(i))return i;i=i.parentElement}t=o.getRootNode()}let o=this.parentElement;for(;o;){if(e(o))return o;o=o.parentElement}return null}handleAction(){}handleClick=e=>{this.disabled?e.stopImmediatePropagation():this.handleAction()};static styles=t`
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