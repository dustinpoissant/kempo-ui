import Button from './Button.js';
import { html, css } from '../lit-all.min.js';
import './Icon.js';

export default class AsideBtn extends Button {
	static properties = {
		...Button.properties,
		targetId: { type: String, attribute: 'for' },
		position: { type: String, reflect: true },
		push: { type: Boolean, reflect: true },
		label: { type: String },
		asideOpen: { type: Boolean, reflect: true, attribute: 'aside-open' },
		asideSide: { type: String, attribute: false },
		asideWidth: { type: Number, attribute: false }
	};

	constructor() {
		super();
		this.targetId = '';
		this.position = 'top left';
		this.push = false;
		this.label = 'Menu';
		this.asideOpen = false;
		this.asideSide = 'left';
		this.asideWidth = 0;
		this.aside = null;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('aside_state_change', this.handleAsideChange);
		this.syncFromAside();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('aside_state_change', this.handleAsideChange);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('targetId')) this.syncFromAside();

		this.setAttribute('aria-label', this.label);
		this.setAttribute('aria-expanded', String(this.asideOpen));

		const side = this.position.includes('left') ? 'left' : 'right';
		const offset = this.push && side === this.asideSide ? this.asideWidth : 0;
		this.style.setProperty('--aside-btn-offset', `${offset}px`);
	}

	/*
		Event Handlers
	*/
	handleAsideChange = e => {
		const { aside, state, width } = e.detail;
		if(aside.id !== this.targetId) return;
		this.aside = aside;
		this.applyAside(state, aside.side, width);
	};

	handleClick = e => {
		if(this.disabled) {
			e.stopImmediatePropagation();
			return;
		}
		if(!this.aside) this.aside = document.getElementById(this.targetId);
		if(!this.aside) return;
		if(this.asideOpen) this.aside.hide();
		else this.aside.expand();
	};

	/*
		Methods
	*/
	syncFromAside = () => {
		const aside = document.getElementById(this.targetId);
		if(!aside || aside.state === undefined) return;
		this.aside = aside;
		const width = aside.state === 'offscreen' ? 0 : aside.getTargetWidth(aside.state);
		this.applyAside(aside.state, aside.side, width);
	};

	applyAside = (state, side, width) => {
		this.asideOpen = state !== 'offscreen';
		this.asideSide = side || 'left';
		this.asideWidth = width;
	};

	/*
		Rendering
	*/
	render() {
		return html`<div id="icon"><slot><k-icon name="menu"></k-icon></slot></div>`;
	}

	/*
		Styles
	*/
	static styles = [Button.styles, css`
		:host {
			position: fixed;
			z-index: 20;
			display: block;
			width: 3rem;
			height: 3rem;
			padding: 0;
			margin: var(--spacer);
			border-radius: 50%;
			transition: left var(--animation_ms, 256ms), right var(--animation_ms, 256ms), opacity var(--animation_ms, 256ms);
			opacity: 0.7;
		}
		:host(:hover),
		:host(:focus-visible) {
			opacity: 1;
		}
		#icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
		}
		:host([position*="top"]) {
			top: 0;
		}
		:host([position*="bottom"]) {
			bottom: 0;
		}
		:host([position*="left"]) {
			left: var(--aside-btn-offset, 0px);
		}
		:host([position*="right"]) {
			right: var(--aside-btn-offset, 0px);
		}
		:host([aside-open]:not([push])) {
			visibility: hidden;
		}
	`];
}

customElements.define('k-aside-btn', AsideBtn);
