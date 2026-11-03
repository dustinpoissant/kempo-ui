/*
  Prompt API Utility

  VERY EXPERIMENTAL, NOT USEFUL YET. The model built into the browser is tiny. In testing it
  could not answer a single question correctly: it ignored its instructions, skipped tool
  calls, made up attributes and wrote wrong code. The code here works as plumbing (it sends
  messages, runs tools, shows replies), but do not expect correct answers.

  - Wraps the browser's built-in language model (Chrome's Prompt API, `LanguageModel`)
  - Loads the system prompt (the model's "job description") from one or more file paths
  - Streams or awaits replies and keeps the conversation history in the session
  - Lets the model call functions ("tools") through a plain-text protocol, so it does not
    depend on the browser supporting native tool calling
*/

const TOOL_CALL = 'TOOL_CALL';
const MAX_TOOL_ROUNDS = 4;

let warned = false;

export const isSupported = () => typeof LanguageModel !== 'undefined';

export const getAvailability = async (options = {}) => {
  if(!isSupported()) return 'unavailable';
  return LanguageModel.availability({
    expectedInputs: [{ type: 'text', languages: [options.language || 'en'] }],
    expectedOutputs: [{ type: 'text', languages: [options.language || 'en'] }]
  });
};

export const loadSystemPrompt = async path => (await Promise.all([path].flat().map(async url => {
  const response = await fetch(url);
  if(!response.ok) throw new Error(`Could not load the system prompt "${url}" (${response.status})`);
  return (await response.text()).trim();
}))).join('\n\n');

const exampleArguments = tool => Object.fromEntries(Object.keys(tool.inputSchema?.properties || {}).map(key => ['' + key, '...']));

const describeTools = tools => `You can use tools, to do things and to get information. To call a tool, reply with a single line and nothing else, in exactly this format, starting with ${TOOL_CALL} and not inside a code block:
${TOOL_CALL} {"name": "toolName", "arguments": {}}
For example, to use ${tools[0].name}: ${TOOL_CALL} ${JSON.stringify({ name: tools[0].name, arguments: exampleArguments(tools[0]) })}
The next message starts with TOOL_RESULT and gives you what happened or the information you asked for. Then answer the user in plain words, using it. Call a tool whenever the request needs one: to do what it does, or to get information you do not have, before you answer. Never say you did something unless you called the tool and got its TOOL_RESULT.

Tools:
${tools.map(tool => `- ${tool.name}: ${tool.description.replace(/\.?\s*$/, '.')} Arguments (JSON Schema): ${JSON.stringify(tool.inputSchema || { type: 'object', properties: {} })}`).join('\n')}`;

