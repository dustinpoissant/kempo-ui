import ChatBubble from '../../src/components/ChatBubble.js';
import { saveConversation, getConversation, clearConversations } from '../../src/utils/conversations.js';
import renderMarkdown from '../../src/utils/renderMarkdown.js';

/*
  Test Helpers
*/

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const createBubble = async (attributes = '') => {
  const container = document.createElement('div');
  container.innerHTML = `<k-chat-bubble ${attributes}></k-chat-bubble>`;
  document.body.appendChild(container);
  const bubble = container.querySelector('k-chat-bubble');
  await bubble.updateComplete;
  return { container, bubble };
};

const icon = bubble => bubble.shadowRoot.querySelector('.fab k-icon').getAttribute('name');

// A chat saves a moment after its messages change, so wait for that before clearing.
export const afterEach = async () => {
  await wait(450);
  await clearConversations('chat-bubble-test');
  sessionStorage.removeItem('k-chat-bubble:chat-bubble-test');
};

/*
  Tests
*/

export default {
  'creates a closed, round, bottom right button': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    const fab = bubble.shadowRoot.querySelector('.fab');
    const ok = bubble instanceof ChatBubble && !bubble.open && bubble.position === 'bottom right'
      && getComputedStyle(fab).borderRadius === '50%' && icon(bubble) === 'chat_bubble';
    container.remove();
    return ok ? pass('Closed round button with the chat bubble icon') : fail('Wrong initial state');
  },

  'exposes the chat inside': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    const ok = bubble.chat?.tagName === 'K-CHAT';
    container.remove();
    return ok ? pass('bubble.chat is the k-chat') : fail('No chat');
  },

  'clicking the button opens the chat and shows a down chevron': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    const events = [];
    bubble.addEventListener('open', () => events.push('open'));
    bubble.shadowRoot.querySelector('.fab').click();
    await bubble.updateComplete;
    const chevron = bubble.shadowRoot.querySelector('.fab k-icon');
    const ok = bubble.open && icon(bubble) === 'chevron' && chevron.getAttribute('direction') === 'down' && events.join() === 'open';
    container.remove();
    return ok ? pass('Opened with a down chevron') : fail(`open ${bubble.open}, icon ${icon(bubble)}, events ${events}`);
  },

  'the header only shows with a heading, top controls, or the conversation icons': async ({pass, fail}) => {
    const plain = await createBubble();
    const titled = await createBubble('heading="Support"');
    const saved = await createBubble('persistent-id="chat-bubble-test"');
    const hidden = bubble => bubble.shadowRoot.querySelector('.header').hidden;
    const states = [hidden(plain.bubble), hidden(titled.bubble), hidden(saved.bubble)].join();
    plain.bubble.insertAdjacentHTML('beforeend', '<button slot="controls-top" class="no-btn">X</button>');
    await wait(100);
    const withControl = hidden(plain.bubble);
    const label = plain.bubble.shadowRoot.querySelector('.fab').getAttribute('aria-label');
    [plain, titled, saved].forEach(({ container }) => container.remove());
    return states === 'true,false,false' && !withControl && label === 'Open chat' ? pass('Header only when it has something to show') : fail(`states ${states}, withControl ${withControl}, label ${label}`);
  },

  'allow-fullscreen puts a full screen button in the header, even with nothing else in it': async ({pass, fail}) => {
    const plain = await createBubble();
    const allowed = await createBubble('allow-fullscreen');
    const button = bubble => bubble.shadowRoot.querySelector('.fullscreen-btn');
    const ok = !button(plain.bubble) && !!button(allowed.bubble) && !allowed.bubble.shadowRoot.querySelector('.header').hidden
      && button(allowed.bubble).getAttribute('aria-label') === 'Full screen';
    plain.container.remove();
    allowed.container.remove();
    return ok ? pass('Button only with the attribute') : fail('Wrong button state');
  },

  'full screen fills the window one spacer from its edges, and leaves the button free': async ({pass, fail}) => {
    const bottom = await createBubble('open allow-fullscreen');
    await wait(400);
    bottom.bubble.shadowRoot.querySelector('.fullscreen-btn').click();
    await wait(500);
    const panel = bottom.bubble.shadowRoot.querySelector('.panel').getBoundingClientRect();
    const fab = bottom.bubble.shadowRoot.querySelector('.fab').getBoundingClientRect();
    const near = (a, b) => Math.abs(a - b) <= 1;
    const width = document.documentElement.clientWidth;
    const bottomOk = bottom.bubble.fullscreen && near(panel.left, 16) && near(panel.right, width - 16) && near(panel.top, 16)
      && panel.bottom <= fab.top && !(panel.right > fab.left && panel.left < fab.right && panel.bottom > fab.top);
    const label = bottom.bubble.shadowRoot.querySelector('.fullscreen-btn').getAttribute('aria-label');
    bottom.container.remove();
    const top = await createBubble('open allow-fullscreen position="top left"');
    await wait(400);
    top.bubble.shadowRoot.querySelector('.fullscreen-btn').click();
    await wait(500);
    const topPanel = top.bubble.shadowRoot.querySelector('.panel').getBoundingClientRect();
    const topFab = top.bubble.shadowRoot.querySelector('.fab').getBoundingClientRect();
    const topOk = near(topPanel.left, 16) && near(topPanel.right, width - 16) && topPanel.top >= topFab.bottom && near(topPanel.bottom, document.documentElement.clientHeight - 16);
    top.container.remove();
    return bottomOk && topOk && label === 'Exit full screen' ? pass('Fills the window, button stays free, at the top and the bottom') : fail(`bottom ${bottomOk} (${JSON.stringify(panel)} fab ${JSON.stringify(fab)}), top ${topOk}, label ${label}`);
  },

  'Escape leaves full screen first, then minimizes, and the change is announced': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('open allow-fullscreen');
    const events = [];
    bubble.addEventListener('fullscreen-change', e => events.push(e.detail.fullscreen));
    await wait(300);
    bubble.toggleFullscreen();
    await bubble.updateComplete;
    const press = () => bubble.shadowRoot.querySelector('.panel').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    press();
    await bubble.updateComplete;
    const afterFirst = { open: bubble.open, fullscreen: bubble.fullscreen };
    press();
    await bubble.updateComplete;
    container.remove();
    return afterFirst.open && !afterFirst.fullscreen && !bubble.open && events.join() === 'true,false' ? pass('Two escapes, two steps') : fail(`${JSON.stringify(afterFirst)}, open ${bubble.open}, events ${events}`);
  },

  'full screen is only possible with allow-fullscreen': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('open');
    bubble.toggleFullscreen();
    await bubble.updateComplete;
    const without = bubble.fullscreen;
    bubble.allowFullscreen = true;
    bubble.toggleFullscreen();
    await bubble.updateComplete;
    const withIt = bubble.fullscreen;
    bubble.allowFullscreen = false;
    await bubble.updateComplete;
    await bubble.updateComplete;
    const removed = bubble.fullscreen;
    container.remove();
    return !without && withIt && !removed ? pass('Follows the attribute') : fail(`without ${without}, with ${withIt}, removed ${removed}`);
  },

  'full screen is restored with the open state after a page change': async ({pass, fail}) => {
    const first = await createBubble('allow-fullscreen persistent-id="chat-bubble-test"');
    await wait(300);
    first.bubble.show();
    await wait(200);
    first.bubble.toggleFullscreen();
    await wait(200);
    const stored = sessionStorage.getItem('k-chat-bubble:chat-bubble-test');
    first.container.remove();
    const second = await createBubble('allow-fullscreen persistent-id="chat-bubble-test"');
    await wait(400);
    const restored = second.bubble.open && second.bubble.fullscreen;
    second.container.remove();
    const third = await createBubble('persistent-id="chat-bubble-test"');
    await wait(400);
    const notAllowed = third.bubble.open && !third.bubble.fullscreen;
    third.container.remove();
    return stored === 'full' && restored && notAllowed ? pass('Open and full screen restored when allowed') : fail(`stored ${stored}, restored ${restored}, notAllowed ${notAllowed}`);
  },

  'the collapse chevron points up when the button is at the top': async ({pass, fail}) => {
    const top = await createBubble('open position="top right"');
    const bottom = await createBubble('open');
    const ok = top.bubble.shadowRoot.querySelector('.fab k-icon').getAttribute('direction') === 'up'
      && bottom.bubble.shadowRoot.querySelector('.fab k-icon').getAttribute('direction') === 'down';
    top.container.remove();
    bottom.container.remove();
    return ok ? pass('Up at the top, down at the bottom') : fail('Wrong chevron direction');
  },

  'controls-top is the header bar and the side and bottom slots reach the chat': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    const rows = () => ['.slot-col', '.slot-row.bottom'].map(selector => bubble.chat.shadowRoot.querySelector(selector).hidden);
    const empty = rows().join();
    bubble.insertAdjacentHTML('beforeend', '<button slot="controls-top">Top</button><button slot="controls-side">Side</button><button slot="controls-bottom">Bottom</button>');
    await wait(100);
    const filled = rows().join();
    const header = bubble.shadowRoot.querySelector('.header slot[name="controls-top"]').assignedElements();
    const chatTopRow = bubble.chat.shadowRoot.querySelector('.slot-row.top').hidden;
    container.remove();
    return empty === 'true,true' && filled === 'false,false' && header.length === 1 && chatTopRow
      ? pass('Header, side and bottom slots work')
      : fail(`empty ${empty}, filled ${filled}, header ${header.length}, chat top row hidden ${chatTopRow}`);
  },

  'clicking again minimizes it and Escape does too': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    const events = [];
    bubble.addEventListener('close', () => events.push('close'));
    bubble.show();
    await bubble.updateComplete;
    bubble.shadowRoot.querySelector('.fab').click();
    await bubble.updateComplete;
    const closedByClick = !bubble.open && icon(bubble) === 'chat_bubble';
    bubble.show();
    await bubble.updateComplete;
    bubble.shadowRoot.querySelector('.panel').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await bubble.updateComplete;
    const ok = closedByClick && !bubble.open && events.length === 2;
    container.remove();
    return ok ? pass('Minimized by click and Escape') : fail(`click ${closedByClick}, open ${bubble.open}, events ${events}`);
  },

  'the popup is above a bottom button and below a top button': async ({pass, fail}) => {
    const bottom = await createBubble('open');
    const top = await createBubble('open position="top left"');
    await wait(400);
    const above = bottom.bubble.shadowRoot.querySelector('.panel').getBoundingClientRect().bottom <= bottom.bubble.shadowRoot.querySelector('.fab').getBoundingClientRect().top;
    const below = top.bubble.shadowRoot.querySelector('.panel').getBoundingClientRect().top >= top.bubble.shadowRoot.querySelector('.fab').getBoundingClientRect().bottom;
    const left = Math.abs(top.bubble.shadowRoot.querySelector('.panel').getBoundingClientRect().left - top.bubble.shadowRoot.querySelector('.fab').getBoundingClientRect().left) < 1;
    const right = Math.abs(bottom.bubble.shadowRoot.querySelector('.panel').getBoundingClientRect().right - bottom.bubble.shadowRoot.querySelector('.fab').getBoundingClientRect().right) < 1;
    bottom.container.remove();
    top.container.remove();
    return above && below && left && right ? pass('Popup opens away from the edge and lines up with the button') : fail(`above ${above}, below ${below}, left ${left}, right ${right}`);
  },

  'an incoming message while minimized sets unread and shows the unread icon': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    bubble.chat.addMessage({ type: 'incoming', html: 'Hello' });
    await bubble.updateComplete;
    const fab = bubble.shadowRoot.querySelector('.fab');
    const ok = bubble.unread && icon(bubble) === 'mark_chat_unread' && fab.classList.contains('unread')
      && getComputedStyle(fab).animationName.includes('wiggle') && getComputedStyle(fab).animationName.includes('attention-color');
    container.remove();
    return ok ? pass('Unread, wiggling and pulsing') : fail(`unread ${bubble.unread}, icon ${icon(bubble)}, animation ${getComputedStyle(fab).animationName}`);
  },

  'messages that are not an unread reply do not set unread': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    bubble.chat.addMessage({ type: 'outgoing', html: 'Mine' });
    bubble.chat.addMessage({ type: 'incoming', html: 'Notice', transient: true });
    await bubble.updateComplete;
    const quiet = !bubble.unread;
    bubble.show();
    await bubble.updateComplete;
    bubble.chat.addMessage({ type: 'incoming', html: 'While open' });
    await bubble.updateComplete;
    const ok = quiet && !bubble.unread;
    container.remove();
    return ok ? pass('Only a visible incoming message while minimized counts') : fail(`quiet ${quiet}, unread ${bubble.unread}`);
  },

  'opening clears unread': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('unread');
    await bubble.updateComplete;
    const wasUnread = icon(bubble) === 'mark_chat_unread';
    bubble.show();
    await bubble.updateComplete;
    await bubble.updateComplete;
    const ok = wasUnread && !bubble.unread && icon(bubble) === 'chevron';
    container.remove();
    return ok ? pass('Unread cleared on open') : fail(`wasUnread ${wasUnread}, unread ${bubble.unread}, icon ${icon(bubble)}`);
  },

  'uses a plain textarea by default, without resize handle or tabs': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    const root = bubble.chat.shadowRoot;
    const ok = bubble.chat.input === 'markdown' && !!root.querySelector('textarea.input') && !root.querySelector('k-markdown-editor') && !root.querySelector('k-resize');
    container.remove();
    return ok ? pass('Clean textarea input') : fail(`input ${bubble.chat.input}`);
  },

  'input="markdown-editor" brings the editor and its compact toolbar back': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('input="markdown-editor"');
    await bubble.chat.updateComplete;
    const editor = bubble.chat.shadowRoot.querySelector('k-markdown-editor');
    await editor.updateComplete;
    const ok = !!editor && editor.hasAttribute('no-resize') && bubble.querySelectorAll('kc-bold').length + bubble.shadowRoot.querySelectorAll('kc-bold').length === 1;
    container.remove();
    return ok ? pass('Editor with toolbar and no resize handle') : fail('Missing editor, no-resize or toolbar');
  },

  'empty-message is shown in the popup until there is a message': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('empty-message="Get help from the AI Assistant"');
    await bubble.chat.updateComplete;
    const text = () => bubble.chat.shadowRoot.querySelector('.empty')?.textContent.trim();
    const shown = text();
    bubble.chat.addMessage({ type: 'incoming', html: 'Hello' });
    await bubble.chat.updateComplete;
    const gone = text();
    container.remove();
    return shown === 'Get help from the AI Assistant' && gone === undefined ? pass('Passed to the chat') : fail(`shown ${shown}, gone ${gone}`);
  },

  'forwards the chat events': async ({pass, fail}) => {
    const { container, bubble } = await createBubble();
    const seen = [];
    bubble.addEventListener('send', e => seen.push(e.detail.markdown));
    bubble.addEventListener('message-add', () => seen.push('message-add'));
    const editor = bubble.chat.shadowRoot.querySelector('textarea.input');
    editor.value = 'Hi there';
    bubble.chat.send();
    const ok = seen.includes('Hi there') && seen.includes('message-add');
    container.remove();
    return ok ? pass('send and message-add reached the bubble') : fail(seen.join());
  },

  'passes its attributes to the chat': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('placeholder="Ask us" show-status="icons" enter-newline persistent-id="chat-bubble-test"');
    await bubble.chat.updateComplete;
    const chat = bubble.chat;
    const ok = chat.placeholder === 'Ask us' && chat.showStatus === 'icons' && chat.enterNewline && chat.persistentId === 'chat-bubble-test' && chat.promptApi === null;
    container.remove();
    return ok ? pass('Attributes forwarded') : fail(`${chat.placeholder} ${chat.showStatus} ${chat.enterNewline} ${chat.persistentId} ${chat.promptApi}`);
  },

  'lists saved conversations the first time it opens, and continues one': async ({pass, fail}) => {
    const message = (id, type, text) => ({ id, type, html: `<p>${text}</p>`, status: 'read', sender: '', markdown: text, transient: false, timestamp: new Date() });
    await saveConversation({ id: 'one', group: 'chat-bubble-test', title: 'First', messages: [message('1', 'outgoing', 'First')] });
    await saveConversation({ id: 'two', group: 'chat-bubble-test', title: 'Second', messages: [message('2', 'outgoing', 'Second')] });
    const { container, bubble } = await createBubble('persistent-id="chat-bubble-test"');
    await wait(300);
    bubble.show();
    await wait(300);
    await bubble.updateComplete;
    const rows = bubble.shadowRoot.querySelectorAll('.row');
    const listed = bubble.view === 'conversations' && rows.length === 2;
    const other = [...bubble.shadowRoot.querySelectorAll('.row-main')].find(button => button.dataset.id !== bubble.chat.conversationId);
    other.click();
    await wait(300);
    const ok = listed && bubble.view === 'chat' && bubble.chat.conversationId === other.dataset.id && bubble.chat.messages.length === 1;
    container.remove();
    return ok ? pass('Listed, then continued the chosen one') : fail(`view ${bubble.view}, rows ${rows.length}, id ${bubble.chat.conversationId}`);
  },

  'stays open when the page changes, straight in the chat and without taking the focus': async ({pass, fail}) => {
    const message = (id, text) => ({ id, type: 'outgoing', html: `<p>${text}</p>`, status: 'read', sender: '', markdown: text, transient: false, timestamp: new Date() });
    await saveConversation({ id: 'kept', group: 'chat-bubble-test', title: 'Kept', messages: [message('1', 'Kept')] });
    const first = await createBubble('persistent-id="chat-bubble-test"');
    await wait(300);
    first.bubble.show();
    await wait(300);
    const stored = sessionStorage.getItem('k-chat-bubble:chat-bubble-test');
    first.container.remove();
    const second = await createBubble('persistent-id="chat-bubble-test"');
    await wait(500);
    const reopened = second.bubble.open && second.bubble.view === 'chat' && document.activeElement !== second.bubble;
    second.bubble.hide();
    await wait(100);
    const closedStored = sessionStorage.getItem('k-chat-bubble:chat-bubble-test');
    second.container.remove();
    const third = await createBubble('persistent-id="chat-bubble-test"');
    await wait(300);
    const staysClosed = !third.bubble.open;
    third.container.remove();
    return stored === '1' && reopened && closedStored === '0' && staysClosed ? pass('Open state restored, then closed again') : fail(`stored ${stored}, reopened ${reopened}, closedStored ${closedStored}, staysClosed ${staysClosed}`);
  },

  'each conversation in the list can be renamed, exported and deleted': async ({pass, fail}) => {
    const message = (id, text) => ({ id, type: 'outgoing', html: `<p>${text}</p>`, status: 'read', sender: '', markdown: text, transient: false, timestamp: new Date() });
    await saveConversation({ id: 'p', group: 'chat-bubble-test', title: 'Tabs question', debug: ['SENT TO THE MODEL (round 1):', 'the 3rd tab'], messages: [message('1', 'the 3rd tab')] });
    const { container, bubble } = await createBubble('persistent-id="chat-bubble-test"');
    await wait(300);
    bubble.show();
    await wait(300);
    await bubble.updateComplete;
    const row = bubble.shadowRoot.querySelector('.row');
    const buttons = [...row.querySelectorAll('.row-actions button')].map(button => button.getAttribute('aria-label'));
    const icons = [...row.querySelectorAll('.row-actions k-icon')].map(icon => icon.getAttribute('name'));
    container.remove();
    return buttons.join() === 'Rename conversation,Export conversation,Delete conversation' && icons.join() === 'edit,download,delete'
      ? pass('Rename, export and delete next to each other')
      : fail(`${buttons} / ${icons}`);
  },

  'renaming a conversation in the list saves the new title, and Escape cancels': async ({pass, fail}) => {
    const message = (id, text) => ({ id, type: 'outgoing', html: `<p>${text}</p>`, status: 'read', sender: '', markdown: text, transient: false, timestamp: new Date() });
    await saveConversation({ id: 'n', group: 'chat-bubble-test', title: 'Old name', messages: [message('1', 'Old name')] });
    const { container, bubble } = await createBubble('persistent-id="chat-bubble-test"');
    await wait(300);
    bubble.show();
    await wait(300);
    await bubble.updateComplete;
    bubble.shadowRoot.querySelector('.row-rename').click();
    await wait(100);
    let input = bubble.shadowRoot.querySelector('.rename-input');
    const prefilled = input?.value === 'Old name' && bubble.shadowRoot.activeElement === input;
    input.value = 'Cancelled name';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(100);
    const cancelled = !bubble.shadowRoot.querySelector('.rename-input') && bubble.open && bubble.shadowRoot.querySelector('.row-title').textContent === 'Old name';
    bubble.shadowRoot.querySelector('.row-rename').click();
    await wait(100);
    input = bubble.shadowRoot.querySelector('.rename-input');
    input.value = 'The 3rd tab question';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await wait(400);
    const saved = (await bubble.chat.listConversations())[0];
    const shown = bubble.shadowRoot.querySelector('.row-title').textContent;
    container.remove();
    return prefilled && cancelled && saved.title === 'The 3rd tab question' && saved.titleCustom && shown === 'The 3rd tab question' ? pass('Renamed with Enter, cancelled with Escape') : fail(`prefilled ${prefilled}, cancelled ${cancelled}, ${JSON.stringify(saved)}, shown ${shown}`);
  },

  'the export button downloads a text file with the conversation and the debug record': async ({pass, fail}) => {
    const message = (id, text) => ({ id, type: 'outgoing', html: `<p>${text}</p>`, status: 'read', sender: '', markdown: text, transient: false, timestamp: new Date() });
    await saveConversation({ id: 'e', group: 'chat-bubble-test', title: 'The 3rd tab', debug: ['SENT TO THE MODEL (round 1):', 'open the 3rd tab'], messages: [message('1', 'open the 3rd tab')] });
    const { container, bubble } = await createBubble('persistent-id="chat-bubble-test"');
    await wait(300);
    bubble.show();
    await wait(300);
    await bubble.updateComplete;
    const realCreate = URL.createObjectURL;
    const realClick = HTMLAnchorElement.prototype.click;
    let blob;
    let filename;
    URL.createObjectURL = value => { blob = value; return 'blob:test'; };
    HTMLAnchorElement.prototype.click = function(){ filename = this.download; };
    bubble.shadowRoot.querySelector('.row-export').click();
    await wait(300);
    URL.createObjectURL = realCreate;
    HTMLAnchorElement.prototype.click = realClick;
    const text = blob ? await blob.text() : '';
    container.remove();
    return /^kempo-chat-the-3rd-tab-\d{14}\.txt$/.test(filename) && text.includes('KEMPO UI CHAT EXPORT') && text.includes('open the 3rd tab') && text.includes('===== DEBUG RECORD') && text.includes('SENT TO THE MODEL (round 1):')
      ? pass('Downloaded as a text file')
      : fail(`${filename} / ${text.slice(0, 300)}`);
  },

  'the "Connecting an LLM" pattern of the docs works: placeholder, saved reply, status, unread, failure': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('show-status="icons" persistent-id="chat-bubble-test"');
    await wait(300);
    let answer = async () => {
      await wait(150);
      return { reply: 'Lorem **ipsum**' };
    };
    bubble.addEventListener('send', async e => {
      const replyId = bubble.chat.addMessage({ type: 'incoming', sender: 'Support', html: '<em>Typing...</em>', transient: true });
      try {
        const { reply } = await answer(e.detail.markdown);
        bubble.chat.updateMessage(replyId, { html: renderMarkdown(reply, { breaks: true }), markdown: reply, transient: false });
        bubble.chat.updateMessage(e.detail.id, { status: 'read' });
        if(!bubble.open) bubble.unread = true;
      } catch(error){
        bubble.chat.updateMessage(e.detail.id, { status: 'failed' });
        bubble.chat.updateMessage(replyId, { html: '<em>Sorry, no answer. Please try again.</em>' });
      }
    });
    bubble.chat.send('first question');
    await bubble.updateComplete;
    const placeholder = bubble.chat.messages.find(m => m.html.includes('Typing'));
    const duringWait = !!placeholder && placeholder.transient && bubble.chat.messages[0].status === 'sending' && !bubble.unread;
    await wait(450);
    const reply = bubble.chat.messages[1];
    const answered = reply.html.includes('<strong>ipsum</strong>') && reply.markdown === 'Lorem **ipsum**' && !reply.transient && bubble.chat.messages[0].status === 'read' && bubble.unread;
    await wait(400);
    const saved = await getConversation(bubble.chat.conversationId);
    const savedOk = saved.messages.length === 2 && saved.messages[1].markdown === 'Lorem **ipsum**' && !saved.messages.some(m => m.html.includes('Typing'));
    bubble.show();
    await bubble.updateComplete;
    answer = () => { throw new Error('The server answered 500'); };
    bubble.chat.send('second question');
    await wait(450);
    const failed = bubble.chat.messages[2].status === 'failed' && bubble.chat.messages[3].html.includes('Sorry') && bubble.chat.messages[3].transient;
    container.remove();
    return duringWait && answered && savedOk && failed ? pass('Placeholder, saved reply, status and unread all work') : fail(`duringWait ${duringWait}, answered ${answered}, savedOk ${savedOk}, failed ${failed}`);
  },

  'goes straight to the chat when nothing is saved': async ({pass, fail}) => {
    const { container, bubble } = await createBubble('persistent-id="chat-bubble-test"');
    await wait(200);
    bubble.show();
    await wait(300);
    const ok = bubble.view === 'chat';
    container.remove();
    return ok ? pass('No list when there is nothing to list') : fail(`view ${bubble.view}`);
  },

  'deleting asks in a dialog, and only removes the conversation when confirmed': async ({pass, fail}) => {
    const message = (id, text) => ({ id, type: 'outgoing', html: `<p>${text}</p>`, status: 'read', sender: '', markdown: text, transient: false, timestamp: new Date() });
    await saveConversation({ id: 'a', group: 'chat-bubble-test', title: 'A', messages: [message('1', 'A')] });
    await saveConversation({ id: 'b', group: 'chat-bubble-test', title: 'B', messages: [message('2', 'B')] });
    const { container, bubble } = await createBubble('persistent-id="chat-bubble-test"');
    await wait(300);
    bubble.show();
    await wait(300);
    await bubble.updateComplete;
    const title = bubble.shadowRoot.querySelectorAll('.row-title')[1].textContent;
    bubble.shadowRoot.querySelectorAll('.row-delete')[1].click();
    await wait(400);
    let dialog = document.querySelector('k-dialog');
    const asked = !!dialog && dialog.textContent.includes(title) && bubble.shadowRoot.querySelectorAll('.row').length === 2;
    dialog?.shadowRoot.querySelector('#cancel')?.click();
    await wait(300);
    const keptOnCancel = bubble.shadowRoot.querySelectorAll('.row').length === 2 && !document.querySelector('k-dialog[opened]');
    bubble.shadowRoot.querySelectorAll('.row-delete')[1].click();
    await wait(400);
    dialog = document.querySelector('k-dialog');
    dialog?.shadowRoot.querySelector('#confirm')?.click();
    await wait(500);
    await bubble.updateComplete;
    const deleted = bubble.shadowRoot.querySelectorAll('.row').length === 1;
    bubble.shadowRoot.querySelector('.new-btn').click();
    await wait(200);
    const ok = asked && keptOnCancel && deleted && bubble.view === 'chat' && bubble.chat.messages.length === 0;
    container.remove();
    return ok ? pass('Dialog, cancel keeps, confirm deletes, new') : fail(`asked ${asked}, keptOnCancel ${keptOnCancel}, deleted ${deleted}, view ${bubble.view}, messages ${bubble.chat.messages.length}`);
  }
};
