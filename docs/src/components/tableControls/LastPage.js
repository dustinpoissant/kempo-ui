import e from"./TableControl.js";import{html as t}from"../../lit-all.min.js";import"../Icon.js";export default class a extends e{constructor(){super(),this.pageChangeHandler=()=>this.requestUpdate()}connectedCallback(){super.connectedCallback(),this.table&&this.table.addEventListener("pageChange",this.pageChangeHandler)}disconnectedCallback(){super.disconnectedCallback(),this.table&&this.table.removeEventListener("pageChange",this.pageChangeHandler)}handleClick=()=>{this.table&&this.table.lastPage()};get isDisabled(){return!this.table||this.table.getCurrentPage()===this.table.getTotalPages()}render(){return t`
			<button 
				class="no-btn icon-btn" 
				?disabled="${this.isDisabled}"
				@click="${this.handleClick}"
			>
				<k-icon name="chevron-line"></k-icon>
			</button>
		`}}customElements.define("k-tc-last-page",a);