import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Dropdown.js';
import '../Icon.js';

const DEFAULT_BG_COLORS = '#ffff00,#00ffff,#ff66ff,#99ff99,#ffcc99,#ff9999,#cccccc,#ffffff,#ffffcc,#ccffff,#ffccff,#ccffcc';

export default class TextBackgroundColor extends Control {
  static requires = ['setTextBackgroundColor'];
  static hostMode = 'visual';

  static properties = {
    ...Control.properties,
    colors: { type: String },
    disableRemove: { type: Boolean, attribute: 'disable-remove' },
    disablePicker: { type: Boolean, attribute: 'disable-picker' }
  };

  constructor() {
    super();
    this.colors = DEFAULT_BG_COLORS;
    this.disableRemove = false;
    this.disablePicker = false;
  }

  get opened() { return this.shadowRoot?.querySelector('k-dropdown')?.opened ?? false; }
  set opened(v) { const dd = this.shadowRoot?.querySelector('k-dropdown'); if(dd) dd.opened = v; }

  handleRemove = () => {
    this.host?.removeTextBackgroundColor?.();
    this.shadowRoot.querySelector('k-dropdown')?.close();
  };

  handleSwatch = (e) => {
    const bg = e.target.style.backgroundColor;
    if(!bg) return;
    const rgb = bg.match(/\d+/g);
    const hex = rgb ? '#' + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('') : bg;
    this.host?.setTextBackgroundColor?.(hex);
    this.shadowRoot.querySelector('k-dropdown')?.close();
  };

  handlePicker = (e) => {
    this.host?.setTextBackgroundColor?.(e.target.value);
    this.shadowRoot.querySelector('k-dropdown')?.close();
  };

  render() {
    const arr = this.colors.split(',').map(c => c.trim()).filter(Boolean);
    return html`
      <k-dropdown>
        <button slot="trigger" class="no-btn trigger" title="Highlight Color">
          <k-icon name="format_color_fill"></k-icon>
        </button>
        <div class="content">
          ${this.disableRemove ? '' : html`<button class="remove" @click=${this.handleRemove}>Remove Color</button>`}
          <div class="swatches">
            ${arr.map(c => html`<button class="swatch" style="background-color:${c}" @click=${this.handleSwatch}></button>`)}
          </div>
          ${this.disablePicker ? '' : html`
            <div class="picker"><label>Custom:</label><input type="color" @input=${this.handlePicker} /></div>
          `}
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host { border: 1px solid var(--c_border); border-radius: var(--radius); margin: var(--spacer_q); }
      .trigger { display: inline-flex; align-items: center; justify-content: center; min-width: 2.5rem; min-height: 2.5rem; background: transparent; border: none; border-radius: var(--radius); cursor: pointer; }
      .trigger:hover { background: oklch(from var(--c_bg__inv) l c h / 0.15); }
      .content { padding: 8px; min-width: 200px; }
      .remove { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid var(--c_border); background: transparent; cursor: pointer; border-radius: var(--radius); }
      .swatches { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
      .swatch { width: 32px; height: 32px; border: 1px solid var(--c_border); cursor: pointer; border-radius: 4px; }
      .swatch:hover { box-shadow: 0 0 4px rgba(0,122,204,0.3); }
      .picker { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
      .picker input { flex: 1; height: 32px; border: 1px solid var(--c_border); border-radius: 4px; cursor: pointer; }
    `
  ];
}

customElements.define('kc-text-background-color', TextBackgroundColor);
