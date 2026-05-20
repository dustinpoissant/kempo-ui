import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class Minimap extends ButtonControl {
  static requires = ['toggleMinimap'];
  static hostMode = 'code';
  static hostEvents = ['minimap-changed'];

  static properties = {
    ...ButtonControl.properties,
    active: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.active = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Toggle Minimap';
    if(this.host) this.active = !!this.host.minimapEnabled;
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    if(this.host) this.active = !!this.host.minimapEnabled;
  }

  handleAction() { this.invokeHost('toggleMinimap'); }

  render() { return html`<slot><k-icon name="map"></k-icon></slot>`; }
}

customElements.define('kc-minimap', Minimap);
