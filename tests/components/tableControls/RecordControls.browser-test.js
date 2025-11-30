import '../../../src/components/tableControls/DeleteRecord.js';
import '../../../src/components/tableControls/Edit.js';
import '../../../src/components/tableControls/Hide.js';
import '../../../src/components/tableControls/ShowAll.js';
import '../../../src/components/Table.js';

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
		DeleteRecord Tests
	*/
	'DeleteRecord: should render delete button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-delete-record');
		
		const btn = control.shadowRoot.querySelector('button');
		if(!btn){
			cleanup(container);
			fail('DeleteRecord should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="delete"]');
		if(!icon){
			cleanup(container);
			fail('DeleteRecord should have delete icon');
			return;
		}
		
		cleanup(container);
		pass('DeleteRecord renders correctly');
	},

	'DeleteRecord: should have delete method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-delete-record');
		
		if(typeof control.delete !== 'function'){
			cleanup(container);
			fail('DeleteRecord should have delete method');
			return;
		}
		
		cleanup(container);
		pass('DeleteRecord has delete method');
	},

	'DeleteRecord: should use slot for custom content': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-table>
				<div slot="controls">
					<k-tc-delete-record><span class="custom">Remove</span></k-tc-delete-record>
				</div>
			</k-table>
		`;
		document.body.appendChild(container);
		
		const table = container.querySelector('k-table');
		table.setRecords(sampleRecords.map(r => ({...r})));
		await table.updateComplete;
		
		const control = container.querySelector('k-tc-delete-record');
		await control.updateComplete;
		
		const slot = control.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			fail('DeleteRecord should have slot for custom content');
			return;
		}
		
		cleanup(container);
		pass('DeleteRecord supports custom slot content');
	},

	/*
		Edit Tests
	*/
	'Edit: should render edit button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-edit');
		
		const btn = control.shadowRoot.querySelector('button');
		if(!btn){
			cleanup(container);
			fail('Edit should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="edit"]');
		if(!icon){
			cleanup(container);
			fail('Edit should have edit icon');
			return;
		}
		
		cleanup(container);
		pass('Edit renders correctly');
	},

	'Edit: should have default maxWidth of 80': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-edit');
		
		if(control.maxWidth !== 80){
			cleanup(container);
			fail(`Expected maxWidth 80, got ${control.maxWidth}`);
			return;
		}
		
		cleanup(container);
		pass('Edit has default maxWidth of 80');
	},

	'Edit: should have isEditing property': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-edit');
		
		if(control.isEditing !== undefined && typeof control.isEditing !== 'boolean'){
			cleanup(container);
			fail('isEditing should be boolean or undefined');
			return;
		}
		
		cleanup(container);
		pass('Edit has isEditing property');
	},

	'Edit: should have handleEdit method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-edit');
		
		if(typeof control.handleEdit !== 'function'){
			cleanup(container);
			fail('Edit should have handleEdit method');
			return;
		}
		
		cleanup(container);
		pass('Edit has handleEdit method');
	},

	'Edit: should have handleSave method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-edit');
		
		if(typeof control.handleSave !== 'function'){
			cleanup(container);
			fail('Edit should have handleSave method');
			return;
		}
		
		cleanup(container);
		pass('Edit has handleSave method');
	},

	'Edit: should have handleCancel method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-edit');
		
		if(typeof control.handleCancel !== 'function'){
			cleanup(container);
			fail('Edit should have handleCancel method');
			return;
		}
		
		cleanup(container);
		pass('Edit has handleCancel method');
	},

	'Edit: should show save/cancel buttons when editing': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-edit');
		
		control.isEditing = true;
		await control.updateComplete;
		
		const buttons = control.shadowRoot.querySelectorAll('button');
		if(buttons.length !== 2){
			cleanup(container);
			fail(`Expected 2 buttons in editing mode, got ${buttons.length}`);
			return;
		}
		
		const checkIcon = control.shadowRoot.querySelector('k-icon[name="check"]');
		const closeIcon = control.shadowRoot.querySelector('k-icon[name="close"]');
		
		if(!checkIcon || !closeIcon){
			cleanup(container);
			fail('Should have check and close icons in editing mode');
			return;
		}
		
		cleanup(container);
		pass('Edit shows save/cancel in editing mode');
	},

	/*
		Hide Tests
	*/
	'Hide: should render hide button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-hide');
		
		const btn = control.shadowRoot.querySelector('button');
		if(!btn){
			cleanup(container);
			fail('Hide should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="hide"]');
		if(!icon){
			cleanup(container);
			fail('Hide should have hide icon');
			return;
		}
		
		cleanup(container);
		pass('Hide renders correctly');
	},

	'Hide: should have default maxWidth of 40': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-hide');
		
		if(control.maxWidth !== 40){
			cleanup(container);
			fail(`Expected maxWidth 40, got ${control.maxWidth}`);
			return;
		}
		
		cleanup(container);
		pass('Hide has default maxWidth of 40');
	},

	'Hide: should have handleHide method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-hide');
		
		if(typeof control.handleHide !== 'function'){
			cleanup(container);
			fail('Hide should have handleHide method');
			return;
		}
		
		cleanup(container);
		pass('Hide has handleHide method');
	},

	/*
		ShowAll Tests
	*/
	'ShowAll: should render show all button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-show-all');
		
		const btn = control.shadowRoot.querySelector('button');
		if(!btn){
			cleanup(container);
			fail('ShowAll should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="show"]');
		if(!icon){
			cleanup(container);
			fail('ShowAll should have show icon');
			return;
		}
		
		cleanup(container);
		pass('ShowAll renders correctly');
	},

	'ShowAll: should have default maxWidth of 40': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-show-all');
		
		if(control.maxWidth !== 40){
			cleanup(container);
			fail(`Expected maxWidth 40, got ${control.maxWidth}`);
			return;
		}
		
		cleanup(container);
		pass('ShowAll has default maxWidth of 40');
	},

	'ShowAll: should have handleShowAll method': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('k-tc-show-all');
		
		if(typeof control.handleShowAll !== 'function'){
			cleanup(container);
			fail('ShowAll should have handleShowAll method');
			return;
		}
		
		cleanup(container);
		pass('ShowAll has handleShowAll method');
	},

	'ShowAll: should call table showAllRecords on click': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('k-tc-show-all');
		
		// Hide some records first
		table.hideRecord(table.records[0]);
		table.hideRecord(table.records[1]);
		await table.updateComplete;
		
		let hiddenBefore = table.getHiddenRecords().length;
		if(hiddenBefore !== 2){
			cleanup(container);
			fail(`Expected 2 hidden records, got ${hiddenBefore}`);
			return;
		}
		
		const btn = control.shadowRoot.querySelector('button');
		btn.click();
		await table.updateComplete;
		
		let hiddenAfter = table.getHiddenRecords().length;
		if(hiddenAfter !== 0){
			cleanup(container);
			fail(`Expected 0 hidden records after ShowAll, got ${hiddenAfter}`);
			return;
		}
		
		cleanup(container);
		pass('ShowAll shows all hidden records');
	}
};
