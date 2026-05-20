import '../../../src/components/HtmlEditor.js';
import AlignLeft from '../../../src/components/controls/AlignLeft.js';
import AlignCenter from '../../../src/components/controls/AlignCenter.js';
import AlignRight from '../../../src/components/controls/AlignRight.js';
import AlignJustify from '../../../src/components/controls/AlignJustify.js';

const createEditorWithControls = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor>
			<kc-align-left slot="toolbar-top-left"></kc-align-left>
			<kc-align-center slot="toolbar-top-left"></kc-align-center>
			<kc-align-right slot="toolbar-top-left"></kc-align-right>
			<kc-align-justify slot="toolbar-top-left"></kc-align-justify>
		</k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	return {
		container,
		editor,
		left: container.querySelector('kc-align-left'),
		center: container.querySelector('kc-align-center'),
		right: container.querySelector('kc-align-right'),
		justify: container.querySelector('kc-align-justify')
	};
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		AlignLeft
	*/
	'AlignLeft: should create element': async ({pass, fail}) => {
		const { container, left } = await createEditorWithControls();
		if(!(left instanceof AlignLeft)){
			cleanup(container);
			return fail('Element should be instance of AlignLeft');
		}
		cleanup(container);
		pass('AlignLeft element created correctly');
	},

	'AlignLeft: should render format_align_left icon': async ({pass, fail}) => {
		const { container, left } = await createEditorWithControls();
		await left.updateComplete;
		const icon = left.shadowRoot.querySelector('k-icon');
		if(icon?.getAttribute('name') !== 'format_align_left'){
			cleanup(container);
			return fail(`Expected icon "format_align_left", got "${icon?.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('AlignLeft renders correct icon');
	},

	'AlignLeft: click should call editor.alignLeft()': async ({pass, fail}) => {
		const { container, editor, left } = await createEditorWithControls();
		await left.updateComplete;
		let called = false;
		editor.alignLeft = () => { called = true; };
		left.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.alignLeft()');
		}
		cleanup(container);
		pass('Click calls editor.alignLeft()');
	},

	'AlignLeft: should hide in code mode': async ({pass, fail}) => {
		const { container, editor, left } = await createEditorWithControls();
		editor.setMode('code');
		await new Promise(r => editor.addEventListener('mode-changed', r, { once: true }));
		await left.updateComplete;
		if(!left.hidden){
			cleanup(container);
			return fail('AlignLeft should be hidden in code mode');
		}
		cleanup(container);
		pass('AlignLeft is hidden in code mode');
	},

	/*
		AlignCenter
	*/
	'AlignCenter: should create element': async ({pass, fail}) => {
		const { container, center } = await createEditorWithControls();
		if(!(center instanceof AlignCenter)){
			cleanup(container);
			return fail('Element should be instance of AlignCenter');
		}
		cleanup(container);
		pass('AlignCenter element created correctly');
	},

	'AlignCenter: should render format_align_center icon': async ({pass, fail}) => {
		const { container, center } = await createEditorWithControls();
		await center.updateComplete;
		const icon = center.shadowRoot.querySelector('k-icon');
		if(icon?.getAttribute('name') !== 'format_align_center'){
			cleanup(container);
			return fail(`Expected icon "format_align_center", got "${icon?.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('AlignCenter renders correct icon');
	},

	'AlignCenter: click should call editor.alignCenter()': async ({pass, fail}) => {
		const { container, editor, center } = await createEditorWithControls();
		await center.updateComplete;
		let called = false;
		editor.alignCenter = () => { called = true; };
		center.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.alignCenter()');
		}
		cleanup(container);
		pass('Click calls editor.alignCenter()');
	},

	/*
		AlignRight
	*/
	'AlignRight: should create element': async ({pass, fail}) => {
		const { container, right } = await createEditorWithControls();
		if(!(right instanceof AlignRight)){
			cleanup(container);
			return fail('Element should be instance of AlignRight');
		}
		cleanup(container);
		pass('AlignRight element created correctly');
	},

	'AlignRight: should render format_align_right icon': async ({pass, fail}) => {
		const { container, right } = await createEditorWithControls();
		await right.updateComplete;
		const icon = right.shadowRoot.querySelector('k-icon');
		if(icon?.getAttribute('name') !== 'format_align_right'){
			cleanup(container);
			return fail(`Expected icon "format_align_right", got "${icon?.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('AlignRight renders correct icon');
	},

	'AlignRight: click should call editor.alignRight()': async ({pass, fail}) => {
		const { container, editor, right } = await createEditorWithControls();
		await right.updateComplete;
		let called = false;
		editor.alignRight = () => { called = true; };
		right.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.alignRight()');
		}
		cleanup(container);
		pass('Click calls editor.alignRight()');
	},

	/*
		AlignJustify
	*/
	'AlignJustify: should create element': async ({pass, fail}) => {
		const { container, justify } = await createEditorWithControls();
		if(!(justify instanceof AlignJustify)){
			cleanup(container);
			return fail('Element should be instance of AlignJustify');
		}
		cleanup(container);
		pass('AlignJustify element created correctly');
	},

	'AlignJustify: should render format_align_justify icon': async ({pass, fail}) => {
		const { container, justify } = await createEditorWithControls();
		await justify.updateComplete;
		const icon = justify.shadowRoot.querySelector('k-icon');
		if(icon?.getAttribute('name') !== 'format_align_justify'){
			cleanup(container);
			return fail(`Expected icon "format_align_justify", got "${icon?.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('AlignJustify renders correct icon');
	},

	'AlignJustify: click should call editor.alignJustify()': async ({pass, fail}) => {
		const { container, editor, justify } = await createEditorWithControls();
		await justify.updateComplete;
		let called = false;
		editor.alignJustify = () => { called = true; };
		justify.click();
		if(!called){
			cleanup(container);
			return fail('Click should call editor.alignJustify()');
		}
		cleanup(container);
		pass('Click calls editor.alignJustify()');
	},
};
