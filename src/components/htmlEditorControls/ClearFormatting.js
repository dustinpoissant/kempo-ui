import HtmlEditorControl from './HtmlEditorControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class ClearFormatting extends HtmlEditorControl {
	static properties = {
		editorMode: {type: String, state: true}
	};


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
		if(this.editor) this.editor.removeFormat();
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
					<k-icon name="format_clear"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`;
	}
}

customElements.define('k-hec-clear-formatting', ClearFormatting);
