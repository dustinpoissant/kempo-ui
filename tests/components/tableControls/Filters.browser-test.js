import '../../../src/components/tableControls/Filters.js';
import '../../../src/components/Table.js';
import '../../../src/components/Dialog.js';

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

const createTableWithFilters = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-table>
			<div slot="controls">
				<k-tc-filters></k-tc-filters>
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
	
	const control = container.querySelector('k-tc-filters');
	await control.updateComplete;
	
	return { container, table, control };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
	// Clean up any dialogs
	document.querySelectorAll('k-dialog').forEach(d => d.remove());
};

export default {
	/*
		Rendering Tests
	*/
	'Filters: should render filter button': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		if(!btn){
			cleanup(container);
			fail('Filters should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="filter"]');
		if(!icon){
			cleanup(container);
			fail('Filters should have filter icon');
			return;
		}
		
		cleanup(container);
		pass('Filters renders correctly');
	},

	'Filters: should have default maxWidth of 40': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		if(control.maxWidth !== 40){
			cleanup(container);
			fail(`Expected maxWidth 40, got ${control.maxWidth}`);
			return;
		}
		
		cleanup(container);
		pass('Filters has default maxWidth of 40');
	},

	/*
		Method Tests
	*/
	'Filters: should have handleFilter method': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		if(typeof control.handleFilter !== 'function'){
			cleanup(container);
			fail('Filters should have handleFilter method');
			return;
		}
		
		cleanup(container);
		pass('Filters has handleFilter method');
	},

	'Filters: should have openDialog method': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		if(typeof control.openDialog !== 'function'){
			cleanup(container);
			fail('Filters should have openDialog method');
			return;
		}
		
		cleanup(container);
		pass('Filters has openDialog method');
	},

	/*
		Dialog Tests
	*/
	'Filters: should open dialog on click': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		if(!dialog){
			cleanup(container);
			fail('Dialog should open on button click');
			return;
		}
		
		cleanup(container);
		pass('Filters opens dialog on click');
	},

	'Filters: dialog should have filter field select': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const filterField = dialog.querySelector('#filterField');
		
		if(!filterField){
			cleanup(container);
			fail('Dialog should have filter field select');
			return;
		}
		
		cleanup(container);
		pass('Dialog has filter field select');
	},

	'Filters: dialog should have condition select': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const conditionSelect = dialog.querySelector('#filterCondition');
		
		if(!conditionSelect){
			cleanup(container);
			fail('Dialog should have filter condition select');
			return;
		}
		
		cleanup(container);
		pass('Dialog has filter condition select');
	},

	'Filters: dialog should have filter value input': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const filterValue = dialog.querySelector('#filterValue');
		
		if(!filterValue){
			cleanup(container);
			fail('Dialog should have filter value input');
			return;
		}
		
		cleanup(container);
		pass('Dialog has filter value input');
	},

	'Filters: dialog should have add filter button': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const addBtn = dialog.querySelector('button[type="submit"]');
		
		if(!addBtn){
			cleanup(container);
			fail('Dialog should have add filter button');
			return;
		}
		
		if(!addBtn.textContent.includes('Add Filter')){
			cleanup(container);
			fail('Add button should say "Add Filter"');
			return;
		}
		
		cleanup(container);
		pass('Dialog has add filter button');
	},

	'Filters: dialog should show "No Current Filters" when empty': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const content = dialog.textContent;
		
		if(!content.includes('No Current Filters')){
			cleanup(container);
			fail('Dialog should show "No Current Filters" when empty');
			return;
		}
		
		cleanup(container);
		pass('Dialog shows "No Current Filters" message');
	},

	'Filters: should have all condition options': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const conditionSelect = dialog.querySelector('#filterCondition');
		const options = conditionSelect.querySelectorAll('option');
		
		const expectedConditions = [
			'equals', 'not-equals', 'contains', 'not-contains',
			'greater-than', 'greater-than-or-equal',
			'less-than', 'less-than-or-equal'
		];
		
		const optionValues = Array.from(options).map(o => o.value);
		
		for(const condition of expectedConditions){
			if(!optionValues.includes(condition)){
				cleanup(container);
				fail(`Missing condition option: ${condition}`);
				return;
			}
		}
		
		cleanup(container);
		pass('Dialog has all condition options');
	},

	'Filters: should show field options from table': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const fieldSelect = dialog.querySelector('#filterField');
		const options = fieldSelect.querySelectorAll('option');
		
		if(options.length !== 4){
			cleanup(container);
			fail(`Expected 4 field options, got ${options.length}`);
			return;
		}
		
		cleanup(container);
		pass('Dialog shows correct field options');
	},

	'Filters: should show current filters when they exist': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithFilters();
		
		// Add a filter first
		table.addFilter('name', 'contains', 'Alice');
		await table.updateComplete;
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const filterList = dialog.querySelector('#currentFilters');
		
		if(!filterList){
			cleanup(container);
			fail('Dialog should show current filters list');
			return;
		}
		
		cleanup(container);
		pass('Dialog shows current filters');
	},

	'Filters: should show clear all button when filters exist': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithFilters();
		
		// Add a filter first
		table.addFilter('name', 'contains', 'Alice');
		await table.updateComplete;
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const clearBtn = Array.from(dialog.querySelectorAll('button')).find(
			b => b.textContent.includes('Clear All')
		);
		
		if(!clearBtn){
			cleanup(container);
			fail('Dialog should have "Clear All Filters" button when filters exist');
			return;
		}
		
		cleanup(container);
		pass('Dialog shows clear all button');
	},

	'Filters: contains should be default condition': async ({pass, fail}) => {
		const { container, control } = await createTableWithFilters();
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const conditionSelect = dialog.querySelector('#filterCondition');
		
		if(conditionSelect.value !== 'contains'){
			cleanup(container);
			fail(`Expected default condition "contains", got "${conditionSelect.value}"`);
			return;
		}
		
		cleanup(container);
		pass('Contains is default condition');
	}
};
