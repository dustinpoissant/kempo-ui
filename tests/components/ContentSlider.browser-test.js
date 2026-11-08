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
			${options.minHeight ? `min-height="${options.minHeight}"` : ''}
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
	},

	/*
		Disabled Button Tests
	*/
	'should disable the previous button on the first slide and the next button on the last slide when not looping': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();
		const prev = slider.shadowRoot.querySelector('#prev');
		const next = slider.shadowRoot.querySelector('#next');
		const states = [];
		for(const index of [0, 1, 2]){
			slider.goto(index);
			await slider.updateComplete;
			states.push(`${prev.disabled ? 'x' : 'o'}${next.disabled ? 'x' : 'o'}`);
		}
		cleanup(container);
		if(states.join() !== 'xo,oo,ox') return fail(`Expected the previous button disabled on the first slide and the next on the last, got ${states.join()}`);
		pass('The buttons are disabled at the ends');
	},

	'should keep both buttons enabled when looping, and when there is a slide on both sides': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ loop: true });
		const prev = slider.shadowRoot.querySelector('#prev');
		const next = slider.shadowRoot.querySelector('#next');
		const states = [];
		for(const index of [0, 2]){
			slider.goto(index);
			await slider.updateComplete;
			states.push(`${prev.disabled}${next.disabled}`);
		}
		slider.loop = false;
		slider.goto(1);
		await slider.updateComplete;
		states.push(`${prev.disabled}${next.disabled}`);
		cleanup(container);
		if(states.join() !== 'falsefalse,falsefalse,falsefalse') return fail(`Looping, and the middle slide, keep both enabled, got ${states.join()}`);
		pass('The buttons are enabled when they can go somewhere');
	},

	'should enable a button again when looping is turned on at an end': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();
		const prev = slider.shadowRoot.querySelector('#prev');
		await slider.updateComplete;
		const before = prev.disabled;
		slider.loop = true;
		await slider.updateComplete;
		const after = prev.disabled;
		cleanup(container);
		if(!before || after) return fail(`The previous button should be disabled on the first slide until looping is on, got ${before} then ${after}`);
		pass('Looping enables the buttons');
	},

	'should not move, or send previous, next or change events, when there is no slide in that direction and it does not loop': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();
		const events = [];
		for(const name of ['previous', 'next', 'change', 'keyleft', 'keyright']) slider.addEventListener(name, () => events.push(name));
		slider.previous();
		await slider.updateComplete;
		slider.goto(2);
		await slider.updateComplete;
		events.length = 0;
		slider.next();
		await slider.updateComplete;
		const atEnd = slider.index;
		const sent = [...events];
		slider.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
		await slider.updateComplete;
		cleanup(container);
		if(atEnd !== 2) return fail(`next() on the last slide should stay on it, got ${atEnd}`);
		if(sent.length) return fail(`next() on the last slide should send no events, got ${sent.join()}`);
		if(slider.index !== 2) return fail('The right arrow key on the last slide should stay on it');
		pass('Going nowhere does nothing');
	},

	'should still wrap around at the ends when looping': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ loop: true });
		slider.previous();
		await slider.updateComplete;
		const wrapped = slider.index;
		slider.next();
		await slider.updateComplete;
		cleanup(container);
		if(wrapped !== 2 || slider.index !== 0) return fail(`Looping should wrap to the last slide then the first, got ${wrapped} then ${slider.index}`);
		pass('Looping wraps around');
	},

	'should go to a slide with the buttons that are not disabled': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();
		slider.shadowRoot.querySelector('#next').click();
		await slider.updateComplete;
		slider.shadowRoot.querySelector('#prev').click();
		await slider.updateComplete;
		const back = slider.index;
		slider.shadowRoot.querySelector('#prev').click();
		await slider.updateComplete;
		cleanup(container);
		if(back !== 0 || slider.index !== 0) return fail(`Next then previous returns to the first slide, and previous again stays, got ${back} then ${slider.index}`);
		pass('The buttons move between the slides');
	},

	/*
		Minimum Height Tests
	*/
	'should have no minimum height by default': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider();
		const content = slider.shadowRoot.querySelector('#content');
		const style = content.style.minHeight;
		cleanup(container);
		if(slider.minHeight !== '' || style) return fail(`Expected no minimum height, got "${slider.minHeight}" and "${style}"`);
		pass('There is no minimum height by default');
	},

	'should apply min-height to the content area as a CSS minimum height': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ minHeight: '10rem' });
		const content = slider.shadowRoot.querySelector('#content');
		const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const height = content.getBoundingClientRect().height;
		const style = getComputedStyle(content).minHeight;
		cleanup(container);
		if(slider.minHeight !== '10rem') return fail(`The attribute should set the property, got "${slider.minHeight}"`);
		if(style !== `${10 * rem}px`) return fail(`The content area should have a minimum height of 10rem, got ${style}`);
		if(height < 10 * rem - 1) return fail(`The slider should be at least 10rem tall, got ${height}px`);
		pass('The minimum height is applied');
	},

	'should change and clear the minimum height when the property changes': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ minHeight: '120px' });
		const content = slider.shadowRoot.querySelector('#content');
		const first = content.getBoundingClientRect().height;
		slider.minHeight = '200px';
		await slider.updateComplete;
		const second = content.getBoundingClientRect().height;
		slider.minHeight = '';
		await slider.updateComplete;
		const cleared = content.style.minHeight;
		const third = content.getBoundingClientRect().height;
		cleanup(container);
		if(first < 120 || second < 200) return fail(`The slider should be at least as tall as its minimum, got ${first} then ${second}`);
		if(cleared || third >= 200) return fail(`An empty minimum height should leave no minimum, got "${cleared}" and ${third}px`);
		pass('The minimum height follows the property');
	},

	'should keep the minimum height when the slide changes, and when a slide is shorter': async ({pass, fail}) => {
		const { container, slider } = await createContentSlider({ minHeight: '150px' });
		const heights = [];
		for(const index of [0, 1, 2]){
			slider.goto(index);
			await slider.updateComplete;
			heights.push(Math.round(slider.getBoundingClientRect().height));
		}
		cleanup(container);
		if(heights.some(height => height < 150)) return fail(`Every slide should leave the slider at least 150px tall, got ${heights.join()}`);
		pass('The slider keeps its minimum height on every slide');
	}
};
