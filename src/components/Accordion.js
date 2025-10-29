import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import { boolExists } from '../utils/propConverters.js';

export default class Accordion extends ShadowComponent {
	/* Properties */
	static properties = {
		multiple: {
			type: Boolean,
			reflect: true,
			converter: boolExists
		},
		persistentId: {
			type: String,
			reflect: true,
			attribute: 'persistent-id'
		}
	};

	constructor() {
		super();
		this.multiple = false;
		this.persistentId = null;
	}

	connectedCallback() {
		super.connectedCallback?.();
	}

	/* Lifecycle Callbacks */
	updated(changedProps) {
		super.updated?.(changedProps);
		if (changedProps.has('persistentId') && this.persistentId && window?.localStorage) {
			const key = `accordion-persistent-id-${this.persistentId}`;
			const value = window.localStorage.getItem(key);
			if (value) {
				const openPanels = value.split(',');
				this.querySelectorAll('k-accordion-panel').forEach(panel => {
					panel.active = openPanels.includes(panel.name);
					const header = this.getHeader(panel.name);
					if (header) header.active = openPanels.includes(panel.name);
				});
			}
		}
	}

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
		if (!this.multiple) {
			// Close all other panels (exclusive mode)
			this.querySelectorAll('k-accordion-panel[active]').forEach(panel => {
				if (panel.name !== panelName) {
					panel.active = false;
					const header = this.getHeader(panel.name);
					if (header) header.active = false;
				}
			});
		}

		const panel = this.getPanel(panelName);
		if (panel) {
			panel.active = true;
			panel.transitioning = true;
			setTimeout(() => {
				panel.transitioning = false;
			}, parseInt(getComputedStyle(this).getPropertyValue('--animation_ms') || 256));

			const header = this.getHeader(panelName);
			if (header) header.active = true;

			this.dispatchEvent(new CustomEvent('openpanel', { detail: { panelName } }));

			setTimeout(() => {
				// Save state if persistentId is set
				if (this.persistentId && window?.localStorage) {
					const key = `accordion-persistent-id-${this.persistentId}`;
					const openPanels = Array.from(this.querySelectorAll('k-accordion-panel[active]')).map(p => p.name);
					window.localStorage.setItem(key, openPanels.join(','));
				}
			}, parseInt(getComputedStyle(this).getPropertyValue('--animation_ms') || 256));
		}
	}

	closePanel(panelName) {
		const panel = this.getPanel(panelName);
	if (panel) {
		panel.active = false;
		panel.transitioning = true;
		setTimeout(() => {
			panel.transitioning = false;
		}, parseInt(getComputedStyle(this).getPropertyValue('--animation_ms') || 256));

		const header = this.getHeader(panelName);
		if (header) header.active = false;

		this.dispatchEvent(new CustomEvent('closepanel', { detail: { panelName } }));

		setTimeout(() => {
			// Save state if persistentId is set
			if (this.persistentId && window?.localStorage) {
				const key = `accordion-persistent-id-${this.persistentId}`;
				const openPanels = Array.from(this.querySelectorAll('k-accordion-panel[active]')).map(p => p.name);
				window.localStorage.setItem(key, openPanels.join(','));
			}
		}, parseInt(getComputedStyle(this).getPropertyValue('--animation_ms') || 256));
	}
}

togglePanel(panelName) {
	const panel = this.getPanel(panelName);
	if (panel) {
		if (panel.active) {
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
			border: 1px solid var(--c_border, #ccc);
			border-radius: var(--radius);
		}
		::slotted(k-accordion-header) {
			border-top: 1px solid var(--c_border, #ccc);
		}
		::slotted(k-accordion-header) {
			position: relative;
		}
		::slotted(k-accordion-header)::after {
			content: '';
			display: block;
			position: absolute;
			left: var(--spacer_h, 0.5rem);
			right: var(--spacer_h, 0.5rem);
			bottom: 0;
			height: 0;
			width: calc(100% - var(--spacer, 1rem));
			border-bottom: 1px solid var(--c_border, #ccc);
			opacity: 0;
			transition: opacity var(--animation_ms, 256ms);
			pointer-events: none;
		}
		::slotted(k-accordion-header[active])::after {
			opacity: 0.4;
		}
		::slotted(k-accordion-header:first-of-type) {
			border-top: 0;
		}
		::slotted(k-accordion-header:last-of-type:not([active])) {
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
	/* Properties */
	static properties = {
		forPanel: { type: String, reflect: true, attribute: 'for-panel' },
		active: { type: Boolean, reflect: true, converter: boolExists }
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


	/* Rendering */
	render() {
		return html`
			<slot name="left-icon">
				<k-icon id="icon" name="chevron-right"></k-icon>
			</slot>
			<slot></slot>
			<slot name="right-icon"></slot>
		`;
	}
	static styles = css`
		:host {
			display: block;
			padding: 1rem;
			cursor: pointer;
		}
		#icon {
			will-change: trnasform;
			transition: transform var(--animation_ms, 256ms);
			transform: rotate(0deg);
		}
		:host([active]) #icon {
			transform: rotate(90deg);
		}
	`;
}

export class AccordionPanel extends ShadowComponent {
	/* Properties */
	static properties = {
		name: { type: String, reflect: true },
		active: { type: Boolean, reflect: true, converter: boolExists },
		transitioning: { type: Boolean, reflect: true, converter: boolExists }
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
	:host([active]) {
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
