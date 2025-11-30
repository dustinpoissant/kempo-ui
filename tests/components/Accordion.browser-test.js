import Accordion, { AccordionHeader, AccordionPanel } from '../../src/components/Accordion.js';

const createAccordion = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-accordion ${options.multiple ? 'multiple' : ''} ${options.persistentId ? `persistent-id="${options.persistentId}"` : ''}>
			<k-accordion-header for-panel="panel1">Header 1</k-accordion-header>
			<k-accordion-panel name="panel1">Content 1</k-accordion-panel>
			<k-accordion-header for-panel="panel2">Header 2</k-accordion-header>
			<k-accordion-panel name="panel2">Content 2</k-accordion-panel>
			<k-accordion-header for-panel="panel3">Header 3</k-accordion-header>
			<k-accordion-panel name="panel3">Content 3</k-accordion-panel>
		</k-accordion>
	`;
	document.body.appendChild(container);

	const accordion = container.querySelector('k-accordion');
	await accordion.updateComplete;

	return { container, accordion };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Accordion Component Tests
	*/
	'should create accordion element': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		if(!accordion){
			cleanup(container);
			fail('Accordion element should be created');
			return;
		}

		if(!(accordion instanceof Accordion)){
			cleanup(container);
			fail('Element should be instance of Accordion');
			return;
		}

		cleanup(container);
		pass('Accordion element created correctly');
	},

	'should have default multiple property as false': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		if(accordion.multiple !== false){
			cleanup(container);
			fail(`Expected multiple to be false, got ${accordion.multiple}`);
			return;
		}

		cleanup(container);
		pass('Default multiple property is false');
	},

	'should have multiple property when attribute is set': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion({ multiple: true });

		if(accordion.multiple !== true){
			cleanup(container);
			fail(`Expected multiple to be true, got ${accordion.multiple}`);
			return;
		}

		cleanup(container);
		pass('Multiple property is true when attribute set');
	},

	'should get header by panel name': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const header = accordion.getHeader('panel1');
		if(!header){
			cleanup(container);
			fail('getHeader should return header element');
			return;
		}

		if(header.forPanel !== 'panel1'){
			cleanup(container);
			fail(`Expected forPanel "panel1", got "${header.forPanel}"`);
			return;
		}

		cleanup(container);
		pass('getHeader returns correct header');
	},

	'should get panel by name': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const panel = accordion.getPanel('panel2');
		if(!panel){
			cleanup(container);
			fail('getPanel should return panel element');
			return;
		}

		if(panel.name !== 'panel2'){
			cleanup(container);
			fail(`Expected panel name "panel2", got "${panel.name}"`);
			return;
		}

		cleanup(container);
		pass('getPanel returns correct panel');
	},

	'should open panel': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		accordion.openPanel('panel1');
		await accordion.updateComplete;

		const panel = accordion.getPanel('panel1');
		if(!panel.active){
			cleanup(container);
			fail('Panel should be active after openPanel');
			return;
		}

		const header = accordion.getHeader('panel1');
		if(!header.active){
			cleanup(container);
			fail('Header should be active after openPanel');
			return;
		}

		cleanup(container);
		pass('openPanel activates panel and header');
	},

	'should close panel': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		accordion.openPanel('panel1');
		await accordion.updateComplete;

		accordion.closePanel('panel1');
		await accordion.updateComplete;

		const panel = accordion.getPanel('panel1');
		if(panel.active){
			cleanup(container);
			fail('Panel should not be active after closePanel');
			return;
		}

		cleanup(container);
		pass('closePanel deactivates panel');
	},

	'should toggle panel': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		accordion.togglePanel('panel1');
		await accordion.updateComplete;

		let panel = accordion.getPanel('panel1');
		if(!panel.active){
			cleanup(container);
			fail('Panel should be active after first toggle');
			return;
		}

		accordion.togglePanel('panel1');
		await accordion.updateComplete;

		if(panel.active){
			cleanup(container);
			fail('Panel should not be active after second toggle');
			return;
		}

		cleanup(container);
		pass('togglePanel correctly toggles panel state');
	},

	'should close other panels in exclusive mode': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		accordion.openPanel('panel1');
		await accordion.updateComplete;

		accordion.openPanel('panel2');
		await accordion.updateComplete;

		const panel1 = accordion.getPanel('panel1');
		const panel2 = accordion.getPanel('panel2');

		if(panel1.active){
			cleanup(container);
			fail('Panel1 should be closed in exclusive mode');
			return;
		}

		if(!panel2.active){
			cleanup(container);
			fail('Panel2 should be open');
			return;
		}

		cleanup(container);
		pass('Exclusive mode closes other panels');
	},

	'should allow multiple panels open in multiple mode': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion({ multiple: true });

		accordion.openPanel('panel1');
		await accordion.updateComplete;

		accordion.openPanel('panel2');
		await accordion.updateComplete;

		const panel1 = accordion.getPanel('panel1');
		const panel2 = accordion.getPanel('panel2');

		if(!panel1.active){
			cleanup(container);
			fail('Panel1 should stay open in multiple mode');
			return;
		}

		if(!panel2.active){
			cleanup(container);
			fail('Panel2 should be open');
			return;
		}

		cleanup(container);
		pass('Multiple mode allows multiple panels open');
	},

	'should dispatch openpanel event': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		let eventFired = false;
		let eventDetail = null;
		accordion.addEventListener('openpanel', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		accordion.openPanel('panel1');
		await accordion.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('openpanel event should be dispatched');
			return;
		}

		if(eventDetail.panelName !== 'panel1'){
			cleanup(container);
			fail(`Expected panelName "panel1", got "${eventDetail.panelName}"`);
			return;
		}

		cleanup(container);
		pass('openpanel event dispatched with correct detail');
	},

	'should dispatch closepanel event': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		accordion.openPanel('panel1');
		await accordion.updateComplete;

		let eventFired = false;
		let eventDetail = null;
		accordion.addEventListener('closepanel', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		accordion.closePanel('panel1');
		await accordion.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('closepanel event should be dispatched');
			return;
		}

		if(eventDetail.panelName !== 'panel1'){
			cleanup(container);
			fail(`Expected panelName "panel1", got "${eventDetail.panelName}"`);
			return;
		}

		cleanup(container);
		pass('closepanel event dispatched with correct detail');
	},

	'should dispatch togglepanel event': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		let eventFired = false;
		accordion.addEventListener('togglepanel', () => {
			eventFired = true;
		});

		accordion.togglePanel('panel1');
		await accordion.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('togglepanel event should be dispatched');
			return;
		}

		cleanup(container);
		pass('togglepanel event dispatched');
	},

	/*
		AccordionHeader Tests
	*/
	'AccordionHeader: should have forPanel property': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const header = accordion.getHeader('panel1');
		if(header.forPanel !== 'panel1'){
			cleanup(container);
			fail(`Expected forPanel "panel1", got "${header.forPanel}"`);
			return;
		}

		cleanup(container);
		pass('AccordionHeader has correct forPanel property');
	},

	'AccordionHeader: should toggle panel on click': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const header = accordion.getHeader('panel1');
		const panel = accordion.getPanel('panel1');

		header.click();
		await accordion.updateComplete;

		if(!panel.active){
			cleanup(container);
			fail('Panel should be active after header click');
			return;
		}

		cleanup(container);
		pass('AccordionHeader toggles panel on click');
	},

	'AccordionHeader: should have accordion getter': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const header = accordion.getHeader('panel1');
		if(header.accordion !== accordion){
			cleanup(container);
			fail('Header accordion getter should return parent accordion');
			return;
		}

		cleanup(container);
		pass('AccordionHeader accordion getter works');
	},

	'AccordionHeader: should render icon slot': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const header = accordion.getHeader('panel1');
		await header.updateComplete;

		const icon = header.shadowRoot.querySelector('k-icon');
		if(!icon){
			cleanup(container);
			fail('Header should render icon element');
			return;
		}

		cleanup(container);
		pass('AccordionHeader renders icon');
	},

	/*
		AccordionPanel Tests
	*/
	'AccordionPanel: should have name property': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const panel = accordion.getPanel('panel1');
		if(panel.name !== 'panel1'){
			cleanup(container);
			fail(`Expected name "panel1", got "${panel.name}"`);
			return;
		}

		cleanup(container);
		pass('AccordionPanel has correct name property');
	},

	'AccordionPanel: should have accordion getter': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const panel = accordion.getPanel('panel1');
		if(panel.accordion !== accordion){
			cleanup(container);
			fail('Panel accordion getter should return parent accordion');
			return;
		}

		cleanup(container);
		pass('AccordionPanel accordion getter works');
	},

	'AccordionPanel: should have transitioning property': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const panel = accordion.getPanel('panel1');

		if(panel.transitioning !== false){
			cleanup(container);
			fail('Panel transitioning should be false initially');
			return;
		}

		accordion.openPanel('panel1');

		if(!panel.transitioning){
			cleanup(container);
			fail('Panel transitioning should be true during animation');
			return;
		}

		cleanup(container);
		pass('AccordionPanel transitioning property works');
	},

	'AccordionPanel: active attribute should reflect state': async ({pass, fail}) => {
		const { container, accordion } = await createAccordion();

		const panel = accordion.getPanel('panel1');

		if(panel.hasAttribute('active')){
			cleanup(container);
			fail('Panel should not have active attribute initially');
			return;
		}

		accordion.openPanel('panel1');
		await accordion.updateComplete;

		if(!panel.hasAttribute('active')){
			cleanup(container);
			fail('Panel should have active attribute after opening');
			return;
		}

		cleanup(container);
		pass('AccordionPanel active attribute reflects state');
	}
};
