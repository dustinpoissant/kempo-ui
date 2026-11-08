import t from"./ShadowComponent.js";import{html as e,css as r}from"../lit-all.min.js";import"./controls/Menu.js";import"./Icon.js";export default class i extends t{static nonCollapsible="kc-menu, kc-vid-menu, kc-spacer, k-dropdown, [no-collapse]";static splitGroup="k-control-group[split], kc-menu[split]";static properties={collapseOrder:{type:String,reflect:!0,attribute:"collapse-order"}};constructor(){super(),this.collapseOrder="right center left",this.moved=[],this.origins=new WeakMap,this.homes=new WeakMap,this.siblings=new Map,this.signature="",this.frame=0}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(()=>{this.measure()!==this.signature&&this.arrange()}),this.mutationObserver=new MutationObserver(this.schedule),this.mutationObserver.observe(this,{childList:!0}),this.addEventListener("control_visibility_change",this.schedule),this.hasUpdated&&this.schedule()}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this.frame),this.resizeObserver.disconnect(),this.mutationObserver.disconnect(),this.removeEventListener("control_visibility_change",this.schedule),this.restore(),this.controlHost&&!this.controlHost.querySelector("k-control-bar")&&this.controlHost.removeAttribute("has-control-bar")}firstUpdated(){this.bar=this.shadowRoot.getElementById("bar"),this.more=this.shadowRoot.getElementById("more"),this.schedule()}updated(t){t.has("collapseOrder")&&this.bar&&this.schedule()}schedule=()=>{cancelAnimationFrame(this.frame),this.frame=requestAnimationFrame(this.arrange)};get barControls(){return[...this.children].filter(t=>"overflow"!==t.getAttribute("slot"))}measure=()=>[this.bar.clientWidth,this.more.offsetWidth,...this.barControls.map(t=>t.offsetWidth)].join("|");isOverflowing=()=>{if(this.bar.scrollWidth>this.bar.clientWidth+1)return!0;const t=[...this.bar.children].map(t=>t.getBoundingClientRect()).filter(t=>t.width>0);return t.length>1&&t.at(-1).top>=t[0].bottom-.5};priority=t=>{const e=t.hasAttribute("priority")||!t.parentElement?.matches(this.constructor.splitGroup)?t:t.parentElement;return e.hasAttribute("priority")?Number(e.getAttribute("priority"))||1:0};findControlHost=()=>{let t=this;for(;t;){const e=t.closest?.("[controlled]");if(e)return e;const r=t.getRootNode();t=r instanceof ShadowRoot?r.host:null}return null};items=t=>[...t.children].filter(t=>!t.hasAttribute("slot"));shownChildren=t=>[...t.children].flatMap(t=>"slot"===t.localName?t.assignedElements({flatten:!0}):[t]);restore=()=>{[...this.moved].reverse().forEach(t=>{const e=this.homes.get(t);e&&(e.group.insertBefore(t,e.next?.parentNode===e.group?e.next:null),this.homes.delete(t));const r=this.origins.get(t);r?t.setAttribute("slot",r):t.removeAttribute("slot"),t.removeAttribute("in-menu"),t.matches("k-control-group")&&this.shownChildren(t).forEach(t=>t.removeAttribute("in-menu"))}),this.moved=[],this.siblings.clear(),[...this.children].filter(t=>t.matches(this.constructor.splitGroup)).forEach(t=>t.removeAttribute("collapsed"))};collapse=t=>{const e=t.parentElement===this?null:t.parentElement;if(e&&!this.siblings.has(e)&&this.siblings.set(e,this.items(e)),this.origins.set(t,t.getAttribute("slot")||""),t.setAttribute("slot","overflow"),t.setAttribute("in-menu",""),t.matches("k-control-group")&&this.shownChildren(t).forEach(t=>t.setAttribute("in-menu","")),e){const r=this.siblings.get(e);this.homes.set(t,{group:e,next:t.nextSibling});let i=e;for(;this.homes.get(i.nextElementSibling)?.group===e&&r.indexOf(i.nextElementSibling)<r.indexOf(t);)i=i.nextElementSibling;i.after(t),e.toggleAttribute("collapsed",!this.items(e).length)}this.moved.push(t),this.more.toggleAttribute("hidden",!1)};arrange=()=>{if(!this.bar)return;this.mutationObserver.disconnect(),this.controlHost=this.findControlHost(),this.controlHost?.setAttribute("has-control-bar",""),this.more.updateHostSupport(),this.restore(),this.more.toggleAttribute("hidden",!0);const t={default:[],center:[],right:[]};[...this.children].forEach(e=>t[e.getAttribute("slot")||"default"]?.push(e));const e=this.collapseOrder.split(/\s+/).map(t=>"left"===t?"default":t),{nonCollapsible:r,splitGroup:i}=this.constructor,s=e.flatMap(e=>(t[e]||[]).reverse()).filter(t=>!t.hidden).flatMap(t=>t.matches(i)&&!t.hasAttribute("no-collapse")?this.items(t).reverse():[t]).filter(t=>!t.hidden&&!t.matches(r)).sort((t,e)=>this.priority(t)-this.priority(e)),o=[...this.children].filter(t=>t.hasAttribute("soft-min-width"));o.forEach(t=>{const e=t.getAttribute("soft-min-width").trim();t.style.minWidth=/^[\d.]+$/.test(e)?`${e}px`:e});for(const t of s){if(!this.isOverflowing())break;this.collapse(t)}o.forEach(t=>t.style.removeProperty("min-width")),this.moved.length||(this.more.opened=!1),this.signature=this.measure(),this.resizeObserver.disconnect(),this.resizeObserver.observe(this.bar),this.resizeObserver.observe(this.more),this.barControls.forEach(t=>this.resizeObserver.observe(t)),this.isConnected&&this.mutationObserver.observe(this,{childList:!0})};render(){return e`
      <div id="bar">
        <div class="section"><slot></slot></div>
        <div class="section" id="center"><slot name="center"></slot></div>
        <div class="section">
          <slot name="right"></slot>
          <kc-menu id="more" title="More" hidden>
            <k-icon slot="icon" name="more_vert"></k-icon>
            <div><div id="tray"><slot name="overflow"></slot></div></div>
          </kc-menu>
        </div>
      </div>
    `}static styles=r`
    :host {
      display: block;
      flex: 1 1 auto;
      min-width: 0;
      --bar_border: var(--c_border);
    }
    /* Some hosts (k-audio, k-video) make --c_border transparent so their buttons are borderless, and the
       menu panel inherits it. Give the panel its own border color and keep the trigger like the host's controls. */
    #more {
      --c_border: oklch(from var(--c_bg__inv) l c h / 0.25);
      border-color: var(--bar_border);
    }
    #bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }
    .section {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
    }
    /* Grows so a stretchy control (a seek bar) can fill it; other controls stay centered in the free space. */
    #center {
      flex: 1 1 auto;
      justify-content: center;
    }
    /* Plain links and buttons (a navbar, say) become rows of the menu. !important because the page's own button and
       link styles would otherwise win over a ::slotted rule. */
    #tray ::slotted(a),
    #tray ::slotted(button) {
      display: block !important;
      box-sizing: border-box !important;
      width: 100% !important;
      margin: 0 !important;
      padding: var(--spacer_h) var(--spacer) !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--tc) !important;
      font: inherit !important;
      text-align: left !important;
      text-decoration: none !important;
      white-space: nowrap !important;
      cursor: pointer;
    }
    #tray ::slotted(a:hover),
    #tray ::slotted(button:hover) {
      background: oklch(from var(--c_bg__inv) l c h / 0.15) !important;
    }
    #tray {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-width: 12rem;
      max-width: min(24rem, 90vw);
      max-height: 66vh;
      overflow-y: auto;
    }
  `}customElements.define("k-control-bar",i);