import Dialog from '../../src/components/Dialog.js';
import { html } from '../../src/lit-all.min.js';

const createDialog = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-dialog
			${options.opened ? 'opened' : ''}
			${options.closeBtn === false ? 'close-btn="false"' : ''}
			${options.overlayClose === false ? 'overlay-close="false"' : ''}
			${options.disableKeyboardClose ? 'disable-keyboard-close' : ''}
			${options.confirmText ? `confirm-text="${options.confirmText}"` : ''}
			${options.cancelText ? `cancel-text="${options.cancelText}"` : ''}
		>
			<span slot="title">${options.title || 'Test Dialog'}</span>
			<div>${options.content || 'Dialog content'}</div>
		</k-dialog>
	`;
	document.body.appendChild(container);

	const dialog = container.querySelector('k-dialog');
	await dialog.updateComplete;

	return { container, dialog };
};

const cleanup = container => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
	document.body.classList.remove('no-scroll');
};

const cleanupAllDialogs = () => {
	document.querySelectorAll('k-dialog').forEach(d => {
		if(d.parentNode){
			d.parentNode.removeChild(d);
		}
	});
	document.body.classList.remove('no-scroll');
};

export default {
	/*
		Element Creation Tests
	*/
	'should create dialog element': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		if(!dialog){
			cleanup(container);
			fail('Dialog element should be created');
			return;
		}

		if(!(dialog instanceof Dialog)){
			cleanup(container);
			fail('Element should be instance of Dialog');
			return;
		}

		cleanup(container);
		pass('Dialog element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		if(!dialog.shadowRoot){
			cleanup(container);
			fail('Dialog should have shadow root');
			return;
		}

		cleanup(container);
		pass('Dialog has shadow root');
	},

	/*
		Default Property Tests
	*/
	'should be closed by default': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		if(dialog.opened !== false){
			cleanup(container);
			fail(`Expected opened false, got ${dialog.opened}`);
			return;
		}

		cleanup(container);
		pass('Dialog is closed by default');
	},

	'should have closeBtn true by default': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		if(dialog.closeBtn !== true){
			cleanup(container);
			fail(`Expected closeBtn true, got ${dialog.closeBtn}`);
			return;
		}

		cleanup(container);
		pass('closeBtn is true by default');
	},

	'should have overlayClose true by default': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		if(dialog.overlayClose !== true){
			cleanup(container);
			fail(`Expected overlayClose true, got ${dialog.overlayClose}`);
			return;
		}

		cleanup(container);
		pass('overlayClose is true by default');
	},

	'should have disableKeyboardClose false by default': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		if(dialog.disableKeyboardClose !== false){
			cleanup(container);
			fail(`Expected disableKeyboardClose false, got ${dialog.disableKeyboardClose}`);
			return;
		}

		cleanup(container);
		pass('disableKeyboardClose is false by default');
	},

	/*
		Open/Close Tests
	*/
	'should open dialog with open method': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		dialog.open();
		await dialog.updateComplete;

		if(dialog.opened !== true){
			cleanup(container);
			fail(`Expected opened true, got ${dialog.opened}`);
			return;
		}

		cleanup(container);
		pass('open() opens dialog');
	},

	'should close dialog with close method': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true });

		dialog.close();
		await dialog.updateComplete;

		if(dialog.opened !== false){
			cleanup(container);
			fail(`Expected opened false, got ${dialog.opened}`);
			return;
		}

		cleanup(container);
		pass('close() closes dialog');
	},

	'should toggle dialog state': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		dialog.toggle();
		await dialog.updateComplete;

		if(dialog.opened !== true){
			cleanup(container);
			fail(`Expected opened true after first toggle, got ${dialog.opened}`);
			return;
		}

		dialog.toggle();
		await dialog.updateComplete;

		if(dialog.opened !== false){
			cleanup(container);
			fail(`Expected opened false after second toggle, got ${dialog.opened}`);
			return;
		}

		cleanup(container);
		pass('toggle() switches dialog state');
	},

	/*
		Event Tests
	*/
	'should dispatch opened event': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		let eventFired = false;
		dialog.addEventListener('opened', () => {
			eventFired = true;
		});

		dialog.open();
		await dialog.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('opened event should be dispatched');
			return;
		}

		cleanup(container);
		pass('opened event dispatched');
	},

	'should dispatch close event': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true });

		let eventFired = false;
		dialog.addEventListener('close', () => {
			eventFired = true;
		});

		dialog.close();
		await dialog.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('close event should be dispatched');
			return;
		}

		cleanup(container);
		pass('close event dispatched');
	},

	/*
		Close Button Tests
	*/
	'should render close button when enabled': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true });

		const closeBtn = dialog.shadowRoot.querySelector('#close');

		if(!closeBtn){
			cleanup(container);
			fail('Should render close button');
			return;
		}

		cleanup(container);
		pass('Close button rendered');
	},

	'should close on close button click': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true });

		const closeBtn = dialog.shadowRoot.querySelector('#close');
		closeBtn.click();
		await dialog.updateComplete;

		if(dialog.opened !== false){
			cleanup(container);
			fail('Dialog should close on close button click');
			return;
		}

		cleanup(container);
		pass('Close button closes dialog');
	},

	/*
		Overlay Close Tests
	*/
	'should close on overlay click when enabled': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true });

		const overlay = dialog.shadowRoot.querySelector('#overlay');
		overlay.click();
		await dialog.updateComplete;

		if(dialog.opened !== false){
			cleanup(container);
			fail('Dialog should close on overlay click');
			return;
		}

		cleanup(container);
		pass('Overlay click closes dialog');
	},

	'should not close on overlay click when disabled': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true });

		// Set overlayClose via property, not attribute (boolExists converter)
		dialog.overlayClose = false;
		await dialog.updateComplete;

		const overlay = dialog.shadowRoot.querySelector('#overlay');
		overlay.click();
		await dialog.updateComplete;

		if(dialog.opened !== true){
			cleanup(container);
			fail('Dialog should not close on overlay click when disabled');
			return;
		}

		cleanup(container);
		pass('Overlay click does not close dialog when disabled');
	},

	/*
		Keyboard Close Tests
	*/
	'should close on Escape key': async ({pass, fail}) => {
		const { container, dialog } = await createDialog();

		// Must open with open() method to add keydown listener
		dialog.open();
		await dialog.updateComplete;

		// Dialog listens on window, not document, and uses keyCode
		window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 }));
		await dialog.updateComplete;

		if(dialog.opened !== false){
			cleanup(container);
			fail('Dialog should close on Escape key');
			return;
		}

		cleanup(container);
		pass('Escape key closes dialog');
	},

	'should not close on Escape when keyboard close disabled': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ disableKeyboardClose: true });

		dialog.open();
		await dialog.updateComplete;

		window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 }));
		await dialog.updateComplete;

		if(dialog.opened !== true){
			cleanup(container);
			fail('Dialog should not close on Escape when disabled');
			return;
		}

		cleanup(container);
		pass('Escape does not close when keyboard close disabled');
	},

	/*
		Confirm/Cancel Button Tests
	*/
	'should call confirmAction when confirm button clicked': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true, confirmText: 'OK' });

		let callbackCalled = false;
		dialog.confirmAction = () => {
			callbackCalled = true;
		};
		await dialog.updateComplete;

		const confirmBtn = dialog.shadowRoot.querySelector('#confirm');
		confirmBtn.click();
		await dialog.updateComplete;

		if(!callbackCalled){
			cleanup(container);
			fail('confirmAction should be called');
			return;
		}

		cleanup(container);
		pass('confirmAction called on confirm button click');
	},

	'should call cancelAction when cancel button clicked': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true, cancelText: 'Cancel' });

		let callbackCalled = false;
		dialog.cancelAction = () => {
			callbackCalled = true;
		};
		await dialog.updateComplete;

		const cancelBtn = dialog.shadowRoot.querySelector('#cancel');
		cancelBtn.click();
		await dialog.updateComplete;

		if(!callbackCalled){
			cleanup(container);
			fail('cancelAction should be called');
			return;
		}

		cleanup(container);
		pass('cancelAction called on cancel button click');
	},

	'should close on confirm button click': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true, confirmText: 'OK' });
		await dialog.updateComplete;

		const confirmBtn = dialog.shadowRoot.querySelector('#confirm');
		confirmBtn.click();
		await dialog.updateComplete;

		if(dialog.opened !== false){
			cleanup(container);
			fail('Dialog should close on confirm');
			return;
		}

		cleanup(container);
		pass('Dialog closes on confirm');
	},

	'should close on cancel button click': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true, cancelText: 'Cancel' });
		await dialog.updateComplete;

		const cancelBtn = dialog.shadowRoot.querySelector('#cancel');
		cancelBtn.click();
		await dialog.updateComplete;

		if(dialog.opened !== false){
			cleanup(container);
			fail('Dialog should close on cancel');
			return;
		}

		cleanup(container);
		pass('Dialog closes on cancel');
	},

	/*
		Static Method Tests
	*/
	'Dialog.create should create and return dialog': async ({pass, fail}) => {
		const dialog = Dialog.create('<p>Created content</p>', { title: 'Created Dialog' });

		if(!dialog){
			cleanupAllDialogs();
			fail('Dialog.create should return dialog');
			return;
		}

		if(!(dialog instanceof Dialog)){
			cleanupAllDialogs();
			fail('Returned value should be Dialog instance');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.create works correctly');
	},

	'Dialog.create should open dialog automatically': async ({pass, fail}) => {
		const dialog = Dialog.create('<p>Content</p>', { title: 'Auto Open' });

		await dialog.updateComplete;

		if(dialog.opened !== true){
			cleanupAllDialogs();
			fail('Created dialog should be opened');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.create opens dialog automatically');
	},

	'Dialog.create should set custom confirm/cancel text': async ({pass, fail}) => {
		const dialog = Dialog.create('<p>Content</p>', {
			title: 'Custom Buttons',
			confirmText: 'Yes',
			cancelText: 'No'
		});

		await dialog.updateComplete;

		if(dialog.confirmText !== 'Yes'){
			cleanupAllDialogs();
			fail(`Expected confirmText "Yes", got "${dialog.confirmText}"`);
			return;
		}

		if(dialog.cancelText !== 'No'){
			cleanupAllDialogs();
			fail(`Expected cancelText "No", got "${dialog.cancelText}"`);
			return;
		}

		cleanupAllDialogs();
		pass('Custom button text set correctly');
	},

	'Dialog.confirm should create confirmation dialog': async ({pass, fail}) => {
		let response = null;
		const dialog = Dialog.confirm('Are you sure?', r => { response = r; });

		await dialog.updateComplete;

		const confirmBtn = dialog.shadowRoot.querySelector('#confirm');
		const cancelBtn = dialog.shadowRoot.querySelector('#cancel');

		if(!confirmBtn){
			cleanupAllDialogs();
			fail('Confirm dialog should have confirm button');
			return;
		}

		if(!cancelBtn){
			cleanupAllDialogs();
			fail('Confirm dialog should have cancel button');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.confirm creates confirmation dialog');
	},

	'Dialog.alert should create alert dialog': async ({pass, fail}) => {
		const dialog = Dialog.alert('Alert message');

		await dialog.updateComplete;

		if(!dialog){
			cleanupAllDialogs();
			fail('Dialog.alert should create dialog');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.alert creates alert dialog');
	},

	'Dialog.error should create error dialog': async ({pass, fail}) => {
		const dialog = Dialog.error('Error message');

		await dialog.updateComplete;

		const titleEl = dialog.querySelector('[slot="title"]');

		if(!titleEl){
			cleanupAllDialogs();
			fail('Error dialog should have title');
			return;
		}

		// Title uses tc-danger CSS class, not inline style
		if(!titleEl.classList.contains('tc-danger')){
			cleanupAllDialogs();
			fail('Error dialog title should have tc-danger class');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.error creates error dialog with danger styling');
	},

	'Dialog.success should create success dialog': async ({pass, fail}) => {
		const dialog = Dialog.success('Success message');

		await dialog.updateComplete;

		const titleEl = dialog.querySelector('[slot="title"]');

		if(!titleEl){
			cleanupAllDialogs();
			fail('Success dialog should have title');
			return;
		}

		// Title uses tc-success CSS class, not inline style
		if(!titleEl.classList.contains('tc-success')){
			cleanupAllDialogs();
			fail('Success dialog title should have tc-success class');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.success creates success dialog with success styling');
	},

	/*
		Callback Tests for Static Methods
	*/
	'Dialog.create should call confirmAction callback': async ({pass, fail}) => {
		let callbackCalled = false;

		const dialog = Dialog.create('<p>Content</p>', {
			title: 'Test',
			confirmText: 'Confirm',
			confirmAction: () => {
				callbackCalled = true;
			}
		});

		await dialog.updateComplete;
		const confirmBtn = dialog.shadowRoot.querySelector('#confirm');
		confirmBtn.click();

		if(!callbackCalled){
			cleanupAllDialogs();
			fail('confirmAction callback should be called');
			return;
		}

		cleanupAllDialogs();
		pass('confirmAction callback called');
	},

	'Dialog.create should call cancelAction callback': async ({pass, fail}) => {
		let callbackCalled = false;

		const dialog = Dialog.create('<p>Content</p>', {
			title: 'Test',
			cancelText: 'Cancel',
			cancelAction: () => {
				callbackCalled = true;
			}
		});

		await dialog.updateComplete;
		const cancelBtn = dialog.shadowRoot.querySelector('#cancel');
		cancelBtn.click();

		if(!callbackCalled){
			cleanupAllDialogs();
			fail('cancelAction callback should be called');
			return;
		}

		cleanupAllDialogs();
		pass('cancelAction callback called');
	},

	/*
		Content Slot Tests
	*/
	'should render title slot': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ title: 'My Title', opened: true });

		const titleSlot = dialog.shadowRoot.querySelector('slot[name="title"]');

		if(!titleSlot){
			cleanup(container);
			fail('Should have title slot');
			return;
		}

		cleanup(container);
		pass('Title slot rendered');
	},

	'should render default slot for content': async ({pass, fail}) => {
		const { container, dialog } = await createDialog({ opened: true });

		const defaultSlot = dialog.shadowRoot.querySelector('slot:not([name])');

		if(!defaultSlot){
			cleanup(container);
			fail('Should have default slot');
			return;
		}

		cleanup(container);
		pass('Default content slot rendered');
	},

	/*
		Lit TemplateResult Content Tests
	*/
	'Dialog.create should accept Lit TemplateResult as content': async ({pass, fail}) => {
		const dialog = Dialog.create(html`<p class="p">Lit template content</p>`);
		await dialog.updateComplete;

		const container = dialog.querySelector('div[style="display: contents;"]');
		if(!container){
			cleanupAllDialogs();
			fail('Should render TemplateResult into a display:contents wrapper');
			return;
		}

		const p = container.querySelector('p');
		if(!p || p.textContent !== 'Lit template content'){
			cleanupAllDialogs();
			fail(`Expected paragraph with "Lit template content", got "${p?.textContent}"`);
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.create accepts Lit TemplateResult');
	},

	'Dialog.confirm should accept Lit TemplateResult as content': async ({pass, fail}) => {
		let response = null;
		const dialog = Dialog.confirm(
			html`<p class="p">Confirm this?</p>`,
			r => { response = r; }
		);
		await dialog.updateComplete;

		const container = dialog.querySelector('div[style="display: contents;"]');
		if(!container){
			cleanupAllDialogs();
			fail('Should render TemplateResult in confirm dialog');
			return;
		}

		const p = container.querySelector('p');
		if(!p || p.textContent !== 'Confirm this?'){
			cleanupAllDialogs();
			fail(`Expected paragraph with "Confirm this?", got "${p?.textContent}"`);
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.confirm accepts Lit TemplateResult');
	},

	'Dialog.alert should accept Lit TemplateResult as content': async ({pass, fail}) => {
		const dialog = Dialog.alert(html`<p class="p">Alert content</p>`);
		await dialog.updateComplete;

		const container = dialog.querySelector('div[style="display: contents;"]');
		if(!container){
			cleanupAllDialogs();
			fail('Should render TemplateResult in alert dialog');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.alert accepts Lit TemplateResult');
	},

	'Dialog.error should accept Lit TemplateResult as content': async ({pass, fail}) => {
		const dialog = Dialog.error(html`<p class="p">Error content</p>`);
		await dialog.updateComplete;

		const container = dialog.querySelector('div[style="display: contents;"]');
		if(!container){
			cleanupAllDialogs();
			fail('Should render TemplateResult in error dialog');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.error accepts Lit TemplateResult');
	},

	'Dialog.success should accept Lit TemplateResult as content': async ({pass, fail}) => {
		const dialog = Dialog.success(html`<p class="p">Success content</p>`);
		await dialog.updateComplete;

		const container = dialog.querySelector('div[style="display: contents;"]');
		if(!container){
			cleanupAllDialogs();
			fail('Should render TemplateResult in success dialog');
			return;
		}

		cleanupAllDialogs();
		pass('Dialog.success accepts Lit TemplateResult');
	},

	'Dialog.alert should mount into document.body by default': async ({pass, fail}) => {
		const prevKempo = window.kempo;
		delete window.kempo;

		const dialog = Dialog.alert('Test message');
		await dialog.updateComplete;

		const mountedInBody = dialog.parentElement === document.body;
		cleanupAllDialogs();
		window.kempo = prevKempo;

		if(!mountedInBody){
			fail('Dialog should mount into document.body when window.kempo.overlayRoot is unset');
			return;
		}
		pass('Dialog mounts into document.body by default');
	},

	'Dialog.alert should mount into window.kempo.overlayRoot when configured': async ({pass, fail}) => {
		const root = document.createElement('div');
		root.id = 'test-dialog-root';
		document.body.appendChild(root);
		const prevKempo = window.kempo;
		window.kempo = { ...window.kempo, overlayRoot: '#test-dialog-root' };

		const dialog = Dialog.alert('Test message');
		await dialog.updateComplete;

		const mountedInRoot = dialog.parentElement === root;
		cleanupAllDialogs();
		window.kempo = prevKempo;
		root.remove();

		if(!mountedInRoot){
			fail('Dialog should mount into the element matching window.kempo.overlayRoot');
			return;
		}
		pass('Dialog mounts into the configured overlayRoot');
	}
};
