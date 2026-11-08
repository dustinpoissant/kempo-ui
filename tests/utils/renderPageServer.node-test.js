import { widgets, registryOf } from '../../src/utils/pageWidgets.js';
import { renderPage, collectModules } from '../../src/utils/renderPage.js';
import * as tree from '../../src/utils/pageTree.js';

/*
  Utility Functions
*/
const registry = registryOf(widgets);

const node = (type, attrs = {}, slots = {}) => ({ id: `${type}-id`, type, attrs, slots });

const count = (text, part) => text.split(part).length - 1;

/* One of every widget that can stand on its own, at its defaults, with the sections it starts with. */
const everyWidget = () => widgets.filter(definition => !definition.section).map(definition => tree.defaultNode(registry, definition.name));

const EDITOR_MARKS = ['data-pb-', 'contenteditable', 'tabindex'];

/*
  Tests
*/
export default {
  'the renderer, the page tree, the widget registry and the styles load with no DOM': async ({ pass, fail }) => {
    if(typeof document !== 'undefined' || typeof window !== 'undefined' || typeof customElements !== 'undefined') return fail('This test must run with no DOM globals');
    const stamp = Date.now();
    for(const file of ['renderPage', 'pageTree', 'pageWidgets', 'pageWidgetDefaults', 'styles']){
      try {
        await import(`../../src/utils/${file}.js?fresh=${stamp}`);
      } catch (error) {
        return fail(`${file}.js should load in Node, got ${error.message}`);
      }
    }
    pass('the renderer needs no DOM');
  },

  'every widget, at its defaults, renders on a server without throwing, with no editor marks': async ({ pass, fail }) => {
    const nodes = everyWidget();
    if(nodes.length < 20) return fail(`Expected a node for each widget, got ${nodes.length}`);
    for(const widget of nodes){
      let html;
      try {
        html = renderPage([widget], registry);
      } catch (error) {
        return fail(`${widget.type} threw on a server: ${error.message}`);
      }
      const marks = EDITOR_MARKS.filter(mark => html.includes(mark));
      if(marks.length) return fail(`${widget.type} has editor marks (${marks.join(', ')}) on the page: ${html}`);
      try {
        renderPage([widget], registry, { editor: true });
      } catch (error) {
        return fail(`${widget.type} threw in editor mode: ${error.message}`);
      }
    }
    pass('every widget renders in Node');
  },

  'a page of many widgets renders on a server as the elements the page needs': async ({ pass, fail }) => {
    const slides = ['one', 'two'].map(id => node('slide', {}, { default: [node('text', { html: `<p>${id}</p>` })] }));
    const nodes = [
      node('text', { html: '<h1>Title</h1>' }),
      node('markdown', { markdown: '# Hi' }),
      node('columns', {}, { default: [node('column', { desktop: '6' }, { default: [node('text', { html: '<p>a</p>' })] }), node('column', { desktop: '6' })] }),
      node('accordion', {}, { default: [node('accordion-item', { title: 'Q' }, { default: [node('text', { html: 'A' })] })] }),
      node('tabs', {}, { default: [node('tab-item', { label: 'One' }), node('tab-spacer'), node('tab-item', { label: 'Two' })] }),
      node('content-slider', { loop: true }, { default: slides }),
      node('show-more', { opened: true }, { default: [node('text', { html: 'more' })] }),
      node('button', { label: 'Go', kind: 'link', href: '/go' }),
      node('table', { rows: [['A', 'B'], ['c', 'd']] }),
      node('icon', { name: 'star' }),
      node('spacer'),
      node('divider'),
      node('card', { label: 'Card' }, { default: [] })
    ];
    const html = renderPage(nodes, registry);
    for(const part of ['<h1>Title</h1>', '<k-markdown', '<div class="row -mx', '<k-accordion', '<k-accordion-header', '<k-tabs', '<k-tab-spacer>', '<k-content-slider loop="true"', '<k-show-more opened', '<a href="/go"', '<table', '<k-icon name="star"', '<k-card']){
      if(!html.includes(part)) return fail(`${part} is missing: ${html}`);
    }
    const marks = EDITOR_MARKS.filter(mark => html.includes(mark));
    if(marks.length) return fail(`The page has editor marks: ${marks.join(', ')}`);
    pass('a page is written as HTML');
  },

  'rendering a page does not change it, and writes the same HTML each time': async ({ pass, fail }) => {
    const nodes = everyWidget();
    const before = JSON.stringify(nodes);
    const first = renderPage(nodes, registry);
    const second = renderPage(nodes, registry);
    if(JSON.stringify(nodes) !== before) return fail('Rendering must not change the page tree, a server reuses it between requests');
    if(first !== second) return fail('The same page should write the same HTML');
    pass('rendering is pure');
  },

  'a sanitize function passed in is used for the HTML of a text widget and for every table cell': async ({ pass, fail }) => {
    const calls = [];
    const sanitize = html => {
      calls.push(html);
      return `[${html}]`;
    };
    const html = renderPage([node('text', { html: '<b>t</b>' }), node('table', { rows: [['H1', 'H2'], ['c1', 'c2']], responsive: false })], registry, { sanitize });
    if(!html.includes('[<b>t</b>]')) return fail(`The text should go through the sanitizer: ${html}`);
    for(const cell of ['H1', 'H2', 'c1', 'c2']){
      if(!html.includes(`[${cell}]`)) return fail(`The cell ${cell} should go through the sanitizer: ${html}`);
    }
    if(calls.slice().sort().join() !== ['<b>t</b>', 'H1', 'H2', 'c1', 'c2'].sort().join()) return fail(`Expected the text and the four cells, got ${calls.join(' | ')}`);
    if(calls.some(call => typeof call !== 'string')) return fail('The sanitizer is given strings');
    const stripped = renderPage([node('text', { html: '<p>ok</p><script>x()</script>' })], registry, { sanitize: value => value.replace(/<script>.*?<\/script>/g, '') });
    if(stripped.includes('script') || !stripped.includes('<p>ok</p>')) return fail(`A real sanitizer cleans the text: ${stripped}`);
    pass('the sanitizer is used for text and cells');
  },

  'markdown is escaped, the html widget is raw and a script is only closed safely, so none of them go through the sanitizer': async ({ pass, fail }) => {
    const calls = [];
    const sanitize = html => {
      calls.push(html);
      return html;
    };
    const html = renderPage([
      node('markdown', { markdown: '<b>x</b> & more' }),
      node('html', { html: '<i>raw</i>' }),
      node('script', { code: 'a("</script>")' })
    ], registry, { sanitize });
    if(calls.length) return fail(`These widgets do not use the sanitizer, got ${calls.join(' | ')}`);
    if(!html.includes('&lt;b&gt;x&lt;/b&gt; &amp; more')) return fail(`Markdown text is escaped: ${html}`);
    if(!html.includes('<i>raw</i>')) return fail(`The html widget is written as it is: ${html}`);
    if(html.includes('</script>")')) return fail(`A script cannot close itself early: ${html}`);
    pass('only text and table cells are sanitized');
  },

  'without a sanitizer the HTML is written as it is, so a server has to pass one': async ({ pass, fail }) => {
    const risky = '<img src="x" onerror="steal()">';
    const nodes = [node('text', { html: risky }), node('table', { rows: [[risky]], responsive: false })];
    const unsafe = renderPage(nodes, registry);
    if(count(unsafe, 'onerror') !== 2) return fail(`With no sanitizer the HTML is written as given, in the text and the cell: ${unsafe}`);
    const safe = renderPage(nodes, registry, { sanitize: html => html.replace(/ onerror="[^"]*"/g, '') });
    if(safe.includes('onerror')) return fail(`With a sanitizer it is cleaned: ${safe}`);
    pass('a server must pass a sanitizer');
  },

  'collectModules gives absolute URLs of the modules a page needs, each once, and the builder adds its editor modules': async ({ pass, fail }) => {
    const nodes = [
      node('markdown', { markdown: 'x' }),
      node('show-more'),
      node('show-more'),
      node('tabs', {}, { default: [node('tab-item')] }),
      node('accordion', {}, { default: [node('accordion-item')] }),
      node('content-slider', {}, { default: [node('slide')] }),
      node('card')
    ];
    const page = collectModules(nodes, registry);
    if(page.some(url => typeof url !== 'string')) return fail('Modules are URL strings');
    for(const url of page){
      try {
        new URL(url);
      } catch {
        return fail(`${url} should be an absolute URL`);
      }
    }
    if(page.some(url => !url.startsWith('file:'))) return fail(`In Node the URLs come from import.meta.url, so they are file: URLs, got ${page.join()}`);
    if(new Set(page).size !== page.length) return fail(`Each module once, got ${page.join()}`);
    const names = page.map(url => url.split('/').pop());
    for(const name of ['Markdown.js', 'ShowMore.js', 'Tabs.js', 'Accordion.js', 'ContentSlider.js', 'Card.js']){
      if(!names.includes(name)) return fail(`${name} is needed by the page, got ${names.join()}`);
    }
    if(names.includes('MarkdownWidgetEditor.js')) return fail('The page must not load the builder\'s editor element');
    const builder = collectModules(nodes, registry, { editor: true }).map(url => url.split('/').pop());
    if(!builder.includes('MarkdownWidgetEditor.js')) return fail(`The builder loads the markdown editor element, got ${builder.join()}`);
    if(collectModules([], registry).length) return fail('An empty page needs nothing');
    pass('modules are absolute URLs');
  }
};
