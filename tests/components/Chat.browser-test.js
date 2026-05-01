import Chat from '../../src/components/Chat.js';

const createChat = async (attrs = {}) => {
  const container = document.createElement('div');
  const parts = [];
  if(attrs.enterNewline) parts.push('enter-newline');
  if(attrs.showStates) parts.push('show-states');
  if(attrs.disabled) parts.push('disabled');
  if(attrs.placeholder !== undefined) parts.push(`placeholder="${attrs.placeholder}"`);
  if(attrs.controls !== undefined) parts.push(`controls="${attrs.controls}"`);
  container.innerHTML = `<k-chat ${parts.join(' ')}></k-chat>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-chat');
  await el.updateComplete;
  return { container, el };
};

const cleanup = (container) => {
  if(container && container.parentNode){
    container.parentNode.removeChild(container);
  }
};

const messageEls = (el) => [...el.shadowRoot.querySelectorAll('.message')];

export default {
  /*
    Element Creation
  */
  'should create chat element': async ({pass, fail}) => {
    const { container, el } = await createChat();
    if(!(el instanceof Chat)){
      cleanup(container);
      return fail('Element should be instance of Chat');
    }
    cleanup(container);
    pass('Chat element created');
  },

  'should render an empty message window and an editor': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const wnd = el.shadowRoot.querySelector('.window');
    const editor = el.shadowRoot.querySelector('k-html-editor');
    if(!wnd || !editor){
      cleanup(container);
      return fail('Should render .window and k-html-editor');
    }
    if(messageEls(el).length !== 0){
      cleanup(container);
      return fail('Window should start empty');
    }
    cleanup(container);
    pass('Initial layout rendered');
  },

  'should re-project user controls into the editor toolbar via the controls slot': async ({pass, fail}) => {
    const container = document.createElement('div');
    container.innerHTML = '<k-chat><button slot="controls" id="user-bold">B</button></k-chat>';
    document.body.appendChild(container);
    const el = container.querySelector('k-chat');
    await el.updateComplete;
    // Children-changed observer might re-render — wait one more cycle
    await el.updateComplete;
    const userBtn = el.querySelector('#user-bold');
    if(!userBtn){
      cleanup(container);
      return fail('User-provided control should remain in the light DOM');
    }
    const controlsSlot = el.shadowRoot.querySelector('slot[name="controls"]');
    if(!controlsSlot){
      cleanup(container);
      return fail('Chat shadow should expose a slot[name="controls"] when controls are provided');
    }
    const assigned = controlsSlot.assignedNodes({ flatten: true });
    if(!assigned.includes(userBtn)){
      cleanup(container);
      return fail('User control should be assigned to the chat controls slot');
    }
    if(controlsSlot.getAttribute('slot') !== 'toolbar-bottom-left'){
      cleanup(container);
      return fail(`Expected controls slot to forward to "toolbar-bottom-left", got "${controlsSlot.getAttribute('slot')}"`);
    }
    cleanup(container);
    pass('User-provided controls forward into the editor toolbar');
  },

  'should NOT render the controls slot when no controls are provided': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const slot = el.shadowRoot.querySelector('slot[name="controls"]');
    if(slot){
      cleanup(container);
      return fail('Empty <slot name="controls"> would trigger an empty toolbar in the editor — should not render');
    }
    cleanup(container);
    pass('No controls slot rendered when none provided');
  },

  'should embed a k-html-editor and an icon Send button': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    const send = el.shadowRoot.querySelector('.send-btn');
    if(!editor){
      cleanup(container);
      return fail('Should embed k-html-editor');
    }
    if(!send || send.tagName !== 'BUTTON'){
      cleanup(container);
      return fail('Should render Send button');
    }
    const icon = send.querySelector('k-icon');
    if(!icon || icon.getAttribute('name') !== 'send'){
      cleanup(container);
      return fail('Send button should contain a k-icon name="send"');
    }
    cleanup(container);
    pass('Editor + icon Send button rendered');
  },

  /*
    addMessage
  */
  'addMessage should append a message and return its id': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const id = el.addMessage({ type: 'incoming', html: 'hello' });
    await el.updateComplete;
    if(typeof id !== 'string' || !id){
      cleanup(container);
      return fail(`Expected a string id, got ${typeof id}`);
    }
    if(el.messages.length !== 1 || el.messages[0].id !== id){
      cleanup(container);
      return fail('Message should be appended with returned id');
    }
    cleanup(container);
    pass('addMessage appends and returns id');
  },

  'addMessage should default state by type': async ({pass, fail}) => {
    const { container, el } = await createChat();
    el.addMessage({ type: 'incoming', html: 'hi' });
    el.addMessage({ type: 'outgoing', html: 'reply' });
    if(el.messages[0].state !== 'received'){
      cleanup(container);
      return fail(`Incoming default state should be "received", got "${el.messages[0].state}"`);
    }
    if(el.messages[1].state !== 'sent'){
      cleanup(container);
      return fail(`Outgoing default state should be "sent", got "${el.messages[1].state}"`);
    }
    cleanup(container);
    pass('Default states applied by message type');
  },

  'addMessage should sanitize HTML': async ({pass, fail}) => {
    const { container, el } = await createChat();
    el.addMessage({ type: 'incoming', html: 'safe<script>alert(1)</script><b>bold</b>' });
    const stored = el.messages[0].html;
    if(/script/i.test(stored)){
      cleanup(container);
      return fail(`HTML should be sanitized, got "${stored}"`);
    }
    if(!stored.includes('<b>bold</b>')){
      cleanup(container);
      return fail(`Safe content should be preserved, got "${stored}"`);
    }
    cleanup(container);
    pass('addMessage runs through sanitizer');
  },

  'addMessage should render outgoing vs incoming with different classes': async ({pass, fail}) => {
    const { container, el } = await createChat();
    el.addMessage({ type: 'incoming', html: 'in' });
    el.addMessage({ type: 'outgoing', html: 'out' });
    await el.updateComplete;
    const els = messageEls(el);
    if(!els[0].classList.contains('incoming') || !els[1].classList.contains('outgoing')){
      cleanup(container);
      return fail('Messages should have incoming/outgoing classes');
    }
    cleanup(container);
    pass('incoming/outgoing classes applied');
  },

  /*
    updateMessage
  */
  'updateMessage should change state': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const id = el.addMessage({ type: 'outgoing', html: 'hi', state: 'sending' });
    const ok = el.updateMessage(id, { state: 'sent' });
    if(!ok || el.messages[0].state !== 'sent'){
      cleanup(container);
      return fail(`Expected state updated to "sent", got "${el.messages[0].state}"`);
    }
    cleanup(container);
    pass('updateMessage changes state');
  },

  'updateMessage should reject invalid states': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const id = el.addMessage({ type: 'outgoing', html: 'hi', state: 'sending' });
    el.updateMessage(id, { state: 'bogus' });
    if(el.messages[0].state !== 'sending'){
      cleanup(container);
      return fail(`Invalid state should be ignored, got "${el.messages[0].state}"`);
    }
    cleanup(container);
    pass('updateMessage ignores invalid states');
  },

  'updateMessage should sanitize new HTML': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const id = el.addMessage({ type: 'incoming', html: 'old' });
    el.updateMessage(id, { html: 'new<script>x</script>' });
    if(/script/i.test(el.messages[0].html)){
      cleanup(container);
      return fail('Updated HTML should be sanitized');
    }
    cleanup(container);
    pass('updateMessage sanitizes new HTML');
  },

  'updateMessage should return false for unknown id': async ({pass, fail}) => {
    const { container, el } = await createChat();
    if(el.updateMessage('does-not-exist', { state: 'sent' }) !== false){
      cleanup(container);
      return fail('Should return false when id is unknown');
    }
    cleanup(container);
    pass('updateMessage returns false for unknown id');
  },

  /*
    removeMessage / clear
  */
  'removeMessage should drop the matching message': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const id1 = el.addMessage({ type: 'incoming', html: 'a' });
    el.addMessage({ type: 'incoming', html: 'b' });
    el.removeMessage(id1);
    if(el.messages.length !== 1 || el.messages[0].html !== 'b'){
      cleanup(container);
      return fail(`Expected only "b" to remain, got ${JSON.stringify(el.messages.map(m => m.html))}`);
    }
    cleanup(container);
    pass('removeMessage drops the right message');
  },

  'clear should remove all messages': async ({pass, fail}) => {
    const { container, el } = await createChat();
    el.addMessage({ type: 'incoming', html: 'a' });
    el.addMessage({ type: 'incoming', html: 'b' });
    el.clear();
    if(el.messages.length !== 0){
      cleanup(container);
      return fail(`Expected 0 messages after clear, got ${el.messages.length}`);
    }
    cleanup(container);
    pass('clear removes all messages');
  },

  /*
    send()
  */
  'send() should be a no-op when input is empty': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = '';
    const id = el.send();
    if(id !== null){
      cleanup(container);
      return fail(`Expected null when input empty, got ${id}`);
    }
    if(el.messages.length !== 0){
      cleanup(container);
      return fail('No message should be added when input is empty');
    }
    cleanup(container);
    pass('send() no-ops on empty input');
  },

  'send() should add an outgoing message and dispatch a send event': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = '<p>hello</p>';
    let detail = null;
    el.addEventListener('send', (e) => { detail = e.detail; });
    const id = el.send();
    if(!id){
      cleanup(container);
      return fail('send() should return an id');
    }
    if(!detail || detail.id !== id || !detail.html.includes('hello')){
      cleanup(container);
      return fail(`Expected send event with detail.id and html, got ${JSON.stringify(detail)}`);
    }
    if(el.messages.length !== 1 || el.messages[0].type !== 'outgoing'){
      cleanup(container);
      return fail('send() should add an outgoing message');
    }
    cleanup(container);
    pass('send() adds outgoing message and fires event');
  },

  'send() should clear the editor after submitting': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = '<p>hi</p>';
    el.send();
    if(editor.value){
      cleanup(container);
      return fail(`Editor should be cleared, got "${editor.value}"`);
    }
    cleanup(container);
    pass('Editor cleared after send');
  },

  'send() should reject pure-whitespace input': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = '   \n  \t  ';
    let sent = false;
    el.addEventListener('send', () => { sent = true; });
    const id = el.send();
    if(id !== null || sent){
      cleanup(container);
      return fail('Pure-whitespace input should not be sent');
    }
    cleanup(container);
    pass('Whitespace-only input rejected');
  },

  'send() should reject input with only empty paragraphs / br': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = '<p></p><p><br></p><p>  </p>';
    let sent = false;
    el.addEventListener('send', () => { sent = true; });
    const id = el.send();
    if(id !== null || sent){
      cleanup(container);
      return fail('Input that is only empty paragraphs/br should not be sent');
    }
    cleanup(container);
    pass('Empty-paragraph input rejected');
  },

  'send() should preserve user-intentional blank lines around content': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    const raw = '<p><br></p><p>hello</p><p><br></p><p>world</p><p></p>';
    editor.value = raw;
    let detail = null;
    el.addEventListener('send', (e) => { detail = e.detail; });
    el.send();
    if(!detail){
      cleanup(container);
      return fail('send should fire for non-empty input');
    }
    // The content the user typed (including any leading/trailing blank lines)
    // should be sent as-is. Sanitization may rewrite the markup slightly but
    // the structural blank lines must remain.
    if(!detail.html.includes('<p>hello</p>') || !detail.html.includes('<p>world</p>')){
      cleanup(container);
      return fail(`Expected both content paragraphs preserved, got "${detail.html}"`);
    }
    // At least one empty paragraph between hello and world should remain.
    const between = detail.html.split('<p>hello</p>')[1]?.split('<p>world</p>')[0] || '';
    if(!/<br>|<p><\/p>/.test(between)){
      cleanup(container);
      return fail(`Expected the blank line between hello and world preserved, got "${detail.html}"`);
    }
    cleanup(container);
    pass('Blank lines preserved in sent content');
  },

  'send() should sanitize the submitted HTML': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = 'safe<script>alert(1)</script>';
    let detail = null;
    el.addEventListener('send', (e) => { detail = e.detail; });
    el.send();
    if(/script/i.test(detail.html)){
      cleanup(container);
      return fail(`Expected sanitized html in event detail, got "${detail.html}"`);
    }
    cleanup(container);
    pass('send() sanitizes submitted HTML');
  },

  'send() should mark outgoing as sending when show-states is on': async ({pass, fail}) => {
    const { container, el } = await createChat({ showStates: true });
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = 'hi';
    el.send();
    if(el.messages[0].state !== 'sending'){
      cleanup(container);
      return fail(`Expected state "sending", got "${el.messages[0].state}"`);
    }
    cleanup(container);
    pass('show-states sets initial state to sending');
  },

  /*
    Disabled
  */
  'should disable send button and editor when disabled attribute is set': async ({pass, fail}) => {
    const { container, el } = await createChat({ disabled: true });
    const send = el.shadowRoot.querySelector('.send-btn');
    if(!send.disabled){
      cleanup(container);
      return fail('Send button should be disabled');
    }
    cleanup(container);
    pass('Send button disabled');
  },

  'send() should be a no-op when disabled': async ({pass, fail}) => {
    const { container, el } = await createChat({ disabled: true });
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = 'hi';
    const id = el.send();
    if(id !== null){
      cleanup(container);
      return fail(`Disabled send should return null, got ${id}`);
    }
    cleanup(container);
    pass('Disabled send no-ops');
  },

  /*
    Enter-key behavior (default = Slack: Enter sends, Shift+Enter newline)
  */
  'default: Enter should send (Slack-style)': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = 'hi';
    let sent = false;
    el.addEventListener('send', () => { sent = true; });
    const evt = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true });
    editor.dispatchEvent(evt);
    await Promise.resolve();
    await Promise.resolve();
    if(!sent){
      cleanup(container);
      return fail('Default behavior should send on Enter');
    }
    cleanup(container);
    pass('Enter sends by default');
  },

  'default: Shift+Enter should NOT send (newline)': async ({pass, fail}) => {
    const { container, el } = await createChat();
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = 'hi';
    let sent = false;
    el.addEventListener('send', () => { sent = true; });
    const evt = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, composed: true, cancelable: true });
    editor.dispatchEvent(evt);
    await Promise.resolve();
    await Promise.resolve();
    if(sent){
      cleanup(container);
      return fail('Default Shift+Enter should NOT send');
    }
    cleanup(container);
    pass('Shift+Enter does not send by default');
  },

  'enter-newline: Enter should NOT send (newline)': async ({pass, fail}) => {
    const { container, el } = await createChat({ enterNewline: true });
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = 'hi';
    let sent = false;
    el.addEventListener('send', () => { sent = true; });
    const evt = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true });
    editor.dispatchEvent(evt);
    await Promise.resolve();
    await Promise.resolve();
    if(sent){
      cleanup(container);
      return fail('With enter-newline, Enter should NOT send');
    }
    cleanup(container);
    pass('Enter inserts newline when enter-newline is set');
  },

  'enter-newline: Shift+Enter should send': async ({pass, fail}) => {
    const { container, el } = await createChat({ enterNewline: true });
    const editor = el.shadowRoot.querySelector('k-html-editor');
    editor.value = 'hi';
    let sent = false;
    el.addEventListener('send', () => { sent = true; });
    const evt = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, composed: true, cancelable: true });
    editor.dispatchEvent(evt);
    await Promise.resolve();
    await Promise.resolve();
    if(!sent){
      cleanup(container);
      return fail('With enter-newline, Shift+Enter should send');
    }
    cleanup(container);
    pass('Shift+Enter sends when enter-newline is set');
  },

  /*
    State indicator
  */
  'show-states should render a state indicator on outgoing messages': async ({pass, fail}) => {
    const { container, el } = await createChat({ showStates: true });
    el.addMessage({ type: 'outgoing', html: 'hi', state: 'sending' });
    el.addMessage({ type: 'incoming', html: 'hi back' });
    await el.updateComplete;
    const els = messageEls(el);
    if(!els[0].querySelector('.meta')){
      cleanup(container);
      return fail('Outgoing message should have a .meta indicator');
    }
    if(els[1].querySelector('.meta')){
      cleanup(container);
      return fail('Incoming message should NOT have a state indicator');
    }
    cleanup(container);
    pass('State indicator only on outgoing messages');
  },

  'without show-states, no state indicator is rendered': async ({pass, fail}) => {
    const { container, el } = await createChat();
    el.addMessage({ type: 'outgoing', html: 'hi', state: 'sending' });
    await el.updateComplete;
    const els = messageEls(el);
    if(els[0].querySelector('.meta')){
      cleanup(container);
      return fail('Should not render .meta when show-states is off');
    }
    cleanup(container);
    pass('No state indicator without show-states');
  }
};
