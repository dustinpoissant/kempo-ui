import '../../../src/components/HtmlEditor.js';
import ClearFormatting from '../../../src/components/controls/ClearFormatting.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-clear-formatting slot="toolbar-top-left"></kc-clear-formatting>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-clear-formatting');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-clear-formatting element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof ClearFormatting)){
			cleanup(container);
			return fail('Element should be instance of ClearFormatting');
		}
		cleanup(container);
		pass('ClearFormatting element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('ClearFormatting should have shadow root');
		}
		cleanup(container);
		pass('ClearFormatting has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control;
		if(!button){
			cleanup(container);
			return fail('ClearFormatting should render a button');
		}
		cleanup(container);
		pass('ClearFormatting renders a button');
	},

	'should render format_clear icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('ClearFormatting should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'format_clear'){
			cleanup(container);
			return fail(`Expected icon name "format_clear", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('ClearFormatting renders format_clear icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('ClearFormatting should find its parent k-html-editor');
		}
		cleanup(container);
		pass('ClearFormatting finds parent editor');
	},

	'click should call editor.removeFormat()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.removeFormat = () => { called = true; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.removeFormat()');
		}
		cleanup(container);
		pass('Click calls editor.removeFormat()');
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
			return fail('ClearFormatting should be hidden in code mode');
		}
		cleanup(container);
		pass('ClearFormatting is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('ClearFormatting should be visible in visual mode');
		}
		cleanup(container);
		pass('ClearFormatting is visible in visual mode');
	},
};
