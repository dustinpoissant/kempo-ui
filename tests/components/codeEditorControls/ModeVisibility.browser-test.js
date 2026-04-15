import '../../../src/components/HtmlEditor.js';
import '../../../src/components/codeEditorControls/CopyCode.js';
import '../../../src/components/codeEditorControls/WordWrap.js';

const createHtmlEditorWithControls = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-cec-copy-code slot="toolbar-top-left"></k-cec-copy-code>
			<k-cec-word-wrap slot="toolbar-top-left"></k-cec-word-wrap>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const copyCode = container.querySelector('k-cec-copy-code');
	const wordWrap = container.querySelector('k-cec-word-wrap');
	return { container, editor, copyCode, wordWrap };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	'controls should be hidden in HtmlEditor visual mode': async ({pass, fail}) => {
		const { container, copyCode, wordWrap } = await createHtmlEditorWithControls();
		await copyCode.updateComplete;
		if(!copyCode.hidden){
			cleanup(container);
			return fail('CopyCode should be hidden in visual mode');
		}
		if(!wordWrap.hidden){
			cleanup(container);
			return fail('WordWrap should be hidden in visual mode');
		}
		cleanup(container);
		pass();
	},

	'controls should be visible in HtmlEditor code mode': async ({pass, fail}) => {
		const { container, editor, copyCode, wordWrap } = await createHtmlEditorWithControls();
		editor.mode = 'code';
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await copyCode.updateComplete;
		if(copyCode.hidden){
			cleanup(container);
			return fail('CopyCode should be visible in code mode');
		}
		if(wordWrap.hidden){
			cleanup(container);
			return fail('WordWrap should be visible in code mode');
		}
		cleanup(container);
		pass();
	},

	'controls should hide again when switching back to visual': async ({pass, fail}) => {
		const { container, editor, copyCode } = await createHtmlEditorWithControls();
		editor.mode = 'code';
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		editor.mode = 'visual';
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await copyCode.updateComplete;
		if(!copyCode.hidden){
			cleanup(container);
			return fail('CopyCode should be hidden after switching back to visual');
		}
		cleanup(container);
		pass();
	},

	'controls should find HtmlEditor as parent': async ({pass, fail}) => {
		const { container, editor, copyCode } = await createHtmlEditorWithControls();
		if(copyCode.editor !== editor){
			cleanup(container);
			return fail('Should find k-html-editor as parent');
		}
		cleanup(container);
		pass();
	}
};
