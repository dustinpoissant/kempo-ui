import HtmlEditorControl from './HtmlEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class InlineCode extends HtmlEditorControl {
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
		if(!this.editor) return;

		e.preventDefault();
		e.stopPropagation();

		const codeEl = document.createElement('code');
		
		const markerData = this.editor.getValueWithSelectionMarkers();
		if(markerData.hasSelection){
			codeEl.textContent = markerData.selectedText;
			this.editor.replaceSelectionWithElement(codeEl, true);
		} else {
			codeEl.textContent = '\u200B';
			this.editor.insertElementAtCursor(codeEl, true);
		}
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
			<button class="${this.buttonClasses}" @mousedown="${this.handleMouseDown}">
				<slot name="icon">
					<k-icon name="code_blocks"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`;
	}
}

customElements.define('k-hec-inline-code', InlineCode);
