import e from"../ShadowComponent.js";import{html as t,css as n}from"../../lit-all.min.js";export default class o extends e{static properties={hidden:{type:Boolean,reflect:!0}};constructor(){super(),this.hidesInCodeMode=!0}connectedCallback(){super.connectedCallback();const e=this.editor;e&&(this.modeEditor=e,this.modeHandler=()=>{const e=this.hidesInCodeMode&&"code"===this.modeEditor.mode;this.hidden!==e&&(this.hidden=e,this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0})))},e.addEventListener("mode-changed",this.modeHandler))}disconnectedCallback(){super.disconnectedCallback(),this.modeEditor?.removeEventListener("mode-changed",this.modeHandler),this.modeEditor=null,this.modeHandler=null}updated(e){super.updated(e),e.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}get buttonClasses(){return"no-btn icon-btn"}get editor(){const e=e=>e?.tagName?.startsWith("K-HTML-EDITOR");let t=this.getRootNode();for(;t instanceof ShadowRoot;){const n=t.host;if(e(n))return n;t=n.getRootNode()}let n=this.parentElement;for(;n;){if(e(n))return n;n=n.parentElement}return null}static styles=n`
		:host {
			display: inline-flex;
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			margin: 0 0.25rem;
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
	`}customElements.define("k-html-editor-control",o);