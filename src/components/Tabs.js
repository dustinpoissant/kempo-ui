import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { boolExists } from '../utils/propConverters.js';

/*
	Tabs Component
*/
export class Tabs extends ShadowComponent {
	static properties = {
		active: { type: String, reflect: true },
		fixedHeight: { type: Boolean, reflect: true, attribute: 'fixed-height', converter: boolExists }
	};

	constructor() {
		super();
		this.active = '';
		this.fixedHeight = false;
	}

	/*
		Lifecycle Callbacks
	*/
	firstUpdated() {
		super.firstUpdated();
		
		// Set initial active tab if not specified
		if(!this.active) {
			const firstContent = this.querySelector('k-tab-content');
			if(firstContent) {
				this.active = firstContent.name;
			}
		}

		this.setupScrollListeners();
		this.updateScrollIndicators();
		new ResizeObserver(() => this.updateScrollIndicators()).observe(this.shadowRoot.getElementById('tabs'));
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('active')) {
			this.updateActiveElements();
		}
	}

	/*
		Event Handlers
	*/
	setupScrollListeners() {
		const tabsContainer = this.shadowRoot.getElementById('tabs');
		const leftButton = this.shadowRoot.getElementById('scroll-left');
		const rightButton = this.shadowRoot.getElementById('scroll-right');

		tabsContainer.addEventListener('scroll', () => this.updateScrollIndicators());

		leftButton.addEventListener('click', () => {
			tabsContainer.scrollBy({ left: -200, behavior: 'smooth' });
		});
		rightButton.addEventListener('click', () => {
			tabsContainer.scrollBy({ left: 200, behavior: 'smooth' });
		});
	}

	updateScrollIndicators() {
		const tabsContainer = this.shadowRoot.getElementById('tabs');
		const leftIndicator = this.shadowRoot.getElementById('scroll-left');
		const rightIndicator = this.shadowRoot.getElementById('scroll-right');
		
		const hasLeftScroll = tabsContainer.scrollLeft > 0;
		const hasRightScroll = tabsContainer.scrollLeft < (tabsContainer.scrollWidth - tabsContainer.clientWidth);
		
		leftIndicator.classList.toggle('visible', hasLeftScroll);
		rightIndicator.classList.toggle('visible', hasRightScroll);
	}

	/*
		Public Methods
	*/
	updateActiveElements() {
		// Update tabs
		const activeTab = this.getActiveTab();
		if(activeTab) activeTab.active = false;
		
		const activeContent = this.getActiveContent();
		if(activeContent) activeContent.active = false;
		
		const newTab = this.getTab(this.active);
		if(newTab) newTab.active = true;
		
		const newContent = this.getContent(this.active);
		if(newContent) newContent.active = true;
		
		// Dispatch tab change event
		this.dispatchEvent(new CustomEvent('tab', {
			detail: { tab: this.active },
			bubbles: true
		}));
	}

	get contents() {
		return [...this.querySelectorAll(':scope > k-tab-content')];
	}

	get tabs() {
		return [...this.querySelectorAll(':scope > k-tab')];
	}

	getTab(id) {
		let tab;
		if(typeof(id) === 'string') {
			tab = this.querySelector(`k-tab[for="${id}"]`);
		}
		if(!tab) {
			let index = parseInt(id);
			if(!index) index = 0;
			tab = this.querySelectorAll('k-tab')[index];
		}
		return tab;
	}

	getActiveTab() {
		return this.querySelector(':scope > k-tab[active]');
	}

	getContent(id) {
		let content;
		if(typeof(id) === 'string') {
			content = this.querySelector(`k-tab-content[name="${id}"]`);
		}
		if(!content) {
			let index = parseInt(id);
			if(!index) index = 0;
			content = this.querySelectorAll('k-tab-content')[index];
		}
		return content;
	}

	getActiveContent() {
		return this.querySelector(':scope > k-tab-content[active]');
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			width: 100%;
		}

		#wrapper {
			display: flex;
			flex-direction: column;
			width: 100%;
			min-width: 0;
		}

		#tabs-container {
			position: relative;
			border-bottom: 1px solid var(--c_border);
		}

		#tabs {
			display: flex;
			overflow-x: auto;
			overflow-y: hidden;
		}

		#tabs ::slotted(*) {
			flex: 0 0 auto;
		}

		.scroll-indicator {
			position: absolute;
			top: 0;
			bottom: 0;
			width: 72px;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.2s;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding-bottom: 2px;
		}

		.scroll-indicator .arrow {
			color: var(--tc_base);
			z-index: 1;
		}

		.scroll-indicator.visible {
			opacity: 1;
		}

		#scroll-left {
			left: 0;
			background: linear-gradient(90deg, 
				var(--c_bg) 0%,
				var(--c_bg) 30%,
				transparent 100%
			);
		}

		#scroll-right {
			right: 0;
			justify-content: flex-end;
			background: linear-gradient(-90deg, 
				var(--c_bg) 0%,
				var(--c_bg) 30%,
				transparent 100%
			);
		}

		:host([fixed-height]) #wrapper {
			height: 100%;
		}

		:host([fixed-height]) #contents {
			height: 100%;
			flex: 1;
			min-height: 1.35rem;
			overflow: auto;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="wrapper">
				<div id="tabs-container">
					<div id="scroll-left" class="scroll-indicator">
						<svg class="arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
					<div id="tabs">
						<slot name="tabs"></slot>
					</div>
					<div id="scroll-right" class="scroll-indicator">
						<svg class="arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path d="M8 15L13 10L8 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
				</div>
				<div id="contents">
					<slot></slot>
				</div>
			</div>
		`;
	}
}

/*
	Tab Component
*/
export class Tab extends ShadowComponent {
	static properties = {
		active: { type: Boolean, reflect: true, converter: boolExists },
		for: { type: String, reflect: true }
	};

	constructor() {
		super();
		this.active = false;
		this.for = '';
		this.slot = 'tabs';
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		if(!this.active) {
			const tabs = this.parentElement;
			if(tabs && tabs.tagName === 'K-TABS') {
				tabs.active = this.for || tabs.tabs.indexOf(this).toString();
			}
		}
	};

	/*
		Public Methods
	*/
	get tabs() {
		return this.parentElement?.tagName === 'K-TABS' ? this.parentElement : null;
	}

	/* Rendering */
	render() {
		return html`
			<button id="button" @click=${this.handleClick}>
				<slot></slot>
			</button>
		`;
	}
	static styles = css`
		:host {
			margin-bottom: -1px;
			flex: 0 0 auto;
		}

		#button {
			padding: var(--spacer_h);
			background-color: transparent;
			border: none;
			cursor: inherit;
			box-shadow: none;
			color: inherit;
			white-space: nowrap;
		}

		:host(:not([active])) #button {
			cursor: pointer;
		}

		:host([active]) {
			border-bottom: 3px solid var(--c_primary);
			margin-bottom: -1px;
		}

		:host([active]) #button {
			color: var(--tc_primary);
		}
	`;
}

/*
	TabContent Component
*/
export class TabContent extends ShadowComponent {
	static properties = {
		active: { type: Boolean, reflect: true, converter: boolExists },
		name: { type: String, reflect: true }
	};

	constructor() {
		super();
		this.active = false;
		this.name = '';
	}

	/*
		Public Methods
	*/
	get tabs() {
		return this.parentElement?.tagName === 'K-TABS' ? this.parentElement : null;
	}

	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}
	static styles = css`
		:host {
			display: block;
			height: 100%;
			max-height: 100%;
			flex: 1 1 auto;
			overflow: auto;
			padding-top: var(--spacer, 1rem);
		}

		:host([active]) {
			display: block;
		}

		:host(:not([active])) {
			display: none;
		}
	`;
}

/*
	TabSpacer Component
*/
export class TabSpacer extends ShadowComponent {
	constructor() {
		super();
		this.slot = 'tabs';
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			flex: 1 1 auto !important;
			height: 1px;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}
}

/*
	Define Custom Elements
*/
customElements.define('k-tabs', Tabs);
customElements.define('k-tab', Tab);
customElements.define('k-tab-content', TabContent);
customElements.define('k-tab-spacer', TabSpacer);

export default {
	Tab,
	TabContent,
	Tabs,
	TabSpacer
};
