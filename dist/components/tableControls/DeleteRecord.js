import e from"./TableControl.js";import{html as t}from"../../lit-all.min.js";import"../Icon.js";export default class o extends e{delete=()=>{this.record&&this.table.deleteRecord(this.record)};render(){return t`
			<button class="no-btn icon-btn" @click="${this.delete}">
				<slot>
					<k-icon name="delete"></k-icon>
				</slot>
			</button>
		`}}customElements.define("k-tc-delete-record",o);