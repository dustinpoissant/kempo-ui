import Button from '../../src/components/Button.js';

class TestButton extends Button {}
customElements.define('k-test-button', TestButton);

const create = async (attrs = {}, content = '') => {
	const container = document.createElement('div');
	const attrStr = Object.entries(attrs).map(([k, v]) => v === true ? k : `${k}="${v}"`).join(' ');
	container.innerHTML = `<k-test-button ${attrStr}>${content}</k-test-button>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-test-button');
	await el.updateComplete;
	return { container, el };
};

const cleanup = container => {
	if(container?.parentNode) container.parentNode.removeChild(container);
};

export default {
	/*
		Element Creation
	*/
	'should create button element': async ({pass, fail}) => {
		const { container, el } = await create();
		if(!(el instanceof Button)){
			cleanup(container);
			return fail('Element should be instance of Button');
		}
		cleanup(container);
		pass('Button element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await create();
		if(!el.shadowRoot){
			cleanup(container);
			return fail('Button should have shadow root');
		}
		cleanup(container);
		pass('Button has shadow root');
	},

	/*
		Accessibility Defaults
	*/
	'should set role="button" automatically': async ({pass, fail}) => {
		const { container, el } = await create();
		if(el.getAttribute('role') !== 'button'){
			cleanup(container);
			return fail(`Expected role="button", got "${el.getAttribute('role')}"`);
		}
		cleanup(container);
		pass('role="button" set automatically');
	},

	'should set tabindex=0 automatically': async ({pass, fail}) => {
		const { container, el } = await create();
		if(el.tabIndex !== 0){
			cleanup(container);
			return fail(`Expected tabIndex=0, got ${el.tabIndex}`);
		}
		cleanup(container);
		pass('tabIndex=0 set automatically');
	},

	'should not override existing role attribute': async ({pass, fail}) => {
		const { container, el } = await create({ role: 'menuitem' });
		if(el.getAttribute('role') !== 'menuitem'){
			cleanup(container);
			return fail(`Expected role="menuitem" to be preserved, got "${el.getAttribute('role')}"`);
		}
		cleanup(container);
		pass('Existing role attribute preserved');
	},

	/*
		Disabled Behavior
	*/
	'should set aria-disabled="true" when disabled': async ({pass, fail}) => {
		const { container, el } = await create({ disabled: true });
		await el.updateComplete;
		if(el.getAttribute('aria-disabled') !== 'true'){
			cleanup(container);
			return fail(`Expected aria-disabled="true", got "${el.getAttribute('aria-disabled')}"`);
		}
		cleanup(container);
		pass('aria-disabled="true" set when disabled');
	},

	'should set tabindex=-1 when disabled': async ({pass, fail}) => {
		const { container, el } = await create({ disabled: true });
		await el.updateComplete;
		if(el.tabIndex !== -1){
			cleanup(container);
			return fail(`Expected tabIndex=-1 when disabled, got ${el.tabIndex}`);
		}
		cleanup(container);
		pass('tabIndex=-1 set when disabled');
	},

	'should set aria-disabled="false" when not disabled': async ({pass, fail}) => {
		const { container, el } = await create();
		await el.updateComplete;
		if(el.getAttribute('aria-disabled') !== 'false'){
			cleanup(container);
			return fail(`Expected aria-disabled="false", got "${el.getAttribute('aria-disabled')}"`);
		}
		cleanup(container);
		pass('aria-disabled="false" set when enabled');
	},

	'should stop click propagation when disabled': async ({pass, fail}) => {
		const { container, el } = await create({ disabled: true });
		await el.updateComplete;
		let clickReceived = false;
		container.addEventListener('click', () => { clickReceived = true; });
		el.click();
		if(clickReceived){
			cleanup(container);
			return fail('Click should not propagate when disabled');
		}
		cleanup(container);
		pass('Click does not propagate when disabled');
	},

	'should allow click propagation when not disabled': async ({pass, fail}) => {
		const { container, el } = await create();
		await el.updateComplete;
		let clickReceived = false;
		container.addEventListener('click', () => { clickReceived = true; });
		el.click();
		if(!clickReceived){
			cleanup(container);
			return fail('Click should propagate when not disabled');
		}
		cleanup(container);
		pass('Click propagates when not disabled');
	},

	/*
		Keyboard Behavior
	*/
	'should trigger click on Enter key': async ({pass, fail}) => {
		const { container, el } = await create();
		await el.updateComplete;
		let clickCount = 0;
		el.addEventListener('click', () => { clickCount++; });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		if(clickCount === 0){
			cleanup(container);
			return fail('Enter key should trigger click');
		}
		cleanup(container);
		pass('Enter key triggers click');
	},

	'should trigger click on Space key': async ({pass, fail}) => {
		const { container, el } = await create();
		await el.updateComplete;
		let clickCount = 0;
		el.addEventListener('click', () => { clickCount++; });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		if(clickCount === 0){
			cleanup(container);
			return fail('Space key should trigger click');
		}
		cleanup(container);
		pass('Space key triggers click');
	},

	'should not trigger click on Enter when disabled': async ({pass, fail}) => {
		const { container, el } = await create({ disabled: true });
		await el.updateComplete;
		let clickCount = 0;
		el.addEventListener('click', () => { clickCount++; });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		if(clickCount > 0){
			cleanup(container);
			return fail('Enter key should not trigger click when disabled');
		}
		cleanup(container);
		pass('Enter key does not trigger click when disabled');
	},

	/*
		Dynamic Disable Toggle
	*/
	'should update tabindex when disabled is toggled': async ({pass, fail}) => {
		const { container, el } = await create();
		await el.updateComplete;
		el.disabled = true;
		await el.updateComplete;
		if(el.tabIndex !== -1){
			cleanup(container);
			return fail(`Expected tabIndex=-1 after setting disabled, got ${el.tabIndex}`);
		}
		el.disabled = false;
		await el.updateComplete;
		if(el.tabIndex !== 0){
			cleanup(container);
			return fail(`Expected tabIndex=0 after clearing disabled, got ${el.tabIndex}`);
		}
		cleanup(container);
		pass('tabIndex updates correctly when disabled is toggled');
	}
};
