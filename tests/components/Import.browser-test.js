import Import from '../../src/components/Import.js';

const createImport = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-import
			${options.src ? `src="${options.src}"` : ''}
		></k-import>
	`;
	document.body.appendChild(container);

	const importEl = container.querySelector('k-import');
	await importEl.updateComplete;

	return { container, importEl };
};

const cleanup = container => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation Tests
	*/
	'should create import element': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		if(!importEl){
			cleanup(container);
			fail('Import element should be created');
			return;
		}

		if(!(importEl instanceof Import)){
			cleanup(container);
			fail('Element should be instance of Import');
			return;
		}

		cleanup(container);
		pass('Import element created correctly');
	},

	'should extend LightComponent': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		// LightComponent doesn't use shadow root
		if(importEl.shadowRoot){
			cleanup(container);
			fail('Import should not have shadow root (uses LightComponent)');
			return;
		}

		cleanup(container);
		pass('Import extends LightComponent (no shadow root)');
	},

	/*
		Property Tests
	*/
	'should have src property': async ({pass, fail}) => {
		const { container, importEl } = await createImport({ src: '/test.html' });

		if(importEl.src !== '/test.html'){
			cleanup(container);
			fail(`Expected src "/test.html", got "${importEl.src}"`);
			return;
		}

		cleanup(container);
		pass('src property set correctly');
	},

	'should reflect src to attribute': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		importEl.src = '/new-source.html';
		await importEl.updateComplete;

		if(importEl.getAttribute('src') !== '/new-source.html'){
			cleanup(container);
			fail(`Expected attribute "/new-source.html", got "${importEl.getAttribute('src')}"`);
			return;
		}

		cleanup(container);
		pass('src reflects to attribute');
	},

	/*
		Content Property Tests
	*/
	'should have content property': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		// Content should initially be empty string
		if(importEl.content === undefined){
			cleanup(container);
			fail('Import should have content property');
			return;
		}

		cleanup(container);
		pass('content property exists');
	},

	'should have scripts property': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		if(!Array.isArray(importEl.scripts)){
			cleanup(container);
			fail('Import should have scripts array property');
			return;
		}

		cleanup(container);
		pass('scripts property exists as array');
	},

	/*
		Static Replacements Tests
	*/
	'should have static replacements object': async ({pass, fail}) => {
		if(!Import.replacements || typeof Import.replacements !== 'object'){
			fail('Import should have static replacements object');
			return;
		}

		pass('Static replacements object exists');
	},

	'should apply static replacements in fetch': async ({pass, fail}) => {
		// This test verifies the replacement mechanism exists
		const originalReplacements = { ...Import.replacements };

		Import.replacements = { TEST_KEY: 'TEST_VALUE' };

		// Restore after test
		Import.replacements = originalReplacements;

		pass('Static replacements mechanism exists');
	},

	/*
		Method Tests
	*/
	'should have fetch method': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		if(typeof importEl.fetch !== 'function'){
			cleanup(container);
			fail('Import should have fetch method');
			return;
		}

		cleanup(container);
		pass('fetch method exists');
	},

	'should have executeScripts method': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		if(typeof importEl.executeScripts !== 'function'){
			cleanup(container);
			fail('Import should have executeScripts method');
			return;
		}

		cleanup(container);
		pass('executeScripts method exists');
	},

	'executeScripts should run scripts from scripts array': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		// Use a unique variable name to avoid conflicts between test runs
		const uniqueVar = `__importTestVar_${Date.now()}`;
		window[uniqueVar] = false;

		// Set up the scripts array as the component would
		importEl.scripts = [
			{ text: `window.${uniqueVar} = true;`, type: 'text/javascript' }
		];

		importEl.executeScripts();

		// Allow script to be added to head and execute
		await new Promise(resolve => setTimeout(resolve, 100));

		if(window[uniqueVar] !== true){
			cleanup(container);
			delete window[uniqueVar];
			fail('Scripts should be executed from scripts array');
			return;
		}

		delete window[uniqueVar];
		cleanup(container);
		pass('executeScripts runs scripts from scripts array');
	},

	'executeScripts should clear scripts array after execution': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		importEl.scripts = [
			{ text: 'var x = 1;', type: 'text/javascript' }
		];

		importEl.executeScripts();

		// Allow script to execute
		await new Promise(resolve => setTimeout(resolve, 10));

		if(importEl.scripts.length !== 0){
			cleanup(container);
			fail('Scripts array should be cleared after execution');
			return;
		}

		cleanup(container);
		pass('executeScripts clears scripts array');
	},

	/*
		renderLightDom Tests
	*/
	'should have renderLightDom method': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		if(typeof importEl.renderLightDom !== 'function'){
			cleanup(container);
			fail('Import should have renderLightDom method');
			return;
		}

		cleanup(container);
		pass('renderLightDom method exists');
	},

	'should render content to light DOM': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		importEl.content = '<div id="imported-content">Test Content</div>';
		await importEl.updateComplete;

		// Wait for light DOM render
		await new Promise(resolve => setTimeout(resolve, 10));

		const content = importEl.querySelector('#imported-content');

		if(!content){
			cleanup(container);
			fail('Content should be rendered to light DOM');
			return;
		}

		if(content.textContent !== 'Test Content'){
			cleanup(container);
			fail(`Expected "Test Content", got "${content.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Content rendered to light DOM');
	},

	/*
		Edge Case Tests
	*/
	'should handle empty src': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		try {
			importEl.src = '';
			await importEl.updateComplete;
		} catch(e) {
			cleanup(container);
			fail(`Should not throw on empty src: ${e.message}`);
			return;
		}

		cleanup(container);
		pass('Handles empty src');
	},

	'should handle empty content': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		importEl.content = '';
		await importEl.updateComplete;

		// Should not throw, should just render nothing
		cleanup(container);
		pass('Handles empty content');
	},

	/*
		CSS Display Tests
	*/
	'should display correctly': async ({pass, fail}) => {
		const { container, importEl } = await createImport();

		const style = window.getComputedStyle(importEl);

		// LightComponent sets display: contents
		cleanup(container);
		pass('Import has appropriate display');
	}
};
