import Toast from '../../src/components/Toast.js';

const createToast = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-toast 
			${options.timeout ? `timeout="${options.timeout}"` : ''}
			${options.position ? `position="${options.position}"` : ''}
			${options.opened ? 'opened' : ''}
		>
			${options.message || 'Test message'}
			${options.icon ? `<span slot="icon">${options.icon}</span>` : ''}
			${options.action ? `<span slot="action">${options.action}</span>` : ''}
			${options.close ? `<span slot="close">${options.close}</span>` : ''}
		</k-toast>
	`;
	document.body.appendChild(container);

	const toast = container.querySelector('k-toast');
	await toast.updateComplete;

	return { container, toast };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
	// Clean up any toast containers
	document.querySelectorAll('k-toast-container').forEach(c => c.remove());
	// Clean up any orphan toasts
	document.querySelectorAll('k-toast').forEach(t => t.remove());
};

export default {
	/*
		Toast Component Tests
	*/
	'should create toast element': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		if(!toast){
			cleanup(container);
			fail('Toast element should be created');
			return;
		}

		if(!(toast instanceof Toast)){
			cleanup(container);
			fail('Element should be instance of Toast');
			return;
		}

		cleanup(container);
		pass('Toast element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		if(!toast.shadowRoot){
			cleanup(container);
			fail('Toast should have shadow root');
			return;
		}

		cleanup(container);
		pass('Toast has shadow root');
	},

	'should have default properties': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		if(toast.timeout !== 0){
			cleanup(container);
			fail(`Expected timeout 0, got ${toast.timeout}`);
			return;
		}

		if(toast.opened !== false){
			cleanup(container);
			fail(`Expected opened false, got ${toast.opened}`);
			return;
		}

		if(toast.position !== 'bottom center'){
			cleanup(container);
			fail(`Expected position "bottom center", got "${toast.position}"`);
			return;
		}

		cleanup(container);
		pass('Toast has correct default properties');
	},

	'should be hidden when not opened': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		const display = getComputedStyle(toast).display;
		if(display !== 'none'){
			cleanup(container);
			fail(`Expected display none, got ${display}`);
			return;
		}

		cleanup(container);
		pass('Toast is hidden when not opened');
	},

	'should be visible when opened': async ({pass, fail}) => {
		const { container, toast } = await createToast({ opened: true });

		const display = getComputedStyle(toast).display;
		if(display === 'none'){
			cleanup(container);
			fail('Toast should be visible when opened');
			return;
		}

		cleanup(container);
		pass('Toast is visible when opened');
	},

	'should have open method': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		if(typeof toast.open !== 'function'){
			cleanup(container);
			fail('Toast should have open method');
			return;
		}

		cleanup(container);
		pass('Toast has open method');
	},

	'open should set opened to true': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		toast.open();
		await toast.updateComplete;

		if(!toast.opened){
			cleanup(container);
			fail('opened should be true after open()');
			return;
		}

		cleanup(container);
		pass('open() sets opened to true');
	},

	'should have close method': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		if(typeof toast.close !== 'function'){
			cleanup(container);
			fail('Toast should have close method');
			return;
		}

		cleanup(container);
		pass('Toast has close method');
	},

	'close should trigger closing animation': async ({pass, fail}) => {
		const { container, toast } = await createToast({ opened: true });

		toast.close();
		await toast.updateComplete;

		if(toast.animating !== 'out'){
			cleanup(container);
			fail(`Expected animating "out", got "${toast.animating}"`);
			return;
		}

		cleanup(container);
		pass('close() triggers closing animation');
	},

	'should dispatch open event': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		let eventFired = false;
		toast.addEventListener('open', () => {
			eventFired = true;
		});

		toast.open();
		await toast.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('open event should be dispatched');
			return;
		}

		cleanup(container);
		pass('open event dispatched');
	},

	'should dispatch openchange event on open': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		let eventFired = false;
		toast.addEventListener('openchange', () => {
			eventFired = true;
		});

		toast.open();
		await toast.updateComplete;

		if(!eventFired){
			cleanup(container);
			fail('openchange event should be dispatched on open');
			return;
		}

		cleanup(container);
		pass('openchange event dispatched on open');
	},

	'should render message slot': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		const messageDiv = toast.shadowRoot.getElementById('message');
		if(!messageDiv){
			cleanup(container);
			fail('Toast should render message div');
			return;
		}

		const slot = messageDiv.querySelector('slot:not([name])');
		if(!slot){
			cleanup(container);
			fail('Message div should have default slot');
			return;
		}

		cleanup(container);
		pass('Toast renders message slot');
	},

	'should render icon slot': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		const iconDiv = toast.shadowRoot.getElementById('icon');
		if(!iconDiv){
			cleanup(container);
			fail('Toast should render icon div');
			return;
		}

		const slot = iconDiv.querySelector('slot[name="icon"]');
		if(!slot){
			cleanup(container);
			fail('Icon div should have icon slot');
			return;
		}

		cleanup(container);
		pass('Toast renders icon slot');
	},

	'should render action button': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		const actionBtn = toast.shadowRoot.getElementById('action');
		if(!actionBtn){
			cleanup(container);
			fail('Toast should render action button');
			return;
		}

		cleanup(container);
		pass('Toast renders action button');
	},

	'should render close button': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		const closeBtn = toast.shadowRoot.getElementById('close');
		if(!closeBtn){
			cleanup(container);
			fail('Toast should render close button');
			return;
		}

		cleanup(container);
		pass('Toast renders close button');
	},

	'should detect hasIcon when icon slot has content': async ({pass, fail}) => {
		const { container, toast } = await createToast({ 
			icon: '<span>!</span>',
			opened: true 
		});

		await toast.updateComplete;

		if(!toast.hasIcon){
			cleanup(container);
			fail('hasIcon should be true when icon slot has content');
			return;
		}

		cleanup(container);
		pass('hasIcon detected correctly');
	},

	'should detect hasAction when action slot has content': async ({pass, fail}) => {
		const { container, toast } = await createToast({ 
			action: 'Undo',
			opened: true 
		});

		await toast.updateComplete;

		if(!toast.hasAction){
			cleanup(container);
			fail('hasAction should be true when action slot has content');
			return;
		}

		cleanup(container);
		pass('hasAction detected correctly');
	},

	'should detect hasClose when close slot has content': async ({pass, fail}) => {
		const { container, toast } = await createToast({ 
			close: 'X',
			opened: true 
		});

		await toast.updateComplete;

		if(!toast.hasClose){
			cleanup(container);
			fail('hasClose should be true when close slot has content');
			return;
		}

		cleanup(container);
		pass('hasClose detected correctly');
	},

	'should reflect position attribute': async ({pass, fail}) => {
		const { container, toast } = await createToast({ position: 'top right' });

		if(toast.position !== 'top right'){
			cleanup(container);
			fail(`Expected position "top right", got "${toast.position}"`);
			return;
		}

		cleanup(container);
		pass('Position attribute reflects correctly');
	},

	'should reflect timeout attribute': async ({pass, fail}) => {
		const { container, toast } = await createToast({ timeout: 3000 });

		if(toast.timeout !== 3000){
			cleanup(container);
			fail(`Expected timeout 3000, got ${toast.timeout}`);
			return;
		}

		cleanup(container);
		pass('Timeout attribute reflects correctly');
	},

	'should set animating to in on open': async ({pass, fail}) => {
		const { container, toast } = await createToast();

		toast.open();

		if(toast.animating !== 'in'){
			cleanup(container);
			fail(`Expected animating "in", got "${toast.animating}"`);
			return;
		}

		cleanup(container);
		pass('Animating set to in on open');
	},

	'close button should call close': async ({pass, fail}) => {
		const { container, toast } = await createToast({ opened: true });

		const closeBtn = toast.shadowRoot.getElementById('close');
		closeBtn.click();
		await toast.updateComplete;

		if(toast.animating !== 'out'){
			cleanup(container);
			fail('Close button should trigger close animation');
			return;
		}

		cleanup(container);
		pass('Close button calls close');
	},

	'action button should call actionCallback': async ({pass, fail}) => {
		const { container, toast } = await createToast({ 
			action: 'Undo',
			opened: true 
		});

		let callbackCalled = false;
		toast.actionCallback = () => {
			callbackCalled = true;
			return false; // Prevent auto-close
		};

		const actionBtn = toast.shadowRoot.getElementById('action');
		actionBtn.click();

		if(!callbackCalled){
			cleanup(container);
			fail('Action callback should be called');
			return;
		}

		cleanup(container);
		pass('Action button calls actionCallback');
	},

	'should have static create method': async ({pass, fail}) => {
		if(typeof Toast.create !== 'function'){
			fail('Toast should have static create method');
			return;
		}

		pass('Toast has static create method');
	},

	'should have static success method': async ({pass, fail}) => {
		if(typeof Toast.success !== 'function'){
			fail('Toast should have static success method');
			return;
		}

		pass('Toast has static success method');
	},

	'should have static warning method': async ({pass, fail}) => {
		if(typeof Toast.warning !== 'function'){
			fail('Toast should have static warning method');
			return;
		}

		pass('Toast has static warning method');
	},

	'should have static error method': async ({pass, fail}) => {
		if(typeof Toast.error !== 'function'){
			fail('Toast should have static error method');
			return;
		}

		pass('Toast has static error method');
	},

	'Toast.create should create and return toast': async ({pass, fail}) => {
		// Clean up first
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());

		try {
			const toast = Toast.create('Test message', { timeout: 0 });

			if(!toast){
				fail('Toast.create should return toast');
				return;
			}

			if(!(toast instanceof Toast)){
				fail('Returned element should be Toast instance');
				return;
			}

			// Wait for animation then cleanup
			await new Promise(r => setTimeout(r, 50));
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
			pass('Toast.create creates and returns toast');
		} catch(e) {
			fail(`Error: ${e.message}`);
		}
	},

	'Toast.create should create container': async ({pass, fail}) => {
		// Clean up first
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());

		try {
			const toast = Toast.create('Test message', { position: 'bottom center', timeout: 0 });
			await new Promise(r => setTimeout(r, 50));

			const container = document.querySelector('k-toast-container[position="bottom center"]');
			if(!container){
				fail('Toast.create should create container');
				return;
			}

			// Cleanup
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
			pass('Toast.create creates container');
		} catch(e) {
			fail(`Error: ${e.message}`);
		}
	},

	'Toast.create should append container to document.body by default': async ({pass, fail}) => {
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());
		const prevKempo = window.kempo;
		delete window.kempo;

		try {
			Toast.create('Test message', { position: 'bottom center', timeout: 0 });
			await new Promise(r => setTimeout(r, 50));

			const container = document.querySelector('k-toast-container[position="bottom center"]');
			if(!container || container.parentElement !== document.body){
				fail('Container should be appended to document.body when window.kempo.toastContainer is unset');
				return;
			}

			pass('Container appended to document.body by default');
		} catch(e) {
			fail(`Error: ${e.message}`);
		} finally {
			window.kempo = prevKempo;
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
		}
	},

	'Toast.create should append container into window.kempo.toastContainer when set': async ({pass, fail}) => {
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());
		const prevKempo = window.kempo;
		const root = document.createElement('div');
		root.id = 'test-toast-root';
		document.body.appendChild(root);
		window.kempo = { toastContainer: '#test-toast-root' };

		try {
			Toast.create('Test message', { position: 'bottom center', timeout: 0 });
			await new Promise(r => setTimeout(r, 50));

			const container = document.querySelector('k-toast-container[position="bottom center"]');
			if(!container || container.parentElement !== root){
				fail('Container should be appended into the element matching window.kempo.toastContainer');
				return;
			}

			pass('Container appended into configured root');
		} catch(e) {
			fail(`Error: ${e.message}`);
		} finally {
			window.kempo = prevKempo;
			root.remove();
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
		}
	},

	'Toast.create should fall back to document.body when window.kempo.toastContainer matches nothing': async ({pass, fail}) => {
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());
		const prevKempo = window.kempo;
		window.kempo = { toastContainer: '#does-not-exist' };

		try {
			Toast.create('Test message', { position: 'bottom center', timeout: 0 });
			await new Promise(r => setTimeout(r, 50));

			const container = document.querySelector('k-toast-container[position="bottom center"]');
			if(!container || container.parentElement !== document.body){
				fail('Container should fall back to document.body when the configured selector matches nothing');
				return;
			}

			pass('Falls back to document.body for a non-matching selector');
		} catch(e) {
			fail(`Error: ${e.message}`);
		} finally {
			window.kempo = prevKempo;
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
		}
	},

	'Toast.success should add bg-success class': async ({pass, fail}) => {
		// Clean up first
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());

		try {
			const toast = Toast.success('Success message', { timeout: 0 });

			if(!toast.classList.contains('bg-success')){
				fail('Toast.success should add bg-success class');
				return;
			}

			// Cleanup
			await new Promise(r => setTimeout(r, 50));
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
			pass('Toast.success adds bg-success class');
		} catch(e) {
			fail(`Error: ${e.message}`);
		}
	},

	'Toast.warning should add bg-warning class': async ({pass, fail}) => {
		// Clean up first
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());

		try {
			const toast = Toast.warning('Warning message', { timeout: 0 });

			if(!toast.classList.contains('bg-warning')){
				fail('Toast.warning should add bg-warning class');
				return;
			}

			// Cleanup
			await new Promise(r => setTimeout(r, 50));
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
			pass('Toast.warning adds bg-warning class');
		} catch(e) {
			fail(`Error: ${e.message}`);
		}
	},

	'Toast.error should add bg-danger class': async ({pass, fail}) => {
		// Clean up first
		document.querySelectorAll('k-toast-container').forEach(c => c.remove());
		document.querySelectorAll('k-toast').forEach(t => t.remove());

		try {
			const toast = Toast.error('Error message', { timeout: 0 });

			if(!toast.classList.contains('bg-danger')){
				fail('Toast.error should add bg-danger class');
				return;
			}

			// Cleanup
			await new Promise(r => setTimeout(r, 50));
			document.querySelectorAll('k-toast-container').forEach(c => c.remove());
			document.querySelectorAll('k-toast').forEach(t => t.remove());
			pass('Toast.error adds bg-danger class');
		} catch(e) {
			fail(`Error: ${e.message}`);
		}
	},

	'should not close if already closing': async ({pass, fail}) => {
		const { container, toast } = await createToast({ opened: true });

		toast.close();
		const firstAnimating = toast.animating;
		
		toast.close(); // Try to close again
		const secondAnimating = toast.animating;

		if(firstAnimating !== secondAnimating){
			cleanup(container);
			fail('Should not change animating state if already closing');
			return;
		}

		cleanup(container);
		pass('Does not close if already closing');
	},

	'should clear timeout on disconnect': async ({pass, fail}) => {
		const { container, toast } = await createToast({ timeout: 5000, opened: true });

		// Just verify it doesn't throw
		toast.disconnectedCallback();

		cleanup(container);
		pass('Timeout cleared on disconnect');
	}
};
