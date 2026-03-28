/*
  Context Component

  A non-rendering state container for sharing data between sibling and descendant
  components, similar in purpose to React's useContext. Place it as an ancestor
  of components that need shared state; children locate it via closest('k-context').
*/
import { html } from '../lit-all.min.js';
import LightComponent from './LightComponent.js';

export default class Context extends LightComponent {
  static properties = {
    data: { type: String, reflect: true }
  };

  constructor() {
    super();
    this.data = '{}';
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    this.style.display = 'contents';
  }

  /*
    Public Methods
  */
  set(key, value) {
    const obj = JSON.parse(this.data || '{}');
    const isNew = !(key in obj);
    const oldValue = obj[key];
    obj[key] = value;
    this.data = JSON.stringify(obj);
    this.dispatchEvent(new CustomEvent(isNew ? 'context:create' : 'context:set', {
      detail: isNew ? { key, value } : { key, value, oldValue },
      bubbles: true,
      composed: true
    }));
  }

  get(key) {
    return JSON.parse(this.data || '{}')[key];
  }

  has(key) {
    return key in JSON.parse(this.data || '{}');
  }

  delete(key) {
    const obj = JSON.parse(this.data || '{}');
    if(!(key in obj)) return;
    const value = obj[key];
    delete obj[key];
    this.data = JSON.stringify(obj);
    this.dispatchEvent(new CustomEvent('context:delete', {
      detail: { key, value },
      bubbles: true,
      composed: true
    }));
  }

  clear() {
    for(const key of Object.keys(JSON.parse(this.data || '{}'))){
      this.delete(key);
    }
  }

  getData() {
    return JSON.parse(this.data || '{}');
  }

  /*
    Rendering
  */
  renderLightDom() {
    return html``;
  }
}

customElements.define('k-context', Context);
