import t from"../ShadowComponent.js";import{css as e}from"../../lit-all.min.js";export default class s extends t{static properties={btnClass:{type:String,attribute:"btn-class"},groupBtnClass:{type:String,attribute:"group-btn-class"},groupLastBtnClass:{type:String,attribute:"group-last-btn-class"},hidden:{type:Boolean,reflect:!0}};constructor(){super(),this.btnClass="b r mq ph",this.groupBtnClass="br ph",this.groupLastBtnClass="ph",this.hidden=!1}connectedCallback(){super.connectedCallback(),this.updateModeVisibility();const t=this.editor;"K-HTML-EDITOR"===t?.tagName&&(this.modeHandler=()=>this.updateModeVisibility(),t.addEventListener("mode-changed",this.modeHandler))}disconnectedCallback(){super.disconnectedCallback(),this.modeHandler&&(this.editor?.removeEventListener("mode-changed",this.modeHandler),this.modeHandler=null)}updated(t){super.updated(t),t.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}updateModeVisibility(){const t=this.editor;if("K-HTML-EDITOR"===t?.tagName){const e="code"!==t.mode;this.hidden!==e&&(this.hidden=e,this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0})))}}get editor(){const t=t=>"K-CODE-EDITOR"===t?.tagName||"K-HTML-EDITOR"===t?.tagName;let e=this.getRootNode();for(;e instanceof ShadowRoot;){const s=e.host;if(t(s))return s;e=s.getRootNode()}let s=this.parentElement;for(;s;){if(t(s))return s;s=s.parentElement}return null}get isInGroup(){const t=this.parentElement;return t&&"K-CEC-GROUP"===t.tagName}get isLastInGroup(){if(!this.isInGroup)return!1;const t=Array.from(this.parentElement.children).filter(t=>t.tagName.startsWith("K-CEC-")&&"K-CEC-SPACER"!==t.tagName);return t[t.length-1]===this}get buttonClasses(){let t;return t=this.isInGroup?this.isLastInGroup?this.groupLastBtnClass:this.groupBtnClass:this.btnClass,`no-btn icon-btn ${t}`.trim()}static styles=e`
		:host {
			display: inline-flex;
			align-items: center;
		}
		:host([hidden]) {
			display: none !important;
		}
		button {
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 2rem;
			min-height: 2rem;
		}
	`}