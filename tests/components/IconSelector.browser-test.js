import IconSelector from '../../src/components/IconSelector.js';

const tick = () => new Promise(resolve => setTimeout(resolve));

const createIconSelector = async (attributes = '') => {
	const container = document.createElement('div');
	container.innerHTML = `<k-icon-selector ${attributes}></k-icon-selector>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-icon-selector');
	await el.updateComplete;
	return { container, el };
};

const openDialog = async (el) => {
	el.shadowRoot.querySelector('#trigger').click();
	await el.updateComplete;
	await tick();
	const dialog = el.shadowRoot.querySelector('k-dialog');
	await dialog.updateComplete;
	return dialog;
};

const getTiles = el => [...el.shadowRoot.querySelectorAll('k-filter-item a')];

const getTile = (el, name) => getTiles(el).find(tile => tile.getAttribute('title') === name);

const getTileNames = el => getTiles(el).map(tile => tile.getAttribute('title')).filter(name => !name.startsWith('test-'));

const getHighlighted = el => [...el.shadowRoot.querySelectorAll('a.bg-primary')].map(tile => tile.getAttribute('title'));

const getTrigger = el => el.shadowRoot.querySelector('#trigger');

const getDialogButton = (dialog, id) => dialog.shadowRoot.querySelector(`#${id}`);

const getSearch = el => el.shadowRoot.querySelector('input[type="search"]');

const pressKey = (el, key) => {
	getSearch(el).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

const closeAndCleanup = (el, container) => {
	const dialog = el.shadowRoot.querySelector('k-dialog');
	if(dialog?.opened) dialog.close();
	cleanup(container);
};

const createForm = async (inner) => {
	const form = document.createElement('form');
	form.innerHTML = inner;
	document.body.appendChild(form);
	const el = form.querySelector('k-icon-selector');
	await el.updateComplete;
	return { form, el };
};

export default {
	/*
		Element Creation
	*/
	'should create icon-selector element': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		if(!el){
			cleanup(container);
			return fail('k-icon-selector element should be created');
		}
		if(!(el instanceof IconSelector)){
			cleanup(container);
			return fail('Element should be instance of IconSelector');
		}
		cleanup(container);
		pass('IconSelector element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		if(!el.shadowRoot){
			cleanup(container);
			return fail('IconSelector should have shadow root');
		}
		cleanup(container);
		pass('IconSelector has shadow root');
	},

	'should be form associated': async ({pass, fail}) => {
		if(IconSelector.formAssociated !== true){
			return fail('IconSelector should be formAssociated');
		}
		pass('IconSelector is form associated');
	},

	/*
		Defaults
	*/
	'should default value and name to empty strings': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		if(el.value !== '' || el.name !== ''){
			cleanup(container);
			return fail(`Expected empty value and name, got "${el.value}" and "${el.name}"`);
		}
		cleanup(container);
		pass('Default value and name are empty');
	},

	'should default dialog-title and placeholder to Choose an Icon': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		if(el.dialogTitle !== 'Choose an Icon' || el.placeholder !== 'Choose an Icon'){
			cleanup(container);
			return fail(`Expected both defaults "Choose an Icon", got "${el.dialogTitle}" and "${el.placeholder}"`);
		}
		cleanup(container);
		pass('Default dialog title and placeholder are Choose an Icon');
	},

	'should default the boolean attributes to off': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		if(el.iconOnly || el.allowClear || el.autoChoose){
			cleanup(container);
			return fail('icon-only, allow-clear and auto-choose should default to false');
		}
		cleanup(container);
		pass('Boolean attributes default to off');
	},

	/*
		Attributes and Properties
	*/
	'should read the value attribute': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="star"');
		if(el.value !== 'star'){
			cleanup(container);
			return fail(`Expected value "star", got "${el.value}"`);
		}
		cleanup(container);
		pass('Value attribute is read');
	},

	'should update value attribute when value property changes': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		el.value = 'check';
		await el.updateComplete;
		if(el.getAttribute('value') !== 'check'){
			cleanup(container);
			return fail(`Expected attribute "check", got "${el.getAttribute('value')}"`);
		}
		cleanup(container);
		pass('Value attribute reflects the property');
	},

	'should read and reflect the name attribute': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('name="menuIcon"');
		el.name = 'otherIcon';
		await el.updateComplete;
		if(el.getAttribute('name') !== 'otherIcon'){
			cleanup(container);
			return fail(`Expected name attribute "otherIcon", got "${el.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('Name attribute is read and reflected');
	},

	'should use dialog-title attribute for the dialog heading': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('dialog-title="Pick a Status Icon"');
		const dialog = el.shadowRoot.querySelector('k-dialog');
		const title = dialog.querySelector('[slot="title"]');
		if(title?.textContent.trim() !== 'Pick a Status Icon'){
			cleanup(container);
			return fail(`Expected dialog title "Pick a Status Icon", got "${title?.textContent.trim()}"`);
		}
		cleanup(container);
		pass('dialog-title sets the dialog heading');
	},

	'should read the placeholder attribute': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('placeholder="Pick a menu icon"');
		if(el.placeholder !== 'Pick a menu icon'){
			cleanup(container);
			return fail(`Expected placeholder "Pick a menu icon", got "${el.placeholder}"`);
		}
		cleanup(container);
		pass('Placeholder attribute is read');
	},

	'should read the boolean attributes as present or absent': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icon-only allow-clear auto-choose');
		if(!el.iconOnly || !el.allowClear || !el.autoChoose){
			cleanup(container);
			return fail('Present boolean attributes should be true');
		}
		cleanup(container);
		pass('Boolean attributes are read when present');
	},

	'should reflect boolean properties to attributes': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		el.iconOnly = true;
		el.allowClear = true;
		el.autoChoose = true;
		await el.updateComplete;
		if(!el.hasAttribute('icon-only') || !el.hasAttribute('allow-clear') || !el.hasAttribute('auto-choose')){
			cleanup(container);
			return fail('Boolean properties should reflect to attributes');
		}
		cleanup(container);
		pass('Boolean properties reflect to attributes');
	},

	/*
		Trigger Display
	*/
	'should show the icon name and a k-icon named after the value': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="star"');
		const icon = getTrigger(el).querySelector('k-icon');
		const label = getTrigger(el).querySelector('span');
		if(icon?.getAttribute('name') !== 'star'){
			cleanup(container);
			return fail(`Expected k-icon name "star", got "${icon?.getAttribute('name')}"`);
		}
		if(label?.textContent.trim() !== 'star'){
			cleanup(container);
			return fail(`Expected label "star", got "${label?.textContent.trim()}"`);
		}
		cleanup(container);
		pass('Trigger shows the icon and its name');
	},

	'should show the default placeholder when there is no value': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		if(getTrigger(el).querySelector('k-icon')){
			cleanup(container);
			return fail('Trigger should not show an icon without a value');
		}
		if(!getTrigger(el).textContent.includes('Choose an Icon')){
			cleanup(container);
			return fail('Trigger should show the default placeholder "Choose an Icon"');
		}
		cleanup(container);
		pass('Default placeholder shows when there is no value');
	},

	'should show a custom placeholder when there is no value': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('placeholder="Pick a menu icon"');
		if(!getTrigger(el).textContent.includes('Pick a menu icon')){
			cleanup(container);
			return fail(`Trigger should show the custom placeholder, got "${getTrigger(el).textContent.trim()}"`);
		}
		cleanup(container);
		pass('Custom placeholder shows when there is no value');
	},

	'should show a src value with a k-icon src and the file name': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="src:/media/hexagon.svg"');
		const icon = getTrigger(el).querySelector('k-icon');
		const label = getTrigger(el).querySelector('span');
		if(icon?.getAttribute('src') !== '/media/hexagon.svg'){
			cleanup(container);
			return fail(`Expected k-icon src "/media/hexagon.svg", got "${icon?.getAttribute('src')}"`);
		}
		if(icon.getAttribute('name')){
			cleanup(container);
			return fail(`A src icon should not name an icon on k-icon, got "${icon.getAttribute('name')}"`);
		}
		if(label?.textContent.trim() !== 'hexagon'){
			cleanup(container);
			return fail(`Expected label "hexagon", got "${label?.textContent.trim()}"`);
		}
		cleanup(container);
		pass('src: value uses src on k-icon and the file name as its label');
	},

	'should use the file name without a .svg extension for an unregistered src': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="src:/media/plain-logo"');
		const label = getTrigger(el).querySelector('span');
		if(label?.textContent.trim() !== 'plain-logo'){
			cleanup(container);
			return fail(`Expected label "plain-logo", got "${label?.textContent.trim()}"`);
		}
		cleanup(container);
		pass('Label is the file name when there is no .svg extension');
	},

	'should show a plain value without src: as a name, not a path': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="/media/hexagon.svg"');
		const icon = getTrigger(el).querySelector('k-icon');
		if(icon?.getAttribute('src')){
			cleanup(container);
			return fail('A value without the src: prefix should not be treated as a path');
		}
		if(icon?.getAttribute('name') !== '/media/hexagon.svg'){
			cleanup(container);
			return fail(`Expected name "/media/hexagon.svg", got "${icon?.getAttribute('name')}"`);
		}
		cleanup(container);
		pass('Only the src: prefix marks a path');
	},

	'should label a registered src icon with its registered name': async ({pass, fail}) => {
		IconSelector.add('test-registered-hexagon', '/media/hexagon.svg');
		const { container, el } = await createIconSelector('value="src:/media/hexagon.svg"');
		const label = getTrigger(el).querySelector('span');
		if(label?.textContent.trim() !== 'test-registered-hexagon'){
			cleanup(container);
			return fail(`Expected registered name "test-registered-hexagon", got "${label?.textContent.trim()}"`);
		}
		cleanup(container);
		pass('A registered src icon shows its registered name');
	},

	/*
		icon-only
	*/
	'should show only the icon with icon-only': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icon-only value="star"');
		if(!getTrigger(el).querySelector('k-icon')){
			cleanup(container);
			return fail('icon-only should still show the icon');
		}
		if(getTrigger(el).querySelector('span')){
			cleanup(container);
			return fail('icon-only should not show the name text');
		}
		cleanup(container);
		pass('icon-only shows only the icon');
	},

	'should label the icon-only trigger with the name': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icon-only value="star"');
		const trigger = getTrigger(el);
		if(trigger.getAttribute('aria-label') !== 'star' || trigger.getAttribute('title') !== 'star'){
			cleanup(container);
			return fail(`Expected aria-label and title "star", got "${trigger.getAttribute('aria-label')}" and "${trigger.getAttribute('title')}"`);
		}
		cleanup(container);
		pass('icon-only trigger has the name as its label and tooltip');
	},

	'should label the icon-only trigger with the placeholder when empty': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icon-only placeholder="Pick one"');
		const trigger = getTrigger(el);
		if(trigger.getAttribute('aria-label') !== 'Pick one'){
			cleanup(container);
			return fail(`Expected aria-label "Pick one", got "${trigger.getAttribute('aria-label')}"`);
		}
		if(trigger.querySelector('span')){
			cleanup(container);
			return fail('Empty icon-only trigger should not show text');
		}
		cleanup(container);
		pass('Empty icon-only trigger is labelled with the placeholder');
	},

	'should show a fallback icon with icon-only when empty': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icon-only');
		const icon = getTrigger(el).querySelector('k-icon');
		if(!icon || icon.getAttribute('name') || icon.getAttribute('src')){
			cleanup(container);
			return fail('Empty icon-only trigger should show a k-icon with no name or src');
		}
		cleanup(container);
		pass('Empty icon-only trigger shows the fallback icon');
	},

	'should not set a label on the trigger without icon-only': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="star"');
		const trigger = getTrigger(el);
		if(trigger.hasAttribute('aria-label') || trigger.hasAttribute('title')){
			cleanup(container);
			return fail('Trigger should not get a label or tooltip without icon-only');
		}
		cleanup(container);
		pass('Trigger has no label without icon-only');
	},

	'should be inline-block with icon-only and block otherwise': async ({pass, fail}) => {
		const inline = await createIconSelector('icon-only value="star"');
		const block = await createIconSelector('value="star"');
		const inlineDisplay = getComputedStyle(inline.el).display;
		const blockDisplay = getComputedStyle(block.el).display;
		cleanup(inline.container);
		cleanup(block.container);
		if(inlineDisplay !== 'inline-block' || blockDisplay !== 'block'){
			return fail(`Expected inline-block and block, got "${inlineDisplay}" and "${blockDisplay}"`);
		}
		pass('icon-only is inline-block, the default is block');
	},

	/*
		icons Attribute and IconSelector.icons
	*/
	'should split and trim the icons attribute': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icons=" save ,check,  close , star "');
		await openDialog(el);
		const expected = ['save', 'check', 'close', 'star'];
		if(JSON.stringify(getTileNames(el)) !== JSON.stringify(expected)){
			closeAndCleanup(el, container);
			return fail(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(getTileNames(el))}`);
		}
		closeAndCleanup(el, container);
		pass('icons attribute is split and trimmed');
	},

	'should ignore empty entries in the icons attribute': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icons="save,, ,check,"');
		await openDialog(el);
		if(JSON.stringify(getTileNames(el)) !== JSON.stringify(['save', 'check'])){
			closeAndCleanup(el, container);
			return fail(`Expected only save and check, got ${JSON.stringify(getTileNames(el))}`);
		}
		closeAndCleanup(el, container);
		pass('Empty entries in icons are ignored');
	},

	'should offer IconSelector.icons when no icons attribute is set': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		await openDialog(el);
		const names = getTileNames(el);
		const missing = IconSelector.icons.filter(name => !names.includes(name));
		if(missing.length){
			closeAndCleanup(el, container);
			return fail(`Expected every IconSelector.icons entry to be offered, missing: ${missing.join(', ')}`);
		}
		closeAndCleanup(el, container);
		pass('Default list offers IconSelector.icons');
	},

	'should hold the standard icon names in IconSelector.icons': async ({pass, fail}) => {
		if(!Array.isArray(IconSelector.icons) || !IconSelector.icons.includes('save') || IconSelector.icons.length < 100){
			return fail(`Expected IconSelector.icons to hold the standard icons, got ${IconSelector.icons?.length}`);
		}
		pass('IconSelector.icons holds the standard icon names');
	},

	/*
		Dialog
	*/
	'should not render the icon grid until the dialog opens': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		if(el.shadowRoot.querySelector('k-filter-list')){
			cleanup(container);
			return fail('The icon grid should not render before the dialog opens');
		}
		cleanup(container);
		pass('The icon grid is rendered only while the dialog is open');
	},

	'should open the dialog when the trigger is clicked': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		const dialog = await openDialog(el);
		if(!dialog.opened){
			cleanup(container);
			return fail('Dialog should be opened after clicking the trigger');
		}
		closeAndCleanup(el, container);
		pass('Trigger opens the dialog');
	},

	'should remove the icon grid when the dialog is closed': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		const dialog = await openDialog(el);
		getDialogButton(dialog, 'close').click();
		await el.updateComplete;
		await tick();
		if(el.shadowRoot.querySelector('k-filter-list')){
			cleanup(container);
			return fail('The icon grid should be removed when the dialog closes');
		}
		cleanup(container);
		pass('Closing the dialog removes the icon grid');
	},

	'should use Cancel and Choose Icon as the dialog buttons': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		const dialog = await openDialog(el);
		const cancel = getDialogButton(dialog, 'cancel')?.textContent.trim();
		const confirm = getDialogButton(dialog, 'confirm')?.textContent.trim();
		if(cancel !== 'Cancel'){
			closeAndCleanup(el, container);
			return fail(`Expected cancel text "Cancel", got "${cancel}"`);
		}
		if(confirm !== 'Choose Icon'){
			closeAndCleanup(el, container);
			return fail(`Expected confirm text "Choose Icon", got "${confirm}"`);
		}
		closeAndCleanup(el, container);
		pass('Dialog buttons are Cancel and Choose Icon');
	},

	'should use the dialog-title in the heading when it is changed': async ({pass, fail}) => {
		const { container, el } = await createIconSelector();
		el.dialogTitle = 'Choose a Logo';
		await el.updateComplete;
		const title = el.shadowRoot.querySelector('k-dialog [slot="title"]');
		if(title?.textContent.trim() !== 'Choose a Logo'){
			cleanup(container);
			return fail(`Expected the heading to follow the property, got "${title?.textContent.trim()}"`);
		}
		cleanup(container);
		pass('The heading follows the dialogTitle property');
	},

	'should filter icons as the search text is typed': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icons="save,check,close,star"');
		await openDialog(el);
		const search = getSearch(el);
		search.value = 'sta';
		search.dispatchEvent(new Event('input', { bubbles: true }));
		await el.updateComplete;
		const visible = getTiles(el).filter(tile => !tile.parentElement.hidden).map(tile => tile.getAttribute('title'));
		if(JSON.stringify(visible) !== JSON.stringify(['star'])){
			closeAndCleanup(el, container);
			return fail(`Expected only "star" to be visible, got ${JSON.stringify(visible)}`);
		}
		closeAndCleanup(el, container);
		pass('Search text filters the icons');
	},

	'should move the keyboard focus through the icons with the arrow keys': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icons="save,check,close"');
		await openDialog(el);
		pressKey(el, 'ArrowDown');
		pressKey(el, 'ArrowDown');
		const focused = [...el.shadowRoot.querySelectorAll('k-filter-item[kb-focus]')].map(item => item.querySelector('a').getAttribute('title'));
		if(JSON.stringify(focused) !== JSON.stringify(['check'])){
			closeAndCleanup(el, container);
			return fail(`Expected "check" to have keyboard focus, got ${JSON.stringify(focused)}`);
		}
		closeAndCleanup(el, container);
		pass('Arrow keys move the keyboard focus through the icons');
	},

	'should choose the focused icon when Enter is pressed in the search': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icons="save,check,close"');
		const dialog = await openDialog(el);
		pressKey(el, 'ArrowDown');
		pressKey(el, 'Enter');
		await el.updateComplete;
		await tick();
		if(el.value !== 'save'){
			cleanup(container);
			return fail(`Expected Enter to choose the focused "save", got "${el.value}"`);
		}
		if(dialog.opened){
			cleanup(container);
			return fail('Dialog should close after Enter chooses an icon');
		}
		cleanup(container);
		pass('Enter chooses the focused icon');
	},

	'should not choose anything when other keys are pressed in the search': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icons="save,check,close"');
		const dialog = await openDialog(el);
		pressKey(el, 'a');
		await el.updateComplete;
		if(el.value !== '' || !dialog.opened){
			closeAndCleanup(el, container);
			return fail('Typing a letter should not choose an icon or close the dialog');
		}
		closeAndCleanup(el, container);
		pass('Other keys leave the selection alone');
	},

	/*
		Selecting
	*/
	'should highlight the clicked icon as selected': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('icons="save,check,close"');
		await openDialog(el);
		getTile(el, 'check').click();
		await el.updateComplete;
		if(JSON.stringify(getHighlighted(el)) !== JSON.stringify(['check'])){
			closeAndCleanup(el, container);
			return fail(`Only the clicked icon should be highlighted, got ${JSON.stringify(getHighlighted(el))}`);
		}
		closeAndCleanup(el, container);
		pass('Clicked icon is highlighted');
	},

	'should highlight the current value when the dialog opens': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="close" icons="save,check,close"');
		await openDialog(el);
		if(JSON.stringify(getHighlighted(el)) !== JSON.stringify(['close'])){
			closeAndCleanup(el, container);
			return fail(`The current value should be highlighted, got ${JSON.stringify(getHighlighted(el))}`);
		}
		closeAndCleanup(el, container);
		pass('Current value is highlighted on open');
	},

	'should highlight a src icon by its src: value': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="src:/media/hexagon.svg"');
		await openDialog(el);
		const tile = getTiles(el).find(item => item.querySelector('k-icon')?.getAttribute('src') === '/media/hexagon.svg');
		if(!tile?.classList.contains('bg-primary')){
			closeAndCleanup(el, container);
			return fail('The src icon matching the value should be highlighted');
		}
		closeAndCleanup(el, container);
		pass('A src icon is highlighted by its src: value');
	},

	'should set the value and fire change when Choose Icon is confirmed': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="save" icons="save,check,close"');
		let detail = null;
		el.addEventListener('change', event => {
			detail = event.detail;
		});
		const dialog = await openDialog(el);
		getTile(el, 'check').click();
		getDialogButton(dialog, 'confirm').click();
		await el.updateComplete;
		if(el.value !== 'check'){
			cleanup(container);
			return fail(`Expected value "check" after confirm, got "${el.value}"`);
		}
		if(detail?.value !== 'check'){
			cleanup(container);
			return fail(`Expected change detail value "check", got ${JSON.stringify(detail)}`);
		}
		if(dialog.opened){
			cleanup(container);
			return fail('Dialog should close after Choose Icon');
		}
		cleanup(container);
		pass('Choose Icon sets the value and fires change');
	},

	'should not fire change when the chosen icon is already the value': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="save" icons="save,check,close"');
		let changed = false;
		el.addEventListener('change', () => {
			changed = true;
		});
		const dialog = await openDialog(el);
		getTile(el, 'save').click();
		getDialogButton(dialog, 'confirm').click();
		await el.updateComplete;
		if(changed){
			cleanup(container);
			return fail('change should not fire when the value does not change');
		}
		cleanup(container);
		pass('No change event when the value is the same');
	},

	'should set the src: value when a custom icon is confirmed': async ({pass, fail}) => {
		IconSelector.add('test-hexagon', '/media/hexagon.svg');
		const { container, el } = await createIconSelector('icons="save"');
		const dialog = await openDialog(el);
		const tile = getTile(el, 'test-hexagon');
		if(tile?.querySelector('k-icon')?.getAttribute('src') !== '/media/hexagon.svg'){
			closeAndCleanup(el, container);
			return fail('An added custom icon should use src on k-icon');
		}
		if(tile.querySelector('k-icon').getAttribute('name')){
			closeAndCleanup(el, container);
			return fail('An added custom icon should not name an icon on k-icon');
		}
		tile.click();
		getDialogButton(dialog, 'confirm').click();
		await el.updateComplete;
		if(el.value !== 'src:/media/hexagon.svg'){
			cleanup(container);
			return fail(`Expected the value "src:/media/hexagon.svg", got "${el.value}"`);
		}
		cleanup(container);
		pass('A confirmed custom icon sets the src: value');
	},

	'should keep the value when Cancel is clicked': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="save" icons="save,check,close"');
		let changed = false;
		el.addEventListener('change', () => {
			changed = true;
		});
		const dialog = await openDialog(el);
		getTile(el, 'check').click();
		getDialogButton(dialog, 'cancel').click();
		await el.updateComplete;
		if(el.value !== 'save'){
			cleanup(container);
			return fail(`Expected value to stay "save" after cancel, got "${el.value}"`);
		}
		if(changed){
			cleanup(container);
			return fail('change should not fire after cancel');
		}
		cleanup(container);
		pass('Cancel keeps the value and does not fire change');
	},

	/*
		allow-clear
	*/
	'should change the Cancel button to Clear with allow-clear': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('allow-clear value="save"');
		const dialog = await openDialog(el);
		const cancel = getDialogButton(dialog, 'cancel')?.textContent.trim();
		if(cancel !== 'Clear'){
			closeAndCleanup(el, container);
			return fail(`Expected the button to read "Clear", got "${cancel}"`);
		}
		closeAndCleanup(el, container);
		pass('allow-clear renames Cancel to Clear');
	},

	'should empty the value and fire change when Clear is clicked': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('allow-clear value="save" icons="save,check"');
		let detail = null;
		el.addEventListener('change', event => {
			detail = event.detail;
		});
		const dialog = await openDialog(el);
		getDialogButton(dialog, 'cancel').click();
		await el.updateComplete;
		if(el.value !== ''){
			cleanup(container);
			return fail(`Expected Clear to empty the value, got "${el.value}"`);
		}
		if(el.getAttribute('value') !== ''){
			cleanup(container);
			return fail(`Expected the value attribute to be empty, got "${el.getAttribute('value')}"`);
		}
		if(!('value' in (detail ?? {})) || detail.value !== ''){
			cleanup(container);
			return fail(`Expected change detail value "", got ${JSON.stringify(detail)}`);
		}
		if(dialog.opened){
			cleanup(container);
			return fail('Dialog should close after Clear');
		}
		cleanup(container);
		pass('Clear empties the value, fires change and closes');
	},

	'should not fire change when Clear is clicked with no value': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('allow-clear');
		let changed = false;
		el.addEventListener('change', () => {
			changed = true;
		});
		const dialog = await openDialog(el);
		getDialogButton(dialog, 'cancel').click();
		await el.updateComplete;
		if(changed){
			cleanup(container);
			return fail('Clear with no value should not fire change');
		}
		cleanup(container);
		pass('Clear with no value does not fire change');
	},

	/*
		auto-choose
	*/
	'should hide the confirm button when auto-choose is set': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('auto-choose icons="save,check"');
		const dialog = await openDialog(el);
		if(getDialogButton(dialog, 'confirm')){
			closeAndCleanup(el, container);
			return fail('Choose Icon button should be removed with auto-choose');
		}
		if(!getDialogButton(dialog, 'cancel')){
			closeAndCleanup(el, container);
			return fail('Cancel button should stay with auto-choose');
		}
		closeAndCleanup(el, container);
		pass('auto-choose removes the confirm button and keeps Cancel');
	},

	'should choose an icon on click and close with auto-choose': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('auto-choose value="save" icons="save,check,close"');
		let detail = null;
		el.addEventListener('change', event => {
			detail = event.detail;
		});
		const dialog = await openDialog(el);
		getTile(el, 'close').click();
		await el.updateComplete;
		if(el.value !== 'close'){
			cleanup(container);
			return fail(`Expected value "close" after clicking with auto-choose, got "${el.value}"`);
		}
		if(detail?.value !== 'close'){
			cleanup(container);
			return fail(`Expected change detail "close", got ${JSON.stringify(detail)}`);
		}
		if(dialog.opened){
			cleanup(container);
			return fail('Dialog should close after an icon is clicked with auto-choose');
		}
		cleanup(container);
		pass('Clicking an icon chooses it with auto-choose');
	},

	'should close without a change when auto-choose picks the current icon': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('auto-choose value="save" icons="save,check"');
		let changed = false;
		el.addEventListener('change', () => {
			changed = true;
		});
		const dialog = await openDialog(el);
		getTile(el, 'save').click();
		await el.updateComplete;
		if(changed || dialog.opened){
			cleanup(container);
			return fail('Choosing the current icon should close the dialog without firing change');
		}
		cleanup(container);
		pass('auto-choose on the current icon closes without change');
	},

	'should only highlight, not choose, on click without auto-choose': async ({pass, fail}) => {
		const { container, el } = await createIconSelector('value="save" icons="save,check,close"');
		const dialog = await openDialog(el);
		getTile(el, 'close').click();
		await el.updateComplete;
		if(el.value !== 'save'){
			closeAndCleanup(el, container);
			return fail(`Clicking should not choose without auto-choose, got "${el.value}"`);
		}
		if(!dialog.opened){
			closeAndCleanup(el, container);
			return fail('Dialog should stay open without auto-choose');
		}
		closeAndCleanup(el, container);
		pass('Without auto-choose a click only highlights');
	},

	/*
		Adding Icons
	*/
	'should offer an added standard icon name even when icons is set': async ({pass, fail}) => {
		IconSelector.add('test-added-plain');
		const { container, el } = await createIconSelector('icons="save"');
		await openDialog(el);
		const tile = getTile(el, 'test-added-plain');
		if(!tile){
			closeAndCleanup(el, container);
			return fail('An icon added with IconSelector.add should be offered even when icons is set');
		}
		if(tile.querySelector('k-icon')?.getAttribute('name') !== 'test-added-plain'){
			closeAndCleanup(el, container);
			return fail('An added icon without src should use name on k-icon');
		}
		closeAndCleanup(el, container);
		pass('IconSelector.add adds a standard icon');
	},

	'should replace a standard icon of the same name when added with a src': async ({pass, fail}) => {
		IconSelector.add('wrap_text', '/media/override.svg');
		const { container, el } = await createIconSelector('icons="wrap_text,save"');
		await openDialog(el);
		const tiles = getTiles(el).filter(tile => tile.getAttribute('title') === 'wrap_text');
		if(tiles.length !== 1){
			closeAndCleanup(el, container);
			return fail(`Expected one wrap_text tile, got ${tiles.length}`);
		}
		if(tiles[0].querySelector('k-icon')?.getAttribute('src') !== '/media/override.svg'){
			closeAndCleanup(el, container);
			return fail('The added src should replace the standard icon of the same name');
		}
		closeAndCleanup(el, container);
		pass('An added src replaces a standard icon of the same name');
	},

	/*
		Form Integration
	*/
	'should submit the icon name with its form': async ({pass, fail}) => {
		const { form, el } = await createForm('<k-icon-selector name="menuIcon" value="save"></k-icon-selector>');
		const submitted = new FormData(form).get('menuIcon');
		cleanup(form);
		if(submitted !== 'save'){
			return fail(`Expected form value "save", got "${submitted}"`);
		}
		pass('Icon name submits with the form');
	},

	'should submit the src: value for a custom icon': async ({pass, fail}) => {
		const { form, el } = await createForm('<k-icon-selector name="logo" value="src:/media/hexagon.svg"></k-icon-selector>');
		const submitted = new FormData(form).get('logo');
		cleanup(form);
		if(submitted !== 'src:/media/hexagon.svg'){
			return fail(`Expected form value "src:/media/hexagon.svg", got "${submitted}"`);
		}
		pass('A custom icon submits its src: value');
	},

	'should submit the chosen custom icon with its form': async ({pass, fail}) => {
		IconSelector.add('test-form-hexagon', '/media/hexagon.svg');
		const { form, el } = await createForm('<k-icon-selector name="logo" icons="save"></k-icon-selector>');
		const dialog = await openDialog(el);
		getTile(el, 'test-form-hexagon').click();
		getDialogButton(dialog, 'confirm').click();
		await el.updateComplete;
		const submitted = new FormData(form).get('logo');
		cleanup(form);
		if(submitted !== 'src:/media/hexagon.svg'){
			return fail(`Expected the chosen custom icon to submit "src:/media/hexagon.svg", got "${submitted}"`);
		}
		pass('A chosen custom icon submits its src: value with the form');
	},

	'should restore the initial value when the form is reset': async ({pass, fail}) => {
		const { form, el } = await createForm('<k-icon-selector name="menuIcon" value="save" icons="save,check"></k-icon-selector>');
		el.value = 'check';
		await el.updateComplete;
		form.reset();
		await el.updateComplete;
		cleanup(form);
		if(el.value !== 'save'){
			return fail(`Expected reset to restore "save", got "${el.value}"`);
		}
		pass('Form reset restores the initial value');
	},

	'should restore a saved value through formStateRestoreCallback': async ({pass, fail}) => {
		const { form, el } = await createForm('<k-icon-selector name="menuIcon" value="save"></k-icon-selector>');
		el.formStateRestoreCallback('check');
		await el.updateComplete;
		cleanup(form);
		if(el.value !== 'check'){
			return fail(`Expected the restored value "check", got "${el.value}"`);
		}
		pass('formStateRestoreCallback sets the value');
	},

	'should update the form value when the value changes': async ({pass, fail}) => {
		const { form, el } = await createForm('<k-icon-selector name="menuIcon" value="save" icons="save,check"></k-icon-selector>');
		el.value = 'check';
		await el.updateComplete;
		const submitted = new FormData(form).get('menuIcon');
		cleanup(form);
		if(submitted !== 'check'){
			return fail(`Expected form value "check" after change, got "${submitted}"`);
		}
		pass('Form value follows the value property');
	}
};
