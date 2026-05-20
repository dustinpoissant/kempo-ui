import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../SpeechToText.js';

export default class MdSpeechToText extends Control {
  static requires = ['replaceSelection'];
  static hostMode = 'write';

  static properties = {
    ...Control.properties,
    language: { type: String, reflect: true },
    continuous: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.language = 'en-US';
    this.continuous = false;
  }

  handleEnd = (e) => {
    const text = (e.detail?.text || '').trim();
    if(!text) return;
    this.invokeHost('replaceSelection', text + ' ', { selectInserted: false });
  };

  render() {
    return html`
      <k-speech-to-text
        language=${this.language}
        ?continuous=${this.continuous}
        @end=${this.handleEnd}
      ></k-speech-to-text>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host { margin: var(--spacer_q); }
      k-speech-to-text { --btn_size: 2rem; }
    `
  ];
}

customElements.define('kc-md-speech-to-text', MdSpeechToText);
