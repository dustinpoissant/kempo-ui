import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';

export default class ControlGroup extends ShadowComponent {
	static properties = {
		hidden: { type: Boolean, reflect: true }
	};

	/*
		Constructor
	*/
	constructor() {
		super();
		this.hidden = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(!this.hasAttribute('class')){
			this.setAttribute('class', 'b r mq');
		}
		this.addEventListener('control_visibility_change', this.checkVisibility);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('control_visibility_change', this.checkVisibility);
	}

	/*
		Event Handlers
	*/
	checkVisibility = (e) => {
		if(e.target === this) return;
		const wasHidden = this.hidden;
		this.hidden = Array.from(this.children).every(child => child.hidden === true);
		if(this.hidden !== wasHidden){
			this.dispatchEvent(new CustomEvent('control_visibility_change', { bubbles: true }));
		}
	};

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-flex;
		}
		:host([hidden]) {
			display: none !important;
		}
		::slotted(*) {
			margin-top: -1px;
			margin-bottom: -1px;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}
}

customElements.define('k-cec-group', ControlGroup);

