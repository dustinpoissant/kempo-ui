import HtmlEditorControl from './HtmlEditorControl.js';
import { html, css } from '../../lit-all.min.js';

export default class CharacterCount extends HtmlEditorControl {
	static properties = {
		count: {type: Number, state: true}
	};

	/*
		Lifecycle Callbacks
	*/
	constructor(){
		super();
		this.count = 0;
	}

	connectedCallback(){
		super.connectedCallback();
		
		if(!this.editor) return;
		
		this.editor.addEventListener('ready', () => {
			this.updateCount();
		});
		
		this.editor.addEventListener('change', () => {
			this.updateCount();
		});
		
		setTimeout(() => this.updateCount(), 0);
	}

	/*
		Utility Functions
	*/
	updateCount = () => {
		if(!this.editor) return;
		
		const parser = new DOMParser();
		const doc = parser.parseFromString(this.editor.getValue(), 'text/html');
		const text = doc.body.innerText || '';
		this.count = text.length;
	};

	/*
		Rendering
	*/
	render(){
		return html`
			<span class="character-count">
				<slot name="label">Characters:</slot> ${this.count}
			</span>
		`;
	}

	static styles = [
		HtmlEditorControl.styles,
		css`
			:host {
				align-items: center;
				padding: 0 0.5rem;
				font-size: 0.875rem;
				color: var(--text-color-secondary, #666);
			}
			.character-count {
				display: flex;
				align-items: center;
				gap: 0.25rem;
			}
		`
	];
}

customElements.define('k-hec-character-count', CharacterCount);
