import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import { boolTrueFalse } from '../utils/propConverters.js';

export default class Accordion extends ShadowComponent {
	/*
		Properties
	*/
	static properties = {};

	/*
		Public Methods
	*/
	getHeader(panelName) {
		return this.querySelector(`k-accordion-header[for-panel="${panelName}"]`);
	}

	getPanel(panelName) {
		return this.querySelector(`k-accordion-panel[name="${panelName}"]`);
	}

	openPanel(panelName) {
		const currentlyActivePanel = this.querySelector(`k-accordion-panel[active="true"]`);
		if(currentlyActivePanel && currentlyActivePanel.name !== panelName) {
			currentlyActivePanel.active = false;
			const currentlyActiveHeader = this.getHeader(currentlyActivePanel.name);
			if(currentlyActiveHeader) currentlyActiveHeader.active = false;
		}

		const panel = this.getPanel(panelName);
		if(panel) {
			panel.active = true;
			panel.transitioning = true;
			setTimeout(() => {
				panel.transitioning = false;
			}, parseInt(getComputedStyle(this).getPropertyValue('--animation_ms') || 256));

			const header = this.getHeader(panelName);
			if(header) header.active = true;

			this.dispatchEvent(new CustomEvent('openpanel', { detail: { panelName } }));
		}
	}

	closePanel(panelName) {
		const panel = this.getPanel(panelName);
		if(panel) {
			panel.active = false;
			panel.transitioning = true;
			setTimeout(() => {
				panel.transitioning = false;
			}, parseInt(getComputedStyle(this).getPropertyValue('--animation_ms') || 256));

			const header = this.getHeader(panelName);
			if(header) header.active = false;

			this.dispatchEvent(new CustomEvent('closepanel', { detail: { panelName } }));
		}
	}

	togglePanel(panelName) {
		const panel = this.getPanel(panelName);
		if(panel) {
			if(panel.active) {
				this.closePanel(panelName);
			} else {
				this.openPanel(panelName);
			}
			this.dispatchEvent(new CustomEvent('togglepanel', { detail: { panelName } }));
		}
	}

	/*
		Getters
	*/
	get activeHeader() {
		return this.querySelector('k-accordion-header[active="true"]');
	}

	get activePanel() {
		return this.querySelector('k-accordion-panel[active="true"]');
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
		}
		::slotted(k-accordion-header) {
			border-top: 1px solid var(--c_border);
		}
		::slotted(k-accordion-header[active="true"]) {
			border-bottom: 1px solid var(--c_border);
		}
		::slotted(k-accordion-header:first-of-type) {
			border-top: 0;
		}
		::slotted(k-accordion-header:last-of-type:not([active="true"])) {
			border-bottom: 0;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}
}

export class AccordionHeader extends ShadowComponent {
	/*
		Properties
	*/
	static properties = {
		forPanel: { type: String, reflect: true, attribute: 'for-panel' },
		active: { type: Boolean, reflect: true, converter: boolTrueFalse }
	};

	constructor() {
		super();
		this.forPanel = '';
		this.active = false;
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		this.accordion?.togglePanel(this.forPanel);
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('click', this.handleClick);
	}

	/*
		Getters
	*/
	get accordion() {
		return this.closest('k-accordion');
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			padding: 1rem;
			cursor: pointer;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}
}

export class AccordionPanel extends ShadowComponent {
	/*
		Properties
	*/
	static properties = {
		name: { type: String, reflect: true },
		active: { type: Boolean, reflect: true, converter: boolTrueFalse },
		transitioning: { type: Boolean, reflect: true, converter: boolTrueFalse }
	};

	constructor() {
		super();
		this.name = '';
		this.active = false;
		this.transitioning = false;
	}

	/*
		Getters
	*/
	get accordion() {
		return this.closest('k-accordion');
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			interpolate-size: allow-keywords;
			height: 0;
			overflow: hidden;
			transition: height var(--animation_ms, 256ms) ease-in-out;
		}
		:host([active="true"]) {
			height: max-content;
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
	Custom Element Registration
*/
customElements.define('k-accordion', Accordion);
customElements.define('k-accordion-header', AccordionHeader);
customElements.define('k-accordion-panel', AccordionPanel);
