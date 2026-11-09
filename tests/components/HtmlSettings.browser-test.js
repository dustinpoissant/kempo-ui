import PageBuilder from '../../src/components/PageBuilder.js';
import '../../src/components/pagebuilder/HtmlSettings.js';

/*
  Utility Functions
*/
const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const htmlWidget = (id, html) => ({ id, type: 'html', attrs: { html }, slots: {} });

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

const cleanup = builder => {
  builder?.remove();
  document.querySelectorAll('k-dialog').forEach(dialog => dialog.remove());
};

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

const storedHtml = builder => builder.value.slots.default[0].attrs.html;

/* A builder with one HTML widget selected, and its settings element. */
const openSettings = async markup => {
  const builder = await createBuilder(page(htmlWidget('h1', markup)));
  builder.select('h1');
  await wait(500);
  const settings = deepQuery(builder.renderRoot, 'k-page-builder-html-settings');
  await settings?.updateComplete;
  return { builder, settings };
};

/*
  Tests
*/
export default {
  'should show an Open code editor button, and no box to type the markup in': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings('<p>Hi</p>');
    const button = settings?.shadowRoot.querySelector('button.primary');
    const label = button?.textContent.trim();
    const box = settings?.shadowRoot.querySelector('textarea');
    const dialogContent = settings?.shadowRoot.querySelector('k-code-editor');
    cleanup(builder);
    if(!settings) return fail('An HTML widget should have its own settings element');
    if(label !== 'Open code editor') return fail(`The settings should have an Open code editor button, got "${label}"`);
    if(box) return fail('The markup is edited in the code editor, so there should be no box for it in the settings');
    if(dialogContent) return fail('The code editor should only be built when the dialog is opened');
    pass('The settings have an Open code editor button');
  },

  'should open the full code editor in a dialog that nearly fills the screen, with the markup in it': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings('<div class="x">Before</div>');
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(500);
    const dialog = document.querySelector('k-dialog[opened]');
    const editor = dialog?.querySelector('k-code-editor');
    const language = editor?.language;
    const controls = editor?.controls;
    const value = editor?.value;
    const size = dialog ? getComputedStyle(dialog) : null;
    const onThePage = dialog?.parentElement === document.body;
    const parent = dialog?.parentElement;
    const width = size?.getPropertyValue('--width').trim();
    const height = size?.getPropertyValue('--height').trim();
    cleanup(builder);
    if(!editor) return fail('Open code editor should open a dialog with the code editor in it');
    if(language !== 'html') return fail(`The editor should edit HTML, got ${language}`);
    if(controls !== 'full') return fail(`The editor should have all its controls, got ${controls}`);
    if(value !== '<div class="x">Before</div>') return fail(`The editor should start with the markup, got ${value}`);
    if(width !== '96vw' || height !== '94vh') return fail(`The dialog should nearly fill the screen, got ${width} by ${height}`);
    if(!onThePage) return fail('The dialog should be opened on the page, not inside the settings panel, so the side navigation of a site cannot cover it');
    pass('The code editor opens in a large dialog, on the page');
  },

  'should store the markup exactly as written when saved, with nothing cleaned': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings('<p>Before</p>');
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(500);
    const dialog = document.querySelector('k-dialog[opened]');
    const editor = dialog?.querySelector('k-code-editor');
    if(!editor){ cleanup(builder); return fail('Open code editor should open a dialog with the code editor in it'); }
    const written = '<script>window.x = 1;</script><div onclick="go()" style="color: red">After</div>';
    editor.value = written;
    await wait(300);
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    dialog.shadowRoot.querySelector('#confirm').click();
    await wait(400);
    const stored = storedHtml(builder);
    cleanup(builder);
    if(stored !== written) return fail(`Saving should store the markup exactly as written, stored: ${stored}`);
    pass('Saving the dialog stores the markup untouched');
  },

  'should leave the markup alone when the dialog is cancelled': async ({ pass, fail }) => {
    const { builder, settings } = await openSettings('<p>Keep me</p>');
    settings.shadowRoot.querySelector('button.primary').click();
    await wait(500);
    const dialog = document.querySelector('k-dialog[opened]');
    const editor = dialog?.querySelector('k-code-editor');
    if(!editor){ cleanup(builder); return fail('Open code editor should open a dialog with the code editor in it'); }
    editor.value = '<p>Discarded</p>';
    await wait(300);
    editor.dispatchEvent(new Event('change', { bubbles: true }));
    dialog.shadowRoot.querySelector('#cancel').click();
    await wait(400);
    const stored = storedHtml(builder);
    cleanup(builder);
    if(stored !== '<p>Keep me</p>') return fail(`Cancel should keep the markup, stored: ${stored}`);
    pass('Cancelling the dialog keeps the markup');
  }
};
