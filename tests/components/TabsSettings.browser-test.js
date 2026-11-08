import '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const text = (id, html) => ({ id, type: 'text', attrs: { html }, slots: {} });

const tab = (id, label, attrs = {}, ...children) => ({ id, type: 'tab-item', attrs: { label, ...attrs }, slots: { default: children } });

const spacer = id => ({ id, type: 'tab-spacer', attrs: {}, slots: {} });

const tabs = (attrs, ...items) => ({ id: 'tb', type: 'tabs', attrs, slots: { default: items } });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const settingsOf = async (builder, id = 'tb') => {
  builder.select(id);
  await wait(400);
  const panel = builder.renderRoot.querySelector('k-page-builder-settings');
  await panel.updateComplete;
  const settings = panel.shadowRoot.querySelector('k-page-builder-tabs-settings');
  await settings?.updateComplete;
  return settings;
};

const frameDoc = builder => builder.renderRoot.querySelector('iframe').contentDocument;

const waitForWidget = async (builder, id) => {
  for(let tries = 0; tries < 50; tries++){
    const found = frameDoc(builder).querySelector(`[data-pb-id="${id}"]`);
    if(found) return found;
    await wait(50);
  }
  return null;
};

const items = builder => builder.value.slots.default[0].slots.default;

const ids = builder => items(builder).map(item => item.id).join();

const refresh = async settings => {
  await wait(400);
  await settings.updateComplete;
};

const panelOf = (settings, index) => settings.shadowRoot.querySelector(`k-accordion-panel[name="pb-tab-${index}"]`);

const spacerRows = settings => [...settings.shadowRoot.querySelectorAll('.p.b.mbq')];

const buttonIn = (container, label) => [...container.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label);

const typeInto = async (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await wait(400);
};

