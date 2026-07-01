import t from"./Control.js";import{html as e,css as r}from"../../lit-all.min.js";import"../Dropdown.js";import"../Icon.js";const o=[.25,.5,.75,1,1.25,1.5,1.75,2];export default class n extends t{static requires=["setPlaybackRate"];static hostEvents=["ratechange"];handleSelect=t=>{this.host?.setPlaybackRate?.(t)};render(){const t=this.host?.playbackRate??1;return e`
      <k-dropdown open-direction="up center">
        <button slot="trigger" type="button" class="no-btn" title="Playback Speed">
          ${t}x
          <k-icon name="arrow_drop_down"></k-icon>
        </button>
        ${o.map(r=>e`
          <button type="button" @click=${()=>this.handleSelect(r)}>${r===t?"✓ ":""}${r}x</button>
        `)}
      </k-dropdown>
    `}static styles=[t.styles,r`
      :host {
        display: inline-flex;
        margin: var(--spacer_q);
      }
      k-dropdown {
        display: inline-flex;
        --tc: #fff;
        --c_bg__alt: rgba(255, 255, 255, 0.2);
      }
      button[slot="trigger"] {
        display: inline-flex;
        align-items: center;
        gap: 0.1rem;
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
      k-dropdown::part(menu) {
        background: rgba(0, 0, 0, 0.85);
        border: none;
        box-shadow: var(--drop_shadow);
        min-width: 4.5rem;
      }
    `]}customElements.define("kc-vid-speed",n);