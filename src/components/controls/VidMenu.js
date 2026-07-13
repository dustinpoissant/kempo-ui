import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import '../Dropdown.js';
import '../Icon.js';

export default class VidMenu extends Control {
  static properties = {
    icon: { type: String }
  };

  constructor() {
    super();
    this.icon = 'more_vert';
  }

  handleSlotChange = (e) => {
    const slot = e.target;
    const controls = slot.assignedElements();

    controls.forEach(control => {
      // Get the icon name from the control's data attribute or its render output
      const iconName = control.getAttribute('data-icon') || this.getControlIcon(control);
      const label = control.textContent?.trim() || '';

      if (iconName || label) {
        // Clear the control's content and replace with icon + label;
        // layout/hover styling is handled by the ::slotted(*) rules below.
        control.innerHTML = '';

        if (iconName) {
          const icon = document.createElement('k-icon');
          icon.setAttribute('name', iconName);
          icon.style.flexShrink = '0';
          control.appendChild(icon);
        }

        if (label) {
          const labelSpan = document.createElement('span');
          labelSpan.textContent = label;
          labelSpan.style.flex = '1';
          control.appendChild(labelSpan);
        }

        // Stop propagation for nested dropdowns (e.g., speed dropdown inside menu)
        control.addEventListener('click', (evt) => {
          evt.stopPropagation();
        });
      }
    });
  };

  getControlIcon(control) {
    // Matches each control's own default icon (see its render()), so the
    // menu row never shows an icon the control wouldn't show itself.
    // Controls whose icon depends on live host state are read from
    // control.host so the menu reflects the current state on first render.
    const host = control.host;
    switch (control.tagName.toLowerCase()) {
      case 'kc-vid-speed': return 'speed';
      case 'kc-vid-loop': return 'repeat';
      case 'kc-vid-pip': return 'pip';
      case 'kc-vid-download': return 'download';
      case 'kc-vid-mute':
      case 'kc-vid-volume': return host?.muted ? 'volume_off' : 'volume_up';
      case 'kc-vid-play-pause': return host?.paused === false ? 'pause' : 'play';
      case 'kc-fullscreen': return host?.fullscreen ? 'fullscreen_exit' : 'fullscreen';
      default: return null;
    }
  }

  render() {
    return html`
      <k-dropdown open-direction="up center">
        <button slot="trigger" type="button" class="no-btn" title="Menu">
          <k-icon name="${this.icon}"></k-icon>
        </button>
        <div class="menu-items">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </k-dropdown>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host {
        display: inline-flex;
        margin: var(--spacer_q);
      }
      k-dropdown {
        display: inline-flex;
        --tc: #fff;
        --c_bg__alt: rgba(255, 255, 255, 0.2);
      }
      button[slot="trigger"] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.5rem;
        min-height: 1.5rem;
        padding: 0.25rem;
        background: transparent;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        color: inherit;
        cursor: pointer;
        font: inherit;
      }
      k-dropdown::part(menu) {
        background: rgba(0, 0, 0, 0.85);
        border: none;
        box-shadow: var(--drop_shadow);
        padding: 0.5rem 0;
      }
      .menu-items {
        display: flex;
        flex-direction: column;
        min-width: 12rem;
      }
      ::slotted(*) {
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 1.75rem !important;
        margin: 0 !important;
        padding: 0.5rem 1rem !important;
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        cursor: pointer !important;
        font: inherit !important;
        text-align: left !important;
        transition: background var(--animation_ms) !important;
        /* No color rule here on purpose: ::slotted() styles beat a
           control's own :host() styles for the same property regardless
           of specificity, so setting color here would permanently clobber
           e.g. kc-vid-loop's :host([active]) color. Each control's own
           ButtonControl base (color: inherit, no !important) already
           inherits white from #controls-bar naturally. */
      }
      ::slotted(*:hover),
      ::slotted(*:focus-visible) {
        background: var(--c_bg__alt) !important;
        outline: none !important;
      }
    `
  ];
}

customElements.define('kc-vid-menu', VidMenu);
