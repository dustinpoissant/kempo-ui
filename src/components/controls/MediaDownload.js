import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class MediaDownload extends ButtonControl {
  static requires = ['download'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Download';
  }

  handleAction() { this.host?.download?.(); }

  render() { return html`<slot><k-icon name="download"></k-icon></slot><slot name="menu-text">Download</slot>`; }
}

customElements.define('kc-media-download', MediaDownload);
