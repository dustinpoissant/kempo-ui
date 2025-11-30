import { Tabs, Tab, TabContent, TabSpacer } from '../../src/components/Tabs.js';

const createTabs = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-tabs ${options.active ? `active="${options.active}"` : ''} ${options.fixedHeight ? 'fixed-height' : ''}>
			<k-tab for="tab1" slot="tabs">Tab 1</k-tab>
			<k-tab for="tab2" slot="tabs">Tab 2</k-tab>
			<k-tab for="tab3" slot="tabs">Tab 3</k-tab>
			<k-tab-content name="tab1">Content 1</k-tab-content>
			<k-tab-content name="tab2">Content 2</k-tab-content>
			<k-tab-content name="tab3">Content 3</k-tab-content>
		</k-tabs>
	`;
	document.body.appendChild(container);

	const tabs = container.querySelector('k-tabs');
	await tabs.updateComplete;

	return { container, tabs };
};

const createTabsWithSpacer = async () => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-tabs>
			<k-tab for="tab1" slot="tabs">Tab 1</k-tab>
			<k-tab-spacer></k-tab-spacer>
			<k-tab for="tab2" slot="tabs">Tab 2</k-tab>
			<k-tab-content name="tab1">Content 1</k-tab-content>
			<k-tab-content name="tab2">Content 2</k-tab-content>
		</k-tabs>
	`;
	document.body.appendChild(container);

	const tabs = container.querySelector('k-tabs');
	await tabs.updateComplete;

	return { container, tabs };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Tabs Component Tests
	*/
	'should create tabs element': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(!tabs){
			cleanup(container);
			fail('Tabs element should be created');
			return;
		}

		if(!(tabs instanceof Tabs)){
			cleanup(container);
			fail('Element should be instance of Tabs');
			return;
		}

		cleanup(container);
		pass('Tabs element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(!tabs.shadowRoot){
			cleanup(container);
			fail('Tabs should have shadow root');
			return;
		}

		cleanup(container);
		pass('Tabs has shadow root');
	},

	'should have default fixedHeight as false': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(tabs.fixedHeight !== false){
			cleanup(container);
			fail(`Expected fixedHeight to be false, got ${tabs.fixedHeight}`);
			return;
		}

		cleanup(container);
		pass('Default fixedHeight is false');
	},

	'should set fixedHeight when attribute is present': async ({pass, fail}) => {
		const { container, tabs } = await createTabs({ fixedHeight: true });

		if(tabs.fixedHeight !== true){
			cleanup(container);
			fail(`Expected fixedHeight to be true, got ${tabs.fixedHeight}`);
			return;
		}

		cleanup(container);
		pass('fixedHeight is true when attribute set');
	},

	'should auto-activate first tab when no active specified': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(tabs.active !== 'tab1'){
			cleanup(container);
			fail(`Expected active to be tab1, got ${tabs.active}`);
			return;
		}

		cleanup(container);
		pass('First tab auto-activated');
	},

	'should set active tab from attribute': async ({pass, fail}) => {
		const { container, tabs } = await createTabs({ active: 'tab2' });

		if(tabs.active !== 'tab2'){
			cleanup(container);
			fail(`Expected active to be tab2, got ${tabs.active}`);
			return;
		}

		cleanup(container);
		pass('Active tab set from attribute');
	},

	'should reflect active attribute': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const activeAttr = tabs.getAttribute('active');
		if(activeAttr !== 'tab1'){
			cleanup(container);
			fail(`Expected active attribute tab1, got ${activeAttr}`);
			return;
		}

		cleanup(container);
		pass('Active attribute reflects correctly');
	},

	'should render wrapper element': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const wrapper = tabs.shadowRoot.getElementById('wrapper');
		if(!wrapper){
			cleanup(container);
			fail('Tabs should render wrapper element');
			return;
		}

		cleanup(container);
		pass('Tabs renders wrapper element');
	},

	'should render tabs container': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tabsContainer = tabs.shadowRoot.getElementById('tabs-container');
		if(!tabsContainer){
			cleanup(container);
			fail('Tabs should render tabs-container element');
			return;
		}

		cleanup(container);
		pass('Tabs renders tabs container');
	},

	'should render tabs slot area': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tabsArea = tabs.shadowRoot.getElementById('tabs');
		if(!tabsArea){
			cleanup(container);
			fail('Tabs should render tabs slot area');
			return;
		}

		cleanup(container);
		pass('Tabs renders tabs slot area');
	},

	'should render contents area': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const contents = tabs.shadowRoot.getElementById('contents');
		if(!contents){
			cleanup(container);
			fail('Tabs should render contents area');
			return;
		}

		cleanup(container);
		pass('Tabs renders contents area');
	},

	'should render scroll indicators': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const scrollLeft = tabs.shadowRoot.getElementById('scroll-left');
		const scrollRight = tabs.shadowRoot.getElementById('scroll-right');

		if(!scrollLeft || !scrollRight){
			cleanup(container);
			fail('Tabs should render scroll indicators');
			return;
		}

		cleanup(container);
		pass('Tabs renders scroll indicators');
	},

	'should have getTab method': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(typeof tabs.getTab !== 'function'){
			cleanup(container);
			fail('Tabs should have getTab method');
			return;
		}

		cleanup(container);
		pass('Tabs has getTab method');
	},

	'getTab should return tab by for attribute': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab2');
		if(!tab){
			cleanup(container);
			fail('getTab should return tab element');
			return;
		}

		if(tab.for !== 'tab2'){
			cleanup(container);
			fail(`Expected tab for "tab2", got "${tab.for}"`);
			return;
		}

		cleanup(container);
		pass('getTab returns correct tab');
	},

	'getTab should return tab by index': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab(1);
		if(!tab){
			cleanup(container);
			fail('getTab should return tab by index');
			return;
		}

		if(tab.for !== 'tab2'){
			cleanup(container);
			fail(`Expected tab for "tab2", got "${tab.for}"`);
			return;
		}

		cleanup(container);
		pass('getTab returns tab by index');
	},

	'should have getContent method': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(typeof tabs.getContent !== 'function'){
			cleanup(container);
			fail('Tabs should have getContent method');
			return;
		}

		cleanup(container);
		pass('Tabs has getContent method');
	},

	'getContent should return content by name': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab2');
		if(!content){
			cleanup(container);
			fail('getContent should return content element');
			return;
		}

		if(content.name !== 'tab2'){
			cleanup(container);
			fail(`Expected content name "tab2", got "${content.name}"`);
			return;
		}

		cleanup(container);
		pass('getContent returns correct content');
	},

	'should have getActiveTab method': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(typeof tabs.getActiveTab !== 'function'){
			cleanup(container);
			fail('Tabs should have getActiveTab method');
			return;
		}

		cleanup(container);
		pass('Tabs has getActiveTab method');
	},

	'getActiveTab should return active tab': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const activeTab = tabs.getActiveTab();
		if(!activeTab){
			cleanup(container);
			fail('getActiveTab should return tab element');
			return;
		}

		if(!activeTab.active){
			cleanup(container);
			fail('Returned tab should be active');
			return;
		}

		cleanup(container);
		pass('getActiveTab returns active tab');
	},

	'should have getActiveContent method': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		if(typeof tabs.getActiveContent !== 'function'){
			cleanup(container);
			fail('Tabs should have getActiveContent method');
			return;
		}

		cleanup(container);
		pass('Tabs has getActiveContent method');
	},

	'getActiveContent should return active content': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const activeContent = tabs.getActiveContent();
		if(!activeContent){
			cleanup(container);
			fail('getActiveContent should return content element');
			return;
		}

		if(!activeContent.active){
			cleanup(container);
			fail('Returned content should be active');
			return;
		}

		cleanup(container);
		pass('getActiveContent returns active content');
	},

	'should have tabs getter': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tabsList = tabs.tabs;
		if(!Array.isArray(tabsList)){
			cleanup(container);
			fail('tabs getter should return array');
			return;
		}

		if(tabsList.length !== 3){
			cleanup(container);
			fail(`Expected 3 tabs, got ${tabsList.length}`);
			return;
		}

		cleanup(container);
		pass('tabs getter returns all tabs');
	},

	'should have contents getter': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const contentsList = tabs.contents;
		if(!Array.isArray(contentsList)){
			cleanup(container);
			fail('contents getter should return array');
			return;
		}

		if(contentsList.length !== 3){
			cleanup(container);
			fail(`Expected 3 contents, got ${contentsList.length}`);
			return;
		}

		cleanup(container);
		pass('contents getter returns all contents');
	},

	'should dispatch tab event on tab change': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		let eventFired = false;
		let eventDetail = null;
		tabs.addEventListener('tab', (e) => {
			eventFired = true;
			eventDetail = e.detail;
		});

		tabs.active = 'tab2';
		await tabs.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('tab event should be dispatched');
			return;
		}

		if(eventDetail.tab !== 'tab2'){
			cleanup(container);
			fail(`Expected tab "tab2" in detail, got "${eventDetail.tab}"`);
			return;
		}

		cleanup(container);
		pass('tab event dispatched with correct detail');
	},

	'should update active elements when active changes': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		tabs.active = 'tab2';
		await tabs.updateComplete;

		const tab1 = tabs.getTab('tab1');
		const tab2 = tabs.getTab('tab2');
		const content1 = tabs.getContent('tab1');
		const content2 = tabs.getContent('tab2');

		if(tab1.active){
			cleanup(container);
			fail('Tab1 should not be active');
			return;
		}

		if(!tab2.active){
			cleanup(container);
			fail('Tab2 should be active');
			return;
		}

		if(content1.active){
			cleanup(container);
			fail('Content1 should not be active');
			return;
		}

		if(!content2.active){
			cleanup(container);
			fail('Content2 should be active');
			return;
		}

		cleanup(container);
		pass('Active elements update correctly');
	},

	'should have block display': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const display = getComputedStyle(tabs).display;

		if(display !== 'block'){
			cleanup(container);
			fail(`Expected display block, got ${display}`);
			return;
		}

		cleanup(container);
		pass('Tabs has block display');
	},

	/*
		Tab Component Tests
	*/
	'Tab: should create tab element': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		if(!tab){
			cleanup(container);
			fail('Tab element should be created');
			return;
		}

		if(!(tab instanceof Tab)){
			cleanup(container);
			fail('Element should be instance of Tab');
			return;
		}

		cleanup(container);
		pass('Tab element created correctly');
	},

	'Tab: should have for property': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		if(tab.for !== 'tab1'){
			cleanup(container);
			fail(`Expected for "tab1", got "${tab.for}"`);
			return;
		}

		cleanup(container);
		pass('Tab has correct for property');
	},

	'Tab: should have active property': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		if(tab.active !== true){
			cleanup(container);
			fail('First tab should be active');
			return;
		}

		const tab2 = tabs.getTab('tab2');
		if(tab2.active !== false){
			cleanup(container);
			fail('Second tab should not be active');
			return;
		}

		cleanup(container);
		pass('Tab has correct active property');
	},

	'Tab: should reflect active attribute': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		if(!tab.hasAttribute('active')){
			cleanup(container);
			fail('Active tab should have active attribute');
			return;
		}

		const tab2 = tabs.getTab('tab2');
		if(tab2.hasAttribute('active')){
			cleanup(container);
			fail('Inactive tab should not have active attribute');
			return;
		}

		cleanup(container);
		pass('Tab active attribute reflects correctly');
	},

	'Tab: should have tabs getter': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		if(tab.tabs !== tabs){
			cleanup(container);
			fail('Tab tabs getter should return parent Tabs');
			return;
		}

		cleanup(container);
		pass('Tab tabs getter works');
	},

	'Tab: should change active tab on click': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab2 = tabs.getTab('tab2');
		const button = tab2.shadowRoot.getElementById('button');
		button.click();
		await tabs.updateComplete;

		if(tabs.active !== 'tab2'){
			cleanup(container);
			fail(`Expected active tab2, got ${tabs.active}`);
			return;
		}

		cleanup(container);
		pass('Tab changes active on click');
	},

	'Tab: should render button element': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		const button = tab.shadowRoot.getElementById('button');

		if(!button){
			cleanup(container);
			fail('Tab should render button element');
			return;
		}

		cleanup(container);
		pass('Tab renders button element');
	},

	'Tab: should have slot for content': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		const slot = tab.shadowRoot.querySelector('slot');

		if(!slot){
			cleanup(container);
			fail('Tab should have slot for content');
			return;
		}

		cleanup(container);
		pass('Tab has slot for content');
	},

	'Tab: slot should be in tabs slot': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const tab = tabs.getTab('tab1');
		if(tab.slot !== 'tabs'){
			cleanup(container);
			fail(`Expected slot "tabs", got "${tab.slot}"`);
			return;
		}

		cleanup(container);
		pass('Tab is in tabs slot');
	},

	/*
		TabContent Component Tests
	*/
	'TabContent: should create tab-content element': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab1');
		if(!content){
			cleanup(container);
			fail('TabContent element should be created');
			return;
		}

		if(!(content instanceof TabContent)){
			cleanup(container);
			fail('Element should be instance of TabContent');
			return;
		}

		cleanup(container);
		pass('TabContent element created correctly');
	},

	'TabContent: should have name property': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab1');
		if(content.name !== 'tab1'){
			cleanup(container);
			fail(`Expected name "tab1", got "${content.name}"`);
			return;
		}

		cleanup(container);
		pass('TabContent has correct name property');
	},

	'TabContent: should have active property': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab1');
		if(content.active !== true){
			cleanup(container);
			fail('First content should be active');
			return;
		}

		const content2 = tabs.getContent('tab2');
		if(content2.active !== false){
			cleanup(container);
			fail('Second content should not be active');
			return;
		}

		cleanup(container);
		pass('TabContent has correct active property');
	},

	'TabContent: should reflect active attribute': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab1');
		if(!content.hasAttribute('active')){
			cleanup(container);
			fail('Active content should have active attribute');
			return;
		}

		const content2 = tabs.getContent('tab2');
		if(content2.hasAttribute('active')){
			cleanup(container);
			fail('Inactive content should not have active attribute');
			return;
		}

		cleanup(container);
		pass('TabContent active attribute reflects correctly');
	},

	'TabContent: should have tabs getter': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab1');
		if(content.tabs !== tabs){
			cleanup(container);
			fail('TabContent tabs getter should return parent Tabs');
			return;
		}

		cleanup(container);
		pass('TabContent tabs getter works');
	},

	'TabContent: should be visible when active': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab1');
		const display = getComputedStyle(content).display;

		if(display === 'none'){
			cleanup(container);
			fail('Active content should be visible');
			return;
		}

		cleanup(container);
		pass('Active content is visible');
	},

	'TabContent: should be hidden when not active': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab2');
		const display = getComputedStyle(content).display;

		if(display !== 'none'){
			cleanup(container);
			fail(`Expected display none for inactive content, got ${display}`);
			return;
		}

		cleanup(container);
		pass('Inactive content is hidden');
	},

	'TabContent: should have slot for content': async ({pass, fail}) => {
		const { container, tabs } = await createTabs();

		const content = tabs.getContent('tab1');
		const slot = content.shadowRoot.querySelector('slot');

		if(!slot){
			cleanup(container);
			fail('TabContent should have slot for content');
			return;
		}

		cleanup(container);
		pass('TabContent has slot for content');
	},

	/*
		TabSpacer Component Tests
	*/
	'TabSpacer: should create tab-spacer element': async ({pass, fail}) => {
		const { container, tabs } = await createTabsWithSpacer();

		const spacer = tabs.querySelector('k-tab-spacer');
		if(!spacer){
			cleanup(container);
			fail('TabSpacer element should be created');
			return;
		}

		if(!(spacer instanceof TabSpacer)){
			cleanup(container);
			fail('Element should be instance of TabSpacer');
			return;
		}

		cleanup(container);
		pass('TabSpacer element created correctly');
	},

	'TabSpacer: should be in tabs slot': async ({pass, fail}) => {
		const { container, tabs } = await createTabsWithSpacer();

		const spacer = tabs.querySelector('k-tab-spacer');
		if(spacer.slot !== 'tabs'){
			cleanup(container);
			fail(`Expected slot "tabs", got "${spacer.slot}"`);
			return;
		}

		cleanup(container);
		pass('TabSpacer is in tabs slot');
	},

	'TabSpacer: should have flex grow': async ({pass, fail}) => {
		const { container, tabs } = await createTabsWithSpacer();

		const spacer = tabs.querySelector('k-tab-spacer');
		const flexGrow = getComputedStyle(spacer).flexGrow;

		if(flexGrow !== '1'){
			cleanup(container);
			fail(`Expected flex-grow 1, got ${flexGrow}`);
			return;
		}

		cleanup(container);
		pass('TabSpacer has flex grow');
	}
};
