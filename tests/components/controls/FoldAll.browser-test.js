import '../../../src/components/CodeEditor.js';
import '../../../src/components/controls/FoldAll.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<kc-fold-all slot="toolbar-top-left"></kc-fold-all>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-fold-all');
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

	'should default to unfolded': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(control.folded){
			cleanup(container);
			return fail('Should default to unfolded');
		}
		cleanup(container);
		pass();
	},

	'click should toggle to folded and call foldAll': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.foldAll = () => { called = true; return editor; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.foldAll()');
		}
		if(!control.folded){
			cleanup(container);
			return fail('Should set folded to true');
		}
		cleanup(container);
		pass();
	},

	'second click should unfold and call unfoldAll': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		editor.foldAll = () => editor;
		editor.unfoldAll = () => { return editor; };
		control.click();
		let called = false;
		editor.unfoldAll = () => { called = true; return editor; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.unfoldAll()');
		}
		if(control.folded){
			cleanup(container);
			return fail('Should set folded to false');
		}
		cleanup(container);
		pass();
	}
};