/*
  Tests
*/
export default {
  'should list each tab in an accordion with its title, name and icon, and a row for each spacer': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One', { name: 'first' }), spacer('s'), tab('b', 'Two'))));
    const settings = await settingsOf(builder);
    if(!settings){ builder.remove(); return fail('The tabs settings did not load'); }
    const headers = [...settings.shadowRoot.querySelectorAll('k-accordion-header')].map(header => header.textContent.trim());
    const first = panelOf(settings, 0);
    const title = first.querySelector('#pb-tab-0-label')?.value;
    const name = first.querySelector('#pb-tab-0-name')?.value;
    const icon = !!first.querySelector('#pb-tab-0-icon');
    const rows = spacerRows(settings).map(row => row.querySelector('span').textContent.replace('Pushes the tabs after it to the right.', '').trim());
    const tabLabels = [...first.querySelectorAll('label')].map(label => label.textContent.trim().split('\n')[0].trim().slice(0, 10));
    builder.remove();
    if(headers.join() !== 'One,Two') return fail(`The accordion should list the tabs by title, got ${headers.join()}`);
    if(title !== 'One' || name !== 'first' || !icon) return fail(`A tab has a title, a name and an icon, got "${title}" "${name}" ${icon}`);
    if(rows.join() !== 'Tab spacer') return fail(`The spacer should be listed in the same list, got ${rows.join()}`);
    if(!tabLabels.some(label => label.startsWith('Title')) || !tabLabels.some(label => label.startsWith('Name'))) return fail(`The fields are labelled Title and Name, got ${tabLabels.join()}`);
    pass('Tabs and spacers are listed');
  },

  'should add a tab with Add tab and a spacer with Add spacer, in the order they were added': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'))));
    const settings = await settingsOf(builder);
    const buttons = [...settings.shadowRoot.querySelectorAll('.btn-grp.full button')];
    const labels = buttons.map(item => item.textContent.trim());
    buttons.find(item => item.textContent.trim() === 'Add spacer').click();
    await refresh(settings);
    buttons.find(item => item.textContent.trim() === 'Add tab').click();
    await refresh(settings);
    const types = items(builder).map(item => item.type).join();
    const added = items(builder)[2];
    builder.remove();
    if(labels.join() !== 'Add tab,Add spacer') return fail(`Add tab and Add spacer should sit together, got ${labels.join()}`);
    if(types !== 'tab-item,tab-spacer,tab-item') return fail(`Expected a tab, a spacer and a tab, got ${types}`);
    if(added.attrs.label !== 'Tab') return fail(`A new tab is titled Tab, got "${added.attrs.label}"`);
    pass('Tabs and spacers are added');
  },

  'should move a tab or a spacer, and remove one, from the same list': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'), spacer('s'), tab('b', 'Two'), tab('c', 'Three'))));
    const settings = await settingsOf(builder);
    buttonIn(panelOf(settings, 2), 'Move left').click();
    await refresh(settings);
    const afterTab = ids(builder);
    buttonIn(spacerRows(settings)[0], 'Move right').click();
    await refresh(settings);
    const afterSpacer = ids(builder);
    buttonIn(panelOf(settings, 0), 'Remove').click();
    await refresh(settings);
    const afterRemove = ids(builder);
    buttonIn(spacerRows(settings)[0], 'Remove').click();
    await refresh(settings);
    const afterSpacerRemove = ids(builder);
    builder.remove();
    if(afterTab !== 'a,b,s,c') return fail(`Moving a tab left past the spacer, got ${afterTab}`);
    if(afterSpacer !== 'a,b,c,s') return fail(`Moving the spacer right, got ${afterSpacer}`);
    if(afterRemove !== 'b,c,s') return fail(`Removing the first tab, got ${afterRemove}`);
    if(afterSpacerRemove !== 'b,c') return fail(`Removing the spacer, got ${afterSpacerRemove}`);
    pass('Tabs and spacers move and are removed');
  },

  'should disable moving the first entry left and the last entry right': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'), tab('b', 'Two'), spacer('s'))));
    const settings = await settingsOf(builder);
    const firstLeft = buttonIn(panelOf(settings, 0), 'Move left').disabled;
    const firstRight = buttonIn(panelOf(settings, 0), 'Move right').disabled;
    const lastRight = buttonIn(spacerRows(settings)[0], 'Move right').disabled;
    const lastLeft = buttonIn(spacerRows(settings)[0], 'Move left').disabled;
    builder.remove();
    if(!firstLeft || firstRight) return fail('The first entry cannot move left but can move right');
    if(!lastRight || lastLeft) return fail('The last entry cannot move right but can move left');
    pass('The ends cannot move out');
  },

  'should offer only the tabs, not the spacers, as the default open tab, and open the tab that is chosen': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One', {}, text('ta', '<p>A</p>')), spacer('s'), tab('b', 'Two', {}, text('tb', '<p>B</p>')))));
    const settings = await settingsOf(builder);
    const select = settings.shadowRoot.querySelector('#pb-tabs-default');
    const options = [...select.options].map(option => option.textContent.trim());
    const first = select.value;
    select.value = 'b';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await refresh(settings);
    await waitForWidget(builder, 'tb');
    const active = frameDoc(builder).querySelector('k-tabs').getAttribute('active');
    const stored = builder.value.slots.default[0].attrs.active;
    builder.remove();
    if(options.join() !== 'One,Two') return fail(`Only the tabs are offered, got ${options.join()}`);
    if(first !== 'a') return fail(`The first tab is chosen until another is, got ${first}`);
    if(stored !== 'b') return fail(`The tab is stored by its id, got ${stored}`);
    if(active !== 'pb-b') return fail(`The tabs should open the chosen tab, got active="${active}"`);
    pass('The default open tab is chosen');
  },

  'should not offer a default open tab when there are only spacers': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, spacer('s'))));
    const settings = await settingsOf(builder);
    const select = settings.shadowRoot.querySelector('#pb-tabs-default');
    builder.remove();
    if(select) return fail('With no tabs there is no tab to open');
    pass('No choice without tabs');
  },

  'should set the title of a tab, and show it on the tab on the page': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'), tab('b', 'Two'))));
    const settings = await settingsOf(builder);
    await typeInto(panelOf(settings, 1).querySelector('#pb-tab-1-label'), 'Details');
    await waitForWidget(builder, 'tb');
    const label = [...frameDoc(builder).querySelectorAll('k-tab')][1]?.textContent.trim();
    const stored = items(builder)[1].attrs.label;
    builder.remove();
    if(stored !== 'Details') return fail(`The title should be stored, got ${stored}`);
    if(label !== 'Details') return fail(`The tab on the page should show the title, got ${label}`);
    pass('A tab title is set');
  },

  'should name a tab apart from its title, and make a name from the id when it is empty or already used': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'), tab('b', 'Two'), tab('c', 'Three'))));
    const settings = await settingsOf(builder);
    await typeInto(panelOf(settings, 0).querySelector('#pb-tab-0-name'), 'my first!');
    await typeInto(panelOf(settings, 1).querySelector('#pb-tab-1-name'), 'my first!');
    await waitForWidget(builder, 'tb');
    const names = [...frameDoc(builder).querySelectorAll('k-tab')].map(item => item.getAttribute('for'));
    const stored = items(builder).map(item => item.attrs.name);
    builder.remove();
    if(stored[0] !== 'my first!') return fail(`The name should be stored as typed, got ${stored[0]}`);
    if(names[0] !== 'my-first') return fail(`A name is letters, numbers and dashes, got ${names[0]}`);
    if(names[1] !== 'pb-b') return fail(`A name an earlier tab has falls back to the id, got ${names[1]}`);
    if(names[2] !== 'pb-c') return fail(`A tab with no name uses its id, got ${names[2]}`);
    pass('Tabs are named apart from their titles');
  },

  'should choose an icon for a tab, shown on the tab on the page': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'), tab('b', 'Two'))));
    const settings = await settingsOf(builder);
    const selector = panelOf(settings, 0).querySelector('#pb-tab-0-icon');
    selector.dispatchEvent(new CustomEvent('change', { detail: { value: 'settings' }, bubbles: true }));
    await refresh(settings);
    await waitForWidget(builder, 'tb');
    const icon = frameDoc(builder).querySelector('k-tab k-icon')?.getAttribute('name');
    builder.remove();
    if(icon !== 'settings') return fail(`The tab should show the icon, got ${icon}`);
    pass('A tab has an icon');
  },

  'should have the settings of the tabs component, named as in its docs': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'))));
    const settings = await settingsOf(builder);
    const fields = settings.shadowRoot.querySelector('k-page-builder-fields');
    await fields.updateComplete;
    const labels = [...fields.shadowRoot.querySelectorAll('k-toggle, label')].map(item => item.textContent.replace(/\s+/g, ' ').trim());
    builder.remove();
    for(const label of ['Fixed height', 'Hash routing', 'Persistent ID']){
      if(!labels.some(text => text.startsWith(label))) return fail(`${label} is missing, got ${labels.join(' | ')}`);
    }
    if(labels.some(text => /^Remember/i.test(text))) return fail('The setting is called Persistent ID, as in the docs');
    pass('The tabs settings are shown');
  },

  'should store a persistent id and hash routing, without the builder routing or remembering them': async ({ pass, fail }) => {
    const builder = await createBuilder(page(tabs({}, tab('a', 'One'), tab('b', 'Two'))));
    const settings = await settingsOf(builder);
    const fields = settings.shadowRoot.querySelector('k-page-builder-fields');
    await fields.updateComplete;
    await typeInto(fields.shadowRoot.querySelector('#pb-field-persistentId'), 'main-tabs');
    builder.setWidgetAttribute('tb', 'hashRouting', true, false);
    await wait(500);
    await waitForWidget(builder, 'tb');
    const attrs = builder.value.slots.default[0].attrs;
    const element = frameDoc(builder).querySelector('k-tabs');
    const written = ['hash-routing', 'persistent-id'].map(name => element.hasAttribute(name));
    builder.remove();
    if(attrs.persistentId !== 'main-tabs' || attrs.hashRouting !== true) return fail(`The settings are stored, got ${JSON.stringify(attrs)}`);
    if(written.some(Boolean)) return fail('The builder must not route to the address or remember the tab');
    pass('Hash routing and the persistent id are stored for the page');
  },

  'should make the tabs fill a group with a height when Fixed height is on': async ({ pass, fail }) => {
    const group = { id: 'g', type: 'group', attrs: { height: 320, heightUnit: 'px' }, slots: { default: [tabs({ fixedHeight: true }, tab('a', 'One'), tab('b', 'Two'))] } };
    const builder = await createBuilder(page(group));
    await waitForWidget(builder, 'tb');
    await wait(400);
    const element = frameDoc(builder).querySelector('k-tabs');
    const height = Math.round(element.getBoundingClientRect().height);
    const style = element.getAttribute('style');
    builder.remove();
    if(!/height: 100%/.test(style || '')) return fail(`Fixed height tabs fill their container, got style "${style}"`);
    if(height !== 320) return fail(`The tabs should be as tall as the group, got ${height}px`);
    pass('Fixed height tabs fill a group');
  }
};
