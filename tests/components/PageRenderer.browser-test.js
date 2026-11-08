import PageRenderer from '../../src/components/PageRenderer.js';

/*
  Utility Functions
*/
const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const renderedWith = async value => {
  const renderer = document.createElement('k-page-renderer');
  document.body.appendChild(renderer);
  const rendered = new Promise(resolve => renderer.addEventListener('render', resolve, { once: true }));
  renderer.value = value;
  await rendered;
  return renderer;
};

/*
  Tests
*/
export default {
  'should be a page renderer': async ({ pass, fail }) => {
    const renderer = await renderedWith(page());
    if(!(renderer instanceof PageRenderer)){
      renderer.remove();
      return fail('the element is not a PageRenderer');
    }
    renderer.remove();
    pass('the element is a PageRenderer');
  },

  'should write the page widgets into itself': async ({ pass, fail }) => {
    const renderer = await renderedWith(page({ id: 'a', type: 'text', attrs: { html: '<p>Shown</p>' }, slots: {} }));
    const shown = renderer.querySelector('p');
    renderer.remove();
    if(shown?.textContent !== 'Shown') return fail('the text widget was not rendered');
    pass('widgets are rendered');
  },

  'should load and upgrade the elements its widgets need': async ({ pass, fail }) => {
    const renderer = await renderedWith(page({ id: 'c', type: 'card', attrs: { label: 'Card' }, slots: { default: [{ id: 'd', type: 'text', attrs: { html: '<p>Inside</p>' }, slots: {} }] } }));
    const card = renderer.querySelector('k-card');
    renderer.remove();
    if(!card) return fail('the card element is missing');
    if(!customElements.get('k-card')) return fail('k-card was not loaded');
    pass('the card element is loaded and rendered');
  },

  'should run the scripts of the page': async ({ pass, fail }) => {
    const renderer = await renderedWith(page({ id: 's', type: 'script', attrs: { code: 'window.pageRendererScriptRan = true;' }, slots: {} }));
    const ran = window.pageRendererScriptRan === true;
    renderer.remove();
    delete window.pageRendererScriptRan;
    if(!ran) return fail('the script did not run');
    pass('scripts run after rendering');
  },

  'should give the same HTML as a string for a server': async ({ pass, fail }) => {
    const html = PageRenderer.toHTML(page({ id: 'h', type: 'divider', attrs: { above: 'small' }, slots: {} }));
    if(!html.startsWith('<hr')) return fail(html);
    pass('toHTML writes the page without a DOM');
  }
};
