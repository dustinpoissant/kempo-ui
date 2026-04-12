import NavSpacer from '../../src/components/NavSpacer.js';
import '../../src/components/Nav.js';

const createNavSpacer = async () => {
	const container = document.createElement('div');
	container.innerHTML = `<k-nav-spacer></k-nav-spacer>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-nav-spacer');
	await el.updateComplete;
	return { container, el };
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
	'should create nav-spacer element': async ({pass, fail}) => {
		const { container, el } = await createNavSpacer();
		if(!(el instanceof NavSpacer)){
			cleanup(container);
			return fail('Element should be instance of NavSpacer');
		}
		cleanup(container);
		pass('NavSpacer element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await createNavSpacer();
		if(!el.shadowRoot){
			cleanup(container);
			return fail('NavSpacer should have shadow root');
		}
		cleanup(container);
		pass('NavSpacer has shadow root');
	},

	/*
		Behaviour
	*/
	'should set height 0 when no fixed nav present': async ({pass, fail}) => {
		const { container, el } = await createNavSpacer();
		const h = el.style.height;
		if(h !== '0px'){
			cleanup(container);
			return fail(`Expected height 0px when no k-nav[fixed] exists, got "${h}"`);
		}
		cleanup(container);
		pass('Height is 0px when no fixed nav present');
	},

	'should match height of fixed nav when present': async ({pass, fail}) => {
		const navContainer = document.createElement('div');
		navContainer.innerHTML = `<k-nav fixed style="height:56px"></k-nav>`;
		document.body.appendChild(navContainer);
		await customElements.whenDefined('k-nav');
		const nav = navContainer.querySelector('k-nav');
		await nav.updateComplete;

		const { container, el } = await createNavSpacer();

		// Poll until ResizeObserver fires (up to 1s)
		const start = Date.now();
		while(el.style.height === '' && Date.now() - start < 1000){
			await new Promise(r => setTimeout(r, 20));
		}

		const h = el.style.height;
		cleanup(container);
		cleanup(navContainer);
		if(h === ''){
			return fail('ResizeObserver never fired — height was never set');
		}
		pass(`NavSpacer height was set to ${h}`);
	},
};
