import '../../../src/components/CodeEditor.js';
import '../../../src/components/HtmlEditor.js';
import '../../../src/components/controls/Fullscreen.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<kc-fullscreen slot="toolbar-top-right"></kc-fullscreen>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-fullscreen');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'should create element with shadow root': async ({pass, fail}) => {
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

	'should default to fullscreen false': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(control.fullscreen !== false){
			cleanup(container);
			return fail('Should default to fullscreen=false');
		}
		cleanup(container);
		pass();
	},

	'click should call toggleFullscreen on editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		const orig = editor.toggleFullscreen.bind(editor);
		editor.toggleFullscreen = () => { called = true; return orig(); };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Should call toggleFullscreen on click');
		}
		cleanup(container);
		pass();
	},

	'click should toggle control fullscreen state to true': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		control.click();
		await control.updateComplete;
		if(!control.fullscreen){
			cleanup(container);
			return fail('Should set fullscreen to true after click');
		}
		cleanup(container);
		pass();
	},

	'control should sync state when editor dispatches fullscreen-changed': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.enterFullscreen();
		await control.updateComplete;
		if(!control.fullscreen){
			editor.exitFullscreen();
			cleanup(container);
			return fail('Control should sync to fullscreen=true');
		}
		editor.exitFullscreen();
		await control.updateComplete;
		if(control.fullscreen){
			cleanup(container);
			return fail('Control should sync to fullscreen=false');
		}
		cleanup(container);
		pass();
	},

	'should not be hidden in visual mode when in html editor': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-html-editor>
				<kc-fullscreen slot="toolbar-top-right"></kc-fullscreen>
			</k-html-editor>
		`;
		document.body.appendChild(container);
		const editor = container.querySelector('k-html-editor');
		await new Promise(r => editor.addEventListener('ready', r, { once: true }));
		const control = container.querySelector('kc-fullscreen');
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('Fullscreen control should not be hidden in visual mode');
		}
		cleanup(container);
		pass();
	}
};
