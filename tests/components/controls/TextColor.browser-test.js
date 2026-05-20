import '../../../src/components/HtmlEditor.js';
import TextColor from '../../../src/components/controls/TextColor.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-text-color slot="toolbar-top-left"></kc-text-color>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-text-color');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-text-color element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof TextColor)){
			cleanup(container);
			return fail('Element should be instance of TextColor');
		}
		cleanup(container);
		pass('TextColor element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('TextColor should have shadow root');
		}
		cleanup(container);
		pass('TextColor has shadow root');
	},

	'should have default colors': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.colors || control.colors.length === 0){
			cleanup(container);
			return fail('TextColor should have default colors');
		}
		if(!control.colors.includes('#000000')){
			cleanup(container);
			return fail('TextColor default colors should include #000000');
		}
		cleanup(container);
		pass('TextColor has default colors');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('TextColor should find its parent k-html-editor');
		}
		cleanup(container);
		pass('TextColor finds parent editor');
	},

	'handleRemove should call editor.removeTextColor()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		let called = false;
		editor.removeTextColor = () => { called = true; };
		control.handleRemove();
		if(!called){
			cleanup(container);
			return fail('handleRemove should call editor.removeTextColor()');
		}
		cleanup(container);
		pass('handleRemove calls editor.removeTextColor()');
	},

	'handleRemove should close dropdown': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		control.opened = true;
		control.handleRemove();
		if(control.opened){
			cleanup(container);
			return fail('handleRemove should close the dropdown');
		}
		cleanup(container);
		pass('handleRemove closes the dropdown');
	},

	/*
		Properties
	*/
	'disableRemove should default to false': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(control.disableRemove !== false){
			cleanup(container);
			return fail('disableRemove should default to false');
		}
		cleanup(container);
		pass('disableRemove defaults to false');
	},

	'disablePicker should default to false': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(control.disablePicker !== false){
			cleanup(container);
			return fail('disablePicker should default to false');
		}
		cleanup(container);
		pass('disablePicker defaults to false');
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
			return fail('TextColor should be hidden in code mode');
		}
		cleanup(container);
		pass('TextColor is hidden in code mode');
	},
};
