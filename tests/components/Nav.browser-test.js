import Nav from '../../src/components/Nav.js';
import '../../src/components/Icon.js';
import '../../src/components/controls/NavLink.js';

const wait = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

const create = async (width = 900, attrs = '') => {
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.innerHTML = `
    <k-nav ${attrs}>
      <button id="menu" no-collapse>Menu</button>
      <a id="home" href="#home">Home</a>
      <a id="products" href="#products">Products</a>
      <a id="pricing" href="#pricing">Pricing</a>
      <div class="flex" id="spacer"></div>
      <input id="search" type="search" style="width:6rem" />
      <kc-nav-link id="github" href="https://example.com/gh" target="_blank" title="GitHub"><k-icon name="github-mark"></k-icon></kc-nav-link>
      <a id="account" slot="right" href="#account">Account</a>
    </k-nav>
  `;
  document.body.appendChild(container);
  const el = container.querySelector('k-nav');
  await el.updateComplete;
  await wait(300);
  return { container, el };
};

const cleanup = container => container.remove();

const movedIds = el => [...el.children].filter(c => c.getAttribute('slot') === 'overflow').map(c => c.id);

export default {
  'should be a control bar with a nav element': async ({pass, fail}) => {
    const { container, el } = await create();
    const ok = el instanceof Nav && !!el.shadowRoot.querySelector('nav#bar');
    cleanup(container);
    if(!ok) return fail('k-nav should render a nav element and extend the control bar');
    pass('k-nav renders a nav');
  },

  'should keep everything in the bar when there is room': async ({pass, fail}) => {
    const { container, el } = await create(900);
    const moved = movedIds(el);
    cleanup(container);
    if(moved.length) return fail(`Nothing should move, moved: ${moved}`);
    pass('Nothing moves when it fits');
  },

  'should move links and buttons into the menu when narrow': async ({pass, fail}) => {
    const { container, el } = await create(900);
    container.style.width = '260px';
    await wait(500);
    const moved = movedIds(el);
    const more = el.shadowRoot.getElementById('more');
    const hidden = more.hidden;
    const disabled = more.disabled;
    cleanup(container);
    if(!moved.includes('account')) return fail(`The right slot should move first, moved: ${moved}`);
    if(hidden) return fail('The more button should show');
    if(disabled) return fail('The more button should be usable');
    pass('Links collapse into the menu');
  },

  'should never move spacers or no-collapse items': async ({pass, fail}) => {
    const { container, el } = await create(900);
    container.style.width = '120px';
    await wait(500);
    const moved = movedIds(el);
    cleanup(container);
    const wrong = ['menu', 'spacer'].filter(id => moved.includes(id));
    if(wrong.length) return fail(`These should stay in the bar: ${wrong}`);
    if(!moved.includes('home') || !moved.includes('pricing')) return fail(`Links should move, moved: ${moved}`);
    pass('Spacers and no-collapse items stay');
  },

  'should move other elements such as a search box into the menu': async ({pass, fail}) => {
    const { container, el } = await create(900);
    container.style.width = '120px';
    await wait(500);
    const moved = movedIds(el);
    const inMenu = el.querySelector('#search').hasAttribute('in-menu');
    cleanup(container);
    if(!moved.includes('search')) return fail(`The search box should move into the menu, moved: ${moved}`);
    if(!inMenu) return fail('A moved element should get in-menu');
    pass('Any element can collapse');
  },

  'should collapse a kc-nav-link and show its menu text in the menu': async ({pass, fail}) => {
    const { container, el } = await create(900);
    const link = el.querySelector('#github');
    const textSlot = link.shadowRoot.querySelector('slot[name="menu-text"]');
    const hiddenInBar = getComputedStyle(textSlot).display === 'none';
    container.style.width = '120px';
    await wait(500);
    const inMenu = link.getAttribute('slot') === 'overflow' && link.hasAttribute('in-menu');
    const shownInMenu = getComputedStyle(textSlot).display !== 'none';
    const label = textSlot.textContent.trim();
    cleanup(container);
    if(!hiddenInBar) return fail('The menu text should be hidden while the link is in the bar');
    if(!inMenu) return fail('The kc-nav-link should move into the menu');
    if(!shownInMenu) return fail('The menu text should show in the menu');
    if(label !== 'GitHub') return fail(`The menu text should fall back to the title, got "${label}"`);
    pass('kc-nav-link shows its label in the menu');
  },

  'should stay on one row': async ({pass, fail}) => {
    const { container, el } = await create(900);
    container.style.width = '200px';
    await wait(500);
    const overflowing = el.isOverflowing();
    cleanup(container);
    if(overflowing) return fail('The nav should not wrap');
    pass('The nav stays on one row');
  },

  'should still support fixed': async ({pass, fail}) => {
    const { container, el } = await create(900, 'fixed');
    const position = getComputedStyle(el).position;
    cleanup(container);
    if(position !== 'fixed') return fail(`fixed should position the nav, got ${position}`);
    pass('fixed still works');
  }
};
