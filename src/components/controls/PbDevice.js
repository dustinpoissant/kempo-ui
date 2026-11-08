import ButtonControl from './ButtonControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

const DEVICES = {
  phone: { icon: 'smartphone', label: 'Phone' },
  tablet: { icon: 'tablet', label: 'Tablet' },
  desktop: { icon: 'desktop_windows', label: 'Desktop' }
};

/* One of the page's preview widths (`device="phone|tablet|desktop"`). It is active while the builder shows that width. */
export default class PbDevice extends ButtonControl {
  static requires = ['setDevice'];

  get device() {
    return this.getAttribute('device') in DEVICES ? this.getAttribute('device') : 'desktop';
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = `Preview on a ${DEVICES[this.device].label.toLowerCase()}`;
  }

  handleAction() { this.host?.setDevice?.(this.device); }

  render() {
    const { icon, label } = DEVICES[this.device];
    return html`<slot><k-icon name="${icon}"></k-icon></slot><slot name="menu-text">Preview on ${label}</slot>`;
  }
}

customElements.define('kc-pb-device', PbDevice);
