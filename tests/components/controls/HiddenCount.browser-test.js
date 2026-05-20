import '../../../src/components/controls/TcHiddenCount.js';
import '../../../src/components/Table.js';

const sampleRecords = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
	{ id: 3, name: 'Charlie', age: 35 },
	{ id: 4, name: 'Diana', age: 28 },
	{ id: 5, name: 'Eve', age: 32 }
];

const createTableWithHiddenCount = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-table>
			<div slot="controls">
				<kc-tc-hidden-count></kc-tc-hidden-count>
			</div>
		</k-table>
	`;
	document.body.appendChild(container);
	
	const table = container.querySelector('k-table');
	table.setRecords(sampleRecords.map(r => ({...r})));
	await table.updateComplete;
	
	const control = container.querySelector('kc-tc-hidden-count');
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
		Rendering Tests
	*/
	'HiddenCount: should render hidden count display': async ({pass, fail}) => {
		const { container, control } = await createTableWithHiddenCount();
		
		const content = control.shadowRoot.textContent;
		if(!content.includes('Hidden Records')){
			cleanup(container);
			fail('HiddenCount should display "Hidden Records" text');
			return;
		}
		
		cleanup(container);
		pass('HiddenCount renders correctly');
	},

	'HiddenCount: should show 0 when no records hidden': async ({pass, fail}) => {
		const { container, control } = await createTableWithHiddenCount();
		
		const span = control.shadowRoot.querySelector('span');
		if(!span || span.textContent !== '0'){
			cleanup(container);
			fail('HiddenCount should show 0 when no records hidden');
			return;
		}
		
		cleanup(container);
		pass('HiddenCount shows 0 when no records hidden');
	},

	/*
		Property Tests
	*/
	'HiddenCount: should have hiddenCount property': async ({pass, fail}) => {
		const { container, control } = await createTableWithHiddenCount();
		
		if(typeof control.hiddenCount !== 'number'){
			cleanup(container);
			fail('hiddenCount should be a number');
			return;
		}
		
		cleanup(container);
		pass('HiddenCount has hiddenCount property');
	},

	/*
		Method Tests
	*/
	'HiddenCount: should have updateHiddenCount method': async ({pass, fail}) => {
		const { container, control } = await createTableWithHiddenCount();
		
		if(typeof control.updateHiddenCount !== 'function'){
			cleanup(container);
			fail('HiddenCount should have updateHiddenCount method');
			return;
		}
		
		cleanup(container);
		pass('HiddenCount has updateHiddenCount method');
	},

	'HiddenCount: should have handleHiddenChange method': async ({pass, fail}) => {
		const { container, control } = await createTableWithHiddenCount();
		
		if(typeof control.handleHiddenChange !== 'function'){
			cleanup(container);
			fail('HiddenCount should have handleHiddenChange method');
			return;
		}
		
		cleanup(container);
		pass('HiddenCount has handleHiddenChange method');
	},

	/*
		Update Tests
	*/
	'HiddenCount: should update when record is hidden': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithHiddenCount();
		
		table.hideRecord(table.records[0]);
		await table.updateComplete;
		await control.updateComplete;
		
		if(control.hiddenCount !== 1){
			cleanup(container);
			fail(`Expected hiddenCount 1, got ${control.hiddenCount}`);
			return;
		}
		
		cleanup(container);
		pass('HiddenCount updates when record hidden');
	},

	'HiddenCount: should update display when record is hidden': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithHiddenCount();
		
		table.hideRecord(table.records[0]);
		await table.updateComplete;
		await control.updateComplete;
		
		const span = control.shadowRoot.querySelector('span');
		if(span.textContent !== '1'){
			cleanup(container);
			fail(`Expected display "1", got "${span.textContent}"`);
			return;
		}
		
		cleanup(container);
		pass('HiddenCount display updates when record hidden');
	},

	'HiddenCount: should update when multiple records hidden': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithHiddenCount();
		
		table.hideRecord(table.records[0]);
		table.hideRecord(table.records[1]);
		table.hideRecord(table.records[2]);
		await table.updateComplete;
		await control.updateComplete;
		
		if(control.hiddenCount !== 3){
			cleanup(container);
			fail(`Expected hiddenCount 3, got ${control.hiddenCount}`);
			return;
		}
		
		cleanup(container);
		pass('HiddenCount updates for multiple hidden records');
	},

	'HiddenCount: should update when record is shown': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithHiddenCount();
		
		table.hideRecord(table.records[0]);
		table.hideRecord(table.records[1]);
		await table.updateComplete;
		await control.updateComplete;
		
		table.showRecord(table.records[0]);
		await table.updateComplete;
		await control.updateComplete;
		
		if(control.hiddenCount !== 1){
			cleanup(container);
			fail(`Expected hiddenCount 1 after showing one, got ${control.hiddenCount}`);
			return;
		}
		
		cleanup(container);
		pass('HiddenCount updates when record shown');
	},

	'HiddenCount: should reset to 0 when showAllRecords called': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithHiddenCount();
		
		table.hideRecord(table.records[0]);
		table.hideRecord(table.records[1]);
		table.hideRecord(table.records[2]);
		await table.updateComplete;
		await control.updateComplete;
		
		table.showAllRecords();
		await table.updateComplete;
		await control.updateComplete;
		
		if(control.hiddenCount !== 0){
			cleanup(container);
			fail(`Expected hiddenCount 0 after showAll, got ${control.hiddenCount}`);
			return;
		}
		
		cleanup(container);
		pass('HiddenCount resets when showAllRecords called');
	},

	/*
		Event Listener Tests
	*/
	'HiddenCount: should respond to recordHidden event': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithHiddenCount();
		
		// Wait for event listener to be set up
		await new Promise(resolve => setTimeout(resolve, 50));
		
		table.hideRecord(table.records[0]);
		await table.updateComplete;
		
		// Wait for event to propagate
		await new Promise(resolve => setTimeout(resolve, 50));
		await control.updateComplete;
		
		const span = control.shadowRoot.querySelector('span');
		if(span.textContent !== '1'){
			cleanup(container);
			fail('HiddenCount should respond to recordHidden event');
			return;
		}
		
		cleanup(container);
		pass('HiddenCount responds to recordHidden event');
	},

	/*
		Standalone Tests
	*/
	'HiddenCount: should handle missing table gracefully': async ({pass, fail}) => {
		const control = document.createElement('kc-tc-hidden-count');
		document.body.appendChild(control);
		await control.updateComplete;
		
		// Should not throw and should show 0
		if(control.hiddenCount !== 0){
			document.body.removeChild(control);
			fail('hiddenCount should be 0 without table');
			return;
		}
		
		document.body.removeChild(control);
		pass('HiddenCount handles missing table gracefully');
	}
};
