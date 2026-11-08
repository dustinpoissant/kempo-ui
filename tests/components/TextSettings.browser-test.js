import PageBuilder from '../../src/components/PageBuilder.js';
import '../../src/components/pagebuilder/TextSettings.js';

/*
  Utility Functions
*/
const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const text = (id, html) => ({ id, type: 'text', attrs: { html }, slots: {} });

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

const pageHtml = builder => builder.value.slots.default[0].attrs.html;

/* A builder with one text widget selected, and its settings element. */
const openSettings = async html => {
  const builder = await createBuilder(page(text('t1', html)));
  builder.select('t1');
  await wait(500);
  const settings = deepQuery(builder.renderRoot, 'k-page-builder-text-settings');
  await settings?.updateComplete;
  return { builder, settings };
};

/*
  Tests
*/
export default {
  'should draw a text widget on the page as its own markup, with no editor in it': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>Hello there</p>')));
    const doc = builder.renderRoot.querySelector('iframe').contentDocument;
    const drawn = doc.querySelector('[data-pb-id="t1"]');
    const shown = drawn?.innerHTML ?? '';
    const hasEditor = !!drawn?.querySelector('k-page-builder-text-editor, k-html-editor');
    cleanup(builder);
    if(!shown.includes('<p>Hello there</p>')) return fail(`The text should be drawn as its markup, got: ${shown}`);
    if(hasEditor) return fail('The text widget should not draw a rich text editor on the page');
    pass('The text is drawn without an editor');
  },

  'should show an Edit text button in the settings of a selected text widget': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings('<p>Hi</p>');
    const button = settings ? deepQuery(settings.shadowRoot, 'button.primary') : null;
    const label = button?.textContent.trim();
    cleanup(builder);
    if(!settings) return fail('A text widget should have its own settings element');
    if(label !== 'Edit text') return fail(`The settings should have an Edit text button, got "${label}"`);
    pass('The settings have an Edit text button');
  },

  'should edit the text in a dialog, and store it when saved': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings('<p>Before</p>');
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(400);
    const dialog = settings.shadowRoot.querySelector('k-dialog');
    const editor = dialog?.querySelector('k-html-editor');
    if(!editor) { cleanup(builder); return fail('Edit should open a dialog with the rich text editor in it'); }
    editor.value = '<p>After</p>';
    await wait(300);
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    dialog.shadowRoot.querySelector('#confirm').click();
    await wait(400);
    const stored = pageHtml(builder);
    cleanup(builder);
    if(!stored.includes('After')) return fail(`Saving should store the edited text, stored: ${stored}`);
    if(stored.includes('Before')) return fail('The old text should be replaced when saved');
    pass('Saving the dialog stores the edited text');
  },

  'should leave the text alone when the dialog is cancelled': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings('<p>Keep me</p>');
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(400);
    const dialog = settings.shadowRoot.querySelector('k-dialog');
    const editor = dialog?.querySelector('k-html-editor');
    if(!editor) { cleanup(builder); return fail('Edit should open a dialog with the rich text editor in it'); }
    editor.value = '<p>Discarded</p>';
    await wait(300);
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    dialog.shadowRoot.querySelector('#cancel').click();
    await wait(400);
    const stored = pageHtml(builder);
    cleanup(builder);
    if(!stored.includes('Keep me')) return fail(`Cancel should keep the text, stored: ${stored}`);
    if(stored.includes('Discarded')) return fail('Cancel should not store the edit');
    pass('Cancelling the dialog keeps the text');
  }
};
