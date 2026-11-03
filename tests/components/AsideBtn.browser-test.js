import AsideBtn from '../../src/components/AsideBtn.js';
import '../../src/components/Aside.js';

const settle = () => new Promise(resolve => setTimeout(resolve, 40));

let pairCount = 0;

const createPair = async (asideAttributes = '', buttonAttributes = '') => {
	const id = `btn-test-aside-${++pairCount}`;
	const container = document.createElement('div');
	const defaultState = asideAttributes.includes('state=') ? '' : 'state="offscreen"';
	container.innerHTML = `<k-aside id="${id}" ${defaultState} ${asideAttributes}><nav>Menu</nav></k-aside><k-aside-btn for="${id}" ${buttonAttributes}></k-aside-btn>`;
	document.body.appendChild(container);
	const aside = container.querySelector('k-aside');
	const button = container.querySelector('k-aside-btn');
	await aside.updateComplete;
	await button.updateComplete;
	await settle();
	return { container, aside, button };
};

const cleanup = (...elements) => {
	elements.forEach(el => el?.remove());
	document.body.classList.remove('no-scroll');
};

export default {
	'should create aside-btn element': async ({pass, fail}) => {
		const { container, button } = await createPair();
		if(!(button instanceof AsideBtn)) {
			cleanup(container);
			return fail('Element should be instance of AsideBtn');
		}
		cleanup(container);
		pass('AsideBtn element created correctly');
	},

	'should default to top left with the menu icon': async ({pass, fail}) => {
		const { container, button } = await createPair();
		const hasMenuIcon = !!button.shadowRoot.querySelector('slot k-icon[name="menu"]');
		if(button.position !== 'top left' || !hasMenuIcon) {
			cleanup(container);
			return fail(`Expected top left with a menu icon, got position "${button.position}"`);
		}
		cleanup(container);
		pass('Defaults to top left with the menu icon in its slot');
	},

	'should toggle its aside on click': async ({pass, fail}) => {
		const { container, aside, button } = await createPair();
		button.click();
		await settle();
		const opened = aside.state;
		button.click();
		await settle();
		const closed = aside.state;
		cleanup(container);
		if(opened !== 'expanded' || closed !== 'offscreen') return fail(`Click should open then close the aside, got ${opened} then ${closed}`);
		pass('Clicking toggles the aside it is linked to');
	},

	'should hide while its aside is open unless push is set': async ({pass, fail}) => {
		const hidden = await createPair('state="expanded"');
		await hidden.button.updateComplete;
		const hiddenOpen = hidden.button.hasAttribute('aside-open');
		const pushed = await createPair('state="expanded" main="push"', 'push');
		await pushed.button.updateComplete;
		const pushedOpen = pushed.button.hasAttribute('aside-open');
		const offsetSet = pushed.button.style.getPropertyValue('--aside-btn-offset');
		cleanup(hidden.container, pushed.container);
		if(!hiddenOpen) return fail('Button should be marked aside-open while its aside is open');
		if(!pushedOpen || offsetSet === '0px' || !offsetSet) return fail(`A push button should move beside an open aside, got offset "${offsetSet}"`);
		pass('Hidden under an open aside by default, and pushed beside it with push');
	},

	'should read the for attribute to find its aside': async ({pass, fail}) => {
		const { container, aside, button } = await createPair();
		const linked = button.aside === aside;
		cleanup(container);
		if(!linked) return fail('The button should be linked to the aside named by for');
		pass('The for attribute links the button to its aside');
	}
};
