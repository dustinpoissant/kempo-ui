import ThemeSwitcher from '../../src/components/ThemeSwitcher.js';
import theme from '../../src/utils/theme.js';

const createThemeSwitcher = async () => {
	const container = document.createElement('div');
	container.innerHTML = `<k-theme-switcher></k-theme-switcher>`;
	document.body.appendChild(container);

	const switcher = container.querySelector('k-theme-switcher');
	await switcher.updateComplete;

	return { container, switcher };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
	// Reset theme to auto after each test
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

	'should cycle theme on click: auto to light': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('auto');
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
		pass('Theme cycles from auto to light');
	},

	'should cycle theme on click: light to dark': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('light');
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
		pass('Theme cycles from light to dark');
	},

	'should cycle theme on click: dark to auto': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('dark');
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
		pass('Theme cycles from dark to auto');
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

	'should show mode-auto icon when auto': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('auto');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const icon = switcher.shadowRoot.querySelector('k-icon');
		if(icon.name !== 'mode-auto'){
			cleanup(container);
			fail(`Expected icon name "mode-auto", got "${icon.name}"`);
			return;
		}

		cleanup(container);
		pass('Shows mode-auto icon when auto');
	},

	'should show mode-light icon when light': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('light');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const icon = switcher.shadowRoot.querySelector('k-icon');
		if(icon.name !== 'mode-light'){
			cleanup(container);
			fail(`Expected icon name "mode-light", got "${icon.name}"`);
			return;
		}

		cleanup(container);
		pass('Shows mode-light icon when light');
	},

	'should show mode-dark icon when dark': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await switcher.updateComplete;

		const icon = switcher.shadowRoot.querySelector('k-icon');
		if(icon.name !== 'mode-dark'){
			cleanup(container);
			fail(`Expected icon name "mode-dark", got "${icon.name}"`);
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

	'button should have no-btn class': async ({pass, fail}) => {
		const { container, switcher } = await createThemeSwitcher();

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

		// Change theme externally
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
	}
};
