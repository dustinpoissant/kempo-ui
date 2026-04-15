import HtmlEditorControl from './HtmlEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class CodeBlock extends HtmlEditorControl {
	static properties = {
		editorMode: {type: String, state: true}
	};

	/*
		Styles
	*/
	static styles = [
		HtmlEditorControl.styles,
		css`
			:host {
				display: inline-flex;
			}
		`
	];

	/*
		Lifecycle Callbacks
	*/
	connectedCallback(){
		super.connectedCallback();
		this.updateEditorMode();
		this.editor?.addEventListener('mode-changed', () => this.updateEditorMode());
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		if(!this.editor) return;
		this.editor.formatBlock(this.editor.isSelectionInCodeBlock() ? 'p' : 'pre');
	};

	/*
		Utility Functions
	*/
	updateEditorMode(){
		if(!this.editor) return;
		this.editorMode = this.editor.mode;
	}

	/*
		Rendering
	*/
	render() {
		this.hidden = this.editorMode === 'code';
		
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}">
				<slot name="icon">
					<k-icon name="code_blocks"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`;
	}
}

customElements.define('k-hec-code-block', CodeBlock);
