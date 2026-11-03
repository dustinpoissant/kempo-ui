import { isSupported, getAvailability, loadSystemPrompt, createSession } from '../../src/utils/promptApi.js';

/*
  Test Helpers
*/

const realFetch = globalThis.fetch;

const mockFetch = (text, ok = true) => {
  globalThis.fetch = async () => ({ ok, status: ok ? 200 : 404, text: async () => text });
};

const mockModel = (parts = ['Hello ', 'world'], script) => {
  const calls = { created: null, prompts: [], destroyed: 0 };
  globalThis.LanguageModel = {
    availability: async () => 'available',
    create: async (options) => {
      calls.created = options;
      options.monitor({ addEventListener: (name, callback) => callback({ loaded: 0.25 }) });
      return {
        inputUsage: 1,
        inputQuota: 10,
        prompt: async (text) => {
          calls.prompts.push(text);
          return parts.join('');
        },
        promptStreaming: (text) => {
          calls.prompts.push(text);
          return new ReadableStream({
            start(controller){
              (script ? script(text) : parts).forEach(part => controller.enqueue(part));
              controller.close();
            }
          });
        },
        destroy: () => calls.destroyed++
      };
    }
  };
  return calls;
};

const cleanup = () => {
  globalThis.fetch = realFetch;
  delete globalThis.LanguageModel;
};

/*
  Tests
*/

