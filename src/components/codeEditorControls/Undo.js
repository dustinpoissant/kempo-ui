import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class Undo extends CodeEditorControl {
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
		this.editor?.undo();
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Undo">
				<k-icon name="undo"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-undo', Undo);
