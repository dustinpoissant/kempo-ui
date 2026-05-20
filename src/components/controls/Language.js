import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

const COMMON_LANGUAGES = [
  'javascript', 'typescript', 'html', 'css', 'json',
  'markdown', 'python', 'java', 'csharp', 'cpp',
  'go', 'rust', 'php', 'ruby', 'sql',
  'xml', 'yaml', 'shell', 'plaintext'
];

export default class LanguageSelect extends Control {
  static requires = ['setLanguage'];
  static hostMode = 'code';
  static hostEvents = ['language-changed'];

  static properties = {
    ...Control.properties,
    value: { type: String, state: true }
  };

  constructor() {
    super();
    this.value = 'javascript';
  }

  connectedCallback() {
    super.connectedCallback();
    if(this.host) this.value = this.host.language || 'javascript';
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    if(this.host) this.value = this.host.language || 'javascript';
  }

  handleChange = e => { this.invokeHost('setLanguage', e.target.value); };

  static styles = [
    Control.styles,
    css`
      :host {
        align-items: center;
        padding: 0 0.25rem;
        gap: 0.25rem;
      }
    `
  ];

  render() {
    return html`
      <select .value=${this.value} @change=${this.handleChange} title="Language">
        ${COMMON_LANGUAGES.map(lang => html`
          <option value="${lang}" ?selected=${this.value === lang}>${lang}</option>
        `)}
      </select>
    `;
  }
}

customElements.define('kc-language', LanguageSelect);
