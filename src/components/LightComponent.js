import { LitElement, html, render } from '../lit-all.min.js';

export default class LightComponent extends LitElement {

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

	updated() {
		render(this.renderLightDom(), this.lightRoot);
	}

	/*
	  Rendering
	*/

	renderLightDom() {
		return html``;
	}
}
