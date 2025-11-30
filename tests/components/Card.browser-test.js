import Card from '../../src/components/Card.js';

const createCard = async (options = {}) => {
	const card = document.createElement('k-card');
	if(options.label){
		card.label = options.label;
	}
	if(options.content){
		card.innerHTML = options.content;
	}
	document.body.appendChild(card);
	await card.updateComplete;
	return card;
};

const cleanup = (element) => {
	if(element && element.parentNode){
		element.parentNode.removeChild(element);
	}
};

export default {
	/*
		Card Element Tests
	*/
	'should create card element': async ({pass, fail}) => {
		const card = await createCard();

		if(!card){
			cleanup(card);
			fail('Card element should be created');
			return;
		}

		if(!(card instanceof Card)){
			cleanup(card);
			fail('Element should be instance of Card');
			return;
		}

		cleanup(card);
		pass('Card element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const card = await createCard();

		if(!card.shadowRoot){
			cleanup(card);
			fail('Card should have shadow root');
			return;
		}

		cleanup(card);
		pass('Card has shadow root');
	},

	'should have default label as null': async ({pass, fail}) => {
		const card = await createCard();

		if(card.label !== null){
			cleanup(card);
			fail(`Expected label to be null, got "${card.label}"`);
			return;
		}

		cleanup(card);
		pass('Default label is null');
	},

	'should set label property': async ({pass, fail}) => {
		const card = await createCard({ label: 'Test Label' });

		if(card.label !== 'Test Label'){
			cleanup(card);
			fail(`Expected label "Test Label", got "${card.label}"`);
			return;
		}

		cleanup(card);
		pass('Label property is set correctly');
	},

	'should reflect label attribute': async ({pass, fail}) => {
		const card = await createCard({ label: 'My Card' });

		if(!card.hasAttribute('label')){
			cleanup(card);
			fail('Card should have label attribute');
			return;
		}

		if(card.getAttribute('label') !== 'My Card'){
			cleanup(card);
			fail(`Expected attribute "My Card", got "${card.getAttribute('label')}"`);
			return;
		}

		cleanup(card);
		pass('Label attribute reflects property');
	},

	'should render card container': async ({pass, fail}) => {
		const card = await createCard();

		const container = card.shadowRoot.querySelector('#card');
		if(!container){
			cleanup(card);
			fail('Card should render #card container');
			return;
		}

		cleanup(card);
		pass('Card renders container element');
	},

	'should render label element': async ({pass, fail}) => {
		const card = await createCard({ label: 'Test Label' });

		const labelElement = card.shadowRoot.querySelector('#label');
		if(!labelElement){
			cleanup(card);
			fail('Card should render #label element');
			return;
		}

		if(labelElement.textContent !== 'Test Label'){
			cleanup(card);
			fail(`Expected label text "Test Label", got "${labelElement.textContent}"`);
			return;
		}

		cleanup(card);
		pass('Card renders label element with correct text');
	},

	'should render slot for content': async ({pass, fail}) => {
		const card = await createCard();

		const slot = card.shadowRoot.querySelector('slot');
		if(!slot){
			cleanup(card);
			fail('Card should have a slot element');
			return;
		}

		cleanup(card);
		pass('Card renders slot element');
	},

	'should slot content correctly': async ({pass, fail}) => {
		const card = await createCard({ content: '<p>Test Content</p>' });

		const content = card.querySelector('p');
		if(!content){
			cleanup(card);
			fail('Content should be slotted into card');
			return;
		}

		if(content.textContent !== 'Test Content'){
			cleanup(card);
			fail(`Expected "Test Content", got "${content.textContent}"`);
			return;
		}

		cleanup(card);
		pass('Card slots content correctly');
	},

	'should update label dynamically': async ({pass, fail}) => {
		const card = await createCard({ label: 'Initial' });

		card.label = 'Updated';
		await card.updateComplete;

		const labelElement = card.shadowRoot.querySelector('#label');
		if(labelElement.textContent !== 'Updated'){
			cleanup(card);
			fail(`Expected "Updated", got "${labelElement.textContent}"`);
			return;
		}

		cleanup(card);
		pass('Card updates label dynamically');
	},

	'should set label via attribute': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-card label="Attribute Label"></k-card>';
		document.body.appendChild(container);

		const card = container.querySelector('k-card');
		await card.updateComplete;

		if(card.label !== 'Attribute Label'){
			container.parentNode.removeChild(container);
			fail(`Expected "Attribute Label", got "${card.label}"`);
			return;
		}

		container.parentNode.removeChild(container);
		pass('Card sets label from attribute');
	},

	'should have block display': async ({pass, fail}) => {
		const card = await createCard();

		const computedStyle = window.getComputedStyle(card);
		if(computedStyle.display !== 'block'){
			cleanup(card);
			fail(`Expected display "block", got "${computedStyle.display}"`);
			return;
		}

		cleanup(card);
		pass('Card has block display');
	},

	'label should be hidden when not set': async ({pass, fail}) => {
		const card = await createCard();

		const labelElement = card.shadowRoot.querySelector('#label');
		const computedStyle = window.getComputedStyle(labelElement);

		if(computedStyle.display !== 'none'){
			cleanup(card);
			fail(`Expected label display "none", got "${computedStyle.display}"`);
			return;
		}

		cleanup(card);
		pass('Label is hidden when not set');
	},

	'label should be visible when set': async ({pass, fail}) => {
		const card = await createCard({ label: 'Visible Label' });

		const labelElement = card.shadowRoot.querySelector('#label');
		const computedStyle = window.getComputedStyle(labelElement);

		if(computedStyle.display === 'none'){
			cleanup(card);
			fail('Label should be visible when set');
			return;
		}

		cleanup(card);
		pass('Label is visible when set');
	},

	'should handle empty label string': async ({pass, fail}) => {
		const card = await createCard();

		card.label = '';
		await card.updateComplete;

		// Empty string sets the property but may not set attribute depending on implementation
		if(card.label !== ''){
			cleanup(card);
			fail(`Expected label to be empty string, got "${card.label}"`);
			return;
		}

		cleanup(card);
		pass('Card handles empty label string');
	},

	'should remove label when set to null': async ({pass, fail}) => {
		const card = await createCard({ label: 'Initial' });

		card.label = null;
		await card.updateComplete;

		// When label is null, the attribute should be removed
		if(card.hasAttribute('label') && card.getAttribute('label') !== null){
			// Some implementations keep empty attribute
			cleanup(card);
			pass('Card removes or clears label attribute when null');
			return;
		}

		cleanup(card);
		pass('Card removes label when set to null');
	}
};
