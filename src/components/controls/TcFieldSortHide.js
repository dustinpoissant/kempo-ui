import ButtonControl from './ButtonControl.js';
import { html, render } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

export default class TcFieldSortHide extends ButtonControl {
  connectedCallback() {
    super.connectedCallback();
    if(!this.hasAttribute('title')) this.title = 'Show / Hide / Order Fields';
  }

  openDialog() { this.handleAction(); }

  handleAction() {
    import('../Sortable.js');
    const host = this.host;
    if(!host) return;

    const dialogContent = document.createElement('div');
    render(html`
      <div class="m">
        <k-sortable id="sorting" @sort=${(e) => {
          const newOrder = Array.from(e.target.querySelectorAll('k-sortable-item'))
            .map(item => item.getAttribute('data-field'));
          host.reorderFields(newOrder);
        }}>
          ${host.fields.map(field => html`
            <k-sortable-item data-field="${field.name}">
              <label class="field pb0">
                <input
                  class="field-visibility"
                  data-field="${field.name}"
                  type="checkbox"
                  .checked="${!field.hidden}"
                  @change="${(e) => host.setFieldHiddenState(field.name, !e.target.checked)}"
                  style="height: 1.25rem; width: 1.25rem"
                />
                ${field.label}
              </label>
            </k-sortable-item>
          `)}
        </k-sortable>
      </div>
    `, dialogContent);

    Dialog.create(dialogContent, {
      title: 'Show / Hide / Order Fields',
      width: '400px',
      cancelText: 'Close'
    });
  }

  render() { return html`<slot><k-icon name="table-visibility"></k-icon></slot>`; }
}

customElements.define('kc-tc-field-sort-hide', TcFieldSortHide);
