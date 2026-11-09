import { widgets, registryOf, addWidget } from '../../src/utils/pageWidgets.js';
import { renderPage, collectModules, escapeAttribute } from '../../src/utils/renderPage.js';
import { COLUMN_WIDTH_OPTIONS } from '../../src/utils/pageWidgetDefaults.js';

/*
  Utility Functions
*/
const registry = registryOf(widgets);

const node = (type, attrs = {}, slots = {}) => ({ id: `${type}-id`, type, attrs, slots });

const nodeWith = (id, type, attrs = {}, slots = {}) => ({ id, type, attrs, slots });

const count = (text, part) => text.split(part).length - 1;

/*
  Tests
*/
export default {
  'a text widget renders its HTML, with its styles on its element': async ({ pass, fail }) => {
    const html = renderPage([node('text', { html: '<p>Hi</p>', styles: { background: 'alt', corners: ['tl', 'br'] } })], registry);
    if(!html.includes('<p>Hi</p>')) return fail(html);
    if(!html.startsWith('<div class="d-b bg-alt rtl rbr">')) return fail(html);
    pass('text is written with its style');
  },

  'attributes at their default are left out, and set ones are written': async ({ pass, fail }) => {
    const html = renderPage([node('video', { src: '/a.mp4', preload: 'metadata', autoplay: true })], registry);
    if(html.includes('preload=')) return fail('the default preload value was written');
    if(!html.includes('src="/a.mp4"') || !html.includes(' autoplay')) return fail(html);
    pass('defaults are omitted');
  },

  'values with quotes and markup are escaped in attributes and text': async ({ pass, fail }) => {
    const html = renderPage([node('button', { label: '<b>"Go"</b>', kind: 'link', href: '/x?a="1"' })], registry);
    if(html.includes('<b>')) return fail('text was not escaped');
    if(!html.includes('href="/x?a=&quot;1&quot;"')) return fail(html);
    pass('escaping holds');
  },

  'a container in the builder marks its id and drop place; on the page it does not': async ({ pass, fail }) => {
    const nodes = [node('group', {}, { default: [node('text', { html: 'x' })] })];
    const builder = renderPage(nodes, registry, { editor: true });
    const page = renderPage(nodes, registry);
    if(!builder.includes('data-pb-id="group-id"') || !builder.includes('data-pb-slot="default"')) return fail(builder);
    if(page.includes('data-pb')) return fail('builder marks reached the page');
    pass('editor marks stay out of the page');
  },

  'a button has no own text alignment or background style: its color is the background, and the text is aligned from the styles': async ({ pass, fail }) => {
    const names = registry.get('button').attributes.map(attribute => attribute.name);
    if(names.includes('align')) return fail(`A button should not have its own align setting, got ${names}`);
    if(!names.includes('color')) return fail('A button keeps its color setting');
    const colored = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x', color: 'primary', full: true, styles: { align: 'center', background: 'danger', alpha: 50, textColour: 'muted' } })], registry);
    if(!/class="btn primary full/.test(colored)) return fail(`The color should be the primary button: ${colored}`);
    if(!colored.includes('ta-center') || !colored.includes('tc-muted')) return fail(`The text alignment and colour from the styles should be written: ${colored}`);
    if(colored.includes('bg-danger') || colored.includes('background-color')) return fail(`A stored styles background must not reach a button: ${colored}`);
    const group = renderPage([node('group', { styles: { background: 'alt' } })], registry);
    if(!group.includes('bg-alt')) return fail(`Other widgets keep their styles background: ${group}`);
    pass('the button color is its only background');
  },

  'a table is its cells as HTML, a heading row, colgroup widths and spans that hide the cells they cover': async ({ pass, fail }) => {
    const rows = [['Name', 'Qty', 'Price'], ['Pen', '<b>2</b>', '$1'], ['Total', 'hidden', 'hidden too'], ['', '', '']];
    const html = renderPage([node('table', { rows, spans: { '2.0': 3, '3.1': 9 }, widths: ['', '20%', '80px'] })], registry);
    if(!html.includes('<thead>\n<tr><th>Name</th><th>Qty</th><th>Price</th></tr>\n</thead>')) return fail(html);
    if(!html.includes('<td>Pen</td><td><b>2</b></td><td>$1</td>')) return fail(`cells are HTML: ${html}`);
    if(!html.includes('<tr><td colspan="3">Total</td></tr>') || html.includes('hidden')) return fail(`a span covers the cells after it: ${html}`);
    if(!html.includes('<tr><td></td><td colspan="2"></td></tr>')) return fail(`a span is held to the columns left: ${html}`);
    if(!html.includes('<colgroup><col><col style="width: 20%"><col style="width: 80px"></colgroup>')) return fail(html);
    if(html.includes('contenteditable') || html.includes('data-pb')) return fail(`the page must not have editing marks: ${html}`);
    const plain = renderPage([node('table', { headers: 'none', rows: [['a', 'b']] })], registry);
    if(plain.includes('<thead>') || plain.includes('<th>') || !plain.includes('<td>a</td>')) return fail(plain);
    pass('the table is written with its spans and widths');
  },

  'a table is in a responsive wrapper unless that is turned off, and the widget marks and styles belong to the wrapper': async ({ pass, fail }) => {
    const rows = [['A', 'B'], ['c', 'd']];
    const wrapped = renderPage([node('table', { rows, styles: { margin: { top: '', right: '', bottom: 'f', left: '' } } })], registry);
    if(!wrapped.startsWith('<div class="table-wrapper d-b mb">\n<table>')) return fail(wrapped);
    if(!wrapped.trimEnd().endsWith('</table>\n</div>') || wrapped.split('<table').length !== 2) return fail(`one table inside the wrapper: ${wrapped}`);
    const builder = renderPage([node('table', { rows })], registry, { editor: true });
    if(!builder.startsWith('<div class="table-wrapper d-b" data-pb-id="table-id" data-pb-title="Table"') || /<table[^>]*data-pb-id/.test(builder)) return fail(`the builder marks belong to the wrapper: ${builder}`);
    const plain = renderPage([node('table', { rows, responsive: false, styles: { margin: { top: '', right: '', bottom: 'f', left: '' } } })], registry);
    if(!plain.startsWith('<table class="d-b mb">') || plain.includes('table-wrapper')) return fail(`turned off, the table has no wrapper and keeps its styles: ${plain}`);
    const plainBuilder = renderPage([node('table', { rows, responsive: false })], registry, { editor: true });
    if(!/^<table[^>]*data-pb-id="table-id"/.test(plainBuilder) || plainBuilder.includes('table-wrapper')) return fail(plainBuilder);
    const attribute = registry.get('table').attributes.find(entry => entry.name === 'responsive');
    if(!attribute || attribute.type !== 'boolean' || attribute.default !== true || attribute.label !== 'Make responsive') return fail('The setting should be a boolean, on by default, called Make responsive');
    pass('the table is wrapped by default');
  },

  'the cells of a table are editable on the page in the builder, each naming where it is kept, spans included': async ({ pass, fail }) => {
    const rows = [['H1', 'H2', 'H3'], ['a', 'b', 'c']];
    const html = renderPage([node('table', { rows, spans: { '1.0': 2 } })], registry, { editor: true });
    if(!html.includes('<th contenteditable="true" data-pb-edit="rows.0.0">H1</th>') || !html.includes('<th contenteditable="true" data-pb-edit="rows.0.2">H3</th>')) return fail(html);
    if(!html.includes('<td colspan="2" contenteditable="true" data-pb-edit="rows.1.0">a</td>') || !html.includes('<td contenteditable="true" data-pb-edit="rows.1.2">c</td>')) return fail(html);
    if(html.includes('data-pb-edit="rows.1.1"')) return fail(`a covered cell is not editable: ${html}`);
    pass('every shown cell is editable and knows its place');
  },

  'a table cell goes through the sanitizer, like a text widget': async ({ pass, fail }) => {
    const html = renderPage([node('table', { rows: [['<script>x</script>ok']] })], registry, { sanitize: value => value.replace(/<script>.*?<\/script>/g, '') });
    if(!html.includes('<th>ok</th>') || html.includes('script')) return fail(html);
    pass('cells are sanitized');
  },

  'Enter in a table cell moves into the same column of the next row, keeping what was typed, and adds no row': async ({ pass, fail }) => {
    const table = node('table', { rows: [['A', 'B', 'C'], ['d', 'e', 'f'], ['g', 'h', 'i']], spans: { '1.0': 2, '2.1': 2 } });
    const keydown = registry.get('table').keydown;
    const result = keydown({ key: 'Enter' }, { node: table, path: 'rows.1.2', html: '<b>f!</b>' });
    if(!result) return fail('Enter in a cell should do something');
    if(result.attrs.rows.length !== 3) return fail(`No row should be added when there is a row below, got ${JSON.stringify(result.attrs.rows)}`);
    if(result.attrs.rows[1][2] !== '<b>f!</b>') return fail('What was typed in the cell should be kept');
    if('spans' in result.attrs) return fail('The spans should be left alone');
    if(result.focus !== 'rows.2.2') return fail(`The caret should go to the same column of the next row, got ${result.focus}`);
    const first = keydown({ key: 'Enter' }, { node: table, path: 'rows.0.0', html: 'A' });
    if(first.focus !== 'rows.1.0' || first.attrs.rows.length !== 3) return fail(`Enter in the first row should go to the second, got ${first.focus}`);
    if(table.attrs.rows.length !== 3 || table.attrs.rows[1][2] !== 'f') return fail('The node must not be changed in place');
    pass('Enter goes to the next row');
  },

  'Enter in a cell of the last table row adds a row below it and moves into the same column, keeping what was typed': async ({ pass, fail }) => {
    const table = node('table', { rows: [['A', 'B', 'C'], ['d', 'e', 'f'], ['g', 'h', 'i']], spans: { '1.0': 2, '2.1': 2 } });
    const keydown = registry.get('table').keydown;
    const result = keydown({ key: 'Enter' }, { node: table, path: 'rows.2.2', html: '<b>i!</b>' });
    if(!result) return fail('Enter in a cell should do something');
    if(result.attrs.rows.length !== 4 || result.attrs.rows[3].join('|') !== '||') return fail(`A blank row should be added below the last row, got ${JSON.stringify(result.attrs.rows)}`);
    if(result.attrs.rows[2][2] !== '<b>i!</b>') return fail('What was typed in the cell should be kept');
    if(JSON.stringify(result.attrs.spans) !== JSON.stringify({ '1.0': 2, '2.1': 2 })) return fail(`The spans above should stay, got ${JSON.stringify(result.attrs.spans)}`);
    if(result.focus !== 'rows.3.2') return fail(`The caret should go to the same column of the new row, got ${result.focus}`);
    if(table.attrs.rows.length !== 3 || table.attrs.rows[2][2] !== 'i') return fail('The node must not be changed in place');
    pass('Enter on the last row adds a row');
  },

  'a table has headings on the first row, the first column, both or neither, with the kempo-css class for each': async ({ pass, fail }) => {
    const rows = [['A', 'B'], ['c', 'd']];
    const make = attrs => renderPage([node('table', { rows, responsive: false, ...attrs })], registry);
    const top = make({});
    if(!top.includes('<thead>\n<tr><th>A</th><th>B</th></tr>\n</thead>') || !top.includes('<tr><td>c</td><td>d</td></tr>')) return fail(`the first row is the heading by default: ${top}`);
    if(/left-headers|no-headers/.test(top) || make({ headers: 'top' }) !== top) return fail(`the default needs no class: ${top}`);
    const left = make({ headers: 'left' });
    if(!/<table class="[^"]*left-headers/.test(left) || left.includes('<thead>')) return fail(`first column: a class and no heading row: ${left}`);
    if(!left.includes('<tr><th>A</th><td>B</td></tr>') || !left.includes('<tr><th>c</th><td>d</td></tr>')) return fail(`every row starts with a heading cell: ${left}`);
    const both = make({ headers: 'left-top' });
    if(!/<table class="[^"]*left-headers/.test(both) || !both.includes('<thead>\n<tr><th>A</th><th>B</th></tr>\n</thead>') || !both.includes('<tr><th>c</th><td>d</td></tr>')) return fail(`first row and column: ${both}`);
    const none = make({ headers: 'none' });
    if(!/<table class="[^"]*no-headers/.test(none) || none.includes('<th>') || none.includes('<thead>') || !none.includes('<tr><td>A</td><td>B</td></tr>')) return fail(`no headings: ${none}`);
    if(make({ headers: 'sideways' }) !== top) return fail('a value that is not one of the choices is the first row');
    const attribute = registry.get('table').attributes.find(entry => entry.name === 'headers');
    if(attribute.default !== 'top' || attribute.options.map(option => option.value).join() !== 'top,left-top,left,none') return fail('The setting should default to the first row, and offer the four choices');
    pass('the headings are drawn for each choice');
  },

  'a table heading class goes on the table, inside the responsive wrapper, and a spanning first cell keeps its heading': async ({ pass, fail }) => {
    const rows = [['A', 'B', 'C'], ['d', 'e', 'f']];
    const wrapped = renderPage([node('table', { rows, headers: 'left' })], registry);
    if(!wrapped.startsWith('<div class="table-wrapper d-b">\n<table class="left-headers">')) return fail(`the class is on the table, not the wrapper: ${wrapped}`);
    const spanning = renderPage([node('table', { rows, headers: 'left', spans: { '1.0': 2 }, responsive: false })], registry);
    if(!spanning.includes('<tr><th colspan="2">d</th><td>f</td></tr>')) return fail(`the first cell is a heading that spans: ${spanning}`);
    const editor = renderPage([node('table', { rows, headers: 'left' })], registry, { editor: true });
    if(!editor.includes('<th contenteditable="true" data-pb-edit="rows.1.0">d</th>') || !editor.includes('<td contenteditable="true" data-pb-edit="rows.1.1">e</td>')) return fail(`heading cells are editable too: ${editor}`);
    pass('the class and the heading cells are in the right places');
  },

  'Ctrl+Enter in a table cell adds a column after it and its span, growing spans it lands inside and moving ones after it': async ({ pass, fail }) => {
    const keydown = registry.get('table').keydown;
    const table = node('table', { rows: [['A', 'B', 'C'], ['d', 'e', 'f'], ['g', 'h', 'i']], spans: { '1.0': 2, '2.1': 2, '0.2': 1 }, widths: ['', '30%', ''] });
    const plain = keydown({ key: 'Enter', ctrlKey: true }, { node: table, path: 'rows.0.0', html: 'A!' });
    if(!plain) return fail('Ctrl+Enter should do something');
    if(plain.attrs.rows.some(row => row.length !== 4) || plain.attrs.rows[0].join('|') !== 'A!||B|C') return fail(`A blank column should be added after column 0, got ${JSON.stringify(plain.attrs.rows)}`);
    if(JSON.stringify(plain.attrs.spans) !== JSON.stringify({ '1.0': 3, '2.2': 2, '0.3': 1 })) return fail(`A span that covers the new column grows and the ones after move right, got ${JSON.stringify(plain.attrs.spans)}`);
    if(plain.attrs.widths.join('|') !== '||30%|') return fail(`A width should be added for the new column, got ${plain.attrs.widths}`);
    if(plain.focus !== 'rows.0.1') return fail(`The caret should go into the new cell, got ${plain.focus}`);
    const spanning = keydown({ key: 'Enter', ctrlKey: true }, { node: table, path: 'rows.1.0', html: 'd' });
    if(spanning.focus !== 'rows.1.2' || spanning.attrs.rows[1].join('|') !== 'd|e||f') return fail(`A column is added after the columns the cell spans, got ${spanning.focus} ${JSON.stringify(spanning.attrs.rows[1])}`);
    const cmd = keydown({ key: 'Enter', metaKey: true }, { node: table, path: 'rows.0.1', html: 'B' });
    if(!cmd || cmd.attrs.rows[0].length !== 4) return fail('Cmd+Enter should add a column too');
    const noWidths = keydown({ key: 'Enter', ctrlKey: true }, { node: node('table', { rows: [['a']] }), path: 'rows.0.0', html: 'a' });
    if(noWidths.attrs.widths.length) return fail('A table with automatic widths should stay automatic');
    pass('Ctrl+Enter adds a column');
  },

  'the other keys in a table cell are left alone, and so is Shift+Enter, which is a new line': async ({ pass, fail }) => {
    const keydown = registry.get('table').keydown;
    const table = node('table', {});
    for(const [event, label] of [[{ key: 'Enter', shiftKey: true }, 'Shift+Enter'], [{ key: 'Enter', altKey: true }, 'Alt+Enter'], [{ key: 'a' }, 'a'], [{ key: 'Tab' }, 'Tab'], [{ key: 'Backspace' }, 'Backspace']]){
      if(keydown(event, { node: table, path: 'rows.0.0', html: '' }) !== null) return fail(`${label} should be left alone`);
    }
    if(keydown({ key: 'Enter' }, { node: table, path: 'html', html: '' }) !== null) return fail('Only a cell has these keys');
    pass('only Enter and Ctrl+Enter do anything');
  },

  'a script widget is written as a script with no display class, so its code is not shown on the page': async ({ pass, fail }) => {
    const inline = renderPage([node('script', { code: "console.log('it works');" })], registry);
    const file = renderPage([node('script', { src: '/a.js', type: 'module', defer: true })], registry);
    if(!inline.startsWith('<script>') || !inline.includes("console.log('it works');")) return fail(inline);
    if(/class=/.test(inline) || /class=/.test(file) || inline.includes('d-b') || file.includes('d-b')) return fail(`a script must not get a display class: ${inline} ${file}`);
    if(!file.startsWith('<script src="/a.js" type="module" defer')) return fail(file);
    const styled = renderPage([node('script', { code: 'x();', styles: { id: 'tracker', classes: 'keep', align: 'center', background: 'primary', margin: { top: 'f' }, textColour: 'muted', corners: ['tl'] } })], registry);
    if(styled !== '<script id="tracker">x();</script>') return fail(`only the id of the styles applies to a script: ${styled}`);
    pass('a script gets no display class and only its id from the styles');
  },

  'a group has the HTML element and a height as its own settings, and its look comes from the styles': async ({ pass, fail }) => {
    const group = registry.get('group');
    const names = group.attributes.map(attribute => attribute.name);
    if(names.join() !== 'element,height,heightUnit') return fail(`Expected element, height and heightUnit, got ${names}`);
    if(group.attributes.find(attribute => attribute.name === 'heightUnit').beside !== 'height') return fail('The unit should be drawn beside the height');
    const html = renderPage([node('group', { element: 'section', styles: { padding: { top: 'f', right: 'f', bottom: 'f', left: 'f' }, background: 'alt', align: 'center', classes: 'extra' } }, { default: [node('text', { html: 'x' })] })], registry);
    if(!html.startsWith('<section class="d-b p bg-alt ta-center extra"')) return fail(html);
    pass('the group is an element, styled by the styles');
  },

  'a group with a height gets it in px, rem or vh, and none when it is 0, empty or the unit is not one of those': async ({ pass, fail }) => {
    const make = attrs => renderPage([node('group', attrs)], registry);
    if(!make({ height: 20, heightUnit: 'rem' }).includes('style="height: 20rem"')) return fail(make({ height: 20, heightUnit: 'rem' }));
    if(!make({ height: 50, heightUnit: 'vh' }).includes('style="height: 50vh"')) return fail(make({ height: 50, heightUnit: 'vh' }));
    if(!make({ height: 300 }).includes('style="height: 300px"')) return fail(`the unit is px unless set: ${make({ height: 300 })}`);
    if(!make({ height: 10, heightUnit: 'em' }).includes('style="height: 10px"')) return fail(`an unknown unit is px: ${make({ height: 10, heightUnit: 'em' })}`);
    for(const attrs of [{}, { height: 0 }, { height: '' }, { height: -5 }, { height: 'tall' }]){
      if(make(attrs).includes('style=')) return fail(`no height means no style: ${JSON.stringify(attrs)} ${make(attrs)}`);
    }
    if(make({ height: 20, heightUnit: 'rem' }).includes('height=') || make({ height: 20 }).includes('heightUnit')) return fail('the settings are not written as attributes');
    pass('a group height is a style');
  },

  'a group can be a few elements, but never a main, which belongs to the template': async ({ pass, fail }) => {
    const elements = registry.get('group').attributes.find(attribute => attribute.name === 'element').options.map(option => option.value);
    if(elements.includes('main')) return fail(`main should not be offered, got ${elements}`);
    if(!elements.includes('section') || !elements.includes('div')) return fail(`Expected section and div, got ${elements}`);
    const html = renderPage([node('group', { element: 'main' })], registry);
    if(html.includes('<main')) return fail(`A group with element main must still be a div, got ${html}`);
    if(!renderPage([node('group', { element: 'section' })], registry).startsWith('<section')) return fail('section should still work');
    pass('a group is never a main');
  },

  'a horizontal rule space above and below wins over a margin from the styles': async ({ pass, fail }) => {
    const html = renderPage([node('divider', { above: 'large', below: 'custom', belowHeight: 30, styles: { margin: { top: 'f', right: '', bottom: 'f', left: '' } } })], registry);
    if(!html.includes('margin-top: 12rem !important') || !html.includes('margin-bottom: 30px !important')) return fail(html);
    if(!html.includes(' mt') && !html.includes(' mb') && !html.includes('my')) return fail(`the styles margin classes should still be written: ${html}`);
    const none = renderPage([node('divider', {})], registry);
    if(none.includes('margin')) return fail(`with no space chosen the rule should add no margin of its own: ${none}`);
    pass('the spacing chosen on the rule is authoritative, and absent when not chosen');
  },

  'a markdown widget is k-markdown on the page with its text escaped, and its editor element in the builder': async ({ pass, fail }) => {
    const nodes = [node('markdown', { markdown: '# Hi <b>' })];
    const page = renderPage(nodes, registry);
    const builder = renderPage(nodes, registry, { editor: true });
    if(!page.startsWith('<k-markdown') || !page.includes('# Hi &lt;b&gt;')) return fail(page);
    if(!builder.startsWith('<k-page-builder-markdown-editor') || !builder.includes('data-pb-id="markdown-id"')) return fail(builder);
    pass('markdown is a k-markdown on the page and an editor in the builder');
  },

  'a text widget draws its own markup in the builder, editable in place, and the page has no editable attribute': async ({ pass, fail }) => {
    const nodes = [node('text', { html: '<p>x</p>' })];
    const builder = renderPage(nodes, registry, { editor: true });
    if(!builder.startsWith('<div') || !builder.includes('data-pb-id="text-id"') || !builder.includes('<p>x</p>')) return fail(builder);
    if(!builder.includes('contenteditable="true"')) return fail(`the builder should make the text editable: ${builder}`);
    if(renderPage(nodes, registry).includes('contenteditable')) return fail('the page should not be editable');
    pass('the text is editable in the builder only');
  },

  'named slots get a slot attribute on the child': async ({ pass, fail }) => {
    const custom = addWidget({ name: 'split-box', title: 'Split box', tag: 'pb-split-box', slots: [{ name: 'default', label: 'Content' }, { name: 'footer', label: 'Footer' }], attributes: [] });
    const local = registryOf([...widgets.filter(definition => definition.name !== 'split-box'), custom]);
    const html = renderPage([node('split-box', {}, { footer: [node('text', { html: '<p>f</p>' })] })], local);
    if(!html.includes('slot="footer"')) return fail(html);
    pass('a footer child is slotted');
  },

  'in the builder a named slot is a drop place of its own, even when empty, and the page writes the children with the slot attribute': async ({ pass, fail }) => {
    const custom = addWidget({ name: 'zone-box', title: 'Zone box', tag: 'pb-zone-box', editorTag: 'pb-zone-box-editor', slots: [{ name: 'default', label: 'Content' }, { name: 'footer', label: 'Under it' }, { name: 'aside', label: 'Beside it' }], attributes: [] });
    const local = registryOf([...widgets.filter(definition => definition.name !== 'zone-box'), custom]);
    const nodes = [node('zone-box', {}, { footer: [node('text', { html: '<p>f</p>' })] })];
    const builder = renderPage(nodes, local, { editor: true });
    if(!builder.includes('<div slot="footer" data-pb-id="zone-box-id" data-pb-slot="footer" data-pb-title="Under it"><div')) return fail(`the footer is not a zone holding its widget: ${builder}`);
    if(!builder.includes('<div slot="aside" data-pb-id="zone-box-id" data-pb-slot="aside" data-pb-title="Beside it"></div>')) return fail(`an empty slot is not a zone: ${builder}`);
    if(!builder.includes('data-pb-slot="default"')) return fail('the default slot lost its drop place');
    const page = renderPage(nodes, local);
    if(page.includes('data-pb') || !page.includes('slot="footer"')) return fail(`the page was changed: ${page}`);
    pass('named slots are zones in the builder only');
  },

  'a widget with no default slot does not mark itself as a default drop place': async ({ pass, fail }) => {
    const custom = addWidget({ name: 'footer-only', title: 'Footer only', tag: 'pb-footer-only', slots: [{ name: 'footer', label: 'Footer' }], attributes: [] });
    const local = registryOf([...widgets.filter(definition => definition.name !== 'footer-only'), custom]);
    const builder = renderPage([node('footer-only')], local, { editor: true });
    if(builder.includes('data-pb-slot="default"')) return fail(builder);
    pass('only declared slots are drop places');
  },

  'a node whose type is not registered is left off the page, and shown as unavailable in the builder': async ({ pass, fail }) => {
    const nodes = [node('fragment', { name: 'nav' })];
    if(renderPage(nodes, registry).trim() !== '') return fail('an unknown widget was written to the page');
    if(!renderPage(nodes, registry, { editor: true }).includes('fragment is not available in this builder')) return fail('the builder does not show it');
    pass('unknown widgets are not lost');
  },

  'a page lists the modules its widgets need, once each': async ({ pass, fail }) => {
    const modules = collectModules([node('accordion', {}, { default: [node('accordion-item')] }), node('tabs'), node('card')], registry);
    if(modules.filter(url => url.endsWith('Accordion.js')).length !== 1) return fail(modules.join(', '));
    if(!modules.some(url => url.endsWith('Tabs.js')) || !modules.some(url => url.endsWith('Card.js'))) return fail(modules.join(', '));
    pass('modules are collected');
  },

  'a column gets a width at each screen size, or fills at that size': async ({ pass, fail }) => {
    const sized = renderPage([node('column', { desktop: '6', tablet: '', mobile: '12' })], registry);
    const filled = renderPage([node('column')], registry);
    if(!sized.includes('class="d-span-6 d-flex-0 t-flex-1 m-span-12 m-flex-0 px"')) return fail(sized);
    if(!filled.includes('class="d-flex-1 t-flex-1 m-span-12 m-flex-0 px"')) return fail(filled);
    pass('columns are sized per screen');
  },

  'the column widths are shown as their simplest fractions': async ({ pass, fail }) => {
    const label = value => COLUMN_WIDTH_OPTIONS.find(option => option.value === value)?.label;
    const expected = { '': 'Fill the space', '3': '1/4', '6': '1/2', '8': '2/3', '9': '3/4', '12': 'Full width' };
    const wrong = Object.entries(expected).filter(([value, text]) => label(value) !== text).map(([value]) => `${value}=${label(value)}`);
    if(wrong.length) return fail(`Wrong labels: ${wrong.join(', ')}`);
    pass('6 of 12 is shown as 1/2');
  },

  'a button shows its icon in front of the text, a custom SVG too': async ({ pass, fail }) => {
    const named = renderPage([node('button', { label: 'Save', kind: 'link', href: '/x', icon: 'save' })], registry);
    const custom = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x', icon: 'src:/icons/go.svg' })], registry);
    const plain = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x' })], registry);
    if(!named.includes('<a href="/x" class="btn d-ib"><k-icon name="save" class="mrq"></k-icon>Save</a>')) return fail(named);
    if(!custom.includes('<k-icon src="/icons/go.svg" class="mrq"></k-icon>Go</a>')) return fail(custom);
    if(plain.includes('<k-icon')) return fail(plain);
    pass('button icons are written, and none is left out');
  },

  'a button can be full width, as a link or a real button': async ({ pass, fail }) => {
    const link = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x', full: true })], registry);
    const real = renderPage([node('button', { label: 'Go', kind: 'button', full: true })], registry);
    const plain = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x' })], registry);
    if(!link.includes('<a href="/x" class="btn full d-ib">Go</a>')) return fail(link);
    if(!real.includes('class="full d-ib"')) return fail(real);
    if(plain.includes('full')) return fail(plain);
    pass('full width is a class on the button');
  },

  'a button lines its text up from the text alignment of the styles': async ({ pass, fail }) => {
    const centred = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x', full: true, styles: { align: 'center' } })], registry);
    const plain = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x' })], registry);
    if(!centred.includes('<a href="/x" class="btn full d-ib ta-center">Go</a>')) return fail(centred);
    if(plain.includes('ta-')) return fail(plain);
    pass('text alignment is a class on the button, from the styles');
  },

  'a file link shows a download icon unless one is chosen': async ({ pass, fail }) => {
    const byDefault = renderPage([node('file', { href: '/a.pdf', label: 'Report' })], registry);
    const none = renderPage([node('file', { href: '/a.pdf', label: 'Report', icon: '' })], registry);
    if(!byDefault.includes('<k-icon name="download" class="mrq"></k-icon>Report')) return fail(byDefault);
    if(none.includes('<k-icon')) return fail(none);
    pass('file icons default to download');
  },

  'an icon widget renders the icon it is given, a custom SVG too': async ({ pass, fail }) => {
    const named = renderPage([node('icon', { name: 'star' })], registry);
    const custom = renderPage([node('icon', { name: 'src:/icons/go.svg' })], registry);
    if(named !== '<k-icon name="star" class="d-ib"></k-icon>') return fail(named);
    if(custom !== '<k-icon src="/icons/go.svg" class="d-ib"></k-icon>') return fail(custom);
    pass('icon widget writes its icon');
  },

  'accordion sections and tabs show their icon in front of the heading': async ({ pass, fail }) => {
    const section = renderPage([node('accordion-item', { title: 'Q', icon: 'add' })], registry);
    const tab = renderPage([node('tab-item', { label: 'Parts', icon: 'settings' })], registry);
    if(!section.includes('<k-icon name="add" class="mrq"></k-icon>Q</k-accordion-header>')) return fail(section);
    if(!tab.includes('<k-icon name="settings" class="mrq"></k-icon>Parts</k-tab>')) return fail(tab);
    pass('headings take an icon');
  },

  'a widget with styles gets them on its element, on the page and in the builder': async ({ pass, fail }) => {
    const nodes = [node('text', { html: '<p>x</p>', styles: { margin: { top: 'f' }, padding: { bottom: 'h' } } })];
    const page = renderPage(nodes, registry);
    const builder = renderPage(nodes, registry, { editor: true });
    if(!page.startsWith('<div class="d-b mt pbh"')) return fail(page);
    if(!builder.includes('class="d-b mt pbh"') || !builder.includes('data-pb-id="text-id"')) return fail(builder);
    pass('spacing classes are on the widget element');
  },

  'a widget is drawn as a block, and a button or icon as inline-block, so its margin, padding and border apply': async ({ pass, fail }) => {
    const markdown = renderPage([node('markdown', { markdown: 'x' })], registry);
    const button = renderPage([node('button', { label: 'Go', kind: 'link', href: '/x' })], registry);
    if(!markdown.startsWith('<k-markdown class="d-b"')) return fail(markdown);
    if(!button.includes('d-ib')) return fail(button);
    pass('blocks and inline-blocks are set');
  },

  'an image with no picture is a grey stand-in in the builder, sized as the picture would be': async ({ pass, fail }) => {
    const square = renderPage([node('image', {})], registry, { editor: true });
    const sized = renderPage([node('image', { width: 300, ratio: '16/9' })], registry, { editor: true });
    const full = renderPage([node('image', { full: true })], registry, { editor: true });
    if(!square.includes('width: 256px') || !square.includes('aspect-ratio: 1 / 1') || !square.includes('<k-icon name="image"')) return fail(square);
    if(!sized.includes('width: 300px') || !sized.includes('aspect-ratio: 16 / 9')) return fail(sized);
    if(!full.includes('width: 100%')) return fail(full);
    pass('the stand-in follows the width and ratio');
  },

  'a video shows its controls on the page, including the default normal ones': async ({ pass, fail }) => {
    const normal = renderPage([node('video', { src: '/a.mp4' })], registry);
    const off = renderPage([node('video', { src: '/a.mp4', controls: 'none' })], registry);
    const full = renderPage([node('video', { src: '/a.mp4', controls: 'full' })], registry);
    if(!normal.includes('controls="normal"')) return fail(normal);
    if(!off.includes('controls="none"')) return fail(off);
    if(!full.includes('controls="full"') || full.split('controls=').length !== 2) return fail(full);
    pass('the controls setting reaches the video element');
  },

  'audio shows its controls on the page, including the default normal ones': async ({ pass, fail }) => {
    const normal = renderPage([node('audio', { src: '/a.mp3' })], registry);
    const off = renderPage([node('audio', { src: '/a.mp3', controls: 'none' })], registry);
    if(!normal.includes('controls="normal"')) return fail(normal);
    if(!off.includes('controls="none"') || off.split('controls=').length !== 2) return fail(off);
    pass('the controls setting reaches the audio element');
  },

  'a playlist of audio tracks is one k-audio-track per line, and its page loads the track element': async ({ pass, fail }) => {
    const nodes = [node('audio', { controls: 'playlist', tracks: 'a.mp3\n\n  b.mp3  ' })];
    const html = renderPage(nodes, registry);
    if(!html.includes('controls="playlist"')) return fail(html);
    if(!html.includes('<k-audio-track src="a.mp3"></k-audio-track><k-audio-track src="b.mp3"></k-audio-track>')) return fail(html);
    if(!collectModules(nodes, registry).some(url => url.endsWith('AudioTrack.js'))) return fail('AudioTrack.js is not loaded');
    pass('the playlist tracks and their element are written');
  },

  'audio adds a visualizer in its slot for bars or wave, nothing for off or anything else, and its page loads the control': async ({ pass, fail }) => {
    const nodes = [node('audio', { src: '/a.mp3', visualizer: 'wave' })];
    const wave = renderPage(nodes, registry);
    const bars = renderPage([node('audio', { src: '/a.mp3', visualizer: 'bars' })], registry);
    const off = renderPage([node('audio', { src: '/a.mp3', visualizer: '' })], registry);
    const other = renderPage([node('audio', { src: '/a.mp3', visualizer: '"><script>' })], registry);
    if(!wave.includes('<kc-audio-visualizer slot="visualizer" type="wave"></kc-audio-visualizer>')) return fail(wave);
    if(!bars.includes('<kc-audio-visualizer slot="visualizer" type="bars"></kc-audio-visualizer>')) return fail(bars);
    if(off.includes('kc-audio-visualizer') || other.includes('kc-audio-visualizer') || other.includes('<script>')) return fail(off + other);
    if(wave.includes('visualizer="')) return fail('the setting leaked onto the element: ' + wave);
    if(!collectModules(nodes, registry).some(url => url.endsWith('AudioVisualizer.js'))) return fail('AudioVisualizer.js is not loaded');
    pass('the visualizer is written only for the two known types');
  },

  'a fullscreen breakout spreads to the screen width with a negative margin, with its content in a column when asked': async ({ pass, fail }) => {
    const child = node('text', { html: '<p>Hi</p>' });
    const plain = renderPage([node('breakout', {}, { default: [child] })], registry);
    const contained = renderPage([node('breakout', { contain: true }, { default: [child] })], registry);
    const builder = renderPage([node('breakout', { contain: true }, { default: [child] })], registry, { editor: true });
    if(!plain.includes('width: calc(var(--page-width, 100vw) - var(--left-panel-width, 0px) - var(--right-panel-width, 0px))') || !plain.includes('margin-left: calc((100% -')) return fail(plain);
    if(!collectModules([node('breakout'), ], registry).some(url => url.endsWith('pageWidth.js')) || !collectModules([node('hero')], registry).some(url => url.endsWith('pageWidth.js'))) return fail('pageWidth.js is not loaded by the breakout and the hero');
    if(plain.includes('class="container"') || !plain.includes('<p>Hi</p>')) return fail(plain);
    if(!contained.includes('<div class="container">') || !contained.includes('<p>Hi</p>')) return fail(contained);
    if(!builder.includes('<div class="container" data-pb-slot="default">') || !builder.includes('data-pb-id="breakout-id"')) return fail(builder);
    pass('the breakout and its optional column are written');
  },

  'a hero breaks out only when asked, and a container is a div with the container class': async ({ pass, fail }) => {
    const normal = renderPage([node('hero', {})], registry);
    const broken = renderPage([node('hero', { breakout: true })], registry);
    const container = renderPage([node('container', {}, { default: [node('text', { html: '<p>Hi</p>' })] })], registry);
    if(normal.includes('100vw')) return fail(normal);
    if(!broken.includes('100vw') || !broken.includes('display: flex')) return fail(broken);
    if(!container.startsWith('<div class="container d-b">') || !container.includes('<p>Hi</p>')) return fail(container);
    const fixed = renderPage([node('hero', { image: '/a.jpg', fixed: true })], registry);
    const scrolling = renderPage([node('hero', { image: '/a.jpg' })], registry);
    if(!fixed.includes('background-attachment: fixed')) return fail(fixed);
    if(scrolling.includes('background-attachment')) return fail(scrolling);
    pass('the hero options and the container are written');
  },

  'an embed is inert in the builder, so it can be clicked and keys reach the builder, and live on the page': async ({ pass, fail }) => {
    const nodes = [node('embed', { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })];
    const page = renderPage(nodes, registry);
    const builder = renderPage(nodes, registry, { editor: true });
    if(!page.includes('<iframe') || page.includes('pointer-events') || page.includes('tabindex')) return fail(page);
    if(!builder.includes('pointer-events: none') || !builder.includes('<iframe') || !/<iframe[^>]*tabindex="-1"/.test(builder)) return fail(builder);
    pass('the embedded page takes no clicks or focus in the builder only');
  },

  'a photo viewer in the builder never goes fullscreen, and on the page it can': async ({ pass, fail }) => {
    const nodes = [node('photo-viewer', { images: [{ src: '/a.jpg' }, { src: '/b.jpg' }] }), node('photo-viewer', { images: [{ src: '/c.jpg' }] })];
    const page = renderPage(nodes, registry);
    const builder = renderPage(nodes, registry, { editor: true });
    if(page.includes('no-fullscreen')) return fail(page);
    if(builder.split('<k-photo-viewer').length !== 4 || builder.split('<k-photo-viewer').slice(1).some(part => !part.includes(' no-fullscreen'))) return fail(builder);
    pass('every photo viewer in the builder has no-fullscreen');
  },

  'columns and a hero keep their own display, and other widgets are blocks, because d-b would override a flex': async ({ pass, fail }) => {
    const row = renderPage([node('columns', {}, { default: [node('column', { desktop: '3' }), node('column', { desktop: '6' })] })], registry);
    const hero = renderPage([node('hero', {})], registry);
    const text = renderPage([node('text', { html: 'a' })], registry);
    if(!row.startsWith('<div class="row -mx"') || row.includes('d-b')) return fail(row);
    if(hero.includes('d-b')) return fail(hero);
    if(!text.includes('d-b')) return fail(text);
    pass('widgets that set their own display do not get d-b');
  },

  'a media gallery is one k-media-gallery-item per item with an address, and only the settings that differ from the defaults': async ({ pass, fail }) => {
    const items = [{ src: '/a.jpg', alt: 'A "quoted" one' }, { src: '' }, { src: '/b.mp4', poster: '/b.jpg', type: 'video' }];
    const nodes = [node('media-gallery', { items, thumbsPosition: 'top', ratio: '1/1', visualizer: 'wave' })];
    const html = renderPage(nodes, registry);
    if(!html.includes('<k-media-gallery thumbs-position="top" visualizer="wave"')) return fail(html);
    if(!html.includes('<k-media-gallery-item src="/a.jpg" alt="A &quot;quoted&quot; one"></k-media-gallery-item>')) return fail(html);
    if(!html.includes('<k-media-gallery-item src="/b.mp4" type="video" poster="/b.jpg"></k-media-gallery-item>')) return fail(html);
    if(html.split('<k-media-gallery-item').length !== 3) return fail('an item with no address was written: ' + html);
    if(html.includes('ratio=') || html.includes('items=')) return fail(html);
    if(!collectModules(nodes, registry).some(url => url.endsWith('MediaGallery.js'))) return fail('MediaGallery.js is not loaded');
    if(html.includes('no-fullscreen')) return fail('the page gallery must be able to open fullscreen: ' + html);
    if(!renderPage(nodes, registry, { editor: true }).includes(' no-fullscreen')) return fail('the builder gallery must not open fullscreen');
    pass('the gallery and its items are written');
  },

  'a media gallery with no items is nothing on the page, and a placeholder in the builder': async ({ pass, fail }) => {
    const nodes = [node('media-gallery', { items: [{ src: '' }] })];
    if(renderPage(nodes, registry).trim() !== '') return fail(renderPage(nodes, registry));
    if(!renderPage(nodes, registry, { editor: true }).includes('add items in the settings')) return fail(renderPage(nodes, registry, { editor: true }));
    pass('an empty gallery has no markup on the page');
  },

  'an icon widget can be chosen by source, and a source wins over a name': async ({ pass, fail }) => {
    const bySource = renderPage([node('icon', { src: '/icons/go.svg' })], registry);
    const both = renderPage([node('icon', { name: 'star', src: ' /logo.svg ' })], registry);
    const picked = renderPage([node('icon', { name: 'src:/icons/brand.svg' })], registry);
    if(!bySource.includes('<k-icon src="/icons/go.svg"') || bySource.includes('name=')) return fail(bySource);
    if(!both.includes('<k-icon src="/logo.svg"') || both.includes('name=') || both.includes('star')) return fail(`a source is used instead of the name: ${both}`);
    if(!picked.includes('<k-icon src="/icons/brand.svg"')) return fail(`a picker value of src: is a source: ${picked}`);
    const quoted = renderPage([node('icon', { src: '/a"b.svg' })], registry);
    if(quoted.includes('a"b') || !quoted.includes('&quot;')) return fail(`a source is escaped: ${quoted}`);
    pass('an icon is drawn from its source');
  },

  'an icon widget turns by a direction or by degrees, a direction wins, and values the icon does not know are left out': async ({ pass, fail }) => {
    const make = attrs => renderPage([node('icon', { name: 'star', ...attrs })], registry);
    for(const direction of ['down', 'left', 'up']){
      if(!make({ direction }).includes(` direction="${direction}"`)) return fail(`${direction}: ${make({ direction })}`);
    }
    if(!make({ rotation: 45 }).includes(' rotation="45"') || !make({ rotation: -90 }).includes(' rotation="-90"')) return fail(`degrees are written: ${make({ rotation: 45 })} ${make({ rotation: -90 })}`);
    const both = make({ direction: 'left', rotation: 45 });
    if(!both.includes(' direction="left"') || both.includes('rotation=')) return fail(`a direction is used instead of the degrees: ${both}`);
    for(const attrs of [{}, { rotation: 0 }, { rotation: '' }, { rotation: 'x' }, { direction: '' }, { direction: 'right' }, { direction: 'sideways' }]){
      const html = make(attrs);
      if(html.includes('direction=') || html.includes('rotation=')) return fail(`no turn expected for ${JSON.stringify(attrs)}: ${html}`);
    }
    const turned = renderPage([node('icon', { src: '/go.svg', direction: 'down' })], registry);
    if(!turned.includes('<k-icon src="/go.svg"') || !turned.includes(' direction="down"')) return fail(`a source icon turns too: ${turned}`);
    pass('an icon is turned by a direction or degrees');
  },

  'an icon widget can be animated with spin, blink or pulse, and nothing else': async ({ pass, fail }) => {
    const make = attrs => renderPage([node('icon', { name: 'star', ...attrs })], registry);
    for(const animation of ['spin', 'blink', 'pulse']){
      if(!make({ animation }).includes(` animation="${animation}"`)) return fail(`${animation}: ${make({ animation })}`);
    }
    for(const animation of ['', 'bounce', undefined]){
      if(make({ animation }).includes('animation=')) return fail(`${animation} should not be written: ${make({ animation })}`);
    }
    const all = make({ direction: 'up', animation: 'spin' });
    if(!all.includes(' direction="up"') || !all.includes(' animation="spin"')) return fail(`a turn and an animation together: ${all}`);
    pass('animations are written');
  },

  'an icon widget with no icon and no source is nothing on the page, and a placeholder in the builder': async ({ pass, fail }) => {
    if(renderPage([node('icon', {})], registry).trim() !== '' || renderPage([node('icon', { name: '', src: '  ' })], registry).trim() !== '') return fail('an empty icon should write nothing on the page');
    const builder = renderPage([node('icon', {})], registry, { editor: true });
    if(!builder.includes('data-pb-id="icon-id"') || !/choose an icon, or give a source/.test(builder)) return fail(builder);
    const marked = renderPage([node('icon', { name: 'star', direction: 'down', animation: 'spin' })], registry, { editor: true });
    if(!marked.includes('data-pb-id="icon-id"') || !marked.includes(' direction="down"') || !marked.includes(' animation="spin"')) return fail(`the builder marks keep the turn: ${marked}`);
    const names = registry.get('icon').attributes.map(attribute => attribute.name).join();
    if(names !== 'name,src,direction,rotation,animation') return fail(`The icon should have every setting of k-icon, got ${names}`);
    const rotation = registry.get('icon').attributes.find(attribute => attribute.name === 'rotation');
    if(rotation.when?.direction !== '') return fail('Rotation should only show while there is no direction');
    pass('an empty icon is a placeholder');
  },

  'the first accordion section starts open unless a section says otherwise, and the open one is marked on the heading and the panel': async ({ pass, fail }) => {
    const sections = open => ['a', 'b', 'c'].map((id, index) => nodeWith(id, 'accordion-item', { title: id, ...(open[index] === undefined ? {} : { open: open[index] }) }));
    const make = open => renderPage([nodeWith('acc', 'accordion', {}, { default: sections(open) })], registry);
    const byDefault = make([]);
    if(!byDefault.includes('<k-accordion-header for-panel="pb-a" active>') || !byDefault.includes('<k-accordion-panel name="pb-a" active>')) return fail(`the first section opens: ${byDefault}`);
    if(count(byDefault, ' active>') !== 2) return fail(`only the first section is open: ${byDefault}`);
    const second = make([false, true]);
    if(!second.includes('<k-accordion-panel name="pb-b" active>') || count(second, ' active>') !== 2) return fail(`a section that says open is the open one, and the first does not: ${second}`);
    const none = make([false]);
    if(count(none, ' active>') !== 0) return fail(`a section that says closed leaves none open: ${none}`);
    const several = make([true, undefined, true]);
    if(count(several, ' active>') !== 4 || several.includes('name="pb-b" active')) return fail(`several can be open: ${several}`);
    pass('the open sections are marked');
  },

  'tabs write their open tab by name, the hash and remembered tab on the page, and a fixed height': async ({ pass, fail }) => {
    const tabs = attrs => nodeWith('tb', 'tabs', attrs, { default: [
      nodeWith('t1', 'tab-item', { label: 'One', name: 'one' }),
      nodeWith('t2', 'tab-item', { label: 'Two', name: 'my tab!' }),
      nodeWith('t3', 'tab-spacer'),
      nodeWith('t4', 'tab-item', { label: 'Dup', name: 'one' }),
      nodeWith('t5', 'tab-item', { label: 'Plain' })
    ] });
    const html = renderPage([tabs({ active: 't2', hashRouting: true, persistentId: 'main', fixedHeight: true })], registry);
    if(!html.includes(' active="my-tab"')) return fail(`the open tab is written by its cleaned name: ${html}`);
    if(!html.includes(' hash-routing') || !html.includes(' persistent-id="main"') || !html.includes(' fixed-height')) return fail(html);
    if(!html.includes('style="height: 100%"')) return fail(`fixed height needs the tabs to fill their container: ${html}`);
    if(!html.includes('<k-tab for="one">One</k-tab>') || !html.includes('<k-tab-content name="one">')) return fail(`a tab and its content share the name: ${html}`);
    if(!html.includes('<k-tab for="my-tab">Two</k-tab>')) return fail(`a name is letters, numbers and dashes: ${html}`);
    if(!html.includes('<k-tab for="pb-t4">Dup</k-tab>')) return fail(`a name an earlier tab has falls back to the id: ${html}`);
    if(!html.includes('<k-tab for="pb-t5">Plain</k-tab>') || !html.includes('<k-tab-content name="pb-t5">')) return fail(`a tab with no name uses its id: ${html}`);
    if(!html.includes('<k-tab-spacer></k-tab-spacer>')) return fail(`a spacer is written in its place: ${html}`);
    const plain = renderPage([tabs({})], registry);
    if(/ active=| hash-routing| persistent-id| fixed-height|height: 100%/.test(plain)) return fail(`defaults write nothing: ${plain}`);
    if(/ active=/.test(renderPage([tabs({ active: 'gone' })], registry))) return fail('an open tab that is not there is left out');
    pass('tabs are written with their settings');
  },

  'tabs in the builder leave the hash and the remembered tab out, so the builder keeps its own address': async ({ pass, fail }) => {
    const tabs = nodeWith('tb', 'tabs', { active: 't1', hashRouting: true, persistentId: 'main', fixedHeight: true }, { default: [nodeWith('t1', 'tab-item', { label: 'One' })] });
    const html = renderPage([tabs], registry, { editor: true });
    if(html.includes('hash-routing') || html.includes('persistent-id')) return fail(`the builder must not route or remember: ${html}`);
    if(!html.includes(' fixed-height') || !html.includes(' active="pb-t1"') || !html.includes('data-pb-id="tb"')) return fail(`everything else is still written: ${html}`);
    if(!html.includes('data-pb-id="t1"') || !/<k-tab-content[^>]*data-pb-slot="default"/.test(html)) return fail(`a tab marks its content as the drop place: ${html}`);
    pass('the builder is not routed');
  },

  'a content slider is its slides as plain divs, with its settings written only when they differ from the defaults': async ({ pass, fail }) => {
    const slides = [nodeWith('s1', 'slide', {}, { default: [] }), nodeWith('s2', 'slide', {}, { default: [node('text', { html: '<p>Hi</p>' })] })];
    const make = attrs => renderPage([nodeWith('cs', 'content-slider', attrs, { default: slides })], registry);
    const html = make({});
    if(!html.startsWith('<k-content-slider class="d-b">') || !html.includes('<div></div>\n<div><div class="d-b"><p>Hi</p></div></div></k-content-slider>')) return fail(`each slide is a div: ${html}`);
    if(html.includes('data-pb') || / (index|loop|controls|min-height|keyboard-controls|global-controls)=/.test(html)) return fail(`defaults write nothing: ${html}`);
    if(make({ controls: true, loop: false, keyboardControls: true, globalControls: false }) !== html) return fail('settings at their default are left out');
    const set = make({ controls: false, loop: true, keyboardControls: false, globalControls: true });
    for(const part of [' controls="false"', ' loop="true"', ' keyboard-controls="false"', ' global-controls="true"']){
      if(!set.includes(part)) return fail(`${part} is missing: ${set}`);
    }
    pass('the slider and its slides are written');
  },

  'a content slider starts on the slide chosen, and has a minimum height in px, rem or vh': async ({ pass, fail }) => {
    const slides = ['s1', 's2', 's3'].map(id => nodeWith(id, 'slide'));
    const make = attrs => renderPage([nodeWith('cs', 'content-slider', attrs, { default: slides })], registry);
    if(!make({ active: 's3' }).includes(' index="2"') || !make({ active: 's2' }).includes(' index="1"')) return fail(`the chosen slide is written as its index: ${make({ active: 's3' })}`);
    if(make({ active: 's1' }).includes('index=') || make({ active: 'gone' }).includes('index=') || make({}).includes('index=')) return fail('the first slide, or one that is gone, writes no index');
    if(!make({ minHeight: 10, minHeightUnit: 'rem' }).includes(' min-height="10rem"') || !make({ minHeight: 50, minHeightUnit: 'vh' }).includes(' min-height="50vh"')) return fail(make({ minHeight: 10, minHeightUnit: 'rem' }));
    if(!make({ minHeight: 200 }).includes(' min-height="200px"') || !make({ minHeight: 5, minHeightUnit: 'em' }).includes(' min-height="5px"')) return fail('the unit is px unless it is rem or vh');
    for(const minHeight of [0, '', -3, 'tall', undefined]){
      if(make({ minHeight }).includes('min-height=')) return fail(`${minHeight} is no minimum height`);
    }
    const attribute = registry.get('content-slider').attributes.find(entry => entry.name === 'minHeightUnit');
    if(attribute.beside !== 'minHeight') return fail('The unit should be drawn beside the minimum height');
    pass('the start slide and minimum height are written');
  },

  'a content slider in the builder keeps the arrow keys for editing, and marks each slide as a place to drop widgets': async ({ pass, fail }) => {
    const slides = [nodeWith('s1', 'slide'), nodeWith('s2', 'slide')];
    const html = renderPage([nodeWith('cs', 'content-slider', { keyboardControls: true, globalControls: true }, { default: slides })], registry, { editor: true });
    if(count(html, 'keyboard-controls="false"') !== 1 || html.includes('global-controls')) return fail(`keyboard controls are off, and there are no global ones: ${html}`);
    if(!html.includes('<div data-pb-id="s1" data-pb-title="Slide" data-pb-slot="default" tabindex="0">') || !html.includes('data-pb-id="s2"')) return fail(`slides are drop places: ${html}`);
    if(!html.includes('data-pb-id="cs"')) return fail(`the slider is marked: ${html}`);
    const page = renderPage([nodeWith('cs', 'content-slider', { keyboardControls: true }, { default: slides })], registry);
    if(page.includes('keyboard-controls') || page.includes('data-pb')) return fail(`the page keeps its own keys and has no marks: ${page}`);
    pass('the builder slider does not take the arrow keys');
  },

  'a spacer is a div as tall as its size, small 2rem, medium 6rem, large 12rem or a custom number of pixels, and the size is not written as an attribute': async ({ pass, fail }) => {
    const make = attrs => renderPage([node('spacer', attrs)], registry);
    const expected = [[{}, '6rem'], [{ size: 'medium' }, '6rem'], [{ size: 'small' }, '2rem'], [{ size: 'large' }, '12rem'], [{ size: 'custom', height: 90 }, '90px']];
    for(const [attrs, height] of expected){
      if(make(attrs) !== `<div style="height: ${height}" class="d-b"></div>`) return fail(`${JSON.stringify(attrs)} should be ${height}, got ${make(attrs)}`);
    }
    if(!make({ size: 'huge' }).includes('height: 6rem')) return fail(`a size that is not one of the choices is medium, got ${make({ size: 'huge' })}`);
    if(!make({ size: 'small', height: 90 }).includes('height: 2rem')) return fail(`the height only counts for a custom size, got ${make({ size: 'small', height: 90 })}`);
    if(!make({ size: 'custom' }).includes('height: 0px') || !make({ size: 'custom', height: 'tall' }).includes('height: 0px')) return fail(`a custom size with no number is 0px, got ${make({ size: 'custom' })}`);
    if(/ (size|height)=/.test(make({ size: 'large', height: 5 }))) return fail('the settings stay in the page tree, not in the markup');
    if(!/class="d-b mt"/.test(renderPage([node('spacer', { styles: { margin: { top: 'f' } } })], registry))) return fail('a spacer takes the margin from its styles like any widget');
    const height = registry.get('spacer').attributes.find(attribute => attribute.name === 'height');
    if(height.when?.size !== 'custom' || height.min !== 0 || height.max !== 2000) return fail('The pixel height is only for the custom size, from 0 to 2000');
    pass('a spacer is as tall as its size');
  },

  'a spacer in the builder is a marked, labelled bar, and on the page it is empty': async ({ pass, fail }) => {
    const builder = renderPage([node('spacer', { size: 'small' })], registry, { editor: true });
    if(!builder.includes('data-pb-id="spacer-id"') || !builder.includes('data-pb-title="Spacer"') || !builder.includes('>Spacer</div>')) return fail(`the builder shows and marks it: ${builder}`);
    if(!/class="tc-muted ta-center d-b"/.test(builder) || !builder.includes('height: 2rem')) return fail(`the label is muted and centred, at its height: ${builder}`);
    const page = renderPage([node('spacer', { size: 'small' })], registry);
    if(page.includes('Spacer') || page.includes('data-pb') || page.includes('tc-muted') || !page.endsWith('></div>')) return fail(`the page has no label or marks: ${page}`);
    if(count(builder, 'data-pb-slot') !== 0) return fail('a spacer holds no widgets');
    pass('the builder labels a spacer, the page does not');
  },

  'an html widget is written exactly as it is, with no sanitizing, on the page and in the builder': async ({ pass, fail }) => {
    const code = '<p class="x">a</p><script>y()</script>';
    const page = renderPage([node('html', { html: code })], registry, { sanitize: () => 'CLEAN' });
    if(page !== `<div class="d-b">${code}</div>`) return fail(`the HTML is written as it is, even when a sanitizer is given: ${page}`);
    const builder = renderPage([node('html', { html: '<b>x</b>' })], registry, { editor: true });
    if(!builder.includes('data-pb-id="html-id"') || !builder.includes('data-pb-title="HTML"') || !builder.includes('<b>x</b></div>')) return fail(`the builder marks it and shows the HTML: ${builder}`);
    if(builder.includes('contenteditable')) return fail(`the HTML is written in its settings, not on the page: ${builder}`);
    if(renderPage([node('html', {})], registry) !== '<div class="d-b"></div>') return fail(`no HTML is an empty div: ${renderPage([node('html', {})], registry)}`);
    if(/ html=/.test(page)) return fail('the HTML is the content, not an attribute');
    if(collectModules([node('html', { html: code })], registry).length) return fail('an html widget needs no module');
    const styled = renderPage([node('html', { html: 'x', styles: { align: 'center' } })], registry);
    if(!styled.includes('ta-center')) return fail(`it takes its styles like a widget: ${styled}`);
    pass('the HTML is written as it is');
  },

  'show more writes opened only when it starts open, with its content inside, and loads its element': async ({ pass, fail }) => {
    const content = { default: [node('text', { html: 'hi' })] };
    const make = (attrs, options) => renderPage([node('show-more', attrs, content)], registry, options);
    if(make({}) !== '<k-show-more class="d-b"><div class="d-b">hi</div></k-show-more>') return fail(`closed by default, with its content inside: ${make({})}`);
    if(!make({ opened: true }).startsWith('<k-show-more opened class="d-b">')) return fail(`opened is a plain attribute: ${make({ opened: true })}`);
    if(make({ opened: false }).includes('opened')) return fail(`opened turned off is not written: ${make({ opened: false })}`);
    const builder = make({ opened: true }, { editor: true });
    if(!builder.includes('data-pb-id="show-more-id"') || !builder.includes('data-pb-slot="default"') || !builder.includes('data-pb-id="text-id"')) return fail(`the builder marks it as a place to drop widgets: ${builder}`);
    if(make({}).includes('data-pb')) return fail('the page has no marks');
    const modules = collectModules([node('show-more'), node('show-more')], registry);
    if(modules.length !== 1 || !modules[0].endsWith('/components/ShowMore.js')) return fail(`ShowMore.js is loaded once, got ${modules}`);
    const opened = registry.get('show-more').attributes.find(attribute => attribute.name === 'opened');
    if(opened.type !== 'boolean' || opened.label !== 'Start open') return fail('The setting is a boolean called Start open');
    pass('show more is written with its setting and content');
  },

  'a spacer and an html widget load no modules, so a page of them needs no scripts': async ({ pass, fail }) => {
    const modules = collectModules([node('spacer'), node('html', { html: 'x' }), node('divider')], registry);
    if(modules.length) return fail(`these widgets are plain elements, got ${modules}`);
    if(collectModules([node('spacer'), node('show-more')], registry).length !== 1) return fail('only show more brings a module');
    pass('plain widgets bring no modules');
  },

  'escapeAttribute escapes quotes and angle brackets': async ({ pass, fail }) => {
    if(escapeAttribute('a"b<c>\'d') !== 'a&quot;b&lt;c&gt;&#39;d') return fail(escapeAttribute('a"b<c>\'d'));
    pass('escapes');
  }
};
