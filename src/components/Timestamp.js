import { html } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import formatTimestamp from '../utils/formatTimestamp.js';

export default class Timestamp extends ShadowComponent {
  static properties = {
    timestamp: { type: String, reflect: true },
    format: { type: String, reflect: true },
    locale: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.timestamp = '';
    this.format = '';
    this.locale = '';
  }

  /*
    Rendering Logic
  */
  render() {
    const formattedTime = this.timestamp
      ? formatTimestamp(this.timestamp, this.format, this.locale || navigator.language)
      : '';
      
    return html`<span>${formattedTime}</span>`;
  }
}

window.customElements.define('k-timestamp', Timestamp);
