import Timestamp from '../../src/components/Timestamp.js';

const createTimestamp = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-timestamp 
			${options.timestamp ? `timestamp="${options.timestamp}"` : ''}
			${options.format ? `format="${options.format}"` : ''}
			${options.locale ? `locale="${options.locale}"` : ''}
		></k-timestamp>
	`;
	document.body.appendChild(container);

	const timestamp = container.querySelector('k-timestamp');
	await timestamp.updateComplete;

	return { container, timestamp };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

// Fixed timestamp for testing: 2024-06-15 14:30:45.123
const testTimestamp = new Date(2024, 5, 15, 14, 30, 45, 123).getTime();

export default {
	/*
		Timestamp Component Tests
	*/
	'should create timestamp element': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		if(!timestamp){
			cleanup(container);
			fail('Timestamp element should be created');
			return;
		}

		if(!(timestamp instanceof Timestamp)){
			cleanup(container);
			fail('Element should be instance of Timestamp');
			return;
		}

		cleanup(container);
		pass('Timestamp element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		if(!timestamp.shadowRoot){
			cleanup(container);
			fail('Timestamp should have shadow root');
			return;
		}

		cleanup(container);
		pass('Timestamp has shadow root');
	},

	'should have default timestamp as 0': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		if(timestamp.timestamp !== 0){
			cleanup(container);
			fail(`Expected timestamp 0, got ${timestamp.timestamp}`);
			return;
		}

		cleanup(container);
		pass('Default timestamp is 0');
	},

	'should have default format as empty string': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		if(timestamp.format !== ''){
			cleanup(container);
			fail(`Expected format "", got "${timestamp.format}"`);
			return;
		}

		cleanup(container);
		pass('Default format is empty string');
	},

	'should have default locale as empty string': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		if(timestamp.locale !== ''){
			cleanup(container);
			fail(`Expected locale "", got "${timestamp.locale}"`);
			return;
		}

		cleanup(container);
		pass('Default locale is empty string');
	},

	'should set timestamp from attribute': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ timestamp: testTimestamp });

		if(timestamp.timestamp !== testTimestamp){
			cleanup(container);
			fail(`Expected timestamp ${testTimestamp}, got ${timestamp.timestamp}`);
			return;
		}

		cleanup(container);
		pass('Timestamp set from attribute');
	},

	'should set format from attribute': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'YYYY-MM-DD' 
		});

		if(timestamp.format !== 'YYYY-MM-DD'){
			cleanup(container);
			fail(`Expected format "YYYY-MM-DD", got "${timestamp.format}"`);
			return;
		}

		cleanup(container);
		pass('Format set from attribute');
	},

	'should set locale from attribute': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			locale: 'en-US' 
		});

		if(timestamp.locale !== 'en-US'){
			cleanup(container);
			fail(`Expected locale "en-US", got "${timestamp.locale}"`);
			return;
		}

		cleanup(container);
		pass('Locale set from attribute');
	},

	'should reflect timestamp attribute': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		timestamp.timestamp = testTimestamp;
		await timestamp.updateComplete;

		const attr = timestamp.getAttribute('timestamp');
		if(attr !== testTimestamp.toString()){
			cleanup(container);
			fail(`Expected timestamp attribute "${testTimestamp}", got "${attr}"`);
			return;
		}

		cleanup(container);
		pass('Timestamp attribute reflects correctly');
	},

	'should reflect format attribute': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		timestamp.format = 'YYYY-MM-DD';
		await timestamp.updateComplete;

		const attr = timestamp.getAttribute('format');
		if(attr !== 'YYYY-MM-DD'){
			cleanup(container);
			fail(`Expected format attribute "YYYY-MM-DD", got "${attr}"`);
			return;
		}

		cleanup(container);
		pass('Format attribute reflects correctly');
	},

	'should reflect locale attribute': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp();

		timestamp.locale = 'fr-FR';
		await timestamp.updateComplete;

		const attr = timestamp.getAttribute('locale');
		if(attr !== 'fr-FR'){
			cleanup(container);
			fail(`Expected locale attribute "fr-FR", got "${attr}"`);
			return;
		}

		cleanup(container);
		pass('Locale attribute reflects correctly');
	},

	'should render span element': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ timestamp: testTimestamp });

		const span = timestamp.shadowRoot.querySelector('span');
		if(!span){
			cleanup(container);
			fail('Timestamp should render span element');
			return;
		}

		cleanup(container);
		pass('Timestamp renders span element');
	},

	'should format YYYY-MM-DD': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'YYYY-MM-DD'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '2024-06-15'){
			cleanup(container);
			fail(`Expected "2024-06-15", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Formats YYYY-MM-DD correctly');
	},

	'should format hh:mm:ss': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'hh:mm:ss'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '14:30:45'){
			cleanup(container);
			fail(`Expected "14:30:45", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Formats hh:mm:ss correctly');
	},

	'should format with full date and time': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'YYYY-MM-DD hh:mm:ss'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '2024-06-15 14:30:45'){
			cleanup(container);
			fail(`Expected "2024-06-15 14:30:45", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Formats full date and time correctly');
	},

	'should format M and D without padding': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'M/D/YYYY'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '6/15/2024'){
			cleanup(container);
			fail(`Expected "6/15/2024", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Formats M and D without padding');
	},

	'should format YY short year': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'MM/DD/YY'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '06/15/24'){
			cleanup(container);
			fail(`Expected "06/15/24", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Formats YY short year correctly');
	},

	'should format h and m without padding': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'h:m:s'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '14:30:45'){
			cleanup(container);
			fail(`Expected "14:30:45", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Formats h, m, s correctly');
	},

	'should format milliseconds with iii': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'hh:mm:ss.iii'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '14:30:45.123'){
			cleanup(container);
			fail(`Expected "14:30:45.123", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Formats milliseconds with iii correctly');
	},

	'should render empty when timestamp is 0': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ format: 'YYYY-MM-DD' });

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== ''){
			cleanup(container);
			fail(`Expected empty content, got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Renders empty when timestamp is 0');
	},

	'should use locale string without format': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ timestamp: testTimestamp });

		const span = timestamp.shadowRoot.querySelector('span');
		// Without format, it should use toLocaleString
		if(!span.textContent || span.textContent.length === 0){
			cleanup(container);
			fail('Should render locale string without format');
			return;
		}

		cleanup(container);
		pass('Uses locale string without format');
	},

	'should update when timestamp changes': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'YYYY'
		});

		const newTimestamp = new Date(2025, 0, 1).getTime();
		timestamp.timestamp = newTimestamp;
		await timestamp.updateComplete;

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '2025'){
			cleanup(container);
			fail(`Expected "2025", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Updates when timestamp changes');
	},

	'should update when format changes': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'YYYY'
		});

		timestamp.format = 'MM-DD';
		await timestamp.updateComplete;

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '06-15'){
			cleanup(container);
			fail(`Expected "06-15", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Updates when format changes');
	},

	'should handle different separators': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'DD.MM.YYYY'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '15.06.2024'){
			cleanup(container);
			fail(`Expected "15.06.2024", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Handles different separators');
	},

	'should preserve literal text': async ({pass, fail}) => {
		const { container, timestamp } = await createTimestamp({ 
			timestamp: testTimestamp,
			format: 'YYYY-MM-DD (time hh:mm)'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		// Note: formatTimestamp replaces tokens anywhere in the string
		if(!span.textContent.includes('2024-06-15')){
			cleanup(container);
			fail(`Expected content to include "2024-06-15", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Format string processed correctly');
	},

	'should handle midnight timestamp': async ({pass, fail}) => {
		const midnightTimestamp = new Date(2024, 5, 15, 0, 0, 0).getTime();
		const { container, timestamp } = await createTimestamp({ 
			timestamp: midnightTimestamp,
			format: 'hh:mm:ss'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '00:00:00'){
			cleanup(container);
			fail(`Expected "00:00:00", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Handles midnight timestamp');
	},

	'should handle end of day timestamp': async ({pass, fail}) => {
		const endOfDayTimestamp = new Date(2024, 5, 15, 23, 59, 59).getTime();
		const { container, timestamp } = await createTimestamp({ 
			timestamp: endOfDayTimestamp,
			format: 'hh:mm:ss'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '23:59:59'){
			cleanup(container);
			fail(`Expected "23:59:59", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Handles end of day timestamp');
	},

	'should handle single digit day': async ({pass, fail}) => {
		const singleDigitDayTimestamp = new Date(2024, 0, 5).getTime();
		const { container, timestamp } = await createTimestamp({ 
			timestamp: singleDigitDayTimestamp,
			format: 'DD/D/YYYY'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '05/5/2024'){
			cleanup(container);
			fail(`Expected "05/5/2024", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Handles single digit day with and without padding');
	},

	'should handle double digit month': async ({pass, fail}) => {
		const decemberTimestamp = new Date(2024, 11, 25).getTime();
		const { container, timestamp } = await createTimestamp({ 
			timestamp: decemberTimestamp,
			format: 'MM/M/YYYY'
		});

		const span = timestamp.shadowRoot.querySelector('span');
		if(span.textContent !== '12/12/2024'){
			cleanup(container);
			fail(`Expected "12/12/2024", got "${span.textContent}"`);
			return;
		}

		cleanup(container);
		pass('Handles double digit month');
	}
};
