import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import drag from '../utils/drag.js';

export default class Split extends ShadowComponent {
	static properties = {
		resizing: { type: Boolean, reflect: true },
		stacked: { type: Boolean, reflect: true },
		stackWidth: { type: Number, attribute: 'stack-width' },
		direction: { type: String, reflect: true }
	};

	constructor() {
		super();
		
		this.resizing = false;
		this.stacked = false;
		this.stackWidth = 0;
		this.direction = 'horizontal';
		
		// Private state
		this.dragStartSize = 0;
		this.dragCleanup = () => {};
		this.resizeObserver = null;
	}

	/*
		Lifecycle Callbacks
	*/
	firstUpdated() {
		super.firstUpdated();
		this.setupDragHandler();
		this.setupResizeObserver();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.dragCleanup();
		if(this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
	}

	/*
		Event Handlers
	*/
	handleDragStart = () => {
		this.resizing = true;
		this.dragStartSize = Math.round(this.shadowRoot.getElementById('left').getBoundingClientRect()[this.direction === 'vertical' ? 'height' : 'width']);
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
		this.dispatchEvent(new CustomEvent('resizeend', {
			detail: { size },
			bubbles: true
		}));
	};

	/*
		Public Methods
	*/
	setSize(size) {
		this.style.setProperty(this.direction === 'vertical' ? '--top_height' : '--left_width', size);
	}

	setupDragHandler() {
		const handle = this.shadowRoot.getElementById('divider-handle');
		if(handle) {
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
			for(const entry of entries) {
				const width = entry.contentRect.width;
				this.stacked = width <= this.stackWidth;
			}
		});
		this.resizeObserver.observe(this);
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			--left_width: calc((100% - var(--handle_width)) / 2);
			--handle_width: 0.5rem;
			--min_pane_width: 6rem;

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
			min-width: var(--min_pane_width);
			max-width: calc(100% - var(--min_pane_width));
			max-height: 100%;
			overflow: hidden;
		}

		#left {
			flex: 0 0 var(--left_width);
		}

		#divider-handle {
			display: flex;
			justify-content: center;
			width: var(--handle_width);
			cursor: ew-resize;
		}

		:host([resizing]) #divider-handle {
			background-color: var(--tc_primary);
		}

		:host([resizing]) .pane {
			pointer-events: none;
			user-select: none;
		}

		#divider-border {
			width: 1px;
			height: 100%;
			border-left: 1px solid var(--c_border);
		}

		#right {
			flex: 1 1;
		}

		:host([stacked]) #left,
		:host([stacked]) #right {
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
			--top_height: calc((100% - var(--handle_width)) / 2);

			flex-direction: column;
		}

		:host([direction="vertical"]) .pane {
			min-width: 0;
			max-width: 100%;
			min-height: var(--min_pane_width);
			max-height: calc(100% - var(--min_pane_width));
		}

		:host([direction="vertical"]) #left {
			flex: 0 0 var(--top_height);
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
	`;

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="left" class="pane">
				<slot></slot>
			</div>
			<div id="divider-handle">
				<div id="divider-border"></div>
			</div>
			<div id="right" class="pane">
				<slot name="right"></slot>
			</div>
		`;
	}
}

customElements.define('k-split', Split);
