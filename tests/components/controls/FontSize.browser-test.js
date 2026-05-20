import '../../../src/components/CodeEditor.js';
import '../../../src/components/controls/FontSize.js';
import '../../../src/components/controls/FontSizeDecrease.js';
import '../../../src/components/controls/FontSizeIncrease.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-code-editor language="javascript" style="height:200px">
			<kc-font-size slot="toolbar-top-left"></kc-font-size>
		</k-code-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-font-size');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'should render two button sub-components': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const decrease = control.shadowRoot.querySelector('kc-font-size-decrease');
		const increase = control.shadowRoot.querySelector('kc-font-size-increase');
		if(!decrease || !increase){
			cleanup(container);
			return fail(`Expected decrease and increase sub-components, got decrease=${!!decrease}, increase=${!!increase}`);
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

	'increase click should call editor.increaseFontSize()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		const increase = control.shadowRoot.querySelector('kc-font-size-increase');
		await increase.updateComplete;
		let called = false;
		editor.increaseFontSize = () => { called = true; return editor; };
		increase.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.increaseFontSize() on increase click');
		}
		cleanup(container);
		pass();
	},

	'decrease click should call editor.decreaseFontSize()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		const decrease = control.shadowRoot.querySelector('kc-font-size-decrease');
		await decrease.updateComplete;
		let called = false;
		editor.decreaseFontSize = () => { called = true; return editor; };
		decrease.click();
		if(!called){
			cleanup(container);
			return fail('Should call editor.decreaseFontSize() on decrease click');
		}
		cleanup(container);
		pass();
	}
};
