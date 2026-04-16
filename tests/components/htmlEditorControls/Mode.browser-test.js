import '../../../src/components/HtmlEditor.js';
import Mode from '../../../src/components/htmlEditorControls/Mode.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-mode slot="toolbar-top-right"></k-hec-mode>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-mode');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-mode element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof Mode)){
			cleanup(container);
			return fail('Element should be instance of Mode');
		}
		cleanup(container);
		pass('Mode element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('Mode should have shadow root');
		}
		cleanup(container);
		pass('Mode has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			return fail('Mode should render a button');
		}
		cleanup(container);
		pass('Mode renders a button');
	},

	'should render code icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('Mode should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'code'){
			cleanup(container);
			return fail(`Expected icon name "code", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('Mode renders code icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('Mode should find its parent k-html-editor');
		}
		cleanup(container);
		pass('Mode finds parent editor');
	},

	'click should call editor.toggleMode()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.toggleMode = () => { called = true; };
		control.shadowRoot.querySelector('button').click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.toggleMode()');
		}
		cleanup(container);
		pass('Click calls editor.toggleMode()');
	},

	/*
		Mode Visibility
	*/
	'should NOT hide in code mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.setMode('code');
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Mode should NOT be hidden in code mode');
		}
		cleanup(container);
		pass('Mode is visible in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Mode should be visible in visual mode');
		}
		cleanup(container);
		pass('Mode is visible in visual mode');
	},

	'should track editor mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.mode !== 'visual'){
			cleanup(container);
			return fail(`Expected initial mode "visual", got "${control.mode}"`);
		}
		cleanup(container);
		pass('Mode tracks editor mode');
	},
};
