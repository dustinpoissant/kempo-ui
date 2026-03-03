import Toggle from '../../src/components/Toggle.js';

const createToggle = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-toggle ${options.value ? 'value' : ''}>
			${options.label || ''}
		</k-toggle>
	`;
	document.body.appendChild(container);
	const toggle = container.querySelector('k-toggle');
	await toggle.updateComplete;
	return { container, toggle };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation
	*/
	'should create toggle element': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		if(!toggle){
			cleanup(container);
			return fail('Toggle element should be created');
		}
		if(!(toggle instanceof Toggle)){
			cleanup(container);
			return fail('Element should be instance of Toggle');
		}
		cleanup(container);
		pass('Toggle element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		if(!toggle.shadowRoot){
			cleanup(container);
			return fail('Toggle should have shadow root');
		}
		cleanup(container);
		pass('Toggle has shadow root');
	},

	'should have default value of false': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		if(toggle.value !== false){
			cleanup(container);
			return fail(`Expected value to be false, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Default value is false');
	},

	'should have tabIndex of 0': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		if(toggle.tabIndex !== 0){
			cleanup(container);
			return fail(`Expected tabIndex to be 0, got ${toggle.tabIndex}`);
		}
		cleanup(container);
		pass('tabIndex is 0');
	},

	/*
		Property Reflection
	*/
	'should reflect value attribute when true': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value property to be true, got ${toggle.value}`);
		}
		if(!toggle.hasAttribute('value')){
			cleanup(container);
			return fail('Toggle should have value attribute');
		}
		cleanup(container);
		pass('Value attribute reflects correctly');
	},

	'should update attribute when value property changes': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		toggle.value = true;
		await toggle.updateComplete;
		if(!toggle.hasAttribute('value')){
			cleanup(container);
			return fail('Toggle should have value attribute after setting property');
		}
		cleanup(container);
		pass('Attribute updates when property changes');
	},

	'should remove attribute when value becomes false': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		toggle.value = false;
		await toggle.updateComplete;
		if(toggle.hasAttribute('value')){
			cleanup(container);
			return fail('Toggle should not have value attribute when false');
		}
		cleanup(container);
		pass('Attribute removed when value becomes false');
	},

	/*
		Public Methods - on()
	*/
	'should have on method': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		if(typeof toggle.on !== 'function'){
			cleanup(container);
			return fail('Toggle should have on method');
		}
		cleanup(container);
		pass('Toggle has on method');
	},

	'on() should set value to true': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		toggle.on();
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after on(), got ${toggle.value}`);
		}
		cleanup(container);
		pass('on() sets value to true');
	},

	'on() should return this for chaining': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const result = toggle.on();
		if(result !== toggle){
			cleanup(container);
			return fail('on() should return this');
		}
		cleanup(container);
		pass('on() returns this');
	},

	'on() should dispatch on event': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		let eventFired = false;
		let eventDetail = null;
		toggle.addEventListener('on', e => {
			eventFired = true;
			eventDetail = e.detail;
		});
		toggle.on();
		if(!eventFired){
			cleanup(container);
			return fail('on event should be fired');
		}
		if(eventDetail.value !== true){
			cleanup(container);
			return fail(`Expected event detail value to be true, got ${eventDetail.value}`);
		}
		cleanup(container);
		pass('on() dispatches on event');
	},

	/*
		Public Methods - off()
	*/
	'should have off method': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		if(typeof toggle.off !== 'function'){
			cleanup(container);
			return fail('Toggle should have off method');
		}
		cleanup(container);
		pass('Toggle has off method');
	},

	'off() should set value to false': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		toggle.off();
		if(toggle.value !== false){
			cleanup(container);
			return fail(`Expected value to be false after off(), got ${toggle.value}`);
		}
		cleanup(container);
		pass('off() sets value to false');
	},

	'off() should return this for chaining': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const result = toggle.off();
		if(result !== toggle){
			cleanup(container);
			return fail('off() should return this');
		}
		cleanup(container);
		pass('off() returns this');
	},

	'off() should dispatch off event': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		let eventFired = false;
		let eventDetail = null;
		toggle.addEventListener('off', e => {
			eventFired = true;
			eventDetail = e.detail;
		});
		toggle.off();
		if(!eventFired){
			cleanup(container);
			return fail('off event should be fired');
		}
		if(eventDetail.value !== false){
			cleanup(container);
			return fail(`Expected event detail value to be false, got ${eventDetail.value}`);
		}
		cleanup(container);
		pass('off() dispatches off event');
	},

	/*
		Public Methods - toggle()
	*/
	'should have toggle method': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		if(typeof toggle.toggle !== 'function'){
			cleanup(container);
			return fail('Toggle should have toggle method');
		}
		cleanup(container);
		pass('Toggle has toggle method');
	},

	'toggle() should change value from false to true': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		toggle.toggle();
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after toggle(), got ${toggle.value}`);
		}
		cleanup(container);
		pass('toggle() changes value from false to true');
	},

	'toggle() should change value from true to false': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		toggle.toggle();
		if(toggle.value !== false){
			cleanup(container);
			return fail(`Expected value to be false after toggle(), got ${toggle.value}`);
		}
		cleanup(container);
		pass('toggle() changes value from true to false');
	},

	'toggle() should return this for chaining': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const result = toggle.toggle();
		if(result !== toggle){
			cleanup(container);
			return fail('toggle() should return this');
		}
		cleanup(container);
		pass('toggle() returns this');
	},

	'toggle() should dispatch toggle event': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		let eventFired = false;
		let eventDetail = null;
		toggle.addEventListener('toggle', e => {
			eventFired = true;
			eventDetail = e.detail;
		});
		toggle.toggle();
		if(!eventFired){
			cleanup(container);
			return fail('toggle event should be fired');
		}
		if(eventDetail.value !== true){
			cleanup(container);
			return fail(`Expected event detail value to be true, got ${eventDetail.value}`);
		}
		cleanup(container);
		pass('toggle() dispatches toggle event');
	},

	'toggle() should call on() when value is false': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		let onEventFired = false;
		toggle.addEventListener('on', () => { onEventFired = true; });
		toggle.toggle();
		if(!onEventFired){
			cleanup(container);
			return fail('on event should be fired when toggling from false');
		}
		cleanup(container);
		pass('toggle() calls on() when value is false');
	},

	'toggle() should call off() when value is true': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		let offEventFired = false;
		toggle.addEventListener('off', () => { offEventFired = true; });
		toggle.toggle();
		if(!offEventFired){
			cleanup(container);
			return fail('off event should be fired when toggling from true');
		}
		cleanup(container);
		pass('toggle() calls off() when value is true');
	},

	/*
		Events
	*/
	'should dispatch change event when value changes': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		let eventFired = false;
		let eventDetail = null;
		toggle.addEventListener('change', e => {
			eventFired = true;
			eventDetail = e.detail;
		});
		toggle.value = true;
		await toggle.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('change event should be fired');
		}
		if(eventDetail.value !== true){
			cleanup(container);
			return fail(`Expected event detail value to be true, got ${eventDetail.value}`);
		}
		cleanup(container);
		pass('change event dispatched when value changes');
	},

	'change event should bubble': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		let eventBubbled = false;
		document.body.addEventListener('change', () => { eventBubbled = true; }, { once: true });
		toggle.value = true;
		await toggle.updateComplete;
		if(!eventBubbled){
			cleanup(container);
			return fail('change event should bubble');
		}
		cleanup(container);
		pass('change event bubbles');
	},

	'on event should bubble': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		let eventBubbled = false;
		document.body.addEventListener('on', () => { eventBubbled = true; }, { once: true });
		toggle.on();
		if(!eventBubbled){
			cleanup(container);
			return fail('on event should bubble');
		}
		cleanup(container);
		pass('on event bubbles');
	},

	'off event should bubble': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		let eventBubbled = false;
		document.body.addEventListener('off', () => { eventBubbled = true; }, { once: true });
		toggle.off();
		if(!eventBubbled){
			cleanup(container);
			return fail('off event should bubble');
		}
		cleanup(container);
		pass('off event bubbles');
	},

	'toggle event should bubble': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		let eventBubbled = false;
		document.body.addEventListener('toggle', () => { eventBubbled = true; }, { once: true });
		toggle.toggle();
		if(!eventBubbled){
			cleanup(container);
			return fail('toggle event should bubble');
		}
		cleanup(container);
		pass('toggle event bubbles');
	},

	/*
		Click Handling
	*/
	'should toggle on click': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		toggle.click();
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after click, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Toggle changes on click');
	},

	'should toggle off on click when already on': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ value: true });
		toggle.click();
		if(toggle.value !== false){
			cleanup(container);
			return fail(`Expected value to be false after click, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Toggle turns off on click when already on');
	},

	/*
		Keyboard Handling
	*/
	'should toggle on Space key': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true });
		toggle.dispatchEvent(event);
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after Space key, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Toggle changes on Space key');
	},

	'should toggle on Enter key': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const event = new KeyboardEvent('keydown', { code: 'Enter', bubbles: true });
		toggle.dispatchEvent(event);
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after Enter key, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Toggle changes on Enter key');
	},

	'should not toggle on other keys': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const event = new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true });
		toggle.dispatchEvent(event);
		if(toggle.value !== false){
			cleanup(container);
			return fail(`Expected value to be false after KeyA, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Toggle does not change on other keys');
	},

	/*
		Shadow DOM Structure
	*/
	'should render switch element': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const switchEl = toggle.shadowRoot.querySelector('#switch');
		if(!switchEl){
			cleanup(container);
			return fail('Switch element should be rendered');
		}
		cleanup(container);
		pass('Switch element rendered');
	},

	'should render handle element': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const handle = toggle.shadowRoot.querySelector('#handle');
		if(!handle){
			cleanup(container);
			return fail('Handle element should be rendered');
		}
		cleanup(container);
		pass('Handle element rendered');
	},

	'should render label element': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const label = toggle.shadowRoot.querySelector('#label');
		if(!label){
			cleanup(container);
			return fail('Label element should be rendered');
		}
		cleanup(container);
		pass('Label element rendered');
	},

	'should render slot for label content': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		const slot = toggle.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(container);
			return fail('Slot should be rendered');
		}
		cleanup(container);
		pass('Slot rendered');
	},

	'should project label content': async ({pass, fail}) => {
		const { container, toggle } = await createToggle({ label: 'Toggle Label' });
		if(!toggle.textContent.includes('Toggle Label')){
			cleanup(container);
			return fail('Label content should be projected');
		}
		cleanup(container);
		pass('Label content projected');
	},

	'switch should not shrink in constrained container': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		container.style.width = '100px';
		await toggle.updateComplete;
		const switchEl = toggle.shadowRoot.querySelector('#switch');
		const style = window.getComputedStyle(switchEl);
		if(style.flexShrink !== '0'){
			cleanup(container);
			return fail(`Expected switch flex-shrink to be 0, got ${style.flexShrink}`);
		}
		if(style.flexGrow !== '0'){
			cleanup(container);
			return fail(`Expected switch flex-grow to be 0, got ${style.flexGrow}`);
		}
		cleanup(container);
		pass('Switch does not shrink in constrained container');
	},

	'label should shrink in constrained container': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		await toggle.updateComplete;
		const label = toggle.shadowRoot.querySelector('#label');
		const style = window.getComputedStyle(label);
		if(style.flexGrow !== '1'){
			cleanup(container);
			return fail(`Expected label flex-grow to be 1, got ${style.flexGrow}`);
		}
		cleanup(container);
		pass('Label grows to fill remaining space');
	},

	/*
		Method Chaining
	*/
	'should support method chaining': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		toggle.on().off().toggle();
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after chain, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Method chaining works correctly');
	},

	/*
		Edge Cases
	*/
	'should handle multiple rapid toggles': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		toggle.toggle().toggle().toggle();
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after 3 toggles, got ${toggle.value}`);
		}
		cleanup(container);
		pass('Multiple rapid toggles work correctly');
	},

	'should handle disconnection and reconnection': async ({pass, fail}) => {
		const { container, toggle } = await createToggle();
		toggle.on();
		toggle.remove();
		document.body.appendChild(toggle);
		await toggle.updateComplete;
		if(toggle.value !== true){
			cleanup(container);
			return fail(`Expected value to be true after reconnection, got ${toggle.value}`);
		}
		toggle.remove();
		cleanup(container);
		pass('Handles disconnection and reconnection');
	}
};
