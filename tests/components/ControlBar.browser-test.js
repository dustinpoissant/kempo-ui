import ControlBar from '../../src/components/ControlBar.js';
import '../../src/components/Table.js';
import '../../src/components/ControlGroup.js';
import '../../src/components/Video.js';
import '../../src/components/Audio.js';
import '../../src/components/controls/MediaSeek.js';
import '../../src/components/controls/MediaVolume.js';
import '../../src/components/controls/MediaSpeed.js';
import '../../src/components/controls/MediaPlayPause.js';
import '../../src/components/controls/MediaSkipBack.js';
import '../../src/components/controls/TcSearch.js';
import '../../src/components/controls/TcFieldSortHide.js';
import '../../src/components/controls/TcExportCsv.js';
import '../../src/components/controls/TcExportJson.js';
import '../../src/components/controls/TcPageSize.js';

const records = [
  { name: 'Olivia Smith', email: 'olivia@example.com' },
  { name: 'Liam Johnson', email: 'liam@example.com' },
  { name: 'Emma Brown', email: 'emma@example.com' }
];

const createBar = async (width, attrs = '', searchAttrs = '') => {
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.innerHTML = `
    <k-table>
      <k-control-bar slot="top" ${attrs}>
        <kc-tc-search id="search" ${searchAttrs}></kc-tc-search>
        <kc-tc-field-sort-hide id="fields"></kc-tc-field-sort-hide>
        <kc-tc-export-csv id="csv" slot="center"></kc-tc-export-csv>
        <kc-tc-export-json id="json" slot="right"></kc-tc-export-json>
        <kc-tc-page-size id="size" slot="right"></kc-tc-page-size>
      </k-control-bar>
    </k-table>
  `;
  document.body.appendChild(container);
  const table = container.querySelector('k-table');
  const el = container.querySelector('k-control-bar');
  await customElements.whenDefined('k-table');
  table.setRecords([...records]);
  await table.updateComplete;
  await el.updateComplete;
  await new Promise(resolve => setTimeout(resolve, 150));
  return { container, el, table };
};

const wait = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

const resizeTo = async (container, width) => {
  container.style.width = `${width}px`;
  await wait();
};

const cleanup = container => container.remove();

const naturalWidth = el => [...el.children].reduce((sum, c) => sum + c.offsetWidth, 0);

const movedIds = el => [...el.children].filter(c => c.getAttribute('slot') === 'overflow').map(c => c.id);

/* A split group of three table controls at the end of the bar's right slot. */
const addSplitGroup = (el, { group: groupAttrs = '', first = '', second = '', third = '' } = {}) => {
  const group = document.createElement('k-control-group');
  group.id = 'group';
  group.slot = 'right';
  group.setAttribute('split', '');
  group.innerHTML = `<kc-tc-export-csv id="s1" ${first}></kc-tc-export-csv><kc-tc-export-json id="s2" ${second}></kc-tc-export-json><kc-tc-page-size id="s3" ${third}></kc-tc-page-size>`;
  groupAttrs.split(' ').filter(Boolean).forEach(attr => {
    const [name, value] = attr.split('=');
    group.setAttribute(name, value ?? '');
  });
  el.appendChild(group);
  return group;
};

/* A split menu with two table controls and an icon, at the end of the bar's right slot. */
const addSplitMenu = el => {
  const menu = document.createElement('kc-menu');
  menu.id = 'menu';
  menu.slot = 'right';
  menu.setAttribute('split', '');
  menu.innerHTML = '<k-icon slot="icon" name="more_vert"></k-icon><kc-tc-export-csv id="m1"></kc-tc-export-csv><kc-tc-export-json id="m2"></kc-tc-export-json>';
  el.appendChild(menu);
  return menu;
};

const menuOrder = el => [...el.shadowRoot.querySelector('slot[name="overflow"]').assignedElements()].map(c => c.id);

