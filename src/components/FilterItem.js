import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class FilterItem extends ShadowComponent {
	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: contents;
		}
		:host([hidden]) {
			display: none !important;
		}
	`;
}

customElements.define('k-filter-item', FilterItem);
