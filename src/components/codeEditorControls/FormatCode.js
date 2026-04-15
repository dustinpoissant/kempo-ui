import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class FormatCode extends CodeEditorControl {
	/*
		Styles
	*/
	static styles = [
		CodeEditorControl.styles,
		css`
			:host {
				display: inline-flex;
			}
		`
	];

	/*
		Event Handlers
	*/
	handleClick = () => {
		this.editor?.formatCode();
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Format Code">
				<k-icon name="frame_source"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-format-code', FormatCode);
