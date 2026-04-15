import HtmlEditor from '../../src/components/HtmlEditor.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

const createEditor = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-html-editor
			${options.value ? `value="${options.value.replace(/"/g, '&quot;')}"` : ''}
			${options.mode ? `mode="${options.mode}"` : ''}
			${options.nodes ? `nodes="${options.nodes}"` : ''}
		></k-html-editor>
	`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-html-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	return { container, editor };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create html editor element': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(!(editor instanceof HtmlEditor)) {
			cleanup(container);
			return fail('Element should be instance of HtmlEditor');
		}
		cleanup(container);
		pass('HtmlEditor element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(!editor.shadowRoot) {
			cleanup(container);
			return fail('HtmlEditor should have shadow root');
		}
		cleanup(container);
		pass('HtmlEditor has shadow root');
	},

	'should default to visual mode': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.mode !== 'visual') {
			cleanup(container);
			return fail(`Expected mode 'visual', got '${editor.mode}'`);
		}
		cleanup(container);
		pass('Default mode is visual');
	},

	/*
		Compatibility Detection - Compatible Content
	*/
	'isVisualCompatible should return true for simple HTML': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(!editor.isVisualCompatible('<p>Hello</p>')) {
			cleanup(container);
			return fail('Simple HTML should be compatible');
		}
		cleanup(container);
		pass('Simple HTML is compatible');
	},

	'isVisualCompatible should return true for empty string': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(!editor.isVisualCompatible('')) {
			cleanup(container);
			return fail('Empty string should be compatible');
		}
		cleanup(container);
		pass('Empty string is compatible');
	},

	'isVisualCompatible should return true for standard tags': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const html = '<h1>Title</h1><p>Text</p><ul><li>Item</li></ul><a href="#">Link</a><strong>Bold</strong>';
		if(!editor.isVisualCompatible(html)) {
			cleanup(container);
			return fail('Standard HTML tags should be compatible');
		}
		cleanup(container);
		pass('Standard HTML tags are compatible');
	},

	/*
		Compatibility Detection - Incompatible Content
	*/
	'isVisualCompatible should return false for svg': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.isVisualCompatible('<p>Text</p><svg><rect/></svg>')) {
			cleanup(container);
			return fail('SVG should be incompatible');
		}
		cleanup(container);
		pass('SVG is incompatible');
	},

	'isVisualCompatible should return false for script in body context': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.isVisualCompatible('<p>Text</p><script>alert(1)</script><p>More</p>')) {
			cleanup(container);
			return fail('Script should be incompatible');
		}
		cleanup(container);
		pass('Script is incompatible');
	},

	'isVisualCompatible should return false for style in body context': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.isVisualCompatible('<p>Text</p><style>body{}</style><p>More</p>')) {
			cleanup(container);
			return fail('Style should be incompatible');
		}
		cleanup(container);
		pass('Style is incompatible');
	},

	'isVisualCompatible should return false for form elements': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const tags = ['form', 'input', 'textarea', 'select', 'button'];
		for(const tag of tags) {
			if(editor.isVisualCompatible(`<${tag}></${tag}>`)) {
				cleanup(container);
				return fail(`<${tag}> should be incompatible`);
			}
		}
		cleanup(container);
		pass('Form elements are incompatible');
	},

	'isVisualCompatible should return false for HTML comments without custom node': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.isVisualCompatible('<p>Text <!-- comment --> more</p>')) {
			cleanup(container);
			return fail('HTML comments should be incompatible without HtmlComment node');
		}
		cleanup(container);
		pass('HTML comments are incompatible without custom node');
	},

	/*
		Auto Mode Detection
	*/
	'should auto-switch to code mode for incompatible initial value': async ({pass, fail}) => {
		const { container, editor } = await createEditor({
			value: '<p>Has SVG</p><svg><rect/></svg>'
		});
		if(editor.mode !== 'code') {
			cleanup(container);
			return fail(`Expected mode 'code' for incompatible content, got '${editor.mode}'`);
		}
		cleanup(container);
		pass('Auto-switches to code mode for incompatible content');
	},

	'should stay in visual mode for compatible initial value': async ({pass, fail}) => {
		const { container, editor } = await createEditor({
			value: '<p>Simple paragraph</p>'
		});
		if(editor.mode !== 'visual') {
			cleanup(container);
			return fail(`Expected mode 'visual' for compatible content, got '${editor.mode}'`);
		}
		cleanup(container);
		pass('Stays in visual mode for compatible content');
	},

	/*
		Node Compatibility Hooks
	*/
	'should collect nodeCompatCheckers from custom nodes': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(!Array.isArray(editor.nodeCompatCheckers)) {
			cleanup(container);
			return fail('nodeCompatCheckers should be an array');
		}
		cleanup(container);
		pass('nodeCompatCheckers is initialized as array');
	},

	'should collect nodePreprocessors from custom nodes': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(!Array.isArray(editor.nodePreprocessors)) {
			cleanup(container);
			return fail('nodePreprocessors should be an array');
		}
		cleanup(container);
		pass('nodePreprocessors is initialized as array');
	},

	/*
		Public Methods - Mode Control
	*/
	'setMode should accept visual': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setMode('visual');
		if(editor.mode !== 'visual') {
			cleanup(container);
			return fail(`Expected mode 'visual', got '${editor.mode}'`);
		}
		cleanup(container);
		pass('setMode accepts visual');
	},

	'setMode should reject invalid modes': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setMode('invalid');
		if(editor.mode !== 'visual') {
			cleanup(container);
			return fail(`Mode should not change for invalid value, got '${editor.mode}'`);
		}
		cleanup(container);
		pass('setMode rejects invalid modes');
	},

	'setMode should return this for chaining': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const result = editor.setMode('visual');
		if(result !== editor) {
			cleanup(container);
			return fail('setMode should return this');
		}
		cleanup(container);
		pass('setMode returns this');
	},

	'toggleMode should switch from visual to code': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.toggleMode();
		await wait(500);
		if(editor.mode !== 'code') {
			cleanup(container);
			return fail(`Expected mode 'code' after toggle, got '${editor.mode}'`);
		}
		cleanup(container);
		pass('toggleMode switches to code');
	},

	/*
		Public Methods - Content Management
	*/
	'getValue should return current content': async ({pass, fail}) => {
		const { container, editor } = await createEditor({ value: '<p>Test content</p>' });
		const val = editor.getValue();
		if(!val.includes('Test content')) {
			cleanup(container);
			return fail(`getValue should contain 'Test content', got '${val}'`);
		}
		cleanup(container);
		pass('getValue returns current content');
	},

	'setValue should update content': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setValue('<p>New content</p>');
		const val = editor.getValue();
		if(!val.includes('New content')) {
			cleanup(container);
			return fail(`setValue should update content, got '${val}'`);
		}
		cleanup(container);
		pass('setValue updates content');
	},

	'setValue should auto-switch to code for incompatible content': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setValue('<p>Text</p><svg><rect/></svg>');
		await wait(300);
		if(editor.mode !== 'code') {
			cleanup(container);
			return fail(`Expected mode 'code' after setting incompatible content, got '${editor.mode}'`);
		}
		cleanup(container);
		pass('setValue auto-switches to code for incompatible content');
	},

	'setValue should return this for chaining': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const result = editor.setValue('<p>Test</p>');
		if(result !== editor) {
			cleanup(container);
			return fail('setValue should return this');
		}
		cleanup(container);
		pass('setValue returns this');
	},

	'clear should empty the editor': async ({pass, fail}) => {
		const { container, editor } = await createEditor({ value: '<p>Some content</p>' });
		editor.clear();
		const val = editor.getValue();
		if(val.includes('Some content')) {
			cleanup(container);
			return fail('clear should remove content');
		}
		cleanup(container);
		pass('clear empties the editor');
	},

	/*
		Events
	*/
	'should dispatch ready event': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-html-editor value="<p>Test</p>"></k-html-editor>';
		const editor = container.querySelector('k-html-editor');
		let fired = false;
		editor.addEventListener('ready', () => { fired = true; }, { once: true });
		document.body.appendChild(container);
		await new Promise(r => setTimeout(r, 5000));
		if(!fired) {
			cleanup(container);
			return fail('ready event should fire');
		}
		cleanup(container);
		pass('ready event fires');
	},

	'should dispatch mode-changed event': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		let firedMode = null;
		editor.addEventListener('mode-changed', e => { firedMode = e.detail.mode; }, { once: true });
		editor.setMode('code');
		await wait(500);
		if(firedMode !== 'code') {
			cleanup(container);
			return fail(`Expected mode-changed with 'code', got '${firedMode}'`);
		}
		cleanup(container);
		pass('mode-changed event fires');
	},

	/*
		HTML Export Cleanup
	*/
	'cleanExportedHtml should strip k-editor classes': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const cleaned = editor.cleanExportedHtml('<p class="k-editor-p">Text</p>');
		if(cleaned.includes('k-editor-p')) {
			cleanup(container);
			return fail('k-editor classes should be stripped');
		}
		cleanup(container);
		pass('k-editor classes are stripped');
	},

	'cleanExportedHtml should strip pre-wrap white-space': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const cleaned = editor.cleanExportedHtml('<p style="white-space: pre-wrap;">Text</p>');
		if(cleaned.includes('white-space')) {
			cleanup(container);
			return fail('white-space: pre-wrap should be stripped');
		}
		cleanup(container);
		pass('white-space: pre-wrap is stripped');
	},

	'cleanExportedHtml should unwrap empty spans': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const cleaned = editor.cleanExportedHtml('<p><span>Text</span></p>');
		if(cleaned.includes('<span>')) {
			cleanup(container);
			return fail('Empty spans should be unwrapped');
		}
		if(!cleaned.includes('Text')) {
			cleanup(container);
			return fail('Text content should be preserved');
		}
		cleanup(container);
		pass('Empty spans are unwrapped');
	},

	/*
		Code Editor Proxy Methods
	*/
	'should have code editor proxy methods': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const methods = ['copyToClipboard', 'setEditorTheme', 'openFind', 'foldAll', 'unfoldAll', 'increaseFontSize', 'decreaseFontSize', 'setWordWrap', 'setMinimap', 'resolveMonacoTheme'];
		for(const m of methods){
			if(typeof editor[m] !== 'function'){
				cleanup(container);
				return fail(`Missing method: ${m}`);
			}
		}
		cleanup(container);
		pass('All code editor proxy methods exist');
	},

	'should initialize code editor properties': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.editorTheme !== 'auto'){
			cleanup(container);
			return fail(`Expected editorTheme 'auto', got '${editor.editorTheme}'`);
		}
		if(editor.wordWrap !== true){
			cleanup(container);
			return fail(`Expected wordWrap true, got ${editor.wordWrap}`);
		}
		if(editor.minimapEnabled !== false){
			cleanup(container);
			return fail(`Expected minimapEnabled false, got ${editor.minimapEnabled}`);
		}
		if(editor.fontSize !== 14){
			cleanup(container);
			return fail(`Expected fontSize 14, got ${editor.fontSize}`);
		}
		cleanup(container);
		pass('Code editor properties initialized correctly');
	},

	'undo should work in code mode': async ({pass, fail}) => {
		const { container, editor } = await createEditor({ value: '<p>Hello</p>' });
		await editor.setMode('code');
		await wait(500);
		try {
			editor.undo();
			cleanup(container);
			pass('undo works in code mode');
		} catch(e) {
			cleanup(container);
			fail(`undo threw in code mode: ${e.message}`);
		}
	},

	'redo should work in code mode': async ({pass, fail}) => {
		const { container, editor } = await createEditor({ value: '<p>Hello</p>' });
		await editor.setMode('code');
		await wait(500);
		try {
			editor.redo();
			cleanup(container);
			pass('redo works in code mode');
		} catch(e) {
			cleanup(container);
			fail(`redo threw in code mode: ${e.message}`);
		}
	},

	'setEditorTheme should update editorTheme property': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setEditorTheme('dark');
		if(editor.editorTheme !== 'dark'){
			cleanup(container);
			return fail(`Expected 'dark', got '${editor.editorTheme}'`);
		}
		editor.setEditorTheme('auto');
		if(editor.editorTheme !== 'auto'){
			cleanup(container);
			return fail(`Expected 'auto', got '${editor.editorTheme}'`);
		}
		cleanup(container);
		pass('setEditorTheme updates property');
	},

	'setEditorTheme should reject invalid values': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setEditorTheme('invalid');
		if(editor.editorTheme !== 'auto'){
			cleanup(container);
			return fail(`Should not accept invalid theme, got '${editor.editorTheme}'`);
		}
		cleanup(container);
		pass('setEditorTheme rejects invalid values');
	},

	'increaseFontSize should increase fontSize': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.increaseFontSize();
		if(editor.fontSize !== 16){
			cleanup(container);
			return fail(`Expected 16, got ${editor.fontSize}`);
		}
		cleanup(container);
		pass('increaseFontSize works');
	},

	'decreaseFontSize should decrease fontSize': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.decreaseFontSize();
		if(editor.fontSize !== 12){
			cleanup(container);
			return fail(`Expected 12, got ${editor.fontSize}`);
		}
		cleanup(container);
		pass('decreaseFontSize works');
	},

	'fontSize should clamp to bounds': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		for(let i = 0; i < 20; i++) editor.increaseFontSize();
		if(editor.fontSize !== 40){
			cleanup(container);
			return fail(`Expected max 40, got ${editor.fontSize}`);
		}
		editor.fontSize = 14;
		for(let i = 0; i < 20; i++) editor.decreaseFontSize();
		if(editor.fontSize !== 8){
			cleanup(container);
			return fail(`Expected min 8, got ${editor.fontSize}`);
		}
		cleanup(container);
		pass('fontSize clamps correctly');
	},

	'setWordWrap should update wordWrap property': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setWordWrap(false);
		if(editor.wordWrap !== false){
			cleanup(container);
			return fail(`Expected false, got ${editor.wordWrap}`);
		}
		editor.setWordWrap(true);
		if(editor.wordWrap !== true){
			cleanup(container);
			return fail(`Expected true, got ${editor.wordWrap}`);
		}
		cleanup(container);
		pass('setWordWrap updates property');
	},

	'setMinimap should update minimapEnabled property': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setMinimap(true);
		if(editor.minimapEnabled !== true){
			cleanup(container);
			return fail(`Expected true, got ${editor.minimapEnabled}`);
		}
		editor.setMinimap(false);
		if(editor.minimapEnabled !== false){
			cleanup(container);
			return fail(`Expected false, got ${editor.minimapEnabled}`);
		}
		cleanup(container);
		pass('setMinimap updates property');
	},

	'resolveMonacoTheme should return correct theme strings': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.editorTheme = 'dark';
		if(editor.resolveMonacoTheme() !== 'vs-dark'){
			cleanup(container);
			return fail(`Expected 'vs-dark' for dark theme`);
		}
		editor.editorTheme = 'light';
		if(editor.resolveMonacoTheme() !== 'vs'){
			cleanup(container);
			return fail(`Expected 'vs' for light theme`);
		}
		editor.editorTheme = 'auto';
		const autoTheme = editor.resolveMonacoTheme();
		if(autoTheme !== 'vs' && autoTheme !== 'vs-dark'){
			cleanup(container);
			return fail(`Expected 'vs' or 'vs-dark' for auto, got '${autoTheme}'`);
		}
		cleanup(container);
		pass('resolveMonacoTheme returns correct strings');
	},

	'proxy methods should return this for chaining': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const methods = [
			['setEditorTheme', 'dark'],
			['setWordWrap', false],
			['setMinimap', true],
			['increaseFontSize'],
			['decreaseFontSize'],
			['copyToClipboard']
		];
		for(const [method, ...args] of methods){
			const result = editor[method](...args);
			if(result !== editor){
				cleanup(container);
				return fail(`${method} should return this`);
			}
		}
		cleanup(container);
		pass('Proxy methods return this for chaining');
	}
};
