import t from"./Control.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Dropdown.js";import"../Icon.js";const n=[.25,.5,.75,1,1.25,1.5,1.75,2];export default class r extends t{static requires=["setPlaybackRate"];static hostEvents=["ratechange"];constructor(){super(),this.inMenu=!1}connectedCallback(){super.connectedCallback(),this.inMenu=!!this.closest("kc-vid-menu")}handleSelect=t=>{this.host?.setPlaybackRate?.(t)};render(){const t=this.host?.playbackRate??1;return e`
      <k-dropdown ?submenu=${this.inMenu} open-direction=${this.inMenu?"right down":"up center"}>
        <button slot="trigger" type="button" class="no-btn" title="Playback Speed">
          <div class="row">
            <slot></slot>
            <span class="rate">${t}x</span>
            ${this.inMenu?"":e`<k-icon name="arrow_drop_down"></k-icon>`}
          </div>
        </button>
        ${n.map(o=>e`
          <button type="button" @click=${()=>this.handleSelect(o)}>${o===t?"✓ ":""}${o}x</button>
        `)}
      </k-dropdown>
    `}static styles=[t.styles,o`
      :host {
        display: inline-flex;
        margin: var(--spacer_q);
      }
      k-dropdown {
        display: inline-flex;
        width: 100%;
        --tc: #fff;
        --c_bg__alt: rgba(255, 255, 255, 0.2);
      }
      /* Standalone toolbar look: a small bordered button. In submenu
         mode, Dropdown's own :host([submenu]) #trigger ::slotted(button)
         rule resets this with all: unset so it blends into its own
         full-width row instead — .row (not this button) carries the
         icon/label/rate layout so it survives that reset either way. */
      button[slot="trigger"] {
        display: inline-flex;
        width: 100%;
        min-width: 1.75rem;
        min-height: 1.5rem;
        padding: 0 0.35rem;
        background: transparent;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        color: inherit;
        cursor: pointer;
        font: inherit;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
      }
      /* Empty by default (compact toolbar look). When VidMenu slots an
         icon + label in, display: contents lets that content join .row
         directly instead of being one flex item, so the label's flex:1
         can push .rate/chevron to the row's end. */
      slot {
        display: contents;
      }
      .rate {
        white-space: nowrap;
      }
      k-dropdown::part(menu) {
        background: rgba(0, 0, 0, 0.85);
        border: none;
        box-shadow: var(--drop_shadow);
        min-width: 4.5rem;
      }
      /* Dropdown's own #trigger wrapper is content-sized by default, so
         width: 100% on the button alone isn't enough when embedded as a
         full-width menu row — the wrapper needs to grow too, or the
         button/row has no room to actually fill into. In submenu mode
         #trigger also carries its own padding + hover background, which
         stacked on top of kc-vid-menu's row padding/hover on the host
         reads as "a button inside a button" — zero those out so the host
         (styled by kc-vid-menu) is the only box/hover layer. */
      k-dropdown::part(trigger) {
        width: 100%;
        padding: 0;
      }
      k-dropdown::part(trigger):hover {
        background: transparent;
      }
    `]}customElements.define("kc-vid-speed",r);