import '../../../src/components/CodeEditor.js';
import '../../../src/components/controls/CopyCode.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<kc-copy-code slot="toolbar-top-left"></kc-copy-code>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-copy-code');
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
		if(control.host !== editor){
			cleanup(container);
			return fail('Should find parent k-code-editor');
		}
		cleanup(container);
		pass();
	},

	'click should call editor.copyToClipboard()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.copyToClipboard = () => { called = true; return editor; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.copyToClipboard() on click');
		}
		cleanup(container);
		pass();
	}
};
