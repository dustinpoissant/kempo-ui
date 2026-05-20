import '../../../src/components/HtmlEditor.js';
import CharacterCount from '../../../src/components/controls/CharacterCount.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-character-count slot="toolbar-bottom-left"></kc-character-count>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-character-count');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-character-count element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof CharacterCount)){
			cleanup(container);
			return fail('Element should be instance of CharacterCount');
		}
		cleanup(container);
		pass('CharacterCount element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('CharacterCount should have shadow root');
		}
		cleanup(container);
		pass('CharacterCount has shadow root');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('CharacterCount should find its parent k-html-editor');
		}
		cleanup(container);
		pass('CharacterCount finds parent editor');
	},

	'should initialize count to 0': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(control.count !== 0){
			cleanup(container);
			return fail(`Expected initial count 0, got ${control.count}`);
		}
		cleanup(container);
		pass('CharacterCount initializes count to 0');
	},

	'should update count when editor content changes': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.setValue('<p>hello</p>');
		await new Promise(r => setTimeout(r, 200));
		await control.updateComplete;
		if(control.count !== 5){
			cleanup(container);
			return fail(`Expected count 5, got ${control.count}`);
		}
		cleanup(container);
		pass('CharacterCount updates on content change');
	},

	'should count empty content as 0 characters': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		editor.setValue('');
		await new Promise(r => setTimeout(r, 200));
		await control.updateComplete;
		if(control.count !== 0){
			cleanup(container);
			return fail(`Expected count 0 for empty content, got ${control.count}`);
		}
		cleanup(container);
		pass('CharacterCount counts empty content as 0');
	},

	'should render character count span': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const span = control.shadowRoot.querySelector('.character-count');
		if(!span){
			cleanup(container);
			return fail('CharacterCount should render a .character-count span');
		}
		cleanup(container);
		pass('CharacterCount renders character count span');
	},
};
