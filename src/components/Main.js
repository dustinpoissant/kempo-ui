import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class Main extends ShadowComponent {
	static properties = {
		panelWidth: { type: String, state: true },
		panelSide: { type: String, state: true }
	};

	constructor() {
		super();
		this.panelWidth = '0px';
		this.panelSide = 'left';
		this.handlePanelChange = this.handlePanelChange.bind(this);
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('side-panel-change', this.handlePanelChange);
		
		const panel = document.querySelector('k-side-panel');
		if(panel) {
			this.panelWidth = panel.collapsed ? '3.5rem' : '16rem';
			this.panelSide = panel.side || 'left';
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('side-panel-change', this.handlePanelChange);
	}

	/*
		Event Handlers
	*/
	handlePanelChange(event) {
		this.panelWidth = event.detail.width;
		this.panelSide = event.detail.side;
	}

	/*
		Rendering
	*/
	render() {
		return html`
			<main>
				<slot></slot>
			</main>
		`;
	}

	static styles = css`
		:host {
			display: block;
			margin-left: var(--panel-width, 0px);
			transition: margin-left var(--animation_ms, 256ms);
		}
		:host([panel-side="right"]) {
			margin-left: 0;
			margin-right: var(--panel-width, 0px);
			transition: margin-right var(--animation_ms, 256ms);
		}
		main {
			max-width: var(--container_width, 90rem);
			margin-left: auto;
			margin-right: auto;
			padding-top: var(--spacer);
			padding-left: var(--spacer);
			padding-right: var(--spacer);
		}
	`;

	updated() {
		super.updated();
		this.style.setProperty('--panel-width', this.panelWidth);
		if(this.panelSide === 'right') {
			this.setAttribute('panel-side', 'right');
		} else {
			this.removeAttribute('panel-side');
		}
	}
}

window.customElements.define('k-main', Main);
