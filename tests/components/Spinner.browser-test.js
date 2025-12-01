import Spinner from '../../src/components/Spinner.js';

const createSpinner = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-spinner
			${options.size ? `size="${options.size}"` : ''}
			${options.variant ? `variant="${options.variant}"` : ''}
			${options.style ? `style="${options.style}"` : ''}
		></k-spinner>
	`;
	document.body.appendChild(container);
	const spinner = container.querySelector('k-spinner');
	await spinner.updateComplete;
	return { container, spinner };
};

const cleanup = (container) => {
	if(container && container.parentNode) {
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation
	*/
	'should create spinner element': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner();
		if(!spinner) {
			cleanup(container);
			return fail('Spinner element should be created');
		}
		if(!(spinner instanceof Spinner)) {
			cleanup(container);
			return fail('Element should be instance of Spinner');
		}
		cleanup(container);
		pass('Spinner element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner();
		if(!spinner.shadowRoot) {
			cleanup(container);
			return fail('Spinner should have shadow root');
		}
		cleanup(container);
		pass('Spinner has shadow root');
	},

	'should have default size of md': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner();
		if(spinner.size !== 'md') {
			cleanup(container);
			return fail(`Expected size to be 'md', got ${spinner.size}`);
		}
		cleanup(container);
		pass('Default size is md');
	},

	'should have default variant of spinner': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner();
		if(spinner.variant !== 'spinner') {
			cleanup(container);
			return fail(`Expected variant to be 'spinner', got ${spinner.variant}`);
		}
		cleanup(container);
		pass('Default variant is spinner');
	},

	/*
		Property Reflection
	*/
	'should reflect size attribute': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ size: 'lg' });
		if(spinner.getAttribute('size') !== 'lg') {
			cleanup(container);
			return fail('Size attribute should be lg');
		}
		cleanup(container);
		pass('Size attribute reflects correctly');
	},

	'should reflect variant attribute': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'dots' });
		if(spinner.getAttribute('variant') !== 'dots') {
			cleanup(container);
			return fail('Variant attribute should be dots');
		}
		cleanup(container);
		pass('Variant attribute reflects correctly');
	},

	'should update attribute when size property changes': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner();
		spinner.size = 'xl';
		await spinner.updateComplete;
		if(spinner.getAttribute('size') !== 'xl') {
			cleanup(container);
			return fail('Size attribute should update when property changes');
		}
		cleanup(container);
		pass('Attribute updates when size property changes');
	},

	'should update attribute when variant property changes': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner();
		spinner.variant = 'bars';
		await spinner.updateComplete;
		if(spinner.getAttribute('variant') !== 'bars') {
			cleanup(container);
			return fail('Variant attribute should update when property changes');
		}
		cleanup(container);
		pass('Attribute updates when variant property changes');
	},

	/*
		Sizes
	*/
	'should render xs size': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ size: 'xs' });
		if(spinner.size !== 'xs') {
			cleanup(container);
			return fail('Spinner size should be xs');
		}
		cleanup(container);
		pass('Spinner renders xs size');
	},

	'should render sm size': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ size: 'sm' });
		if(spinner.size !== 'sm') {
			cleanup(container);
			return fail('Spinner size should be sm');
		}
		cleanup(container);
		pass('Spinner renders sm size');
	},

	'should render md size': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ size: 'md' });
		if(spinner.size !== 'md') {
			cleanup(container);
			return fail('Spinner size should be md');
		}
		cleanup(container);
		pass('Spinner renders md size');
	},

	'should render lg size': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ size: 'lg' });
		if(spinner.size !== 'lg') {
			cleanup(container);
			return fail('Spinner size should be lg');
		}
		cleanup(container);
		pass('Spinner renders lg size');
	},

	'should render xl size': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ size: 'xl' });
		if(spinner.size !== 'xl') {
			cleanup(container);
			return fail('Spinner size should be xl');
		}
		cleanup(container);
		pass('Spinner renders xl size');
	},

	/*
		Variants - Spinner
	*/
	'should render spinner variant': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'spinner' });
		const spinnerEl = spinner.shadowRoot.querySelector('.spinner');
		if(!spinnerEl) {
			cleanup(container);
			return fail('Spinner variant should render .spinner element');
		}
		cleanup(container);
		pass('Spinner variant renders correctly');
	},

	/*
		Variants - Dots
	*/
	'should render dots variant': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'dots' });
		const dotsEl = spinner.shadowRoot.querySelector('.dots');
		if(!dotsEl) {
			cleanup(container);
			return fail('Dots variant should render .dots element');
		}
		cleanup(container);
		pass('Dots variant renders correctly');
	},

	'dots variant should have 3 spans': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'dots' });
		const spans = spinner.shadowRoot.querySelectorAll('.dots span');
		if(spans.length !== 3) {
			cleanup(container);
			return fail(`Dots variant should have 3 spans, got ${spans.length}`);
		}
		cleanup(container);
		pass('Dots variant has 3 spans');
	},

	/*
		Variants - Bars
	*/
	'should render bars variant': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'bars' });
		const barsEl = spinner.shadowRoot.querySelector('.bars');
		if(!barsEl) {
			cleanup(container);
			return fail('Bars variant should render .bars element');
		}
		cleanup(container);
		pass('Bars variant renders correctly');
	},

	'bars variant should have 4 spans': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'bars' });
		const spans = spinner.shadowRoot.querySelectorAll('.bars span');
		if(spans.length !== 4) {
			cleanup(container);
			return fail(`Bars variant should have 4 spans, got ${spans.length}`);
		}
		cleanup(container);
		pass('Bars variant has 4 spans');
	},

	/*
		Variants - Pulse
	*/
	'should render pulse variant': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'pulse' });
		const pulseEl = spinner.shadowRoot.querySelector('.pulse');
		if(!pulseEl) {
			cleanup(container);
			return fail('Pulse variant should render .pulse element');
		}
		cleanup(container);
		pass('Pulse variant renders correctly');
	},

	/*
		Variants - Ring
	*/
	'should render ring variant': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'ring' });
		const ringEl = spinner.shadowRoot.querySelector('.ring');
		if(!ringEl) {
			cleanup(container);
			return fail('Ring variant should render .ring element');
		}
		cleanup(container);
		pass('Ring variant renders correctly');
	},

	/*
		Variant Switching
	*/
	'should switch variants dynamically': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'spinner' });
		spinner.variant = 'dots';
		await spinner.updateComplete;
		const dotsEl = spinner.shadowRoot.querySelector('.dots');
		const spinnerEl = spinner.shadowRoot.querySelector('.spinner');
		if(!dotsEl || spinnerEl) {
			cleanup(container);
			return fail('Spinner should switch to dots variant');
		}
		cleanup(container);
		pass('Spinner switches variants dynamically');
	},

	/*
		Shadow DOM Structure
	*/
	'default variant should render spinner element': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner();
		const spinnerEl = spinner.shadowRoot.querySelector('.spinner');
		if(!spinnerEl) {
			cleanup(container);
			return fail('Default should render .spinner element');
		}
		cleanup(container);
		pass('Default renders spinner element');
	},

	/*
		Edge Cases
	*/
	'should handle invalid variant gracefully': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'invalid' });
		// Should fall back to default spinner variant
		const spinnerEl = spinner.shadowRoot.querySelector('.spinner');
		if(!spinnerEl) {
			cleanup(container);
			return fail('Invalid variant should fall back to default spinner');
		}
		cleanup(container);
		pass('Invalid variant falls back to default');
	},

	'should handle disconnection and reconnection': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ variant: 'dots' });
		spinner.remove();
		document.body.appendChild(spinner);
		await spinner.updateComplete;
		const dotsEl = spinner.shadowRoot.querySelector('.dots');
		if(!dotsEl) {
			cleanup(container);
			return fail('Spinner should maintain state after reconnection');
		}
		spinner.remove();
		cleanup(container);
		pass('Handles disconnection and reconnection');
	},

	'should render with custom CSS variable': async ({pass, fail}) => {
		const { container, spinner } = await createSpinner({ style: '--spinner-color: red' });
		// Just verify it renders without error
		if(!spinner.shadowRoot) {
			cleanup(container);
			return fail('Spinner should render with custom CSS variable');
		}
		cleanup(container);
		pass('Spinner renders with custom CSS variable');
	}
};
