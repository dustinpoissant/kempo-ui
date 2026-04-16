import '../../../src/components/HtmlEditor.js';
import Strikethrough from '../../../src/components/htmlEditorControls/Strikethrough.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-strikethrough slot="toolbar-top-left"></k-hec-strikethrough>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-strikethrough');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-strikethrough element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof Strikethrough)){
			cleanup(container);
			return fail('Element should be instance of Strikethrough');
		}
		cleanup(container);
		pass('Strikethrough element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('Strikethrough should have shadow root');
		}
		cleanup(container);
		pass('Strikethrough has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			return fail('Strikethrough should render a button');
		}
		cleanup(container);
		pass('Strikethrough renders a button');
	},

	'should render strikethrough_s icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('Strikethrough should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'strikethrough_s'){
			cleanup(container);
			return fail(`Expected icon name "strikethrough_s", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('Strikethrough renders strikethrough_s icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('Strikethrough should find its parent k-html-editor');
		}
		cleanup(container);
		pass('Strikethrough finds parent editor');
	},

	'click should call editor.strikethrough()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.strikethrough = () => { called = true; };
		control.shadowRoot.querySelector('button').click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.strikethrough()');
		}
		cleanup(container);
		pass('Click calls editor.strikethrough()');
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
			return fail('Strikethrough should be hidden in code mode');
		}
		cleanup(container);
		pass('Strikethrough is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Strikethrough should be visible in visual mode');
		}
		cleanup(container);
		pass('Strikethrough is visible in visual mode');
	},
};