export default {
  'isSupported is false without LanguageModel and true with it': ({pass, fail}) => {
    cleanup();
    if(isSupported()) return fail('Should not be supported without LanguageModel');
    mockModel();
    const supported = isSupported();
    cleanup();
    return supported ? pass('Follows the LanguageModel global') : fail('Should be supported with LanguageModel');
  },

  'getAvailability is unavailable without LanguageModel': async ({pass, fail}) => {
    cleanup();
    const availability = await getAvailability();
    return availability === 'unavailable' ? pass('Reports unavailable') : fail(`Got ${availability}`);
  },

  'loadSystemPrompt returns the trimmed file text': async ({pass, fail}) => {
    mockFetch('  You are a helper.\n');
    const text = await loadSystemPrompt('/prompt.md');
    cleanup();
    return text === 'You are a helper.' ? pass('Trimmed text returned') : fail(`Got "${text}"`);
  },

  'loadSystemPrompt throws when the file is missing': async ({pass, fail}) => {
    mockFetch('', false);
    try {
      await loadSystemPrompt('/missing.md');
      cleanup();
      return fail('Should have thrown');
    } catch(error){
      cleanup();
      return error.message.includes('404') ? pass('Threw with the status') : fail(error.message);
    }
  },

  'createSession sends the file as the system prompt': async ({pass, fail}) => {
    mockFetch('Be brief.');
    const calls = mockModel();
    await createSession({ path: '/prompt.md' });
    const initial = calls.created.initialPrompts;
    cleanup();
    return initial.length === 1 && initial[0].role === 'system' && initial[0].content === 'Be brief.'
      ? pass('System prompt passed to the model')
      : fail(JSON.stringify(initial));
  },

  'createSession joins several files in order': async ({pass, fail}) => {
    globalThis.fetch = async url => ({ ok: true, status: 200, text: async () => `text of ${url}` });
    const calls = mockModel();
    await createSession({ path: ['/a.md', '/b.md'] });
    const content = calls.created.initialPrompts[0].content;
    cleanup();
    return content === 'text of /a.md\n\ntext of /b.md' ? pass('Files joined in order') : fail(content);
  },

  'createSession puts the tools in the system prompt': async ({pass, fail}) => {
    const calls = mockModel();
    await createSession({ systemPrompt: 'Be brief.', tools: [{ name: 'setTheme', description: 'Changes the theme.', inputSchema: { type: 'object' }, execute: () => 'ok' }] });
    const content = calls.created.initialPrompts[0].content;
    cleanup();
    return content.startsWith('Be brief.') && content.includes('TOOL_CALL') && content.includes('- setTheme: Changes the theme.') && content.includes('to get information you do not have, before you answer')
      ? pass('Tools described to the model')
      : fail(content);
  },

  'createSession does not use the native tools option': async ({pass, fail}) => {
    const calls = mockModel();
    await createSession({ tools: [{ name: 't', description: 'd', execute: () => 'ok' }] });
    const has = 'tools' in calls.created;
    cleanup();
    return has ? fail('Native tools should not be passed') : pass('No native tools key');
  },

  'a tool call runs the tool and returns the answer that follows': async ({pass, fail}) => {
    const received = [];
    const calls = mockModel([], text => text.startsWith('TOOL_RESULT')
      ? ['Done, it is light.']
      : ['TOOL_CALL {"name":"setTheme","arguments":{"theme":"light"}}']);
    const session = await createSession({ tools: [{ name: 'setTheme', description: 'd', execute: args => { received.push(args); return 'The theme is now light.'; } }] });
    const reply = await session.prompt('Make it light');
    cleanup();
    return reply === 'Done, it is light.' && received[0].theme === 'light' && calls.prompts[1] === 'TOOL_RESULT setTheme: The theme is now light.'
      ? pass('Tool ran and its result went back to the model')
      : fail(`${reply} / ${JSON.stringify(received)} / ${calls.prompts}`);
  },

  'onLog gets every step as text: the system prompt, what was sent, the raw replies and the tool call': async ({pass, fail}) => {
    const lines = [];
    mockModel([], text => text.startsWith('TOOL_RESULT') ? ['The tab is set.'] : ['TOOL_CALL {"name":"getDocs","arguments":{"name":"tabs"}}']);
    const session = await createSession({ systemPrompt: 'Be brief.', tools: [{ name: 'getDocs', description: 'd', execute: () => 'Tabs doc text' }], onLog: line => lines.push(line) });
    await session.prompt('how do I open the 3rd tab?');
    cleanup();
    const log = lines.join('\n');
    const expected = ['SESSION CREATED', 'tools: getDocs', 'SYSTEM PROMPT', 'Be brief.', 'SENT TO THE MODEL (round 1):\nhow do I open the 3rd tab?',
      'MODEL REPLY, raw (round 1):\nTOOL_CALL {"name":"getDocs"', 'TOOL CALL: getDocs({"name":"tabs"})', 'TOOL RESULT (13 characters):\nTabs doc text',
      'SENT TO THE MODEL (round 2):\nTOOL_RESULT getDocs: Tabs doc text', 'MODEL REPLY, raw (round 2):\nThe tab is set.', 'No tool call in the reply, so it is the final answer.'];
    const missing = expected.filter(part => !log.includes(part));
    return !missing.length ? pass('The whole exchange is in the log') : fail(`missing: ${missing.join(' | ')}\n${log}`);
  },

  'onLog says what went wrong with a tool call': async ({pass, fail}) => {
    const lines = [];
    mockModel([], text => text.startsWith('TOOL_RESULT') ? ['Sorry.'] : ['TOOL_CALL {"name":"nope","arguments":{}}']);
    const session = await createSession({ tools: [{ name: 'getDocs', description: 'd', execute: () => 'x' }], onLog: line => lines.push(line) });
    await session.prompt('hi');
    cleanup();
    return lines.join('\n').includes('TOOL ERROR: there is no tool named "nope"') ? pass('Logged') : fail(lines.join('\n'));
  },

  'a tool call written as a bare JSON object, in a code fence labeled tool_call, is run (a real reply of the model)': async ({pass, fail}) => {
    const seen = [];
    const shown = [];
    mockModel([], text => text.startsWith('TOOL_RESULT') ? ['Set `active` on the third k-tab.'] : ['```tool_call\n{"name": "getComponentDocs", "arguments": {"name": "tabs"}}\n```']);
    const session = await createSession({ tools: [{ name: 'getComponentDocs', description: 'd', execute: args => { seen.push(args); return 'Tabs doc'; } }] });
    for await(const chunk of session.promptStreaming('how would i make the 3rd tab open by default')) shown.push(chunk);
    cleanup();
    return seen.length === 1 && seen[0].name === 'tabs' && shown.join('') === 'Set `active` on the third k-tab.' ? pass('Ran the tool, and the call was not shown') : fail(`${JSON.stringify(seen)} / ${shown.join('')}`);
  },

  'bare JSON calls work in other shapes: plain, a json fence, parameters instead of arguments, split across chunks': async ({pass, fail}) => {
    const shapes = [
      ['{"name":"t","arguments":{"x":1}}'],
      ['```json\n{"name":"t","arguments":{"x":1}}\n```'],
      ['{"name":"t","parameters":{"x":1}}'],
      ['{"tool":"t","args":{"x":1}}'],
      ['{"na', 'me":"t","argu', 'ments":{"x":1}}'],
      ['  \n```\n{"name":"t","arguments":{"x":1}}\n```  ']
    ];
    const problems = [];
    for(const shape of shapes){
      const seen = [];
      mockModel([], text => text.startsWith('TOOL_RESULT') ? ['Done.'] : shape);
      const session = await createSession({ tools: [{ name: 't', description: 'd', execute: args => { seen.push(args.x); return 'ok'; } }] });
      const reply = await session.prompt('go');
      cleanup();
      if(seen.join() !== '1' || reply !== 'Done.') problems.push(`${JSON.stringify(shape)} -> ${seen} / ${reply}`);
    }
    return !problems.length ? pass('All shapes run the tool') : fail(problems.join('\n'));
  },

  'JSON that is not a call to one of the tools, and code fences, are shown as the answer': async ({pass, fail}) => {
    const answers = ['{"name":"somebody","arguments":{}}', '{"a":1}', '```html\n<k-tabs></k-tabs>\n```', '{ not json', '```'];
    const problems = [];
    for(const answer of answers){
      const chunks = [];
      mockModel([], () => [answer.slice(0, 3), answer.slice(3)]);
      const session = await createSession({ tools: [{ name: 't', description: 'd', execute: () => 'ok' }] });
      for await(const chunk of session.promptStreaming('go')) chunks.push(chunk);
      cleanup();
      if(chunks.join('') !== answer) problems.push(`${answer} -> ${chunks.join('')}`);
    }
    return !problems.length ? pass('Shown as they are') : fail(problems.join('\n'));
  },

  'a tool call split across chunks after some text is found': async ({pass, fail}) => {
    let ran = 0;
    mockModel([], text => text.startsWith('TOOL_RESULT') ? ['Ok.'] : ['Sure! TOOL_', 'CALL {"name":"t",', '"arguments":{}}']);
    const session = await createSession({ tools: [{ name: 't', description: 'd', execute: () => { ran++; return 'done'; } }] });
    const chunks = [];
    for await(const chunk of session.promptStreaming('go')) chunks.push(chunk);
    cleanup();
    return ran === 1 && chunks.join('') === 'Sure! \n\nOk.' ? pass('Preamble kept, call hidden, answer appended') : fail(`ran ${ran}: ${JSON.stringify(chunks)}`);
  },

  'text that only starts like a tool call is not held back': async ({pass, fail}) => {
    mockModel([], () => ['TOOL', ' is a word']);
    const session = await createSession({ tools: [{ name: 't', description: 'd', execute: () => 'x' }] });
    const reply = await session.prompt('hi');
    cleanup();
    return reply === 'TOOL is a word' ? pass('Reply streamed in full') : fail(reply);
  },

  'a call to an unknown tool is reported back to the model': async ({pass, fail}) => {
    const calls = mockModel([], text => text.startsWith('TOOL_RESULT') ? ['Sorry.'] : ['TOOL_CALL {"name":"nope","arguments":{}}']);
    const session = await createSession({ tools: [{ name: 't', description: 'd', execute: () => 'x' }] });
    const reply = await session.prompt('hi');
    cleanup();
    return reply === 'Sorry.' && calls.prompts[1].includes('no tool named "nope"') ? pass('Error returned to the model') : fail(`${reply} / ${calls.prompts}`);
  },

  'createSession starts from the history': async ({pass, fail}) => {
    const calls = mockModel();
    await createSession({ systemPrompt: 'Sys', history: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] });
    const roles = calls.created.initialPrompts.map(p => p.role).join();
    cleanup();
    return roles === 'system,user,assistant' ? pass('History follows the system prompt') : fail(roles);
  },

  'createSession drops the oldest history that does not fit': async ({pass, fail}) => {
    const attempts = [];
    mockModel();
    globalThis.LanguageModel.create = async options => {
      attempts.push(options.initialPrompts.length);
      if(options.initialPrompts.length > 3) throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' });
      return { destroy(){} };
    };
    const history = [1, 2, 3, 4, 5, 6].map(n => ({ role: n % 2 ? 'user' : 'assistant', content: `${n}` }));
    await createSession({ systemPrompt: 'Sys', history });
    cleanup();
    return attempts.join() === '7,5,3' ? pass('Dropped two turns at a time until it fit') : fail(attempts.join());
  },

  'createSession explains a system prompt that is too long': async ({pass, fail}) => {
    mockModel();
    globalThis.LanguageModel.create = async () => { throw Object.assign(new Error('quota'), { name: 'QuotaExceededError' }); };
    try {
      await createSession();
      cleanup();
      return fail('Should have thrown');
    } catch(error){
      cleanup();
      return error.message.includes('too long') ? pass('Friendly error') : fail(error.message);
    }
  },

  'createSession with no prompt sends no initial prompts': async ({pass, fail}) => {
    const calls = mockModel();
    await createSession();
    const initial = calls.created.initialPrompts;
    cleanup();
    return initial.length === 0 ? pass('No initial prompts') : fail(JSON.stringify(initial));
  },

  'createSession reports download progress': async ({pass, fail}) => {
    mockModel();
    let loaded = null;
    await createSession({ onDownloadProgress: value => loaded = value });
    cleanup();
    return loaded === 0.25 ? pass('Progress reported') : fail(`Got ${loaded}`);
  },

  'createSession throws without LanguageModel': async ({pass, fail}) => {
    cleanup();
    try {
      await createSession();
      return fail('Should have thrown');
    } catch(error){
      return pass('Threw when unsupported');
    }
  },

  'session.prompt resolves with the reply': async ({pass, fail}) => {
    const calls = mockModel();
    const session = await createSession();
    const reply = await session.prompt('Hi');
    cleanup();
    return reply === 'Hello world' && calls.prompts[0] === 'Hi' ? pass('Reply returned') : fail(`Got "${reply}"`);
  },

  'session.promptStreaming yields each chunk': async ({pass, fail}) => {
    mockModel(['a', 'b', 'c']);
    const session = await createSession();
    const chunks = [];
    for await(const chunk of session.promptStreaming('Hi')) chunks.push(chunk);
    cleanup();
    return chunks.join('|') === 'a|b|c' ? pass('Chunks yielded in order') : fail(chunks.join('|'));
  },

  'session.destroy destroys the model session': async ({pass, fail}) => {
    const calls = mockModel();
    const session = await createSession();
    session.destroy();
    cleanup();
    return calls.destroyed === 1 ? pass('Destroyed') : fail(`Destroyed ${calls.destroyed} times`);
  }
};
