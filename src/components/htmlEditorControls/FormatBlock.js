import HtmlEditorControl from './HtmlEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class FormatBlock extends HtmlEditorControl {
	static properties = {
		editorMode: {type: String, state: true},
		tag: {type: String},
		label: {type: String}
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
		Constructor
	*/
	constructor() {
		super();
		this.tag = 'p';
		this.label = '';
	}

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
		if(this.editor){
			this.editor.formatBlock(this.tag);
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
		
		const displayLabel = this.label || this.getDefaultLabel();
		const iconName = this.getDefaultIcon();
		
		return html`
			<button class="${this.buttonClasses}" @click="${this.handleClick}">
				<slot name="icon">
					<k-icon src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${iconName}/default/24px.svg"></k-icon>
				</slot>
				<slot></slot>
			</button>
		`;
	}

	/*
		Helper Methods
	*/
	getDefaultLabel() {
		const labels = {
			'h1': 'Heading 1',
			'h2': 'Heading 2',
			'h3': 'Heading 3',
			'h4': 'Heading 4',
			'h5': 'Heading 5',
			'h6': 'Heading 6',
			'p': 'Paragraph'
		};
		return labels[this.tag] || this.tag.toUpperCase();
	}

	getDefaultIcon() {
		const icons = {
			'h1': 'format_h1',
			'h2': 'format_h2',
			'h3': 'format_h3',
			'h4': 'format_h4',
			'h5': 'format_h5',
			'h6': 'format_h6',
			'p': 'format_paragraph'
		};
		return icons[this.tag] || 'format_paragraph';
	}
}

customElements.define('k-hec-format-block', FormatBlock);
