import '../../../src/components/HtmlEditor.js';
import CodeBlock from '../../../src/components/htmlEditorControls/CodeBlock.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-code-block slot="toolbar-top-left"></k-hec-code-block>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-code-block');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-code-block element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof CodeBlock)){
			cleanup(container);
			return fail('Element should be instance of CodeBlock');
		}
		cleanup(container);
		pass('CodeBlock element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('CodeBlock should have shadow root');
		}
		cleanup(container);
		pass('CodeBlock has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			return fail('CodeBlock should render a button');
		}
		cleanup(container);
		pass('CodeBlock renders a button');
	},

	'should render code_blocks icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('CodeBlock should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'code_blocks'){
			cleanup(container);
			return fail(`Expected icon name "code_blocks", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('CodeBlock renders code_blocks icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('CodeBlock should find its parent k-html-editor');
		}
		cleanup(container);
		pass('CodeBlock finds parent editor');
	},

	'click should call editor.formatBlock when not in code block': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let calledWith = null;
		editor.isSelectionInCodeBlock = () => false;
		editor.formatBlock = tag => { calledWith = tag; };
		control.shadowRoot.querySelector('button').click();
		if(calledWith !== 'pre'){
			cleanup(container);
			return fail(`Expected formatBlock("pre"), got formatBlock("${calledWith}")`);
		}
		cleanup(container);
		pass('Click calls editor.formatBlock("pre") when not in code block');
	},

	'click should call editor.formatBlock("p") when in code block': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let calledWith = null;
		editor.isSelectionInCodeBlock = () => true;
		editor.formatBlock = tag => { calledWith = tag; };
		control.shadowRoot.querySelector('button').click();
		if(calledWith !== 'p'){
			cleanup(container);
			return fail(`Expected formatBlock("p"), got formatBlock("${calledWith}")`);
		}
		cleanup(container);
		pass('Click calls editor.formatBlock("p") when in code block');
	},

	/*
		Code Mode Visibility
	*/
	'should hide in code mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.setMode('code');
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await control.updateComplete;
		if(!control.hidden){
			cleanup(container);
			return fail('CodeBlock should be hidden in code mode');
		}
		cleanup(container);
		pass('CodeBlock is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('CodeBlock should be visible in visual mode');
		}
		cleanup(container);
		pass('CodeBlock is visible in visual mode');
	},
};
