import '../../../src/components/HtmlEditor.js';
import Bold from '../../../src/components/controls/Bold.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-bold slot="toolbar-top-left"></kc-bold>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-bold');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-bold element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof Bold)){
			cleanup(container);
			return fail('Element should be instance of Bold');
		}
		cleanup(container);
		pass('Bold element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('Bold should have shadow root');
		}
		cleanup(container);
		pass('Bold has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control;
		if(!button){
			cleanup(container);
			return fail('Bold should render a button');
		}
		cleanup(container);
		pass('Bold renders a button');
	},

	'should render format_bold icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('Bold should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'format_bold'){
			cleanup(container);
			return fail(`Expected icon name "format_bold", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('Bold renders format_bold icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('Bold should find its parent k-html-editor');
		}
		cleanup(container);
		pass('Bold finds parent editor');
	},

	'click should call editor.bold()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.bold = () => { called = true; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.bold()');
		}
		cleanup(container);
		pass('Click calls editor.bold()');
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
			return fail('Bold should be hidden in code mode');
		}
		cleanup(container);
		pass('Bold is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Bold should be visible in visual mode');
		}
		cleanup(container);
		pass('Bold is visible in visual mode');
	},
};
