import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import formatCode from '../utils/formatCode.js';
import { getCalculatedTheme, subscribeToTheme } from '../utils/theme.js';

/*
	Default CDN URL
*/
const MONACO_VERSION = '0.52.2';
const DEFAULT_MONACO_SRC = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min`;

export default class CodeEditor extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		name: { type: String, reflect: true },
		value: { type: String, reflect: true },
		language: { type: String, reflect: true },
		monacoSrc: { type: String, attribute: 'monaco-src' },
		controls: { type: String, reflect: true },
		editorTheme: { type: String, attribute: 'editor-theme', reflect: true },
		hasTopToolbar: { type: Boolean, state: true },
		hasBottomToolbar: { type: Boolean, state: true },
		fullscreen: { type: Boolean, reflect: true },
		wordWrap: { type: Boolean },
		minimapEnabled: { type: Boolean },
		disabled: { type: Boolean, reflect: true },
		readonly: { type: Boolean, reflect: true },
		required: { type: Boolean, reflect: true }
	};

	constructor() {
		super();
		this.internals = this.attachInternals();
		this.name = '';
		this.value = '';
		this.language = 'javascript';
		this.monacoSrc = '';
		this.controls = '';
		this.hasTopToolbar = false;
		this.hasBottomToolbar = false;
		this.monacoEditor = null;
		this.skipValueSync = false;
		this.editorTheme = 'auto';
		this.wordWrap = true;
		this.minimapEnabled = false;
		this.fontSize = 14;
		this.fullscreen = false;
		this.disabled = false;
		this.readonly = false;
		this.required = false;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		if(this.hasAttribute('value')){
			this.value = this.getAttribute('value');
		}
		this.slotObserver = new MutationObserver(() => this.updateToolbarVisibility());
		this.slotObserver.observe(this, { childList: true, subtree: true });
		this.updateToolbarVisibility();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.slotObserver?.disconnect();
		this.monacoEditor?.dispose();
		this.unsubscribeTheme?.();
		if(this.fullscreen) this.exitFullscreen();
	}

	updateToolbarVisibility() {
		const slots = new Set(Array.from(this.children).map(c => c.getAttribute('slot')));
		const set = this.constructor.controlSets[this.controls] ?? null;
		this.hasTopToolbar =
			!!(set?.topLeft || set?.topRight) ||
			['toolbar-top', 'toolbar-top-left', 'toolbar-top-right'].some(s => slots.has(s));
		this.hasBottomToolbar =
			!!(set?.bottomLeft || set?.bottomRight) ||
			['toolbar-bottom', 'toolbar-bottom-left', 'toolbar-bottom-right'].some(s => slots.has(s));
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('controls')){
			this.updateToolbarVisibility();
			if(this.controls && this.controls !== 'none') this.loadControls();
		}
		if(changedProperties.has('value') && !this.skipValueSync){
			if(this.monacoEditor && this.monacoEditor.getValue() !== this.value){
				this.monacoEditor.setValue(this.value);
			}
			this.updateFormValue();
			this.dispatchEvent(new CustomEvent('change', {
				detail: { value: this.value },
				bubbles: true
			}));
		}
		if(changedProperties.has('language') && this.monacoEditor){
			const model = this.monacoEditor.getModel();
			if(model) window.monaco.editor.setModelLanguage(model, this.language);
			this.dispatchEvent(new CustomEvent('language-changed', { detail: { language: this.language }, bubbles: true }));
		}
		if(changedProperties.has('editorTheme') && this.monacoEditor){
			window.monaco.editor.setTheme(this.resolveMonacoTheme());
			this.dispatchEvent(new CustomEvent('editor-theme-changed', { detail: { editorTheme: this.editorTheme }, bubbles: true }));
		}
		if(changedProperties.has('wordWrap')){
			this.monacoEditor?.updateOptions({ wordWrap: this.wordWrap ? 'on' : 'off' });
			this.dispatchEvent(new CustomEvent('word-wrap-changed', { detail: { wordWrap: this.wordWrap }, bubbles: true }));
		}
		if(changedProperties.has('minimapEnabled')){
			this.monacoEditor?.updateOptions({ minimap: { enabled: this.minimapEnabled } });
			this.dispatchEvent(new CustomEvent('minimap-changed', { detail: { minimapEnabled: this.minimapEnabled }, bubbles: true }));
		}
		if(changedProperties.has('fullscreen')){
			if(!this.fullscreen) this.monacoEditor?.layout({ width: 0, height: 0 });
			requestAnimationFrame(() => this.monacoEditor?.layout());
		}
		if(changedProperties.has('disabled') || changedProperties.has('readonly')){
			this.monacoEditor?.updateOptions({ readOnly: this.disabled || this.readonly });
		}
		if(
			changedProperties.has('value') ||
			changedProperties.has('required') ||
			changedProperties.has('disabled')
		){
			this.#updateValidity();
		}
	}

	#updateValidity = () => {
		if(this.disabled){
			this.internals.setValidity({});
			return;
		}
		if(this.required && !(this.getValue() || '').trim()){
			this.internals.setValidity(
				{ valueMissing: true },
				'Please fill out this field.',
				this.monacoContainer || this
			);
		} else {
			this.internals.setValidity({});
		}
	}

	async firstUpdated() {
		this.monacoContainer = this.shadowRoot.querySelector('.monaco-editor-container');
		await this.initMonaco();
		this.dispatchEvent(new CustomEvent('ready', {
			detail: { value: this.value },
			bubbles: true
		}));
	}

	/*
		Module Loading
	*/
	loadControls() {
		const modules = this.constructor.controlModules[this.controls];
		if(!modules?.length) return;
		const loaded = this.constructor.loadedModules;
		const cecBase = new URL('./codeEditorControls/', import.meta.url).href;
		const componentsBase = new URL('./', import.meta.url).href;
		modules.filter(m => !loaded.has(m)).forEach(m => {
			loaded.add(m);
			if(m.startsWith('components/')) import(`${componentsBase}${m.slice('components/'.length)}.js`);
			else import(`${cecBase}${m}.js`);
		});
	}

	async initMonaco() {
		if(this.monacoEditor) return;
		if(this.monacoInitPromise) return this.monacoInitPromise;
		this.monacoInitPromise = this._initMonaco();
		await this.monacoInitPromise;
		this.monacoInitPromise = null;
	}

	async _initMonaco() {
		const src = this.monacoSrc || window.kempo?.monacoUrl || DEFAULT_MONACO_SRC;
		await new Promise((resolve, reject) => {
			if(window.monaco){ resolve(); return; }
			if(window.require?.defined?.('vs/editor/editor.main')){ resolve(); return; }
			const existing = document.querySelector(`script[src="${src}/vs/loader.js"]`);
			if(existing){
				existing.addEventListener('load', () => {
					window.require.config({ paths: { vs: `${src}/vs` } });
					window.require(['vs/editor/editor.main'], () => resolve(), reject);
				});
				return;
			}
			const script = document.createElement('script');
			script.src = `${src}/vs/loader.js`;
			script.onload = () => {
				window.require.config({ paths: { vs: `${src}/vs` } });
				window.require(['vs/editor/editor.main'], () => resolve(), reject);
			};
			script.onerror = reject;
			document.head.appendChild(script);
		});

		this.monacoEditor = window.monaco.editor.create(this.monacoContainer, {
			value: this.value,
			language: this.language,
			theme: this.resolveMonacoTheme(),
			minimap: { enabled: false },
			wordWrap: 'on',
			fontSize: 14,
			scrollBeyondLastLine: false,
			automaticLayout: true,
			tabSize: 2,
			padding: { top: 8 },
			readOnly: this.disabled || this.readonly
		});

		const monacoCSS = document.querySelector('link[href*="monaco"][href*="editor.main.css"]');
		if(monacoCSS){
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = monacoCSS.href;
			this.shadowRoot.appendChild(link);
		}

		this.unsubscribeTheme = subscribeToTheme(() => {
			if(this.monacoEditor && this.editorTheme === 'auto'){
				window.monaco.editor.setTheme(this.resolveMonacoTheme());
			}
		});

		this.monacoEditor.onDidChangeModelContent(() => {
			this.skipValueSync = true;
			this.value = this.monacoEditor.getValue();
			this.skipValueSync = false;
			this.updateFormValue();
			this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true }));
			this.dispatchEvent(new CustomEvent('input', { detail: { value: this.value }, bubbles: true }));
		});
	}

	/*
		Form Integration
	*/
	updateFormValue() {
		this.internals.setFormValue(this.getValue());
	}

	formResetCallback() {
		this.value = '';
	}

	formStateRestoreCallback(state) {
		this.value = state;
	}

	formDisabledCallback(disabled) {
		this.disabled = disabled;
	}

	/*
		Public Methods
	*/
	getValue() {
		if(this.monacoEditor) return this.monacoEditor.getValue();
		return this.value;
	}

	setValue(str) {
		this.skipValueSync = true;
		this.value = str;
		if(this.monacoEditor) this.monacoEditor.setValue(str);
		this.updateFormValue();
		this.skipValueSync = false;
		return this;
	}

	clear() {
		return this.setValue('');
	}

	formatCode() {
		this.monacoEditor?.getAction('editor.action.formatDocument')?.run();
		return this;
	}

	selectAll() {
		if(!this.monacoEditor) return this;
		const model = this.monacoEditor.getModel();
		if(model) this.monacoEditor.setSelection(model.getFullModelRange());
		return this;
	}

	getSelectedText() {
		if(!this.monacoEditor) return '';
		return this.monacoEditor.getModel()?.getValueInRange(this.monacoEditor.getSelection()) || '';
	}

	focus() {
		this.monacoEditor?.focus();
		return this;
	}

	setLanguage(lang) {
		this.language = lang;
		return this;
	}

	setEditorTheme(theme) {
		if(['auto', 'light', 'dark'].includes(theme)) this.editorTheme = theme;
		return this;
	}

	copyToClipboard() {
		navigator.clipboard.writeText(this.getValue());
		return this;
	}

	undo() {
		this.monacoEditor?.trigger('toolbar', 'undo');
		return this;
	}

	redo() {
		this.monacoEditor?.trigger('toolbar', 'redo');
		return this;
	}

	setWordWrap(enabled) {
		this.wordWrap = enabled;
		return this;
	}

	setMinimap(enabled) {
		this.minimapEnabled = enabled;
		return this;
	}

	toggleWordWrap() {
		return this.setWordWrap(!this.wordWrap);
	}

	toggleMinimap() {
		return this.setMinimap(!this.minimapEnabled);
	}

	openFind() {
		this.monacoEditor?.getAction('actions.find')?.run();
		return this;
	}

	increaseFontSize() {
		this.fontSize = Math.min(this.fontSize + 2, 40);
		this.monacoEditor?.updateOptions({ fontSize: this.fontSize });
		return this;
	}

	decreaseFontSize() {
		this.fontSize = Math.max(this.fontSize - 2, 8);
		this.monacoEditor?.updateOptions({ fontSize: this.fontSize });
		return this;
	}

	foldAll() {
		this.monacoEditor?.getAction('editor.foldAll')?.run();
		return this;
	}

	unfoldAll() {
		this.monacoEditor?.getAction('editor.unfoldAll')?.run();
		return this;
	}

	enterFullscreen() {
		this.fullscreen = true;
		document.body.classList.add('no-scroll');
		this.dispatchEvent(new CustomEvent('fullscreen-changed', { detail: { fullscreen: true }, bubbles: true }));
		return this;
	}

	exitFullscreen() {
		this.fullscreen = false;
		document.body.classList.remove('no-scroll');
		this.dispatchEvent(new CustomEvent('fullscreen-changed', { detail: { fullscreen: false }, bubbles: true }));
		return this;
	}

	toggleFullscreen() {
		return this.fullscreen ? this.exitFullscreen() : this.enterFullscreen();
	}

	/*
		Utility Methods
	*/
	resolveMonacoTheme() {
		if(this.editorTheme === 'dark') return 'vs-dark';
		if(this.editorTheme === 'light') return 'vs';
		return getCalculatedTheme() === 'dark' ? 'vs-dark' : 'vs';
	}



	/*
		Rendering
	*/
	static loadedModules = new Set();
	static controlModules = {
		full: ['FormatCode', 'CopyCode', 'EditorTheme', 'Undo', 'Redo', 'WordWrap', 'Minimap', 'FindReplace', 'FontSize', 'FoldAll', 'LanguageSelect', 'Fullscreen', 'components/ControlGroup', 'ControlSpacer']
	};

	static controlSets = {
		full: {
			topLeft: html`
				<k-control-group>
					<k-cec-undo></k-cec-undo>
					<k-cec-redo></k-cec-redo>
				</k-control-group>
				<k-control-group>
					<k-cec-format-code></k-cec-format-code>
					<k-cec-copy-code></k-cec-copy-code>
					<k-cec-find-replace></k-cec-find-replace>
				</k-control-group>
				<k-control-group>
					<k-cec-word-wrap></k-cec-word-wrap>
					<k-cec-minimap></k-cec-minimap>
					<k-cec-fold-all></k-cec-fold-all>
				</k-control-group>
				<k-cec-font-size></k-cec-font-size>
			`,
			topRight: html`
				<k-cec-language></k-cec-language>
				<k-cec-editor-theme></k-cec-editor-theme>
				<k-cec-fullscreen></k-cec-fullscreen>
			`,
			bottomLeft: null,
			bottomRight: null,
		},
	};

	static styles = css`
		:host {
			display: flex;
			flex-direction: column;
			gap: 0;
			height: 400px;
			background: var(--c_bg);
		}
		:host([fullscreen]) {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 10000;
		}
		.toolbar-top,
		.toolbar-bottom {
			display: flex;
			align-items: center;
			background: var(--bg-secondary);
			min-height: 40px;
		}
		.toolbar-start {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
		}
		.toolbar-end {
			display: flex;
			flex-wrap: wrap-reverse;
			align-items: center;
			justify-content: flex-end;
			margin-left: auto;
		}
		.editor-container {
			position: relative;
			flex: 1;
			min-height: 0;
			overflow: hidden;
		}
		.monaco-editor-container {
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			overflow: auto;
			border: 1px solid var(--border-color);
		}
		[hidden] {
			display: none !important;
		}
		:host([disabled]) {
			opacity: 0.6;
		}
		/* disabled blocks all interaction -- toolbar AND editor. Monaco's
		   readOnly already prevents typing; pointer-events: none also stops
		   focus / cursor placement, matching native form control semantics. */
		:host([disabled]) .toolbar-top,
		:host([disabled]) .toolbar-bottom,
		:host([disabled]) .editor-container {
			pointer-events: none;
		}
		/* readonly keeps the editor interactive (so users can place a cursor
		   to select / copy) but mutes the toolbar so its buttons can't
		   mutate the document. */
		:host([readonly]) .toolbar-top,
		:host([readonly]) .toolbar-bottom {
			pointer-events: none;
			opacity: 0.5;
		}
	`;

	render() {
		const set = this.constructor.controlSets[this.controls] ?? {};
		return html`
			${this.hasTopToolbar ? html`
				<div class="toolbar-top bb">
					<div class="toolbar-start">
						<slot name="toolbar-top-left">${set.topLeft ?? ''}</slot>
					</div>
					<div class="toolbar-end">
						<slot name="toolbar-top-right">${set.topRight ?? ''}</slot>
					</div>
				</div>
			` : ''}
			<div class="editor-container">
				<div class="monaco-editor-container"></div>
			</div>
			${this.hasBottomToolbar ? html`
				<div class="toolbar-bottom bt">
					<div class="toolbar-start">
						<slot name="toolbar-bottom-left">${set.bottomLeft ?? ''}</slot>
					</div>
					<div class="toolbar-end">
						<slot name="toolbar-bottom-right">${set.bottomRight ?? ''}</slot>
					</div>
				</div>
			` : ''}
		`;
	}
}

customElements.define('k-code-editor', CodeEditor);
