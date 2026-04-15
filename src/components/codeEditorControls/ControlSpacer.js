import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';

export default class ControlSpacer extends ShadowComponent {
	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-flex;
			flex: 1;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html``;
	}
}

customElements.define('k-cec-spacer', ControlSpacer);
