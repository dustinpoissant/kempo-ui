import { widgets, registryOf } from '../../src/utils/pageWidgets.js';
import * as tree from '../../src/utils/pageTree.js';

/*
  Utility Functions
*/
const registry = registryOf(widgets);

const newPage = () => ({ attrs: {}, slots: { default: [] } });

const addTop = (page, type, options = {}) => tree.addWidget(page.slots.default, registry, type, options);

/*
  Tests
*/
export default {
  'a value inside the attrs is read and set by path, and a missing place is left alone': async ({ pass, fail }) => {
    const attrs = { html: 'x', rows: [['a', 'b'], ['c', 'd']], spans: {} };
    if(tree.valueAt(attrs, 'html') !== 'x' || tree.valueAt(attrs, 'rows.1.0') !== 'c') return fail('valueAt should read names and paths');
    if(tree.valueAt(attrs, 'rows.5.0') !== undefined || tree.valueAt(attrs, 'nope.x') !== undefined || tree.valueAt(attrs, 'html.length.x') !== undefined) return fail('A missing place reads as undefined');
    if(!tree.setValueAt(attrs, 'rows.1.0', 'C') || attrs.rows[1][0] !== 'C') return fail('A cell should be set');
    if(!tree.setValueAt(attrs, 'html', 'y') || attrs.html !== 'y') return fail('A name should be set');
    if(tree.setValueAt(attrs, 'rows.5.0', 'z') || tree.setValueAt(attrs, 'nope.x', 'z') || 'nope' in attrs || attrs.rows.length !== 2) return fail('A place that does not exist should change nothing');
    pass('paths read and set values inside the attrs');
  },

  'new columns start with two columns, a new accordion with one section, tabs with two tabs and a content slider with two slides': async ({ pass, fail }) => {
    const page = newPage();
    const columns = tree.findNode(page.slots.default, addTop(page, 'columns').id).node;
    const accordion = tree.findNode(page.slots.default, addTop(page, 'accordion').id).node;
    const tabs = tree.findNode(page.slots.default, addTop(page, 'tabs').id).node;
    const slider = tree.findNode(page.slots.default, addTop(page, 'content-slider').id).node;
    if(columns.slots.default.length !== 2) return fail(`columns had ${columns.slots.default.length} columns`);
    if(columns.slots.default.some(column => column.type !== 'column')) return fail('the children of columns are not columns');
    if(accordion.slots.default.length !== 1 || accordion.slots.default[0].type !== 'accordion-item') return fail('accordion has no section');
    if(tabs.slots.default.length !== 2 || tabs.slots.default.some(tab => tab.type !== 'tab-item')) return fail('tabs do not start with two tabs');
    if(slider.slots.default.length !== 2 || slider.slots.default.some(slide => slide.type !== 'slide')) return fail('the content slider does not start with two slides');
    pass('defaults add their sections');
  },

  'sections are never listed in the top level and cannot be moved on the page': async ({ pass, fail }) => {
    const page = newPage();
    const row = addTop(page, 'columns');
    const column = tree.findNode(page.slots.default, row.id).node.slots.default[0];
    const moved = tree.moveWidget(page.slots.default, registry, column.id, null, '', 0);
    if(moved === true) return fail('a column was moved on the page');
    pass('section moves are refused');
  },

  'a widget can be added inside another widget': async ({ pass, fail }) => {
    const page = newPage();
    const group = addTop(page, 'group');
    const inside = tree.addWidget(page.slots.default, registry, 'text', { targetId: group.id, inside: true, slot: 'default' });
    if(inside.error) return fail(inside.error);
    const found = tree.findNode(page.slots.default, inside.id);
    if(found.parent?.id !== group.id) return fail('text was not placed inside the group');
    pass('nesting works');
  },

  'moving a widget into the widget before it, and out again': async ({ pass, fail }) => {
    const page = newPage();
    const first = addTop(page, 'group');
    const second = addTop(page, 'text');
    const moved = tree.moveIn(page.slots.default, registry, second.id);
    if(moved !== true) return fail(String(moved));
    if(tree.findNode(page.slots.default, second.id).parent?.id !== first.id) return fail('text did not move into the group');
    if(tree.moveOut(page.slots.default, registry, second.id) !== true) return fail('text did not move out');
    if(tree.findNode(page.slots.default, second.id).parent) return fail('text is still inside');
    pass('moves in and out work');
  },

  'duplicating copies a widget with fresh ids, beside the original': async ({ pass, fail }) => {
    const page = newPage();
    const original = addTop(page, 'columns');
    const result = tree.duplicateWidgets(page.slots.default, [original.id]);
    if(result.ids.length !== 1 || result.ids[0] === original.id) return fail('no fresh copy was made');
    if(page.slots.default.length !== 2) return fail(`expected two top-level widgets, got ${page.slots.default.length}`);
    if(tree.countNodes(page.slots.default) !== 2 * tree.countNodes([tree.findNode(page.slots.default, original.id).node])) return fail('the copy is missing its children');
    pass('duplicates are independent copies');
  },

  'removing the selected widget selects its neighbour': async ({ pass, fail }) => {
    const page = newPage();
    const first = addTop(page, 'text');
    const second = addTop(page, 'image');
    const next = tree.neighbour(page.slots.default, first.id);
    tree.removeWidgets(page.slots.default, [first.id]);
    if(next !== second.id) return fail('the next widget was not chosen');
    if(page.slots.default.length !== 1) return fail('the widget was not removed');
    pass('removal picks the neighbour');
  },

  'an accordion section starts open when its settings say so, and until one does the first section does': async ({ pass, fail }) => {
    const section = (id, open) => ({ id, type: 'accordion-item', attrs: open === undefined ? {} : { open }, slots: { default: [] } });
    const parentOf = (...sections) => ({ slots: { default: sections } });
    const [a, b, c] = [section('a'), section('b'), section('c')];
    const plain = parentOf(a, b, c);
    if(!tree.sectionOpen(a, plain) || tree.sectionOpen(b, plain) || tree.sectionOpen(c, plain)) return fail('With no setting only the first section is open');
    const second = parentOf(section('a'), section('b', true), section('c'));
    const [first, chosen, last] = second.slots.default;
    if(tree.sectionOpen(first, second) || !tree.sectionOpen(chosen, second) || tree.sectionOpen(last, second)) return fail('Once a section says open, the first no longer opens on its own');
    const closed = parentOf(section('a', false), section('b'));
    if(tree.sectionOpen(closed.slots.default[0], closed) || tree.sectionOpen(closed.slots.default[1], closed)) return fail('A section that says closed leaves nothing open');
    const many = parentOf(section('a', true), section('b'), section('c', true));
    const [one, two, three] = many.slots.default;
    if(!tree.sectionOpen(one, many) || tree.sectionOpen(two, many) || !tree.sectionOpen(three, many)) return fail('Several sections can say open');
    if(tree.sectionOpen(section('x', true), null) !== true || tree.sectionOpen(section('y'), null) !== false) return fail('A section with no parent is open only when it says so');
    pass('the open sections are worked out');
  },

  'a new content slider and its slides can have widgets added inside a slide, but a slide is a section that is not moved on the page': async ({ pass, fail }) => {
    const page = newPage();
    const slider = tree.findNode(page.slots.default, addTop(page, 'content-slider').id).node;
    const slide = slider.slots.default[0];
    const inside = tree.addWidget(page.slots.default, registry, 'text', { targetId: slide.id, inside: true, slot: 'default' });
    if(inside.error) return fail(inside.error);
    if(tree.findNode(page.slots.default, inside.id).parent?.id !== slide.id) return fail('the text was not placed in the slide');
    const moved = tree.moveWidget(page.slots.default, registry, slide.id, null, '', 0);
    if(moved === true) return fail('a slide was moved on the page');
    const added = tree.addWidget(page.slots.default, registry, 'slide', { targetId: slider.id, inside: true, slot: 'default' });
    if(added.error || slider.slots.default.length !== 3) return fail(`a slide is added to the slider's slides: ${added.error}`);
    pass('slides hold widgets and are managed from the slider');
  },

  'attributeDefault gives the declared default, and an empty value otherwise': async ({ pass, fail }) => {
    if(tree.attributeDefault({ type: 'boolean', default: true }) !== true) return fail('boolean default');
    if(tree.attributeDefault({ type: 'string' }) !== '') return fail('string default');
    pass('defaults read as declared');
  }
};
