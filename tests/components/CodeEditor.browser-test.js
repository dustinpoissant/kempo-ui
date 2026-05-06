import CodeEditor from '../../src/components/CodeEditor.js';

const createEditor = async (attrs = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-code-editor language="javascript" ${attrs} style="height:200px"></k-code-editor>`;
	document.body.appendChild(container);
	const editor = container.querySelector('k-code-editor');
	await new Promise(r => editor.addEventListener('ready', r, { once: true }));
	return { container, editor };
};

const cleanup = container => {
	const editor = container.querySelector('k-code-editor');
	if(editor?.fullscreen) editor.exitFullscreen();
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Fullscreen
	*/
	'fullscreen should default to false': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.fullscreen !== false){
			cleanup(container);
			return fail('fullscreen should default to false');
		}
		cleanup(container);
		pass();
	},

	'enterFullscreen should set fullscreen to true': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.enterFullscreen();
		if(!editor.fullscreen){
			cleanup(container);
			return fail('fullscreen should be true after enterFullscreen()');
		}
		cleanup(container);
		pass();
	},

	'exitFullscreen should set fullscreen to false': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.enterFullscreen();
		editor.exitFullscreen();
		if(editor.fullscreen){
			cleanup(container);
			return fail('fullscreen should be false after exitFullscreen()');
		}
		cleanup(container);
		pass();
	},

	'toggleFullscreen should alternate fullscreen': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.toggleFullscreen();
		if(!editor.fullscreen){
			cleanup(container);
			return fail('First toggle should set fullscreen to true');
		}
		editor.toggleFullscreen();
		if(editor.fullscreen){
			cleanup(container);
			return fail('Second toggle should set fullscreen to false');
		}
		cleanup(container);
		pass();
	},

	'enterFullscreen should dispatch fullscreen-changed with true': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		let detail = null;
		editor.addEventListener('fullscreen-changed', e => { detail = e.detail; }, { once: true });
		editor.enterFullscreen();
		if(!detail || detail.fullscreen !== true){
			cleanup(container);
			return fail('Should dispatch fullscreen-changed with fullscreen: true');
		}
		cleanup(container);
		pass();
	},

	'exitFullscreen should dispatch fullscreen-changed with false': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.enterFullscreen();
		let detail = null;
		editor.addEventListener('fullscreen-changed', e => { detail = e.detail; }, { once: true });
		editor.exitFullscreen();
		if(!detail || detail.fullscreen !== false){
			cleanup(container);
			return fail('Should dispatch fullscreen-changed with fullscreen: false');
		}
		cleanup(container);
		pass();
	},

	'fullscreen should reflect as attribute': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.enterFullscreen();
		await editor.updateComplete;
		if(!editor.hasAttribute('fullscreen')){
			cleanup(container);
			return fail('Should have fullscreen attribute when fullscreen=true');
		}
		editor.exitFullscreen();
		await editor.updateComplete;
		if(editor.hasAttribute('fullscreen')){
			cleanup(container);
			return fail('Should remove fullscreen attribute when fullscreen=false');
		}
		cleanup(container);
		pass();
	},

	/*
		Word Wrap
	*/
	'wordWrap should default to true': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.wordWrap !== true){
			cleanup(container);
			return fail('wordWrap should default to true');
		}
		cleanup(container);
		pass();
	},

	'toggleWordWrap should alternate wordWrap': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.toggleWordWrap();
		if(editor.wordWrap !== false){
			cleanup(container);
			return fail('First toggle should set wordWrap to false');
		}
		editor.toggleWordWrap();
		if(editor.wordWrap !== true){
			cleanup(container);
			return fail('Second toggle should set wordWrap to true');
		}
		cleanup(container);
		pass();
	},

	'setWordWrap should dispatch word-wrap-changed': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		let detail = null;
		editor.addEventListener('word-wrap-changed', e => { detail = e.detail; }, { once: true });
		editor.setWordWrap(false);
		await editor.updateComplete;
		if(!detail || detail.wordWrap !== false){
			cleanup(container);
			return fail('Should dispatch word-wrap-changed with wordWrap: false');
		}
		cleanup(container);
		pass();
	},

	/*
		Minimap
	*/
	'minimapEnabled should default to false': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		if(editor.minimapEnabled !== false){
			cleanup(container);
			return fail('minimapEnabled should default to false');
		}
		cleanup(container);
		pass();
	},

	'toggleMinimap should alternate minimapEnabled': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.toggleMinimap();
		if(editor.minimapEnabled !== true){
			cleanup(container);
			return fail('First toggle should set minimapEnabled to true');
		}
		editor.toggleMinimap();
		if(editor.minimapEnabled !== false){
			cleanup(container);
			return fail('Second toggle should set minimapEnabled to false');
		}
		cleanup(container);
		pass();
	},

	'setMinimap should dispatch minimap-changed': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		let detail = null;
		editor.addEventListener('minimap-changed', e => { detail = e.detail; }, { once: true });
		editor.setMinimap(true);
		await editor.updateComplete;
		if(!detail || detail.minimapEnabled !== true){
			cleanup(container);
			return fail('Should dispatch minimap-changed with minimapEnabled: true');
		}
		cleanup(container);
		pass();
	},

	/*
		Language
	*/
	'setLanguage should dispatch language-changed': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		let detail = null;
		editor.addEventListener('language-changed', e => { detail = e.detail; }, { once: true });
		editor.setLanguage('css');
		await editor.updateComplete;
		if(!detail || detail.language !== 'css'){
			cleanup(container);
			return fail('Should dispatch language-changed with language: css');
		}
		cleanup(container);
		pass();
	},

	/*
		Editor Theme
	*/
	'setEditorTheme should dispatch editor-theme-changed': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		let detail = null;
		editor.addEventListener('editor-theme-changed', e => { detail = e.detail; }, { once: true });
		editor.setEditorTheme('dark');
		await editor.updateComplete;
		if(!detail || detail.editorTheme !== 'dark'){
			cleanup(container);
			return fail('Should dispatch editor-theme-changed with editorTheme: dark');
		}
		cleanup(container);
		pass();
	},

	'setEditorTheme should reject invalid values': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setEditorTheme('auto');
		editor.setEditorTheme('invalid');
		if(editor.editorTheme !== 'auto'){
			cleanup(container);
			return fail('Should not change editorTheme to invalid value');
		}
		cleanup(container);
		pass();
	},

	/*
		Public API
	*/
	'formatCode should not throw without monacoEditor': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		try {
			editor.formatCode();
			cleanup(container);
			pass();
		} catch(e) {
			cleanup(container);
			fail(`formatCode threw: ${e.message}`);
		}
	},

	'getValue should return current value': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		const val = editor.getValue();
		if(typeof val !== 'string'){
			cleanup(container);
			return fail('getValue should return a string');
		}
		cleanup(container);
		pass();
	},

	'setValue should update value': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setValue('console.log("test");');
		const val = editor.getValue();
		if(val !== 'console.log("test");'){
			cleanup(container);
			return fail(`Expected "console.log("test");", got "${val}"`);
		}
		cleanup(container);
		pass();
	},

	'clear should empty the editor': async ({pass, fail}) => {
		const { container, editor } = await createEditor();
		editor.setValue('some code');
		editor.clear();
		if(editor.getValue() !== ''){
			cleanup(container);
			return fail('clear should set value to empty string');
		}
		cleanup(container);
		pass();
	},

	/*
		Control Module Loading
	*/
	'should only load modules defined in the full control set': async ({pass, fail}) => {
		const savedSet = CodeEditor.loadedModules;
		CodeEditor.loadedModules = new Set();
		const { container, editor } = await createEditor('controls="full"');
		const loaded = new Set(CodeEditor.loadedModules);
		CodeEditor.loadedModules = savedSet;
		cleanup(container);
		const expected = new Set(CodeEditor.controlModules.full);
		const extra = [...loaded].filter(m => !expected.has(m));
		const missing = [...expected].filter(m => !loaded.has(m));
		if(extra.length || missing.length)
			return fail(`loadedModules mismatch. Extra: [${extra}], Missing: [${missing}]`);
		pass('Only full preset modules were loaded for CodeEditor');
	},

	'should not load any modules when controls is not set': async ({pass, fail}) => {
		const savedSet = CodeEditor.loadedModules;
		CodeEditor.loadedModules = new Set();
		const { container, editor } = await createEditor();
		const loaded = new Set(CodeEditor.loadedModules);
		CodeEditor.loadedModules = savedSet;
		cleanup(container);
		if(loaded.size !== 0)
			return fail(`Expected no modules loaded, but got: [${[...loaded]}]`);
		pass('No modules loaded when controls is not set for CodeEditor');
	},

	'should not load any modules for an unknown controls preset': async ({pass, fail}) => {
		const savedSet = CodeEditor.loadedModules;
		CodeEditor.loadedModules = new Set();
		const { container, editor } = await createEditor('controls="not_a_real_preset"');
		const loaded = new Set(CodeEditor.loadedModules);
		CodeEditor.loadedModules = savedSet;
		cleanup(container);
		if(loaded.size !== 0)
			return fail(`Expected no modules loaded for unknown preset, but got: [${[...loaded]}]`);
		pass('No modules loaded for unknown controls preset in CodeEditor');
	}
};
