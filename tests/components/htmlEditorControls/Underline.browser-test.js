import '../../../src/components/HtmlEditor.js';
import Underline from '../../../src/components/htmlEditorControls/Underline.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-underline slot="toolbar-top-left"></k-hec-underline>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-underline');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-underline element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof Underline)){
			cleanup(container);
			return fail('Element should be instance of Underline');
		}
		cleanup(container);
		pass('Underline element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('Underline should have shadow root');
		}
		cleanup(container);
		pass('Underline has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			return fail('Underline should render a button');
		}
		cleanup(container);
		pass('Underline renders a button');
	},

	'should render format_underlined icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('Underline should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'format_underlined'){
			cleanup(container);
			return fail(`Expected icon name "format_underlined", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('Underline renders format_underlined icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('Underline should find its parent k-html-editor');
		}
		cleanup(container);
		pass('Underline finds parent editor');
	},

	'click should call editor.underline()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.underline = () => { called = true; };
		control.shadowRoot.querySelector('button').click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.underline()');
		}
		cleanup(container);
		pass('Click calls editor.underline()');
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
			return fail('Underline should be hidden in code mode');
		}
		cleanup(container);
		pass('Underline is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Underline should be visible in visual mode');
		}
		cleanup(container);
		pass('Underline is visible in visual mode');
	},
};
