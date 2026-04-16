import '../../../src/components/HtmlEditor.js';
import WordCount from '../../../src/components/htmlEditorControls/WordCount.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-word-count slot="toolbar-bottom-left"></k-hec-word-count>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-word-count');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-word-count element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof WordCount)){
			cleanup(container);
			return fail('Element should be instance of WordCount');
		}
		cleanup(container);
		pass('WordCount element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('WordCount should have shadow root');
		}
		cleanup(container);
		pass('WordCount has shadow root');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('WordCount should find its parent k-html-editor');
		}
		cleanup(container);
		pass('WordCount finds parent editor');
	},

	'should initialize count to 0': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(control.count !== 0){
			cleanup(container);
			return fail(`Expected initial count 0, got ${control.count}`);
		}
		cleanup(container);
		pass('WordCount initializes count to 0');
	},

	'should update count when editor content changes': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.setValue('<p>hello world foo bar</p>');
		await new Promise(r => setTimeout(r, 200));
		await control.updateComplete;
		if(control.count !== 4){
			cleanup(container);
			return fail(`Expected count 4, got ${control.count}`);
		}
		cleanup(container);
		pass('WordCount updates on content change');
	},

	'should count empty content as 0 words': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.setValue('');
		await new Promise(r => setTimeout(r, 200));
		await control.updateComplete;
		if(control.count !== 0){
			cleanup(container);
			return fail(`Expected count 0 for empty content, got ${control.count}`);
		}
		cleanup(container);
		pass('WordCount counts empty content as 0');
	},

	'should render word count span': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const span = control.shadowRoot.querySelector('.word-count');
		if(!span){
			cleanup(container);
			return fail('WordCount should render a .word-count span');
		}
		cleanup(container);
		pass('WordCount renders word count span');
	},
};
