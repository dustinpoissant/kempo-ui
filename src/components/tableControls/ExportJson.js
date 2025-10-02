import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class ExportJson extends TableControl {
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
	export = () => {
		const record = this.record;
		if(record) {
			const data = JSON.stringify(record);
			const blob = new Blob([data], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'data.json';
			a.click();
			URL.revokeObjectURL(url);
		} else {
			const data = JSON.stringify(this.table.records);
			const blob = new Blob([data], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'data.json';
			a.click();
			URL.revokeObjectURL(url);
		}
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="no-btn ph" @click="${this.export}">
				<slot>
					<k-icon name="export-file"></k-icon>
					Export JSON
				</slot>
			</button>
		`;
	}
}

customElements.define('k-tc-export-json', ExportJson);