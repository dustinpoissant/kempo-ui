import '../../../src/components/HtmlEditor.js';
import Italic from '../../../src/components/htmlEditorControls/Italic.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-italic slot="toolbar-top-left"></k-hec-italic>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-italic');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-italic element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof Italic)){
			cleanup(container);
			return fail('Element should be instance of Italic');
		}
		cleanup(container);
		pass('Italic element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('Italic should have shadow root');
		}
		cleanup(container);
		pass('Italic has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			return fail('Italic should render a button');
		}
		cleanup(container);
		pass('Italic renders a button');
	},

	'should render format_italic icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('Italic should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'format_italic'){
			cleanup(container);
			return fail(`Expected icon name "format_italic", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('Italic renders format_italic icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('Italic should find its parent k-html-editor');
		}
		cleanup(container);
		pass('Italic finds parent editor');
	},

	'click should call editor.italic()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.italic = () => { called = true; };
		control.shadowRoot.querySelector('button').click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.italic()');
		}
		cleanup(container);
		pass('Click calls editor.italic()');
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
			return fail('Italic should be hidden in code mode');
		}
		cleanup(container);
		pass('Italic is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Italic should be visible in visual mode');
		}
		cleanup(container);
		pass('Italic is visible in visual mode');
	},
};