// A small model sometimes writes the call as a bare JSON object, with no TOOL_CALL in front,
// maybe inside a code fence. A reply that starts like that is held back until it is complete.
const BARE_CALL = /^(```[\w-]*\s*)?\{/;
const BARE_START = /^`{1,3}[\w-]*\s*$/;

const bareCall = (text, tools) => {
  try {
    const json = text.trim().replace(/^```[\w-]*\s*/, '').replace(/\s*```$/, '');
    const call = JSON.parse(json);
    return tools.some(tool => tool.name === (call.name ?? call.tool)) ? json : null;
  } catch(error){
    return null;
  }
};

const runTool = async (tools, text, log) => {
  try {
    const call = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    const name = call.name ?? call.tool;
    const args = call.arguments ?? call.parameters ?? call.args ?? {};
    log(`TOOL CALL: ${name}(${JSON.stringify(args)})`);
    const tool = tools.find(t => t.name === name);
    if(!tool){
      log(`TOOL ERROR: there is no tool named "${name}"`);
      return `TOOL_RESULT error: there is no tool named "${name}".`;
    }
    const result = await tool.execute(args);
    log(`TOOL RESULT (${String(result).length} characters):\n${result}`);
    return `TOOL_RESULT ${name}: ${result}`;
  } catch(error){
    log(`TOOL ERROR: ${error.message} (the model wrote: ${text.slice(0, 300)})`);
    return `TOOL_RESULT error: ${error.message}`;
  }
};

/*
  options:
    path               URL of a text/markdown file holding the system prompt, or an array of
                       URLs whose texts are joined in order
    systemPrompt       the system prompt as a string (ignored when `path` is set)
    history            earlier turns to start from: [{ role: 'user' | 'assistant', content }].
                       The oldest turns are dropped if they do not fit the model's context
    language           language code for the input and output, default 'en'
    temperature, topK  sampling parameters, passed through when set
    onDownloadProgress called with a number from 0 to 1 while the model downloads
    tools              array of { name, description, inputSchema, execute(args) } the model can call
    onLog              called with a line of plain text for each step: the system prompt, each
                       message sent to the model, its raw reply, each tool call and result
    signal             AbortSignal that cancels creating the session
*/
export const createSession = async (options = {}) => {
  if(!isSupported()) throw new Error('The Prompt API is not available in this browser');
  if(!warned){
    warned = true;
    console.warn('[promptApi] VERY EXPERIMENTAL: the browser\'s built-in AI is tiny and, in testing, could not answer a single question correctly. Do not rely on it.');
  }
  const { path, language = 'en', temperature, topK, tools = [], onDownloadProgress, signal } = options;
  const log = options.onLog || (() => {});
  const files = [path].flat().filter(Boolean).length ? await loadSystemPrompt(path) : (options.systemPrompt || '').trim();
  const systemPrompt = [files, tools.length && describeTools(tools)].filter(Boolean).join('\n\n');
  let history = [...(options.history || [])];
  let session;
  while(!session){
    try {
      session = await LanguageModel.create({
        initialPrompts: [...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []), ...history],
        expectedInputs: [{ type: 'text', languages: [language] }],
        expectedOutputs: [{ type: 'text', languages: [language] }],
        ...(temperature !== undefined && { temperature }),
        ...(topK !== undefined && { topK }),
        ...(signal && { signal }),
        monitor: monitor => monitor.addEventListener('downloadprogress', e => onDownloadProgress?.(e.loaded))
      });
    } catch(error){
      if(error.name !== 'QuotaExceededError') throw error;
      if(!history.length) throw new Error('The system prompt is too long for the browser\'s model. Use shorter or fewer files.');
      history = history.slice(2);
    }
  }
  const usage = () => session.inputQuota ? `${session.inputUsage}/${session.inputQuota} tokens` : `unknown (the browser reports inputUsage=${session.inputUsage}, inputQuota=${session.inputQuota})`;
  log(`SESSION CREATED
tools: ${tools.map(tool => tool.name).join(', ') || '(none)'}
earlier turns given to the model: ${history.length}${history.length < (options.history || []).length ? ` (${options.history.length - history.length} oldest left out to fit)` : ''}
context used so far: ${usage()}
----- SYSTEM PROMPT (${systemPrompt.length} characters) -----
${systemPrompt}
----- END OF SYSTEM PROMPT -----${history.map(turn => `\n[${turn.role}] ${turn.content}`).join('')}`);

  const promptStreaming = async function*(text, { signal } = {}){
    let input = text;
    let separate = false;
    for(let round = 0; round <= MAX_TOOL_ROUNDS; round++){
      let received = '';
      let sent = 0;
      let callAt = -1;
      log(`SENT TO THE MODEL (round ${round + 1}):\n${input}`);
      for await(const chunk of session.promptStreaming(input, { signal })){
        received += chunk;
        if(!tools.length){
          yield chunk;
          continue;
        }
        if(callAt === -1) callAt = received.indexOf(TOOL_CALL);
        if(callAt !== -1 && sent >= callAt) continue;
        if(callAt === -1 && (!received.trim() || BARE_START.test(received.trimStart()) || BARE_CALL.test(received.trimStart()))) continue;
        // Hold back the end of the text while it could still turn out to be the start of a call.
        let held = 0;
        for(let n = Math.min(TOOL_CALL.length - 1, received.length); n > 0 && callAt === -1; n--){
          if(TOOL_CALL.startsWith(received.slice(-n))){
            held = n;
            break;
          }
        }
        const out = received.slice(sent, callAt === -1 ? received.length - held : callAt);
        if(out){
          yield (separate && sent === 0 ? '\n\n' : '') + out;
          sent += out.length;
        }
      }
      log(`MODEL REPLY, raw (round ${round + 1}):\n${received}\n(context used: ${usage()})`);
      if(!tools.length) return;
      let callText = callAt === -1 ? null : received.slice(callAt);
      if(callText === null && BARE_CALL.test(received.trimStart())){
        callText = bareCall(received, tools);
        if(callText) log('The reply is a tool call written without TOOL_CALL in front of it, so it is run as one.');
      }
      if(callText === null){
        log('No tool call in the reply, so it is the final answer.');
        const rest = received.slice(sent);
        if(rest) yield (separate && sent === 0 ? '\n\n' : '') + rest;
        return;
      }
      if(callAt !== -1) log(`TOOL_CALL found at character ${callAt}.${sent > 0 ? ' The text before it was shown to the user.' : ''}`);
      separate = separate || sent > 0;
      input = await runTool(tools, callText, log);
    }
    log(`Stopped after ${MAX_TOOL_ROUNDS + 1} rounds of tool calls without a final answer.`);
  };

  return {
    systemPrompt,
    get inputUsage(){ return session.inputUsage; },
    get inputQuota(){ return session.inputQuota; },
    promptStreaming,
    prompt: async (text, promptOptions) => {
      let reply = '';
      for await(const chunk of promptStreaming(text, promptOptions)) reply += chunk;
      return reply;
    },
    destroy: () => session.destroy()
  };
};
