import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class VidPip extends ButtonControl {
  static requires = ['togglePictureInPicture'];
  static hostEvents = ['picture-in-picture-changed'];

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Picture in Picture';
  }

  updated(changed) {
    super.updated(changed);
    this.toggleAttribute('active', !!this.host?.pictureInPicture);
  }

  handleAction() { this.host?.togglePictureInPicture?.(); }

  render() { return html`<slot><k-icon name="pip"></k-icon></slot>`; }
}

customElements.define('kc-vid-pip', VidPip);
