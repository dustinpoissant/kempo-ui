import '../../../src/components/HtmlEditor.js';
import TextBackgroundColor from '../../../src/components/controls/TextBackgroundColor.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-text-background-color slot="toolbar-top-left"></kc-text-background-color>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-text-background-color');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-text-bg-color element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof TextBackgroundColor)){
			cleanup(container);
			return fail('Element should be instance of TextBackgroundColor');
		}
		cleanup(container);
		pass('TextBackgroundColor element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('TextBackgroundColor should have shadow root');
		}
		cleanup(container);
		pass('TextBackgroundColor has shadow root');
	},

	'should have default colors': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.colors || control.colors.length === 0){
			cleanup(container);
			return fail('TextBackgroundColor should have default colors');
		}
		if(!control.colors.includes('#ffff00')){
			cleanup(container);
			return fail('TextBackgroundColor default colors should include #ffff00');
		}
		cleanup(container);
		pass('TextBackgroundColor has default colors');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('TextBackgroundColor should find its parent k-html-editor');
		}
		cleanup(container);
		pass('TextBackgroundColor finds parent editor');
	},

	'handleRemove should call editor.removeTextBackgroundColor()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		let called = false;
		editor.removeTextBackgroundColor = () => { called = true; };
		control.handleRemove();
		if(!called){
			cleanup(container);
			return fail('handleRemove should call editor.removeTextBackgroundColor()');
		}
		cleanup(container);
		pass('handleRemove calls editor.removeTextBackgroundColor()');
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
			return fail('TextBackgroundColor should be hidden in code mode');
		}
		cleanup(container);
		pass('TextBackgroundColor is hidden in code mode');
	},
};
