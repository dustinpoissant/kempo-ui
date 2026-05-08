import t from"../ShadowComponent.js";import{html as e,css as o}from"../../lit-all.min.js";export default class n extends t{static properties={hidden:{type:Boolean,reflect:!0}};constructor(){super(),this.hidesInCodeMode=!0}connectedCallback(){super.connectedCallback();const t=this.editor;t&&(this.modeEditor=t,this.modeHandler=()=>{const t=this.hidesInCodeMode&&"code"===this.modeEditor.mode;this.hidden!==t&&(this.hidden=t,this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0})))},t.addEventListener("mode-changed",this.modeHandler))}disconnectedCallback(){super.disconnectedCallback(),this.modeEditor?.removeEventListener("mode-changed",this.modeHandler),this.modeEditor=null,this.modeHandler=null}updated(t){super.updated(t),t.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}get buttonClasses(){return"K-HEC-DROPDOWN"===this.parentElement?.tagName?"no-btn icon-btn dropdown-item":"no-btn icon-btn"}get editor(){const t=t=>t?.tagName?.startsWith("K-HTML-EDITOR");let e=this.getRootNode();for(;e instanceof ShadowRoot;){const o=e.host;if(t(o))return o;e=o.getRootNode()}let o=this.parentElement;for(;o;){if(t(o))return o;o=o.parentElement}return null}static styles=o`
		:host {
			display: inline-flex;
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
		}
		
		:host([hidden]) {
			display: none !important;
		}
		
		.icon-btn {
			display: inline-flex !important;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			gap: 0.5rem;
		}
		.icon-btn:disabled {
			opacity: 0.6;
		}
		
		.icon-btn:has(slot:not([name])) {
			width: auto;
			padding-left: 0.75rem;
			padding-right: 0.75rem;
		}
		
		/* Styles for controls in dropdown */
		.icon-btn.dropdown-item {
			display: flex !important;
			width: 100% !important;
			height: auto !important;
			justify-content: flex-start !important;
			padding: 0.5rem 0.75rem !important;
			margin: 0 !important;
			border: none !important;
			border-radius: 0 !important;
			border-bottom: 1px solid var(--c_border) !important;
		}
		
		:host(:last-child) .icon-btn.dropdown-item {
			border-bottom: none !important;
		}
	`}customElements.define("k-html-editor-control",n);