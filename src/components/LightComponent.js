import { LitElement, html, render } from '../lit-all.min.js';

export default class LightComponent extends LitElement {

	#childrenObserver;

	/*
	  Light DOM Setup
	*/

	createRenderRoot() {
		this.lightRoot = document.createElement('div');
		this.lightRoot.style.display = 'contents';
		this.appendChild(this.lightRoot);
		
		return this;
	}

	/*
	  Lifecycle Callbacks
	*/

	connectedCallback() {
		super.connectedCallback();

		this.#childrenObserver = new MutationObserver(() => {
			this.childrenUpdated();
			this.requestUpdate();
		});

		this.#childrenObserver.observe(this, {
			childList: true,
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.#childrenObserver?.disconnect();
	}

	updated() {
		render(this.renderLightDom(), this.lightRoot);
	}

	childrenUpdated() {}

	/*
	  Rendering
	*/

	renderLightDom() {
		return html``;
	}
}
