import PageBuilder from '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const markdown = (id, text) => ({ id, type: 'markdown', attrs: { markdown: text }, slots: {} });

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

/* The element a widget is drawn with on the page (the editor element in the builder), once the page has drawn it. */
const drawnElement = async (builder, id) => {
  const doc = builder.renderRoot.querySelector('iframe').contentDocument;
  for(let tries = 0; tries < 50; tries++){
    const found = doc.querySelector(`[data-pb-id="${id}"]`);
    if(found) return found;
    await wait(50);
  }
  return null;
};

/*
  Tests
*/
export default {
  'should show a borderless textarea to type markdown in, with the focus, when the widget is selected': async ({ pass, fail }) => {
    const builder = await createBuilder(page(markdown('m1', '# Old')));
    builder.select('m1');
    await wait(400);
    const element = await drawnElement(builder, 'm1');
    const textarea = element?.shadowRoot?.querySelector('textarea');
    const css = String(element?.constructor.styles?.cssText ?? '');
    const focused = element?.shadowRoot?.activeElement === textarea;
    cleanup(builder);
    if(!textarea) return fail('A selected markdown widget should show a textarea to type in');
    if(!/\.draft\s*\{[^}]*border:\s*0[^}]*background:\s*transparent/.test(css)) return fail('The textarea should be styled with no border and a transparent background');
    if(!focused) return fail('The textarea should have the focus when the widget is selected');
    pass('The markdown textarea is borderless and has the focus');
  },

  'should open the textarea with one click on the rendered markdown, without selecting it first': async ({ pass, fail }) => {
    const builder = await createBuilder(page(markdown('m1', '# Rendered')));
    const element = await drawnElement(builder, 'm1');
    const before = !!element?.shadowRoot?.querySelector('textarea');
    element?.shadowRoot?.querySelector('.rendered')?.click();
    await wait(300);
    const textarea = element?.shadowRoot?.querySelector('textarea');
    cleanup(builder);
    if(before) return fail('The markdown should be rendered until it is clicked');
    if(!textarea) return fail('A click on the rendered markdown should open the textarea');
    pass('One click opens the textarea');
  },

  'should render the markdown when the widget loses focus, and save a changed text': async ({ pass, fail }) => {
    const builder = await createBuilder(page(markdown('m1', '# Old')));
    builder.select('m1');
    await wait(400);
    const element = await drawnElement(builder, 'm1');
    const textarea = element.shadowRoot.querySelector('textarea');
    textarea.value = '# New';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.blur();
    await wait(500);
    const stored = builder.value.slots.default[0].attrs.markdown;
    const redrawn = await drawnElement(builder, 'm1');
    const heading = redrawn?.shadowRoot?.querySelector('k-markdown h1')?.textContent.trim();
    cleanup(builder);
    if(stored !== '# New') return fail(`Losing focus should save the typed markdown, stored: ${stored}`);
    if(heading !== 'New') return fail(`The markdown should be rendered, the heading is "${heading}"`);
    pass('Losing focus renders the markdown and saves the change');
  },

  'should keep an edit when the markdown is clicked to edit again': async ({ pass, fail }) => {
    const builder = await createBuilder(page(markdown('m1', '# Old')));
    builder.select('m1');
    await wait(400);
    const element = await drawnElement(builder, 'm1');
    const textarea = element.shadowRoot.querySelector('textarea');
    textarea.value = '# Edited';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.blur();
    await wait(300);
    element.shadowRoot.querySelector('.rendered').click();
    await wait(300);
    const again = element.shadowRoot.querySelector('textarea')?.value;
    cleanup(builder);
    if(again !== '# Edited') return fail(`Clicking again should edit the saved text, the textarea has "${again}"`);
    pass('Clicking the markdown again keeps the edit');
  },

  'should show a placeholder in an empty markdown widget, so it can be clicked': async ({ pass, fail }) => {
    const builder = await createBuilder(page(markdown('m1', '')));
    const element = await drawnElement(builder, 'm1');
    const placeholder = element?.shadowRoot?.querySelector('.placeholder')?.textContent.trim();
    cleanup(builder);
    if(placeholder !== 'Click here to edit using Markdown') return fail(`An empty markdown widget should show a placeholder, got "${placeholder}"`);
    pass('An empty markdown widget shows a placeholder');
  },

  'should not record a change when the markdown is unchanged': async ({ pass, fail }) => {
    const builder = await createBuilder(page(markdown('m1', '# Same')));
    let changes = 0;
    builder.addEventListener('change', () => changes++);
    builder.select('m1');
    await wait(400);
    const element = await drawnElement(builder, 'm1');
    element.shadowRoot.querySelector('textarea').blur();
    await wait(300);
    cleanup(builder);
    if(changes !== 0) return fail(`Leaving the markdown without an edit should record nothing, recorded ${changes}`);
    pass('An unchanged markdown records nothing');
  }
};
