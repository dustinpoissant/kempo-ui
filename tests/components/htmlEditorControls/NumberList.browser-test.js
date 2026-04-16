import '../../../src/components/HtmlEditor.js';
import NumberList from '../../../src/components/htmlEditorControls/NumberList.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-number-list slot="toolbar-top-left"></k-hec-number-list>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-number-list');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-number-list element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof NumberList)){
			cleanup(container);
			return fail('Element should be instance of NumberList');
		}
		cleanup(container);
		pass('NumberList element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('NumberList should have shadow root');
		}
		cleanup(container);
		pass('NumberList has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			return fail('NumberList should render a button');
		}
		cleanup(container);
		pass('NumberList renders a button');
	},

	'should render format_list_numbered icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('NumberList should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'format_list_numbered'){
			cleanup(container);
			return fail(`Expected icon name "format_list_numbered", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('NumberList renders format_list_numbered icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('NumberList should find its parent k-html-editor');
		}
		cleanup(container);
		pass('NumberList finds parent editor');
	},

	'click should call editor.orderedList()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.orderedList = () => { called = true; };
		control.shadowRoot.querySelector('button').click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.orderedList()');
		}
		cleanup(container);
		pass('Click calls editor.orderedList()');
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
			return fail('NumberList should be hidden in code mode');
		}
		cleanup(container);
		pass('NumberList is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('NumberList should be visible in visual mode');
		}
		cleanup(container);
		pass('NumberList is visible in visual mode');
	},
};
