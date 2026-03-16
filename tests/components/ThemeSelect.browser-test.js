import ThemeSelect from '../../src/components/ThemeSelect.js';
import theme from '../../src/utils/theme.js';

const createThemeSelect = async (innerHTML = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-theme-select>${innerHTML}</k-theme-select>`;
	document.body.appendChild(container);

	const select = container.querySelector('k-theme-select');
	await select.updateComplete;

	return { container, select };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
	theme.set('auto');
};

export default {
	/*
		ThemeSelect Component Tests
	*/
	'should create theme-select element': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		if(!select){
			cleanup(container);
			fail('ThemeSelect element should be created');
			return;
		}

		if(!(select instanceof ThemeSelect)){
			cleanup(container);
			fail('Element should be instance of ThemeSelect');
			return;
		}

		cleanup(container);
		pass('ThemeSelect element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		if(!select.shadowRoot){
			cleanup(container);
			fail('ThemeSelect should have shadow root');
			return;
		}

		cleanup(container);
		pass('ThemeSelect has shadow root');
	},

	'should have currentTheme property': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		if(typeof select.currentTheme !== 'string'){
			cleanup(container);
			fail('ThemeSelect should have currentTheme property');
			return;
		}

		cleanup(container);
		pass('ThemeSelect has currentTheme property');
	},

	'should reflect current-theme attribute': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		const currentTheme = select.getAttribute('current-theme');
		if(!currentTheme){
			cleanup(container);
			fail('current-theme attribute should be set');
			return;
		}

		cleanup(container);
		pass('current-theme attribute reflects correctly');
	},

	'should render select element': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		const selectEl = select.shadowRoot.querySelector('select');
		if(!selectEl){
			cleanup(container);
			fail('ThemeSelect should render a select element');
			return;
		}

		cleanup(container);
		pass('ThemeSelect renders select element');
	},

	'should render three options': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		const options = select.shadowRoot.querySelectorAll('option');
		if(options.length !== 3){
			cleanup(container);
			fail(`Expected 3 options, got ${options.length}`);
			return;
		}

		cleanup(container);
		pass('ThemeSelect renders three options');
	},

	'should have correct option values': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		const options = select.shadowRoot.querySelectorAll('option');
		const values = Array.from(options).map(o => o.value);

		if(!values.includes('light') || !values.includes('dark') || !values.includes('auto')){
			cleanup(container);
			fail(`Expected options with values light, dark, auto. Got ${values.join(', ')}`);
			return;
		}

		cleanup(container);
		pass('Options have correct values');
	},

	'should have correct option labels': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		const options = select.shadowRoot.querySelectorAll('option');
		const labels = Array.from(options).map(o => o.textContent);

		if(!labels.includes('Light') || !labels.includes('Dark') || !labels.includes('System Default')){
			cleanup(container);
			fail(`Expected labels Light, Dark, System Default. Got ${labels.join(', ')}`);
			return;
		}

		cleanup(container);
		pass('Options have correct labels');
	},

	'should not render label when no children': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		const label = select.shadowRoot.querySelector('label');
		if(label){
			cleanup(container);
			fail('ThemeSelect should not render label when no children provided');
			return;
		}

		cleanup(container);
		pass('No label rendered without children');
	},

	'should render label when children provided': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect('Theme');

		const label = select.shadowRoot.querySelector('label');
		if(!label){
			cleanup(container);
			fail('ThemeSelect should render label when children are provided');
			return;
		}

		cleanup(container);
		pass('Label rendered with children');
	},

	'should set theme on select change to light': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('auto');
		await select.updateComplete;

		const selectEl = select.shadowRoot.querySelector('select');
		selectEl.value = 'light';
		selectEl.dispatchEvent(new Event('change'));
		await select.updateComplete;

		if(theme.get() !== 'light'){
			cleanup(container);
			fail(`Expected theme "light", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Theme set to light on select change');
	},

	'should set theme on select change to dark': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('auto');
		await select.updateComplete;

		const selectEl = select.shadowRoot.querySelector('select');
		selectEl.value = 'dark';
		selectEl.dispatchEvent(new Event('change'));
		await select.updateComplete;

		if(theme.get() !== 'dark'){
			cleanup(container);
			fail(`Expected theme "dark", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Theme set to dark on select change');
	},

	'should set theme on select change to auto': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('light');
		await select.updateComplete;

		const selectEl = select.shadowRoot.querySelector('select');
		selectEl.value = 'auto';
		selectEl.dispatchEvent(new Event('change'));
		await select.updateComplete;

		if(theme.get() !== 'auto'){
			cleanup(container);
			fail(`Expected theme "auto", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Theme set to auto on select change');
	},

	'should update currentTheme when theme changes': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await select.updateComplete;

		if(select.currentTheme !== 'dark'){
			cleanup(container);
			fail(`Expected currentTheme "dark", got "${select.currentTheme}"`);
			return;
		}

		cleanup(container);
		pass('currentTheme updates when theme changes');
	},

	'should update select value when theme changes externally': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await select.updateComplete;

		const selectEl = select.shadowRoot.querySelector('select');
		if(selectEl.value !== 'dark'){
			cleanup(container);
			fail(`Expected select value "dark", got "${selectEl.value}"`);
			return;
		}

		cleanup(container);
		pass('Select value syncs with external theme changes');
	},

	'should have static setTheme method': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		if(typeof ThemeSelect.setTheme !== 'function'){
			cleanup(container);
			fail('ThemeSelect should have static setTheme method');
			return;
		}

		cleanup(container);
		pass('ThemeSelect has static setTheme method');
	},

	'static setTheme should set theme': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		ThemeSelect.setTheme('light');

		if(theme.get() !== 'light'){
			cleanup(container);
			fail(`Expected theme "light", got "${theme.get()}"`);
			return;
		}

		cleanup(container);
		pass('Static setTheme sets theme');
	},

	'should have static getCurrentTheme method': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		if(typeof ThemeSelect.getCurrentTheme !== 'function'){
			cleanup(container);
			fail('ThemeSelect should have static getCurrentTheme method');
			return;
		}

		cleanup(container);
		pass('ThemeSelect has static getCurrentTheme method');
	},

	'static getCurrentTheme should return current theme': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('dark');
		const current = ThemeSelect.getCurrentTheme();

		if(current !== 'dark'){
			cleanup(container);
			fail(`Expected "dark", got "${current}"`);
			return;
		}

		cleanup(container);
		pass('Static getCurrentTheme returns current theme');
	},

	'should have static getCalculatedCurrentTheme method': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		if(typeof ThemeSelect.getCalculatedCurrentTheme !== 'function'){
			cleanup(container);
			fail('ThemeSelect should have static getCalculatedCurrentTheme method');
			return;
		}

		cleanup(container);
		pass('ThemeSelect has static getCalculatedCurrentTheme method');
	},

	'static getCalculatedCurrentTheme should return light or dark': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('auto');
		const calculated = ThemeSelect.getCalculatedCurrentTheme();

		if(calculated !== 'light' && calculated !== 'dark'){
			cleanup(container);
			fail(`Expected "light" or "dark", got "${calculated}"`);
			return;
		}

		cleanup(container);
		pass('Static getCalculatedCurrentTheme returns light or dark');
	},

	'should subscribe to theme changes on connect': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		if(typeof select.unsubscribe !== 'function'){
			cleanup(container);
			fail('ThemeSelect should have unsubscribe function after connect');
			return;
		}

		cleanup(container);
		pass('ThemeSelect subscribes to theme changes');
	},

	'should unsubscribe on disconnect': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		const originalUnsubscribe = select.unsubscribe;
		let unsubscribeCalled = false;
		select.unsubscribe = () => {
			unsubscribeCalled = true;
			originalUnsubscribe();
		};

		select.disconnectedCallback();

		if(!unsubscribeCalled){
			cleanup(container);
			fail('unsubscribe should be called on disconnect');
			return;
		}

		cleanup(container);
		pass('ThemeSelect unsubscribes on disconnect');
	},

	'should sync with external theme changes': async ({pass, fail}) => {
		const { container, select } = await createThemeSelect();

		theme.set('dark');
		await new Promise(r => setTimeout(r, 50));
		await select.updateComplete;

		if(select.currentTheme !== 'dark'){
			cleanup(container);
			fail(`Expected currentTheme to sync to "dark", got "${select.currentTheme}"`);
			return;
		}

		cleanup(container);
		pass('ThemeSelect syncs with external theme changes');
	}
};
