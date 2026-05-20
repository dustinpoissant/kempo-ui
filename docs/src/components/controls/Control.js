import t from"../ShadowComponent.js";import{css as e}from"../../lit-all.min.js";export default class s extends t{static properties={hidden:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0}};static requires=[];static hostEvents=[];constructor(){super(),this.hidden=!1,this.disabled=!1}connectedCallback(){super.connectedCallback();const t=this.host;if(this.boundHost=t,this.updateHostSupport(),t){this.modeHandler=()=>{this.updateModeVisibility(),this.requestUpdate()},t.addEventListener("mode-changed",this.modeHandler),this.hostEventHandler=()=>this.requestUpdate();for(const e of this.constructor.hostEvents||[])t.addEventListener(e,this.hostEventHandler);this.updateModeVisibility()}}disconnectedCallback(){if(super.disconnectedCallback(),this.boundHost&&(this.modeHandler&&this.boundHost.removeEventListener("mode-changed",this.modeHandler),this.hostEventHandler))for(const t of this.constructor.hostEvents||[])this.boundHost.removeEventListener(t,this.hostEventHandler);this.modeHandler=null,this.hostEventHandler=null,this.boundHost=null}updated(t){super.updated(t),t.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}get host(){if(this.boundHost)return this.boundHost;let t=this.getRootNode();for(;t instanceof ShadowRoot;){const e=t.host,s=e?.closest?.("[controlled]")||(e?.hasAttribute?.("controlled")?e:null);if(s)return s;t=e.getRootNode()}return this.closest("[controlled]")}updateHostSupport(){const t=this.host,e=this.constructor.requires||[],s=!(t&&e.every(e=>"function"==typeof t[e]));this.disabled!==s&&(this.disabled=s)}updateModeVisibility(){const t=this.constructor.hostMode;if(!t)return;const e=this.host;if(!e)return;if(!("mode"in e))return;const s=!(Array.isArray(t)?t:[t]).includes(e.mode);this.hidden!==s&&(this.hidden=s)}invokeHost(t,...e){const s=this.host;if(s&&"function"==typeof s[t])return s[t](...e)}static styles=e`
    :host {
      display: inline-flex;
    }
    :host([hidden]) {
      display: none !important;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
  `}customElements.define("kc-control",s);