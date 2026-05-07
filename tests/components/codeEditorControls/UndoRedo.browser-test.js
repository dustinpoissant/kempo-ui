import '../../../src/components/CodeEditor.js';
import '../../../src/components/codeEditorControls/Undo.js';
import '../../../src/components/codeEditorControls/Redo.js';

const createEditorWithControls = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<k-cec-undo slot="toolbar-top-left"></k-cec-undo>
			<k-cec-redo slot="toolbar-top-left"></k-cec-redo>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const undo = container.querySelector('k-cec-undo');
	const redo = container.querySelector('k-cec-redo');
	return { container, editor, undo, redo };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'undo should have button role': async ({pass, fail}) => {
		const { container, undo } = await createEditorWithControls();
		await undo.updateComplete;
		if(undo.getAttribute('role') !== 'button'){
			cleanup(container);
			return fail('Undo should have role="button"');
		}
		cleanup(container);
		pass();
	},

	'redo should have button role': async ({pass, fail}) => {
		const { container, redo } = await createEditorWithControls();
		await redo.updateComplete;
		if(redo.getAttribute('role') !== 'button'){
			cleanup(container);
			return fail('Redo should have role="button"');
		}
		cleanup(container);
		pass();
	},

	'undo should find parent editor': async ({pass, fail}) => {
		const { container, editor, undo } = await createEditorWithControls();
		if(undo.editor !== editor){
			cleanup(container);
			return fail('Undo should find parent k-code-editor');
		}
		cleanup(container);
		pass();
	},

	'undo click should call editor.undo()': async ({pass, fail}) => {
		const { container, editor, undo } = await createEditorWithControls();
		await undo.updateComplete;
		let called = false;
		editor.undo = () => { called = true; };
		undo.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.undo() on click');
		}
		cleanup(container);
		pass();
	},

	'redo click should call editor.redo()': async ({pass, fail}) => {
		const { container, editor, redo } = await createEditorWithControls();
		await redo.updateComplete;
		let called = false;
		editor.redo = () => { called = true; };
		redo.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.redo() on click');
		}
		cleanup(container);
		pass();
	}
};
