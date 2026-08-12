import '../../../src/components/controls/TcExportCsv.js';
import '../../../src/components/controls/TcExportJson.js';
import '../../../src/components/Table.js';

const sampleRecords = [
	{ id: 1, name: 'Alice', age: 30, city: 'New York' },
	{ id: 2, name: 'Bob', age: 25, city: 'Los Angeles' },
	{ id: 3, name: 'Charlie', age: 35, city: 'Chicago' }
];

const sampleFields = [
	{ name: 'id', label: 'ID' },
	{ name: 'name', label: 'Name' },
	{ name: 'age', label: 'Age' },
	{ name: 'city', label: 'City' }
];

const createTableWithControl = async (controlTag) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-table>
			<div slot="controls">
				<${controlTag}></${controlTag}>
			</div>
		</k-table>
	`;
	document.body.appendChild(container);
	
	const table = container.querySelector('k-table');
	table.setData({
		fields: [...sampleFields],
		records: sampleRecords.map(r => ({...r}))
	});
	await table.updateComplete;
	
	const control = container.querySelector(controlTag);
	await control.updateComplete;
	
	return { container, table, control };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		ExportCSV Tests
	*/
	'ExportCSV: should render export button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		const btn = control;
		if(!btn){
			cleanup(container);
			fail('ExportCSV should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="export-file"]');
		if(!icon){
			cleanup(container);
			fail('ExportCSV should have export-file icon');
			return;
		}
		
		cleanup(container);
		pass('ExportCSV renders correctly');
	},


	'ExportCSV: should have getCSV method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		if(typeof control.getCSV !== 'function'){
			cleanup(container);
			fail('ExportCSV should have getCSV method');
			return;
		}
		
		cleanup(container);
		pass('ExportCSV has getCSV method');
	},

	'ExportCSV: should have export method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		if(typeof control.export !== 'function'){
			cleanup(container);
			fail('ExportCSV should have export method');
			return;
		}
		
		cleanup(container);
		pass('ExportCSV has export method');
	},

	'ExportCSV: getCSV should return CSV string': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		const csv = control.getCSV();
		
		if(typeof csv !== 'string'){
			cleanup(container);
			fail('getCSV should return a string');
			return;
		}
		
		cleanup(container);
		pass('getCSV returns string');
	},

	'ExportCSV: CSV should have header row': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		const csv = control.getCSV();
		const lines = csv.split('\n');
		const header = lines[0];
		
		if(!header.includes('id') || !header.includes('name')){
			cleanup(container);
			fail('CSV header should contain field names');
			return;
		}
		
		cleanup(container);
		pass('CSV has header row with field names');
	},

	'ExportCSV: CSV should have data rows': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		const csv = control.getCSV();
		const lines = csv.split('\n').filter(l => l.trim());
		
		// 1 header + 3 data rows
		if(lines.length !== 4){
			cleanup(container);
			fail(`Expected 4 lines (1 header + 3 data), got ${lines.length}`);
			return;
		}
		
		cleanup(container);
		pass('CSV has correct number of data rows');
	},

	'ExportCSV: CSV should contain record data': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		const csv = control.getCSV();
		
		if(!csv.includes('Alice') || !csv.includes('Bob') || !csv.includes('Charlie')){
			cleanup(container);
			fail('CSV should contain record data');
			return;
		}
		
		cleanup(container);
		pass('CSV contains record data');
	},

	'ExportCSV: should exclude calculator fields': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-table>
				<div slot="controls">
					<kc-tc-export-csv></kc-tc-export-csv>
				</div>
			</k-table>
		`;
		document.body.appendChild(container);
		
		const table = container.querySelector('k-table');
		table.setData({
			fields: [
				...sampleFields,
				{ name: 'fullInfo', label: 'Full Info', calculator: (record) => `${record.name} (${record.age})` }
			],
			records: sampleRecords.map(r => ({...r}))
		});
		await table.updateComplete;
		
		const control = container.querySelector('kc-tc-export-csv');
		await control.updateComplete;
		
		const csv = control.getCSV();
		const header = csv.split('\n')[0];
		
		if(header.includes('fullInfo')){
			cleanup(container);
			fail('CSV should not include calculator fields');
			return;
		}
		
		cleanup(container);
		pass('CSV excludes calculator fields');
	},

	'ExportCSV: should return empty string without table': async ({pass, fail}) => {
		const control = document.createElement('kc-tc-export-csv');
		document.body.appendChild(control);
		await control.updateComplete;
		
		const csv = control.getCSV();
		
		if(csv !== ''){
			document.body.removeChild(control);
			fail('getCSV should return empty string without table');
			return;
		}
		
		document.body.removeChild(control);
		pass('getCSV returns empty string without table');
	},

	/*
		ExportJson Tests
	*/
	'ExportJson: should render export button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-json');
		
		const btn = control;
		if(!btn){
			cleanup(container);
			fail('ExportJson should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="export-file"]');
		if(!icon){
			cleanup(container);
			fail('ExportJson should have export-file icon');
			return;
		}
		
		cleanup(container);
		pass('ExportJson renders correctly');
	},


	'ExportJson: should have export method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-json');
		
		if(typeof control.export !== 'function'){
			cleanup(container);
			fail('ExportJson should have export method');
			return;
		}
		
		cleanup(container);
		pass('ExportJson has export method');
	},

	'ExportJson: should display Export JSON text': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-json');
		
		const btn = control;
		if(!btn.shadowRoot.textContent.includes('Export JSON')){
			cleanup(container);
			fail('Button should display "Export JSON" text');
			return;
		}
		
		cleanup(container);
		pass('ExportJson displays correct text');
	},

	'ExportCSV: should display Export CSV text': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-export-csv');
		
		const btn = control;
		if(!btn.shadowRoot.textContent.includes('Export CSV')){
			cleanup(container);
			fail('Button should display "Export CSV" text');
			return;
		}
		
		cleanup(container);
		pass('ExportCSV displays correct text');
	}
};
