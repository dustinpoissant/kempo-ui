import t from"./TableControl.js";import{html as e,render as l}from"../../lit-all.min.js";import"../Icon.js";import i from"../Dialog.js";export default class n extends t{constructor(){super({maxWidth:40})}handleFilter=()=>{this.openDialog()};openDialog=()=>{const t={equals:"equals","not-equals":"does not equal",contains:"contains","not-contains":"does not contain","greater-than":"is greater than","greater-than-or-equal":"is greater than or equal to","less-than":"is less than","less-than-or-equal":"is less than or equal to"},n=document.createElement("div");l(e`
			<div class="p">
				${0===this.table.filters.length?e`
					<p>No Current Filters.</p>
				`:e`
					<h5>Current Filters</h5>
					<ul id="currentFilters">
						${this.table.filters.map(({field:l,condition:i,value:n})=>e`
							<li
								data-field="${l}"
								data-condition="${i}"
								data-value="${n}"
							>
								${this.table.getFieldLabel(l)} ${t[i]} "${n}"
								<button class="remove-filter no-btn pq" @click="${t=>{this.table.removeFilter(l,i,n),o.close(),this.openDialog()}}">
									<k-icon name="close"></k-icon>
								</button>
							</li>
						`)}
					</ul>
				`}
				<hr />
				<h5>Add A Filter</h5>
				<form id="addFilter" @submit="${t=>{t.preventDefault();const e=t.target;this.table.addFilter(e.filterField.value,e.filterCondition.value,e.filterValue.value),o.close(),this.openDialog()}}">
					<select id="filterField" class="mb">
						${this.table.fields.map(({name:t,label:l})=>e`
							<option value="${t}">${l}</option>
						`)}
					</select>
					<select id="filterCondition" class="mb">
						${Object.entries(t).map(([t,l])=>e`
							<option value="${t}" ?selected="${"contains"===t}">${l}</option>
						`)}
					</select>
					<input id="filterValue" type="text" class="mb" />
					<button type="submit" class="btn primary mb mr">Add Filter</button>
					${0===this.table.filters.length?"":e`
						<button type="button" class="btn danger mb mr" @click="${()=>{this.table.removeAllFilters(),o.close()}}">Clear All Filters</button>
					`}
				</form>
			</div>
		`,n);const o=i.create(n,{width:"600px",title:"Filters"})};render(){return e`
			<button class="no-btn icon-btn" @click="${this.handleFilter}">
				<k-icon name="filter"></k-icon>
			</button>
		`}}customElements.define("k-tc-filters",n);