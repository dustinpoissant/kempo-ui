import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class FindReplace extends CodeEditorControl {
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
		this.editor?.openFind();
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}" title="Find & Replace">
				<k-icon name="search"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-cec-find-replace', FindReplace);
