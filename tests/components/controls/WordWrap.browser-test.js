import '../../../src/components/CodeEditor.js';
import '../../../src/components/controls/WordWrap.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<kc-word-wrap slot="toolbar-top-left"></kc-word-wrap>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-word-wrap');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'should create element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control?.shadowRoot){
			cleanup(container);
			return fail('Should create element with shadow root');
		}
		cleanup(container);
		pass();
	},

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

	'should default to active (word wrap on)': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.active){
			cleanup(container);
			return fail('Should default to active');
		}
		cleanup(container);
		pass();
	},

	'click should toggle word wrap off': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		const orig = editor.toggleWordWrap.bind(editor);
		editor.toggleWordWrap = () => { called = true; return orig(); };
		control.click();
		await editor.updateComplete;
		await control.updateComplete;
		if(!called){
			cleanup(container);
			return fail('Should call toggleWordWrap on click');
		}
		if(control.active){
			cleanup(container);
			return fail('Should toggle active to false');
		}
		cleanup(container);
		pass();
	},

	'should not be hidden in CodeEditor': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Should not be hidden in CodeEditor');
		}
		cleanup(container);
		pass();
	}
};
