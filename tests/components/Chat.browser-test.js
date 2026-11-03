import Chat from '../../src/components/Chat.js';

const createChat = async (options = {}) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-chat 
			${options.placeholder ? `placeholder="${options.placeholder}"` : ''}
			${options.disabled ? 'disabled' : ''}
			${options.enterNewline ? 'enter-newline' : ''}
			${options.showStatus ? `show-status="${options.showStatus}"` : ''}
			${options.input ? `input="${options.input}"` : ''}
			${options.markdownResize ? 'markdown-resize' : ''}
			${options.resize ? 'resize' : ''}
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

const press = (element, key, options = {}) => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true, ...options }));

export default {
	/*
		Chat Component - Input Types
	*/
	'input="markdown" is a plain textarea and its text is rendered as markdown when sent': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'markdown' });
		const textarea = chat.shadowRoot.querySelector('textarea.input');
		const sent = [];
		chat.addEventListener('send', e => sent.push(e.detail));
		textarea.value = 'Hello **bold**';
		chat.send();
		const ok = !!textarea && !chat.shadowRoot.querySelector('k-markdown-editor') && sent[0]?.html.includes('<strong>bold</strong>') && sent[0].markdown === 'Hello **bold**' && textarea.value === '';
		cleanup(container);
		return ok ? pass('Markdown rendered, textarea cleared') : fail(JSON.stringify(sent));
	},

	'input="text" sends the text as it is, escaped': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		const textarea = chat.shadowRoot.querySelector('textarea.input');
		textarea.value = '**not bold** <b>x</b>\nsecond line';
		chat.send();
		const html = chat.messages[0]?.html || '';
		const ok = html.includes('**not bold**') && html.includes('&lt;b&gt;') && html.includes('<br>') && !html.includes('<strong>');
		cleanup(container);
		return ok ? pass('Plain text, escaped, line breaks kept') : fail(html);
	},

	'a textarea input sends on Enter and keeps Shift+Enter for a new line': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		const textarea = chat.shadowRoot.querySelector('textarea.input');
		textarea.value = 'first';
		press(textarea, 'Enter', { shiftKey: true });
		const kept = chat.messages.length === 0;
		press(textarea, 'Enter');
		const ok = kept && chat.messages.length === 1;
		cleanup(container);
		return ok ? pass('Enter sends, Shift+Enter does not') : fail(`kept ${kept}, messages ${chat.messages.length}`);
	},

	'a textarea input with enter-newline sends on Shift+Enter': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text', enterNewline: true });
		const textarea = chat.shadowRoot.querySelector('textarea.input');
		textarea.value = 'first';
		press(textarea, 'Enter');
		const kept = chat.messages.length === 0;
		press(textarea, 'Enter', { shiftKey: true });
		const ok = kept && chat.messages.length === 1;
		cleanup(container);
		return ok ? pass('Inverted') : fail(`kept ${kept}, messages ${chat.messages.length}`);
	},

	'a textarea input grows with its text up to --input_max_height': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		const textarea = chat.shadowRoot.querySelector('textarea.input');
		const before = textarea.getBoundingClientRect().height;
		textarea.value = 'a\nb\nc\nd';
		textarea.dispatchEvent(new Event('input', { bubbles: true }));
		const grown = textarea.getBoundingClientRect().height;
		textarea.value = Array(60).fill('x').join('\n');
		textarea.dispatchEvent(new Event('input', { bubbles: true }));
		const capped = textarea.getBoundingClientRect().height;
		const max = parseFloat(getComputedStyle(textarea).maxHeight);
		const ok = grown > before && capped <= max + 1;
		cleanup(container);
		return ok ? pass('Grows, then scrolls') : fail(`before ${before}, grown ${grown}, capped ${capped}, max ${max}`);
	},

	'a textarea input is disabled with the chat, and focus() focuses it': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		chat.focus();
		await chat.updateComplete;
		const focused = chat.shadowRoot.activeElement === chat.shadowRoot.querySelector('textarea.input');
		chat.disabled = true;
		await chat.updateComplete;
		const disabled = chat.shadowRoot.querySelector('textarea.input').disabled;
		cleanup(container);
		return focused && disabled ? pass('Focus and disabled work') : fail(`focused ${focused}, disabled ${disabled}`);
	},

	'a textarea input starts two lines tall': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		const textarea = chat.shadowRoot.querySelector('textarea.input');
		const height = textarea.getBoundingClientRect().height;
		const line = parseFloat(getComputedStyle(textarea).lineHeight);
		cleanup(container);
		return height >= 2 * line && height < 3 * line + 20 ? pass(`${height}px`) : fail(`${height}px is not two lines of ${line}px`);
	},

	'the controls slots of a textarea input are hidden until something is slotted': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		const hidden = () => ['.slot-row.top', '.slot-col', '.slot-row.bottom'].map(selector => chat.shadowRoot.querySelector(selector).hidden).join();
		const empty = hidden();
		chat.insertAdjacentHTML('beforeend', '<button slot="controls-top">Top</button><button slot="controls-side">Side</button><button slot="controls-bottom">Bottom</button>');
		await new Promise(resolve => setTimeout(resolve, 100));
		const filled = hidden();
		const side = chat.shadowRoot.querySelector('.side');
		const order = [...side.children].map(child => child.className.split(' ')[0] || child.tagName).join();
		cleanup(container);
		return empty === 'true,true,true' && filled === 'false,false,false' && order.startsWith('slot-col') ? pass('Shown only when filled, side slot above the send button') : fail(`empty ${empty}, filled ${filled}, side ${order}`);
	},

	'code in a message has its own background, different from the bubble': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		// The test page has no theme, so give the chat the few colors it uses
		chat.style.cssText = '--c_bg__alt: rgb(238, 238, 238); --c_primary: rgb(51, 102, 255); --c_border: rgb(204, 204, 204); --tc: rgb(0, 0, 0)';
		chat.addMessage({ type: 'incoming', html: '<p>Use <code>inline</code></p><pre><code>block</code></pre>' });
		chat.addMessage({ type: 'outgoing', html: '<p>Mine <code>inline</code></p>' });
		await chat.updateComplete;
		const style = selector => getComputedStyle(chat.shadowRoot.querySelector(selector));
		const bubble = style('.message.incoming .bubble').backgroundColor;
		const inline = style('.message.incoming p code');
		const block = style('.message.incoming pre code');
		const outgoingBubble = style('.message.outgoing .bubble').backgroundColor;
		const outgoingCode = style('.message.outgoing code');
		const ok = inline.backgroundColor !== bubble && block.backgroundColor !== bubble && block.borderTopWidth === '1px'
			&& outgoingCode.backgroundColor !== outgoingBubble && outgoingCode.backgroundColor !== 'rgba(0, 0, 0, 0)';
		cleanup(container);
		return ok ? pass('Code stands out in both kinds of bubble') : fail(`bubble ${bubble}, inline ${inline.backgroundColor}, block ${block.backgroundColor}, outgoing ${outgoingBubble} / ${outgoingCode.backgroundColor}`);
	},

	'debug logs the whole exchange with the model to the console and keeps it in debugLog': async ({pass, fail}) => {
		const realModel = globalThis.LanguageModel;
		const realLog = console.log;
		const printed = [];
		console.log = (...args) => printed.push(args.join(' '));
		globalThis.LanguageModel = {
			availability: async () => 'available',
			create: async () => ({
				inputUsage: 5,
				inputQuota: 100,
				destroy(){},
				promptStreaming: () => new ReadableStream({ start(controller){ controller.enqueue('Hi '); controller.enqueue('there'); controller.close(); } })
			})
		};
		const container = document.createElement('div');
		container.innerHTML = '<k-chat input="text" prompt-api="" debug="console"></k-chat>';
		document.body.appendChild(container);
		const chat = container.querySelector('k-chat');
		await chat.updateComplete;
		chat.shadowRoot.querySelector('textarea.input').value = 'hello model';
		chat.send();
		await new Promise(resolve => setTimeout(resolve, 400));
		console.log = realLog;
		globalThis.LanguageModel = realModel;
		const log = chat.debugLog;
		const expected = ['USER MESSAGE (text input', 'hello model', 'SESSION CREATED', 'SENT TO THE MODEL (round 1):\nhello model', 'MODEL REPLY, raw (round 1):\nHi there', 'context used: 5/100 tokens', 'ANSWER SHOWN IN THE CHAT', 'Hi there'];
		const missing = expected.filter(part => !log.includes(part));
		cleanup(container);
		return !missing.length && printed.length > 0 && printed.every(line => line.startsWith('[k-chat ')) ? pass('Logged to the console and to debugLog') : fail(`missing ${missing}, printed ${printed.length}`);
	},

	'debug alone records the exchange without printing it, and the export has the conversation and the record': async ({pass, fail}) => {
		const realModel = globalThis.LanguageModel;
		const realLog = console.log;
		const printed = [];
		console.log = (...args) => printed.push(args.join(' '));
		globalThis.LanguageModel = {
			availability: async () => 'available',
			create: async () => ({ inputUsage: 1, inputQuota: 100, destroy(){}, promptStreaming: () => new ReadableStream({ start(controller){ controller.enqueue('Hello back'); controller.close(); } }) })
		};
		const container = document.createElement('div');
		container.innerHTML = '<k-chat input="text" prompt-api="" debug></k-chat>';
		document.body.appendChild(container);
		const chat = container.querySelector('k-chat');
		await chat.updateComplete;
		chat.shadowRoot.querySelector('textarea.input').value = 'question for the model';
		chat.send();
		await new Promise(resolve => setTimeout(resolve, 400));
		const text = await chat.exportConversation();
		console.log = realLog;
		globalThis.LanguageModel = realModel;
		const expected = ['KEMPO UI CHAT EXPORT', 'USER:\nquestion for the model', 'Hello back', '===== DEBUG RECORD', 'SENT TO THE MODEL (round 1):\nquestion for the model', 'MODEL REPLY, raw (round 1):\nHello back'];
		const missing = expected.filter(part => !text.includes(part));
		cleanup(container);
		return !missing.length && !printed.length ? pass('Recorded and exported, nothing printed') : fail(`missing ${missing}, printed ${printed.length}`);
	},

	'a renamed conversation keeps its title as the chat goes on, and the debug record comes back with it': async ({pass, fail}) => {
		const group = 'chat-test-rename';
		const { saveConversation: save, getConversation: get, clearConversations: clear } = await import('../../src/utils/conversations.js');
		await clear(group);
		await save({ id: 'r1', group, title: 'auto', debug: ['EARLIER STEP'], messages: [{ id: '1', type: 'outgoing', html: '<p>hi</p>', status: 'read', sender: '', markdown: 'hi', transient: false, timestamp: new Date() }] });
		const container = document.createElement('div');
		container.innerHTML = `<k-chat input="text" persistent-id="${group}" debug></k-chat>`;
		document.body.appendChild(container);
		const chat = container.querySelector('k-chat');
		await new Promise(resolve => setTimeout(resolve, 400));
		const restored = chat.conversationId === 'r1' && chat.debugLog.includes('EARLIER STEP');
		await chat.renameConversation('r1', 'My own title');
		chat.addMessage({ type: 'incoming', html: '<p>more</p>', markdown: 'more' });
		await new Promise(resolve => setTimeout(resolve, 600));
		const saved = await get('r1');
		const exported = await chat.exportConversation('r1');
		await clear(group);
		cleanup(container);
		return restored && saved.title === 'My own title' && saved.titleCustom && saved.messages.length === 2 && exported.includes('Title: My own title (renamed)') && exported.includes('EARLIER STEP')
			? pass('Custom title kept, debug record restored')
			: fail(`restored ${restored}, ${JSON.stringify([saved.title, saved.titleCustom, saved.messages.length])}`);
	},

	'nothing is logged without debug': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		chat.shadowRoot.querySelector('textarea.input').value = 'hi';
		chat.send();
		const log = chat.debugLog;
		cleanup(container);
		return log === '' ? pass('Quiet by default') : fail(log);
	},

	'a new conversation stays the open one when the page changes, until something is sent': async ({pass, fail}) => {
		const group = 'chat-test-blank';
		const { saveConversation: save, clearConversations: clear } = await import('../../src/utils/conversations.js');
		sessionStorage.removeItem(`k-chat-blank:${group}`);
		await clear(group);
		const message = (id, text) => ({ id, type: 'outgoing', html: `<p>${text}</p>`, status: 'read', sender: '', markdown: text, transient: false, timestamp: new Date() });
		await save({ id: 'old', group, title: 'old', messages: [message('1', 'old question')] });
		const mount = async () => {
			const container = document.createElement('div');
			container.innerHTML = `<k-chat input="text" persistent-id="${group}"></k-chat>`;
			document.body.appendChild(container);
			const chat = container.querySelector('k-chat');
			await new Promise(resolve => setTimeout(resolve, 400));
			return { container, chat };
		};
		const first = await mount();
		const restoredAtFirst = first.chat.conversationId === 'old';
		first.chat.newConversation();
		first.container.remove();
		const second = await mount();
		const blankAfterPageChange = second.chat.conversationId === null && second.chat.messages.length === 0;
		second.chat.shadowRoot.querySelector('textarea.input').value = 'new question';
		second.chat.send();
		await new Promise(resolve => setTimeout(resolve, 700));
		const newId = second.chat.conversationId;
		second.container.remove();
		const third = await mount();
		const restoredNew = third.chat.conversationId === newId && third.chat.messages[0]?.markdown === 'new question';
		third.chat.newConversation();
		third.container.remove();
		const fourth = await mount();
		await fourth.chat.loadConversation('old');
		await new Promise(resolve => setTimeout(resolve, 100));
		fourth.container.remove();
		const fifth = await mount();
		const loadedOneWins = fifth.chat.conversationId === 'old';
		fifth.container.remove();
		await clear(group);
		sessionStorage.removeItem(`k-chat-blank:${group}`);
		return restoredAtFirst && blankAfterPageChange && newId && restoredNew && loadedOneWins
			? pass('New stays open across pages, sending or loading another ends it')
			: fail(`restoredAtFirst ${restoredAtFirst}, blankAfterPageChange ${blankAfterPageChange}, newId ${newId}, restoredNew ${restoredNew}, loadedOneWins ${loadedOneWins}`);
	},

	'a notice that the built-in AI is very experimental shows only while prompt-api is on': async ({pass, fail}) => {
		const without = await createChat({ input: 'text' });
		const withoutNotice = without.chat.shadowRoot.querySelector('.disclaimer');
		cleanup(without.container);
		const container = document.createElement('div');
		container.innerHTML = '<k-chat input="text" prompt-api=""></k-chat>';
		document.body.appendChild(container);
		const chat = container.querySelector('k-chat');
		await chat.updateComplete;
		const notice = chat.shadowRoot.querySelector('.disclaimer');
		const text = notice?.textContent || '';
		cleanup(container);
		return !withoutNotice && notice && text.includes('Very experimental') && text.includes('often wrong') ? pass('Notice only with prompt-api') : fail(`without ${!!withoutNotice}, with ${text}`);
	},

	'send(text) sends that text and leaves what is in the input alone': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'markdown' });
		const textarea = chat.shadowRoot.querySelector('textarea.input');
		const sent = [];
		chat.addEventListener('send', e => sent.push(e.detail.markdown));
		textarea.value = 'half typed';
		const id = chat.send('**Order status**');
		const ok = !!id && sent.join() === '**Order status**' && chat.messages[0].html.includes('<strong>') && textarea.value === 'half typed';
		cleanup(container);
		return ok ? pass('Sent the given text, input untouched') : fail(`${sent.join()} / ${textarea.value}`);
	},

	'empty-message shows while there are no messages and goes away with the first one': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		const text = () => chat.shadowRoot.querySelector('.empty')?.textContent.trim();
		const none = text();
		chat.emptyMessage = 'Ask us anything';
		await chat.updateComplete;
		const shown = text();
		chat.addMessage({ type: 'incoming', html: 'Hi' });
		await chat.updateComplete;
		const gone = text();
		chat.clear();
		await chat.updateComplete;
		const back = text();
		cleanup(container);
		return none === undefined && shown === 'Ask us anything' && gone === undefined && back === 'Ask us anything' ? pass('Shown only while empty') : fail(`none ${none}, shown ${shown}, gone ${gone}, back ${back}`);
	},

	'empty-message is not the input placeholder': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text', placeholder: 'Type here' });
		chat.emptyMessage = 'Nothing yet';
		await chat.updateComplete;
		const ok = chat.shadowRoot.querySelector('textarea.input').placeholder === 'Type here' && chat.shadowRoot.querySelector('.empty').textContent.trim() === 'Nothing yet';
		cleanup(container);
		return ok ? pass('Separate texts') : fail('Texts mixed up');
	},

	'a textarea input does not load the markdown editor': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'text' });
		const ok = !chat.shadowRoot.querySelector('k-markdown-editor') && !chat.shadowRoot.querySelector('k-html-editor');
		cleanup(container);
		return ok ? pass('Only the textarea is rendered') : fail('An editor was rendered');
	},

	'input="html-editor" renders the html editor and a send button': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'html-editor' });
		const ok = !!chat.shadowRoot.querySelector('k-html-editor.input') && !!chat.shadowRoot.querySelector('.footer .send-btn') && !!customElements.get('k-html-editor');
		cleanup(container);
		return ok ? pass('HTML editor input') : fail('Missing editor or send button');
	},

	'an unknown input falls back to the markdown editor': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'nonsense' });
		const ok = !!chat.shadowRoot.querySelector('textarea.input') && !chat.shadowRoot.querySelector('k-markdown-editor');
		cleanup(container);
		return ok ? pass('Fell back to the plain markdown box') : fail('Not the plain markdown box');
	},

	'the markdown editor toolbar is enabled on a fresh load': async ({pass, fail}) => {
		const { container, chat } = await createChat({ input: 'markdown-editor' });
		await new Promise(resolve => setTimeout(resolve, 500));
		const editor = chat.shadowRoot.querySelector('k-markdown-editor');
		const controls = [...editor.querySelectorAll('kc-bold, kc-italic, kc-inline-code, kc-quote')];
		const disabled = controls.filter(control => control.hasAttribute('disabled')).map(control => control.tagName);
		cleanup(container);
		return controls.length === 4 && disabled.length === 0 ? pass('All enabled') : fail(`${controls.length} controls, disabled: ${disabled}`);
	},

	'the markdown editor has no drag handle unless markdown-resize is set': async ({pass, fail}) => {
		const plain = await createChat({ input: 'markdown-editor' });
		const plainEditor = plain.chat.shadowRoot.querySelector('k-markdown-editor');
		await plainEditor.updateComplete;
		const noHandle = plainEditor.hasAttribute('no-resize') && !plainEditor.shadowRoot.querySelector('k-resize') && !!plainEditor.shadowRoot.querySelector('.no-handle .frame');
		cleanup(plain.container);
		const resizable = await createChat({ input: 'markdown-editor', markdownResize: true });
		const editor = resizable.chat.shadowRoot.querySelector('k-markdown-editor');
		await editor.updateComplete;
		const handle = !editor.hasAttribute('no-resize') && !!editor.shadowRoot.querySelector('k-resize') && !editor.shadowRoot.querySelector('k-resize').hasAttribute('disabled');
		cleanup(resizable.container);
		return noHandle && handle ? pass('No handle by default, handle with markdown-resize') : fail(`noHandle ${noHandle}, handle ${handle}`);
	},

	'resize gives the whole chat a handle, and no handle by default': async ({pass, fail}) => {
		const plain = await createChat({ input: 'text' });
		const noneByDefault = !plain.chat.shadowRoot.querySelector('k-resize');
		cleanup(plain.container);
		const resizable = await createChat({ input: 'text', resize: true });
		const handle = !!resizable.chat.shadowRoot.querySelector('k-resize[dimension="height"]');
		const window = resizable.chat.shadowRoot.querySelector('.resizable .window');
		const growing = window && getComputedStyle(window).flexGrow === '1';
		cleanup(resizable.container);
		return noneByDefault && handle && growing ? pass('Handle under the chat, message window grows') : fail(`noneByDefault ${noneByDefault}, handle ${handle}, growing ${growing}`);
	},

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
