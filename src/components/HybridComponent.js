import { html, render } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

export default class HybridComponent extends ShadowComponent {

	/*
	  Shadow DOM Setup
	*/

	createRenderRoot() {
		const renderContainer = super.createRenderRoot();
		
		this.lightRoot = document.createElement('div');
		this.lightRoot.style.display = 'contents';
		this.lightRoot.slot = 'lightRoot';
		this.appendChild(this.lightRoot);
		
		return renderContainer;
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

	render() {
		return html`<slot name="lightRoot"></slot>`;
	}
}
