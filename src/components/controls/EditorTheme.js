import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class EditorTheme extends Control {
  static requires = ['setEditorTheme'];
  static hostMode = 'code';
  static hostEvents = ['editor-theme-changed'];

  static properties = {
    ...Control.properties,
    value: { type: String, state: true }
  };

  constructor() {
    super();
    this.value = 'auto';
  }

  connectedCallback() {
    super.connectedCallback();
    if(this.host) this.value = this.host.editorTheme || 'auto';
  }

  willUpdate(changed) {
    super.willUpdate?.(changed);
    if(this.host) this.value = this.host.editorTheme || 'auto';
  }

  handleChange = e => { this.host?.setEditorTheme?.(e.target.value); };

  static styles = [
    Control.styles,
    css`
      :host {
        position: relative;
        background-color: var(--input_bg);
        color: var(--input_tc);
        border: var(--input_border_width) solid var(--c_input_border);
        border-radius: var(--radius);
        transition: box-shadow var(--animation_ms);
        margin-right: var(--spacer_q);
      }
      k-icon {
        position: absolute;
        left: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
      }
      select {
        border: 0;
        padding: var(--spacer_h) 1rem var(--spacer_h) 2rem;
        min-height: 2.5rem;
      }
    `
  ];

  render() {
    return html`
      <k-icon name="contrast"></k-icon>
      <select .value=${this.value} @change=${this.handleChange} title="Editor Theme">
        <option value="auto">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    `;
  }
}

customElements.define('kc-editor-theme', EditorTheme);
