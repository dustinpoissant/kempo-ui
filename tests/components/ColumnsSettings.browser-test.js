import '../../src/components/PageBuilder.js';
import { widgets, registryOf } from '../../src/utils/pageWidgets.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const text = (id, html) => ({ id, type: 'text', attrs: { html }, slots: {} });

const column = (id, attrs = {}, ...children) => ({ id, type: 'column', attrs, slots: { default: children } });

const columns = (...list) => ({ id: 'cols', type: 'columns', attrs: {}, slots: { default: list } });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const settingsOf = async builder => {
  builder.select('cols');
  await wait(400);
  const panel = builder.renderRoot.querySelector('k-page-builder-settings');
  await panel.updateComplete;
  const settings = panel.shadowRoot.querySelector('k-page-builder-columns-settings');
  await settings?.updateComplete;
  return settings;
};

const frameDoc = builder => builder.renderRoot.querySelector('iframe').contentDocument;

const list = builder => builder.value.slots.default[0].slots.default;

const refresh = async settings => {
  await wait(400);
  await settings.updateComplete;
};

const panelOf = (settings, index) => settings.shadowRoot.querySelector(`k-accordion-panel[name="pb-column-${index}"]`);

const buttonIn = (container, label) => [...container.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label);

/*
  Tests
*/
export default {
  'should be the columns widget, titled Columns, in the layout group': async ({ pass, fail }) => {
    const registry = registryOf(widgets);
    const definition = registry.get('columns');
    if(!definition) return fail('The columns widget is not registered');
    if(definition.title !== 'Columns' || definition.category !== 'layout') return fail(`Expected "Columns" in layout, got "${definition.title}" in ${definition.category}`);
    if(registry.has('row')) return fail('The widget is no longer called row');
    pass('The row widget is Columns');
  },

  'should start with two columns when it is added, and list them in an accordion': async ({ pass, fail }) => {
    const builder = await createBuilder(page());
    builder.insert('columns');
    await wait(600);
    const added = builder.value.slots.default[0];
    const types = (added?.slots.default || []).map(item => item.type).join();
    const settings = await (async () => {
      builder.select(added.id);
      await wait(400);
      const panel = builder.renderRoot.querySelector('k-page-builder-settings');
      await panel.updateComplete;
      return panel.shadowRoot.querySelector('k-page-builder-columns-settings');
    })();
    await settings.updateComplete;
    const headers = [...settings.shadowRoot.querySelectorAll('k-accordion-header')].map(header => header.textContent.trim());
    builder.remove();
    if(added?.type !== 'columns') return fail(`Adding Columns should add a columns widget, got ${added?.type}`);
    if(types !== 'column,column') return fail(`It should start with two columns, got ${types}`);
    if(headers.join() !== 'Column 1,Column 2') return fail(`Each column is listed, got ${headers.join()}`);
    pass('Columns start with two columns');
  },

  'should add a column with Add column, after the others': async ({ pass, fail }) => {
    const builder = await createBuilder(page(columns(column('a', {}, text('ta', '<p>A</p>')), column('b'))));
    const settings = await settingsOf(builder);
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const columnsNow = list(builder);
    const headers = settings.shadowRoot.querySelectorAll('k-accordion-header').length;
    builder.remove();
    if(columnsNow.length !== 3 || columnsNow[2].type !== 'column') return fail(`Add column should add a column, got ${columnsNow.length}`);
    if(columnsNow[0].slots.default.length !== 1) return fail('The other columns keep their content');
    if(headers !== 3) return fail(`The list should show the new column, got ${headers}`);
    pass('A column is added');
  },

  'should move a column left or right, keeping its content': async ({ pass, fail }) => {
    const builder = await createBuilder(page(columns(column('a', {}, text('ta', '<p>A</p>')), column('b'), column('c'))));
    const settings = await settingsOf(builder);
    const firstLeft = buttonIn(panelOf(settings, 0), 'Move left').disabled;
    const lastRight = buttonIn(panelOf(settings, 2), 'Move right').disabled;
    buttonIn(panelOf(settings, 1), 'Move left').click();
    await refresh(settings);
    const afterLeft = list(builder).map(item => item.id).join();
    buttonIn(panelOf(settings, 0), 'Move right').click();
    await refresh(settings);
    const afterRight = list(builder).map(item => item.id).join();
    const content = list(builder).find(item => item.id === 'a').slots.default.length;
    builder.remove();
    if(!firstLeft || !lastRight) return fail('The first column cannot move left, and the last cannot move right');
    if(afterLeft !== 'b,a,c') return fail(`Moving column 2 left, got ${afterLeft}`);
    if(afterRight !== 'a,b,c') return fail(`Moving column 1 right, got ${afterRight}`);
    if(content !== 1) return fail('A moved column keeps its content');
    pass('Columns move');
  },

  'should remove a column, moving its widgets into the column before it so nothing is lost': async ({ pass, fail }) => {
    const builder = await createBuilder(page(columns(column('a', {}, text('ta', '<p>A</p>')), column('b', {}, text('tb', '<p>B</p>')), column('c', {}, text('tc', '<p>C</p>')))));
    const settings = await settingsOf(builder);
    buttonIn(panelOf(settings, 1), 'Remove column').click();
    await refresh(settings);
    const now = list(builder);
    builder.remove();
    if(now.map(item => item.id).join() !== 'a,c') return fail(`Removing column 2 leaves columns 1 and 3, got ${now.map(item => item.id).join()}`);
    if(now[0].slots.default.map(item => item.id).join() !== 'ta,tb') return fail(`The removed column's widgets go to the column before it, got ${now[0].slots.default.map(item => item.id).join()}`);
    if(now[1].slots.default.map(item => item.id).join() !== 'tc') return fail('The columns after it are not changed');
    pass('A removed column keeps its widgets');
  },

  'should move the widgets of a removed first column into the column after it': async ({ pass, fail }) => {
    const builder = await createBuilder(page(columns(column('a', {}, text('ta', '<p>A</p>')), column('b', {}, text('tb', '<p>B</p>')))));
    const settings = await settingsOf(builder);
    buttonIn(panelOf(settings, 0), 'Remove column').click();
    await refresh(settings);
    const now = list(builder);
    builder.remove();
    const kept = (now[0]?.slots.default || []).map(item => item.id).sort().join();
    if(now.length !== 1 || kept !== 'ta,tb') return fail(`The first column's widgets go into the next column, so nothing is lost, got ${JSON.stringify(now.map(item => item.slots.default.map(child => child.id)))}`);
    pass('The first column can be removed');
  },

  'should not let the last column be removed': async ({ pass, fail }) => {
    const builder = await createBuilder(page(columns(column('a', {}, text('ta', '<p>A</p>')))));
    const settings = await settingsOf(builder);
    const remove = buttonIn(panelOf(settings, 0), 'Remove column');
    const disabled = remove.disabled;
    remove.click();
    await wait(300);
    const length = list(builder).length;
    builder.remove();
    if(!disabled) return fail('Remove column should be disabled for the only column');
    if(length !== 1) return fail('The only column must stay');
    pass('Columns need a column');
  },

  'should set the width of a column at each screen size, and size it on the page': async ({ pass, fail }) => {
    const builder = await createBuilder(page(columns(column('a'), column('b'))));
    const settings = await settingsOf(builder);
    const select = settings.shadowRoot.querySelector('#pb-column-1-tablet');
    select.value = '4';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await refresh(settings);
    await wait(300);
    const stored = list(builder)[1].attrs.tablet;
    const classes = frameDoc(builder).querySelector('[data-pb-id="b"]')?.className || '';
    builder.remove();
    if(stored !== '4') return fail(`The tablet width is stored, got ${stored}`);
    if(!/\bt-span-4\b/.test(classes)) return fail(`The column on the page should have t-span-4, got ${classes}`);
    pass('A column width is set');
  }
};
