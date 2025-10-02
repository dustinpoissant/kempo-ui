import TableControl from './TableControl.js';
import { html, css } from '../../lit-all.min.js';

export default class PageSelect extends TableControl {
	static properties = {
		...TableControl.properties,
		currentPage: { type: Number, state: true },
		totalPages: { type: Number, state: true }
	};

	constructor() {
		super({
			maxWidth: null
		});
		this.currentPage = 1;
		this.totalPages = 1;
	}

	/*
		Lifecycle Callbacks
	*/

	connectedCallback() {
		super.connectedCallback();
		this.onTableEvent('pageChange', this.handlePageChange);
		this.onTableEvent('pageSizeChange', this.handlePageSizeChange);
		this.onTableEvent('pageCountChanged', this.handlePageCountChange);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.table){
			this.table.removeEventListener('pageChange', this.handlePageChange);
			this.table.removeEventListener('pageSizeChange', this.handlePageSizeChange);
			this.table.removeEventListener('pageCountChanged', this.handlePageCountChange);
		}
	}

	/*
		Event Handlers
	*/

	handlePageChange = () => {
		if(this.table){
			this.currentPage = this.table.getCurrentPage();
		}
	};

	handlePageSizeChange = () => {
		if(this.table){
			this.currentPage = this.table.getCurrentPage();
			this.totalPages = this.table.getTotalPages();
		}
	};

	handlePageCountChange = () => {
		if(this.table){
			this.totalPages = this.table.getTotalPages();
		}
	};

	handleSelectChange = e => {
		if(this.table){
			this.table.setPage(parseInt(e.target.value));
		}
	};

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
