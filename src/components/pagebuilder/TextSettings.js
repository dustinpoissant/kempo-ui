import WidgetSettings from './WidgetSettings.js';
import { html, css, ref, createRef } from '../../lit-all.min.js';
import sanitizeHtml from '../../utils/sanitizeHtml.js';
import '../HtmlEditor.js';
import '../Dialog.js';

/*
  The settings of a Text widget: its colour, background and corners, then an Edit button. The text is not edited on the
  page. Edit opens the rich text editor in a large dialog, and Save stores the cleaned HTML on the widget, as one step.
*/
export default class TextSettings extends WidgetSettings {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    ...WidgetSettings.properties,
    dialogOpen: { state: true },
    draft: { state: true }
  };

  /*
    Constructor
  */
  constructor() {
    super();
    this.dialogOpen = false;
    this.draft = '';
    this.dialogRef = createRef();
  }

  /*
    Event Handlers
  */
  handleEdit = async () => {
    this.draft = this.node.attrs?.html ?? '';
    this.dialogOpen = true;
    await this.updateComplete;
    this.dialogRef.value.open();
  };

  handleChange = event => {
    this.draft = event.target.value;
  };

  handleSave = () => {
    this.set('html', sanitizeHtml(this.draft), false);
  };

  handleClose = () => {
    this.dialogOpen = false;
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
      <k-dialog ${ref(this.dialogRef)} confirm-text="Save text" cancel-text="Cancel" .confirmAction="${this.handleSave}" @close="${this.handleClose}">
        <h5 slot="title" class="pyh px m0">Edit text</h5>
        ${this.dialogOpen ? html`
          <div class="p">
            <k-html-editor controls="full" .value="${this.draft}" @change="${this.handleChange}"></k-html-editor>
          </div>` : ''}
      </k-dialog>
    `;
  }

  static styles = css`
    k-dialog {
      --width: min(95vw, 80rem);
      --height: 85vh;
    }
    k-html-editor {
      min-height: 55vh;
    }
  `;
}

customElements.define('k-page-builder-text-settings', TextSettings);
