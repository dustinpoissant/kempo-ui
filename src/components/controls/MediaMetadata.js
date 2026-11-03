import Control from './Control.js';
import { html, css, nothing } from '../../lit-all.min.js';

export default class MediaMetadata extends Control {
  static requires = [];
  static hostEvents = ['metadata-changed', 'play', 'pause', 'ended'];
  static properties = {
    scrollMode: { type: String, attribute: 'scroll-mode' }
  };

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.scrollMode = 'auto';
  }

  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  updated(changed) {
    super.updated(changed);
    this.measure();
  }

  /*
    Measuring
  */
  measure = () => {
    const wrap = this.shadowRoot?.querySelector('.meta');
    const text = wrap?.querySelector('.text');
    if(!wrap || !text) return;
    this.resizeObserver?.observe(text);
    const wrapWidth = wrap.clientWidth;
    const textWidth = text.offsetWidth;
    wrap.style.setProperty('--wrap-width', `${wrapWidth}px`);
    wrap.style.setProperty('--text-width', `${textWidth}px`);
    wrap.style.setProperty('--duration', `${(wrapWidth + textWidth) / 40}s`);
    wrap.toggleAttribute('scrolling', this.scrollMode === 'always' || textWidth > wrapWidth);
  };

  /*
    Rendering
  */
  render() {
    const parts = [this.host?.artist, this.host?.trackTitle, this.host?.album, this.host?.year].filter(Boolean);
    if(!parts.length) return nothing;
    return html`
      <div class="meta" ?paused=${this.host?.paused}>
        <span class="text">${parts.join(' • ')}</span>
      </div>
    `;
  }

  static styles = [
    Control.styles,
    css`
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
    `
  ];
}

customElements.define('kc-media-metadata', MediaMetadata);
