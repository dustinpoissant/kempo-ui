import ThemeSwitcher from '../../src/components/ThemeSwitcher.js';
import theme from '../../src/utils/theme.js';

const createThemeSwitcher = async (attrs = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-theme-switcher ${attrs}></k-theme-switcher>`;
	document.body.appendChild(container);

	const switcher = container.querySelector('k-theme-switcher');
	await switcher.updateComplete;

	return { container, switcher };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
	theme.set('auto');
};

export default {
	/*
		ThemeSwitcher Component Tests
	*/
	'should create theme-switcher element': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(!switcher){
			cleanup(container);
			fail('ThemeSwitcher element should be created');
			return;
		}

		if(!(switcher instanceof ThemeSwitcher)){
			cleanup(container);
			fail('Element should be instance of ThemeSwitcher');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(!switcher.shadowRoot){
			cleanup(container);
			fail('ThemeSwitcher should have shadow root');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher has shadow root');
	},

	'should have currentTheme property': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(typeof switcher.currentTheme !== 'string'){
			cleanup(container);
			fail('ThemeSwitcher should have currentTheme property');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher has currentTheme property');
	},

	'should reflect current-theme attribute': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const currentTheme = switcher.getAttribute('current-theme');
		if(!currentTheme){
			cleanup(container);
			fail('current-theme attribute should be set');
			return;
		}

		cleanup(container);
		pass('current-theme attribute reflects correctly');
	},

	'should render button element': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const button = switcher.shadowRoot.querySelector('button');
		if(!button){
			cleanup(container);
			fail('ThemeSwitcher should render button');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher renders button');
	},

	'should render icon element': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const icon = switcher.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			fail('ThemeSwitcher should render k-icon');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher renders k-icon');
	},

	'should default to segmented mode': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const segmented = switcher.shadowRoot.querySelector('.segmented');
		if(!segmented){
			cleanup(container);
			fail('Default mode should render segmented control');
			return;
		}

		cleanup(container);
		pass('Default mode renders segmented control');
	},

	'segmented should render 3 buttons by default': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const buttons = switcher.shadowRoot.querySelectorAll('.segmented button');
		if(buttons.length !== 3){
			cleanup(container);
			fail(`Expected 3 buttons, got ${buttons.length}`);
			return;
		}

		cleanup(container);
		pass('Segmented renders 3 buttons by default');
	},

	'segmented should highlight active theme': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('light');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const active = switcher.shadowRoot.querySelector('.segmented button.active');
		if(!active){
			cleanup(container);
			fail('Segmented should have an active button');
			return;
		}

		const icon = active.querySelector('k-icon');
		if(icon.getAttribute('name') !== 'mode-light'){
			cleanup(container);
			fail(`Expected active icon "mode-light", got "${icon.getAttribute('name')}"`);
			return;
		}

		cleanup(container);
		pass('Segmented highlights active theme');
	},

	'segmented button click should set theme': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('auto');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const buttons = switcher.shadowRoot.querySelectorAll('.segmented button');
		buttons[2].click();
		await new Promise(r => setTimeout(r, 50));

		if(theme.get() !== 'dark'){
			cleanup(container);
			fail(`Expected theme "dark", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Segmented button click sets theme');
	},

	'should have inline display': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const display = getComputedStyle(switcher).display;

		// Note: Component has display defined in styles but browser may show inline
		if(display !== 'inline' && display !== 'flex'){
			cleanup(container);
			fail(`Expected display inline or flex, got ${display}`);
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher has correct display');
	},

	'should cycle theme on click in toggle mode: light to auto': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		theme.set('light');
		await switcher.updateComplete;

		const button = switcher.shadowRoot.querySelector('button');
		button.click();
		await switcher.updateComplete;

		if(theme.get() !== 'auto'){
			cleanup(container);
			fail(`Expected theme "auto", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Theme cycles from light to auto');
	},

	'should cycle theme on click in toggle mode: auto to dark': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		theme.set('auto');
		await switcher.updateComplete;

		const button = switcher.shadowRoot.querySelector('button');
		button.click();
		await switcher.updateComplete;

		if(theme.get() !== 'dark'){
			cleanup(container);
			fail(`Expected theme "dark", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Theme cycles from auto to dark');
	},

	'should cycle theme on click in toggle mode: dark to light': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		theme.set('dark');
		await switcher.updateComplete;

		const button = switcher.shadowRoot.querySelector('button');
		button.click();
		await switcher.updateComplete;

		if(theme.get() !== 'light'){
			cleanup(container);
			fail(`Expected theme "light", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Theme cycles from dark to light');
	},

	'should update currentTheme when theme changes': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		if(switcher.currentTheme !== 'dark'){
			cleanup(container);
			fail(`Expected currentTheme "dark", got "${switcher.currentTheme}"`);
			return;
		}

		cleanup(container);
		pass('currentTheme updates when theme changes');
	},

	'should show mode-auto icon in toggle mode when auto': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		theme.set('auto');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const icon = switcher.shadowRoot.querySelector('k-icon');
		if(icon.getAttribute('name') !== 'mode-auto'){
			cleanup(container);
			fail(`Expected icon name "mode-auto", got "${icon.getAttribute('name')}"`);
			return;
		}

		cleanup(container);
		pass('Shows mode-auto icon when auto');
	},

	'should show mode-light icon in toggle mode when light': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		theme.set('light');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const icon = switcher.shadowRoot.querySelector('k-icon');
		if(icon.getAttribute('name') !== 'mode-light'){
			cleanup(container);
			fail(`Expected icon name "mode-light", got "${icon.getAttribute('name')}"`);
			return;
		}

		cleanup(container);
		pass('Shows mode-light icon when light');
	},

	'should show mode-dark icon in toggle mode when dark': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const icon = switcher.shadowRoot.querySelector('k-icon');
		if(icon.getAttribute('name') !== 'mode-dark'){
			cleanup(container);
			fail(`Expected icon name "mode-dark", got "${icon.getAttribute('name')}"`);
			return;
		}

		cleanup(container);
		pass('Shows mode-dark icon when dark');
	},

	'should have static setTheme method': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(typeof ThemeSwitcher.setTheme !== 'function'){
			cleanup(container);
			fail('ThemeSwitcher should have static setTheme method');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher has static setTheme method');
	},

	'static setTheme should set theme': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		ThemeSwitcher.setTheme('light');

		if(theme.get() !== 'light'){
			cleanup(container);
			fail(`Expected theme "light", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Static setTheme sets theme');
	},

	'should have static getCurrentTheme method': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(typeof ThemeSwitcher.getCurrentTheme !== 'function'){
			cleanup(container);
			fail('ThemeSwitcher should have static getCurrentTheme method');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher has static getCurrentTheme method');
	},

	'static getCurrentTheme should return current theme': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('dark');
		const current = ThemeSwitcher.getCurrentTheme();

		if(current !== 'dark'){
			cleanup(container);
			fail(`Expected "dark", got "${current}"`);
			return;
		}

		cleanup(container);
		pass('Static getCurrentTheme returns current theme');
	},

	'should have static getCalculatedCurrentTheme method': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(typeof ThemeSwitcher.getCalculatedCurrentTheme !== 'function'){
			cleanup(container);
			fail('ThemeSwitcher should have static getCalculatedCurrentTheme method');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher has static getCalculatedCurrentTheme method');
	},

	'static getCalculatedCurrentTheme should return light or dark': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('auto');
		const calculated = ThemeSwitcher.getCalculatedCurrentTheme();

		if(calculated !== 'light' && calculated !== 'dark'){
			cleanup(container);
			fail(`Expected "light" or "dark", got "${calculated}"`);
			return;
		}

		cleanup(container);
		pass('Static getCalculatedCurrentTheme returns light or dark');
	},

	'should subscribe to theme changes on connect': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(typeof switcher.unsubscribe !== 'function'){
			cleanup(container);
			fail('ThemeSwitcher should have unsubscribe function after connect');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher subscribes to theme changes');
	},

	'should unsubscribe on disconnect': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const originalUnsubscribe = switcher.unsubscribe;
		let unsubscribeCalled = false;
		switcher.unsubscribe = () => {
			unsubscribeCalled = true;
			originalUnsubscribe();
		};

		switcher.disconnectedCallback();

		if(!unsubscribeCalled){
			cleanup(container);
			fail('unsubscribe should be called on disconnect');
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher unsubscribes on disconnect');
	},

	'toggle button should have no-btn class': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		const button = switcher.shadowRoot.querySelector('button');
		if(!button.classList.contains('no-btn')){
			cleanup(container);
			fail('Button should have no-btn class');
			return;
		}

		cleanup(container);
		pass('Button has no-btn class');
	},

	'should sync with external theme changes': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		if(switcher.currentTheme !== 'dark'){
			cleanup(container);
			fail(`Expected currentTheme to sync to "dark", got "${switcher.currentTheme}"`);
			return;
		}

		cleanup(container);
		pass('ThemeSwitcher syncs with external theme changes');
	},

	/*
		Mode Property Tests
	*/
	'should have mode property defaulting to auto': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(switcher.mode !== 'auto'){
			cleanup(container);
			fail(`Expected mode "auto", got "${switcher.mode}"`);
			return;
		}

		cleanup(container);
		pass('Mode defaults to auto');
	},

	'should render toggle mode when mode=toggle': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle"');

		const segmented = switcher.shadowRoot.querySelector('.segmented');
		const button = switcher.shadowRoot.querySelector('button.no-btn');
		if(segmented){
			cleanup(container);
			fail('Toggle mode should not render segmented control');
			return;
		}
		if(!button){
			cleanup(container);
			fail('Toggle mode should render a single no-btn button');
			return;
		}

		cleanup(container);
		pass('Toggle mode renders correctly');
	},

	'should render segmented mode when mode=segmented': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="segmented"');

		const segmented = switcher.shadowRoot.querySelector('.segmented');
		if(!segmented){
			cleanup(container);
			fail('Segmented mode should render segmented control');
			return;
		}

		cleanup(container);
		pass('Segmented mode renders correctly');
	},

	/*
		Options Property Tests
	*/
	'should have options property defaulting to light, auto, dark': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(switcher.options !== 'light, auto, dark'){
			cleanup(container);
			fail(`Expected options "light, auto, dark", got "${switcher.options}"`);
			return;
		}

		cleanup(container);
		pass('Options defaults to "light, auto, dark"');
	},

	'custom options should limit segmented buttons': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('options="dark, light"');

		const buttons = switcher.shadowRoot.querySelectorAll('.segmented button');
		if(buttons.length !== 2){
			cleanup(container);
			fail(`Expected 2 buttons, got ${buttons.length}`);
			return;
		}

		cleanup(container);
		pass('Custom options limits segmented buttons');
	},

	'toggle should cycle through custom options only': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle" options="dark, light"');

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const button = switcher.shadowRoot.querySelector('button');
		button.click();
		await switcher.updateComplete;

		if(theme.get() !== 'light'){
			cleanup(container);
			fail(`Expected theme "light" after cycling from dark, got "${theme.get()}"`);
			return;
		}

		button.click();
		await switcher.updateComplete;

		if(theme.get() !== 'dark'){
			cleanup(container);
			fail(`Expected theme "dark" after cycling from light, got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Toggle cycles through custom options only');
	},

	'options with no spaces should parse correctly': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('options="dark,light,auto"');

		const buttons = switcher.shadowRoot.querySelectorAll('.segmented button');
		if(buttons.length !== 3){
			cleanup(container);
			fail(`Expected 3 buttons, got ${buttons.length}`);
			return;
		}

		cleanup(container);
		pass('Options without spaces parse correctly');
	},

	/*
		Auto Mode Aside Detection Tests
	*/
	'auto mode without aside should resolve to segmented': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(switcher.resolvedMode !== 'segmented'){
			cleanup(container);
			fail(`Expected resolvedMode "segmented", got "${switcher.resolvedMode}"`);
			return;
		}

		cleanup(container);
		pass('Auto mode without aside resolves to segmented');
	},

	/*
		Labels Tests
	*/
	'should have labels property defaulting to null': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		if(switcher.labels !== null){
			cleanup(container);
			fail(`Expected labels null, got ${switcher.labels}`);
			return;
		}

		cleanup(container);
		pass('labels defaults to null');
	},

	'labels attribute (no value) shows capitalized option names in segmented mode': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('labels');

		await switcher.updateComplete;
		const spans = switcher.shadowRoot.querySelectorAll('.segmented button span');
		if(spans.length !== 3){
			cleanup(container);
			fail(`Expected 3 label spans, got ${spans.length}`);
			return;
		}

		cleanup(container);
		pass('labels (no value) shows 3 label spans in segmented mode');
	},

	'labels attribute (no value) uses capitalized option text': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('labels');

		theme.set('light');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const spans = switcher.shadowRoot.querySelectorAll('.segmented button span');
		const texts = Array.from(spans).map(s => s.textContent.trim());
		if(!texts.includes('Light') || !texts.includes('Auto') || !texts.includes('Dark')){
			cleanup(container);
			fail(`Expected labels Light/Auto/Dark, got: ${texts.join(', ')}`);
			return;
		}

		cleanup(container);
		pass('labels (no value) shows capitalized text');
	},

	'labels attribute with custom values uses those labels': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('labels="Sun, System, Moon"');

		await switcher.updateComplete;
		const spans = switcher.shadowRoot.querySelectorAll('.segmented button span');
		const texts = Array.from(spans).map(s => s.textContent.trim());
		if(texts[0] !== 'Sun' || texts[1] !== 'System' || texts[2] !== 'Moon'){
			cleanup(container);
			fail(`Expected labels Sun/System/Moon, got: ${texts.join(', ')}`);
			return;
		}

		cleanup(container);
		pass('labels uses custom label values');
	},

	'labels attribute shows label in toggle mode': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle" labels');

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const span = switcher.shadowRoot.querySelector('button span');
		if(!span || span.textContent.trim() !== 'Dark'){
			cleanup(container);
			fail(`Expected label span with "Dark", got ${span ? span.textContent : 'null'}`);
			return;
		}

		cleanup(container);
		pass('labels shows label in toggle mode');
	},

	'custom labels with toggle mode shows correct label for active theme': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher('mode="toggle" labels="Sun, System, Moon"');

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const span = switcher.shadowRoot.querySelector('button span');
		if(!span || span.textContent.trim() !== 'Moon'){
			cleanup(container);
			fail(`Expected label span with "Moon", got ${span ? span.textContent : 'null'}`);
			return;
		}

		cleanup(container);
		pass('custom labels toggle shows correct label for active theme');
	},

	'without labels attribute no spans are rendered': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		const spans = switcher.shadowRoot.querySelectorAll('button span');
		if(spans.length !== 0){
			cleanup(container);
			fail(`Expected 0 label spans without labels attr, got ${spans.length}`);
			return;
		}

		cleanup(container);
		pass('No label spans without labels attribute');
	}
};
