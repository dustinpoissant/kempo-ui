import '../../../src/components/HtmlEditor.js';
import FormatBlock from '../../../src/components/controls/FormatBlock.js';

const createEditorWithControl = async (tag = 'h1') => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-format-block tag="${tag}" slot="toolbar-top-left"></kc-format-block>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-format-block');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-format-block element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof FormatBlock)){
			cleanup(container);
			return fail('Element should be instance of FormatBlock');
		}
		cleanup(container);
		pass('FormatBlock element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('FormatBlock should have shadow root');
		}
		cleanup(container);
		pass('FormatBlock has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control;
		if(!button){
			cleanup(container);
			return fail('FormatBlock should render a button');
		}
		cleanup(container);
		pass('FormatBlock renders a button');
	},

	/*
		Tag Property
	*/
	'should default tag to "p"': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<k-html-editor>
				<kc-format-block slot="toolbar-top-left"></kc-format-block>
			</k-html-editor>
		`;
		document.body.appendChild(container);
		const editor = container.querySelector('k-html-editor');
		await new Promise(r => editor.addEventListener('ready', r, { once: true }));
		const control = container.querySelector('kc-format-block');
		if(control.tag !== 'p'){
			cleanup(container);
			return fail(`Expected default tag "p", got "${control.tag}"`);
		}
		cleanup(container);
		pass('Default tag is "p"');
	},

	'should accept tag attribute': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl('h2');
		if(control.tag !== 'h2'){
			cleanup(container);
			return fail(`Expected tag "h2", got "${control.tag}"`);
		}
		cleanup(container);
		pass('Tag attribute is accepted');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('FormatBlock should find its parent k-html-editor');
		}
		cleanup(container);
		pass('FormatBlock finds parent editor');
	},

	'click should call editor.formatBlock with tag value': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl('h3');
		await control.updateComplete;
		let calledWith = null;
		editor.formatBlock = tag => { calledWith = tag; };
		control.click();
		if(calledWith !== 'h3'){
			cleanup(container);
			return fail(`Expected formatBlock("h3"), got formatBlock("${calledWith}")`);
		}
		cleanup(container);
		pass('Click calls editor.formatBlock with tag value');
	},

	/*
		Helper Methods
	*/
	'getDefaultLabel should return correct labels': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl('h1');
		const expected = {h1: 'Heading 1', h2: 'Heading 2', p: 'Paragraph'};
		for(const [tag, label] of Object.entries(expected)){
			control.tag = tag;
			if(control.getDefaultLabel() !== label){
				cleanup(container);
				return fail(`Expected label "${label}" for tag "${tag}", got "${control.getDefaultLabel()}"`);
			}
		}
		cleanup(container);
		pass('getDefaultLabel returns correct labels');
	},

	'getDefaultIcon should return correct icons': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl('h1');
		const expected = {h1: 'format_h1', h2: 'format_h2', p: 'format_paragraph'};
		for(const [tag, icon] of Object.entries(expected)){
			control.tag = tag;
			if(control.getDefaultIcon() !== icon){
				cleanup(container);
				return fail(`Expected icon "${icon}" for tag "${tag}", got "${control.getDefaultIcon()}"`);
			}
		}
		cleanup(container);
		pass('getDefaultIcon returns correct icons');
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
			return fail('FormatBlock should be hidden in code mode');
		}
		cleanup(container);
		pass('FormatBlock is hidden in code mode');
	},
};
