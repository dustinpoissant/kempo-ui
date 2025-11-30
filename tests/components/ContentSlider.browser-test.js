import ContentSlider from '../../src/components/ContentSlider.js';

const createContentSlider = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-content-slider
			${options.controls === false ? 'controls="false"' : ''}
			${options.loop ? 'loop="true"' : ''}
			${options.globalControls ? 'global-controls="true"' : ''}
			${options.keyboardControls === false ? 'keyboard-controls="false"' : ''}
			${options.index !== undefined ? `index="${options.index}"` : ''}
		>
			<div id="slide1">Slide 1</div>
			<div id="slide2">Slide 2</div>
			<div id="slide3">Slide 3</div>
		</k-content-slider>
	`;
	document.body.appendChild(container);

	const slider = container.querySelector('k-content-slider');
	await slider.updateComplete;

	return { container, slider };
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
	'should create content slider element': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(!slider){
			cleanup(container);
			fail('ContentSlider element should be created');
			return;
		}

		if(!(slider instanceof ContentSlider)){
			cleanup(container);
			fail('Element should be instance of ContentSlider');
			return;
		}

		cleanup(container);
		pass('ContentSlider element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(!slider.shadowRoot){
			cleanup(container);
			fail('ContentSlider should have shadow root');
			return;
		}

		cleanup(container);
		pass('ContentSlider has shadow root');
	},

	/*
		Default Property Tests
	*/
	'should have default index of 0': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(slider.index !== 0){
			cleanup(container);
			fail(`Expected index 0, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('Default index is 0');
	},

	'should have default controls as true': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(slider.controls !== true){
			cleanup(container);
			fail(`Expected controls true, got ${slider.controls}`);
			return;
		}

		cleanup(container);
		pass('Default controls is true');
	},

	'should have default loop as false': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(slider.loop !== false){
			cleanup(container);
			fail(`Expected loop false, got ${slider.loop}`);
			return;
		}

		cleanup(container);
		pass('Default loop is false');
	},

	'should have default keyboardControls as true': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(slider.keyboardControls !== true){
			cleanup(container);
			fail(`Expected keyboardControls true, got ${slider.keyboardControls}`);
			return;
		}

		cleanup(container);
		pass('Default keyboardControls is true');
	},

	'should have default globalControls as false': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(slider.globalControls !== false){
			cleanup(container);
			fail(`Expected globalControls false, got ${slider.globalControls}`);
			return;
		}

		cleanup(container);
		pass('Default globalControls is false');
	},

	/*
		Navigation Tests
	*/
	'should go to next slide': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		slider.next();
		await slider.updateComplete;

		if(slider.index !== 1){
			cleanup(container);
			fail(`Expected index 1, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('next() advances to next slide');
	},

	'should go to previous slide': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ index: 2 });

		slider.previous();
		await slider.updateComplete;

		if(slider.index !== 1){
			cleanup(container);
			fail(`Expected index 1, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('previous() goes to previous slide');
	},

	'should go to specific slide with goto': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		slider.goto(2);
		await slider.updateComplete;

		if(slider.index !== 2){
			cleanup(container);
			fail(`Expected index 2, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('goto() navigates to specific slide');
	},

	'should not go below 0 without loop': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		slider.previous();
		await slider.updateComplete;

		if(slider.index !== 0){
			cleanup(container);
			fail(`Expected index 0, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('Does not go below 0 without loop');
	},

	'should not exceed max index without loop': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ index: 2 });

		slider.next();
		await slider.updateComplete;

		if(slider.index !== 2){
			cleanup(container);
			fail(`Expected index 2, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('Does not exceed max index without loop');
	},

	/*
		Loop Tests
	*/
	'should loop to last slide when going previous from first': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ loop: true });

		slider.previous();
		await slider.updateComplete;

		if(slider.index !== 2){
			cleanup(container);
			fail(`Expected index 2 (last), got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('Loops to last slide from first');
	},

	'should loop to first slide when going next from last': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ loop: true, index: 2 });

		slider.next();
		await slider.updateComplete;

		if(slider.index !== 0){
			cleanup(container);
			fail(`Expected index 0 (first), got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('Loops to first slide from last');
	},

	/*
		Event Tests
	*/
	'should dispatch change event on index change': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		let eventFired = false;
		let eventDetail = null;
		slider.addEventListener('change', e => {
			eventFired = true;
			eventDetail = e.detail;
		});

		slider.next();
		await slider.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('change event should be dispatched');
			return;
		}

		if(eventDetail.index !== 1){
			cleanup(container);
			fail(`Expected index 1 in detail, got ${eventDetail.index}`);
			return;
		}

		cleanup(container);
		pass('change event dispatched with correct detail');
	},

	'should dispatch next event': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		let eventFired = false;
		slider.addEventListener('next', () => {
			eventFired = true;
		});

		slider.next();
		await slider.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('next event should be dispatched');
			return;
		}

		cleanup(container);
		pass('next event dispatched');
	},

	'should dispatch previous event': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ index: 1 });

		let eventFired = false;
		slider.addEventListener('previous', () => {
			eventFired = true;
		});

		slider.previous();
		await slider.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('previous event should be dispatched');
			return;
		}

		cleanup(container);
		pass('previous event dispatched');
	},

	'should dispatch goto event': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		let eventFired = false;
		slider.addEventListener('goto', () => {
			eventFired = true;
		});

		slider.goto(2);
		await slider.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('goto event should be dispatched');
			return;
		}

		cleanup(container);
		pass('goto event dispatched');
	},

	/*
		Control Button Tests
	*/
	'should render prev and next buttons': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		const prevBtn = slider.shadowRoot.querySelector('#prev');
		const nextBtn = slider.shadowRoot.querySelector('#next');

		if(!prevBtn){
			cleanup(container);
			fail('Should render prev button');
			return;
		}

		if(!nextBtn){
			cleanup(container);
			fail('Should render next button');
			return;
		}

		cleanup(container);
		pass('Renders prev and next buttons');
	},

	'should navigate on button click': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		const nextBtn = slider.shadowRoot.querySelector('#next');
		nextBtn.click();
		await slider.updateComplete;

		if(slider.index !== 1){
			cleanup(container);
			fail(`Expected index 1 after next click, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('Button clicks navigate slides');
	},

	/*
		Keyboard Control Tests
	*/
	'should navigate with arrow keys when focused': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		slider.focus();
		slider.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
		await slider.updateComplete;

		if(slider.index !== 1){
			cleanup(container);
			fail(`Expected index 1 after ArrowRight, got ${slider.index}`);
			return;
		}

		cleanup(container);
		pass('Arrow keys navigate when focused');
	},

	'should dispatch keyleft event': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ index: 1 });

		let eventFired = false;
		slider.addEventListener('keyleft', () => {
			eventFired = true;
		});

		slider.focus();
		slider.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' }));
		await slider.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('keyleft event should be dispatched');
			return;
		}

		cleanup(container);
		pass('keyleft event dispatched');
	},

	'should dispatch keyright event': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		let eventFired = false;
		slider.addEventListener('keyright', () => {
			eventFired = true;
		});

		slider.focus();
		slider.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
		await slider.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('keyright event should be dispatched');
			return;
		}

		cleanup(container);
		pass('keyright event dispatched');
	},

	/*
		Content Tests
	*/
	'should track content array': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		if(!Array.isArray(slider.content)){
			cleanup(container);
			fail('content should be an array');
			return;
		}

		if(slider.content.length !== 3){
			cleanup(container);
			fail(`Expected 3 content items, got ${slider.content.length}`);
			return;
		}

		cleanup(container);
		pass('Content array tracked correctly');
	},

	/*
		Index Reflection Tests
	*/
	'should reflect index attribute': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();

		slider.index = 2;
		await slider.updateComplete;

		if(slider.getAttribute('index') !== '2'){
			cleanup(container);
			fail(`Expected attribute "2", got "${slider.getAttribute('index')}"`);
			return;
		}

		cleanup(container);
		pass('Index attribute reflects property');
	}
};
