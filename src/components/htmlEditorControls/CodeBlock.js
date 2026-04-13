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
	handleMouseDown = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if(!this.editor) return;
		this.editor.formatBlock(this.isInCodeBlock() ? 'p' : 'pre');
	};

	isInCodeBlock() {
		if(!this.editor?.lexicalEditor) return false;
		let result = false;
		const { lexical, code } = this.editor.lx;
		this.editor.lexicalEditor.getEditorState().read(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			const node = sel.anchor.getNode();
			const topLevel = node.getTopLevelElementOrThrow();
			result = code.$isCodeNode(topLevel);
		});
		return result;
	}

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
			<button class="${this.buttonClasses}" @mousedown="${this.handleMouseDown}">
				<slot name="icon">
					<k-icon name="code_blocks"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`;
	}
}

customElements.define('k-hec-code-block', CodeBlock);
