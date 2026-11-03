import Control from './Control.js';
import { html, css, nothing } from '../../lit-all.min.js';

export default class MediaLink extends Control {
  static requires = [];
  static hostEvents = ['src-changed'];

  render() {
    if(!this.host?.src) return nothing;
    const url = new URL(this.host.src, document.baseURI).href;
    return html`<a class="link" href="${url}" target="_blank" rel="noopener">${url}</a>`;
  }

  static styles = [
    Control.styles,
    css`
      :host {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
      }
      .link {
        display: block;
        min-width: 0;
        padding: 0 0.25rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: inherit;
        font: inherit;
      }
    `
  ];
}

customElements.define('kc-media-link', MediaLink);
