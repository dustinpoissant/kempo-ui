import '../../../src/components/controls/TcFieldSortHide.js';
import '../../../src/components/Table.js';
import '../../../src/components/Dialog.js';

const sampleRecords = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
	{ id: 3, name: 'Charlie', age: 35 }
];

const sampleFields = [
	{ name: 'id', label: 'ID' },
	{ name: 'name', label: 'Name' },
	{ name: 'age', label: 'Age' }
];

const createTableWithFieldSortHide = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-table>
			<div slot="controls">
				<kc-tc-field-sort-hide></kc-tc-field-sort-hide>
			</div>
		</k-table>
	`;
	document.body.appendChild(container);
	
	const table = container.querySelector('k-table');
	table.setData({
		fields: sampleFields.map(f => ({...f})),
		records: sampleRecords.map(r => ({...r}))
	});
	await table.updateComplete;
	
	const control = container.querySelector('kc-tc-field-sort-hide');
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
	'FieldSortHide: should render button': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		if(!btn){
			cleanup(container);
			fail('FieldSortHide should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="table-visibility"]');
		if(!icon){
			cleanup(container);
			fail('FieldSortHide should have table-visibility icon');
			return;
		}
		
		cleanup(container);
		pass('FieldSortHide renders correctly');
	},


	/*
		Method Tests
	*/
	'FieldSortHide: should have handleClick method': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		if(typeof control.handleClick !== 'function'){
			cleanup(container);
			fail('FieldSortHide should have handleClick method');
			return;
		}
		
		cleanup(container);
		pass('FieldSortHide has handleClick method');
	},

	'FieldSortHide: should have openDialog method': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		if(typeof control.openDialog !== 'function'){
			cleanup(container);
			fail('FieldSortHide should have openDialog method');
			return;
		}
		
		cleanup(container);
		pass('FieldSortHide has openDialog method');
	},

	/*
		Dialog Tests
	*/
	'FieldSortHide: should open dialog on click': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		if(!dialog){
			cleanup(container);
			fail('Dialog should open on button click');
			return;
		}
		
		cleanup(container);
		pass('FieldSortHide opens dialog on click');
	},

	'FieldSortHide: dialog should contain sortable component': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const sortable = dialog.querySelector('k-sortable');
		
		if(!sortable){
			cleanup(container);
			fail('Dialog should contain k-sortable component');
			return;
		}
		
		cleanup(container);
		pass('Dialog contains sortable component');
	},

	'FieldSortHide: dialog should have sortable items for each field': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const items = dialog.querySelectorAll('k-sortable-item');
		
		if(items.length !== 3){
			cleanup(container);
			fail(`Expected 3 sortable items, got ${items.length}`);
			return;
		}
		
		cleanup(container);
		pass('Dialog has sortable item for each field');
	},

	'FieldSortHide: each field should have visibility checkbox': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const checkboxes = dialog.querySelectorAll('.field-visibility');
		
		if(checkboxes.length !== 3){
			cleanup(container);
			fail(`Expected 3 visibility checkboxes, got ${checkboxes.length}`);
			return;
		}
		
		cleanup(container);
		pass('Each field has visibility checkbox');
	},

	'FieldSortHide: checkboxes should be checked for visible fields': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const checkboxes = dialog.querySelectorAll('.field-visibility');
		
		const allChecked = Array.from(checkboxes).every(cb => cb.checked);
		if(!allChecked){
			cleanup(container);
			fail('All checkboxes should be checked for visible fields');
			return;
		}
		
		cleanup(container);
		pass('Checkboxes are checked for visible fields');
	},

	'FieldSortHide: checkbox should be unchecked for hidden fields': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithFieldSortHide();
		
		// Hide a field first
		table.hideField('age');
		await table.updateComplete;
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const ageCheckbox = dialog.querySelector('.field-visibility[data-field="age"]');
		
		if(ageCheckbox.checked){
			cleanup(container);
			fail('Checkbox should be unchecked for hidden field');
			return;
		}
		
		cleanup(container);
		pass('Checkbox unchecked for hidden field');
	},

	'FieldSortHide: sortable items should have data-field attribute': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const items = dialog.querySelectorAll('k-sortable-item');
		
		const fieldValues = Array.from(items).map(i => i.getAttribute('data-field'));
		
		if(!fieldValues.includes('id') || !fieldValues.includes('name') || !fieldValues.includes('age')){
			cleanup(container);
			fail('Sortable items should have correct data-field attributes');
			return;
		}
		
		cleanup(container);
		pass('Sortable items have data-field attributes');
	},

	'FieldSortHide: should display field labels': async ({pass, fail}) => {
		const { container, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const content = dialog.textContent;
		
		if(!content.includes('ID') || !content.includes('Name') || !content.includes('Age')){
			cleanup(container);
			fail('Dialog should display field labels');
			return;
		}
		
		cleanup(container);
		pass('Dialog displays field labels');
	},

	'FieldSortHide: unchecking checkbox should hide field': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithFieldSortHide();
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const ageCheckbox = dialog.querySelector('.field-visibility[data-field="age"]');
		
		ageCheckbox.checked = false;
		ageCheckbox.dispatchEvent(new Event('change'));
		await table.updateComplete;
		
		const ageField = table.fields.find(f => f.name === 'age');
		if(!ageField.hidden){
			cleanup(container);
			fail('Field should be hidden after unchecking');
			return;
		}
		
		cleanup(container);
		pass('Unchecking checkbox hides field');
	},

	'FieldSortHide: checking checkbox should show field': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithFieldSortHide();
		
		// Hide field first
		table.hideField('age');
		await table.updateComplete;
		
		const btn = control;
		btn.click();
		
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const dialog = document.querySelector('k-dialog');
		const ageCheckbox = dialog.querySelector('.field-visibility[data-field="age"]');
		
		ageCheckbox.checked = true;
		ageCheckbox.dispatchEvent(new Event('change'));
		await table.updateComplete;
		
		const ageField = table.fields.find(f => f.name === 'age');
		if(ageField.hidden){
			cleanup(container);
			fail('Field should be shown after checking');
			return;
		}
		
		cleanup(container);
		pass('Checking checkbox shows field');
	}
};
