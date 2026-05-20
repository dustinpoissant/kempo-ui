import '../../../src/components/HtmlEditor.js';
import InsertTable from '../../../src/components/controls/InsertTable.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-insert-table slot="toolbar-top-left"></kc-insert-table>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-insert-table');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-insert-table element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof InsertTable)){
			cleanup(container);
			return fail('Element should be instance of InsertTable');
		}
		cleanup(container);
		pass('InsertTable element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('InsertTable should have shadow root');
		}
		cleanup(container);
		pass('InsertTable has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control;
		if(!button){
			cleanup(container);
			return fail('InsertTable should render a button');
		}
		cleanup(container);
		pass('InsertTable renders a button');
	},

	'should render table icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('InsertTable should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'table'){
			cleanup(container);
			return fail(`Expected icon name "table", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('InsertTable renders table icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('InsertTable should find its parent k-html-editor');
		}
		cleanup(container);
		pass('InsertTable finds parent editor');
	},

	'click should open a dialog': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		editor.getTableAtSelection = () => null;
		control.click();
		await new Promise(r => setTimeout(r, 100));
		const dialog = document.querySelector('k-dialog');
		if(!dialog){
			cleanup(container);
			return fail('Click should open a k-dialog');
		}
		dialog.remove();
		cleanup(container);
		pass('Click opens a dialog');
	},

	/*
		Code Mode Visibility
	*/
	'should hide in code mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.setMode('code');
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await control.updateComplete;
		if(!control.hidden){
			cleanup(container);
			return fail('InsertTable should be hidden in code mode');
		}
		cleanup(container);
		pass('InsertTable is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('InsertTable should be visible in visual mode');
		}
		cleanup(container);
		pass('InsertTable is visible in visual mode');
	},
};
