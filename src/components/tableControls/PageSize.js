import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';

export default class PageSize extends TableControl {
	constructor() {
		super({
			maxWidth: null
		});
		this.pageChangeHandler = () => this.requestUpdate();
		this.pageSizeChangeHandler = () => this.requestUpdate();
	}

	/*
		Lifecycle Callbacks
	*/

	connectedCallback() {
		super.connectedCallback();
		this.onTableEvent('pageChange', this.pageChangeHandler);
		this.onTableEvent('pageSizeChange', this.pageSizeChangeHandler);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.table){
			this.table.removeEventListener('pageChange', this.pageChangeHandler);
			this.table.removeEventListener('pageSizeChange', this.pageSizeChangeHandler);
		}
	}

	/*
		Event Handlers
	*/

	handleChange = e => {
		if(this.table){
			this.table.setPageSize(parseInt(e.target.value));
		}
	};

	/*
		Utility Functions
	*/

	get currentPageSize() {
		return this.table ? this.table.getPageSize() : 10;
	}

	get pageSizeOptions() {
		return this.table ? this.table.pageSizeOptions : [10, 25, 50, 100, 500];
	}

	/*
		Rendering Logic
	*/

	render() {
		return html`
			<select class="no-btn ph b r" @change="${this.handleChange}">
				${this.pageSizeOptions.map(size => 
					html`<option value="${size}" ?selected="${size === this.currentPageSize}">${size} per page</option>`
				)}
			</select>
		`;
	}
}

customElements.define('k-tc-page-size', PageSize);
