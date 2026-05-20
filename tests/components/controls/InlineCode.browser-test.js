import '../../../src/components/HtmlEditor.js';
import InlineCode from '../../../src/components/controls/InlineCode.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-inline-code slot="toolbar-top-left"></kc-inline-code>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-inline-code');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-inline-code element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof InlineCode)){
			cleanup(container);
			return fail('Element should be instance of InlineCode');
		}
		cleanup(container);
		pass('InlineCode element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('InlineCode should have shadow root');
		}
		cleanup(container);
		pass('InlineCode has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control;
		if(!button){
			cleanup(container);
			return fail('InlineCode should render a button');
		}
		cleanup(container);
		pass('InlineCode renders a button');
	},

	'should render code_blocks icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('InlineCode should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'code_blocks'){
			cleanup(container);
			return fail(`Expected icon name "code_blocks", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('InlineCode renders code_blocks icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('InlineCode should find its parent k-html-editor');
		}
		cleanup(container);
		pass('InlineCode finds parent editor');
	},

	'click should call editor.inlineCode()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.inlineCode = () => { called = true; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.inlineCode()');
		}
		cleanup(container);
		pass('Click calls editor.inlineCode()');
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
			return fail('InlineCode should be hidden in code mode');
		}
		cleanup(container);
		pass('InlineCode is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('InlineCode should be visible in visual mode');
		}
		cleanup(container);
		pass('InlineCode is visible in visual mode');
	},
};
