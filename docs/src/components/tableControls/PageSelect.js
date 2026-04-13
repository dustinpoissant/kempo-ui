import e from"./TableControl.js";import{html as t,css as a}from"../../lit-all.min.js";export default class l extends e{static properties={...e.properties};constructor(){super({maxWidth:null})}connectedCallback(){super.connectedCallback(),this.onTableEvent("pageChange pageSizeChange pageCountChanged recordsSet",this.handleTableUpdate)}disconnectedCallback(){super.disconnectedCallback(),this.table&&(this.table.removeEventListener("pageChange",this.handleTableUpdate),this.table.removeEventListener("pageSizeChange",this.handleTableUpdate),this.table.removeEventListener("pageCountChanged",this.handleTableUpdate),this.table.removeEventListener("recordsSet",this.handleTableUpdate))}handleTableUpdate=()=>{this.requestUpdate()};handleSelectChange=e=>{this.table&&this.table.setPage(parseInt(e.target.value))};get currentPage(){return this.table?this.table.getCurrentPage():1}get totalPages(){return this.table?this.table.getTotalPages():1}render(){if(!this.table)return t`<div>No table found</div>`;const e=[];for(let a=1;a<=this.totalPages;a++)e.push(t`<option value="${a}" ?selected="${a===this.currentPage}">Page ${a}</option>`);return t`
			<div class="page-select">
				<select class="no-btn ph b r" @change="${this.handleSelectChange}" ?disabled="${this.totalPages<=1}">
					${e}
				</select>
				<label> out of ${this.totalPages}</label>
			</div>
		`}static styles=a`
		${e.styles}
		
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
	`}customElements.define("k-tc-page-select",l);