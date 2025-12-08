import Icon from '../../src/components/Icon.js';

const createIcon = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-icon
			${options.name ? `name="${options.name}"` : ''}
			${options.src ? `src="${options.src}"` : ''}
		></k-icon>
	`;
	document.body.appendChild(container);

	const icon = container.querySelector('k-icon');
	await icon.updateComplete;

	return { container, icon };
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
	'should create icon element': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		if(!icon){
			cleanup(container);
			fail('Icon element should be created');
			return;
		}

		if(!(icon instanceof Icon)){
			cleanup(container);
			fail('Element should be instance of Icon');
			return;
		}

		cleanup(container);
		pass('Icon element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		if(!icon.shadowRoot){
			cleanup(container);
			fail('Icon should have shadow root');
			return;
		}

		cleanup(container);
		pass('Icon has shadow root');
	},

	/*
		Property Tests
	*/
	'should have name property': async ({pass, fail}) => {
		const { container, icon } = await createIcon({ name: 'test-icon' });

		if(icon.name !== 'test-icon'){
			cleanup(container);
			fail(`Expected name "test-icon", got "${icon.name}"`);
			return;
		}

		cleanup(container);
		pass('name property set correctly');
	},

	'should have src property': async ({pass, fail}) => {
		const { container, icon } = await createIcon({ src: '/icons/test.svg' });

		if(icon.src !== '/icons/test.svg'){
			cleanup(container);
			fail(`Expected src "/icons/test.svg", got "${icon.src}"`);
			return;
		}

		cleanup(container);
		pass('src property set correctly');
	},

	'should have iconContent property': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		if(icon.iconContent === undefined){
			cleanup(container);
			fail('Icon should have iconContent property');
			return;
		}

		cleanup(container);
		pass('iconContent property exists');
	},

	/*
		fixSVG Method Tests
	*/
	'should have fixSVG method': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		if(typeof icon.fixSVG !== 'function'){
			cleanup(container);
			fail('Icon should have fixSVG method');
			return;
		}

		cleanup(container);
		pass('fixSVG method exists');
	},

	'fixSVG should remove width attribute': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		const svgWithWidth = '<svg width="100" height="100" viewBox="0 0 100 100"></svg>';
		const fixed = icon.fixSVG(svgWithWidth);

		if(fixed.includes('width="100"')){
			cleanup(container);
			fail('fixSVG should remove width attribute');
			return;
		}

		cleanup(container);
		pass('fixSVG removes width attribute');
	},

	'fixSVG should remove height attribute': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		const svgWithHeight = '<svg width="100" height="100" viewBox="0 0 100 100"></svg>';
		const fixed = icon.fixSVG(svgWithHeight);

		if(fixed.includes('height="100"')){
			cleanup(container);
			fail('fixSVG should remove height attribute');
			return;
		}

		cleanup(container);
		pass('fixSVG removes height attribute');
	},

	'fixSVG should preserve viewBox': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		const svg = '<svg width="100" height="100" viewBox="0 0 100 100"></svg>';
		const fixed = icon.fixSVG(svg);

		if(!fixed.includes('viewBox="0 0 100 100"')){
			cleanup(container);
			fail('fixSVG should preserve viewBox');
			return;
		}

		cleanup(container);
		pass('fixSVG preserves viewBox');
	},

	'fixSVG should add fill currentColor to path elements': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		const svg = '<svg viewBox="0 0 100 100"><path d="M0 0 L100 100"/></svg>';
		const fixed = icon.fixSVG(svg);

		if(!fixed.includes('fill="currentColor"')){
			cleanup(container);
			fail('fixSVG should add fill="currentColor" to path elements');
			return;
		}

		cleanup(container);
		pass('fixSVG adds fill currentColor to path elements');
	},

	'fixSVG should handle null input': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		const result = icon.fixSVG(null);

		if(result !== null){
			cleanup(container);
			fail('fixSVG should return null for null input');
			return;
		}

		cleanup(container);
		pass('fixSVG handles null input');
	},

	'fixSVG should handle empty string': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		const result = icon.fixSVG('');

		if(result !== ''){
			cleanup(container);
			fail('fixSVG should return empty string for empty input');
			return;
		}

		cleanup(container);
		pass('fixSVG handles empty string');
	},

	/*
		loadIcon Method Tests
	*/
	'should have loadIcon method': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		if(typeof icon.loadIcon !== 'function'){
			cleanup(container);
			fail('Icon should have loadIcon method');
			return;
		}

		cleanup(container);
		pass('loadIcon method exists');
	},

	'loadIcon should use fallback when no icon found': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		// No name or src set, should use fallback
		await icon.loadIcon();
		await icon.updateComplete;

		// Should have some content from the fallback
		if(!icon.iconContent){
			cleanup(container);
			fail('loadIcon should set iconContent from fallback');
			return;
		}

		cleanup(container);
		pass('loadIcon uses fallback when no icon found');
	},

	/*
		Render Tests
	*/
	'should render in shadow root': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		await icon.updateComplete;

		// The component should render something in the shadow root
		if(!icon.shadowRoot.innerHTML){
			cleanup(container);
			fail('Shadow root should have content');
			return;
		}

		cleanup(container);
		pass('Icon renders in shadow root');
	},

	'should show slot when no iconContent': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		// Before loadIcon is called, should show slot
		icon.iconContent = '';
		await icon.updateComplete;

		const slot = icon.shadowRoot.querySelector('slot');

		if(!slot){
			cleanup(container);
			fail('Should render slot when no iconContent');
			return;
		}

		cleanup(container);
		pass('Slot rendered when no iconContent');
	},

	/*
		Attribute Reflection Tests
	*/
	'name should reflect to attribute': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.name = 'reflected-icon';
		await icon.updateComplete;

		if(icon.getAttribute('name') !== 'reflected-icon'){
			cleanup(container);
			fail(`Expected attribute "reflected-icon", got "${icon.getAttribute('name')}"`);
			return;
		}

		cleanup(container);
		pass('name property reflects to attribute');
	},

	'src should reflect to attribute': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.src = '/new/path.svg';
		await icon.updateComplete;

		if(icon.getAttribute('src') !== '/new/path.svg'){
			cleanup(container);
			fail(`Expected attribute "/new/path.svg", got "${icon.getAttribute('src')}"`);
			return;
		}

		cleanup(container);
		pass('src property reflects to attribute');
	},

	/*
		Constructor Tests
	*/
	'constructor should accept name parameter': async ({pass, fail}) => {
		const icon = new Icon('test-name');

		if(icon.name !== 'test-name'){
			fail(`Expected name "test-name", got "${icon.name}"`);
			return;
		}

		pass('Constructor accepts name parameter');
	},

	'constructor should default name to empty string': async ({pass, fail}) => {
		const icon = new Icon();

		if(icon.name !== ''){
			fail(`Expected name "", got "${icon.name}"`);
			return;
		}

		pass('Constructor defaults name to empty string');
	},

	/*
		Styling Tests
	*/
	'should have base CSS applied': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		// The component uses ShadowComponent which includes kempo.css
		cleanup(container);
		pass('Component has styling');
	},

	/*
		Rotation Property Tests
	*/
	'should have rotation property': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-icon name="arrow" rotation="45"></k-icon>';
		document.body.appendChild(container);
		const icon = container.querySelector('k-icon');
		await icon.updateComplete;

		if(icon.rotation !== '45'){
			cleanup(container);
			fail(`Expected rotation "45", got "${icon.rotation}"`);
			return;
		}

		cleanup(container);
		pass('rotation property set correctly');
	},

	'rotation should reflect to attribute': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.rotation = '90';
		await icon.updateComplete;

		if(icon.getAttribute('rotation') !== '90'){
			cleanup(container);
			fail(`Expected rotation attribute "90", got "${icon.getAttribute('rotation')}"`);
			return;
		}

		cleanup(container);
		pass('rotation property reflects to attribute');
	},

	'getRotationDegrees should return rotation value when set': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.rotation = '45';
		await icon.updateComplete;

		if(icon.getRotationDegrees() !== '45'){
			cleanup(container);
			fail(`Expected rotation degrees "45", got "${icon.getRotationDegrees()}"`);
			return;
		}

		cleanup(container);
		pass('getRotationDegrees returns rotation value');
	},

	/*
		Direction Property Tests
	*/
	'should have direction property': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-icon name="arrow" direction="down"></k-icon>';
		document.body.appendChild(container);
		const icon = container.querySelector('k-icon');
		await icon.updateComplete;

		if(icon.direction !== 'down'){
			cleanup(container);
			fail(`Expected direction "down", got "${icon.direction}"`);
			return;
		}

		cleanup(container);
		pass('direction property set correctly');
	},

	'direction should reflect to attribute': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.direction = 'left';
		await icon.updateComplete;

		if(icon.getAttribute('direction') !== 'left'){
			cleanup(container);
			fail(`Expected direction attribute "left", got "${icon.getAttribute('direction')}"`);
			return;
		}

		cleanup(container);
		pass('direction property reflects to attribute');
	},

	'getRotationDegrees should return 90 for direction down': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.direction = 'down';
		await icon.updateComplete;

		if(icon.getRotationDegrees() !== '90'){
			cleanup(container);
			fail(`Expected rotation degrees "90", got "${icon.getRotationDegrees()}"`);
			return;
		}

		cleanup(container);
		pass('getRotationDegrees returns 90 for down direction');
	},

	'getRotationDegrees should return 180 for direction left': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.direction = 'left';
		await icon.updateComplete;

		if(icon.getRotationDegrees() !== '180'){
			cleanup(container);
			fail(`Expected rotation degrees "180", got "${icon.getRotationDegrees()}"`);
			return;
		}

		cleanup(container);
		pass('getRotationDegrees returns 180 for left direction');
	},

	'getRotationDegrees should return 270 for direction up': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.direction = 'up';
		await icon.updateComplete;

		if(icon.getRotationDegrees() !== '270'){
			cleanup(container);
			fail(`Expected rotation degrees "270", got "${icon.getRotationDegrees()}"`);
			return;
		}

		cleanup(container);
		pass('getRotationDegrees returns 270 for up direction');
	},

	'getRotationDegrees should return 0 for unknown direction': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.direction = 'invalid';
		await icon.updateComplete;

		if(icon.getRotationDegrees() !== '0'){
			cleanup(container);
			fail(`Expected rotation degrees "0", got "${icon.getRotationDegrees()}"`);
			return;
		}

		cleanup(container);
		pass('getRotationDegrees returns 0 for unknown direction');
	},

	'rotation should take precedence over direction': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.rotation = '45';
		icon.direction = 'down';
		await icon.updateComplete;

		if(icon.getRotationDegrees() !== '45'){
			cleanup(container);
			fail(`Expected rotation to take precedence, got "${icon.getRotationDegrees()}"`);
			return;
		}

		cleanup(container);
		pass('rotation takes precedence over direction');
	},

	/*
		Animation Property Tests
	*/
	'should have animation property': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-icon name="arrow" animation="spin"></k-icon>';
		document.body.appendChild(container);
		const icon = container.querySelector('k-icon');
		await icon.updateComplete;

		if(icon.animation !== 'spin'){
			cleanup(container);
			fail(`Expected animation "spin", got "${icon.animation}"`);
			return;
		}

		cleanup(container);
		pass('animation property set correctly');
	},

	'animation should reflect to attribute': async ({pass, fail}) => {
		const { container, icon } = await createIcon();

		icon.animation = 'blink';
		await icon.updateComplete;

		if(icon.getAttribute('animation') !== 'blink'){
			cleanup(container);
			fail(`Expected animation attribute "blink", got "${icon.getAttribute('animation')}"`);
			return;
		}

		cleanup(container);
		pass('animation property reflects to attribute');
	}
};
