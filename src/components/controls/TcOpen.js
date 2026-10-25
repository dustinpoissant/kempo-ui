import ButtonControl from './ButtonControl.js';
import Control from './Control.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';
import openUrl from '../../utils/openUrl.js';

export default class TcOpen extends ButtonControl {
  static properties = {
    ...Control.properties,
    target: { type: String, reflect: true }
  };

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = this.target === '_blank' ? 'Open in New Tab' : 'Open';
  }

  get record() {
    const $rec = this.closest('.record');
    if($rec){
      const idx = $rec.dataset.index;
      if(idx !== undefined) return this.host?.records?.[idx];
    }
    return null;
  }

  handleAction() {
    const url = this.record?._url;
    if(url) openUrl(url, this.target);
  }

  render() {
    const icon = this.target === '_blank' ? 'open_in_browser' : 'visibility';
    return html`<slot><k-icon name="${icon}"></k-icon></slot>`;
  }
}

customElements.define('kc-tc-open', TcOpen);
