import '../../src/components/PageBuilder.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const text = (id, html) => ({ id, type: 'text', attrs: { html }, slots: {} });

const section = (id, title, attrs = {}, ...children) => ({ id, type: 'accordion-item', attrs: { title, ...attrs }, slots: { default: children } });

const accordion = (attrs, ...sections) => ({ id: 'ac', type: 'accordion', attrs, slots: { default: sections } });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const settingsOf = async builder => {
  builder.select('ac');
  await wait(400);
  const panel = builder.renderRoot.querySelector('k-page-builder-settings');
  await panel.updateComplete;
  const settings = panel.shadowRoot.querySelector('k-page-builder-accordion-settings');
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

const sections = builder => builder.value.slots.default[0].slots.default;

const ids = builder => sections(builder).map(item => item.id).join();

const refresh = async settings => {
  await wait(400);
  await settings.updateComplete;
};

const panelOf = (settings, index) => settings.shadowRoot.querySelector(`k-accordion-panel[name="pb-section-${index}"]`);

const buttonIn = (container, label) => [...container.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label);

const toggle = async (settings, index, value) => {
  panelOf(settings, index).querySelector(`#pb-section-${index}-open`).dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  await refresh(settings);
};

const openOnPage = async builder => {
  await waitForWidget(builder, 'ac');
  await wait(300);
  return [...frameDoc(builder).querySelectorAll('k-accordion-panel[active]')].map(panel => panel.getAttribute('name')).join();
};

/*
  Tests
*/
export default {
  'should list each section by its heading, with a heading, an icon and an Open by default toggle': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'First'), section('b', 'Second'))));
    const settings = await settingsOf(builder);
    if(!settings){ builder.remove(); return fail('The accordion settings did not load'); }
    const headers = [...settings.shadowRoot.querySelectorAll('k-accordion-header')].map(header => header.textContent.trim());
    const first = panelOf(settings, 0);
    const heading = first.querySelector('#pb-section-0-title')?.value;
    const icon = !!first.querySelector('#pb-section-0-icon');
    const open = first.querySelector('#pb-section-0-open');
    builder.remove();
    if(headers.join() !== 'First,Second') return fail(`Sections are listed by heading, got ${headers.join()}`);
    if(heading !== 'First' || !icon) return fail(`A section has a heading and an icon, got "${heading}" ${icon}`);
    if(!open || !/Open by default/.test(open.textContent)) return fail('A section has an Open by default toggle');
    pass('Each section is listed with its settings');
  },

  'should add a section with Add section, titled Section': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'First', {}, text('t1', '<p>One</p>')))));
    const settings = await settingsOf(builder);
    settings.shadowRoot.querySelector('button.primary').click();
    await refresh(settings);
    const list = sections(builder);
    builder.remove();
    if(list.length !== 2 || list[1].type !== 'accordion-item') return fail(`Add section should add a section, got ${list.length}`);
    if(list[1].attrs.title !== 'Section') return fail(`A new section is titled Section, got "${list[1].attrs.title}"`);
    if(list[0].slots.default.length !== 1) return fail('The other sections keep their content');
    pass('A section is added');
  },

  'should set the heading of a section, and show it on the page': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'First'), section('b', 'Second'))));
    const settings = await settingsOf(builder);
    const input = panelOf(settings, 1).querySelector('#pb-section-1-title');
    input.value = 'Renamed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(500);
    await waitForWidget(builder, 'ac');
    const header = [...frameDoc(builder).querySelectorAll('k-accordion-header')][1]?.textContent.trim();
    builder.remove();
    if(header !== 'Renamed') return fail(`The page should show the heading, got ${header}`);
    pass('A heading is set');
  },

  'should move a section up or down, and remove one, with icon only buttons': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A'), section('b', 'B'), section('c', 'C'))));
    const settings = await settingsOf(builder);
    const labels = [...panelOf(settings, 1).querySelectorAll('.btn-grp button')].map(item => item.getAttribute('aria-label'));
    const iconsOnly = [...panelOf(settings, 1).querySelectorAll('.btn-grp button')].every(item => item.textContent.trim() === '' && item.querySelector('k-icon'));
    const firstUp = buttonIn(panelOf(settings, 0), 'Move up').disabled;
    const lastDown = buttonIn(panelOf(settings, 2), 'Move down').disabled;
    buttonIn(panelOf(settings, 1), 'Move up').click();
    await refresh(settings);
    const afterUp = ids(builder);
    buttonIn(panelOf(settings, 1), 'Move down').click();
    await refresh(settings);
    const afterDown = ids(builder);
    buttonIn(panelOf(settings, 0), 'Remove').click();
    await refresh(settings);
    const afterRemove = ids(builder);
    builder.remove();
    if(labels.join() !== 'Move up,Move down,Remove' || !iconsOnly) return fail(`Move up, Move down and Remove should be icon only buttons, got ${labels.join()}`);
    if(!firstUp || !lastDown) return fail('The first section cannot move up, and the last cannot move down');
    if(afterUp !== 'b,a,c') return fail(`Moving section 2 up, got ${afterUp}`);
    if(afterDown !== 'b,c,a') return fail(`Moving section 2 down, got ${afterDown}`);
    if(afterRemove !== 'c,a') return fail(`Removing the first section, got ${afterRemove}`);
    pass('Sections move and are removed');
  },

  'should start with the first section open, and show that in its toggle': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A'), section('b', 'B'), section('c', 'C'))));
    const settings = await settingsOf(builder);
    const values = [0, 1, 2].map(index => panelOf(settings, index).querySelector(`#pb-section-${index}-open`).value);
    const open = await openOnPage(builder);
    builder.remove();
    if(values.join() !== 'true,false,false') return fail(`Only the first toggle is on, got ${values.join()}`);
    if(open !== 'pb-a') return fail(`Only the first section is open on the page, got ${open}`);
    pass('The first section opens by default');
  },

  'should open a section by default, closing the others, and write the choice on every section': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A'), section('b', 'B'), section('c', 'C'))));
    const settings = await settingsOf(builder);
    await toggle(settings, 1, true);
    const stored = sections(builder).map(item => item.attrs.open).join();
    const open = await openOnPage(builder);
    const values = [0, 1, 2].map(index => panelOf(settings, index).querySelector(`#pb-section-${index}-open`).value).join();
    builder.remove();
    if(stored !== 'false,true,false') return fail(`Choosing the second section stores open on each, got ${stored}`);
    if(open !== 'pb-b') return fail(`Only the second section is open on the page, got ${open}`);
    if(values !== 'false,true,false') return fail(`The toggles should follow, got ${values}`);
    pass('One section is open by default');
  },

  'should leave other sections open when Allow several open at once is on': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({ multiple: true }, section('a', 'A'), section('b', 'B'), section('c', 'C'))));
    const settings = await settingsOf(builder);
    await toggle(settings, 2, true);
    const stored = sections(builder).map(item => item.attrs.open).join();
    const open = await openOnPage(builder);
    builder.remove();
    if(stored !== 'true,false,true') return fail(`The first section stays open and the third opens, got ${stored}`);
    if(open !== 'pb-a,pb-c') return fail(`Both sections should be open on the page, got ${open}`);
    pass('Several sections can open by default');
  },

  'should close every section by default when the open one is turned off': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A'), section('b', 'B'))));
    const settings = await settingsOf(builder);
    await toggle(settings, 0, false);
    const stored = sections(builder).map(item => item.attrs.open).join();
    const open = await openOnPage(builder);
    builder.remove();
    if(stored !== 'false,false') return fail(`Turning the open section off closes every section, got ${stored}`);
    if(open !== '') return fail(`No section is open on the page, got ${open}`);
    pass('A section can start closed');
  },

  'should choose an icon for a section, shown in its heading': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A'), section('b', 'B'))));
    const settings = await settingsOf(builder);
    panelOf(settings, 1).querySelector('#pb-section-1-icon').dispatchEvent(new CustomEvent('change', { detail: { value: 'add' }, bubbles: true }));
    await refresh(settings);
    await waitForWidget(builder, 'ac');
    const icons = [...frameDoc(builder).querySelectorAll('k-accordion-header')].map(header => header.querySelector('k-icon')?.getAttribute('name') || '').join();
    builder.remove();
    if(icons !== ',add') return fail(`Only the second heading should have the icon, got ${icons}`);
    pass('A section has an icon');
  },

  'should have an Allow several open at once setting, which sets multiple on the accordion on the page': async ({ pass, fail }) => {
    const builder = await createBuilder(page(accordion({}, section('a', 'A'), section('b', 'B'))));
    const settings = await settingsOf(builder);
    const fields = settings.shadowRoot.querySelector('k-page-builder-fields');
    await fields.updateComplete;
    const toggleField = fields.shadowRoot.querySelector('#pb-field-multiple');
    builder.setWidgetAttribute('ac', 'multiple', true, false);
    await wait(500);
    await waitForWidget(builder, 'ac');
    const multiple = frameDoc(builder).querySelector('k-accordion').hasAttribute('multiple');
    builder.remove();
    if(!toggleField || !/Allow several open at once/.test(toggleField.textContent)) return fail('The accordion has an Allow several open at once toggle');
    if(!multiple) return fail('The accordion on the page should allow several open');
    pass('Several can be allowed open');
  }
};
