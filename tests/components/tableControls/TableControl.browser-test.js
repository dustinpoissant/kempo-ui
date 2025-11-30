import TableControl from '../../../src/components/tableControls/TableControl.js';
import '../../../src/components/Table.js';
import { html } from '../../../src/lit-all.min.js';

class TestTableControl extends TableControl {
	render() {
		return html`<button class="test-btn">Test Control</button>`;
	}
}

customElements.define('test-table-control', TestTableControl);

const sampleRecords = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
	{ id: 3, name: 'Charlie', age: 35 }
];

const createTableWithControl = async (controlHtml = '<test-table-control></test-table-control>') => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-table>
			<div slot="controls">${controlHtml}</div>
		</k-table>
	`;
	document.body.appendChild(container);
	
	const table = container.querySelector('k-table');
	table.setRecords([...sampleRecords]);
	await table.updateComplete;
	
	const control = container.querySelector('test-table-control, k-tc-first-page, k-tc-search');
	if(control) await control.updateComplete;
	
	return { container, table, control };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Constructor Tests
	*/
	'should create with default maxWidth': async ({pass, fail}) => {
		const control = new TestTableControl();
		document.body.appendChild(control);
		await control.updateComplete;
		
		if(control.maxWidth !== 40){
			document.body.removeChild(control);
			fail(`Expected default maxWidth of 40, got ${control.maxWidth}`);
			return;
		}
		
		document.body.removeChild(control);
		pass('TableControl creates with default maxWidth of 40');
	},

	'should accept custom maxWidth in constructor': async ({pass, fail}) => {
		class CustomWidthControl extends TableControl {
			constructor() {
				super({ maxWidth: 100 });
			}
			render() {
				return html`<div>Test</div>`;
			}
		}
		
		if(!customElements.get('custom-width-control')){
			customElements.define('custom-width-control', CustomWidthControl);
		}
		
		const control = new CustomWidthControl();
		document.body.appendChild(control);
		await control.updateComplete;
		
		if(control.maxWidth !== 100){
			document.body.removeChild(control);
			fail(`Expected maxWidth of 100, got ${control.maxWidth}`);
			return;
		}
		
		document.body.removeChild(control);
		pass('TableControl accepts custom maxWidth');
	},

	/*
		Property Tests
	*/
	'should have maxWidth property': async ({pass, fail}) => {
		const control = new TestTableControl();
		document.body.appendChild(control);
		await control.updateComplete;
		
		if(!TableControl.properties.maxWidth){
			document.body.removeChild(control);
			fail('maxWidth should be defined in properties');
			return;
		}
		
		if(TableControl.properties.maxWidth.type !== Number){
			document.body.removeChild(control);
			fail('maxWidth should be of type Number');
			return;
		}
		
		document.body.removeChild(control);
		pass('TableControl has maxWidth property');
	},

	'should reflect maxWidth attribute': async ({pass, fail}) => {
		const control = new TestTableControl();
		control.maxWidth = 80;
		document.body.appendChild(control);
		await control.updateComplete;
		
		if(control.getAttribute('max-width') !== '80'){
			document.body.removeChild(control);
			fail('maxWidth should be reflected as max-width attribute');
			return;
		}
		
		document.body.removeChild(control);
		pass('maxWidth reflects as attribute');
	},

	/*
		CSS Custom Property Tests
	*/
	'should set --max-width CSS property': async ({pass, fail}) => {
		const control = new TestTableControl();
		control.maxWidth = 60;
		document.body.appendChild(control);
		await control.updateComplete;
		
		const cssValue = control.style.getPropertyValue('--max-width');
		if(cssValue !== '60px'){
			document.body.removeChild(control);
			fail(`Expected --max-width to be '60px', got '${cssValue}'`);
			return;
		}
		
		document.body.removeChild(control);
		pass('--max-width CSS property is set correctly');
	},

	'should remove --max-width when maxWidth is null': async ({pass, fail}) => {
		const control = new TestTableControl();
		control.maxWidth = 60;
		document.body.appendChild(control);
		await control.updateComplete;
		
		control.maxWidth = null;
		await control.updateComplete;
		
		const cssValue = control.style.getPropertyValue('--max-width');
		if(cssValue !== ''){
			document.body.removeChild(control);
			fail('--max-width should be removed when maxWidth is null');
			return;
		}
		
		document.body.removeChild(control);
		pass('--max-width CSS property removed when null');
	},

	/*
		Table Getter Tests
	*/
	'should find parent table': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl();
		
		if(!control.table){
			cleanup(container);
			fail('Control should find parent table');
			return;
		}
		
		if(control.table !== table){
			cleanup(container);
			fail('Control should reference correct table');
			return;
		}
		
		cleanup(container);
		pass('table getter finds parent k-table');
	},

	'should return null when no parent table': async ({pass, fail}) => {
		const control = new TestTableControl();
		document.body.appendChild(control);
		await control.updateComplete;
		
		if(control.table !== null){
			document.body.removeChild(control);
			fail('table getter should return null when no parent table');
			return;
		}
		
		document.body.removeChild(control);
		pass('table getter returns null when no parent table');
	},

	/*
		onTableEvent Tests
	*/
	'should register table event listener': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl();
		
		let eventFired = false;
		await control.onTableEvent('pageChange', () => { eventFired = true; });
		
		table.pageSize = 2;
		table.nextPage();
		await table.updateComplete;
		
		if(!eventFired){
			cleanup(container);
			fail('Event handler should be called');
			return;
		}
		
		cleanup(container);
		pass('onTableEvent registers event listener');
	},

	'should handle multiple event names': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl();
		
		let pageChangeCount = 0;
		let pageSizeChangeCount = 0;
		
		await control.onTableEvent('pageChange pageSizeChange', (e) => {
			if(e.type === 'pageChange') pageChangeCount++;
			if(e.type === 'pageSizeChange') pageSizeChangeCount++;
		});
		
		table.setPageSize(2);
		await table.updateComplete;
		table.nextPage();
		await table.updateComplete;
		
		if(pageSizeChangeCount !== 1){
			cleanup(container);
			fail(`Expected 1 pageSizeChange event, got ${pageSizeChangeCount}`);
			return;
		}
		
		if(pageChangeCount !== 1){
			cleanup(container);
			fail(`Expected 1 pageChange event, got ${pageChangeCount}`);
			return;
		}
		
		cleanup(container);
		pass('onTableEvent handles multiple event names');
	},

	/*
		Styles Tests
	*/
	'should have inline-flex display': async ({pass, fail}) => {
		const control = new TestTableControl();
		document.body.appendChild(control);
		await control.updateComplete;
		
		const computedStyle = getComputedStyle(control);
		if(computedStyle.display !== 'inline-flex'){
			document.body.removeChild(control);
			fail(`Expected display inline-flex, got ${computedStyle.display}`);
			return;
		}
		
		document.body.removeChild(control);
		pass('TableControl has inline-flex display');
	},

	/*
		Rendering Tests
	*/
	'should render button with icon-btn class': async ({pass, fail}) => {
		const control = new TestTableControl();
		document.body.appendChild(control);
		await control.updateComplete;
		
		const btn = control.shadowRoot.querySelector('.test-btn');
		if(!btn){
			document.body.removeChild(control);
			fail('Should render test button');
			return;
		}
		
		document.body.removeChild(control);
		pass('TableControl renders content');
	}
};
