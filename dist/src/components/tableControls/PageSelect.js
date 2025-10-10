import TableControl from"./TableControl.js";import{html,css}from"../../lit-all.min.js";export default class PageSelect extends TableControl{static properties={...TableControl.properties,currentPage:{type:Number,state:!0},totalPages:{type:Number,state:!0}};constructor(){super({maxWidth:null}),this.currentPage=1,this.totalPages=1}connectedCallback(){super.connectedCallback(),this.onTableEvent("pageChange",this.handlePageChange),this.onTableEvent("pageSizeChange",this.handlePageSizeChange),this.onTableEvent("pageCountChanged",this.handlePageCountChange)}disconnectedCallback(){super.disconnectedCallback(),this.table&&(this.table.removeEventListener("pageChange",this.handlePageChange),this.table.removeEventListener("pageSizeChange",this.handlePageSizeChange),this.table.removeEventListener("pageCountChanged",this.handlePageCountChange))}handlePageChange=()=>{this.table&&(this.currentPage=this.table.getCurrentPage())};handlePageSizeChange=()=>{this.table&&(this.currentPage=this.table.getCurrentPage(),this.totalPages=this.table.getTotalPages())};handlePageCountChange=()=>{this.table&&(this.totalPages=this.table.getTotalPages())};handleSelectChange=e=>{this.table&&this.table.setPage(parseInt(e.target.value))};render(){if(!this.table)return html`<div>No table found</div>`;const e=[];for(let t=1;t<=this.totalPages;t++)e.push(html`<option value="${t}" ?selected="${t===this.currentPage}">Page ${t}</option>`);return html`
			<div class="page-select">
				<select class="no-btn ph b r" @change="${this.handleSelectChange}" ?disabled="${this.totalPages<=1}">
					${e}
				</select>
				<label> out of ${this.totalPages}</label>
			</div>
		`}static styles=css`
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
	`}customElements.define("k-tc-page-select",PageSelect);