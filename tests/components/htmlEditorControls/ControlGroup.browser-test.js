import '../../../src/components/HtmlEditor.js';
import ControlGroup from '../../../src/components/htmlEditorControls/ControlGroup.js';
import '../../../src/components/htmlEditorControls/Bold.js';
import '../../../src/components/htmlEditorControls/Italic.js';

const createEditorWithGroup = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<k-hec-group slot="toolbar-top-left">
				<k-hec-bold></k-hec-bold>
				<k-hec-italic></k-hec-italic>
			</k-hec-group>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	const group = container.querySelector('k-hec-group');
	return { container, editor, group };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create k-hec-group element': async ({pass, fail}) => {
		const { container, group } = await createEditorWithGroup();
		if(!(group instanceof ControlGroup)){
			cleanup(container);
			return fail('Element should be instance of ControlGroup');
		}
		cleanup(container);
		pass('ControlGroup element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, group } = await createEditorWithGroup();
		if(!group.shadowRoot){
			cleanup(container);
			return fail('ControlGroup should have shadow root');
		}
		cleanup(container);
		pass('ControlGroup has shadow root');
	},

	'should render a slot': async ({pass, fail}) => {
		const { container, group } = await createEditorWithGroup();
		await group.updateComplete;
		const slot = group.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			return fail('ControlGroup should render a slot');
		}
		cleanup(container);
		pass('ControlGroup renders a slot');
	},

	/*
		Visibility
	*/
	'should default to not hidden': async ({pass, fail}) => {
		const { container, group } = await createEditorWithGroup();
		if(group.hidden){
			cleanup(container);
			return fail('ControlGroup should not be hidden by default');
		}
		cleanup(container);
		pass('ControlGroup is not hidden by default');
	},

	'should hide when all children are hidden': async ({pass, fail}) => {
		const { container, group } = await createEditorWithGroup();
		const children = Array.from(group.children);
		children.forEach(child => { child.hidden = true; });
		group.checkVisibility(new CustomEvent('control_visibility_change'));
		if(!group.hidden){
			cleanup(container);
			return fail('ControlGroup should hide when all children are hidden');
		}
		cleanup(container);
		pass('ControlGroup hides when all children are hidden');
	},

	'should show when at least one child is visible': async ({pass, fail}) => {
		const { container, group } = await createEditorWithGroup();
		const children = Array.from(group.children);
		children[0].hidden = true;
		children[1].hidden = false;
		group.checkVisibility(new CustomEvent('control_visibility_change'));
		if(group.hidden){
			cleanup(container);
			return fail('ControlGroup should be visible when at least one child is visible');
		}
		cleanup(container);
		pass('ControlGroup is visible when at least one child is visible');
	},

	/*
		Class Attribute
	*/
	'should set default class attribute': async ({pass, fail}) => {
		const { container, group } = await createEditorWithGroup();
		const cls = group.getAttribute('class');
		if(!cls || !cls.includes('b')){
			cleanup(container);
			return fail(`Expected default class containing "b", got "${cls}"`);
		}
		cleanup(container);
		pass('ControlGroup sets default class attribute');
	},
};
