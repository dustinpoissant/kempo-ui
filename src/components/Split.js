import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import drag from '../utils/drag.js';
import { boolExists } from '../utils/propConverters.js';

export default class Split extends ShadowComponent {
  static properties = {
    resizing: { type: Boolean, reflect: true },
    stacked: { type: Boolean, reflect: true },
    stackWidth: { type: Number, attribute: 'stack-width' },
    direction: { type: String, reflect: true },
    persistentId: { type: String, reflect: true, attribute: 'persistent-id' },
    grip: { type: Boolean, reflect: true, converter: boolExists }
  };

  constructor() {
    super();

    this.resizing = false;
    this.stacked = false;
    this.stackWidth = 0;
    this.direction = 'horizontal';
    this.persistentId = null;
    this.grip = false;

    // Private state
    this.dragStartSize = 0;
    this.dragCleanup = () => { };
    this.resizeObserver = null;
  }

  /*
    Lifecycle Callbacks
  */
  firstUpdated() {
    super.firstUpdated();
    if(this.grip){
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;visibility:hidden;width:var(--handle_width)';
      this.shadowRoot.appendChild(el);
      const handleWidth = el.offsetWidth;
      this.shadowRoot.removeChild(el);
      const gripWidth = handleWidth % 2 === 0 ? handleWidth - 1 : handleWidth;
      this.style.setProperty('--handle_grip_width', `${gripWidth}px`);
    }
    this.setupDragHandler();
    this.setupResizeObserver();
    if (this.persistentId && window?.localStorage) {
      const size = window.localStorage.getItem(`split-persistent-id-${this.persistentId}`);
      if (size) this.setSize(size);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.dragCleanup();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /*
    Event Handlers
  */
  handleDragStart = () => {
    this.resizing = true;
    this.dragStartSize = Math.round(this.shadowRoot.getElementById('pane-1').getBoundingClientRect()[this.direction === 'vertical' ? 'height' : 'width']);
    this.dispatchEvent(new CustomEvent('resizestart', {
      detail: { startSize: this.dragStartSize },
      bubbles: true
    }));
  };

  handleDrag = ({ x, y }) => {
    const delta = this.direction === 'vertical' ? y : x;
    const size = `${this.dragStartSize + delta}px`;
    this.setSize(size);
    this.dispatchEvent(new CustomEvent('resize', {
      detail: { size },
      bubbles: true
    }));
  };

  handleDragEnd = ({ x, y }) => {
    this.resizing = false;
    const delta = this.direction === 'vertical' ? y : x;
    const size = `${this.dragStartSize + delta}px`;
    this.setSize(size);
    if (this.persistentId && window?.localStorage) {
      window.localStorage.setItem(`split-persistent-id-${this.persistentId}`, size);
    }
    this.dispatchEvent(new CustomEvent('resizeend', {
      detail: { size },
      bubbles: true
    }));
  };

  /*
    Public Methods
  */
  setSize(size) {
    this.style.setProperty('--pane_1_size', size);
  }

  setupDragHandler() {
    const handle = this.shadowRoot.getElementById('divider-handle');
    if (handle) {
      this.dragCleanup = drag({
        element: handle,
        callback: this.handleDrag,
        startCallback: this.handleDragStart,
        endCallback: this.handleDragEnd
      });
    }
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        this.stacked = width <= this.stackWidth;
      }
    });
    this.resizeObserver.observe(this);
  }

  /*
    Styles
  */


  /*
    Rendering
  */
  render() {
    return html`
			<div id="pane-1" class="pane">
				<slot></slot>
			</div>
			<div id="divider-handle">
				<div id="divider-border">
          ${this.grip ? html`<div id="divider-grip"></div>` : ''}
        </div>
			</div>
			<div id="pane-2" class="pane">
				<slot name="right"></slot>
			</div>
		`;
  }
  static styles = css`
		:host {
			--pane_1_size: calc((100% - var(--handle_width)) / 2);
			--handle_width: 7px;
			--min_pane_size: 6rem;

			height: 100%;
			display: flex;
			align-items: stretch;
			flex: 1 1 auto;
			overflow: hidden;
		}

		.pane, #divider-handle {
			display: inline-block;
		}

		.pane {
			min-width: var(--min_pane_size);
			max-width: calc(100% - var(--min_pane_size) - var(--handle_width));
			max-height: 100%;
			overflow: hidden;
		}

		#pane-1 {
			flex: 0 0 var(--pane_1_size);
		}

		#divider-handle {
			position: relative;
			display: flex;
			flex-shrink: 0;
			justify-content: center;
			width: var(--handle_width);
			cursor: ew-resize;
		}

		:host([resizing]) #divider-handle {
			background-color: var(--tc_primary);
		}

		:host([resizing]) {
			user-select: none;
		}

		:host([resizing]) .pane {
			pointer-events: none;
		}

		#divider-border {
			position: relative;
			width: 1px;
			height: 100%;
			border-left: 1px solid var(--c_border);
		}
		#divider-grip {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: var(--handle_grip_width, var(--handle_width));
			height: 2rem;
			border-radius: 0.25rem;
			background-color: var(--c_border);
		}

		#pane-2 {
			flex: 1 1;
		}

		:host([stacked]) #pane-1,
		:host([stacked]) #pane-2 {
			display: block;
		}

		:host([stacked]) #divider-handle {
			display: none;
		}

		:host([stacked]) .pane {
			min-width: 0;
			max-width: 100%;
			max-height: none;
			overflow: auto;
		}

		:host([stacked]) {
			display: block;
		}

		:host([direction="vertical"]) {
			flex-direction: column;
		}

		:host([direction="vertical"]) .pane {
			min-width: 0;
			max-width: 100%;
			min-height: var(--min_pane_size);
			max-height: calc(100% - var(--min_pane_size) - var(--handle_width));
		}

		:host([direction="vertical"]) #pane-1 {
			flex: 0 0 var(--pane_1_size);
		}

		:host([direction="vertical"]) #divider-handle {
			width: 100%;
			height: var(--handle_width);
			cursor: ns-resize;
			align-items: center;
			justify-content: initial;
		}

		:host([direction="vertical"]) #divider-border {
			width: 100%;
			height: 1px;
			border-left: none;
			border-top: 1px solid var(--c_border);
		}
		:host([direction="vertical"]) #divider-grip {
			width: 2rem;
			height: 0.5rem;
		}
	`;
}

customElements.define('k-split', Split);
