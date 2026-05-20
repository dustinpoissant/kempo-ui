import ButtonControl from './Button.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class WordWrap extends ButtonControl {
  static requires = ['toggleWordWrap'];
  static hostMode = 'code';
  static hostEvents = ['word-wrap-changed'];

  static properties = {
    ...ButtonControl.properties,
    active: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.active = true;
  }

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Toggle Word Wrap';
    if(this.host) this.active = this.host.wordWrap !== false;
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    if(this.host) this.active = this.host.wordWrap !== false;
  }

  handleAction() { this.invokeHost('toggleWordWrap'); }

  render() { return html`<slot><k-icon name="wrap_text"></k-icon></slot>`; }
}

customElements.define('kc-word-wrap', WordWrap);
