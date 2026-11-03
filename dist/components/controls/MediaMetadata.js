import e from"./Control.js";import{html as t,css as s,nothing as r}from"../../lit-all.min.js";export default class i extends e{static requires=[];static hostEvents=["metadata-changed","play","pause","ended"];static properties={scrollMode:{type:String,attribute:"scroll-mode"}};constructor(){super(),this.scrollMode="auto"}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(()=>this.measure()),this.resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this.resizeObserver?.disconnect()}updated(e){super.updated(e),this.measure()}measure=()=>{const e=this.shadowRoot?.querySelector(".meta"),t=e?.querySelector(".text");if(!e||!t)return;this.resizeObserver?.observe(t);const s=e.clientWidth,r=t.offsetWidth;e.style.setProperty("--wrap-width",`${s}px`),e.style.setProperty("--text-width",`${r}px`),e.style.setProperty("--duration",(s+r)/40+"s"),e.toggleAttribute("scrolling","always"===this.scrollMode||r>s)};render(){const e=[this.host?.artist,this.host?.trackTitle,this.host?.album,this.host?.year].filter(Boolean);return e.length?t`
      <div class="meta" ?paused=${this.host?.paused}>
        <span class="text">${e.join(" • ")}</span>
      </div>
    `:r}static styles=[e.styles,s`
      :host {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        width: 100%;
      }
      .meta {
        display: block;
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.25rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font: inherit;
      }
      .text {
        display: inline-block;
      }
      .meta[scrolling] {
        text-overflow: clip;
      }
      .meta[scrolling] .text {
        animation: scroll var(--duration) linear infinite;
      }
      .meta[scrolling][paused] .text {
        animation-play-state: paused;
      }
      @keyframes scroll {
        from {
          transform: translateX(var(--wrap-width));
        }
        to {
          transform: translateX(calc(var(--text-width) * -1));
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .meta[scrolling] .text {
          animation: none;
        }
      }
    `]}customElements.define("kc-media-metadata",i);