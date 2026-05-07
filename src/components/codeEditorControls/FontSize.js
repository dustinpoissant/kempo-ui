import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import './FontSizeDecrease.js';
import './FontSizeIncrease.js';
import './ControlGroup.js';

export default class FontSize extends CodeEditorControl {
	/*
		Styles
	*/
	static styles = [
		CodeEditorControl.styles,
		css`
			:host {
				display: inline-flex;
				gap: 0;
			}
		`
	];

	/*
		Rendering
	*/
	render() {
		return html`
			<k-cec-group class="b r mq">
				<k-cec-font-size-decrease></k-cec-font-size-decrease>
				<k-cec-font-size-increase></k-cec-font-size-increase>
			</k-cec-group>
		`;
	}
}

customElements.define('k-cec-font-size', FontSize);
