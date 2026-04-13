import t from"./TableControl.js";import{html as o}from"../../lit-all.min.js";import"../Icon.js";export default class l extends t{constructor(){super({maxWidth:40})}handleShowAll=()=>{this.table&&this.table.showAllRecords()};render(){return o`
			<button class="no-btn icon-btn" @click="${this.handleShowAll}">
				<k-icon name="show"></k-icon>
			</button>
		`}}customElements.define("k-tc-show-all",l);