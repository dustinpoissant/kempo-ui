import '../../../src/components/HtmlEditor.js';
import DropdownControl from '../../../src/components/htmlEditorControls/DropdownControl.js';
import '../../../src/components/htmlEditorControls/Bold.js';

const createEditorWithControl = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-dropdown slot="toolbar-top-left">
				<k-icon name="more_vert" slot="icon"></k-icon>
				<k-hec-bold></k-hec-bold>
			</k-hec-dropdown>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const control = container.querySelector('k-hec-dropdown');
	return { container, editor, control };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-dropdown element': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!(control instanceof DropdownControl)){
			cleanup(container);
			return fail('Element should be instance of DropdownControl');
		}
		cleanup(container);
		pass('DropdownControl element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('DropdownControl should have shadow root');
		}
		cleanup(container);
		pass('DropdownControl has shadow root');
	},

	'should render a k-dropdown': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const dropdown = control.shadowRoot.querySelector('k-dropdown');
		if(!dropdown){
			cleanup(container);
			return fail('DropdownControl should render a k-dropdown');
		}
		cleanup(container);
		pass('DropdownControl renders a k-dropdown');
	},

	'should render a trigger button': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		await control.updateComplete;
		const button = control.shadowRoot.querySelector('button[slot="trigger"]');
		if(!button){
			cleanup(container);
			return fail('DropdownControl should render a trigger button');
		}
		cleanup(container);
		pass('DropdownControl renders a trigger button');
	},

	/*
		Editor Integration
	*/
	'should find parent editor': async ({pass, fail}) => {
		const { container, editor, control } = await createEditorWithControl();
		if(control.editor !== editor){
			cleanup(container);
			return fail('DropdownControl should find its parent k-html-editor');
		}
		cleanup(container);
		pass('DropdownControl finds parent editor');
	},

	/*
		Opened State
	*/
	'should default to closed': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		if(control.opened){
			cleanup(container);
			return fail('DropdownControl should default to closed');
		}
		cleanup(container);
		pass('DropdownControl defaults to closed');
	},

	'handleToggle should toggle opened state': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		control.handleToggle();
		if(!control.opened){
			cleanup(container);
			return fail('handleToggle should open the dropdown');
		}
		control.handleToggle();
		if(control.opened){
			cleanup(container);
			return fail('handleToggle should close the dropdown');
		}
		cleanup(container);
		pass('handleToggle toggles opened state');
	},

	'handleOpened should set opened to true': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		control.handleOpened();
		if(!control.opened){
			cleanup(container);
			return fail('handleOpened should set opened to true');
		}
		cleanup(container);
		pass('handleOpened sets opened to true');
	},

	'handleClosed should set opened to false': async ({pass, fail}) => {
		const { container, control } = await createEditorWithControl();
		control.opened = true;
		control.handleClosed();
		if(control.opened){
			cleanup(container);
			return fail('handleClosed should set opened to false');
		}
		cleanup(container);
		pass('handleClosed sets opened to false');
	},
};
