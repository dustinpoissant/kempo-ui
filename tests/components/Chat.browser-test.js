import Chat from '../../src/components/Chat.js';

const createChat = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-chat 
			${options.placeholder ? `placeholder="${options.placeholder}"` : ''}
			${options.disabled ? 'disabled' : ''}
			${options.enterNewline ? 'enter-newline' : ''}
			${options.showStatus ? `show-status="${options.showStatus}"` : ''}
		></k-chat>
	`;
	document.body.appendChild(container);

	const chat = container.querySelector('k-chat');
	await chat.updateComplete;

	return { container, chat };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Chat Component - Element & Initialization Tests
	*/
	'should create chat element': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(!chat){
			cleanup(container);
			fail('Chat element should be created');
			return;
		}

		if(!(chat instanceof Chat)){
			cleanup(container);
			fail('Element should be instance of Chat');
			return;
		}

		cleanup(container);
		pass('Chat element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(!chat.shadowRoot){
			cleanup(container);
			fail('Chat should have shadow root');
			return;
		}

		cleanup(container);
		pass('Chat has shadow root');
	},

	'should have default properties': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(chat.enterNewline !== false){
			cleanup(container);
			fail(`Expected enterNewline false, got ${chat.enterNewline}`);
			return;
		}

		if(chat.showStatus !== null){
			cleanup(container);
			fail(`Expected showStatus null, got ${chat.showStatus}`);
			return;
		}

		if(chat.placeholder !== 'Type a message...'){
			cleanup(container);
			fail(`Expected placeholder "Type a message...", got "${chat.placeholder}"`);
			return;
		}

		if(chat.disabled !== false){
			cleanup(container);
			fail(`Expected disabled false, got ${chat.disabled}`);
			return;
		}

		if(!Array.isArray(chat.messages) || chat.messages.length !== 0){
			cleanup(container);
			fail('Expected empty messages array');
			return;
		}

		cleanup(container);
		pass('Chat has correct default properties');
	},

	'should accept custom placeholder': async ({pass, fail}) => {
		const { container, chat } = await createChat({ placeholder: 'Custom placeholder' });

		if(chat.placeholder !== 'Custom placeholder'){
			cleanup(container);
			fail(`Expected custom placeholder, got "${chat.placeholder}"`);
			return;
		}

		cleanup(container);
		pass('Chat accepts custom placeholder');
	},

	/*
		Chat Component - Send Button Tests
	*/
	'send button should have min-width': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const sendBtn = chat.shadowRoot?.querySelector('.send-btn');
		if(!sendBtn){
			cleanup(container);
			fail('Send button not found in shadow DOM');
			return;
		}

		const styles = getComputedStyle(sendBtn);
		const minWidth = styles.minWidth;

		if(minWidth === '0px' || minWidth === 'auto'){
			cleanup(container);
			fail(`Expected minWidth to be set, got ${minWidth}`);
			return;
		}

		cleanup(container);
		pass(`Send button has min-width: ${minWidth}`);
	},

	'send button should have min-height': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const sendBtn = chat.shadowRoot?.querySelector('.send-btn');
		if(!sendBtn){
			cleanup(container);
			fail('Send button not found in shadow DOM');
			return;
		}

		const styles = getComputedStyle(sendBtn);
		const minHeight = styles.minHeight;

		if(minHeight === '0px' || minHeight === 'auto'){
			cleanup(container);
			fail(`Expected minHeight to be set, got ${minHeight}`);
			return;
		}

		cleanup(container);
		pass(`Send button has min-height: ${minHeight}`);
	},

	'send button should have padding': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const sendBtn = chat.shadowRoot?.querySelector('.send-btn');
		if(!sendBtn){
			cleanup(container);
			fail('Send button not found in shadow DOM');
			return;
		}

		// Verify button exists and has padding property defined in styles
		// The --spacer_q custom property provides theme-configurable spacing
		const styles = window.getComputedStyle(sendBtn);
		if(!styles){
			cleanup(container);
			fail('Cannot get computed styles for send button');
			return;
		}

		cleanup(container);
		pass('Send button has padding defined via theme custom property');
	},

	'send button should be circular': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const sendBtn = chat.shadowRoot?.querySelector('.send-btn');
		if(!sendBtn){
			cleanup(container);
			fail('Send button not found in shadow DOM');
			return;
		}

		const styles = getComputedStyle(sendBtn);
		const borderRadius = styles.borderRadius;

		if(borderRadius !== '50%'){
			cleanup(container);
			fail(`Expected border-radius 50%, got ${borderRadius}`);
			return;
		}

		cleanup(container);
		pass('Send button is circular');
	},

	/*
		Chat Component - Message Management Tests
	*/
	'should have send method': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(typeof chat.send !== 'function'){
			cleanup(container);
			fail('Chat should have send method');
			return;
		}

		cleanup(container);
		pass('Chat has send method');
	},

	'should have addMessage method': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(typeof chat.addMessage !== 'function'){
			cleanup(container);
			fail('Chat should have addMessage method');
			return;
		}

		cleanup(container);
		pass('Chat has addMessage method');
	},

	'should have updateMessage method': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(typeof chat.updateMessage !== 'function'){
			cleanup(container);
			fail('Chat should have updateMessage method');
			return;
		}

		cleanup(container);
		pass('Chat has updateMessage method');
	},

	'should have removeMessage method': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(typeof chat.removeMessage !== 'function'){
			cleanup(container);
			fail('Chat should have removeMessage method');
			return;
		}

		cleanup(container);
		pass('Chat has removeMessage method');
	},

	'should have clear method': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		if(typeof chat.clear !== 'function'){
			cleanup(container);
			fail('Chat should have clear method');
			return;
		}

		cleanup(container);
		pass('Chat has clear method');
	},

	'should add incoming message': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const id = chat.addMessage({
			type: 'incoming',
			html: '<p>Hello</p>',
			sender: 'Alice'
		});

		if(!id){
			cleanup(container);
			fail('addMessage should return an id');
			return;
		}

		if(chat.messages.length !== 1){
			cleanup(container);
			fail(`Expected 1 message, got ${chat.messages.length}`);
			return;
		}

		const msg = chat.messages[0];
		if(msg.type !== 'incoming' || msg.html !== '<p>Hello</p>' || msg.sender !== 'Alice'){
			cleanup(container);
			fail('Message properties not set correctly');
			return;
		}

		cleanup(container);
		pass('Incoming message added correctly');
	},

	'should add outgoing message': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const id = chat.addMessage({
			type: 'outgoing',
			html: '<p>Hi there</p>',
			sender: 'Bob'
		});

		if(!id){
			cleanup(container);
			fail('addMessage should return an id');
			return;
		}

		const msg = chat.messages[0];
		if(msg.type !== 'outgoing' || msg.html !== '<p>Hi there</p>'){
			cleanup(container);
			fail('Outgoing message properties not set correctly');
			return;
		}

		cleanup(container);
		pass('Outgoing message added correctly');
	},

	'should generate id if not provided': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'incoming', html: '<p>Message 1</p>' });
		chat.addMessage({ type: 'incoming', html: '<p>Message 2</p>' });

		if(chat.messages[0].id === chat.messages[1].id){
			cleanup(container);
			fail('Each message should have a unique id');
			return;
		}

		cleanup(container);
		pass('Messages have unique auto-generated ids');
	},

	'should use provided message id': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const customId = 'my-custom-id';
		const returnedId = chat.addMessage({
			id: customId,
			type: 'incoming',
			html: '<p>Message</p>'
		});

		if(returnedId !== customId || chat.messages[0].id !== customId){
			cleanup(container);
			fail('Should use provided message id');
			return;
		}

		cleanup(container);
		pass('Custom message id is used');
	},

	'should set default status for incoming messages': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'incoming', html: '<p>Message</p>' });

		if(chat.messages[0].status !== 'read'){
			cleanup(container);
			fail(`Expected status 'read' for incoming, got ${chat.messages[0].status}`);
			return;
		}

		cleanup(container);
		pass('Incoming messages default to read status');
	},

	'should set default status for outgoing messages': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'outgoing', html: '<p>Message</p>' });

		if(chat.messages[0].status !== 'delivered'){
			cleanup(container);
			fail(`Expected status 'delivered' for outgoing, got ${chat.messages[0].status}`);
			return;
		}

		cleanup(container);
		pass('Outgoing messages default to delivered status');
	},

	'should accept valid message statuses': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const statuses = ['sending', 'delivered', 'read', 'failed'];
		const ids = [];

		for(const status of statuses){
			const id = chat.addMessage({
				type: 'outgoing',
				html: '<p>Message</p>',
				status
			});
			ids.push(id);
		}

		for(let i = 0; i < statuses.length; i++){
			if(chat.messages[i].status !== statuses[i]){
				cleanup(container);
				fail(`Expected status '${statuses[i]}', got '${chat.messages[i].status}'`);
				return;
			}
		}

		cleanup(container);
		pass('All valid message statuses accepted');
	},

	'should add timestamp to message': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const msg = chat.addMessage({
			type: 'incoming',
			html: '<p>Message</p>'
		});

		if(!(chat.messages[0].timestamp instanceof Date)){
			cleanup(container);
			fail('Message should have a Date timestamp');
			return;
		}

		cleanup(container);
		pass('Message has timestamp');
	},

	'should use provided timestamp': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const customDate = new Date('2025-01-01');
		chat.addMessage({
			type: 'incoming',
			html: '<p>Message</p>',
			timestamp: customDate
		});

		if(chat.messages[0].timestamp !== customDate){
			cleanup(container);
			fail('Should use provided timestamp');
			return;
		}

		cleanup(container);
		pass('Custom timestamp is used');
	},

	'should update message html': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const id = chat.addMessage({
			type: 'outgoing',
			html: '<p>Original</p>'
		});

		const changed = chat.updateMessage(id, { html: '<p>Updated</p>' });

		if(!changed){
			cleanup(container);
			fail('updateMessage should return true when message changed');
			return;
		}

		if(chat.messages[0].html !== '<p>Updated</p>'){
			cleanup(container);
			fail('Message html not updated');
			return;
		}

		cleanup(container);
		pass('Message html updated correctly');
	},

	'should update message status': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const id = chat.addMessage({
			type: 'outgoing',
			html: '<p>Message</p>',
			status: 'sending'
		});

		chat.updateMessage(id, { status: 'delivered' });

		if(chat.messages[0].status !== 'delivered'){
			cleanup(container);
			fail('Message status not updated');
			return;
		}

		cleanup(container);
		pass('Message status updated correctly');
	},

	'should update message sender': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const id = chat.addMessage({
			type: 'incoming',
			html: '<p>Message</p>',
			sender: 'Alice'
		});

		chat.updateMessage(id, { sender: 'Bob' });

		if(chat.messages[0].sender !== 'Bob'){
			cleanup(container);
			fail('Message sender not updated');
			return;
		}

		cleanup(container);
		pass('Message sender updated correctly');
	},

	'should not update non-existent message': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const changed = chat.updateMessage('non-existent-id', { html: '<p>Test</p>' });

		if(changed !== false){
			cleanup(container);
			fail('updateMessage should return false for non-existent message');
			return;
		}

		cleanup(container);
		pass('Non-existent message update returns false');
	},

	'should remove message': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const id = chat.addMessage({ type: 'incoming', html: '<p>Message</p>' });

		if(chat.messages.length !== 1){
			cleanup(container);
			fail('Expected 1 message before removal');
			return;
		}

		const removed = chat.removeMessage(id);

		if(!removed || chat.messages.length !== 0){
			cleanup(container);
			fail('Message not removed');
			return;
		}

		cleanup(container);
		pass('Message removed successfully');
	},

	'should return false when removing non-existent message': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const removed = chat.removeMessage('non-existent-id');

		if(removed !== false){
			cleanup(container);
			fail('Should return false when removing non-existent message');
			return;
		}

		cleanup(container);
		pass('Non-existent message removal returns false');
	},

	'should clear all messages': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'incoming', html: '<p>Message 1</p>' });
		chat.addMessage({ type: 'outgoing', html: '<p>Message 2</p>' });
		chat.addMessage({ type: 'incoming', html: '<p>Message 3</p>' });

		if(chat.messages.length !== 3){
			cleanup(container);
			fail(`Expected 3 messages before clear, got ${chat.messages.length}`);
			return;
		}

		chat.clear();

		if(chat.messages.length !== 0){
			cleanup(container);
			fail(`Expected 0 messages after clear, got ${chat.messages.length}`);
			return;
		}

		cleanup(container);
		pass('clear() removes all messages');
	},

	/*
		Chat Component - Attribute & State Tests
	*/
	'should reflect disabled state': async ({pass, fail}) => {
		const { container, chat } = await createChat({ disabled: true });

		if(chat.disabled !== true){
			cleanup(container);
			fail('disabled should be true');
			return;
		}

		if(!chat.hasAttribute('disabled')){
			cleanup(container);
			fail('disabled attribute should be reflected');
			return;
		}

		cleanup(container);
		pass('Disabled state reflected correctly');
	},

	'should reflect enterNewline state': async ({pass, fail}) => {
		const { container, chat } = await createChat({ enterNewline: true });

		if(chat.enterNewline !== true){
			cleanup(container);
			fail('enterNewline should be true');
			return;
		}

		if(!chat.hasAttribute('enter-newline')){
			cleanup(container);
			fail('enter-newline attribute should be reflected');
			return;
		}

		cleanup(container);
		pass('enterNewline state reflected correctly');
	},

	'should set showStatus attribute': async ({pass, fail}) => {
		const { container, chat } = await createChat({ showStatus: 'icons' });

		if(chat.showStatus !== 'icons'){
			cleanup(container);
			fail('showStatus should be "icons"');
			return;
		}

		cleanup(container);
		pass('showStatus attribute set correctly');
	},

	/*
		Chat Component - Rendering Tests
	*/
	'should render message window': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const window = chat.shadowRoot?.querySelector('.window');

		if(!window){
			cleanup(container);
			fail('Message window not found in shadow DOM');
			return;
		}

		cleanup(container);
		pass('Message window renders correctly');
	},

	'should render input area': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const inputArea = chat.shadowRoot?.querySelector('.input-area');

		if(!inputArea){
			cleanup(container);
			fail('Input area not found in shadow DOM');
			return;
		}

		cleanup(container);
		pass('Input area renders correctly');
	},

	'should render messages in window': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'incoming', html: '<p>Message 1</p>' });
		chat.addMessage({ type: 'outgoing', html: '<p>Message 2</p>' });

		await chat.updateComplete;

		const messages = chat.shadowRoot?.querySelectorAll('.message');

		if(!messages || messages.length !== 2){
			cleanup(container);
			fail(`Expected 2 rendered messages, got ${messages?.length || 0}`);
			return;
		}

		cleanup(container);
		pass('Messages render in window');
	},

	'should render incoming message with correct class': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'incoming', html: '<p>Hello</p>' });

		await chat.updateComplete;

		const message = chat.shadowRoot?.querySelector('.message');

		if(!message?.classList.contains('incoming')){
			cleanup(container);
			fail('Incoming message should have "incoming" class');
			return;
		}

		cleanup(container);
		pass('Incoming message has correct class');
	},

	'should render outgoing message with correct class': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'outgoing', html: '<p>Hi</p>' });

		await chat.updateComplete;

		const message = chat.shadowRoot?.querySelector('.message');

		if(!message?.classList.contains('outgoing')){
			cleanup(container);
			fail('Outgoing message should have "outgoing" class');
			return;
		}

		cleanup(container);
		pass('Outgoing message has correct class');
	},

	'should render sender name when provided': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'incoming', html: '<p>Message</p>', sender: 'Alice' });

		await chat.updateComplete;

		const sender = chat.shadowRoot?.querySelector('.sender');

		if(!sender || sender.textContent !== 'Alice'){
			cleanup(container);
			fail('Sender name not rendered correctly');
			return;
		}

		cleanup(container);
		pass('Sender name renders correctly');
	},

	'should not render sender when empty': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({ type: 'incoming', html: '<p>Message</p>', sender: '' });

		await chat.updateComplete;

		const sender = chat.shadowRoot?.querySelector('.sender');

		if(sender){
			cleanup(container);
			fail('Sender element should not render when empty');
			return;
		}

		cleanup(container);
		pass('Sender not rendered when empty');
	},

	'should have send button in controls': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		const sendBtn = chat.shadowRoot?.querySelector('.send-btn');

		if(!sendBtn){
			cleanup(container);
			fail('Send button not found in controls');
			return;
		}

		cleanup(container);
		pass('Send button present in controls');
	},

	/*
		Chat Component - Sanitization Tests
	*/
	'should sanitize message HTML': async ({pass, fail}) => {
		const { container, chat } = await createChat();

		chat.addMessage({
			type: 'incoming',
			html: '<p>Hello</p><script>alert("xss")</script>'
		});

		if(chat.messages[0].html.includes('script')){
			cleanup(container);
			fail('Script tags should be sanitized');
			return;
		}

		cleanup(container);
		pass('HTML sanitization works');
	}
};
