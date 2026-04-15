import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

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
		Event Handlers
	*/
	handleIncrease = () => {
		this.editor?.increaseFontSize();
	};

	handleDecrease = () => {
		this.editor?.decreaseFontSize();
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleDecrease}" title="Decrease Font Size">
				<k-icon name="text_decrease"></k-icon>
			</button>
			<button class="${this.buttonClasses}" @click="${this.handleIncrease}" title="Increase Font Size">
				<k-icon name="text_increase"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-font-size', FontSize);
