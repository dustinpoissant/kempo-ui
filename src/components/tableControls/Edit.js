import TableControl from './TableControl.js';
import { html, css } from '../../lit-all.min.js';
import '../Icon.js';

export default class Edit extends TableControl {
	/* Properties */
	static properties = {
		isEditing: { type: Boolean }
	};

	/*
		Styles
	*/
	static styles = [
		TableControl.styles,
		css`
			:host {
				display: inline-flex;
				width: max-content;
				align-items: baseline;
			}
		`
	];

	/*
		Constructor
	*/
	constructor() {
		super({ maxWidth: 80 });
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.onTableEvent('editingChange', this.handleEditingChange);
	}

	/*
		Event Handlers
	*/
	handleEditingChange = (e) => {
		if(e.detail.record === this.record){
			this.isEditing = e.detail.editing;
		}
	};

	handleEdit = () => {
		if(this.record){
			this.table.editRecord(this.record);
		}
	};

	handleSave = () => {
		if(this.record){
			this.table.saveEditedRecord(this.record);
		}
	};

	handleCancel = () => {
		if(this.record){
			this.table.cancelEditedRecord(this.record);
		}
	};

	/*
		Rendering
	*/
	render() {
		return this.isEditing ? html`
			<button class="no-btn icon-btn bg-success" @click="${this.handleSave}">
				<k-icon name="check"></k-icon>
			</button>
			<button class="no-btn icon-btn bg-danger" @click="${this.handleCancel}">
				<k-icon name="close"></k-icon>
			</button>
		` : html`
			<button class="no-btn icon-btn" @click="${this.handleEdit}">
				<k-icon name="edit"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-tc-edit', Edit);
