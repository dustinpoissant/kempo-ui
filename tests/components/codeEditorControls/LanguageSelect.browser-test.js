import '../../../src/components/CodeEditor.js';
import '../../../src/components/codeEditorControls/LanguageSelect.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<k-cec-language slot="toolbar-top-right"></k-cec-language>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-cec-language');
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
		if(control.editor !== editor){
			cleanup(container);
			return fail('Should find parent k-code-editor');
		}
		cleanup(container);
		pass();
	},

	'should sync initial value from editor language': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.value !== 'javascript'){
			cleanup(container);
			return fail(`Expected 'javascript', got '${control.value}'`);
		}
		cleanup(container);
		pass();
	},

	'should have multiple language options': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const options = control.shadowRoot.querySelectorAll('option');
		if(options.length < 10){
			cleanup(container);
			return fail(`Expected at least 10 options, got ${options.length}`);
		}
		cleanup(container);
		pass();
	},

	'change should call editor.setLanguage()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let calledWith = null;
		editor.setLanguage = lang => { calledWith = lang; return editor; };
		const select = control.shadowRoot.querySelector('select');
		select.value = 'html';
		select.dispatchEvent(new Event('change'));
		if(calledWith !== 'html'){
			cleanup(container);
			return fail(`Expected setLanguage('html'), got setLanguage('${calledWith}')`);
		}
		cleanup(container);
		pass();
	}
};
