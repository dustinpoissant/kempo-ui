import Progress from '../../src/components/Progress.js';

const createProgress = async (options = {}) => {
	const progress = document.createElement('k-progress');
	if(options.percentage !== undefined) progress.percentage = options.percentage;
	if(options.offset !== undefined) progress.offset = options.offset;
	if(options.color !== undefined) progress.color = options.color;
	if(options.label !== undefined) progress.label = options.label;
	if(options.indeterminate !== undefined) progress.indeterminate = options.indeterminate;
	document.body.appendChild(progress);
	await progress.updateComplete;
	return progress;
};

const cleanup = (element) => {
	if(element && element.parentNode){
		element.parentNode.removeChild(element);
	}
};

export default {
	/*
		Progress Element Tests
	*/
	'should create progress element': async ({pass, fail}) => {
		const progress = await createProgress();

		if(!progress){
			cleanup(progress);
			fail('Progress element should be created');
			return;
		}

		if(!(progress instanceof Progress)){
			cleanup(progress);
			fail('Element should be instance of Progress');
			return;
		}

		cleanup(progress);
		pass('Progress element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const progress = await createProgress();

		if(!progress.shadowRoot){
			cleanup(progress);
			fail('Progress should have shadow root');
			return;
		}

		cleanup(progress);
		pass('Progress has shadow root');
	},

	/*
		Default Properties Tests
	*/
	'should have default percentage of 25': async ({pass, fail}) => {
		const progress = await createProgress();

		if(progress.percentage !== '25'){
			cleanup(progress);
			fail(`Expected default percentage "25", got "${progress.percentage}"`);
			return;
		}

		cleanup(progress);
		pass('Default percentage is 25');
	},

	'should have default offset of 0': async ({pass, fail}) => {
		const progress = await createProgress();

		if(progress.offset !== '0'){
			cleanup(progress);
			fail(`Expected default offset "0", got "${progress.offset}"`);
			return;
		}

		cleanup(progress);
		pass('Default offset is 0');
	},

	'should have default color of var(--c_primary)': async ({pass, fail}) => {
		const progress = await createProgress();

		if(progress.color !== 'var(--c_primary)'){
			cleanup(progress);
			fail(`Expected default color "var(--c_primary)", got "${progress.color}"`);
			return;
		}

		cleanup(progress);
		pass('Default color is var(--c_primary)');
	},

	'should have default label as undefined': async ({pass, fail}) => {
		const progress = await createProgress();

		if(progress.label !== undefined){
			cleanup(progress);
			fail(`Expected default label undefined, got ${progress.label}`);
			return;
		}

		cleanup(progress);
		pass('Default label is undefined');
	},

	'should have default indeterminate as null': async ({pass, fail}) => {
		const progress = await createProgress();

		if(progress.indeterminate !== null){
			cleanup(progress);
			fail(`Expected default indeterminate null, got "${progress.indeterminate}"`);
			return;
		}

		cleanup(progress);
		pass('Default indeterminate is null');
	},

	/*
		Property Tests
	*/
	'should set percentage property': async ({pass, fail}) => {
		const progress = await createProgress({ percentage: '50' });

		if(progress.percentage !== '50'){
			cleanup(progress);
			fail(`Expected percentage "50", got "${progress.percentage}"`);
			return;
		}

		cleanup(progress);
		pass('Percentage property is set correctly');
	},

	'should set offset property': async ({pass, fail}) => {
		const progress = await createProgress({ offset: '25' });

		if(progress.offset !== '25'){
			cleanup(progress);
			fail(`Expected offset "25", got "${progress.offset}"`);
			return;
		}

		cleanup(progress);
		pass('Offset property is set correctly');
	},

	'should set color property': async ({pass, fail}) => {
		const progress = await createProgress({ color: 'green' });

		if(progress.color !== 'green'){
			cleanup(progress);
			fail(`Expected color "green", got "${progress.color}"`);
			return;
		}

		cleanup(progress);
		pass('Color property is set correctly');
	},

	'should set label property': async ({pass, fail}) => {
		const progress = await createProgress({ label: true });

		if(progress.label !== true){
			cleanup(progress);
			fail(`Expected label true, got ${progress.label}`);
			return;
		}

		cleanup(progress);
		pass('Label property is set correctly');
	},

	'should set indeterminate property with duration': async ({pass, fail}) => {
		const progress = await createProgress({ indeterminate: '3s' });

		if(progress.indeterminate !== '3s'){
			cleanup(progress);
			fail(`Expected indeterminate "3s", got "${progress.indeterminate}"`);
			return;
		}

		cleanup(progress);
		pass('Indeterminate property is set correctly with duration');
	},

	/*
		Attribute Reflection Tests
	*/
	'should not reflect percentage attribute': async ({pass, fail}) => {
		const progress = await createProgress({ percentage: '75' });

		if(progress.hasAttribute('percentage')){
			cleanup(progress);
			fail('Progress should not have percentage attribute (not reflecting)');
			return;
		}

		cleanup(progress);
		pass('Percentage property does not reflect to attribute');
	},

	'should reflect indeterminate attribute': async ({pass, fail}) => {
		const progress = await createProgress({ indeterminate: '2s' });

		if(!progress.hasAttribute('indeterminate')){
			cleanup(progress);
			fail('Progress should have indeterminate attribute');
			return;
		}

		if(progress.getAttribute('indeterminate') !== '2s'){
			cleanup(progress);
			fail(`Expected attribute "2s", got "${progress.getAttribute('indeterminate')}"`);
			return;
		}

		cleanup(progress);
		pass('Indeterminate attribute reflects property');
	},

	/*
		Bars Getter Tests
	*/
	'should parse single bar correctly': async ({pass, fail}) => {
		const progress = await createProgress({ percentage: '50', color: 'blue', offset: '10' });
		const bars = progress.bars;

		if(!Array.isArray(bars) || bars.length !== 1){
			cleanup(progress);
			fail(`Expected 1 bar, got ${bars.length}`);
			return;
		}

		const bar = bars[0];
		if(bar.percentage !== '50' || bar.color !== 'blue' || bar.offset !== '10'){
			cleanup(progress);
			fail(`Expected bar {percentage: '50', color: 'blue', offset: '10'}, got ${JSON.stringify(bar)}`);
			return;
		}

		cleanup(progress);
		pass('Single bar parsed correctly');
	},

	'should parse multiple bars with pipe delimiter': async ({pass, fail}) => {
		const progress = await createProgress({
			percentage: '25|30',
			color: 'red|blue',
			offset: '0|50'
		});
		const bars = progress.bars;

		if(!Array.isArray(bars) || bars.length !== 2){
			cleanup(progress);
			fail(`Expected 2 bars, got ${bars.length}`);
			return;
		}

		if(bars[0].percentage !== '25' || bars[0].color !== 'red' || bars[0].offset !== '0'){
			cleanup(progress);
			fail(`Expected first bar {percentage: '25', color: 'red', offset: '0'}, got ${JSON.stringify(bars[0])}`);
			return;
		}

		if(bars[1].percentage !== '30' || bars[1].color !== 'blue' || bars[1].offset !== '50'){
			cleanup(progress);
			fail(`Expected second bar {percentage: '30', color: 'blue', offset: '50'}, got ${JSON.stringify(bars[1])}`);
			return;
		}

		cleanup(progress);
		pass('Multiple bars parsed correctly');
	},

	'should handle missing offset for additional bars': async ({pass, fail}) => {
		const progress = await createProgress({
			percentage: '25|30',
			color: 'red|blue'
		});
		const bars = progress.bars;

		if(bars[0].offset !== '0' || bars[1].offset !== '0'){
			cleanup(progress);
			fail(`Expected both offsets to be '0', got "${bars[0].offset}" and "${bars[1].offset}"`);
			return;
		}

		cleanup(progress);
		pass('Missing offset defaults to first offset for additional bars');
	},

	'should support gradient colors': async ({pass, fail}) => {
		const gradient = 'linear-gradient(to right, red 0%, blue 100%)';
		const progress = await createProgress({ color: gradient });

		if(progress.color !== gradient){
			cleanup(progress);
			fail(`Expected gradient color to be preserved, got "${progress.color}"`);
			return;
		}

		cleanup(progress);
		pass('Gradient colors are supported');
	},

	/*
		Rendering Tests
	*/
	'should render bar element in shadow dom': async ({pass, fail}) => {
		const progress = await createProgress({ percentage: '50' });
		const bar = progress.shadowRoot.querySelector('.bar');

		if(!bar){
			cleanup(progress);
			fail('Bar element should be rendered in shadow DOM');
			return;
		}

		cleanup(progress);
		pass('Bar element rendered correctly');
	},

	'should apply color style to bar': async ({pass, fail}) => {
		const progress = await createProgress({ percentage: '50', color: 'rgb(255, 0, 0)' });
		const bar = progress.shadowRoot.querySelector('.bar');
		const style = bar.getAttribute('style');

		if(!style || !style.includes('rgb(255, 0, 0)')){
			cleanup(progress);
			fail(`Expected color style to include "rgb(255, 0, 0)", got "${style}"`);
			return;
		}

		cleanup(progress);
		pass('Color style applied correctly to bar');
	},

	'should render label when label property is true': async ({pass, fail}) => {
		const progress = await createProgress({ percentage: '33', label: true });
		const label = progress.shadowRoot.querySelector('.label');

		if(!label){
			cleanup(progress);
			fail('Label element should be rendered when label property is true');
			return;
		}

		if(!label.textContent.includes('33')){
			cleanup(progress);
			fail(`Expected label to contain "33", got "${label.textContent}"`);
			return;
		}

		cleanup(progress);
		pass('Label rendered correctly with percentage');
	},

	'should not render label when label property is false': async ({pass, fail}) => {
		const progress = await createProgress({ percentage: '50', label: false });
		const label = progress.shadowRoot.querySelector('.label');

		if(label){
			cleanup(progress);
			fail('Label element should not be rendered when label property is false');
			return;
		}

		cleanup(progress);
		pass('Label not rendered when label is false');
	},

	'should render indeterminate bars': async ({pass, fail}) => {
		const progress = await createProgress({ indeterminate: '2s' });
		const bars = progress.shadowRoot.querySelectorAll('.bar');

		if(!bars || bars.length !== 2){
			cleanup(progress);
			fail(`Expected 2 bars for indeterminate, got ${bars.length}`);
			return;
		}

		if(!bars[0].id || !bars[1].id){
			cleanup(progress);
			fail('Indeterminate bars should have ids');
			return;
		}

		cleanup(progress);
		pass('Indeterminate bars rendered correctly');
	},

	'should apply animation duration to indeterminate bars': async ({pass, fail}) => {
		const progress = await createProgress({ indeterminate: '5s' });
		const bar1 = progress.shadowRoot.querySelector('#bar1');

		if(!bar1){
			cleanup(progress);
			fail('Bar 1 should exist');
			return;
		}

		const style = bar1.getAttribute('style');
		if(!style || !style.includes('5s')){
			cleanup(progress);
			fail(`Expected animation duration "5s" in style, got "${style}"`);
			return;
		}

		cleanup(progress);
		pass('Animation duration applied to indeterminate bars');
	},

	'should render multiple regular bars': async ({pass, fail}) => {
		const progress = await createProgress({
			percentage: '25|30',
			color: 'red|blue',
			offset: '0|50'
		});
		const bars = progress.shadowRoot.querySelectorAll('.bar');

		if(!bars || bars.length !== 2){
			cleanup(progress);
			fail(`Expected 2 bars, got ${bars.length}`);
			return;
		}

		const styles = Array.from(bars).map(b => b.getAttribute('style'));
		if(!styles[0].includes('25%') || !styles[1].includes('30%')){
			cleanup(progress);
			fail(`Expected width percentages "25%" and "30%", got ${styles.join(', ')}`);
			return;
		}

		cleanup(progress);
		pass('Multiple regular bars rendered correctly');
	},
};
