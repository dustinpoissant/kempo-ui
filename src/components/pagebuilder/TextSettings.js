import WidgetSettings from './WidgetSettings.js';
import { html } from '../../lit-all.min.js';
import sanitizeHtml from '../../utils/sanitizeHtml.js';
import '../HtmlEditor.js';
import Dialog from '../Dialog.js';

/*
  The settings of a Text widget: its colour, background and corners, then an Edit button. The text is not edited on the
  page. Edit opens the rich text editor in a large dialog (on the page, `Dialog.create`, so it is above everything on it), and Save
  stores the cleaned HTML on the widget, as one step.
*/
export default class TextSettings extends WidgetSettings {
  /*
    Event Handlers
  */
  handleEdit = () => {
    let draft = this.node.attrs?.html ?? '';
    Dialog.create(html`
      <div class="p">
        <k-html-editor controls="full" style="min-height: 55vh;" .value="${draft}" @change="${event => { draft = event.target.value; }}"></k-html-editor>
      </div>
    `, {
      title: 'Edit text',
      confirmText: 'Save text',
      cancelText: 'Cancel',
      width: 'min(95vw, 80rem)',
      height: '85vh',
      confirmAction: () => this.set('html', sanitizeHtml(draft), false)
    });
  };

  /*
    Rendering
  */
  render() {
    if(!this.node) return '';
    return html`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.handleEdit}">Edit text</button>
      </div>
    `;
  }
}

customElements.define('k-page-builder-text-settings', TextSettings);
