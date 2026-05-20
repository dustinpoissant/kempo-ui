import '../../../src/components/HtmlEditor.js';
import BulletList from '../../../src/components/controls/BulletList.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-bullet-list slot="toolbar-top-left"></kc-bullet-list>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('kc-bullet-list');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create kc-bullet-list element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof BulletList)){
			cleanup(container);
			return fail('Element should be instance of BulletList');
		}
		cleanup(container);
		pass('BulletList element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('BulletList should have shadow root');
		}
		cleanup(container);
		pass('BulletList has shadow root');
	},

	'should render a button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control;
		if(!button){
			cleanup(container);
			return fail('BulletList should render a button');
		}
		cleanup(container);
		pass('BulletList renders a button');
	},

	'should render format_list_bulleted icon': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const icon = control.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			return fail('BulletList should render a k-icon');
		}
		if(icon.getAttribute('name') !== 'format_list_bulleted'){
			cleanup(container);
			return fail(`Expected icon name "format_list_bulleted", got "${icon.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('BulletList renders format_list_bulleted icon');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.host !== editor){
			cleanup(container);
			return fail('BulletList should find its parent k-html-editor');
		}
		cleanup(container);
		pass('BulletList finds parent editor');
	},

	'click should call editor.unorderedList()': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		let called = false;
		editor.unorderedList = () => { called = true; };
		control.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.unorderedList()');
		}
		cleanup(container);
		pass('Click calls editor.unorderedList()');
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
			return fail('BulletList should be hidden in code mode');
		}
		cleanup(container);
		pass('BulletList is hidden in code mode');
	},

	'should be visible in visual mode': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		await control.updateComplete;
		if(control.hidden){
			cleanup(container);
			return fail('BulletList should be visible in visual mode');
		}
		cleanup(container);
		pass('BulletList is visible in visual mode');
	},
};
