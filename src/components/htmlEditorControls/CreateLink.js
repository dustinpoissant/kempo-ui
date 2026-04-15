import HtmlEditorControl from './HtmlEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

export default class CreateLink extends HtmlEditorControl {
	static properties = {
		editorMode: {type: String, state: true}
	};

	/*
		Lifecycle Callbacks
	*/
	constructor(){
		super();
	}

	connectedCallback(){
		super.connectedCallback();
		
		if(!this.editor) return;
		this.editorMode = this.editor.mode;
		
		this.editor?.addEventListener('mode-changed', () => {
			if(!this.editor) return;
			this.editorMode = this.editor.mode;
		});
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		if(!this.editor) return;


		const selectedText = this.editor.getSelectedText();

		const urlInput = document.createElement('input');
		urlInput.type = 'text';
		urlInput.placeholder = 'https://example.com';
		urlInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;';

		const textInput = document.createElement('input');
		textInput.type = 'text';
		textInput.placeholder = 'Enter link text';
		textInput.value = selectedText;
		textInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;';

		const content = document.createElement('div');
		content.className = 'p';
		content.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
		content.innerHTML = `
			<div style="display: flex; flex-direction: column; gap: 0.5rem;">
				<label style="font-weight: bold;">URL</label>
			</div>
			<div style="display: flex; flex-direction: column; gap: 0.5rem;">
				<label style="font-weight: bold;">Link Text</label>
			</div>
		`;
		content.children[0].appendChild(urlInput);
		content.children[1].appendChild(textInput);

		Dialog.create(content, {
			title: 'Create Link',
			cancelText: 'Cancel',
			confirmText: 'Insert Link',
			confirmClasses: 'success ml',
			confirmAction: (event) => {
				const url = urlInput.value.trim();
				const text = textInput.value.trim();

				if(!url){
					event.keepDialogOpen = true;
					return;
				}

				if(this.editor.selection && (!text || text === selectedText)){
					this.editor.createLink(url);
				} else {
					this.editor.createLinkWithText(url, text || url);
				}
			}
		});
	};

	/*
		Rendering
	*/
	render() {
		this.hidden = this.editorMode === 'code';
		
		return html`
			<button
				class="${this.buttonClasses}"
				@click="${this.handleClick}"
			>
				<slot name="icon">
					<k-icon name="link"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`;
	}
	static styles = [
		HtmlEditorControl.styles,
		css`
			:host {
				display: inline-flex;
			}
		`
	];
}

customElements.define('k-hec-create-link', CreateLink);
