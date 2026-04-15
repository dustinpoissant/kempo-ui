import CodeEditorControl from './CodeEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

const COMMON_LANGUAGES = [
	'javascript', 'typescript', 'html', 'css', 'json',
	'markdown', 'python', 'java', 'csharp', 'cpp',
	'go', 'rust', 'php', 'ruby', 'sql',
	'xml', 'yaml', 'shell', 'plaintext'
];

export default class LanguageSelect extends CodeEditorControl {
	static properties = {
		value: { type: String, state: true }
	};

	constructor() {
		super();
		this.value = 'javascript';
	}

	connectedCallback() {
		super.connectedCallback();
		const editor = this.editor;
		if(!editor) return;
		this.value = editor.language || 'javascript';
		this.languageHandler = e => { this.value = e.detail.language; };
		editor.addEventListener('language-changed', this.languageHandler);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.editor?.removeEventListener('language-changed', this.languageHandler);
		this.languageHandler = null;
	}

	/*
		Event Handlers
	*/
	handleChange = e => {
		this.editor?.setLanguage(e.target.value);
	};

	/*
		Styles
	*/
	static styles = [
		CodeEditorControl.styles,
		css`
			:host {
				display: inline-flex;
				align-items: center;
				padding: 0 0.25rem;
				gap: 0.25rem;
				background-color: 
			}
		`
	];

	/*
		Rendering
	*/
	render() {
		return html`
			<select .value=${this.value} @change=${this.handleChange} title="Language">
				${COMMON_LANGUAGES.map(lang => html`
					<option value="${lang}" ?selected=${this.value === lang}>${lang}</option>
				`)}
			</select>
		`;
	}
}

customElements.define('k-cec-language', LanguageSelect);
