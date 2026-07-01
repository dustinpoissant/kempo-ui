import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class VidDownload extends ButtonControl {
  static requires = ['download'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Download';
  }

  handleAction() { this.host?.download?.(); }

  render() { return html`<slot><k-icon name="download"></k-icon></slot>`; }
}

customElements.define('kc-vid-download', VidDownload);
