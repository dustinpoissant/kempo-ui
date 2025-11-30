import TableControl from './TableControl.js';
import { html, css } from '../../lit-all.min.js';

export default class PageSelect extends TableControl {
	static properties = {
		...TableControl.properties
	};

	constructor() {
		super({
			maxWidth: null
		});
	}

	/*
		Lifecycle Callbacks
	*/

	connectedCallback() {
		super.connectedCallback();
		this.onTableEvent('pageChange pageSizeChange pageCountChanged recordsSet', this.handleTableUpdate);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.table){
			this.table.removeEventListener('pageChange', this.handleTableUpdate);
			this.table.removeEventListener('pageSizeChange', this.handleTableUpdate);
			this.table.removeEventListener('pageCountChanged', this.handleTableUpdate);
			this.table.removeEventListener('recordsSet', this.handleTableUpdate);
		}
	}

	/*
		Event Handlers
	*/

	handleTableUpdate = () => {
		this.requestUpdate();
	};

	handleSelectChange = e => {
		if(this.table){
			this.table.setPage(parseInt(e.target.value));
		}
	};

	/*
		Getters
	*/

	get currentPage() {
		return this.table ? this.table.getCurrentPage() : 1;
	}

	get totalPages() {
		return this.table ? this.table.getTotalPages() : 1;
	}

	/*
		Rendering Logic
	*/

	render() {
		if(!this.table){
			return html`<div>No table found</div>`;
		}

		const options = [];
		for(let i = 1; i <= this.totalPages; i++){
			options.push(html`<option value="${i}" ?selected="${i === this.currentPage}">Page ${i}</option>`);
		}
		
		return html`
			<div class="page-select">
				<select class="no-btn ph b r" @change="${this.handleSelectChange}" ?disabled="${this.totalPages <= 1}">
					${options}
				</select>
				<label> out of ${this.totalPages}</label>
			</div>
		`;
	}

	static styles = css`
		${TableControl.styles}
		
		.page-select {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			white-space: nowrap;
		}
		
		label {
			padding: 0;
			margin: 0;
		}
	`;
}

customElements.define('k-tc-page-select', PageSelect);
