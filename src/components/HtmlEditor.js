import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import formatCode from '../utils/formatCode.js';
import debounce from '../utils/debounce.js';

export default class HtmlEditor extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		name: {
			type: String,
			reflect: true
		},
		value: {
			type: String,
			reflect: true
		},
		selection: {
			type: Object,
			state: true
		},
		mode: {
			type: String,
			reflect: true
		},
		hasTopToolbar: {
			type: Boolean,
			state: true
		},
		hasBottomToolbar: {
			type: Boolean,
			state: true
		}
	};

	constructor() {
		super();
		this.internals = this.attachInternals();
		this.name = '';
		this.value = '';
		this.selection = null;
		this.cursor = null;
		this.mode = 'visual';
		this.hasTopToolbar = false;
		this.hasBottomToolbar = false;
		this.skipSync = false;
		this.savedSelection = null;
		
		this.debouncedDispatchChange = debounce(() => {
			this.value = this.editorEl.innerHTML;
		}, 300);
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		
		if(this.hasAttribute('value')){
			this.value = this.getAttribute('value');
		}

		this.slotObserver = new MutationObserver(() => {
			this.updateToolbarVisibility();
		});

		this.slotObserver.observe(this, {
			childList: true,
			subtree: true
		});

		this.updateToolbarVisibility();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.slotObserver?.disconnect();
		
		if(this.boundUpdateSelection){
			this.shadowRoot.removeEventListener('selectionchange', this.boundUpdateSelection);
			
			if(this.editorEl){
				this.editorEl.removeEventListener('mouseup', this.boundUpdateSelection);
				this.editorEl.removeEventListener('keyup', this.boundUpdateSelection);
				this.editorEl.removeEventListener('focus', this.boundUpdateSelection);
			}
		}
	}

	updateToolbarVisibility() {
		const topSlotContent = Array.from(this.children).filter(child => 
			child.getAttribute('slot') === 'toolbar-top'
		);
		const bottomSlotContent = Array.from(this.children).filter(child => 
			child.getAttribute('slot') === 'toolbar-bottom'
		);

		this.hasTopToolbar = topSlotContent.length > 0;
		this.hasBottomToolbar = bottomSlotContent.length > 0;
	}

	updated(changedProperties) {
		super.updated(changedProperties);

		if(changedProperties.has('value')){
			this.syncContent();
			this.updateFormValue();
			this.dispatchEvent(new CustomEvent('change', {
				detail: { value: this.value },
				bubbles: true
			}));
		}

		if(changedProperties.has('mode')){
			this.syncContent();
			this.dispatchEvent(new CustomEvent('mode-changed', {
				detail: { mode: this.mode },
				bubbles: true
			}));
		}
	}

	firstUpdated() {
		this.editorEl = this.shadowRoot.querySelector('.editor');
		this.textareaEl = this.shadowRoot.querySelector('textarea');
		
		if(this.value){
			this.syncContent();
		}

		this.boundUpdateSelection = this.updateSelection.bind(this);
		
		this.shadowRoot.addEventListener('selectionchange', this.boundUpdateSelection);
		this.editorEl.addEventListener('mouseup', this.boundUpdateSelection);
		this.editorEl.addEventListener('keyup', this.boundUpdateSelection);
		this.editorEl.addEventListener('focus', this.boundUpdateSelection);
		this.editorEl.addEventListener('keydown', this.handleTableNavigation);
		
		this.dispatchEvent(new CustomEvent('ready', {
			detail: { value: this.value },
			bubbles: true
		}));
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
		Event Handlers
	*/
	handleTableNavigation = (e) => {
		if(e.key !== 'Tab' && e.key !== 'Enter') return;
		if(this.mode !== 'visual') return;
		
		const sel = this.shadowRoot.getSelection() || window.getSelection();
		if(!sel.rangeCount) return;
		
		let node = sel.getRangeAt(0).startContainer;
		
		if(node.nodeType === Node.TEXT_NODE){
			node = node.parentElement;
		}
		
		const cell = node.closest('td, th');
		if(!cell) return;
		
		e.preventDefault();
		
		if(e.key === 'Tab'){
			const row = cell.parentElement;
			const cells = Array.from(row.cells);
			const currentIndex = cells.indexOf(cell);
			
			if(e.shiftKey){
				// Shift+Tab: Go to previous cell
				let prevCell = cells[currentIndex - 1];
				
				if(!prevCell){
					const prevRow = row.previousElementSibling;
					if(prevRow){
						prevCell = prevRow.cells[prevRow.cells.length - 1];
					}
				}
				
				if(prevCell){
					const range = document.createRange();
					range.selectNodeContents(prevCell);
					range.collapse(false);
					sel.removeAllRanges();
					sel.addRange(range);
					prevCell.focus();
				}
			} else {
				// Tab: Go to next cell
				let nextCell = cells[currentIndex + 1];
				
				if(!nextCell){
					const nextRow = row.nextElementSibling;
					if(nextRow){
						nextCell = nextRow.cells[0];
					}
				}
				
				if(nextCell){
					const range = document.createRange();
					range.selectNodeContents(nextCell);
					range.collapse(false);
					sel.removeAllRanges();
					sel.addRange(range);
					nextCell.focus();
				}
			}
		} else if(e.key === 'Enter'){
			const row = cell.parentElement;
			const cells = Array.from(row.cells);
			const currentIndex = cells.indexOf(cell);
			
			if(e.shiftKey){
				// Shift+Enter: Go to cell above
				const prevRow = row.previousElementSibling;
				if(prevRow && prevRow.cells[currentIndex]){
					const prevCell = prevRow.cells[currentIndex];
					const range = document.createRange();
					range.selectNodeContents(prevCell);
					range.collapse(false);
					sel.removeAllRanges();
					sel.addRange(range);
					prevCell.focus();
				}
			} else {
				// Enter: Go to cell below or create paragraph after table
				const nextRow = row.nextElementSibling;
				if(nextRow && nextRow.cells[currentIndex]){
					const nextCell = nextRow.cells[currentIndex];
					const range = document.createRange();
					range.selectNodeContents(nextCell);
					range.collapse(false);
					sel.removeAllRanges();
					sel.addRange(range);
					nextCell.focus();
				} else {
					// Last row - create paragraph after table
					const table = cell.closest('table');
					if(table){
						const p = document.createElement('p');
						p.innerHTML = '<br>';
						
						if(table.nextSibling){
							table.parentNode.insertBefore(p, table.nextSibling);
						} else {
							table.parentNode.appendChild(p);
						}
						
						const range = document.createRange();
						range.setStart(p, 0);
						range.setEnd(p, 0);
						sel.removeAllRanges();
						sel.addRange(range);
						p.focus();
					}
				}
			}
		}
	};

	updateSelection = () => {
		if(this.mode !== 'visual'){
			this.selection = null;
			return;
		}

		const sel = this.shadowRoot.getSelection() || window.getSelection();
		
		if(!sel.rangeCount){
			this.selection = null;
			return;
		}

		const range = sel.getRangeAt(0);
		
		const isStartInEditor = this.editorEl.contains(range.startContainer) || this.editorEl === range.startContainer;
		const isEndInEditor = this.editorEl.contains(range.endContainer) || this.editorEl === range.endContainer;
		
		if(!isStartInEditor || !isEndInEditor){
			this.selection = null;
			return;
		}

		const selectedText = range.toString();

		if(range.collapsed){
			this.selection = null;
			this.cursor = {
				container: range.startContainer,
				offset: range.startOffset
			};
		} else {
			this.cursor = null;
			this.selection = {
				startContainer: range.startContainer,
				startOffset: range.startOffset,
				endContainer: range.endContainer,
				endOffset: range.endOffset,
			text: selectedText,
			collapsed: false
		};
	}
	};	handleEditorInput = () => {
		// Don't update this.value on every keystroke - it triggers Lit's reactive system
		// which calls syncContent() and destroys the cursor position.
		// Use debounce to only update after user stops typing for 300ms.
		this.debouncedDispatchChange();
		this.dispatchEvent(new CustomEvent('input', { detail: { value: this.editorEl.innerHTML } }));
	};

	handleTextareaInput = (e) => {
		if(this.mode === 'code'){
			this.value = e.target.value;
		}
	};

	handleEditorPaste = (e) => {
		e.preventDefault();
		const text = e.clipboardData.getData('text/plain');
		document.execCommand('insertText', false, text);
	};

	handleEditorBlur = () => {
		if(this.mode === 'visual'){
			// Save selection before it's cleared
			const selection = this.shadowRoot.getSelection() || window.getSelection();
			if(selection.rangeCount > 0){
				const range = selection.getRangeAt(0);
				if(this.editorEl.contains(range.commonAncestorContainer)){
					this.savedSelection = {
						startContainer: range.startContainer,
						startOffset: range.startOffset,
						endContainer: range.endContainer,
						endOffset: range.endOffset,
						collapsed: range.collapsed
					};
				}
			}
			
			const cleanedValue = this.cleanupHtml(this.editorEl.innerHTML);
			if(cleanedValue !== this.value){
				this.value = cleanedValue;
				this.syncContent();
			}
		}
	};

	/*
		Public Methods - Mode Control
	*/
	setMode(mode) {
		if(['visual', 'code'].includes(mode)){
			if(this.mode === 'visual' && mode === 'code'){
				this.value = this.cleanupHtml(this.editorEl.innerHTML);
			}
			this.mode = mode;
		}
		return this;
	}

	toggleMode() {
		const newMode = this.mode === 'visual' ? 'code' : 'visual';
		this.setMode(newMode);
		return this;
	}

	/*
		Public Methods - Content Management
	*/
	getValue() {
		if(this.mode === 'visual'){
			const content = this.editorEl ? this.editorEl.innerHTML : this.value;
			return content.replace(/\u200B/g, '');
		}
		return this.value;
	}

	setValue(html) {
		this.value = html;
		this.syncContent();
		return this;
	}

	clear() {
		this.value = '';
		this.syncContent();
		return this;
	}

	cleanupHtml(html){
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = html;
		
		const inlineTags = ['code', 'a', 'span', 'strong', 'em', 'b', 'i', 'u', 's'];
		const blockTags = ['pre', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];
		
		const unwrapNested = (parent, tagName) => {
			const elements = parent.querySelectorAll(tagName);
			elements.forEach(el => {
				let ancestor = el.parentElement;
				while(ancestor && ancestor !== parent){
					if(ancestor.tagName.toLowerCase() === tagName){
						while(el.firstChild){
							el.parentNode.insertBefore(el.firstChild, el);
						}
						el.parentNode.removeChild(el);
						break;
					}
					ancestor = ancestor.parentElement;
				}
			});
		};
		
		const removeUselessStyles = (parent) => {
			const allElements = parent.querySelectorAll('*');
			allElements.forEach(el => {
				if(!el.hasAttribute('style')) return;
				
				const style = el.style;
				const uselessProps = [
					'font-size',
					'font-family', 
					'background-color',
					'line-height',
					'font-weight',
					'font-style'
				];
				
				const uselessValues = [
					'inherit',
					'rgba(0, 0, 0, 0)',
					'transparent',
					'initial',
					'unset'
				];
				
				uselessProps.forEach(prop => {
					const value = style.getPropertyValue(prop);
					if(value && uselessValues.some(uv => value.includes(uv))){
						style.removeProperty(prop);
					}
				});
				
				if(style.length === 0){
					el.removeAttribute('style');
				}
			});
		};
		
		const unwrapEmptySpans = (parent) => {
			const spans = parent.querySelectorAll('span');
			spans.forEach(span => {
				if(!span.className && !span.id && !span.hasAttribute('style')){
					while(span.firstChild){
						span.parentNode.insertBefore(span.firstChild, span);
					}
					span.parentNode.removeChild(span);
				}
			});
		};
		
		const normalizeWhitespace = (parent) => {
			const walker = document.createTreeWalker(
				parent,
				NodeFilter.SHOW_TEXT,
				null
			);
			
			const textNodes = [];
			while(walker.nextNode()){
				textNodes.push(walker.currentNode);
			}
			
			textNodes.forEach(node => {
				node.textContent = node.textContent.replace(/\u00A0/g, ' ');
			});
		};
		
		inlineTags.forEach(tag => unwrapNested(tempDiv, tag));
		blockTags.forEach(tag => unwrapNested(tempDiv, tag));
		removeUselessStyles(tempDiv);
		unwrapEmptySpans(tempDiv);
		normalizeWhitespace(tempDiv);
		
		return tempDiv.innerHTML;
	}

	/*
		Public Methods - Text Formatting
	*/
	bold() {
		this.execCommand('bold');
		return this;
	}

	italic() {
		this.execCommand('italic');
		return this;
	}

	underline() {
		this.execCommand('underline');
		return this;
	}

	strikethrough() {
		this.execCommand('strikeThrough');
		return this;
	}

	/*
		Public Methods - Lists
	*/
	orderedList() {
		this.execCommand('insertOrderedList');
		return this;
	}

	unorderedList() {
		this.execCommand('insertUnorderedList');
		return this;
	}

	/*
		Public Methods - Text Alignment
	*/
	alignLeft() {
		this.execCommand('justifyLeft');
		return this;
	}

	alignCenter() {
		this.execCommand('justifyCenter');
		return this;
	}

	alignRight() {
		this.execCommand('justifyRight');
		return this;
	}

	alignJustify() {
		this.execCommand('justifyFull');
		return this;
	}

	/*
		Public Methods - Text Color
	*/
	setTextColor(color) {
		this.execCommand('foreColor', color);
		return this;
	}

	removeTextColor() {
		this.execCommand('removeFormat');
		return this;
	}

	setTextBackgroundColor(color) {
		this.execCommand('backColor', color);
		return this;
	}

	removeTextBackgroundColor() {
		const selection = this.shadowRoot.getSelection();
		if(!selection || selection.rangeCount === 0) return this;

		const range = selection.getRangeAt(0);
		if(range.collapsed) return this;

		const fragment = range.extractContents();
		const walker = document.createTreeWalker(
			fragment,
			NodeFilter.SHOW_ELEMENT,
			null
		);

		const removeBackground = (el) => {
			if(el.style){
				el.style.backgroundColor = '';
				if(!el.style.cssText){
					el.removeAttribute('style');
				}
			}
		};

		let node;
		while(node = walker.nextNode()){
			removeBackground(node);
		}

		removeBackground(fragment.firstChild);
		range.insertNode(fragment);
		
		this.editorEl.dispatchEvent(new Event('input', {bubbles: true}));
		return this;
	}

	/*
		Public Methods - Formatting Control
	*/
	removeFormat() {
		if(this.mode !== 'visual') return this;
		
		// If there's a selection, use the standard removeFormat command
		if(this.selection){
			this.execCommand('removeFormat');
			return this;
		}
		
		// No selection - check if cursor is inside a formatting tag
		const sel = this.shadowRoot.getSelection() || window.getSelection();
		if(!sel.rangeCount) return this;
		
		let node = sel.getRangeAt(0).startContainer;
		if(node.nodeType === Node.TEXT_NODE){
			node = node.parentElement;
		}
		
		// Find the closest formatting element
		const formattingTags = ['B', 'I', 'U', 'S', 'STRONG', 'EM', 'CODE', 'MARK', 'SUB', 'SUP', 'SPAN'];
		const formattingElement = node.closest(formattingTags.map(tag => tag.toLowerCase()).join(','));
		
		if(formattingElement && this.editorEl.contains(formattingElement)){
			// Get the text content
			const textContent = formattingElement.textContent;
			
			// Create a text node to replace the formatting element
			const textNode = document.createTextNode(textContent);
			formattingElement.replaceWith(textNode);
			
			// Place cursor at the end of the text
			const range = document.createRange();
			range.setStart(textNode, textContent.length);
			range.setEnd(textNode, textContent.length);
			sel.removeAllRanges();
			sel.addRange(range);
			
			// Update value
			this.value = this.editorEl.innerHTML;
		}
		
		return this;
	}

	formatBlock(tag) {
		this.execCommand('formatBlock', tag);
		return this;
	}

	insertHTML(html) {
		this.execCommand('insertHTML', html);
		return this;
	}

	/**
	 * Insert or edit a table at the cursor position
	 * @param {number} rows - Number of rows (excluding header row if includeHeaders is true)
	 * @param {number} columns - Number of columns
	 * @param {boolean} includeHeaders - Whether to include a header row
	 * @param {Array<Array<string>>|null} cellData - Optional 2D array of cell contents for editing existing tables
	 * @returns {HtmlEditor} Returns this for chaining
	 */
	insertTable(rows, columns, includeHeaders = false, cellData = null) {
		if(this.mode !== 'visual') return this;
		
		const CURSOR_MARKER = '\uFFF0';
		const markerData = this.getValueWithSelectionMarkers();
		let html = markerData.html;
		
		// Create table element
		const table = document.createElement('table');
		table.style.cssText = 'border-collapse: collapse; width: 100%;';
		
		// Create header if needed
		if(includeHeaders){
			const thead = document.createElement('thead');
			const headerRow = document.createElement('tr');
			
			for(let c = 0; c < columns; c++){
				const th = document.createElement('th');
				th.style.cssText = 'border: 1px solid var(--border-color, #ccc); padding: 0.5rem; text-align: left; background-color: var(--background-secondary, #f5f5f5);';
				
				if(cellData && cellData[0] && cellData[0][c] !== undefined){
					th.innerHTML = cellData[0][c];
				} else {
					th.innerHTML = `Header ${c + 1}`;
				}
				
				headerRow.appendChild(th);
			}
			
			thead.appendChild(headerRow);
			table.appendChild(thead);
		}
		
		// Create body rows
		const tbody = document.createElement('tbody');
		const startRow = includeHeaders && cellData ? 1 : 0;
		const dataStartRow = includeHeaders ? 1 : 0;
		
		for(let r = 0; r < rows; r++){
			const row = document.createElement('tr');
			
			for(let c = 0; c < columns; c++){
				const td = document.createElement('td');
				td.style.cssText = 'border: 1px solid var(--border-color, #ccc); padding: 0.5rem;';
				
				if(cellData && cellData[r + dataStartRow] && cellData[r + dataStartRow][c] !== undefined){
					td.innerHTML = cellData[r + dataStartRow][c];
				} else {
					td.innerHTML = '\u200B';
				}
				
				row.appendChild(td);
			}
			
			tbody.appendChild(row);
		}
		
		table.appendChild(tbody);
		
		// Convert to HTML
		const tempDiv = document.createElement('div');
		tempDiv.appendChild(table);
		const tableHTML = tempDiv.innerHTML;
		
		const pAfter = document.createElement('p');
		pAfter.innerHTML = '<br>';
		const fullHTML = tableHTML + pAfter.outerHTML;
		
		// Insert or append table
		if(markerData.hasCursor){
			html = html.replace(CURSOR_MARKER, fullHTML + CURSOR_MARKER);
		} else if(markerData.hasSelection){
			// Replace selection with table
			html = html.replace(markerData.selectionStart, '').replace(markerData.selectionEnd, '');
			html = html + fullHTML;
		} else {
			// No cursor or selection - append to end
			html = html + fullHTML;
		}
		
		// Restore cursor position after table
		const markers = {
			hasCursor: markerData.hasCursor,
			hasSelection: false,
			cursorMarker: CURSOR_MARKER
		};
		
		this.setValueFromSelectionMarkers(html, markers);
		
		return this;
	}

	insertElementAtCursor(element, selectAfter = true) {
		if(this.mode !== 'visual') return this;
		
		const CURSOR_MARKER = '\uFFF0';
		const SELECT_START = '\uFFF1';
		const SELECT_END = '\uFFF2';
		
		const markerData = this.getValueWithSelectionMarkers();
		let html = markerData.html;
		
		if(selectAfter){
			element.textContent = SELECT_START + (element.textContent || '') + SELECT_END;
		}
		const elementHtml = element.outerHTML;
		
		if(markerData.hasCursor){
			html = html.replace(CURSOR_MARKER, elementHtml);
		} else {
			// No cursor - append at the very end of content
			// Wrap inline elements in a paragraph
			const inlineElements = ['code', 'a', 'span', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'sub', 'sup'];
			const tagName = element.tagName.toLowerCase();
			
			if(inlineElements.includes(tagName)){
				html = html + '<p>' + elementHtml + '</p>';
			} else {
				html = html + elementHtml;
			}
		}
		
		const markers = {
			hasCursor: false,
			hasSelection: selectAfter,
			selectionStart: SELECT_START,
			selectionEnd: SELECT_END,
			selectedText: element.textContent || ''
		};
		
		this.setValueFromSelectionMarkers(html, markers);
		
		return this;
	}

	replaceSelectionWithElement(element, selectAfter = true) {
		if(this.mode !== 'visual') return this;
		
		const SELECT_START = '\uFFF1';
		const SELECT_END = '\uFFF2';
		
		const markerData = this.getValueWithSelectionMarkers();
		
		if(!markerData.hasSelection) return this;
		
		let html = markerData.html;
		
		if(selectAfter){
			element.textContent = SELECT_START + element.textContent + SELECT_END;
		}
		const elementHtml = element.outerHTML;
		
		const selectedPattern = SELECT_START + markerData.selectedText + SELECT_END;
		html = html.replace(selectedPattern, elementHtml);
		
		const markers = {
			hasCursor: false,
			hasSelection: selectAfter,
			selectionStart: SELECT_START,
			selectionEnd: SELECT_END,
			selectedText: markerData.selectedText
		};
		
		this.setValueFromSelectionMarkers(html, markers);
		
		return this;
	}

	/*
		Public Methods - Selection Management
	*/
	getSelection() {
		if(this.mode !== 'visual') return null;
		
		this.editorEl.focus();
		const selection = window.getSelection();
		
		if(!selection.rangeCount) return null;

		const range = selection.getRangeAt(0);
		const isInEditor = this.editorEl.contains(range.commonAncestorContainer);
		
		if(!isInEditor) return null;

		return {
			text: selection.toString(),
			html: range.cloneContents().textContent ? new XMLSerializer().serializeToString(range.cloneContents()) : '',
			range: range,
			selection: selection
		};
	}

	getSelectedText() {
		const sel = this.getSelection();
		return sel ? sel.text : '';
	}

	getSelectedHTML() {
		const sel = this.getSelection();
		return sel ? sel.html : '';
	}

	setSelection(startNode, startOffset, endNode, endOffset) {
		if(this.mode !== 'visual') return this;

		this.editorEl.focus();
		const selection = window.getSelection();
		const range = document.createRange();
		
		range.setStart(startNode, startOffset);
		range.setEnd(endNode, endOffset);
		
		selection.removeAllRanges();
		selection.addRange(range);
		
		return this;
	}

	selectAll() {
		if(this.mode === 'visual'){
			this.execCommand('selectAll');
		} else {
			this.textareaEl.select();
		}
		return this;
	}

	replaceSelection(html) {
		if(this.mode !== 'visual') return this;
		
		const sel = this.getSelection();
		if(!sel) return this;

		sel.range.deleteContents();
		const fragment = sel.range.createContextualFragment(html);
		sel.range.insertNode(fragment);
		
		this.value = this.editorEl.innerHTML;
		return this;
	}

	deleteSelection() {
		if(this.mode === 'visual'){
			this.execCommand('delete');
		} else {
			const start = this.textareaEl.selectionStart;
			const end = this.textareaEl.selectionEnd;
			this.textareaEl.value = this.textareaEl.value.substring(0, start) + this.textareaEl.value.substring(end);
			this.value = this.textareaEl.value;
		}
		return this;
	}

	getTextPosition(root, targetNode){
		const walker = document.createTreeWalker(
			root,
			NodeFilter.SHOW_TEXT,
			null
		);
		
		let position = 0;
		
		while(walker.nextNode()){
			const node = walker.currentNode;
			
			if(targetNode.contains(node)){
				return position;
			}
			
			position += node.textContent.length;
		}
		
		return position;
	}

	wrapSelection(before, after, savedSelection = null){
		if(this.mode !== 'visual') return this;
		
		let selectedText;
		
		if(savedSelection){
			selectedText = savedSelection;
		} else {
			const selection = window.getSelection();
			
			if(!selection.rangeCount || selection.isCollapsed){
				return this;
			}
			
			const range = selection.getRangeAt(0);
			const isInEditor = this.editorEl.contains(range.commonAncestorContainer);
			
			if(!isInEditor){
				return this;
			}
			
			selectedText = selection.toString();
		}
		
		if(!selectedText) return this;
		
		this.editorEl.focus();
		
		const openingTagMatch = before.match(/<([a-zA-Z]+)/);
		if(!openingTagMatch) return this;
		const outerTagName = openingTagMatch[1];
		
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = this.getValue();
		
		const textContent = tempDiv.textContent;
		const textIndex = textContent.indexOf(selectedText);
		
		if(textIndex === -1) return this;
		
		const walker = document.createTreeWalker(
			tempDiv,
			NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
			null
		);
		
		let currentPos = 0;
		let startNode = null;
		let startOffset = 0;
		let endNode = null;
		let endOffset = 0;
		const overlappingWrappers = [];
		
		while(walker.nextNode()){
			const node = walker.currentNode;
			
			if(node.nodeType === Node.ELEMENT_NODE){
				if(node.tagName.toLowerCase() === outerTagName){
					const nodeTextStart = this.getTextPosition(tempDiv, node);
					const nodeTextEnd = nodeTextStart + node.textContent.length;
					
					const selectionEnd = textIndex + selectedText.length;
					const overlaps = !(nodeTextEnd <= textIndex || nodeTextStart >= selectionEnd);
					
					if(overlaps){
						overlappingWrappers.push(node);
					}
				}
				continue;
			}
			
			const nodeLength = node.textContent.length;
			const nodeStart = currentPos;
			const nodeEnd = currentPos + nodeLength;
			
			if(!startNode && nodeEnd > textIndex){
				startNode = node;
				startOffset = textIndex - nodeStart;
			}
			
			if(nodeEnd >= textIndex + selectedText.length){
				endNode = node;
				endOffset = (textIndex + selectedText.length) - nodeStart;
				break;
			}
			
			currentPos += nodeLength;
		}
		
		if(overlappingWrappers.length > 0){
			overlappingWrappers.forEach(wrapper => {
				const parent = wrapper.parentNode;
				const isPreTag = wrapper.tagName.toLowerCase() === 'pre';
				
				const allTags = [];
				const collectTags = (el) => {
					allTags.push(el);
					Array.from(el.children).forEach(child => collectTags(child));
				};
				collectTags(wrapper);
				
				if(isPreTag){
					const p = document.createElement('p');
					while(wrapper.firstChild){
						p.appendChild(wrapper.firstChild);
					}
					parent.replaceChild(p, wrapper);
				} else {
					allTags.reverse().forEach(tag => {
						if(tag.parentNode){
							while(tag.firstChild){
								tag.parentNode.insertBefore(tag.firstChild, tag);
							}
							tag.parentNode.removeChild(tag);
						}
					});
				}
			});
		} else if(startNode && endNode){
			const range = document.createRange();
			range.setStart(startNode, startOffset);
			range.setEnd(endNode, endOffset);
			
			const fragment = range.extractContents();
			
			const wrapperDiv = document.createElement('div');
			wrapperDiv.innerHTML = before + after;
			const wrapper = wrapperDiv.firstChild;
			
			let innermost = wrapper;
			while(innermost.firstChild && innermost.firstChild.nodeType === Node.ELEMENT_NODE){
				innermost = innermost.firstChild;
			}
			
			innermost.appendChild(fragment);
			range.insertNode(wrapper);
			
			if(outerTagName === 'pre'){
				let parent = wrapper.parentNode;
				while(parent && parent !== tempDiv){
					if(parent.tagName && parent.tagName.toLowerCase() === 'p'){
						const afterContent = [];
						let sibling = wrapper.nextSibling;
						while(sibling){
							const next = sibling.nextSibling;
							afterContent.push(sibling);
							sibling = next;
						}
						
						parent.parentNode.insertBefore(wrapper, parent.nextSibling);
						
						if(afterContent.length > 0 && afterContent.some(n => n.textContent.trim())){
							const newP = document.createElement('p');
							afterContent.forEach(node => newP.appendChild(node));
							wrapper.parentNode.insertBefore(newP, wrapper.nextSibling);
						}
						
						break;
					}
					parent = parent.parentNode;
				}
			}
		}
		
		this.setValue(tempDiv.innerHTML);
		
		this.editorEl.focus();
		
		setTimeout(() => {
			const textContent = this.editorEl.textContent;
			const textIndex = textContent.indexOf(selectedText);
			
			if(textIndex === -1) return;
			
			const walker = document.createTreeWalker(
				this.editorEl,
				NodeFilter.SHOW_TEXT,
				null
			);
			
			let currentPos = 0;
			let startNode = null;
			let startOffset = 0;
			let endNode = null;
			let endOffset = 0;
			
			while(walker.nextNode()){
				const node = walker.currentNode;
				const nodeLength = node.textContent.length;
				const nodeStart = currentPos;
				const nodeEnd = currentPos + nodeLength;
				
				if(startNode === null && nodeEnd > textIndex){
					startNode = node;
					startOffset = textIndex - nodeStart;
				}
				
				if(nodeEnd >= textIndex + selectedText.length){
					endNode = node;
					endOffset = (textIndex + selectedText.length) - nodeStart;
					break;
				}
				
				currentPos += nodeLength;
			}
			
			if(startNode && endNode){
				const range = document.createRange();
				range.setStart(startNode, startOffset);
				range.setEnd(endNode, endOffset);
				
				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}, 0);
		
		return this;
	}

	insertAtCursor(html) {
		this.insertHTML(html);
		return this;
	}

	/*
		Public Methods - Links and Media
	*/
	createLink(url) {
		this.execCommand('createLink', url);
		return this;
	}

	unlink() {
		this.execCommand('unlink');
		return this;
	}

	insertImage(url) {
		this.execCommand('insertImage', url);
		return this;
	}

	/*
		Public Methods - History
	*/
	undo() {
		this.execCommand('undo');
		return this;
	}

	redo() {
		this.execCommand('redo');
		return this;
	}

	/*
		Utility Methods
	*/
	execCommand(command, value = null) {
		if(this.mode !== 'visual') return;
		
		this.editorEl.focus();
		document.execCommand(command, false, value);
		this.value = this.editorEl.innerHTML;
	}

	captureSelection(){
		if(this.mode !== 'visual') return null;
		
		const selection = window.getSelection();
		
		if(!selection.rangeCount){
			return null;
		}
		
		const range = selection.getRangeAt(0);
		const isInEditor = this.editorEl.contains(range.commonAncestorContainer);
		
		if(!isInEditor){
			return null;
		}
		
		const selectedText = range.toString();
		
		if(range.collapsed){
			return null;
		}
		
		return {
			startContainer: range.startContainer,
			startOffset: range.startOffset,
			endContainer: range.endContainer,
			endOffset: range.endOffset,
			text: selectedText,
			collapsed: range.collapsed
		};
	}

	restoreSavedSelection(){
		if(!this.savedSelection) return false;
		
		const selection = this.shadowRoot.getSelection() || window.getSelection();
		const range = document.createRange();
		
		try {
			range.setStart(this.savedSelection.startContainer, this.savedSelection.startOffset);
			range.setEnd(this.savedSelection.endContainer, this.savedSelection.endOffset);
			selection.removeAllRanges();
			selection.addRange(range);
			return true;
		} catch(e) {
			this.savedSelection = null;
			return false;
		}
	}

	clearSavedSelection(){
		this.savedSelection = null;
	}

	getValueWithSelectionMarkers(){
		if(this.mode !== 'visual') return { html: this.value, hasCursor: false, hasSelection: false };
		
		const CURSOR_MARKER = '\uFFF0';
		const SELECTION_START = '\uFFF1';
		const SELECTION_END = '\uFFF2';
		
		const selection = this.shadowRoot.getSelection() || window.getSelection();
		
		// If no current selection, try to restore saved selection
		if(!selection.rangeCount){
			if(!this.restoreSavedSelection()){
				return { html: this.editorEl.innerHTML, hasCursor: false, hasSelection: false };
			}
		}
		
		if(!selection.rangeCount){
			return { html: this.editorEl.innerHTML, hasCursor: false, hasSelection: false };
		}
		
		const range = selection.getRangeAt(0);
		const isInEditor = this.editorEl.contains(range.commonAncestorContainer);
		
		if(!isInEditor){
			return { html: this.editorEl.innerHTML, hasCursor: false, hasSelection: false };
		}
		
		const selectedText = range.toString();
		
		if(range.collapsed){
			const cursorMarker = document.createTextNode(CURSOR_MARKER);
			const tempRange = document.createRange();
			tempRange.setStart(range.startContainer, range.startOffset);
			tempRange.insertNode(cursorMarker);
			
			const htmlWithMarker = this.editorEl.innerHTML;
			cursorMarker.remove();
			
			return {
				html: htmlWithMarker,
				hasCursor: true,
				hasSelection: false,
				cursorMarker: CURSOR_MARKER,
				selectedText: ''
			};
		} else {
			const startMarker = document.createTextNode(SELECTION_START);
			const endMarker = document.createTextNode(SELECTION_END);
			
			const tempRange = document.createRange();
			tempRange.setStart(range.endContainer, range.endOffset);
			tempRange.insertNode(endMarker);
			
			tempRange.setStart(range.startContainer, range.startOffset);
			tempRange.insertNode(startMarker);
			
			const htmlWithMarkers = this.editorEl.innerHTML;
			
			startMarker.remove();
			endMarker.remove();
			
			return {
				html: htmlWithMarkers,
				hasCursor: false,
				hasSelection: true,
				selectionStart: SELECTION_START,
				selectionEnd: SELECTION_END,
				selectedText: selectedText
			};
		}
	}

	setValueFromSelectionMarkers(html, markers){
		if(this.mode !== 'visual') return this;
		
		const CURSOR_MARKER = markers.cursorMarker || '\uFFF0';
		const SELECTION_START = markers.selectionStart || '\uFFF1';
		const SELECTION_END = markers.selectionEnd || '\uFFF2';
		
		this.editorEl.innerHTML = html;
		
		if(markers.hasCursor){
			const walker = document.createTreeWalker(
				this.editorEl,
				NodeFilter.SHOW_TEXT,
				null
			);
			
			while(walker.nextNode()){
				const node = walker.currentNode;
				const index = node.textContent.indexOf(CURSOR_MARKER);
				
				if(index !== -1){
					node.textContent = node.textContent.replace(CURSOR_MARKER, '');
					
					const range = document.createRange();
					range.setStart(node, index);
					range.setEnd(node, index);
					
					const selection = this.shadowRoot.getSelection() || window.getSelection();
					selection.removeAllRanges();
					selection.addRange(range);
					
					break;
				}
			}
		} else if(markers.hasSelection){
			const walker = document.createTreeWalker(
				this.editorEl,
				NodeFilter.SHOW_TEXT,
				null
			);
			
			let startNode = null;
			let startOffset = 0;
			let endNode = null;
			let endOffset = 0;
			
			while(walker.nextNode()){
				const node = walker.currentNode;
				
				const startIndex = node.textContent.indexOf(SELECTION_START);
				if(startIndex !== -1){
					startNode = node;
					startOffset = startIndex;
					node.textContent = node.textContent.replace(SELECTION_START, '');
				}
				
				const endIndex = node.textContent.indexOf(SELECTION_END);
				if(endIndex !== -1){
					endNode = node;
					endOffset = endIndex;
					node.textContent = node.textContent.replace(SELECTION_END, '');
				}
				
				if(startNode && endNode) break;
			}
			
			if(startNode && endNode){
				const range = document.createRange();
				range.setStart(startNode, startOffset);
				range.setEnd(endNode, endOffset);
				
				const selection = this.shadowRoot.getSelection() || window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
		
		this.editorEl.focus();
		
		return this;
	}

	syncContent() {
		if(!this.editorEl || !this.textareaEl || this.skipSync) return;

		if(this.mode === 'visual'){
			if(this.editorEl.innerHTML !== this.value){
				this.editorEl.innerHTML = this.value;
			}
		} else {
			const formattedValue = formatCode(this.value);
			if(this.textareaEl.value !== formattedValue){
				this.textareaEl.value = formattedValue;
			}
		}
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

		.editor,
		textarea {
			width: 100%;
			height: 100%;
			padding: 1rem;
			border: 1px solid var(--border-color);
			background: var(--bg-primary);
			color: var(--text-primary);
			font-family: inherit;
			font-size: inherit;
			line-height: 1.5;
			overflow: auto;
			box-sizing: border-box;
		}

		.editor {
			outline: none;
		}

		.editor:focus {
			border-color: var(--primary-color);
		}

		textarea {
			resize: none;
			font-family: monospace;
		}

		textarea:focus {
			outline: none;
			border-color: var(--primary-color);
		}

		.editor[hidden],
		textarea[hidden] {
			display: none;
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
					class="editor" 
					contenteditable="true"
					?hidden=${this.mode !== 'visual'}
					@input=${this.handleEditorInput}
					@paste=${this.handleEditorPaste}
					@blur=${this.handleEditorBlur}
				></div>
				
				<textarea
					?hidden=${this.mode !== 'code'}
					@input=${this.handleTextareaInput}
				></textarea>
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
