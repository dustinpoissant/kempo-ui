import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class NavSpacer extends ShadowComponent {
	#resizeObserver = null;

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.#observe();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.#resizeObserver?.disconnect();
		this.#resizeObserver = null;
	}

	/*
		Utility Functions
	*/
	#observe() {
		this.#resizeObserver?.disconnect();
		const nav = document.querySelector('k-nav[fixed]');
		if(!nav) {
			this.style.height = '0px';
			return;
		}
		this.#resizeObserver = new ResizeObserver(entries => {
			this.style.height = `${entries[0].contentRect.height}px`;
		});
		this.#resizeObserver.observe(nav);
	}

	/*
		Rendering
	*/
	render() {
		return html``;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			margin-bottom: var(--spacer);
		}
	`;
}

customElements.define('k-nav-spacer', NavSpacer);
