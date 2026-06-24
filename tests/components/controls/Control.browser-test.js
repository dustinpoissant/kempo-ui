import Control from '../../../src/components/controls/Control.js';
import '../../../src/components/Table.js';
import { html } from '../../../src/lit-all.min.js';

class TestControl extends Control {
	static requires = ['setRecords'];
	render() {
		return html`<button class="test-btn">Test Control</button>`;
	}
}

if(!customElements.get('test-control-base')){
	customElements.define('test-control-base', TestControl);
}

const sampleRecords = [
	{ id: 1, name: 'Alice', age: 30 },
	{ id: 2, name: 'Bob', age: 25 },
	{ id: 3, name: 'Charlie', age: 35 }
];

const createTableWithControl = async (controlHtml = '<test-control-base></test-control-base>') => {
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
	const control = container.querySelector('test-control-base');
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
		Host Discovery Tests
	*/
	'should find parent host via controlled attribute': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl();
		if(!control.host){
			cleanup(container);
			return fail('Control should find parent host');
		}
		if(control.host !== table){
			cleanup(container);
			return fail('Control should reference correct host');
		}
		cleanup(container);
		pass('host getter finds parent k-table');
	},

	'should return null when no parent host': async ({pass, fail}) => {
		const control = document.createElement('test-control-base');
		document.body.appendChild(control);
		await control.updateComplete;
		if(control.host !== null){
			document.body.removeChild(control);
			return fail('host getter should return null when no parent host');
		}
		document.body.removeChild(control);
		pass('host getter returns null when no parent host');
	},

	/*
		Requires / Host Support Tests
	*/
	'should not be disabled when host has required methods': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl();
		await control.updateComplete;
		if(control.disabled){
			cleanup(container);
			return fail('Control should not be disabled when host has required methods');
		}
		cleanup(container);
		pass('Control enabled when host supports required methods');
	},

	'should be disabled when host missing required methods': async ({pass, fail}) => {
		class StrictControl extends Control {
			static requires = ['nonExistentMethod'];
			render() { return html`<span>test</span>`; }
		}
		if(!customElements.get('test-strict-control')){
			customElements.define('test-strict-control', StrictControl);
		}
		const container = document.createElement('div');
		container.innerHTML = `
			<k-table>
				<div slot="controls"><test-strict-control></test-strict-control></div>
			</k-table>
		`;
		document.body.appendChild(container);
		const table = container.querySelector('k-table');
		table.setRecords([...sampleRecords]);
		await table.updateComplete;
		const control = container.querySelector('test-strict-control');
		await control.updateComplete;
		if(!control.disabled){
			cleanup(container);
			return fail('Control should be disabled when host lacks required methods');
		}
		cleanup(container);
		pass('Control disabled when host missing required methods');
	},

	/*
		Host Method Invocation Tests
	*/
	'should invoke host method directly via host getter': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl();
		const newRecords = [{ id: 99, name: 'Zara', age: 22 }];
		control.host?.setRecords(newRecords);
		await table.updateComplete;
		if(table.records.length !== 1 || table.records[0].name !== 'Zara'){
			cleanup(container);
			return fail('Host method should be callable via control.host');
		}
		cleanup(container);
		pass('Host method invoked correctly via control.host');
	},

	/*
		Rendering Tests
	*/
	'should render content in shadow root': async ({pass, fail}) => {
		const control = document.createElement('test-control-base');
		document.body.appendChild(control);
		await control.updateComplete;
		const btn = control.shadowRoot.querySelector('.test-btn');
		if(!btn){
			document.body.removeChild(control);
			return fail('Should render test button');
		}
		document.body.removeChild(control);
		pass('Control renders content in shadow root');
	}
};
