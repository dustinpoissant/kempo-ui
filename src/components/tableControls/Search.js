import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';
import debounce from '../../utils/debounce.js';

export default class Search extends TableControl {
	/* Properties */
	static properties = {
		searchTerm: { type: String }
	};

	/*
		Constructor
	*/
	constructor() {
		super({ maxWidth: 200 });
		this.debouncedSearch = debounce(this.performSearch, 200);
	}

	/*
		Event Handlers
	*/
	handleInput = (e) => {
		this.searchTerm = e.target.value;
		this.debouncedSearch();
	};

	/*
		Methods
	*/
	performSearch = () => {
		if(!this.table) return;

		if(!this.searchTerm || this.searchTerm.length < 3){
			this.table.showAllRecords();
		} else {
			this.table.search(this.searchTerm);
		}
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<input
				type="search"
				placeholder="Search"
				class="px pyh"
				.value="${this.searchTerm || ''}"
				@input="${this.handleInput}"
			/>
		`;
	}
}

customElements.define('k-tc-search', Search);
