import NavLink from '../../../src/components/controls/NavLink.js';
import '../../../src/components/Icon.js';

const create = async (attrs = '', content = '<k-icon name="github-mark"></k-icon>') => {
  const container = document.createElement('div');
  container.innerHTML = `<kc-nav-link ${attrs}>${content}</kc-nav-link>`;
  document.body.appendChild(container);
  const el = container.querySelector('kc-nav-link');
  await el.updateComplete;
  return { container, el };
};

export default {
  'should render an anchor with href and target': async ({pass, fail}) => {
    const { container, el } = await create('href="https://example.com" target="_blank"');
    const a = el.shadowRoot.querySelector('a');
    const result = { instance: el instanceof NavLink, href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') };
    container.remove();
    if(!result.instance) return fail('Should be a NavLink');
    if(result.href !== 'https://example.com' || result.target !== '_blank') return fail(`Wrong anchor: ${JSON.stringify(result)}`);
    if(result.rel !== 'noopener') return fail('A _blank link should have rel="noopener"');
    pass('Anchor renders correctly');
  },

  'should not be disabled without a host': async ({pass, fail}) => {
    const { container, el } = await create('href="#x"');
    const disabled = el.disabled;
    container.remove();
    if(disabled) return fail('A link needs no host, so it should not be disabled');
    pass('Not disabled');
  },

  'should be 40px tall': async ({pass, fail}) => {
    const { container, el } = await create('href="#x"');
    const height = Math.round(el.getBoundingClientRect().height);
    container.remove();
    if(height !== 40) return fail(`Expected 40px, got ${height}px`);
    pass('40px tall');
  },

  'should label the anchor with the title': async ({pass, fail}) => {
    const { container, el } = await create('href="#x" title="npm"');
    const label = el.shadowRoot.querySelector('a').getAttribute('aria-label');
    container.remove();
    if(label !== 'npm') return fail(`aria-label should be the title, got ${label}`);
    pass('aria-label from title');
  },

  'should use a menu-text slot over the title': async ({pass, fail}) => {
    const { container, el } = await create('href="#x" title="npm"', '<k-icon name="npm"></k-icon><span slot="menu-text">View on npm</span>');
    const assigned = el.shadowRoot.querySelector('slot[name="menu-text"]').assignedNodes().map(n => n.textContent).join('');
    container.remove();
    if(assigned !== 'View on npm') return fail(`menu-text should win, got "${assigned}"`);
    pass('menu-text slot is used');
  }
};
