import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class CopyCode extends CodeEditorControl {
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
		this.editor?.copyToClipboard();
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Copy Code">
				<k-icon name="content_copy"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-copy-code', CopyCode);
