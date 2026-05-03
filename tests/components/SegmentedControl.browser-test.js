import SegmentedControl from '../../src/components/SegmentedControl.js';

const createSegmentedControl = async (options = {}) => {
	const container = document.createElement('div');
	const value = options.value ? `value="${options.value}"` : '';
	container.innerHTML = `
		<k-segmented-control ${value}>
			<k-sc-option value="small">Small</k-sc-option>
			<k-sc-option value="medium">Medium</k-sc-option>
			<k-sc-option value="large">Large</k-sc-option>
		</k-segmented-control>
	`;
	document.body.appendChild(container);
	const control = container.querySelector('k-segmented-control');
	await control.updateComplete;
	return { container, control };
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
	'should create segmented control element': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		if(!control){
			cleanup(container);
			return fail('SegmentedControl element should be created');
		}
		if(!(control instanceof SegmentedControl)){
			cleanup(container);
			return fail('Element should be instance of SegmentedControl');
		}
		cleanup(container);
		pass('SegmentedControl element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		if(!control.shadowRoot){
			cleanup(container);
			return fail('SegmentedControl should have shadow root');
		}
		cleanup(container);
		pass('SegmentedControl has shadow root');
	},

	'should have default value of empty string': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		if(control.value !== ''){
			cleanup(container);
			return fail(`Expected value to be empty string, got "${control.value}"`);
		}
		cleanup(container);
		pass('Default value is empty string');
	},

	/*
		Property Reflection
	*/
	'should reflect value attribute': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl({ value: 'medium' });
		if(control.value !== 'medium'){
			cleanup(container);
			return fail(`Expected value property to be "medium", got "${control.value}"`);
		}
		if(!control.hasAttribute('value')){
			cleanup(container);
			return fail('SegmentedControl should have value attribute');
		}
		cleanup(container);
		pass('Value attribute reflects correctly');
	},

	'should update attribute when value property changes': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		control.value = 'large';
		await control.updateComplete;
		if(!control.hasAttribute('value')){
			cleanup(container);
			return fail('SegmentedControl should have value attribute after setting property');
		}
		if(control.getAttribute('value') !== 'large'){
			cleanup(container);
			return fail(`Expected attribute value to be "large", got "${control.getAttribute('value')}"`);
		}
		cleanup(container);
		pass('Attribute updates when property changes');
	},

	/*
		Option Recognition
	*/
	'should recognize k-sc-option children': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		const options = control.getOptions();
		if(options.length !== 3){
			cleanup(container);
			return fail(`Expected 3 options, got ${options.length}`);
		}
		cleanup(container);
		pass('k-sc-option children recognized correctly');
	},

	'should recognize option values': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		const options = control.getOptions();
		const values = options.map(opt => opt.getAttribute('value'));
		if(!values.includes('small') || !values.includes('medium') || !values.includes('large')){
			cleanup(container);
			return fail('Options should have correct values');
		}
		cleanup(container);
		pass('Option values recognized correctly');
	},

	/*
		Selection and Value Changes
	*/
	'should update value when option is clicked': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		const buttons = control.shadowRoot.querySelectorAll('button');
		buttons[1].click();
		await control.updateComplete;
		if(control.value !== 'medium'){
			cleanup(container);
			return fail(`Expected value to be "medium" after click, got "${control.value}"`);
		}
		cleanup(container);
		pass('Value updates when button is clicked');
	},

	'should apply selected styling to active button': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl({ value: 'medium' });
		const buttons = control.shadowRoot.querySelectorAll('button');
		const mediumButton = buttons[1];
		if(!mediumButton.classList.contains('primary')){
			cleanup(container);
			return fail('Selected button should have primary class');
		}
		cleanup(container);
		pass('Selected button has primary class');
	},

	'should remove selection from other buttons': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl({ value: 'medium' });
		const buttons = control.shadowRoot.querySelectorAll('button');
		const smallButton = buttons[0];
		const largeButton = buttons[2];
		if(smallButton.classList.contains('primary') || largeButton.classList.contains('primary')){
			cleanup(container);
			return fail('Only selected button should have primary class');
		}
		cleanup(container);
		pass('Only selected button is marked as selected');
	},

	/*
		Events
	*/
	'should dispatch change event when value changes': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		let eventFired = false;
		let eventDetail = null;
		control.addEventListener('change', (event) => {
			eventFired = true;
			eventDetail = event.detail;
		});
		control.value = 'large';
		await control.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('Change event should be dispatched');
		}
		if(eventDetail.value !== 'large'){
			cleanup(container);
			return fail(`Expected change event detail.value to be "large", got "${eventDetail.value}"`);
		}
		cleanup(container);
		pass('Change event dispatched with correct detail');
	},

	'should dispatch change event when button is clicked': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		let eventFired = false;
		let eventDetail = null;
		control.addEventListener('change', (event) => {
			eventFired = true;
			eventDetail = event.detail;
		});
		const buttons = control.shadowRoot.querySelectorAll('button');
		buttons[2].click();
		await control.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('Change event should be dispatched on click');
		}
		if(eventDetail.value !== 'large'){
			cleanup(container);
			return fail(`Expected change event detail.value to be "large", got "${eventDetail.value}"`);
		}
		cleanup(container);
		pass('Change event dispatched on click with correct detail');
	},

	'should render buttons with correct text': async ({pass, fail}) => {
		const { container, control } = await createSegmentedControl();
		const buttons = control.shadowRoot.querySelectorAll('button');
		const texts = Array.from(buttons).map(btn => btn.textContent);
		if(!texts.includes('Small') || !texts.includes('Medium') || !texts.includes('Large')){
			cleanup(container);
			return fail('Buttons should display option text correctly');
		}
		cleanup(container);
		pass('Buttons display correct text from options');
	}
};

