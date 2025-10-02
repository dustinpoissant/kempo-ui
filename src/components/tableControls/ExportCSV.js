import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class ExportCSV extends TableControl {
	/*
		Constructor
	*/
	constructor() {
		super();
		this.maxWidth = 136;
	}

	/*
		Public Methods
	*/
	getCSV() {
		const table = this.table;
		if(!table) return '';

		let csv = '';
		const fields = [];

		table.fields.forEach(({ name, calculator }) => {
			if(!calculator) {
				fields.push(name);
			}
		});

		csv += fields.join(',') + '\n';

		if(this.record) {
			const row = fields.map(field => this.record[field] || '');
			csv += row.join(',') + '\n';
		} else {
			table.records.forEach(record => {
				const row = fields.map(field => record[field] || '');
				csv += row.join(',') + '\n';
			});
		}

		return csv;
	}

	export = () => {
		const data = this.getCSV();
		const blob = new Blob([data], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'data.csv';
		a.click();
		URL.revokeObjectURL(url);
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="no-btn ph" @click="${this.export}">
				<slot>
					<k-icon name="export-file"></k-icon>
					Export CSV
				</slot>
			</button>
		`;
	}
}

customElements.define('k-tc-export-csv', ExportCSV);
