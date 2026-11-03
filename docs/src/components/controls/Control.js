import t from"../ShadowComponent.js";import{css as e}from"../../lit-all.min.js";export default class o extends t{static properties={hidden:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},inMenu:{type:Boolean,reflect:!0,attribute:"in-menu"}};static requires=[];static hostEvents=[];constructor(){super(),this.hidden=!1,this.disabled=!1,this.inMenu=!1}connectedCallback(){super.connectedCallback();const t=this.host;if(this.boundHost=t,this.updateHostSupport(),t){this.modeHandler=()=>{this.updateModeVisibility(),this.requestUpdate()},t.addEventListener("mode-changed",this.modeHandler),this.hostEventHandler=()=>this.requestUpdate();for(const e of this.constructor.hostEvents||[])t.addEventListener(e,this.hostEventHandler);this.updateModeVisibility()}}disconnectedCallback(){if(super.disconnectedCallback(),this.boundHost&&(this.modeHandler&&this.boundHost.removeEventListener("mode-changed",this.modeHandler),this.hostEventHandler))for(const t of this.constructor.hostEvents||[])this.boundHost.removeEventListener(t,this.hostEventHandler);this.modeHandler=null,this.hostEventHandler=null,this.boundHost=null}updated(t){super.updated(t),t.has("hidden")&&this.dispatchEvent(new CustomEvent("control_visibility_change",{bubbles:!0}))}get host(){if(this.boundHost)return this.boundHost;let t=this.getRootNode();for(;t instanceof ShadowRoot;){const e=t.host,o=e?.closest?.("[controlled]")||(e?.hasAttribute?.("controlled")?e:null);if(o)return o;t=e.getRootNode()}return this.closest("[controlled]")}updateHostSupport(){const t=this.host,e=this.constructor.requires||[],o=!(t&&e.every(e=>"function"==typeof t[e]));this.disabled!==o&&(this.disabled=o)}updateModeVisibility(){const t=this.constructor.hostMode;if(!t)return;const e=this.host;if(!e)return;if(!("mode"in e))return;const o=!(Array.isArray(t)?t:[t]).includes(e.mode);this.hidden!==o&&(this.hidden=o)}static load=(()=>{const t=/<(kc-[a-z][a-z0-9-]*|k-control-group|k-control-bar)\b/g,e=new Set,o=t=>{if("k-control-group"===t)return"../ControlGroup.js";if("k-control-bar"===t)return"../ControlBar.js";return`./${t.slice(3).split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join("")}.js`},s=(e,o=new Set)=>{if(!e)return o;if(Array.isArray(e))return e.forEach(t=>s(t,o)),o;if(e.strings)for(const s of e.strings){let e;for(t.lastIndex=0;null!==(e=t.exec(s));)o.add(e[1])}if("object"==typeof e)for(const t of Object.values(e))t&&(Array.isArray(t)||t.strings)&&s(t,o);return o};return async t=>{const n=s(t),i=new URL("./",import.meta.url).href,r=[];for(const t of n)e.has(t)||(e.add(t),r.push(import(new URL(o(t),i).href)));r.length&&await Promise.all(r)}})();static styles=e`
    :host {
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      height: var(--control_height, 40px);
    }
    input, select {
      align-self: stretch;
      box-sizing: border-box;
      margin: 0;
    }
    :host([hidden]) {
      display: none !important;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    :host([in-menu]) {
      display: flex;
      align-items: center;
      gap: var(--spacer_h);
      width: 100%;
      height: auto;
      min-height: 2rem;
      margin: 0;
      padding: var(--spacer_h) var(--spacer);
      box-sizing: border-box;
      border-color: transparent;
      border-radius: 0;
    }
    slot[name="menu-text"] {
      display: none;
    }
    :host([in-menu]) slot[name="menu-text"] {
      display: block;
      flex: 1;
    }
    :host([in-menu]) k-dropdown {
      display: block;
      width: 100%;
    }
    :host([in-menu]) k-dropdown::part(trigger) {
      display: flex;
      width: 100%;
    }
    :host([in-menu]) .trigger {
      display: flex;
      justify-content: flex-start;
      gap: var(--spacer_h);
      width: 100%;
      height: auto;
      min-height: 2rem;
      padding: var(--spacer_h) var(--spacer);
      border-radius: 0;
      text-align: left;
      white-space: nowrap;
    }
  `}customElements.define("kc-control",o);