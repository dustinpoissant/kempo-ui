import HtmlEditorControl from './HtmlEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

export default class InsertTable extends HtmlEditorControl {
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


		const existing = this.editor.getTableAtSelection();
		const isEditing = !!existing;
		const defaultRows = existing?.rows ?? 3;
		const defaultCols = existing?.cols ?? 3;
		const defaultHeaders = existing?.hasHeaders ?? true;
		const cellData = existing?.cellData ?? null;

		// Create dialog inputs
		const rowsInput = document.createElement('input');
		rowsInput.type = 'number';
		rowsInput.min = '1';
		rowsInput.max = '20';
		rowsInput.value = defaultRows.toString();
		rowsInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;';

		const colsInput = document.createElement('input');
		colsInput.type = 'number';
		colsInput.min = '1';
		colsInput.max = '10';
		colsInput.value = defaultCols.toString();
		colsInput.style.cssText = 'padding: 0.5rem; border: 1px solid var(--border-color, #ccc); border-radius: 4px; font-size: 1rem;';

		const headersCheckbox = document.createElement('input');
		headersCheckbox.type = 'checkbox';
		headersCheckbox.checked = defaultHeaders;
		headersCheckbox.id = 'table-headers-checkbox';

		const content = document.createElement('div');
		content.className = 'p';
		content.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
		content.innerHTML = `
			<div style="display: flex; flex-direction: column; gap: 0.5rem;">
				<label style="font-weight: bold;">Rows</label>
			</div>
			<div style="display: flex; flex-direction: column; gap: 0.5rem;">
				<label style="font-weight: bold;">Columns</label>
			</div>
			<div style="display: flex; align-items: center; gap: 0.5rem;">
				<label for="table-headers-checkbox" style="font-weight: bold;">Include Headers</label>
			</div>
		`;
		content.children[0].appendChild(rowsInput);
		content.children[1].appendChild(colsInput);
		content.children[2].insertBefore(headersCheckbox, content.children[2].firstChild);

		Dialog.create(content, {
			title: isEditing ? 'Edit Table' : 'Insert Table',
			cancelText: 'Cancel',
			confirmText: isEditing ? 'Update Table' : 'Insert Table',
			confirmClasses: 'success',
			confirmAction: () => {
				const rows = parseInt(rowsInput.value) || 3;
				const cols = parseInt(colsInput.value) || 3;
				const includeHeaders = headersCheckbox.checked;
				if(isEditing) this.editor.removeTableByKey(existing.key);
				this.editor.insertTable(rows, cols, includeHeaders, cellData);
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
					<k-icon name="table"></k-icon>
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

customElements.define('k-hec-insert-table', InsertTable);
