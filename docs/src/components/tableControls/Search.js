import e from"./TableControl.js";import{html as r}from"../../lit-all.min.js";import t from"../../utils/debounce.js";export default class s extends e{static properties={searchTerm:{type:String}};constructor(){super({maxWidth:200}),this.debouncedSearch=t(this.performSearch,200)}handleInput=e=>{this.searchTerm=e.target.value,this.debouncedSearch()};performSearch=()=>{this.table&&(!this.searchTerm||this.searchTerm.length<3?this.table.showAllRecords():this.table.search(this.searchTerm))};render(){return r`
			<input
				type="search"
				placeholder="Search"
				class="px pyh"
				.value="${this.searchTerm||""}"
				@input="${this.handleInput}"
			/>
		`}}customElements.define("k-tc-search",s);