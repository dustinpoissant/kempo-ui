import '../../../src/components/HtmlEditor.js';
import FormatCode from '../../../src/components/codeEditorControls/FormatCode.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-cec-format-code slot="toolbar-top-right"></k-cec-format-code>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-cec-format-code');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-cec-format-code element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof FormatCode)){
			cleanup(container);
			return fail('Element should be instance of FormatCode');
		}
		cleanup(container);
		pass('FormatCode element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('FormatCode should have shadow root');
		}
		cleanup(container);
		pass('FormatCode has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.mode = 'code';
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			return fail('FormatCode should render a button');
		}
		cleanup(container);
		pass('FormatCode renders a button');
	},

	'should render an icon': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.mode = 'code';
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('FormatCode should render a k-icon');
		}
		cleanup(container);
		pass('FormatCode renders a k-icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('FormatCode should find its parent k-html-editor');
		}
		cleanup(container);
		pass('FormatCode finds parent editor');
	},

	'click should do nothing when no monacoEditor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.mode = 'code';
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await control.updateComplete;
		try {
			control.shadowRoot.querySelector('button').click();
			cleanup(container);
			pass('Click with no monacoEditor does not throw');
		} catch(e) {
			cleanup(container);
			fail(`Click threw an error: ${e.message}`);
		}
	},

	'handleClick should call formatCode on editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		let called = false;
		editor.formatCode = () => { called = true; };
		control.handleClick();
		if(!called){
			cleanup(container);
			return fail('handleClick should call editor.formatCode()');
		}
		cleanup(container);
		pass();
	},

	'handleClick should do nothing when no editor': async ({pass, fail}) => {
		const control = document.createElement('k-cec-format-code');
		document.body.appendChild(control);
		await control.updateComplete;
		try {
			control.handleClick();
			document.body.removeChild(control);
			pass();
		} catch(e) {
			document.body.removeChild(control);
			fail(`handleClick threw when no editor: ${e.message}`);
		}
	},

	/*
		Mode Visibility
	*/
	'should be hidden when HtmlEditor is in visual mode': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		if(!control.hidden){
			cleanup(container);
			return fail('FormatCode should be hidden in visual mode');
		}
		cleanup(container);
		pass('FormatCode is hidden in visual mode');
	},

	'should be visible when HtmlEditor is in code mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.mode = 'code';
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('FormatCode should be visible in code mode');
		}
		cleanup(container);
		pass('FormatCode is visible in code mode');
	}
};
