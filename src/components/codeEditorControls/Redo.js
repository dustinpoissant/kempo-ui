import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class Redo extends CodeEditorControl {
	/*
		Styles
	*/
	static styles = [
		CodeEditorControl.styles,
		css`
			:host { display: inline-flex; }
		`
	];

	/*
		Event Handlers
	*/
	handleClick = () => {
		this.editor?.redo();
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Redo">
				<k-icon name="redo"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-redo', Redo);