export default {
  /*
    Element Creation
  */
  'should create a control-bar element': async ({pass, fail}) => {
    const { container, el } = await createBar(1000);
    if(!(el instanceof ControlBar)){
      cleanup(container);
      return fail('Element should be an instance of ControlBar');
    }
    cleanup(container);
    pass('ControlBar element created correctly');
  },

  'should default collapse-order to "right center left"': async ({pass, fail}) => {
    const { container, el } = await createBar(1000);
    const value = el.collapseOrder;
    cleanup(container);
    if(value !== 'right center left') return fail(`Expected "right center left", got "${value}"`);
    pass('Default collapse order is correct');
  },

  'should mark the controlled host': async ({pass, fail}) => {
    const { container, table } = await createBar(1000);
    const marked = table.hasAttribute('has-control-bar');
    cleanup(container);
    if(!marked) return fail('The table should get has-control-bar');
    pass('Controlled host is marked');
  },

  /*
    Collapsing
  */
  'should keep every control in the bar when there is room': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const moved = movedIds(el);
    const hidden = el.shadowRoot.getElementById('more').hidden;
    cleanup(container);
    if(moved.length) return fail(`Nothing should move, moved: ${moved}`);
    if(!hidden) return fail('The more menu should be hidden');
    pass('Nothing collapsed with enough room');
  },

  'should fill the width of the table toolbar': async ({pass, fail}) => {
    const { container, el, table } = await createBar(1400);
    const barWidth = el.getBoundingClientRect().width;
    const tableWidth = table.getBoundingClientRect().width;
    cleanup(container);
    if(barWidth < tableWidth - 20) return fail(`Bar is ${barWidth}px of ${tableWidth}px`);
    pass('Bar fills the toolbar');
  },

  'should move the right slot first, last control first': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    await resizeTo(container, naturalWidth(el) - 5);
    const moved = movedIds(el);
    const hidden = el.shadowRoot.getElementById('more').hidden;
    cleanup(container);
    if(hidden) return fail('The more menu should be visible');
    if(!moved.includes('size')) return fail(`Last right control should move first, moved: ${moved}`);
    if(moved.length > 1) return fail(`Only one control should move, moved: ${moved}`);
    if(moved.includes('search') || moved.includes('fields')) return fail(`Left controls should stay, moved: ${moved}`);
    pass('Right slot collapsed first');
  },

  'should follow collapse-order': async ({pass, fail}) => {
    const { container, el } = await createBar(1400, 'collapse-order="left center right"');
    await resizeTo(container, naturalWidth(el) - 5);
    const moved = movedIds(el);
    cleanup(container);
    if(!moved.includes('fields')) return fail(`Last left control should move first, moved: ${moved}`);
    if(moved.includes('json') || moved.includes('size')) return fail(`Right controls should stay, moved: ${moved}`);
    pass('Custom collapse order respected');
  },

  'should move higher priority controls into the menu later': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    el.querySelector('#size').setAttribute('priority', '1');
    await resizeTo(container, naturalWidth(el) - 5);
    el.arrange();
    const moved = movedIds(el);
    cleanup(container);
    if(moved.includes('size')) return fail(`The priority control should stay, moved: ${moved}`);
    if(!moved.includes('json')) return fail(`The next control should move instead, moved: ${moved}`);
    pass('Priority controls stay longer');
  },

  'should still move priority controls when there is no more room': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    el.querySelector('#size').setAttribute('priority', '1');
    el.querySelector('#search').setAttribute('priority', '2');
    await resizeTo(container, 60);
    el.arrange();
    const moved = movedIds(el);
    cleanup(container);
    if(!moved.includes('size') || !moved.includes('search')) return fail(`Priority controls should move last, moved: ${moved}`);
    pass('Priority controls move into the menu eventually');
  },

  'should move lower priority controls first': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    el.querySelector('#size').setAttribute('priority', '1');
    el.querySelector('#json').setAttribute('priority', '1');
    await resizeTo(container, naturalWidth(el) - 5);
    el.arrange();
    const moved = movedIds(el);
    cleanup(container);
    if(!moved.includes('csv')) return fail(`The only priority-0 control should move first, moved: ${moved}`);
    pass('Lower priority moves first');
  },

  'should move a control with a negative priority before the ones that have none': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    el.querySelector('#search').setAttribute('priority', '-1');
    await resizeTo(container, naturalWidth(el) - 5);
    el.arrange();
    const moved = movedIds(el);
    cleanup(container);
    if(!moved.includes('search')) return fail(`The negative priority control should move first, moved: ${moved}`);
    pass('A negative priority moves before priority 0');
  },

  'should never move no-collapse controls': async ({pass, fail}) => {
    const { container, el } = await createBar(1400, '', 'no-collapse');
    await resizeTo(container, 60);
    const moved = movedIds(el);
    cleanup(container);
    if(moved.includes('search')) return fail('no-collapse control was moved');
    if(!moved.includes('fields') || !moved.includes('size')) return fail(`Other controls should all move, moved: ${moved}`);
    pass('no-collapse control stays in the bar');
  },

  'should never move a menu': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const menu = document.createElement('kc-menu');
    menu.id = 'menu';
    menu.slot = 'right';
    el.appendChild(menu);
    await wait();
    await resizeTo(container, 60);
    const moved = movedIds(el);
    cleanup(container);
    if(moved.includes('menu')) return fail('The menu was moved');
    pass('Menus stay in the bar');
  },

  'should move a control group into the menu as one unit': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const group = document.createElement('k-control-group');
    group.id = 'group';
    group.slot = 'right';
    group.innerHTML = '<kc-tc-export-csv id="g1"></kc-tc-export-csv><kc-tc-export-json id="g2"></kc-tc-export-json>';
    el.appendChild(group);
    await wait();
    await resizeTo(container, naturalWidth(el) - 5);
    const moved = movedIds(el);
    const inGroup = group.getAttribute('slot') === 'overflow' && group.querySelector('#g1').parentElement === group && group.querySelector('#g2').parentElement === group;
    cleanup(container);
    if(!moved.includes('group')) return fail(`The group should move, moved: ${moved}`);
    if(!inGroup) return fail('The group should keep its controls together');
    pass('Control group moves as one unit');
  },

  /*
    Split Groups
  */
  'should move the controls of a split group one at a time, last first': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const group = addSplitGroup(el);
    await wait();
    await resizeTo(container, naturalWidth(el) - 5);
    const moved = movedIds(el);
    const stillInGroup = ['s1', 's2'].every(id => group.querySelector(`#${id}`)?.parentElement === group);
    cleanup(container);
    if(!moved.includes('s3')) return fail(`The last control of the group should move first, moved: ${moved}`);
    if(moved.includes('group')) return fail('The group itself should stay while it has controls');
    if(moved.includes('s1') || moved.includes('s2')) return fail(`Only what is needed should move, moved: ${moved}`);
    if(!stillInGroup) return fail('The controls that did not move should stay in the group');
    pass('Split groups collapse one control at a time');
  },

  'should keep a no-collapse control of a split group in the bar': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const group = addSplitGroup(el, { second: 'no-collapse' });
    await wait();
    await resizeTo(container, 260);
    const moved = movedIds(el);
    const stays = group.querySelector('#s2')?.parentElement === group && !moved.includes('s2');
    const groupShown = !group.hasAttribute('collapsed');
    cleanup(container);
    if(!stays) return fail(`The no-collapse control should stay in its group, moved: ${moved}`);
    if(!moved.includes('s1') || !moved.includes('s3')) return fail(`The other controls should move, moved: ${moved}`);
    if(!groupShown) return fail('A group that still has a control should not be collapsed');
    pass('no-collapse works inside a split group');
  },

  'should hide a split group once all of its controls moved': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const group = addSplitGroup(el);
    await wait();
    await resizeTo(container, 200);
    const moved = movedIds(el);
    const allMoved = ['s1', 's2', 's3'].every(id => moved.includes(id));
    const hidden = group.hasAttribute('collapsed') && getComputedStyle(group).display === 'none';
    cleanup(container);
    if(!allMoved) return fail(`All of the controls should have moved, moved: ${moved}`);
    if(!hidden) return fail('The empty group should be hidden');
    pass('An emptied split group is hidden');
  },

  'should put the controls of a split group back in their places when there is room': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const group = addSplitGroup(el);
    await wait();
    await resizeTo(container, 200);
    await resizeTo(container, 1400);
    const order = [...group.children].map(c => c.id);
    const slots = ['s1', 's2', 's3'].map(id => group.querySelector(`#${id}`)?.getAttribute('slot'));
    const inMenu = ['s1', 's2', 's3'].some(id => group.querySelector(`#${id}`)?.hasAttribute('in-menu'));
    const shown = !group.hasAttribute('collapsed');
    cleanup(container);
    if(order.join() !== 's1,s2,s3') return fail(`The controls should be back in order, got: ${order}`);
    if(slots.some(slot => slot !== null)) return fail(`The controls should have no slot again, got: ${slots}`);
    if(inMenu) return fail('The controls should not be marked as in the menu');
    if(!shown) return fail('The group should be shown again');
    pass('Split group controls return in order');
  },

  'should list the controls that left a split group in the order they had in it': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    addSplitGroup(el, { first: 'priority="5"', second: 'priority="1"' });
    await wait();
    await resizeTo(container, 100);
    const order = menuOrder(el).filter(id => ['s1', 's2', 's3'].includes(id));
    cleanup(container);
    if(order.join() !== 's1,s2,s3') return fail(`The menu should list them as s1, s2, s3 even though they moved as s3, s2, s1, got: ${order}`);
    pass('The menu keeps the group order');
  },

  'should give the controls of a split group the priority of the group': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    addSplitGroup(el, { group: 'priority=3' });
    await wait();
    await resizeTo(container, naturalWidth(el) - 5);
    const moved = movedIds(el);
    cleanup(container);
    if(!moved.includes('size')) return fail(`A control with no priority should move first, moved: ${moved}`);
    if(['s1', 's2', 's3'].some(id => moved.includes(id))) return fail(`The group's controls have the group's priority and should wait, moved: ${moved}`);
    pass('A split group controls inherit its priority');
  },

  'should list the items of a split menu in the more menu, and hide the menu once it is empty': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const menu = addSplitMenu(el);
    await wait();
    await resizeTo(container, 120);
    const moved = movedIds(el);
    const order = menuOrder(el).filter(id => ['m1', 'm2'].includes(id));
    const hidden = menu.hasAttribute('collapsed') && getComputedStyle(menu).display === 'none';
    const iconStays = menu.querySelector('k-icon[slot="icon"]')?.parentElement === menu;
    const menuItself = moved.includes('menu');
    cleanup(container);
    if(!moved.includes('m1') || !moved.includes('m2')) return fail(`The items of the menu should move, moved: ${moved}`);
    if(menuItself) return fail('The menu should not move as a whole');
    if(order.join() !== 'm1,m2') return fail(`The more menu should list the items as m1, m2, got: ${order}`);
    if(!hidden) return fail('The empty menu should be hidden');
    if(!iconStays) return fail('The menu icon is not an item and should stay in the menu');
    pass('A split menu collapses into the more menu');
  },

  'should put the items of a split menu back when there is room': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const menu = addSplitMenu(el);
    await wait();
    await resizeTo(container, 120);
    await resizeTo(container, 1400);
    const items = [...menu.children].filter(c => !c.hasAttribute('slot')).map(c => c.id);
    const shown = !menu.hasAttribute('collapsed') && getComputedStyle(menu).display !== 'none';
    await wait();
    const inMenu = ['m1', 'm2'].every(id => menu.querySelector(`#${id}`)?.hasAttribute('in-menu'));
    cleanup(container);
    if(items.join() !== 'm1,m2') return fail(`The items should be back in the menu in order, got: ${items}`);
    if(!shown) return fail('The menu should be shown again');
    if(!inMenu) return fail('The items should be rows of the menu again');
    pass('A split menu gets its items back');
  },

  'should stay on a single row': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    await resizeTo(container, 300);
    const overflowing = el.isOverflowing();
    cleanup(container);
    if(overflowing) return fail('Bar is wrapped or overflowing');
    pass('Controls stay on one row');
  },

  'should arrange again when the more button grows after the bar was arranged': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    await resizeTo(container, 500);
    const more = el.shadowRoot.getElementById('more');
    more.style.minWidth = '320px';
    await wait(300);
    const overflowing = el.isOverflowing();
    cleanup(container);
    if(overflowing) return fail('Bar wrapped after the more button grew');
    pass('Bar re-arranged for the larger more button');
  },

  /*
    Expanding
  */
  'should bring controls back one at a time as the bar grows': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const full = naturalWidth(el);
    await resizeTo(container, 60);
    const movedAtMin = movedIds(el).length;
    let previous = movedAtMin;
    for(const width of [full * 0.4, full * 0.6, full * 0.8, full + 20]){
      await resizeTo(container, width);
      const now = movedIds(el).length;
      if(now > previous){
        cleanup(container);
        return fail(`Controls moved into the menu while growing (${previous} -> ${now} at ${width}px)`);
      }
      previous = now;
    }
    const ids = movedIds(el);
    cleanup(container);
    if(movedAtMin < 3) return fail(`Expected several controls in the menu at the minimum, got ${movedAtMin}`);
    if(ids.length) return fail(`Controls should all be back, still moved: ${ids}`);
    pass('Controls return as the bar grows');
  },

  'should return controls in reverse order': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    const full = naturalWidth(el);
    await resizeTo(container, 60);
    await resizeTo(container, full * 0.7);
    const ids = movedIds(el);
    cleanup(container);
    if(ids.includes('search')) return fail(`First left control should be back, moved: ${ids}`);
    if(ids.length && !ids.includes('size')) return fail(`Last right control should be the last one back, moved: ${ids}`);
    pass('Controls return in reverse order');
  },

  'should restore original slots when the bar grows': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    await resizeTo(container, 200);
    await resizeTo(container, 1400);
    const slots = ['search', 'csv', 'json'].map(id => el.querySelector(`#${id}`).getAttribute('slot'));
    const hidden = el.shadowRoot.getElementById('more').hidden;
    cleanup(container);
    if(slots[0] !== null || slots[1] !== 'center' || slots[2] !== 'right') return fail(`Original slots not restored: ${slots}`);
    if(!hidden) return fail('The more menu should be hidden again');
    pass('Controls restored to their original slots');
  },

  /*
    Menu
  */
  'should limit the height of the more menu to 66vh and scroll it': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    await resizeTo(container, 300);
    const tray = el.shadowRoot.getElementById('tray');
    const { overflowY, maxHeight } = getComputedStyle(tray);
    cleanup(container);
    if(overflowY !== 'auto') return fail(`overflow-y should be auto, got ${overflowY}`);
    if(Math.abs(parseFloat(maxHeight) - window.innerHeight * 0.66) > 1) return fail(`max-height should be 66vh (${window.innerHeight * 0.66}px), got ${maxHeight}`);
    pass('The more menu is limited to 66vh and scrolls');
  },

  'should move other controls into the menu to keep a soft min width, then let go of it': async ({pass, fail}) => {
    const build = async soft => {
      const container = document.createElement('div');
      container.style.width = '800px';
      container.innerHTML = `
        <k-audio src="/media/silence.mp3">
          <k-control-bar>
            <kc-media-play-pause priority="10"></kc-media-play-pause>
            <kc-media-seek slot="center" no-collapse ${soft ? 'soft-min-width="8rem"' : ''}></kc-media-seek>
            <kc-media-volume slot="right"></kc-media-volume>
            <kc-media-speed slot="right"></kc-media-speed>
          </k-control-bar>
        </k-audio>
      `;
      document.body.appendChild(container);
      await wait(400);
      return { container, el: container.querySelector('k-control-bar'), seek: container.querySelector('kc-media-seek') };
    };
    const plain = await build(false);
    const soft = await build(true);
    const moved = bar => [...bar.children].filter(c => c.getAttribute('slot') === 'overflow').length;
    const room = [...plain.el.children].filter(c => c !== plain.seek).reduce((sum, c) => sum + c.offsetWidth, 0) + 100;
    await resizeTo(plain.container, room);
    await resizeTo(soft.container, room);
    const plainMoved = moved(plain.el);
    const softMoved = moved(soft.el);
    const softWidth = soft.seek.getBoundingClientRect().width;
    await resizeTo(soft.container, 180);
    const overflowing = soft.el.isOverflowing();
    const inlineMin = soft.seek.style.minWidth;
    const smallWidth = soft.seek.getBoundingClientRect().width;
    cleanup(plain.container);
    cleanup(soft.container);
    if(softMoved <= plainMoved) return fail(`The soft min width should move more controls (${softMoved} vs ${plainMoved})`);
    if(softWidth < 127) return fail(`The seek bar should keep its soft min width while others can move, got ${softWidth}px`);
    if(overflowing) return fail('The bar should not overflow when nothing is left to move');
    if(inlineMin) return fail('The soft min width should be released after arranging');
    if(smallWidth >= 128) return fail(`The seek bar should shrink below its soft min width at a tiny size, got ${smallWidth}px`);
    pass('Soft min width moves others first, then gives way');
  },

  'should collapse plain links and buttons with a working more menu': async ({pass, fail}) => {
    const container = document.createElement('div');
    container.style.width = '900px';
    container.innerHTML = `
      <k-control-bar>
        <a href="#a" id="home">Home</a>
        <a href="#b" id="products">Products</a>
        <a href="#c" id="pricing">Pricing</a>
        <a href="#d" id="login" slot="right">Log in</a>
        <button id="signup" slot="right">Sign up</button>
      </k-control-bar>
    `;
    document.body.appendChild(container);
    const el = container.querySelector('k-control-bar');
    await wait(300);
    await resizeTo(container, 150);
    const more = el.shadowRoot.getElementById('more');
    const moved = movedIds(el);
    const { backgroundColor, display } = getComputedStyle(el.querySelector('#pricing'));
    const disabled = more.disabled;
    const hidden = more.hidden;
    cleanup(container);
    if(!moved.length) return fail('Plain links and buttons should move into the menu');
    if(hidden) return fail('The more button should show');
    if(disabled) return fail('The more button should not be disabled without a controlled host');
    if(!moved.includes('pricing')) return fail(`Expected the pricing link to be moved, moved: ${moved}`);
    if(display !== 'block' || backgroundColor !== 'rgba(0, 0, 0, 0)') return fail(`A moved link should be a plain menu row, got display ${display} and background ${backgroundColor}`);
    pass('Plain links and buttons collapse into a working menu');
  },

  'should open the more menu': async ({pass, fail}) => {
    const { container, el } = await createBar(1400);
    await resizeTo(container, 300);
    el.shadowRoot.getElementById('more').shadowRoot.querySelector('button').click();
    await wait(100);
    const opened = el.shadowRoot.getElementById('more').opened;
    cleanup(container);
    if(!opened) return fail('The more menu should open');
    pass('More menu opens');
  },

  'should keep controls in the menu connected to the table': async ({pass, fail}) => {
    const { container, el, table } = await createBar(1400);
    await resizeTo(container, 60);
    const control = el.querySelector('#csv');
    const inMenu = control.getAttribute('slot') === 'overflow';
    const host = control.host;
    cleanup(container);
    if(!inMenu) return fail('The export control should be in the menu');
    if(host !== table) return fail('A control in the menu should still find the table as its host');
    pass('Controls in the menu still find their host');
  },

  'should keep the menu border inside a host with transparent control borders': async ({pass, fail}) => {
    const container = document.createElement('div');
    container.style.width = '40px';
    container.innerHTML = '<k-video><k-control-bar><kc-media-play-pause></kc-media-play-pause><kc-media-skip-back></kc-media-skip-back></k-control-bar></k-video>';
    document.body.appendChild(container);
    const el = container.querySelector('k-control-bar');
    await wait(500);
    const more = el.shadowRoot.getElementById('more');
    const panel = more.shadowRoot.querySelector('k-dropdown').shadowRoot.getElementById('menu');
    const panelBorder = getComputedStyle(panel).borderTopColor;
    const triggerBorder = getComputedStyle(more).borderTopColor;
    cleanup(container);
    if(panelBorder === 'rgba(0, 0, 0, 0)') return fail('The menu panel border should be visible');
    if(triggerBorder !== 'rgba(0, 0, 0, 0)') return fail(`The trigger should stay borderless like the video controls, got ${triggerBorder}`);
    pass('Panel has a border and the trigger matches the host');
  },

  'should collapse the elements a slot shows with the group that holds the slot': async ({pass, fail}) => {
    const container = document.createElement('div');
    container.style.width = '60px';
    const host = document.createElement('div');
    host.attachShadow({ mode: 'open' }).innerHTML = '<k-control-bar><k-control-group id="grp"><slot name="extra"></slot></k-control-group><button id="other" class="btn">A longer label that takes room</button></k-control-bar>';
    const extra = document.createElement('button');
    extra.id = 'extra';
    extra.slot = 'extra';
    extra.textContent = 'Extra';
    host.appendChild(extra);
    container.appendChild(host);
    document.body.appendChild(container);
    await wait(300);
    const narrowMoved = extra.hasAttribute('in-menu');
    await resizeTo(container, 800);
    const wideMoved = extra.hasAttribute('in-menu');
    cleanup(container);
    if(!narrowMoved) return fail('A narrow bar should move the slot\'s elements into the more menu with their group');
    if(wideMoved) return fail('A wide bar should keep the slot\'s elements in the bar');
    pass('Elements a slot shows collapse with the group that holds the slot');
  },

  'should remove the host marker when the bar is removed': async ({pass, fail}) => {
    const { container, el, table } = await createBar(1400);
    el.remove();
    const marked = table.hasAttribute('has-control-bar');
    cleanup(container);
    if(marked) return fail('has-control-bar should be removed');
    pass('Host marker removed');
  }
};
