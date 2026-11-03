/*
  Conversations Utility
  - Saves whole conversations (the messages of a chat) in IndexedDB, so they survive a reload
  - Keeps any number of conversations, optionally sorted into groups
  - Used by `<k-chat persistent-id>`; works for any list of messages
*/

const STORE = 'conversations';

let database = null;

const openDatabase = () => database ??= new Promise((resolve, reject) => {
  if(typeof indexedDB === 'undefined') return reject(new Error('IndexedDB is not available'));
  const request = indexedDB.open('kempo-conversations', 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' }).createIndex('group', 'group');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => {
    database = null;
    reject(request.error);
  };
});

const run = async (mode, action) => {
  const store = (await openDatabase()).transaction(STORE, mode).objectStore(STORE);
  return new Promise((resolve, reject) => {
    const request = action(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// The title a conversation gets by itself: the start of its first message.
export const titleOf = messages => (messages.find(m => m.markdown)?.markdown || '').slice(0, 60);

export const getConversation = id => run('readonly', store => store.get(id));

/*
  conversation: { id?, group?, title?, titleCustom?, debug?, messages }
  Saves it, replacing a saved conversation with the same `id`. Returns the saved record,
  which has an `id` (made up if none was given), `createdAt` and `updatedAt`.
  `titleCustom` marks a title somebody chose. `debug` is a list of lines of text, a record of
  what happened with the model (kept with the conversation so it can be exported).
*/
export const saveConversation = async ({ id = crypto.randomUUID(), group = '', title = '', titleCustom = false, debug = [], messages = [] }) => {
  const existing = await getConversation(id);
  const now = new Date();
  const record = { id, group, title, titleCustom, debug, messages, createdAt: existing?.createdAt || now, updatedAt: now };
  await run('readwrite', store => store.put(record));
  return record;
};

// Gives a saved conversation a title of your choice (an empty one goes back to the automatic title).
// It keeps its place in the list. Resolves with false if there is no such conversation.
export const renameConversation = async (id, title) => {
  const record = await getConversation(id);
  if(!record) return false;
  const custom = String(title).trim();
  await run('readwrite', store => store.put({ ...record, title: custom || titleOf(record.messages), titleCustom: !!custom }));
  return true;
};

// Newest first, without the messages and the debug record: [{ id, group, title, titleCustom, createdAt, updatedAt }]
export const listConversations = async group => (await run('readonly', store => group === undefined ? store.getAll() : store.index('group').getAll(group)))
  .map(({ messages, debug, ...summary }) => summary)
  .sort((a, b) => b.updatedAt - a.updatedAt);

export const deleteConversation = id => run('readwrite', store => store.delete(id));

export const clearConversations = async group => {
  if(group === undefined) return run('readwrite', store => store.clear());
  await Promise.all((await listConversations(group)).map(({ id }) => deleteConversation(id)));
};

/*
  A conversation as one text, to save to a file or paste somewhere: details of the record, the
  messages, and the debug record (what was sent to the model, its raw replies, tool calls).
*/
export const formatConversation = (record, { page = '', browser = '' } = {}) => {
  const time = date => date instanceof Date ? date.toISOString() : String(date || '');
  const messages = record.messages.map(m => `[${time(m.timestamp).slice(11, 19)}] ${m.type === 'outgoing' ? 'USER' : (m.sender || 'ASSISTANT').toUpperCase()}${m.transient ? ' (not saved: a notice or an unfinished reply)' : ''}${m.status && m.status !== 'read' && m.status !== 'delivered' ? ` (${m.status})` : ''}:\n${m.markdown || m.html}`);
  const debug = record.debug?.length ? record.debug.join('\n') : '(Nothing was recorded. Add the `debug` attribute to the chat to record what is sent to the model, its raw replies and the tool calls.)';
  return `KEMPO UI CHAT EXPORT
Title: ${record.title || '(none)'}${record.titleCustom ? ' (renamed)' : ''}
Conversation: ${record.id}${record.group ? ` (group ${record.group})` : ''}
Started: ${time(record.createdAt)}
Last change: ${time(record.updatedAt)}
Exported: ${new Date().toISOString()}
Page: ${page}
Browser: ${browser}
Messages: ${record.messages.length}

===== CONVERSATION =====

${messages.join('\n\n')}

===== DEBUG RECORD (system prompt, what was sent to the model, raw replies, tool calls) =====

${debug}
`;
};
