import e from"./Control.js";import{html as t,css as n}from"../../lit-all.min.js";import"../Dropdown.js";import"../Slider.js";import"../Icon.js";export default class i extends e{static requires=["setVolume","toggleMute"];static hostEvents=["volumechange"];handleMuteClick=e=>{e.stopPropagation(),this.host?.toggleMute?.()};handleVolumeChange=e=>{const t=Number(e.detail?.value??e.target?.value);isNaN(t)||this.host?.setVolume?.(t/100)};render(){const e=this.host,n=!e||e.muted||0===e.volume,i=Math.round(100*(e?.volume??1));return this.inMenu?t`
        <button type="button" class="mute no-btn" title="Mute / Unmute" @click=${this.handleMuteClick}>
          <k-icon name="${n?"volume_off":"volume_up"}"></k-icon>
        </button>
        <k-slider
          min="0"
          max="100"
          .value=${String(i)}
          @change=${this.handleVolumeChange}
        ></k-slider>
      `:t`
      <k-dropdown hover open-direction="up center">
        <div slot="trigger" @click=${this.handleMuteClick} title="Mute / Unmute" style="display: inline-flex; align-items: center; justify-content: center;">
          <k-icon name="${n?"volume_off":"volume_up"}"></k-icon>
        </div>
        <div class="popup">
          <k-slider
            vertical
            min="0"
            max="100"
            .value=${String(i)}
            @change=${this.handleVolumeChange}
          ></k-slider>
        </div>
      </k-dropdown>
    `}static styles=[e.styles,n`
      :host {
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        margin: var(--spacer_q);
        padding: var(--spacer_h);
        display: inline-flex;
        background: transparent;
        color: inherit;
      }
      k-dropdown {
        display: inline-flex;
      }
      k-dropdown::part(menu) {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0.875rem 0.5rem;
        margin: 0;
        overflow: visible;
      }
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        font-size: inherit;
      }
      .popup {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
      }
      k-slider {
        --vertical_height: 6rem;
        --track_background: rgba(255, 255, 255, 0.3);
      }
      :host([in-menu]) {
        border-color: transparent;
      }
      :host([in-menu]) k-slider {
        flex: 1;
        min-width: 8rem;
        --track_background: var(--c_border);
      }
      .mute {
        display: inline-flex;
        cursor: pointer;
        color: inherit;
      }
    `]}customElements.define("kc-media-volume",i);