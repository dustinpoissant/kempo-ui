import ButtonControl from './Button.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

/*
  Markdown Link control. Toggles `[text](url)` wrapping. If the cursor is
  inside an existing link, unwraps it to just the label.
*/
export default class MdLink extends ButtonControl {
  static requires = ['replaceSelection'];
  static hostMode = 'write';

  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Link';
  }

  handleAction() {
    const host = this.host;
    if(!host) return;
    const ta = host.textarea;
    if(!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selText = ta.value.substring(start, end);

    const re = /\[([^\]]*)\]\([^)]*\)/g;
    let m;
    while((m = re.exec(ta.value)) !== null){
      const ms = m.index;
      const me = ms + m[0].length;
      if(start >= ms && end <= me){
        const label = m[1];
        const next = ta.value.substring(0, ms) + label + ta.value.substring(me);
        ta.value = next;
        ta.selectionStart = ms;
        ta.selectionEnd = ms + label.length;
        ta.focus();
        host.value = next;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }

    const text = selText || 'link text';
    const inserted = `[${text}](url)`;
    const next = ta.value.substring(0, start) + inserted + ta.value.substring(end);
    const urlStart = start + 1 + text.length + 2;
    ta.value = next;
    ta.selectionStart = urlStart;
    ta.selectionEnd = urlStart + 'url'.length;
    ta.focus();
    host.value = next;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  render() { return html`<slot><k-icon name="link"></k-icon></slot>`; }
}

customElements.define('kc-md-link', MdLink);
