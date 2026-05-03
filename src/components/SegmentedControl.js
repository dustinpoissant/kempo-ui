import { html, css, unsafeHTML } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

class SegmentedControl extends ShadowComponent {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    name: { type: String }
  };

  constructor() {
    super();
    this.value = '';
    this.name = '';
    this.initialValue = '';
    if(typeof this.attachInternals === 'function') {
      try {
        this.internals = this.attachInternals();
      } catch (e) {
        // Form context not available
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Store the initial value from the attribute
    this.initialValue = this.getAttribute('value') || '';
    this.addEventListener('slotchange', this.handleSlotChange, true);
    // Find parent form and listen to its reset event
    const form = this.closest('form');
    if(form) {
      form.addEventListener('reset', this.handleReset, true);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('slotchange', this.handleSlotChange, true);
    const form = this.closest('form');
    if(form) {
      form.removeEventListener('reset', this.handleReset, true);
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(changedProperties.has('value')) {
      if(this.internals && typeof this.internals.setFormValue === 'function') {
        try {
          this.internals.setFormValue(this.value || null);
        } catch (e) {
          // Form value setting not available
        }
      }
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true
      }));
    }
  }

  handleSlotChange = () => {
    this.requestUpdate();
  };

  handleReset = () => {
    this.value = this.initialValue;
  };

  handleButtonClick = (value) => {
    this.value = value;
  };

  getOptions = () => {
    return Array.from(this.children).filter(el => el.tagName === 'K-SC-OPTION');
  };

  render() {
    const options = this.getOptions();
    return html`
      <div class="btn-grp">
        ${options.map(option => {
          const optValue = option.getAttribute('value') || '';
          const isSelected = optValue === this.value;
          return html`
            <button
              class="${isSelected ? 'primary' : ''}"
              @click=${() => this.handleButtonClick(optValue)}
              ?aria-pressed=${isSelected}
            >${unsafeHTML(option.innerHTML)}</button>
          `;
        })}
      </div>
      <slot style="display:none;"></slot>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
  `;
}

class SegmentedControlOption extends HTMLElement {
  connectedCallback() {
    if(!this.hasAttribute('value')) {
      this.setAttribute('value', '');
    }
  }
}

export default SegmentedControl;

customElements.define('k-segmented-control', SegmentedControl);
customElements.define('k-sc-option', SegmentedControlOption);
