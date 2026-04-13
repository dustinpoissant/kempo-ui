import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import formatCode from '../utils/formatCode.js';
import debounce from '../utils/debounce.js';
import { getCalculatedTheme, subscribeToTheme } from '../utils/theme.js';
import Dialog from './Dialog.js';

/*
  Default CDN URLs
*/
const LEXICAL_VERSION = '0.43.0';
const MONACO_VERSION = '0.52.2';
const DEFAULT_LEXICAL_BASE = 'https://esm.sh';
const DEFAULT_MONACO_SRC = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min`;

const lexicalUrl = (base, pkg) => `${base}/${pkg}@${LEXICAL_VERSION}`;

export default class HtmlEditor extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		name: { type: String, reflect: true },
		value: { type: String, reflect: true },
		selection: { type: Object, state: true },
		mode: { type: String, reflect: true },
		lexicalSrc: { type: String, attribute: 'lexical-src' },
		monacoSrc: { type: String, attribute: 'monaco-src' },
		nodes: { type: String },
		hasTopToolbar: { type: Boolean, state: true },
		hasBottomToolbar: { type: Boolean, state: true }
	};

	constructor() {
		super();
		this.internals = this.attachInternals();
		this.name = '';
		this.value = '';
		this.selection = null;
		this.cursor = null;
		this.mode = 'visual';
		this.lexicalSrc = '';
		this.monacoSrc = '';
		this.nodes = '';
		this.hasTopToolbar = false;
		this.hasBottomToolbar = false;
		this.skipValueSync = false;
		this.lexicalValueSync = false;
		this.savedSelection = null;
		this.lexicalEditor = null;
		this.monacoEditor = null;
		this.lx = {};
		this.debouncedSyncValue = debounce(() => this.syncValueFromLexical(), 300);
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
		this.cleanupFns?.forEach(fn => fn?.());
		this.monacoEditor?.dispose();
		this.unsubscribeTheme?.();
		if(this.syncShadowSelection) document.removeEventListener('selectionchange', this.syncShadowSelection);
	}

	updateToolbarVisibility() {
		this.hasTopToolbar = Array.from(this.children).some(c => c.getAttribute('slot') === 'toolbar-top');
		this.hasBottomToolbar = Array.from(this.children).some(c => c.getAttribute('slot') === 'toolbar-bottom');
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('value') && !this.skipValueSync){
			if(this.lexicalValueSync){
				this.lexicalValueSync = false;
			} else {
				if(this.lexicalEditor && this.mode === 'visual' && !this.isVisualCompatible(this.value)){
					this.skipLexicalExport = true;
					this.mode = 'code';
				} else {
					this.syncContentToEditors();
				}
			}
			this.updateFormValue();
			this.dispatchEvent(new CustomEvent('change', {
				detail: { value: this.value },
				bubbles: true
			}));
		}
		if(changedProperties.has('mode')){
			this.handleModeSwitch(changedProperties.get('mode'));
			this.dispatchEvent(new CustomEvent('mode-changed', {
				detail: { mode: this.mode },
				bubbles: true
			}));
		}
	}

	async firstUpdated() {
		this.lexicalContainer = this.shadowRoot.querySelector('.lexical-editor');
		this.monacoContainer = this.shadowRoot.querySelector('.monaco-editor-container');
		await this.initLexical();
		this.dispatchEvent(new CustomEvent('ready', {
			detail: { value: this.value },
			bubbles: true
		}));
	}

	/*
		Module Loading
	*/
	async loadNodeModules() {
		if(!this.nodes?.trim()) return [];
		const base = new URL('./htmlEditorNodes/', import.meta.url).href;
		const modules = await Promise.all(
			this.nodes.split(',').map(n => n.trim()).filter(Boolean).map(n => import(/* @vite-ignore */ `${base}${n}.js`))
		);
		return modules.map(m => m.default?.lexicalNode).filter(Boolean);
	}

	async loadLexicalModules() {
		const base = this.lexicalSrc || DEFAULT_LEXICAL_BASE;
		const url = pkg => lexicalUrl(base, pkg);
		const [lexical, richText, lexicalHtml, history, list, link, selection, table, code] = await Promise.all([
			import(/* @vite-ignore */ url('lexical')),
			import(/* @vite-ignore */ url('@lexical/rich-text')),
			import(/* @vite-ignore */ url('@lexical/html')),
			import(/* @vite-ignore */ url('@lexical/history')),
			import(/* @vite-ignore */ url('@lexical/list')),
			import(/* @vite-ignore */ url('@lexical/link')),
			import(/* @vite-ignore */ url('@lexical/selection')),
			import(/* @vite-ignore */ url('@lexical/table')),
			import(/* @vite-ignore */ url('@lexical/code'))
		]);
		this.lx = { lexical, richText, lexicalHtml, history, list, link, selection, table, code };
		this.StyledTextNode = class extends lexical.TextNode {
			static getType() { return 'styled-text'; }
			static clone(node) { return new this(node.__text, node.__key); }
			static importDOM() {
				return {
					span: () => ({
						conversion: domNode => {
							const style = domNode.getAttribute('style');
							if(!style) return null;
							const node = lexical.$createTextNode(domNode.textContent);
							node.setStyle(style);
							return { node };
						},
						priority: 1
					})
				};
			}
			static importJSON(json) { return lexical.$createTextNode(json.text); }
			exportJSON() { return { ...super.exportJSON(), type: 'styled-text' }; }
		};
	}

	async initLexical() {
		await this.loadLexicalModules();
		this.customNodes = await this.loadNodeModules();
		this.nodeCompatCheckers = this.customNodes.filter(n => typeof n.isVisualCompatible === 'function').map(n => n.isVisualCompatible);
		this.nodePreprocessors = this.customNodes.filter(n => typeof n.preprocessHtml === 'function').map(n => n.preprocessHtml);
		const { lexical, richText, history, list, link, table, code } = this.lx;

		const editorConfig = {
			namespace: 'KempoHtmlEditor',
			theme: {
				paragraph: 'k-editor-p',
				heading: { h1: 'k-editor-h1', h2: 'k-editor-h2', h3: 'k-editor-h3', h4: 'k-editor-h4', h5: 'k-editor-h5', h6: 'k-editor-h6' },
				text: { underline: 'td-u', strikethrough: 'td-lt' },
				list: { ul: 'k-editor-ul', ol: 'k-editor-ol', listitem: 'k-editor-li' },
				link: 'k-editor-link',
				quote: 'k-editor-quote',
				code: 'k-editor-code-block',
				codeHighlight: {},
				table: 'k-editor-table',
				tableCell: 'k-editor-table-cell',
				tableCellHeader: 'k-editor-table-cell-header'
			},
			nodes: [richText.HeadingNode, richText.QuoteNode, list.ListNode, list.ListItemNode, link.LinkNode, table.TableNode, table.TableCellNode, table.TableRowNode, code.CodeNode, code.CodeHighlightNode, this.StyledTextNode, ...this.customNodes],
			onError: console.error,
			editorState: null
		};

		this.lexicalEditor = lexical.createEditor(editorConfig);
		this.lexicalEditor.setRootElement(this.lexicalContainer);

		this.cleanupFns = [
			richText.registerRichText(this.lexicalEditor),
			history.registerHistory(this.lexicalEditor, history.createEmptyHistoryState(), 300)
		];
		if(list.registerList) this.cleanupFns.push(list.registerList(this.lexicalEditor));
		if(table.registerTable) this.cleanupFns.push(table.registerTable(this.lexicalEditor));
		if(code.registerCodeHighlighting) this.cleanupFns.push(code.registerCodeHighlighting(this.lexicalEditor));
		if(link.registerLink) this.cleanupFns.push(link.registerLink(this.lexicalEditor, {
			validateUrl: url => { try { new URL(url); return true; } catch { return false; } }
		}));

		if(this.value){
			if(this.isVisualCompatible(this.value)){
				this.importHtmlToLexical(this.value);
			} else {
				this.skipLexicalExport = true;
				this.mode = 'code';
			}
		}

		this.lexicalEditor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
			if(dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
			this.debouncedSyncValue();
			this.dispatchEvent(new CustomEvent('input', {
				detail: { value: this.exportHtmlFromLexical() },
				bubbles: true
			}));
		});

		this.lexicalEditor.registerCommand(
			lexical.SELECTION_CHANGE_COMMAND,
			() => { this.updateSelection(); return false; },
			lexical.COMMAND_PRIORITY_LOW
		);

		this.syncShadowSelection = () => {
			if(this.mode !== 'visual' || !this.lexicalEditor) return;
			const shadowSel = this.shadowRoot.getSelection?.();
			if(!shadowSel || shadowSel.rangeCount === 0) return;
			const range = shadowSel.getRangeAt(0);
			if(!this.lexicalContainer.contains(range.startContainer)) return;
			this.lexicalEditor.update(() => {
				const lexSel = lexical.$createRangeSelectionFromDom(shadowSel, this.lexicalEditor);
				if(lexSel) lexical.$setSelection(lexSel);
			}, { discrete: true });
			this.updateSelection();
		};
		document.addEventListener('selectionchange', this.syncShadowSelection);
	}

	async initMonaco() {
		if(this.monacoEditor) return;
		if(this.monacoInitPromise) return this.monacoInitPromise;
		this.monacoInitPromise = this._initMonaco();
		await this.monacoInitPromise;
		this.monacoInitPromise = null;
	}

	async _initMonaco() {
		const src = this.monacoSrc || DEFAULT_MONACO_SRC;

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
			value: formatCode(this.value),
			language: 'html',
			theme: getCalculatedTheme() === 'dark' ? 'vs-dark' : 'vs',
			minimap: { enabled: false },
			wordWrap: 'on',
			fontSize: 14,
			scrollBeyondLastLine: false,
			automaticLayout: true,
			tabSize: 2
		});

		const monacoCSS = document.querySelector('link[href*="monaco"][href*="editor.main.css"]');
		if(monacoCSS){
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = monacoCSS.href;
			this.shadowRoot.appendChild(link);
		}

		this.unsubscribeTheme = subscribeToTheme(() => {
			if(this.monacoEditor) window.monaco.editor.setTheme(getCalculatedTheme() === 'dark' ? 'vs-dark' : 'vs');
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
		Content Sync
	*/
	importHtmlToLexical(htmlString) {
		if(!this.lexicalEditor || !this.lx.lexicalHtml) return;
		const { lexical, lexicalHtml } = this.lx;
		const processed = (this.nodePreprocessors || []).reduce((str, fn) => fn(str), htmlString);
		this.lexicalEditor.update(() => {
			const root = lexical.$getRoot();
			root.clear();
			if(!processed?.trim()) return;
			const dom = new DOMParser().parseFromString(processed, 'text/html');
			const nodes = lexicalHtml.$generateNodesFromDOM(this.lexicalEditor, dom);
			if(nodes.length > 0) lexical.$insertNodes(nodes);
		}, { discrete: true });
	}

	exportHtmlFromLexical() {
		if(!this.lexicalEditor || !this.lx.lexicalHtml) return this.value;
		let result = '';
		this.lexicalEditor.getEditorState().read(() => {
			result = this.lx.lexicalHtml.$generateHtmlFromNodes(this.lexicalEditor, null);
		});
		return this.cleanExportedHtml(result);
	}

	isVisualCompatible(htmlStr) {
		if(!htmlStr?.trim()) return true;
		const incompatibleTags = new Set(['script', 'style', 'meta', 'link', 'head', 'iframe', 'object', 'embed', 'canvas', 'video', 'audio', 'form', 'input', 'button', 'select', 'textarea', 'fieldset', 'label', 'noscript', 'template', 'slot', 'svg', 'math']);
		const checkers = this.nodeCompatCheckers || [];
		const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
		const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
		let node;
		while((node = walker.nextNode())){
			if(checkers.some(check => check(node))) continue;
			if(node.nodeType === Node.COMMENT_NODE) return false;
			if(incompatibleTags.has(node.tagName?.toLowerCase())) return false;
		}
		return true;
	}

	cleanExportedHtml(html) {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		doc.body.querySelectorAll('[class]').forEach(el => {
			const classes = Array.from(el.classList).filter(c => !c.startsWith('k-editor-') && c !== 'td-u' && c !== 'td-lt');
			if(classes.length === 0) el.removeAttribute('class');
			else el.className = classes.join(' ');
		});
		doc.body.querySelectorAll('[style]').forEach(el => {
			const style = el.style.cssText.replace(/white-space:\s*pre-wrap;?\s*/g, '').trim();
			if(!style) el.removeAttribute('style');
			else el.style.cssText = style;
		});
		doc.body.querySelectorAll('span:not([class]):not([style]):not([id])').forEach(span => {
			if(!span.attributes.length) span.replaceWith(...span.childNodes);
		});
		doc.body.querySelectorAll('b > strong, i > em, b > b, strong > strong, i > i, em > em').forEach(inner => {
			inner.replaceWith(...inner.childNodes);
		});
		doc.body.querySelectorAll('pre[data-highlight-language], code[data-highlight-language]').forEach(el => {
			el.removeAttribute('data-highlight-language');
			el.removeAttribute('data-language');
		});
		return doc.body.innerHTML;
	}

	syncValueFromLexical() {
		if(!this.lexicalEditor) return;
		this.lexicalValueSync = true;
		this.value = this.exportHtmlFromLexical();
		this.updateFormValue();
	}

	syncContentToEditors() {
		if(this.mode === 'visual' && this.lexicalEditor){
			this.importHtmlToLexical(this.value);
		}
	}

	async handleModeSwitch(previousMode) {
		if(this.mode === 'code'){
			if(this.lexicalEditor && !this.skipLexicalExport) this.value = this.exportHtmlFromLexical();
			this.skipLexicalExport = false;
			await this.initMonaco();
			if(this.monacoEditor){
				this.monacoEditor.setValue(formatCode(this.value));
				this.monacoEditor.layout();
			}
		} else if(this.mode === 'visual'){
			if(this.monacoEditor) this.value = this.monacoEditor.getValue();
			if(this.lexicalEditor) this.importHtmlToLexical(this.value);
		}
		this.requestUpdate();
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

	/*
		Selection Management
	*/
	updateSelection = () => {
		if(this.mode !== 'visual' || !this.lexicalEditor){
			this.selection = null;
			return;
		}
		const { lexical } = this.lx;
		this.lexicalEditor.getEditorState().read(() => {
			const sel = lexical.$getSelection();
			if(lexical.$isRangeSelection(sel) && !sel.isCollapsed()){
				this.selection = { text: sel.getTextContent(), collapsed: false };
			} else {
				this.selection = null;
				this.cursor = sel ? { anchor: sel.anchor, focus: sel.focus } : null;
			}
		});
	};

	/*
		Public Methods - Mode Control
	*/
	setMode(mode) {
		if(!['visual', 'code'].includes(mode)) return this;
		if(mode === 'visual' && !this.isVisualCompatible(this.getValue())){
			Dialog.confirm(
				'This html contains code that is not compatible with the visual editor, the incompatible code will be lost',
				response => { if(response) this.mode = mode; },
				{ title: 'Warning', confirmText: 'Change Anyways' }
			);
			return this;
		}
		this.mode = mode;
		return this;
	}

	toggleMode() {
		return this.setMode(this.mode === 'visual' ? 'code' : 'visual');
	}

	/*
		Public Methods - Content Management
	*/
	getValue() {
		if(this.mode === 'visual' && this.lexicalEditor){
			this.skipValueSync = true;
			this.value = this.exportHtmlFromLexical();
			this.skipValueSync = false;
		} else if(this.mode === 'code' && this.monacoEditor){
			return this.monacoEditor.getValue();
		}
		return this.value;
	}

	setValue(htmlStr) {
		if(this.lexicalEditor && this.mode === 'visual' && !this.isVisualCompatible(htmlStr)){
			this.value = htmlStr;
			this.skipLexicalExport = true;
			this.mode = 'code';
			this.updateFormValue();
			return this;
		}
		this.skipValueSync = true;
		this.value = htmlStr;
		if(this.mode === 'visual') this.syncContentToEditors();
		else if(this.mode === 'code' && this.monacoEditor) this.monacoEditor.setValue(formatCode(htmlStr));
		this.updateFormValue();
		this.skipValueSync = false;
		return this;
	}

	clear() {
		return this.setValue('');
	}

	/*
		Public Methods - Text Formatting
	*/
	bold() {
		this.lexicalFormat('bold');
		return this;
	}

	italic() {
		this.lexicalFormat('italic');
		return this;
	}

	underline() {
		this.lexicalFormat('underline');
		return this;
	}

	strikethrough() {
		this.lexicalFormat('strikethrough');
		return this;
	}

	/*
		Public Methods - Lists
	*/
	orderedList() {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		this.lexicalEditor.update(() => {
			this.lx.list.$insertList('number');
		}, { discrete: true });
		return this;
	}

	unorderedList() {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		this.lexicalEditor.update(() => {
			this.lx.list.$insertList('bullet');
		}, { discrete: true });
		return this;
	}

	/*
		Public Methods - Text Alignment
	*/
	alignLeft() {
		this.lexicalFormatElement('left');
		return this;
	}

	alignCenter() {
		this.lexicalFormatElement('center');
		return this;
	}

	alignRight() {
		this.lexicalFormatElement('right');
		return this;
	}

	alignJustify() {
		this.lexicalFormatElement('justify');
		return this;
	}

	/*
		Public Methods - Text Color
	*/
	setTextColor(color) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, selection } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			selection.$patchStyleText(sel, { color });
		}, { discrete: true });
		return this;
	}

	removeTextColor() {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, selection } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			selection.$patchStyleText(sel, { color: null });
		}, { discrete: true });
		return this;
	}

	setTextBackgroundColor(color) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, selection } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			selection.$patchStyleText(sel, { 'background-color': color });
		}, { discrete: true });
		return this;
	}

	removeTextBackgroundColor() {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, selection } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			selection.$patchStyleText(sel, { 'background-color': null });
		}, { discrete: true });
		return this;
	}

	/*
		Public Methods - Formatting Control
	*/
	removeFormat() {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, selection } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			sel.getNodes().forEach(node => {
				if(lexical.$isTextNode(node)) node.setFormat(0);
			});
			selection.$patchStyleText(sel, { color: null, 'background-color': null });
		}, { discrete: true });
		return this;
	}

	formatBlock(tag) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, richText, code } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			const anchor = sel.anchor.getNode();
			const topLevel = anchor.getTopLevelElementOrThrow();
			const isCodeNode = code.$isCodeNode(topLevel);

			let newBlock;
			if(tag === 'p'){
				newBlock = lexical.$createParagraphNode();
			} else if(tag.match(/^h[1-6]$/)){
				newBlock = richText.$createHeadingNode(tag);
			} else if(tag === 'blockquote'){
				newBlock = richText.$createQuoteNode();
			} else if(tag === 'pre'){
				newBlock = code.$createCodeNode();
			} else {
				return;
			}

			if(isCodeNode && tag !== 'pre'){
				const text = topLevel.getTextContent();
				topLevel.replace(newBlock);
				newBlock.append(lexical.$createTextNode(text));
			} else {
				const children = topLevel.getChildren();
				topLevel.replace(newBlock);
				children.forEach(child => newBlock.append(child));
			}
			newBlock.selectEnd();
		}, { discrete: true });
		return this;
	}

	insertHTML(htmlStr) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, lexicalHtml } = this.lx;
		this.lexicalEditor.update(() => {
			const dom = new DOMParser().parseFromString(htmlStr, 'text/html');
			const nodes = lexicalHtml.$generateNodesFromDOM(this.lexicalEditor, dom);
			lexical.$insertNodes(nodes);
		}, { discrete: true });
		return this;
	}

	insertAtCursor(htmlStr) {
		return this.insertHTML(htmlStr);
	}

	insertTable(rows, columns, includeHeaders = false, cellData = null) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, table } = this.lx;
		this.lexicalEditor.update(() => {
			const totalRows = rows + (includeHeaders ? 1 : 0);
			const rowNodes = [];
			for(let r = 0; r < totalRows; r++){
				const cells = [];
				for(let c = 0; c < columns; c++){
					const isHeader = includeHeaders && r === 0;
					const headerState = isHeader ? table.TableCellHeaderStates.ROW : table.TableCellHeaderStates.NO_STATUS;
					const cell = table.$createTableCellNode(headerState);
					const content = cellData?.[r]?.[c] ?? (isHeader ? `Header ${c + 1}` : '');
					const p = lexical.$createParagraphNode();
					p.append(lexical.$createTextNode(content || '\u00A0'));
					cell.append(p);
					cells.push(cell);
				}
				rowNodes.push(table.$createTableRowNode().append(...cells));
			}
			const tableNode = table.$createTableNode().append(...rowNodes);
			const sel = lexical.$getSelection();
			if(lexical.$isRangeSelection(sel)){
				const anchor = sel.anchor.getNode();
				const topLevel = anchor.getTopLevelElementOrThrow();
				topLevel.insertAfter(tableNode);
				const trailing = lexical.$createParagraphNode();
				tableNode.insertAfter(trailing);
				trailing.selectEnd();
			} else {
				const root = lexical.$getRoot();
				root.append(tableNode);
				root.append(lexical.$createParagraphNode());
			}
		}, { discrete: true });
		return this;
	}

	insertElementAtCursor(element) {
		return this.insertHTML(element.outerHTML);
	}

	replaceSelectionWithElement(element) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, lexicalHtml } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			sel.removeText();
			const dom = new DOMParser().parseFromString(element.outerHTML, 'text/html');
			const nodes = lexicalHtml.$generateNodesFromDOM(this.lexicalEditor, dom);
			lexical.$insertNodes(nodes);
		}, { discrete: true });
		return this;
	}

	wrapSelection(before, after, savedSelection = null) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const text = savedSelection || this.getSelectedText();
		if(!text) return this;
		return this.insertHTML(before + text + after);
	}

	/*
		Public Methods - Selection Management
	*/
	getSelection() {
		if(this.mode !== 'visual' || !this.lexicalEditor) return null;
		let result = null;
		const { lexical } = this.lx;
		this.lexicalEditor.getEditorState().read(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel) || sel.isCollapsed()) return;
			result = { text: sel.getTextContent(), html: sel.getTextContent(), selection: sel };
		});
		return result;
	}

	getSelectedText() {
		let text = '';
		if(this.mode !== 'visual' || !this.lexicalEditor) return text;
		const { lexical } = this.lx;
		this.lexicalEditor.getEditorState().read(() => {
			const sel = lexical.$getSelection();
			if(lexical.$isRangeSelection(sel)) text = sel.getTextContent();
		});
		return text;
	}

	getSelectedHTML() {
		return this.getSelectedText();
	}

	selectAll() {
		if(this.mode === 'visual' && this.lexicalEditor){
			const { lexical } = this.lx;
			this.lexicalEditor.update(() => {
				lexical.$selectAll();
			}, { discrete: true });
		} else if(this.monacoEditor){
			const model = this.monacoEditor.getModel();
			if(model) this.monacoEditor.setSelection(model.getFullModelRange());
		}
		return this;
	}

	replaceSelection(htmlStr) {
		return this.insertHTML(htmlStr);
	}

	deleteSelection() {
		if(this.mode === 'visual'){
			this.lexicalCmd('DELETE_CHARACTER_COMMAND', false);
		} else if(this.monacoEditor){
			this.monacoEditor.trigger('keyboard', 'deleteAllLeft', null);
		}
		return this;
	}

	getValueWithSelectionMarkers() {
		if(this.mode !== 'visual' || !this.lexicalEditor){
			return { html: this.value, hasCursor: false, hasSelection: false, selectedText: '' };
		}
		let result = { html: this.exportHtmlFromLexical(), hasCursor: false, hasSelection: false, selectedText: '' };
		const { lexical } = this.lx;
		this.lexicalEditor.getEditorState().read(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			if(sel.isCollapsed()){
				result.hasCursor = true;
			} else {
				result.hasSelection = true;
				result.selectedText = sel.getTextContent();
			}
		});
		return result;
	}

	setValueFromSelectionMarkers(htmlStr) {
		return this.setValue(htmlStr);
	}

	captureSelection() {
		return this.selection;
	}

	restoreSavedSelection() {
		return false;
	}

	clearSavedSelection() {
		this.savedSelection = null;
	}

	/*
		Public Methods - Links and Media
	*/
	createLink(url) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { link } = this.lx;
		this.lexicalEditor.update(() => {
			link.$toggleLink(url);
		}, { discrete: true });
		return this;
	}

	createLinkWithText(url, text) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, link } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(lexical.$isRangeSelection(sel) && !sel.isCollapsed()) sel.removeText();
			const linkNode = link.$createLinkNode(url);
			linkNode.append(lexical.$createTextNode(text));
			lexical.$insertNodes([linkNode]);
		}, { discrete: true });
		return this;
	}

	unlink() {
		if(this.mode !== 'visual' || !this.lexicalEditor) return this;
		const { lexical, link } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(!lexical.$isRangeSelection(sel)) return;
			sel.getNodes().forEach(node => {
				const parent = node.getParent();
				if(parent && link.$isLinkNode?.(parent)){
					parent.getChildren().forEach(child => parent.insertBefore(child));
					parent.remove();
				}
			});
		}, { discrete: true });
		return this;
	}

	insertImage(url) {
		return this.insertHTML(`<img src="${encodeURI(url)}" />`);
	}

	/*
		Public Methods - History
	*/
	undo() {
		this.lexicalCmd('UNDO_COMMAND', undefined);
		return this;
	}

	redo() {
		this.lexicalCmd('REDO_COMMAND', undefined);
		return this;
	}

	/*
		Utility Methods
	*/
	lexicalCmd(commandName, payload) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return;
		const cmd = this.lx.lexical?.[commandName];
		if(cmd) this.lexicalEditor.dispatchCommand(cmd, payload);
	}

	lexicalFormat(format) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return;
		const { lexical } = this.lx;
		this.lexicalEditor.update(() => {
			const sel = lexical.$getSelection();
			if(lexical.$isRangeSelection(sel)) sel.formatText(format);
		}, { discrete: true });
	}

	lexicalFormatElement(alignment) {
		if(this.mode !== 'visual' || !this.lexicalEditor) return;
		this.lexicalEditor.dispatchCommand(this.lx.lexical.FORMAT_ELEMENT_COMMAND, alignment);
	}

	/*
		Rendering
	*/
	static styles = css`
		:host {
			display: flex;
			flex-direction: column;
			gap: 0;
			height: 300px;
		}
		.toolbar-top,
		.toolbar-bottom {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 0;
			background: var(--bg-secondary);
			min-height: 40px;
		}
		.editor-container {
			position: relative;
			flex: 1;
			min-height: 0;
			overflow: hidden;
		}
		.lexical-editor,
		.monaco-editor-container {
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			overflow: auto;
		}
		.lexical-editor {
			padding: 1rem;
			border: 1px solid var(--border-color);
			background: var(--bg-primary);
			color: var(--text-primary);
			font-family: inherit;
			font-size: inherit;
			line-height: 1.5;
			outline: none;
		}
		.lexical-editor:focus {
			border-color: var(--primary-color);
		}
		.lexical-editor p { margin: 0 0 0.5em 0; }
		.lexical-editor h1,
		.lexical-editor h2,
		.lexical-editor h3,
		.lexical-editor h4,
		.lexical-editor h5,
		.lexical-editor h6 { margin: 0.5em 0; }
		.lexical-editor ul,
		.lexical-editor ol { margin: 0.5em 0; padding-left: 1.5em; }
		.lexical-editor blockquote {
			margin: 0.5em 0;
			padding-left: 1em;
			border-left: 3px solid var(--border-color, #ccc);
			color: var(--text-secondary, #666);
		}
		.lexical-editor a { color: var(--primary-color, #007acc); }
		.lexical-editor code {
			background: var(--bg-secondary, #f5f5f5);
			padding: 0.125em 0.25em;
			border-radius: 3px;
			font-family: monospace;
		}
		.lexical-editor pre {
			background: var(--bg-secondary, #f5f5f5);
			padding: 1em;
			border-radius: 4px;
			font-family: monospace;
			overflow-x: auto;
			white-space: pre-wrap;
		}
		.lexical-editor table {
			border-collapse: collapse;
			width: 100%;
		}
		.lexical-editor th,
		.lexical-editor td {
			border: 1px solid var(--border-color, #ccc);
			padding: 0.5rem;
		}
		.lexical-editor th {
			background-color: var(--bg-secondary, #f5f5f5);
			text-align: left;
		}
		.monaco-editor-container {
			border: 1px solid var(--border-color);
		}
		[hidden] {
			display: none !important;
		}
	`;

	render() {
		return html`
			${this.hasTopToolbar ? html`
				<div class="toolbar-top bb">
					<slot name="toolbar-top"></slot>
				</div>
			` : ''}
			<div class="editor-container">
				<div
					class="lexical-editor"
					contenteditable="true"
					?hidden=${this.mode !== 'visual'}
				></div>
				<div
					class="monaco-editor-container"
					?hidden=${this.mode !== 'code'}
				></div>
			</div>
			${this.hasBottomToolbar ? html`
				<div class="toolbar-bottom bt">
					<slot name="toolbar-bottom"></slot>
				</div>
			` : ''}
		`;
	}
}

customElements.define('k-html-editor', HtmlEditor);
