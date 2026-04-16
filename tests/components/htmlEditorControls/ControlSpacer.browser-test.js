import '../../../src/components/HtmlEditor.js';
import ControlSpacer from '../../../src/components/htmlEditorControls/ControlSpacer.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-spacer slot="toolbar-top-left"></k-hec-spacer>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-spacer');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-spacer element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof ControlSpacer)){
			cleanup(container);
			return fail('Element should be instance of ControlSpacer');
		}
		cleanup(container);
		pass('ControlSpacer element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('ControlSpacer should have shadow root');
		}
		cleanup(container);
		pass('ControlSpacer has shadow root');
	},

	'should have flex: 1 style': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const style = getComputedStyle(control);
		if(style.flexGrow !== '1'){
			cleanup(container);
			return fail(`Expected flex-grow "1", got "${style.flexGrow}"`);
		}
		cleanup(container);
		pass('ControlSpacer has flex: 1 style');
	},

	'should render no visible elements': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const buttons = control.shadowRoot.querySelectorAll('button, input, select, textarea, a');
		if(buttons.length > 0){
			cleanup(container);
			return fail('ControlSpacer should not render interactive elements');
		}
		cleanup(container);
		pass('ControlSpacer renders no interactive elements');
	},
};
