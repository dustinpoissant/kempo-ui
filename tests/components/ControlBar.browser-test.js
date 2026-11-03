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

  'should remove the host marker when the bar is removed': async ({pass, fail}) => {
    const { container, el, table } = await createBar(1400);
    el.remove();
    const marked = table.hasAttribute('has-control-bar');
    cleanup(container);
    if(marked) return fail('has-control-bar should be removed');
    pass('Host marker removed');
  }
};
