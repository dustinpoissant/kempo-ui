import '../../../src/components/CodeEditor.js';
import '../../../src/components/codeEditorControls/FindReplace.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<k-cec-find-replace slot="toolbar-top-left"></k-cec-find-replace>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-cec-find-replace');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'should have button role': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.getAttribute('role') !== 'button'){
			cleanup(container);
			return fail('Should have role="button"');
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

	'click should call editor.openFind()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.openFind = () => { called = true; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.openFind() on click');
		}
		cleanup(container);
		pass();
	}
};
