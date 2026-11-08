import PageBuilder from '../../src/components/PageBuilder.js';
import '../../src/components/pagebuilder/ScriptSettings.js';

/*
  Utility Functions
*/
const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const scriptWidget = (id, attrs = {}) => ({ id, type: 'script', attrs, slots: {} });

const wait = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  await wait(400);
  return builder;
};

const cleanup = builder => builder?.remove();

/* Finds an element in a root or in any shadow root under it, for the settings that sit inside other components. */
const deepQuery = (root, selector) => {
  const found = root.querySelector(selector);
  if(found) return found;
  for(const el of root.querySelectorAll('*')){
    const inner = el.shadowRoot && deepQuery(el.shadowRoot, selector);
    if(inner) return inner;
  }
  return null;
};

const storedCode = builder => builder.value.slots.default[0].attrs.code;

/* A builder with one script widget selected, and its settings element. */
const openSettings = async attrs => {
  const builder = await createBuilder(page(scriptWidget('s1', attrs)));
  builder.select('s1');
  await wait(500);
  const settings = deepQuery(builder.renderRoot, 'k-page-builder-script-settings');
  await settings?.updateComplete;
  return { builder, settings };
};

/* All the textareas the settings draw, in itself and in its declared fields. */
const textareas = settings => {
  const fields = deepQuery(settings.shadowRoot, 'k-page-builder-fields');
  return settings.shadowRoot.querySelectorAll('textarea').length + (fields?.shadowRoot.querySelectorAll('textarea').length ?? 0);
};

/*
  Tests
*/
export default {
  'should show an Open code editor button, and no box to type the JavaScript in': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings({ code: 'alert(1)' });
    const button = settings?.shadowRoot.querySelector('button.primary');
    const label = button?.textContent.trim();
    const boxes = settings ? textareas(settings) : -1;
    const editor = settings?.shadowRoot.querySelector('k-code-editor');
    cleanup(builder);
    if(!settings) return fail('A script widget should have its own settings element');
    if(label !== 'Open code editor') return fail(`The settings should have an Open code editor button, got "${label}"`);
    if(boxes !== 0) return fail(`The JavaScript is edited in the code editor, so there should be no textarea, found ${boxes}`);
    if(editor) return fail('The code editor should only be built when the dialog is opened');
    pass('The settings have an Open code editor button and no textarea');
  },

  'should keep the script file and how it loads in the settings': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings({});
    const fields = deepQuery(settings.shadowRoot, 'k-page-builder-fields')?.shadowRoot;
    const text = fields?.textContent.replace(/\s+/g, ' ') ?? '';
    cleanup(builder);
    for(const label of ['Script file', 'Type', 'Defer', 'Async', 'Cross-origin', 'Integrity']) if(!text.includes(label)) return fail(`The settings should still have ${label}`);
    pass('The declared settings stay');
  },

  'should open the full code editor for JavaScript in a dialog that nearly fills the screen': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings({ code: 'console.log("before");' });
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(500);
    const dialog = settings.shadowRoot.querySelector('k-dialog');
    const editor = dialog?.querySelector('k-code-editor');
    const { language, controls, value } = editor ?? {};
    const size = dialog ? getComputedStyle(dialog) : null;
    const width = size?.getPropertyValue('--width').trim();
    const height = size?.getPropertyValue('--height').trim();
    const confirm = dialog?.shadowRoot.querySelector('#confirm')?.textContent.trim();
    cleanup(builder);
    if(!editor) return fail('Open code editor should open a dialog with the code editor in it');
    if(language !== 'javascript') return fail(`The editor should edit JavaScript, got ${language}`);
    if(controls !== 'full') return fail(`The editor should have all its controls, got ${controls}`);
    if(value !== 'console.log("before");') return fail(`The editor should start with the code, got ${value}`);
    if(width !== '96vw' || height !== '94vh') return fail(`The dialog should nearly fill the screen, got ${width} by ${height}`);
    if(confirm !== 'Save JavaScript') return fail(`The save button should say Save JavaScript, got ${confirm}`);
    pass('The JavaScript editor opens in a large dialog');
  },

  'should store the code exactly as written when saved': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings({ code: 'old();' });
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(500);
    const dialog = settings.shadowRoot.querySelector('k-dialog');
    const editor = dialog?.querySelector('k-code-editor');
    if(!editor){ cleanup(builder); return fail('Open code editor should open a dialog with the code editor in it'); }
    const written = 'document.title = "x < y && z";\nfetch("/api").then(r => r.json());';
    editor.value = written;
    await wait(300);
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    dialog.shadowRoot.querySelector('#confirm').click();
    await wait(400);
    const stored = storedCode(builder);
    cleanup(builder);
    if(stored !== written) return fail(`Saving should store the code exactly as written, stored: ${stored}`);
    pass('Saving the dialog stores the code untouched');
  },

  'should leave the code alone when the dialog is cancelled': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings({ code: 'keep();' });
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(500);
    const dialog = settings.shadowRoot.querySelector('k-dialog');
    const editor = dialog?.querySelector('k-code-editor');
    if(!editor){ cleanup(builder); return fail('Open code editor should open a dialog with the code editor in it'); }
    editor.value = 'discarded();';
    await wait(300);
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    dialog.shadowRoot.querySelector('#cancel').click();
    await wait(400);
    const stored = storedCode(builder);
    cleanup(builder);
    if(stored !== 'keep();') return fail(`Cancel should keep the code, stored: ${stored}`);
    pass('Cancelling the dialog keeps the code');
  },

  'should turn the button off while there is a script file, because the code is not used then': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings({ src: '/a.js', code: 'unused();' });
    const button = settings.shadowRoot.querySelector('button.primary');
    const off = button?.disabled;
    const note = settings.shadowRoot.querySelector('small')?.textContent ?? '';
    cleanup(builder);
    if(!off) return fail('With a script file the code editor button should be off');
    if(!/script file/.test(note)) return fail(`The note should say why, got: ${note}`);
    pass('The button is off while a file is set');
  }
};
