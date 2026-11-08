import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';
import { attributeDefault } from '../../utils/pageTree.js';
import '../Toggle.js';
import '../ColorPicker.js';
import IconSelector from '../IconSelector.js';

/* The social brand icons the picker offers beside the built-in ones (their files sit in the icons folder). */
['facebook', 'x', 'instagram', 'youtube', 'linkedin', 'tiktok', 'github-mark'].forEach(name => IconSelector.add(name));

/*
  The fields of a widget's declared settings, drawn by each setting's type and calling host.setWidgetAttribute as the
  person types. This is a widget's settings when it has no settings element of its own. A widget's own settings element
  can place this inside it (with `exclude`) to keep the declared fields and add its own controls around them.

  Hints sit between a field's label and the field. Settings with a type that needs a custom editor (a list, JSON) and
  the settings that are a widget's text (html, code) are left to the widget's own settings element.

  Image and icon fields are drawn by PageBuilderFields.pickers.image and .icon. A site replaces one by setting it to its
  own function (see the pickers below), so every image or icon field in the builder uses its picker.
*/
const CUSTOM = ['json'];
const TEXT_SETTINGS = ['html', 'code', 'markdown'];

/* The default picker for an address: a text box. */
const urlPicker = ({ id, value, change }) => html`<input id="${id}" type="text" class="full" .value="${value}" @input="${event => change(event.target.value, true)}">`;

export default class PageBuilderFields extends ShadowComponent {
  static properties = {
    node: { attribute: false },
    widget: { attribute: false },
    host: { attribute: false },
    version: { type: Number },
    exclude: { attribute: false }
  };

  /*
    Pickers
  */
  static pickers = {
    image: urlPicker,
    video: urlPicker,
    audio: urlPicker,
    icon: ({ id, value, change }) => html`<k-icon-selector id="${id}" class="full" placeholder="No icon" allow-clear .value="${value}" @change="${event => change(event.detail.value)}"></k-icon-selector>`
  };

  constructor() {
    super();
    this.exclude = [];
  }

  /*
    Public Methods
  */
  set(name, value, coalesce = true) {
    this.host.setWidgetAttribute(this.node.id, name, value, coalesce);
  }

  /*
    Protected Members
  */
  valueNamed(name) {
    const attribute = this.widget.attributes.find(other => other.name === name) || {};
    return this.node.attrs?.[name] ?? attributeDefault(attribute);
  }

  /*
    Rendering
  */
  renderField(attribute) {
    const id = `pb-field-${attribute.name}`;
    const value = this.valueNamed(attribute.name);
    const label = html`${attribute.label || attribute.name}${attribute.hint ? html`<small class="d-b tc-muted">${attribute.hint}</small>` : ''}`;
    if(attribute.type === 'boolean'){
      return html`
        <k-toggle id="${id}" .value="${!!value}" @change="${event => event.detail.value !== !!value && this.set(attribute.name, event.detail.value, false)}">${label}</k-toggle>`;
    }
    if(attribute.type === 'select'){
      return html`
        <div class="mb">
          <label class="d-b mbq" for="${id}">${label}</label>
          <select id="${id}" class="full" @change="${event => this.set(attribute.name, event.target.value, false)}">
            ${(attribute.options || []).map(option => html`<option value="${option.value}" ?selected="${String(option.value) === String(value)}">${option.label}</option>`)}
          </select>
        </div>`;
    }
    if(attribute.type === 'text'){
      return html`
        <div class="mb">
          <label class="d-b mbq" for="${id}">${label}</label>
          <textarea id="${id}" class="full" rows="4" .value="${String(value ?? '')}" @input="${event => this.set(attribute.name, event.target.value)}"></textarea>
        </div>`;
    }
    if(attribute.type === 'number'){
      const unit = this.widget.attributes.find(other => other.beside === attribute.name);
      const input = html`<input id="${id}" type="number" class="full" min="${attribute.min ?? ''}" max="${attribute.max ?? ''}" .value="${String(value ?? '')}" @input="${event => this.set(attribute.name, event.target.value === '' ? '' : Number(event.target.value))}">`;
      return html`
        <div class="mb">
          <label class="d-b mbq" for="${id}">${label}</label>
          ${unit ? html`<div class="with-unit">${input}<select aria-label="${unit.label || unit.name}" @change="${event => this.set(unit.name, event.target.value, false)}">${(unit.options || []).map(option => html`<option value="${option.value}" ?selected="${String(option.value) === String(this.valueNamed(unit.name))}">${option.label}</option>`)}</select></div>` : input}
        </div>`;
    }
    if(Object.hasOwn(PageBuilderFields.pickers, attribute.type)){
      return html`
        <div class="mb">
          <label class="d-b mbq" for="${id}">${label}</label>
          ${PageBuilderFields.pickers[attribute.type]({ id, value: String(value ?? ''), change: (next, coalesce = false) => this.set(attribute.name, next, coalesce) })}
        </div>`;
    }
    if(attribute.type === 'color'){
      return html`
        <div class="mb">
          <label class="d-b mbq" for="${id}">${label}</label>
          <div class="d-f">
            <k-color-picker id="${id}" format="hex" class="flex" .value="${String(value || '#000000')}" @change="${event => this.set(attribute.name, event.target.value, false)}"></k-color-picker>
            <button class="mlq" ?disabled="${!value}" @click="${() => this.set(attribute.name, '', false)}">Reset</button>
          </div>
        </div>`;
    }
    return html`
      <div class="mb">
        <label class="d-b mbq" for="${id}">${label}</label>
        <input id="${id}" type="text" class="full" .value="${String(value ?? '')}" @input="${event => this.set(attribute.name, event.target.value)}">
      </div>`;
  }

  static styles = css`
    .with-unit {
      display: flex;
      gap: 0.5rem;
    }
    .with-unit input {
      flex: 1;
      min-width: 0;
    }
    .with-unit select {
      width: auto;
    }
  `;

  render() {
    if(!this.node || !this.widget) return '';
    const shown = this.widget.attributes.filter(attribute => !this.exclude.includes(attribute.name)
      && !CUSTOM.includes(attribute.type)
      && !attribute.beside
      && !TEXT_SETTINGS.includes(attribute.name)
      && Object.entries(attribute.when || {}).every(([name, expected]) => String(this.valueNamed(name)) === expected));
    return html`${shown.map(attribute => this.renderField(attribute))}`;
  }
}

customElements.define('k-page-builder-fields', PageBuilderFields);
