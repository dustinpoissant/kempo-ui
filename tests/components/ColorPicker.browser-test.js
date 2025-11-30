import ColorPicker from '../../src/components/ColorPicker.js';

const createColorPicker = async (options = {}) => {
	const picker = document.createElement('k-color-picker');
	if(options.value){
		picker.setAttribute('value', options.value);
	}
	if(options.format){
		picker.setAttribute('format', options.format);
	}
	if(options.name){
		picker.setAttribute('name', options.name);
	}
	document.body.appendChild(picker);
	await picker.updateComplete;
	return picker;
};

const cleanup = (element) => {
	if(element && element.parentNode){
		element.parentNode.removeChild(element);
	}
};

export default {
	/*
		ColorPicker Element Tests
	*/
	'should create color picker element': async ({pass, fail}) => {
		const picker = await createColorPicker();

		if(!picker){
			cleanup(picker);
			fail('ColorPicker element should be created');
			return;
		}

		if(!(picker instanceof ColorPicker)){
			cleanup(picker);
			fail('Element should be instance of ColorPicker');
			return;
		}

		cleanup(picker);
		pass('ColorPicker element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const picker = await createColorPicker();

		if(!picker.shadowRoot){
			cleanup(picker);
			fail('ColorPicker should have shadow root');
			return;
		}

		cleanup(picker);
		pass('ColorPicker has shadow root');
	},

	'should have default format as hex': async ({pass, fail}) => {
		const picker = await createColorPicker();

		if(picker.format !== 'hex'){
			cleanup(picker);
			fail(`Expected format "hex", got "${picker.format}"`);
			return;
		}

		cleanup(picker);
		pass('Default format is hex');
	},

	'should have default RGB values as 0': async ({pass, fail}) => {
		const picker = await createColorPicker();

		if(picker.red !== 0 || picker.green !== 0 || picker.blue !== 0){
			cleanup(picker);
			fail(`Expected RGB (0, 0, 0), got (${picker.red}, ${picker.green}, ${picker.blue})`);
			return;
		}

		cleanup(picker);
		pass('Default RGB values are 0');
	},

	'should have default alpha as 1': async ({pass, fail}) => {
		const picker = await createColorPicker();

		if(picker.alpha !== 1){
			cleanup(picker);
			fail(`Expected alpha 1, got ${picker.alpha}`);
			return;
		}

		cleanup(picker);
		pass('Default alpha is 1');
	},

	/*
		Value Parsing Tests
	*/
	'should parse hex value': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: '#ff0000' });

		if(picker.red !== 255 || picker.green !== 0 || picker.blue !== 0){
			cleanup(picker);
			fail(`Expected RGB (255, 0, 0), got (${picker.red}, ${picker.green}, ${picker.blue})`);
			return;
		}

		cleanup(picker);
		pass('Parses hex value correctly');
	},

	'should parse short hex value': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: '#f00' });

		if(picker.red !== 255 || picker.green !== 0 || picker.blue !== 0){
			cleanup(picker);
			fail(`Expected RGB (255, 0, 0), got (${picker.red}, ${picker.green}, ${picker.blue})`);
			return;
		}

		cleanup(picker);
		pass('Parses short hex value correctly');
	},

	'should parse hex value with alpha': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: '#ff000080' });

		if(picker.red !== 255){
			cleanup(picker);
			fail(`Expected red 255, got ${picker.red}`);
			return;
		}

		// Alpha should be approximately 0.5 (128/255)
		if(Math.abs(picker.alpha - 0.5) > 0.01){
			cleanup(picker);
			fail(`Expected alpha ~0.5, got ${picker.alpha}`);
			return;
		}

		cleanup(picker);
		pass('Parses hex value with alpha correctly');
	},

	'should parse rgb value': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: 'rgb(0, 255, 0)' });

		if(picker.red !== 0 || picker.green !== 255 || picker.blue !== 0){
			cleanup(picker);
			fail(`Expected RGB (0, 255, 0), got (${picker.red}, ${picker.green}, ${picker.blue})`);
			return;
		}

		cleanup(picker);
		pass('Parses rgb value correctly');
	},

	'should parse rgba value': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: 'rgba(0, 0, 255, 0.5)' });

		if(picker.blue !== 255){
			cleanup(picker);
			fail(`Expected blue 255, got ${picker.blue}`);
			return;
		}

		if(picker.alpha !== 0.5){
			cleanup(picker);
			fail(`Expected alpha 0.5, got ${picker.alpha}`);
			return;
		}

		cleanup(picker);
		pass('Parses rgba value correctly');
	},

	'should parse hsl value': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: 'hsl(0, 100%, 50%)' });

		// HSL (0, 100%, 50%) is pure red
		if(picker.red !== 255){
			cleanup(picker);
			fail(`Expected red 255, got ${picker.red}`);
			return;
		}

		cleanup(picker);
		pass('Parses hsl value correctly');
	},

	/*
		Value Output Tests
	*/
	'should output hex format': async ({pass, fail}) => {
		const picker = await createColorPicker({ format: 'hex' });
		picker.red = 255;
		picker.green = 0;
		picker.blue = 0;
		await picker.updateComplete;

		if(picker.value !== '#ff0000'){
			cleanup(picker);
			fail(`Expected "#ff0000", got "${picker.value}"`);
			return;
		}

		cleanup(picker);
		pass('Outputs hex format correctly');
	},

	'should output rgb format': async ({pass, fail}) => {
		const picker = await createColorPicker({ format: 'rgb' });
		picker.red = 0;
		picker.green = 255;
		picker.blue = 0;
		await picker.updateComplete;

		if(picker.value !== 'rgb(0, 255, 0)'){
			cleanup(picker);
			fail(`Expected "rgb(0, 255, 0)", got "${picker.value}"`);
			return;
		}

		cleanup(picker);
		pass('Outputs rgb format correctly');
	},

	'should output rgba format when alpha < 1': async ({pass, fail}) => {
		const picker = await createColorPicker({ format: 'rgb' });
		picker.red = 0;
		picker.green = 0;
		picker.blue = 255;
		picker.alpha = 0.5;
		await picker.updateComplete;

		if(!picker.value.startsWith('rgba(')){
			cleanup(picker);
			fail(`Expected rgba format, got "${picker.value}"`);
			return;
		}

		cleanup(picker);
		pass('Outputs rgba format when alpha < 1');
	},

	'should output hsl format': async ({pass, fail}) => {
		const picker = await createColorPicker({ format: 'hsl' });
		picker.red = 255;
		picker.green = 0;
		picker.blue = 0;
		await picker.updateComplete;

		if(!picker.value.startsWith('hsl(')){
			cleanup(picker);
			fail(`Expected hsl format, got "${picker.value}"`);
			return;
		}

		cleanup(picker);
		pass('Outputs hsl format correctly');
	},

	/*
		Format Detection Tests
	*/
	'should auto-detect hex format': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-color-picker value="#00ff00"></k-color-picker>';
		document.body.appendChild(container);

		const picker = container.querySelector('k-color-picker');
		await picker.updateComplete;
		await new Promise(r => setTimeout(r, 50));

		if(picker.format !== 'hex'){
			container.parentNode.removeChild(container);
			fail(`Expected format "hex", got "${picker.format}"`);
			return;
		}

		container.parentNode.removeChild(container);
		pass('Auto-detects hex format');
	},

	'should auto-detect rgb format': async ({pass, fail}) => {
		const container = document.createElement('div');
		container.innerHTML = '<k-color-picker value="rgb(100, 150, 200)"></k-color-picker>';
		document.body.appendChild(container);

		const picker = container.querySelector('k-color-picker');
		await picker.updateComplete;
		await new Promise(r => setTimeout(r, 50));

		if(picker.format !== 'rgb'){
			container.parentNode.removeChild(container);
			fail(`Expected format "rgb", got "${picker.format}"`);
			return;
		}

		container.parentNode.removeChild(container);
		pass('Auto-detects rgb format');
	},

	/*
		UI Element Tests
	*/
	'should render format select': async ({pass, fail}) => {
		const picker = await createColorPicker();

		const select = picker.shadowRoot.querySelector('#format');
		if(!select){
			cleanup(picker);
			fail('ColorPicker should render format select');
			return;
		}

		cleanup(picker);
		pass('ColorPicker renders format select');
	},

	'should render text input': async ({pass, fail}) => {
		const picker = await createColorPicker();

		const input = picker.shadowRoot.querySelector('#text');
		if(!input){
			cleanup(picker);
			fail('ColorPicker should render text input');
			return;
		}

		cleanup(picker);
		pass('ColorPicker renders text input');
	},

	'should render color input': async ({pass, fail}) => {
		const picker = await createColorPicker();

		const colorInput = picker.shadowRoot.querySelector('#color');
		if(!colorInput){
			cleanup(picker);
			fail('ColorPicker should render color input');
			return;
		}

		if(colorInput.type !== 'color'){
			cleanup(picker);
			fail(`Expected type "color", got "${colorInput.type}"`);
			return;
		}

		cleanup(picker);
		pass('ColorPicker renders color input');
	},

	'should have format options': async ({pass, fail}) => {
		const picker = await createColorPicker();

		const options = picker.shadowRoot.querySelectorAll('#format option');
		if(options.length === 0){
			cleanup(picker);
			fail('Format select should have options');
			return;
		}

		// Check for common formats
		const formatNames = Array.from(options).map(o => o.value);
		if(!formatNames.includes('hex') || !formatNames.includes('rgb')){
			cleanup(picker);
			fail('Should have hex and rgb format options');
			return;
		}

		cleanup(picker);
		pass('Format select has correct options');
	},

	/*
		Input Handling Tests
	*/
	'should update on text input change': async ({pass, fail}) => {
		const picker = await createColorPicker();

		const textInput = picker.shadowRoot.querySelector('#text');
		textInput.value = '#00ff00';
		textInput.dispatchEvent(new Event('input'));
		await picker.updateComplete;

		if(picker.green !== 255){
			cleanup(picker);
			fail(`Expected green 255, got ${picker.green}`);
			return;
		}

		cleanup(picker);
		pass('Updates on text input change');
	},

	'should update on color input change': async ({pass, fail}) => {
		const picker = await createColorPicker();

		const colorInput = picker.shadowRoot.querySelector('#color');
		colorInput.value = '#0000ff';
		colorInput.dispatchEvent(new Event('input'));
		await picker.updateComplete;

		if(picker.blue !== 255){
			cleanup(picker);
			fail(`Expected blue 255, got ${picker.blue}`);
			return;
		}

		cleanup(picker);
		pass('Updates on color input change');
	},

	'should update format on select change': async ({pass, fail}) => {
		const picker = await createColorPicker({ format: 'hex' });

		const formatSelect = picker.shadowRoot.querySelector('#format');
		formatSelect.value = 'rgb';
		formatSelect.dispatchEvent(new Event('change'));
		await picker.updateComplete;

		if(picker.format !== 'rgb'){
			cleanup(picker);
			fail(`Expected format "rgb", got "${picker.format}"`);
			return;
		}

		cleanup(picker);
		pass('Updates format on select change');
	},

	/*
		Event Tests
	*/
	'should dispatch input event on text change': async ({pass, fail}) => {
		const picker = await createColorPicker();

		let eventFired = false;
		picker.addEventListener('input', () => {
			eventFired = true;
		});

		const textInput = picker.shadowRoot.querySelector('#text');
		textInput.value = '#ff0000';
		textInput.dispatchEvent(new Event('input', { bubbles: true }));

		if(!eventFired){
			cleanup(picker);
			fail('input event should be dispatched');
			return;
		}

		cleanup(picker);
		pass('Dispatches input event on text change');
	},

	'should dispatch change event on text change': async ({pass, fail}) => {
		const picker = await createColorPicker();

		let eventFired = false;
		picker.addEventListener('change', () => {
			eventFired = true;
		});

		const textInput = picker.shadowRoot.querySelector('#text');
		textInput.value = '#ff0000';
		textInput.dispatchEvent(new Event('change', { bubbles: true }));

		if(!eventFired){
			cleanup(picker);
			fail('change event should be dispatched');
			return;
		}

		cleanup(picker);
		pass('Dispatches change event on text change');
	},

	/*
		Form Association Tests
	*/
	'should be form associated': async ({pass, fail}) => {
		if(!ColorPicker.formAssociated){
			fail('ColorPicker should be form associated');
			return;
		}

		pass('ColorPicker is form associated');
	},

	'should have internals': async ({pass, fail}) => {
		const picker = await createColorPicker();

		if(!picker.internals){
			cleanup(picker);
			fail('ColorPicker should have internals');
			return;
		}

		cleanup(picker);
		pass('ColorPicker has internals');
	},

	/*
		Static Formats Tests
	*/
	'should have static formats object': async ({pass, fail}) => {
		if(!ColorPicker.formats){
			fail('ColorPicker should have static formats');
			return;
		}

		if(typeof ColorPicker.formats !== 'object'){
			fail('formats should be an object');
			return;
		}

		pass('ColorPicker has static formats object');
	},

	'should have hex format with detect, parse, toString': async ({pass, fail}) => {
		const hex = ColorPicker.formats.hex;

		if(!hex){
			fail('hex format should exist');
			return;
		}

		if(typeof hex.detect !== 'function'){
			fail('hex.detect should be a function');
			return;
		}

		if(typeof hex.parse !== 'function'){
			fail('hex.parse should be a function');
			return;
		}

		if(typeof hex.toString !== 'function'){
			fail('hex.toString should be a function');
			return;
		}

		pass('hex format has required methods');
	},

	'hex detect should work correctly': async ({pass, fail}) => {
		const hex = ColorPicker.formats.hex;

		if(!hex.detect('#ff0000')){
			fail('Should detect #ff0000');
			return;
		}

		if(!hex.detect('#f00')){
			fail('Should detect #f00');
			return;
		}

		if(!hex.detect('#ff000080')){
			fail('Should detect #ff000080');
			return;
		}

		if(hex.detect('rgb(255,0,0)')){
			fail('Should not detect rgb format');
			return;
		}

		pass('hex detect works correctly');
	},

	'rgb detect should work correctly': async ({pass, fail}) => {
		const rgb = ColorPicker.formats.rgb;

		if(!rgb.detect('rgb(255, 0, 0)')){
			fail('Should detect rgb(255, 0, 0)');
			return;
		}

		if(!rgb.detect('rgba(255, 0, 0, 0.5)')){
			fail('Should detect rgba(255, 0, 0, 0.5)');
			return;
		}

		if(rgb.detect('#ff0000')){
			fail('Should not detect hex format');
			return;
		}

		pass('rgb detect works correctly');
	},

	'hsl detect should work correctly': async ({pass, fail}) => {
		const hsl = ColorPicker.formats.hsl;

		if(!hsl.detect('hsl(0, 100%, 50%)')){
			fail('Should detect hsl(0, 100%, 50%)');
			return;
		}

		if(!hsl.detect('hsla(0, 100%, 50%, 0.5)')){
			fail('Should detect hsla(0, 100%, 50%, 0.5)');
			return;
		}

		pass('hsl detect works correctly');
	},

	/*
		Color Conversion Tests
	*/
	'should round-trip hex color': async ({pass, fail}) => {
		const hex = ColorPicker.formats.hex;
		const original = '#3498db';
		const parsed = hex.parse(original);
		const output = hex.toString(parsed.r, parsed.g, parsed.b, parsed.a);

		if(output !== original){
			fail(`Expected "${original}", got "${output}"`);
			return;
		}

		pass('Hex color round-trips correctly');
	},

	'should convert white correctly': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: '#ffffff' });

		if(picker.red !== 255 || picker.green !== 255 || picker.blue !== 255){
			cleanup(picker);
			fail(`Expected white (255, 255, 255), got (${picker.red}, ${picker.green}, ${picker.blue})`);
			return;
		}

		cleanup(picker);
		pass('White color converted correctly');
	},

	'should convert black correctly': async ({pass, fail}) => {
		const picker = await createColorPicker({ value: '#000000' });

		if(picker.red !== 0 || picker.green !== 0 || picker.blue !== 0){
			cleanup(picker);
			fail(`Expected black (0, 0, 0), got (${picker.red}, ${picker.green}, ${picker.blue})`);
			return;
		}

		cleanup(picker);
		pass('Black color converted correctly');
	}
};
