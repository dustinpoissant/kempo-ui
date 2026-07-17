import Tags from '../../src/components/Tags.js';

const createTags = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-tags 
			${options.value ? `value="${options.value}"` : ''}
			${options.allowedTags ? `allowed-tags="${options.allowedTags}"` : ''}
			${options.disallowedTags ? `disallowed-tags="${options.disallowedTags}"` : ''}
		>
			<span>Label</span>
		</k-tags>
	`;
	document.body.appendChild(container);

	const tags = container.querySelector('k-tags');
	await tags.updateComplete;

	return { container, tags };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Tags Component Tests
	*/
	'should create tags element': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(!tags){
			cleanup(container);
			fail('Tags element should be created');
			return;
		}

		if(!(tags instanceof Tags)){
			cleanup(container);
			fail('Element should be instance of Tags');
			return;
		}

		cleanup(container);
		pass('Tags element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(!tags.shadowRoot){
			cleanup(container);
			fail('Tags should have shadow root');
			return;
		}

		cleanup(container);
		pass('Tags has shadow root');
	},

	'should have default value as empty string': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(tags.value !== ''){
			cleanup(container);
			fail(`Expected value to be empty, got "${tags.value}"`);
			return;
		}

		cleanup(container);
		pass('Default value is empty string');
	},

	'should have default allowedTags as empty string': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(tags.allowedTags !== ''){
			cleanup(container);
			fail(`Expected allowedTags to be empty, got "${tags.allowedTags}"`);
			return;
		}

		cleanup(container);
		pass('Default allowedTags is empty string');
	},

	'should have default disallowedTags as empty string': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(tags.disallowedTags !== ''){
			cleanup(container);
			fail(`Expected disallowedTags to be empty, got "${tags.disallowedTags}"`);
			return;
		}

		cleanup(container);
		pass('Default disallowedTags is empty string');
	},

	'should set value from attribute': async ({pass, fail}) => {
		const { container, tags } = await createTags({ value: 'tag1,tag2,tag3' });

		if(tags.value !== 'tag1,tag2,tag3'){
			cleanup(container);
			fail(`Expected value "tag1,tag2,tag3", got "${tags.value}"`);
			return;
		}

		cleanup(container);
		pass('Value set from attribute');
	},

	'should reflect value attribute': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		tags.value = 'test,tags';
		await tags.updateComplete;

		const valueAttr = tags.getAttribute('value');
		if(valueAttr !== 'test,tags'){
			cleanup(container);
			fail(`Expected value attribute "test,tags", got "${valueAttr}"`);
			return;
		}

		cleanup(container);
		pass('Value attribute reflects correctly');
	},

	'should render label element': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const label = tags.shadowRoot.querySelector('label');
		if(!label){
			cleanup(container);
			fail('Tags should render label element');
			return;
		}

		cleanup(container);
		pass('Tags renders label element');
	},

	'should render tags holder': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const tagsHolder = tags.shadowRoot.getElementById('tagsHolder');
		if(!tagsHolder){
			cleanup(container);
			fail('Tags should render tagsHolder');
			return;
		}

		cleanup(container);
		pass('Tags renders tagsHolder');
	},

	'should render tags container': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const tagsContainer = tags.shadowRoot.getElementById('tags');
		if(!tagsContainer){
			cleanup(container);
			fail('Tags should render tags container');
			return;
		}

		cleanup(container);
		pass('Tags renders tags container');
	},

	'should render input element': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const input = tags.shadowRoot.getElementById('tagsInput');
		if(!input){
			cleanup(container);
			fail('Tags should render input element');
			return;
		}

		cleanup(container);
		pass('Tags renders input element');
	},

	'should render default slot for label': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const slot = tags.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			fail('Tags should have default slot');
			return;
		}

		cleanup(container);
		pass('Tags has default slot for label');
	},

	'should have addTag method': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(typeof tags.addTag !== 'function'){
			cleanup(container);
			fail('Tags should have addTag method');
			return;
		}

		cleanup(container);
		pass('Tags has addTag method');
	},

	'addTag should add a tag to value': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		tags.addTag('newtag');
		await tags.updateComplete;

		if(!tags.value.includes('newtag')){
			cleanup(container);
			fail(`Expected value to include "newtag", got "${tags.value}"`);
			return;
		}

		cleanup(container);
		pass('addTag adds tag to value');
	},

	'addTag should not add duplicate tags': async ({pass, fail}) => {
		const { container, tags } = await createTags({ value: 'tag1' });

		tags.addTag('tag1');
		await tags.updateComplete;

		const tagCount = tags.value.split(',').filter(t => t === 'tag1').length;
		if(tagCount !== 1){
			cleanup(container);
			fail(`Expected 1 occurrence of tag1, got ${tagCount}`);
			return;
		}

		cleanup(container);
		pass('addTag does not add duplicates');
	},

	'should have removeTag method': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(typeof tags.removeTag !== 'function'){
			cleanup(container);
			fail('Tags should have removeTag method');
			return;
		}

		cleanup(container);
		pass('Tags has removeTag method');
	},

	'removeTag should remove a tag from value': async ({pass, fail}) => {
		const { container, tags } = await createTags({ value: 'tag1,tag2,tag3' });

		tags.removeTag('tag2');
		await tags.updateComplete;

		if(tags.value.includes('tag2')){
			cleanup(container);
			fail('tag2 should be removed');
			return;
		}

		if(!tags.value.includes('tag1') || !tags.value.includes('tag3')){
			cleanup(container);
			fail('Other tags should remain');
			return;
		}

		cleanup(container);
		pass('removeTag removes tag from value');
	},

	'should have validateTags method': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(typeof tags.validateTags !== 'function'){
			cleanup(container);
			fail('Tags should have validateTags method');
			return;
		}

		cleanup(container);
		pass('Tags has validateTags method');
	},

	'validateTags should filter by allowed tags': async ({pass, fail}) => {
		const { container, tags } = await createTags({ 
			value: 'allowed1,allowed2,notallowed',
			allowedTags: 'allowed1,allowed2'
		});

		await tags.updateComplete;

		if(tags.value.includes('notallowed')){
			cleanup(container);
			fail('notallowed tag should be filtered out');
			return;
		}

		cleanup(container);
		pass('validateTags filters by allowed tags');
	},

	'validateTags should filter by disallowed tags': async ({pass, fail}) => {
		const { container, tags } = await createTags({ 
			value: 'good1,good2,bad',
			disallowedTags: 'bad'
		});

		await tags.updateComplete;

		if(tags.value.includes('bad')){
			cleanup(container);
			fail('bad tag should be filtered out');
			return;
		}

		if(!tags.value.includes('good1') || !tags.value.includes('good2')){
			cleanup(container);
			fail('Good tags should remain');
			return;
		}

		cleanup(container);
		pass('validateTags filters by disallowed tags');
	},

	'should have renderTags method': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		if(typeof tags.renderTags !== 'function'){
			cleanup(container);
			fail('Tags should have renderTags method');
			return;
		}

		cleanup(container);
		pass('Tags has renderTags method');
	},

	'should render tag elements for each value': async ({pass, fail}) => {
		const { container, tags } = await createTags({ value: 'tag1,tag2,tag3' });

		await tags.updateComplete;
		await new Promise(r => setTimeout(r, 50));

		const tagsContainer = tags.shadowRoot.getElementById('tags');
		const tagElements = tagsContainer.querySelectorAll('k-tag');

		if(tagElements.length !== 3){
			cleanup(container);
			fail(`Expected 3 tag elements, got ${tagElements.length}`);
			return;
		}

		cleanup(container);
		pass('Tag elements rendered for each value');
	},

	'should dispatch addtag event': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		let eventFired = false;
		let eventDetail = null;
		tags.addEventListener('addtag', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		tags.addTag('newtag');
		await tags.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('addtag event should be dispatched');
			return;
		}

		if(eventDetail.tag !== 'newtag'){
			cleanup(container);
			fail(`Expected tag "newtag" in detail, got "${eventDetail.tag}"`);
			return;
		}

		cleanup(container);
		pass('addtag event dispatched with correct detail');
	},

	'should dispatch removetag event': async ({pass, fail}) => {
		const { container, tags } = await createTags({ value: 'tag1,tag2' });

		let eventFired = false;
		let eventDetail = null;
		tags.addEventListener('removetag', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		tags.removeTag('tag1');
		await tags.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('removetag event should be dispatched');
			return;
		}

		if(eventDetail.tag !== 'tag1'){
			cleanup(container);
			fail(`Expected tag "tag1" in detail, got "${eventDetail.tag}"`);
			return;
		}

		cleanup(container);
		pass('removetag event dispatched with correct detail');
	},

	'should dispatch change event when value changes': async ({pass, fail}) => {
		const { container, tags } = await createTags({ value: 'initial' });

		let eventFired = false;
		let eventDetail = null;
		tags.addEventListener('change', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		tags.addTag('newtag');
		await tags.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('change event should be dispatched');
			return;
		}

		if(!eventDetail.newValue.includes('newtag')){
			cleanup(container);
			fail('change event should have new value in detail');
			return;
		}

		cleanup(container);
		pass('change event dispatched with correct detail');
	},

	'should have block display': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const display = getComputedStyle(tags).display;

		if(display !== 'block'){
			cleanup(container);
			fail(`Expected display block, got ${display}`);
			return;
		}

		cleanup(container);
		pass('Tags has block display');
	},

	'input should add tag on change': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'inputtag';
		input.dispatchEvent(new Event('change'));
		await tags.updateComplete;

		if(!tags.value.includes('inputtag')){
			cleanup(container);
			fail('Tag should be added on input change');
			return;
		}

		cleanup(container);
		pass('Input adds tag on change');
	},

	'input should be cleared after adding tag': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'inputtag';
		input.dispatchEvent(new Event('change'));
		await tags.updateComplete;

		if(input.value !== ''){
			cleanup(container);
			fail('Input should be cleared after adding tag');
			return;
		}

		cleanup(container);
		pass('Input cleared after adding tag');
	},

	'should add multiple tags from comma-separated input': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'tag1,tag2,tag3,';
		input.dispatchEvent(new InputEvent('input', { data: ',' }));
		await tags.updateComplete;

		if(!tags.value.includes('tag1') || !tags.value.includes('tag2') || !tags.value.includes('tag3')){
			cleanup(container);
			fail('All comma-separated tags should be added');
			return;
		}

		cleanup(container);
		pass('Multiple comma-separated tags added');
	},

	'should trim whitespace from tags': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		tags.addTag('  spacetag  ');
		await tags.updateComplete;

		if(tags.value !== 'spacetag'){
			cleanup(container);
			fail(`Expected "spacetag", got "${tags.value}"`);
			return;
		}

		cleanup(container);
		pass('Whitespace trimmed from tags');
	},

	'allowed-tags attribute should be reflected': async ({pass, fail}) => {
		const { container, tags } = await createTags({ allowedTags: 'a,b,c' });

		if(tags.allowedTags !== 'a,b,c'){
			cleanup(container);
			fail(`Expected allowedTags "a,b,c", got "${tags.allowedTags}"`);
			return;
		}

		cleanup(container);
		pass('allowed-tags attribute reflected');
	},

	'disallowed-tags attribute should be reflected': async ({pass, fail}) => {
		const { container, tags } = await createTags({ disallowedTags: 'x,y,z' });

		if(tags.disallowedTags !== 'x,y,z'){
			cleanup(container);
			fail(`Expected disallowedTags "x,y,z", got "${tags.disallowedTags}"`);
			return;
		}

		cleanup(container);
		pass('disallowed-tags attribute reflected');
	},

	'should not add empty tags': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = '';
		input.dispatchEvent(new Event('change'));
		await tags.updateComplete;

		if(tags.value !== ''){
			cleanup(container);
			fail('Empty tags should not be added');
			return;
		}

		cleanup(container);
		pass('Empty tags not added');
	},

	'should not add whitespace-only tags': async ({pass, fail}) => {
		const { container, tags } = await createTags();

		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = '   ';
		input.dispatchEvent(new Event('change'));
		await tags.updateComplete;

		if(tags.value !== ''){
			cleanup(container);
			fail('Whitespace-only tags should not be added');
			return;
		}

		cleanup(container);
		pass('Whitespace-only tags not added');
	},

	/*
		Disabled
	*/
	'disabled should default to false': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		if(tags.disabled !== false){
			cleanup(container);
			return fail(`Expected disabled to be false, got ${tags.disabled}`);
		}
		cleanup(container);
		pass('disabled defaults to false');
	},

	'should reflect disabled attribute': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-tags disabled></k-tags>';
		document.body.appendChild(container);
		const tags = container.querySelector('k-tags');
		await tags.updateComplete;
		if(!tags.hasAttribute('disabled')){
			cleanup(container);
			return fail('Tags should have disabled attribute');
		}
		if(tags.disabled !== true){
			cleanup(container);
			return fail(`Expected disabled property to be true, got ${tags.disabled}`);
		}
		cleanup(container);
		pass('disabled attribute reflects correctly');
	},

	'input change should not add tag when disabled': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-tags disabled></k-tags>';
		document.body.appendChild(container);
		const tags = container.querySelector('k-tags');
		await tags.updateComplete;
		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'newtag';
		input.dispatchEvent(new Event('change'));
		await tags.updateComplete;
		if(tags.value !== ''){
			cleanup(container);
			return fail(`Expected value to remain empty when disabled, got "${tags.value}"`);
		}
		cleanup(container);
		pass('Input change does not add tag when disabled');
	},

	'input event should not add tag when disabled': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-tags disabled></k-tags>';
		document.body.appendChild(container);
		const tags = container.querySelector('k-tags');
		await tags.updateComplete;
		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'tag1,tag2,';
		input.dispatchEvent(new InputEvent('input', { data: ',' }));
		await tags.updateComplete;
		if(tags.value !== ''){
			cleanup(container);
			return fail(`Expected value to remain empty when disabled, got "${tags.value}"`);
		}
		cleanup(container);
		pass('Input event does not add tag when disabled');
	},

	'clicking tag should not remove it when disabled': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-tags disabled value="design,ui"></k-tags>';
		document.body.appendChild(container);
		const tags = container.querySelector('k-tags');
		await tags.updateComplete;
		await new Promise(r => setTimeout(r, 50));
		const tagEl = tags.shadowRoot.getElementById('tags').querySelector('k-tag');
		if(!tagEl){
			cleanup(container);
			return fail('Expected a k-tag element to be rendered');
		}
		const span = tagEl.shadowRoot.querySelector('span');
		span.click();
		await tags.updateComplete;
		if(!tags.value.includes('design') || !tags.value.includes('ui')){
			cleanup(container);
			return fail(`Tags should not be removed when disabled, got "${tags.value}"`);
		}
		cleanup(container);
		pass('Clicking tag does not remove it when disabled');
	},

	'input should be disabled when disabled attribute is set': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-tags disabled></k-tags>';
		document.body.appendChild(container);
		const tags = container.querySelector('k-tags');
		await tags.updateComplete;
		const input = tags.shadowRoot.getElementById('tagsInput');
		if(!input.disabled){
			cleanup(container);
			return fail('Input should be disabled when Tags is disabled');
		}
		cleanup(container);
		pass('Input is disabled when Tags is disabled');
	},

	/*
		Suggestions
	*/
	'suggestionDebounce should default to 300': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		if(tags.suggestionDebounce !== 300){
			cleanup(container);
			return fail(`Expected suggestionDebounce 300, got ${tags.suggestionDebounce}`);
		}
		cleanup(container);
		pass('suggestionDebounce defaults to 300');
	},

	'getSuggestions should default to null': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		if(tags.getSuggestions !== null){
			cleanup(container);
			return fail('getSuggestions should default to null');
		}
		cleanup(container);
		pass('getSuggestions defaults to null');
	},

	'should show ghost suggestion after typing': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		tags.suggestionDebounce = 0;
		tags.getSuggestions = (query, cb) => cb(['tag1', 'tag12', 'tag123'].filter(t => t.startsWith(query)));
		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'tag1';
		input.dispatchEvent(new InputEvent('input', { data: '1' }));
		await new Promise(r => setTimeout(r, 20));
		const ghost = tags.shadowRoot.getElementById('ghost');
		if(ghost.textContent !== 'tag12'){
			cleanup(container);
			return fail(`Expected ghost "tag12", got "${ghost.textContent}"`);
		}
		if(ghost.querySelector('.suffix')?.textContent !== '2'){
			cleanup(container);
			return fail(`Expected muted suffix "2", got "${ghost.querySelector('.suffix')?.textContent}"`);
		}
		cleanup(container);
		pass('Ghost suggestion shown after typing');
	},

	'should support async getSuggestions': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		tags.suggestionDebounce = 0;
		tags.getSuggestions = async query => ['tag12'].filter(t => t.startsWith(query));
		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'tag1';
		input.dispatchEvent(new InputEvent('input', { data: '1' }));
		await new Promise(r => setTimeout(r, 20));
		if(tags.shadowRoot.getElementById('ghost').textContent !== 'tag12'){
			cleanup(container);
			return fail('Async getSuggestions should populate the ghost');
		}
		cleanup(container);
		pass('Async getSuggestions supported');
	},

	'backspace should cancel suggestion without deleting text': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		tags.suggestionDebounce = 0;
		tags.getSuggestions = (query, cb) => cb(['tag12']);
		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'tag1';
		input.dispatchEvent(new InputEvent('input', { data: '1' }));
		await new Promise(r => setTimeout(r, 20));
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
		await tags.updateComplete;
		if(tags.shadowRoot.getElementById('ghost').textContent !== ''){
			cleanup(container);
			return fail('Backspace should clear the ghost suggestion');
		}
		if(input.value !== 'tag1'){
			cleanup(container);
			return fail(`Backspace should not delete typed text, got "${input.value}"`);
		}
		cleanup(container);
		pass('Backspace cancels suggestion without deleting text');
	},

	'enter should accept the full suggestion': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		tags.suggestionDebounce = 0;
		tags.getSuggestions = (query, cb) => cb(['tag12']);
		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'tag1';
		input.dispatchEvent(new InputEvent('input', { data: '1' }));
		await new Promise(r => setTimeout(r, 20));
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
		await tags.updateComplete;
		if(tags.value !== 'tag12'){
			cleanup(container);
			return fail(`Enter should save the full suggestion "tag12", got "${tags.value}"`);
		}
		cleanup(container);
		pass('Enter accepts the full suggestion');
	},

	'tab after cancelling suggestion should save typed text': async ({pass, fail}) => {
		const { container, tags } = await createTags();
		tags.suggestionDebounce = 0;
		tags.getSuggestions = (query, cb) => cb(['tag12']);
		const input = tags.shadowRoot.getElementById('tagsInput');
		input.value = 'tag1';
		input.dispatchEvent(new InputEvent('input', { data: '1' }));
		await new Promise(r => setTimeout(r, 20));
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
		await tags.updateComplete;
		if(tags.value !== 'tag1'){
			cleanup(container);
			return fail(`Tab after cancel should save "tag1", got "${tags.value}"`);
		}
		cleanup(container);
		pass('Tab after cancel saves typed text');
	},

	/*
		Tag Wrapping
	*/
	'short two-word tag should not wrap onto multiple lines': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.style.width = '250px';
		container.innerHTML = '<k-tags value="Under Twenty"></k-tags>';
		document.body.appendChild(container);
		const tags = container.querySelector('k-tags');
		await tags.updateComplete;
		await new Promise(r => setTimeout(r, 50));

		const tagEl = tags.shadowRoot.getElementById('tags').querySelector('k-tag');
		await tagEl.updateComplete;
		const span = tagEl.shadowRoot.querySelector('span');
		const cs = getComputedStyle(span);
		const fontSize = parseFloat(cs.fontSize) || 16;
		const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
		const height = span.getBoundingClientRect().height;

		if(height > lineHeight * 1.5){
			cleanup(container);
			return fail(`Expected "Under Twenty" to render on a single line, got height ${height}px vs line-height ${lineHeight}px`);
		}
		cleanup(container);
		pass('Short two-word tag renders on a single line');
	},

	'very long tag should wrap onto multiple lines': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.style.width = '250px';
		container.innerHTML = '<k-tags value="this is a very long tag that should wrap across multiple lines eventually"></k-tags>';
		document.body.appendChild(container);
		const tags = container.querySelector('k-tags');
		await tags.updateComplete;
		await new Promise(r => setTimeout(r, 50));

		const tagEl = tags.shadowRoot.getElementById('tags').querySelector('k-tag');
		await tagEl.updateComplete;
		const span = tagEl.shadowRoot.querySelector('span');
		const cs = getComputedStyle(span);
		const fontSize = parseFloat(cs.fontSize) || 16;
		const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
		const height = span.getBoundingClientRect().height;

		if(height <= lineHeight * 1.5){
			cleanup(container);
			return fail(`Expected the long tag to wrap onto multiple lines, got height ${height}px vs line-height ${lineHeight}px`);
		}
		cleanup(container);
		pass('Very long tag wraps onto multiple lines');
	}
};
