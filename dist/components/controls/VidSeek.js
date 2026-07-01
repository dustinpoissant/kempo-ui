import e from"./Control.js";import{html as t,css as s}from"../../lit-all.min.js";import"../Slider.js";export default class n extends e{static requires=["seek"];scrubbing=!1;connectedCallback(){super.connectedCallback();const e=this.host;e&&(e.addEventListener("timeupdate",this.handleHostUpdate),e.addEventListener("durationchange",this.handleHostUpdate),e.addEventListener("loadedmetadata",this.handleHostUpdate),e.addEventListener("seeked",this.handleHostUpdate))}disconnectedCallback(){const e=this.boundHost;super.disconnectedCallback(),e&&(e.removeEventListener("timeupdate",this.handleHostUpdate),e.removeEventListener("durationchange",this.handleHostUpdate),e.removeEventListener("loadedmetadata",this.handleHostUpdate),e.removeEventListener("seeked",this.handleHostUpdate))}handleHostUpdate=()=>{this.scrubbing||this.requestUpdate()};handlePointerDown=()=>{this.scrubbing=!0;const e=()=>{this.scrubbing=!1,this.requestUpdate(),window.removeEventListener("pointerup",e)};window.addEventListener("pointerup",e)};handleChange=e=>{const t=Number(e.detail?.value??e.target?.value);isNaN(t)||this.host?.seek?.(t)};render(){const e=this.host,s=e?.duration||0,n=e?.currentTime||0;return t`
      <div class="seek" @pointerdown=${this.handlePointerDown}>
        <k-slider
          min="0"
          max=${s||1}
          .value=${String(n)}
          @change=${this.handleChange}
        ></k-slider>
      </div>
    `}static styles=[e.styles,s`
      :host {
        flex: 1 1 auto;
        min-width: 4rem;
        margin: 0 var(--spacer_q, 0.25rem);
      }
      .seek {
        width: 100%;
      }
      k-slider {
        width: 100%;
        --thumb_size: 14px;
        --track_height: 4px;
        --track_background: rgba(255, 255, 255, 0.3);
      }
    `]}customElements.define("kc-vid-seek",n);