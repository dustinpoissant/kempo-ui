import '../../src/components/PageBuilder.js';
import { widgets, registryOf } from '../../src/utils/pageWidgets.js';

/*
  Utility Functions
*/
const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const createBuilder = async value => {
  const builder = document.createElement('k-page-builder');
  builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
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

const select = async (builder, id) => {
  builder.select(id);
  await wait(500);
  await builder.renderRoot.querySelector('k-page-builder-settings')?.updateComplete;
  await wait(200);
};

const field = (builder, name) => deepQuery(builder.renderRoot.querySelector('k-page-builder-settings').shadowRoot, `#pb-field-${name}`);

const choose = async (element, value) => {
  element.value = value;
  element.dispatchEvent(new Event('change', { bubbles: true }));
  await wait(600);
};

const typeInto = async (element, value) => {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  await wait(600);
};

const labels = element => [...element.querySelectorAll('option')].map(option => option.textContent.trim());

const attrs = builder => builder.value.slots.default[0].attrs;

const table = (attrs = {}) => ({ id: 'tb1', type: 'table', attrs: { rows: [['A', 'B'], ['c', 'd'], ['e', 'f']], responsive: false, ...attrs }, slots: {} });

const icon = (attrs = {}) => ({ id: 'ic', type: 'icon', attrs: { name: 'star', ...attrs }, slots: {} });

const group = (attrs = {}) => ({ id: 'g', type: 'group', attrs, slots: { default: [] } });

/*
  Tests
*/
export default {
  'should offer the headings a table can have, and style the table for each choice': async ({ pass, fail }) => {
    const builder = await createBuilder(page(table()));
    await waitForWidget(builder, 'tb1');
    await select(builder, 'tb1');
    const headings = field(builder, 'headers');
    if(!headings){ builder.remove(); return fail('A table has a Headings setting'); }
    const choices = labels(headings);
    const result = {};
    for(const [value, name] of [['left-top', 'both'], ['left', 'left'], ['none', 'none'], ['top', 'top']]){
      await choose(field(builder, 'headers'), value);
      await waitForWidget(builder, 'tb1');
      const element = frameDoc(builder).querySelector('table');
      result[name] = {
        stored: attrs(builder).headers,
        classes: element.className,
        thead: !!element.querySelector('thead'),
        firstBody: element.querySelector('tbody tr:first-child > :first-child')?.localName,
        headings: element.querySelectorAll('th').length
      };
    }
    builder.remove();
    if(choices.join() !== 'First row,First row and first column,First column,No headings') return fail(`The choices should be the four ways, got ${choices.join()}`);
    if(!/left-headers/.test(result.both.classes) || !result.both.thead || result.both.firstBody !== 'th') return fail(`First row and column: ${JSON.stringify(result.both)}`);
    if(!/left-headers/.test(result.left.classes) || result.left.thead || result.left.firstBody !== 'th') return fail(`First column: ${JSON.stringify(result.left)}`);
    if(!/no-headers/.test(result.none.classes) || result.none.thead || result.none.headings !== 0) return fail(`No headings: ${JSON.stringify(result.none)}`);
    if(/left-headers|no-headers/.test(result.top.classes) || !result.top.thead || result.top.firstBody !== 'td') return fail(`First row: ${JSON.stringify(result.top)}`);
    if(result.left.stored !== 'left' || result.top.stored !== 'top') return fail('The choice should be stored');
    pass('Each heading choice styles the table');
  },

  'should show the first row as the heading of a table until another choice is made': async ({ pass, fail }) => {
    const builder = await createBuilder(page(table()));
    await waitForWidget(builder, 'tb1');
    await select(builder, 'tb1');
    const value = field(builder, 'headers')?.value;
    const element = frameDoc(builder).querySelector('table');
    builder.remove();
    if(value !== 'top') return fail(`The first row is the default heading, got ${value}`);
    if(!element.querySelector('thead th')) return fail('The first row should be a heading row');
    pass('The first row is the heading by default');
  },

  'should go to the same cell of the next row on Enter in a table cell, and add a row only on the last row': async ({ pass, fail }) => {
    const builder = await createBuilder(page(table({ responsive: true })));
    let widget = await waitForWidget(builder, 'tb1');
    const press = (element, init) => {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
      element.dispatchEvent(event);
      return event;
    };
    const cell = (row, column) => frameDoc(builder).querySelector(`[data-pb-edit="rows.${row}.${column}"]`);
    const focused = () => frameDoc(builder).activeElement?.dataset?.pbEdit;
    const rows = () => attrs(builder).rows.length;
    cell(0, 1).innerHTML = 'typed';
    const first = press(cell(0, 1), { key: 'Enter' });
    await wait(600);
    const afterFirst = { rows: rows(), focus: focused(), text: attrs(builder).rows[0][1] };
    press(cell(1, 1), { key: 'Enter' });
    await wait(600);
    const afterMiddle = { rows: rows(), focus: focused() };
    const last = press(cell(2, 0), { key: 'Enter' });
    await wait(600);
    const afterLast = { rows: rows(), focus: focused() };
    builder.remove();
    if(!first.defaultPrevented || !last.defaultPrevented) return fail('Enter is handled in a cell');
    if(afterFirst.rows !== 3 || afterFirst.focus !== 'rows.1.1' || afterFirst.text !== 'typed') return fail(`Enter on the first row goes to the row below and keeps the text, got ${JSON.stringify(afterFirst)}`);
    if(afterMiddle.rows !== 3 || afterMiddle.focus !== 'rows.2.1') return fail(`Enter on a middle row goes to the row below, got ${JSON.stringify(afterMiddle)}`);
    if(afterLast.rows !== 4 || afterLast.focus !== 'rows.3.0') return fail(`Enter on the last row adds a row and goes into it, got ${JSON.stringify(afterLast)}`);
    pass('Enter goes down, and adds a row on the last row');
  },

  'should have every setting of an icon, with the degrees in the direction choices, and hide Rotation while a direction is set': async ({ pass, fail }) => {
    const builder = await createBuilder(page(icon()));
    await waitForWidget(builder, 'ic');
    await select(builder, 'ic');
    const names = ['name', 'src', 'direction', 'rotation', 'animation'].filter(name => field(builder, name));
    const direction = field(builder, 'direction');
    const choices = labels(direction);
    const hint = direction.closest('div')?.querySelector('small');
    const animations = labels(field(builder, 'animation'));
    await choose(direction, 'left');
    const rotationHidden = !field(builder, 'rotation');
    builder.remove();
    if(names.join() !== 'name,src,direction,rotation,animation') return fail(`An icon has an icon, a source, a direction, a rotation and an animation, got ${names.join()}`);
    if(choices.join() !== 'None / Right (0deg),Down (90deg),Left (180deg),Up (270deg)') return fail(`The degrees belong in the choices, got ${choices.join()}`);
    if(hint) return fail(`The direction needs no explanation under its label, got "${hint.textContent}"`);
    if(animations.join() !== 'None,Spin,Blink,Pulse') return fail(`The animations are none, spin, blink and pulse, got ${animations.join()}`);
    if(!rotationHidden) return fail('Rotation should hide while a direction is set');
    pass('The icon has all its settings');
  },

  'should turn and animate an icon from its settings, and draw one from a source': async ({ pass, fail }) => {
    const builder = await createBuilder(page(icon()));
    await waitForWidget(builder, 'ic');
    await select(builder, 'ic');
    await choose(field(builder, 'direction'), 'down');
    await waitForWidget(builder, 'ic');
    const byDirection = frameDoc(builder).querySelector('k-icon[data-pb-id="ic"]').getAttribute('direction');
    await choose(field(builder, 'direction'), '');
    await typeInto(field(builder, 'rotation'), '45');
    await waitForWidget(builder, 'ic');
    const byDegrees = frameDoc(builder).querySelector('k-icon[data-pb-id="ic"]').getAttribute('rotation');
    await choose(field(builder, 'animation'), 'spin');
    await waitForWidget(builder, 'ic');
    const animated = frameDoc(builder).querySelector('k-icon[data-pb-id="ic"]').getAttribute('animation');
    await typeInto(field(builder, 'src'), '/icons/card.svg');
    await waitForWidget(builder, 'ic');
    const element = frameDoc(builder).querySelector('k-icon[data-pb-id="ic"]');
    const source = element.getAttribute('src');
    const name = element.getAttribute('name');
    builder.remove();
    if(byDirection !== 'down') return fail(`Choosing Down turns the icon down, got ${byDirection}`);
    if(byDegrees !== '45') return fail(`45 degrees turns the icon 45 degrees, got ${byDegrees}`);
    if(animated !== 'spin') return fail(`Spin animates the icon, got ${animated}`);
    if(source !== '/icons/card.svg' || name) return fail(`A source is drawn instead of the name, got src="${source}" name="${name}"`);
    pass('An icon is turned, animated and drawn from a source');
  },

  'should set the height of a group with a value and a unit on one line, and leave no height at 0': async ({ pass, fail }) => {
    const builder = await createBuilder(page(group()));
    await waitForWidget(builder, 'g');
    await select(builder, 'g');
    const height = field(builder, 'height');
    const unit = height.parentElement.querySelector('select');
    const units = labels(unit);
    const sameLine = Math.abs(height.getBoundingClientRect().top - unit.getBoundingClientRect().top) < 4;
    await typeInto(height, '20');
    await choose(field(builder, 'height').parentElement.querySelector('select'), 'rem');
    await waitForWidget(builder, 'g');
    const styled = frameDoc(builder).querySelector('[data-pb-id="g"]').style.height;
    await typeInto(field(builder, 'height'), '0');
    await waitForWidget(builder, 'g');
    const cleared = frameDoc(builder).querySelector('[data-pb-id="g"]').style.height;
    builder.remove();
    if(units.join() !== 'px,rem,vh') return fail(`The units are just px, rem and vh, got ${units.join()}`);
    if(!sameLine) return fail('The value and unit should be on one line');
    if(styled !== '20rem') return fail(`A height of 20 rem is styled, got ${styled}`);
    if(cleared) return fail(`A height of 0 leaves no height, got ${cleared}`);
    pass('A group has a height with a unit');
  },

  'should list the widgets in Content, Media, Layout and Interactive, with Content first and text, markdown, button, table, html and script in it': async ({ pass, fail }) => {
    const inserter = document.createElement('k-page-builder-inserter');
    inserter.registry = registryOf(widgets);
    inserter.host = { canAdd: () => true, insert: () => {} };
    document.body.appendChild(inserter);
    await inserter.updateComplete;
    const groups = inserter.groups();
    inserter.remove();
    const titles = groups.map(group => group.title);
    const names = name => (groups.find(group => group.name === name)?.widgets || []).map(widget => widget.name);
    const all = groups.flatMap(group => group.widgets.map(widget => widget.name));
    if(titles.join() !== 'Content,Media,Layout,Interactive') return fail(`The groups should be Content, Media, Layout, Interactive, got ${titles.join()}`);
    if(groups.some(group => group.name === 'text')) return fail('There is no Text group, it is part of Content');
    for(const name of ['text', 'markdown', 'button', 'table', 'html', 'script']){
      if(!names('content').includes(name)) return fail(`${name} should be in Content, got ${names('content').join()}`);
    }
    for(const section of ['column', 'accordion-item', 'tab-item', 'tab-spacer', 'slide']){
      if(all.includes(section)) return fail(`${section} is a section, managed from its parent, so it is not listed`);
    }
    for(const name of ['columns', 'content-slider', 'icon', 'show-more']){
      if(!all.includes(name)) return fail(`${name} should be listed`);
    }
    if(all.includes('row') || all.includes('social-icons')) return fail('Row was renamed Columns and social icons were removed');
    pass('The groups are in order');
  }
};
