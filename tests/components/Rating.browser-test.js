import Rating from '../../src/components/Rating.js';

const createRating = async (options = {}) => {
	const container = document.createElement('div');
	const value = options.value !== undefined ? `value="${options.value}"` : '';
	const disabled = options.disabled ? 'disabled' : '';
	const name = options.name ? `name="${options.name}"` : '';
	container.innerHTML = `<k-rating ${value} ${disabled} ${name}></k-rating>`;
	document.body.appendChild(container);
	const rating = container.querySelector('k-rating');
	await rating.updateComplete;
	return { container, rating };
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
	'should create rating element': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		if(!rating){
			cleanup(container);
			return fail('Rating element should be created');
		}
		if(!(rating instanceof Rating)){
			cleanup(container);
			return fail('Element should be instance of Rating');
		}
		cleanup(container);
		pass('Rating element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		if(!rating.shadowRoot){
			cleanup(container);
			return fail('Rating should have shadow root');
		}
		cleanup(container);
		pass('Rating has shadow root');
	},

	'should have default value of 0': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		if(rating.value !== 0){
			cleanup(container);
			return fail(`Expected value to be 0, got ${rating.value}`);
		}
		cleanup(container);
		pass('Default value is 0');
	},

	'should render 5 star buttons': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		const stars = rating.shadowRoot.querySelectorAll('.star');
		if(stars.length !== 5){
			cleanup(container);
			return fail(`Expected 5 stars, got ${stars.length}`);
		}
		cleanup(container);
		pass('5 star buttons rendered');
	},

	/*
		Property Reflection
	*/
	'should reflect value attribute': async ({pass, fail}) => {
		const { container, rating } = await createRating({ value: 3 });
		if(rating.value !== 3){
			cleanup(container);
			return fail(`Expected value property to be 3, got ${rating.value}`);
		}
		if(!rating.hasAttribute('value')){
			cleanup(container);
			return fail('Rating should have value attribute');
		}
		cleanup(container);
		pass('Value attribute reflects correctly');
	},

	'should update attribute when value property changes': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		rating.value = 4;
		await rating.updateComplete;
		if(rating.getAttribute('value') !== '4'){
			cleanup(container);
			return fail(`Expected attribute value to be "4", got "${rating.getAttribute('value')}"`);
		}
		cleanup(container);
		pass('Attribute updates when property changes');
	},

	/*
		Filled Icons
	*/
	'should mark stars up to value as filled': async ({pass, fail}) => {
		const { container, rating } = await createRating({ value: 3 });
		const stars = rating.shadowRoot.querySelectorAll('.star');
		const filledCount = [...stars].filter(s => s.classList.contains('filled')).length;
		if(filledCount !== 3){
			cleanup(container);
			return fail(`Expected 3 filled stars, got ${filledCount}`);
		}
		cleanup(container);
		pass('Correct number of stars marked filled');
	},

	'first 3 stars should be filled and use star_filled icon': async ({pass, fail}) => {
		const { container, rating } = await createRating({ value: 3 });
		const stars = rating.shadowRoot.querySelectorAll('.star');
		for(let i = 0; i < 3; i++){
			const icon = stars[i].querySelector('k-icon');
			if(icon.getAttribute('name') !== 'star_filled'){
				cleanup(container);
				return fail(`Expected star ${i + 1} to use star_filled icon, got "${icon.getAttribute('name')}"`);
			}
		}
		cleanup(container);
		pass('Filled stars use star_filled icon');
	},

	'remaining stars should use outline star icon': async ({pass, fail}) => {
		const { container, rating } = await createRating({ value: 3 });
		const stars = rating.shadowRoot.querySelectorAll('.star');
		for(let i = 3; i < 5; i++){
			const icon = stars[i].querySelector('k-icon');
			if(icon.getAttribute('name') !== 'star'){
				cleanup(container);
				return fail(`Expected star ${i + 1} to use star icon, got "${icon.getAttribute('name')}"`);
			}
		}
		cleanup(container);
		pass('Unfilled stars use outline star icon');
	},

	'should have no filled stars by default': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		const stars = rating.shadowRoot.querySelectorAll('.star');
		const filledCount = [...stars].filter(s => s.classList.contains('filled')).length;
		if(filledCount !== 0){
			cleanup(container);
			return fail(`Expected 0 filled stars, got ${filledCount}`);
		}
		cleanup(container);
		pass('No stars filled by default');
	},

	/*
		Click Handling
	*/
	'should update value when a star is clicked': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		const stars = rating.shadowRoot.querySelectorAll('.star');
		stars[2].click();
		await rating.updateComplete;
		if(rating.value !== 3){
			cleanup(container);
			return fail(`Expected value to be 3 after clicking 3rd star, got ${rating.value}`);
		}
		cleanup(container);
		pass('Value updates when star is clicked');
	},

	'should update value when a lower star is clicked': async ({pass, fail}) => {
		const { container, rating } = await createRating({ value: 5 });
		const stars = rating.shadowRoot.querySelectorAll('.star');
		stars[0].click();
		await rating.updateComplete;
		if(rating.value !== 1){
			cleanup(container);
			return fail(`Expected value to be 1 after clicking 1st star, got ${rating.value}`);
		}
		cleanup(container);
		pass('Value updates when a lower star is clicked');
	},

	/*
		Hover Preview
	*/
	'should preview fill on hover without changing value': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		const stars = rating.shadowRoot.querySelectorAll('.star');
		stars[3].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await rating.updateComplete;
		const filledCount = [...rating.shadowRoot.querySelectorAll('.star')].filter(s => s.classList.contains('filled')).length;
		if(filledCount !== 4){
			cleanup(container);
			return fail(`Expected 4 stars previewed as filled, got ${filledCount}`);
		}
		if(rating.value !== 0){
			cleanup(container);
			return fail(`Expected value to remain 0 during hover preview, got ${rating.value}`);
		}
		cleanup(container);
		pass('Hover previews fill state without changing value');
	},

	'should revert preview to actual value on mouse leave': async ({pass, fail}) => {
		const { container, rating } = await createRating({ value: 2 });
		const starsContainer = rating.shadowRoot.querySelector('#stars');
		const stars = rating.shadowRoot.querySelectorAll('.star');
		stars[4].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
		await rating.updateComplete;
		starsContainer.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
		await rating.updateComplete;
		const filledCount = [...rating.shadowRoot.querySelectorAll('.star')].filter(s => s.classList.contains('filled')).length;
		if(filledCount !== 2){
			cleanup(container);
			return fail(`Expected fill to revert to value of 2, got ${filledCount} filled`);
		}
		cleanup(container);
		pass('Fill preview reverts to actual value on mouse leave');
	},

	/*
		Events
	*/
	'should dispatch change event when value changes': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		let eventFired = false;
		let eventDetail = null;
		rating.addEventListener('change', (event) => {
			eventFired = true;
			eventDetail = event.detail;
		});
		rating.value = 4;
		await rating.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('Change event should be dispatched');
		}
		if(eventDetail.value !== 4){
			cleanup(container);
			return fail(`Expected change event detail.value to be 4, got ${eventDetail.value}`);
		}
		cleanup(container);
		pass('Change event dispatched with correct detail');
	},

	'should dispatch change event when star is clicked': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		let eventFired = false;
		rating.addEventListener('change', () => { eventFired = true; });
		const stars = rating.shadowRoot.querySelectorAll('.star');
		stars[1].click();
		await rating.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('Change event should be dispatched on click');
		}
		cleanup(container);
		pass('Change event dispatched on click');
	},

	'change event should bubble': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		let eventBubbled = false;
		document.body.addEventListener('change', () => { eventBubbled = true; }, { once: true });
		rating.value = 3;
		await rating.updateComplete;
		if(!eventBubbled){
			cleanup(container);
			return fail('change event should bubble');
		}
		cleanup(container);
		pass('change event bubbles');
	},

	/*
		Disabled
	*/
	'disabled should default to false': async ({pass, fail}) => {
		const { container, rating } = await createRating();
		if(rating.disabled !== false){
			cleanup(container);
			return fail(`Expected disabled to be false, got ${rating.disabled}`);
		}
		cleanup(container);
		pass('disabled defaults to false');
	},

	'should reflect disabled attribute': async ({pass, fail}) => {
		const { container, rating } = await createRating({ disabled: true });
		if(!rating.hasAttribute('disabled')){
			cleanup(container);
			return fail('Rating should have disabled attribute');
		}
		if(rating.disabled !== true){
			cleanup(container);
			return fail(`Expected disabled property to be true, got ${rating.disabled}`);
		}
		cleanup(container);
		pass('disabled attribute reflects correctly');
	},

	'click should not change value when disabled': async ({pass, fail}) => {
		const { container, rating } = await createRating({ disabled: true, value: 2 });
		const stars = rating.shadowRoot.querySelectorAll('.star');
		stars[4].click();
		await rating.updateComplete;
		if(rating.value !== 2){
			cleanup(container);
			return fail(`Expected value to remain 2 after click when disabled, got ${rating.value}`);
		}
		cleanup(container);
		pass('Click does not change value when disabled');
	},

	'star buttons should be disabled when rating is disabled': async ({pass, fail}) => {
		const { container, rating } = await createRating({ disabled: true });
		const stars = rating.shadowRoot.querySelectorAll('.star');
		const allDisabled = [...stars].every(s => s.disabled);
		if(!allDisabled){
			cleanup(container);
			return fail('All star buttons should be disabled');
		}
		cleanup(container);
		pass('Star buttons disabled correctly');
	},

	/*
		Form Association
	*/
	'should be form-associated': async ({pass, fail}) => {
		if(!Rating.formAssociated){
			return fail('Rating should be form-associated');
		}
		pass('Rating is form-associated');
	},

	'should reset to initial value on form reset': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = `
			<form id="ratingForm">
				<k-rating value="2"></k-rating>
			</form>
		`;
		document.body.appendChild(container);
		const rating = container.querySelector('k-rating');
		const form = container.querySelector('#ratingForm');
		await rating.updateComplete;
		rating.value = 5;
		await rating.updateComplete;
		form.reset();
		if(rating.value !== 2){
			cleanup(container);
			return fail(`Expected value to reset to 2, got ${rating.value}`);
		}
		cleanup(container);
		pass('Rating resets to initial value on form reset');
	}
};
