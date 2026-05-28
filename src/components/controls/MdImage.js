import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import '../Dropdown.js';

export default class MdImage extends Control {
  static requires = ['replaceSelection'];
  static hostMode = 'write';

  handleDropdownOpened = () => {
    requestAnimationFrame(() => {
      const url = this.shadowRoot.querySelector('.image-url');
      const alt = this.shadowRoot.querySelector('.image-alt');
      url?.focus();
      const ta = this.host?.textarea;
      if(ta && alt) alt.value = ta.value.substring(ta.selectionStart, ta.selectionEnd) || '';
    });
  };

  handleDropdownClosed = () => {
    const u = this.shadowRoot.querySelector('.image-url');
    const a = this.shadowRoot.querySelector('.image-alt');
    if(u) u.value = '';
    if(a) a.value = '';
  };

  handleFormKeydown = (e) => {
    if(e.key === 'Enter'){ e.preventDefault(); this.submit(); }
    else if(e.key === 'Escape') this.shadowRoot.querySelector('k-dropdown')?.close();
  };

  submit() {
    const url = this.shadowRoot.querySelector('.image-url').value.trim();
    const alt = this.shadowRoot.querySelector('.image-alt').value.trim();
    if(!url){ this.shadowRoot.querySelector('.image-url').focus(); return; }
    this.host?.replaceSelection?.(`![${alt}](${url})`, { selectInserted: false });
    this.shadowRoot.querySelector('k-dropdown')?.close();
  }

  render() {
    return html`
      <k-dropdown @opened=${this.handleDropdownOpened} @closed=${this.handleDropdownClosed}>
        <button slot="trigger" type="button" class="trigger" title="Image"><k-icon name="image"></k-icon></button>
        <div class="image-form" @keydown=${this.handleFormKeydown}>
          <label>Image URL</label>
          <input class="image-url" type="url" required placeholder="https://example.com/image.png" />
          <label>Alt text</label>
          <input class="image-alt" type="text" placeholder="Description for screen readers" />
          <div class="image-actions">
            <button type="button" @click=${() => this.shadowRoot.querySelector('k-dropdown').close()}>Cancel</button>
            <button type="button" class="primary" @click=${() => this.submit()}>Insert</button>
          </div>
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    Control.styles,
    css`
      .trigger { min-width: 2.5rem; min-height: 2.5rem; background: transparent; border: none; cursor: pointer; }
      .image-form { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; min-width: 16rem; }
      .image-form label { font-weight: bold; font-size: 0.875rem; }
      .image-form input { padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit; }
      .image-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
      .image-actions button { padding: 0.4rem 0.8rem; border: 1px solid var(--c_border); border-radius: var(--radius); cursor: pointer; font: inherit; }
      .image-actions button.primary { background: var(--c_primary); color: white; border-color: var(--c_primary); }
    `
  ];
}

customElements.define('kc-md-image', MdImage);
