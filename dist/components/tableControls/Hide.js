import t from"./TableControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class o extends t{constructor(){super({maxWidth:40})}handleHide=()=>{this.record&&this.table.hideRecord(this.record)};render(){return e`
			<button class="no-btn icon-btn" @click="${this.handleHide}">
				<k-icon name="hide"></k-icon>
			</button>
		`}}customElements.define("k-tc-hide",o);