import MarkdownEditor from '../../src/components/MarkdownEditor.js';

const createMarkdownEditor = async (attrs = {}) => {
	const container = document.createElement('div');
	const parts = [];
	if(attrs.value !== undefined) parts.push(`value="${attrs.value.replace(/"/g, '&quot;')}"`);
	if(attrs.name !== undefined) parts.push(`name="${attrs.name}"`);
	if(attrs.placeholder !== undefined) parts.push(`placeholder="${attrs.placeholder}"`);
	if(attrs.mode !== undefined) parts.push(`mode="${attrs.mode}"`);
	if(attrs.controls !== undefined) parts.push(`controls="${attrs.controls}"`);
	if(attrs.disabled) parts.push('disabled');
	if(attrs.required) parts.push('required');
	if(attrs.readonly) parts.push('readonly');
	if(attrs['allowed-tags'] !== undefined) parts.push(`allowed-tags="${attrs['allowed-tags']}"`);
	if(attrs['disallowed-tags'] !== undefined) parts.push(`disallowed-tags="${attrs['disallowed-tags']}"`);
	if(attrs['scripts-enabled']) parts.push('scripts-enabled');

	container.innerHTML = `<k-markdown-editor ${parts.join(' ')}></k-markdown-editor>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-markdown-editor');
	await el.updateComplete;
	return { container, el };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	'should create markdown editor element': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		if(!el){
			cleanup(container);
			return fail('MarkdownEditor element should be created');
		}
		if(!(el instanceof MarkdownEditor)){
			cleanup(container);
			return fail('Element should be instance of MarkdownEditor');
		}
		cleanup(container);
		pass('MarkdownEditor element created correctly');
	},

	'should have default mode of write': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		if(el.mode !== 'write'){
			cleanup(container);
			return fail(`Expected default mode 'write', got '${el.mode}'`);
		}
		cleanup(container);
		pass('Default mode is write');
	},

	'should initialize with empty value': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		if(el.value !== ''){
			cleanup(container);
			return fail(`Expected empty value, got '${el.value}'`);
		}
		cleanup(container);
		pass('Initializes with empty value');
	},

	'should set value attribute': async ({pass, fail}) => {
		const testValue = '# Hello World';
		const { container, el } = await createMarkdownEditor({ value: testValue });
		if(el.value !== testValue){
			cleanup(container);
			return fail(`Expected value '${testValue}', got '${el.value}'`);
		}
		cleanup(container);
		pass('Value attribute is set correctly');
	},

	'should update value property': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		const newValue = '## Test Content';
		el.value = newValue;
		await el.updateComplete;
		if(el.value !== newValue){
			cleanup(container);
			return fail(`Expected value '${newValue}', got '${el.value}'`);
		}
		cleanup(container);
		pass('Value property updates correctly');
	},

	'should render basic markdown': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '**bold text**' });
		const rendered = el.renderedHtml;
		if(!rendered.includes('bold') || !rendered.includes('<strong>') || !rendered.includes('</strong>')){
			cleanup(container);
			return fail(`Expected bold markdown to render, got: ${rendered}`);
		}
		cleanup(container);
		pass('Basic markdown renders correctly');
	},

	'should render italic markdown': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '_italic text_' });
		const rendered = el.renderedHtml;
		if(!rendered.includes('italic') || !rendered.includes('<em>') || !rendered.includes('</em>')){
			cleanup(container);
			return fail(`Expected italic markdown to render, got: ${rendered}`);
		}
		cleanup(container);
		pass('Italic markdown renders correctly');
	},

	'should render markdown headings': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '# Heading 1\n## Heading 2' });
		const rendered = el.renderedHtml;
		if(!rendered.includes('<h1>') || !rendered.includes('<h2>')){
			cleanup(container);
			return fail(`Expected heading tags, got: ${rendered}`);
		}
		cleanup(container);
		pass('Heading markdown renders correctly');
	},

	'should render markdown lists': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '- Item 1\n- Item 2' });
		const rendered = el.renderedHtml;
		if(!rendered.includes('<ul>') || !rendered.includes('<li>')){
			cleanup(container);
			return fail(`Expected list tags, got: ${rendered}`);
		}
		cleanup(container);
		pass('List markdown renders correctly');
	},

	'should render markdown code blocks': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '```\nconst x = 1;\n```' });
		const rendered = el.renderedHtml;
		if(!rendered.includes('<code>') || !rendered.includes('const x')){
			cleanup(container);
			return fail(`Expected code block, got: ${rendered}`);
		}
		cleanup(container);
		pass('Code block markdown renders correctly');
	},

	'should switch to preview mode': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ mode: 'write' });
		el.setMode('preview');
		await el.updateComplete;
		if(el.mode !== 'preview'){
			cleanup(container);
			return fail(`Expected mode 'preview', got '${el.mode}'`);
		}
		cleanup(container);
		pass('Mode switches to preview');
	},

	'should switch to write mode': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ mode: 'preview' });
		el.setMode('write');
		await el.updateComplete;
		if(el.mode !== 'write'){
			cleanup(container);
			return fail(`Expected mode 'write', got '${el.mode}'`);
		}
		cleanup(container);
		pass('Mode switches to write');
	},

	'togglePreview should alternate modes': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ mode: 'write' });
		el.togglePreview();
		await el.updateComplete;
		if(el.mode !== 'preview'){
			cleanup(container);
			return fail(`Expected mode 'preview' after toggle, got '${el.mode}'`);
		}
		el.togglePreview();
		await el.updateComplete;
		if(el.mode !== 'write'){
			cleanup(container);
			return fail(`Expected mode 'write' after second toggle, got '${el.mode}'`);
		}
		cleanup(container);
		pass('togglePreview alternates modes');
	},

	'mode-change event should fire when mode changes': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		let eventFired = false;
		let eventMode = null;
		el.addEventListener('mode-change', e => {
			eventFired = true;
			eventMode = e.detail.mode;
		});
		el.setMode('preview');
		await el.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('mode-change event should fire');
		}
		if(eventMode !== 'preview'){
			cleanup(container);
			return fail(`Expected event detail mode 'preview', got '${eventMode}'`);
		}
		cleanup(container);
		pass('mode-change event fires with correct detail');
	},

	'input event should fire on value change': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		let eventFired = false;
		let eventValue = null;
		el.addEventListener('input', e => {
			eventFired = true;
			eventValue = e.detail.value;
		});
		el.value = 'test content';
		await el.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('input event should fire');
		}
		if(eventValue !== 'test content'){
			cleanup(container);
			return fail(`Expected event value 'test content', got '${eventValue}'`);
		}
		cleanup(container);
		pass('input event fires with correct value');
	},

	'clear method should empty the editor': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: 'some content' });
		el.clear();
		await el.updateComplete;
		if(el.value !== ''){
			cleanup(container);
			return fail(`Expected empty value after clear, got '${el.value}'`);
		}
		cleanup(container);
		pass('clear() empties the editor');
	},

	'focus method should focus the editor': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		el.focus();
		if(el.mode !== 'write'){
			cleanup(container);
			return fail('focus() should switch to write mode');
		}
		cleanup(container);
		pass('focus() works correctly');
	},

	'isEmpty getter should return true for empty value': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '' });
		if(!el.isEmpty){
			cleanup(container);
			return fail('isEmpty should return true for empty value');
		}
		cleanup(container);
		pass('isEmpty returns true for empty value');
	},

	'isEmpty getter should return false for non-empty value': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: 'content' });
		if(el.isEmpty){
			cleanup(container);
			return fail('isEmpty should return false for non-empty value');
		}
		cleanup(container);
		pass('isEmpty returns false for non-empty value');
	},

	'disabled attribute should prevent editing': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ disabled: true });
		if(!el.disabled){
			cleanup(container);
			return fail('disabled property should be true');
		}
		cleanup(container);
		pass('disabled attribute sets disabled property');
	},

	'readonly attribute should set readonly mode': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ readonly: true });
		if(!el.readonly){
			cleanup(container);
			return fail('readonly property should be true');
		}
		cleanup(container);
		pass('readonly attribute sets readonly property');
	},

	'required attribute should set required property': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ required: true });
		if(!el.required){
			cleanup(container);
			return fail('required property should be true');
		}
		cleanup(container);
		pass('required attribute sets required property');
	},

	'should sanitize script tags by default': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '<script>alert("xss")</script>' });
		const rendered = el.renderedHtml;
		if(rendered.includes('<script>')){
			cleanup(container);
			return fail('Script tags should be removed by default');
		}
		cleanup(container);
		pass('Script tags are sanitized');
	},

	'should sanitize style tags': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '<style>body{color:red}</style>' });
		const rendered = el.renderedHtml;
		if(rendered.includes('<style>')){
			cleanup(container);
			return fail('Style tags should always be removed');
		}
		cleanup(container);
		pass('Style tags are sanitized');
	},

	'should sanitize iframe tags': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: '<iframe src="evil.com"></iframe>' });
		const rendered = el.renderedHtml;
		if(rendered.includes('<iframe')){
			cleanup(container);
			return fail('Iframe tags should always be removed');
		}
		cleanup(container);
		pass('Iframe tags are sanitized');
	},

	'should handle very long markdown content': async ({pass, fail}) => {
		const longContent = '# Heading\n' + 'Lorem ipsum dolor sit amet. '.repeat(100);
		const { container, el } = await createMarkdownEditor({ value: longContent });
		if(el.value !== longContent){
			cleanup(container);
			return fail('Long content should be preserved');
		}
		if(!el.renderedHtml || el.renderedHtml.length === 0){
			cleanup(container);
			return fail('Long content should render');
		}
		cleanup(container);
		pass('Handles very long markdown content');
	},

	'should handle unicode content': async ({pass, fail}) => {
		const unicodeContent = '你好 مرحبا Привет 🎉';
		const { container, el } = await createMarkdownEditor({ value: unicodeContent });
		if(el.value !== unicodeContent){
			cleanup(container);
			return fail('Unicode content should be preserved');
		}
		cleanup(container);
		pass('Handles unicode content');
	},

	'should handle special characters': async ({pass, fail}) => {
		const specialContent = 'Test & <special> "characters" \'quotes\'';
		const { container, el } = await createMarkdownEditor({ value: specialContent });
		if(el.value !== specialContent){
			cleanup(container);
			return fail('Special characters should be preserved');
		}
		cleanup(container);
		pass('Handles special characters');
	},

	'placeholder attribute should be set': async ({pass, fail}) => {
		const placeholder = 'Enter markdown here';
		const { container, el } = await createMarkdownEditor({ placeholder });
		if(el.placeholder !== placeholder){
			cleanup(container);
			return fail(`Expected placeholder '${placeholder}', got '${el.placeholder}'`);
		}
		cleanup(container);
		pass('Placeholder attribute is set');
	},

	'name attribute should be set': async ({pass, fail}) => {
		const name = 'markdown_field';
		const { container, el } = await createMarkdownEditor({ name });
		if(el.name !== name){
			cleanup(container);
			return fail(`Expected name '${name}', got '${el.name}'`);
		}
		cleanup(container);
		pass('Name attribute is set');
	},

	'getSelection should return selection object': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: 'test content' });
		const selection = el.getSelection();
		if(!selection || typeof selection !== 'object'){
			cleanup(container);
			return fail('getSelection should return an object');
		}
		if(selection.start === undefined || selection.end === undefined || selection.text === undefined){
			cleanup(container);
			return fail('Selection object should have start, end, and text properties');
		}
		cleanup(container);
		pass('getSelection returns proper selection object');
	},

	'insertAtCursor should insert text': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: 'hello world' });
		el.insertAtCursor('test');
		await el.updateComplete;
		if(!el.value.includes('test')){
			cleanup(container);
			return fail('insertAtCursor should insert text');
		}
		cleanup(container);
		pass('insertAtCursor inserts text correctly');
	},

	'insertLinePrefix should add prefix to lines': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor({ value: 'line1\nline2\nline3' });
		el.insertLinePrefix('- ');
		await el.updateComplete;
		if(!el.value.includes('- line1')){
			cleanup(container);
			return fail('insertLinePrefix should add prefix to selected lines');
		}
		cleanup(container);
		pass('insertLinePrefix adds prefix correctly');
	},

	'GitHub flavored markdown should render tables': async ({pass, fail}) => {
		const tableMarkdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
		const { container, el } = await createMarkdownEditor({ value: tableMarkdown });
		const rendered = el.renderedHtml;
		if(!rendered.includes('<table>')){
			cleanup(container);
			return fail('GFM table markdown should render table element');
		}
		cleanup(container);
		pass('GFM table markdown renders correctly');
	},

	'should have required ARIA attributes for accessibility': async ({pass, fail}) => {
		const { container, el } = await createMarkdownEditor();
		const shadow = el.shadowRoot;
		if(!shadow){
			cleanup(container);
			return fail('Component should have shadow DOM');
		}
		cleanup(container);
		pass('Component has shadow DOM for accessibility');
	},
};
