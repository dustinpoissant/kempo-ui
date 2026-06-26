/*
  Context Component

  A non-rendering state container for sharing data between sibling and descendant
  components, similar in purpose to React's useContext. Place it as an ancestor
  of components that need shared state; children locate it via closest('k-context').

  Set a `persistent-id` to auto-save/load the data to localStorage (the same
  convention used by Split, Accordion, Tabs and Aside).
*/
import { html } from '../lit-all.min.js';
import LightComponent from './LightComponent.js';

/*
  Symbols
*/
const persist = Symbol('persist');

export default class Context extends LightComponent {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    data: { type: String, reflect: true },
    persistentId: { type: String, reflect: true, attribute: 'persistent-id' }
  };

  /*
    Constructor
  */
  constructor() {
    super();

    /*
      Private Methods
    */
    // Mirror the data blob into localStorage whenever a persistent-id is set, so the
    // next page load can restore it. Guarded so a full/blocked store (private mode,
    // quota) never throws out of a set/delete.
    this[persist] = () => {
      if(!this.persistentId || !window?.localStorage) return;
      try {
        window.localStorage.setItem(`context-persistent-id-${this.persistentId}`, this.data);
      } catch { /* storage unavailable — keep working in-memory */ }
    };

    /*
      Init Props
    */
    this.data = '{}';
    this.persistentId = null;
  }

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    this.style.display = 'contents';
    // Restore persisted state up front, before descendants read it on their own
    // connect. Setting data directly (rather than per-key set) intentionally skips
    // events: the context is an ancestor, so children read the loaded values via
    // closest('k-context').get() when they first render.
    if(this.persistentId && window?.localStorage){
      const stored = window.localStorage.getItem(`context-persistent-id-${this.persistentId}`);
      if(stored) this.data = stored;
    }
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
    this[persist]();
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
    this[persist]();
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
