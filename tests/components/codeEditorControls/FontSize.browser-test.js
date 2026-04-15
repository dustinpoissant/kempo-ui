import '../../../src/components/CodeEditor.js';
import '../../../src/components/codeEditorControls/FontSize.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<k-cec-font-size slot="toolbar-top-left"></k-cec-font-size>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-cec-font-size');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'should render two buttons': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const buttons = control.shadowRoot.querySelectorAll('button');
		if(buttons.length !== 2){
			cleanup(container);
			return fail(`Expected 2 buttons, got ${buttons.length}`);
		}
		cleanup(container);
		pass();
	},

	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('Should find parent k-code-editor');
		}
		cleanup(container);
		pass();
	},

	'increase click should call editor.increaseFontSize()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.increaseFontSize = () => { called = true; return editor; };
		const buttons = control.shadowRoot.querySelectorAll('button');
		buttons[1].click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.increaseFontSize() on second button click');
		}
		cleanup(container);
		pass();
	},

	'decrease click should call editor.decreaseFontSize()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.decreaseFontSize = () => { called = true; return editor; };
		const buttons = control.shadowRoot.querySelectorAll('button');
		buttons[0].click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.decreaseFontSize() on first button click');
		}
		cleanup(container);
		pass();
	}
};
