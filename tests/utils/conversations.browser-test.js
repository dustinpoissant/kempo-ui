import { saveConversation, getConversation, listConversations, deleteConversation, clearConversations, renameConversation, titleOf, formatConversation } from '../../src/utils/conversations.js';

export const beforeEach = () => clearConversations();

export const afterAll = () => clearConversations();

export default {
  'saveConversation returns a record with an id and dates': async ({pass, fail}) => {
    const record = await saveConversation({ group: 'a', title: 'T', messages: [{ id: '1', html: 'hi' }] });
    return record.id && record.createdAt instanceof Date && record.updatedAt instanceof Date ? pass('Record has id and dates') : fail(JSON.stringify(record));
  },

  'getConversation returns the saved messages, with their dates': async ({pass, fail}) => {
    const when = new Date('2026-01-02T03:04:05Z');
    const { id } = await saveConversation({ messages: [{ id: '1', html: 'hi', timestamp: when }] });
    const saved = await getConversation(id);
    return saved.messages[0].html === 'hi' && saved.messages[0].timestamp.getTime() === when.getTime() ? pass('Messages came back') : fail(JSON.stringify(saved));
  },

  'getConversation returns undefined for an unknown id': async ({pass, fail}) => {
    const saved = await getConversation('nope');
    return saved === undefined ? pass('Nothing found') : fail(JSON.stringify(saved));
  },

  'saving the same id replaces the conversation and keeps createdAt': async ({pass, fail}) => {
    const first = await saveConversation({ id: 'x', messages: [{ id: '1' }] });
    await new Promise(resolve => setTimeout(resolve, 10));
    const second = await saveConversation({ id: 'x', messages: [{ id: '1' }, { id: '2' }] });
    const saved = await getConversation('x');
    return saved.messages.length === 2 && saved.createdAt.getTime() === first.createdAt.getTime() && second.updatedAt > first.updatedAt
      ? pass('Replaced, createdAt kept')
      : fail(JSON.stringify(saved));
  },

  'listConversations lists the newest first, without messages': async ({pass, fail}) => {
    await saveConversation({ id: 'old', title: 'Old', messages: [{ id: '1' }] });
    await new Promise(resolve => setTimeout(resolve, 10));
    await saveConversation({ id: 'new', title: 'New', messages: [{ id: '1' }] });
    const list = await listConversations();
    return list.map(c => c.id).join() === 'new,old' && !('messages' in list[0]) ? pass('Newest first, no messages') : fail(JSON.stringify(list));
  },

  'listConversations can be limited to a group': async ({pass, fail}) => {
    await saveConversation({ id: '1', group: 'a' });
    await saveConversation({ id: '2', group: 'b' });
    await saveConversation({ id: '3', group: 'a' });
    const list = await listConversations('a');
    return list.map(c => c.id).sort().join() === '1,3' ? pass('Only group a') : fail(JSON.stringify(list));
  },

  'renameConversation sets a custom title, keeps the place in the list, and an empty one goes back to the automatic title': async ({pass, fail}) => {
    const first = await saveConversation({ id: 'a', title: 'auto a', messages: [{ id: '1', markdown: 'How do tabs work?' }] });
    await new Promise(resolve => setTimeout(resolve, 10));
    await saveConversation({ id: 'b', title: 'auto b', messages: [{ id: '1', markdown: 'b' }] });
    const renamed = await renameConversation('a', '  My tabs question  ');
    const saved = await getConversation('a');
    const order = (await listConversations()).map(c => c.id).join();
    await renameConversation('a', '   ');
    const reset = await getConversation('a');
    const missing = await renameConversation('nope', 'x');
    return renamed && saved.title === 'My tabs question' && saved.titleCustom && saved.updatedAt.getTime() === first.updatedAt.getTime() && order === 'b,a' && reset.title === 'How do tabs work?' && !reset.titleCustom && missing === false
      ? pass('Renamed, order kept, reset works')
      : fail(`${JSON.stringify(saved)} / ${order} / ${JSON.stringify(reset)} / ${missing}`);
  },

  'the debug record is saved with the conversation but left out of the list': async ({pass, fail}) => {
    await saveConversation({ id: 'd', messages: [{ id: '1' }], debug: ['SENT TO THE MODEL', 'MODEL REPLY'] });
    const saved = await getConversation('d');
    const [summary] = await listConversations();
    return saved.debug.join() === 'SENT TO THE MODEL,MODEL REPLY' && !('debug' in summary) && !('messages' in summary) ? pass('Saved, not listed') : fail(JSON.stringify([saved.debug, summary]));
  },

  'titleOf is the start of the first message with text': ({pass, fail}) => {
    const long = 'x'.repeat(100);
    return titleOf([{ id: '1', markdown: '' }, { id: '2', markdown: long }]) === 'x'.repeat(60) && titleOf([]) === '' ? pass('60 characters of the first message') : fail('Wrong title');
  },

  'formatConversation gives the details, the messages and the debug record as text': ({pass, fail}) => {
    const when = new Date('2026-01-02T03:04:05Z');
    const text = formatConversation({
      id: 'abc', group: 'docs', title: 'Tabs', titleCustom: true, createdAt: when, updatedAt: when,
      messages: [{ type: 'outgoing', markdown: 'how do tabs work?', timestamp: when, status: 'read' }, { type: 'incoming', sender: 'Assistant', markdown: 'Like this', timestamp: when, status: 'read' }],
      debug: ['[k-chat 03:04:05.000] SENT TO THE MODEL (round 1):', 'how do tabs work?']
    }, { page: 'http://x/y', browser: 'TestBrowser' });
    const expected = ['KEMPO UI CHAT EXPORT', 'Title: Tabs (renamed)', 'Conversation: abc (group docs)', 'Page: http://x/y', 'Browser: TestBrowser', 'Messages: 2',
      '===== CONVERSATION =====', '[03:04:05] USER:\nhow do tabs work?', '[03:04:05] ASSISTANT:\nLike this', '===== DEBUG RECORD', '[k-chat 03:04:05.000] SENT TO THE MODEL (round 1):'];
    const missing = expected.filter(part => !text.includes(part));
    const empty = formatConversation({ id: 'x', title: '', messages: [], debug: [] }).includes('Nothing was recorded');
    return !missing.length && empty ? pass('Readable export') : fail(`missing ${missing}, empty ${empty}\n${text}`);
  },

  'deleteConversation removes one conversation': async ({pass, fail}) => {
    await saveConversation({ id: '1' });
    await saveConversation({ id: '2' });
    await deleteConversation('1');
    return (await getConversation('1')) === undefined && (await getConversation('2')) ? pass('Only 1 removed') : fail('Wrong conversations left');
  },

  'clearConversations clears one group or everything': async ({pass, fail}) => {
    await saveConversation({ id: '1', group: 'a' });
    await saveConversation({ id: '2', group: 'b' });
    await clearConversations('a');
    const afterGroup = (await listConversations()).map(c => c.id).join();
    await clearConversations();
    const left = (await listConversations()).length;
    return afterGroup === '2' && left === 0 ? pass('Group then all cleared') : fail(`${afterGroup} / ${left}`);
  }
};
