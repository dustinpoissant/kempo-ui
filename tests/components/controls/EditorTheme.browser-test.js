import '../../../src/components/CodeEditor.js';
import '../../../src/components/controls/EditorTheme.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<kc-editor-theme slot="toolbar-top-right"></kc-editor-theme>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-editor-theme');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'should create element with select': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		if(!control.shadowRoot.querySelector('select')){
			cleanup(container);
			return fail('Should render a select');
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

	'should default to auto': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.value !== 'auto'){
			cleanup(container);
			return fail(`Expected 'auto', got '${control.value}'`);
		}
		cleanup(container);
		pass();
	},

	'change should call editor.setEditorTheme()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let calledWith = null;
		editor.setEditorTheme = theme => { calledWith = theme; return editor; };
		const select = control.shadowRoot.querySelector('select');
		select.value = 'dark';
		select.dispatchEvent(new Event('change'));
		if(calledWith !== 'dark'){
			cleanup(container);
			return fail(`Expected setEditorTheme('dark'), got '${calledWith}'`);
		}
		cleanup(container);
		pass();
	}
};
