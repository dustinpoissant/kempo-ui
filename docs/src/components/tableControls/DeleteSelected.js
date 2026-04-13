import e from"./TableControl.js";import{html as t}from"../../lit-all.min.js";import"../Icon.js";export default class l extends e{deleteSelected=()=>{this.table.deleteSelected()};render(){return t`
			<button class="no-btn icon-btn" title="Delete Selected" @click="${this.deleteSelected}">
				<slot>
					<k-icon name="delete_sweep"></k-icon>
				</slot>
			</button>
		`}}customElements.define("k-tc-delete-selected",l);