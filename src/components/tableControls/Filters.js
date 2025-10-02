import TableControl from './TableControl.js';
import { html, render } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

export default class Filters extends TableControl {
	/*
		Constructor
	*/
	constructor() {
		super({ maxWidth: 40 });
	}

	/*
		Event Handlers
	*/
	handleFilter = () => {
		this.openDialog();
	};

	/*
		Methods
	*/
	openDialog = () => {
		const conditionOptions = {
			'equals': 'equals',
			'not-equals': 'does not equal',
			'contains': 'contains',
			'not-contains': 'does not contain',
			'greater-than': 'is greater than',
			'greater-than-or-equal': 'is greater than or equal to',
			'less-than': 'is less than',
			'less-than-or-equal': 'is less than or equal to'
		};

		const dialogContent = document.createElement('div');
		
		render(html`
			<h3 slot="title" class="m0 pyh px">Filters</h3>
			<div class="p">
				${this.table.filters.length === 0 ? html`
					<p>No Current Filters.</p>
				` : html`
					<h5>Current Filters</h5>
					<ul id="currentFilters">
						${this.table.filters.map(({field, condition, value}) => html`
							<li
								data-field="${field}"
								data-condition="${condition}"
								data-value="${value}"
							>
								${field} ${conditionOptions[condition]} ${value}
								<button class="remove-filter no-btn pq" @click="${(e) => {
									this.table.removeFilter(field, condition, value);
									dialog.close();
									this.openDialog();
								}}">
									<k-icon name="close"></k-icon>
								</button>
							</li>
						`)}
					</ul>
				`}
				<hr />
				<h5>Add A Filter</h5>
				<form id="addFilter" @submit="${(e) => {
					e.preventDefault();
					const form = e.target;
					this.table.addFilter(
						form.filterField.value,
						form.filterCondition.value,
						form.filterValue.value
					);
					dialog.close();
					this.openDialog();
				}}">
					<select id="filterField" class="mb">
						${this.table.fields.map(({name, label}) => html`
							<option value="${name}">${label}</option>
						`)}
					</select>
					<select id="filterCondition" class="mb">
						${Object.entries(conditionOptions).map(([key, value]) => html`
							<option value="${key}" ?selected="${key === 'contains'}">${value}</option>
						`)}
					</select>
					<input id="filterValue" type="text" class="mb" />
					<button type="submit" class="btn primary mb mr">Add Filter</button>
					${this.table.filters.length === 0 ? '' : html`
						<button type="button" class="btn danger mb mr" @click="${() => {
							this.table.removeAllFilters();
							dialog.close();
						}}">Clear All Filters</button>
					`}
				</form>
			</div>
		`, dialogContent);

		const dialog = Dialog.create(dialogContent, { width: '600px' });
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="no-btn icon-btn" @click="${this.handleFilter}">
				<k-icon name="filter"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-tc-filters', Filters);
