import e from"../ShadowComponent.js";import{css as t}from"../../lit-all.min.js";export default class i extends e{static properties={hidden:{type:Boolean,reflect:!0}};constructor(){super(),this.hidden=!1}connectedCallback(){super.connectedCallback(),this.updateModeVisibility();const e=this.editor;"K-HTML-EDITOR"===e?.tagName&&(this.modeHandler=()=>this.updateModeVisibility(),e.addEventListener("mode-changed",this.modeHandler))}disconnectedCallback(){super.disconnectedCallback(),this.modeHandler&&(this.editor?.removeEventListener("mode-changed",this.modeHandler),this.modeHandler=null)}updated(e){super.updated(e),e.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}updateModeVisibility(){const e=this.editor;if("K-HTML-EDITOR"===e?.tagName){const t="code"!==e.mode;this.hidden!==t&&(this.hidden=t,this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0})))}}get editor(){const e=e=>"K-CODE-EDITOR"===e?.tagName||"K-HTML-EDITOR"===e?.tagName;let t=this.getRootNode();for(;t instanceof ShadowRoot;){const i=t.host;if(e(i))return i;t=i.getRootNode()}let i=this.parentElement;for(;i;){if(e(i))return i;i=i.parentElement}return null}static styles=t`
		:host {
			display: inline-flex;
			align-items: center;
		}
		:host([hidden]) {
			display: none !important;
		}
	`}