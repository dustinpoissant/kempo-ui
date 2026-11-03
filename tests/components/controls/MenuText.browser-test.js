import '../../../src/components/controls/Bold.js';
import '../../../src/components/controls/Undo.js';
import '../../../src/components/controls/MdImage.js';
import '../../../src/components/controls/MdTable.js';
import '../../../src/components/controls/MediaVolume.js';
import '../../../src/components/controls/MediaSpeed.js';
import '../../../src/components/controls/MediaTime.js';
import '../../../src/components/controls/Redo.js';
import '../../../src/components/controls/Italic.js';
import '../../../src/components/controls/Underline.js';
import '../../../src/components/controls/Strikethrough.js';
import '../../../src/components/controls/MediaPlayPause.js';
import '../../../src/components/controls/TextColor.js';
import '../../../src/components/controls/Menu.js';
import '../../../src/components/MarkdownEditor.js';
import '../../../src/components/ControlBar.js';

const create = async html => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  const editor = container.querySelector('k-markdown-editor');
  if(editor) await editor.updateComplete;
  const controls = [...container.querySelectorAll('kc-bold, kc-undo, kc-text-color, kc-media-play-pause, kc-menu, kc-media-volume, kc-media-speed, kc-media-time, kc-md-image, kc-md-table')];
  await Promise.all(controls.map(c => c.updateComplete));
  await new Promise(resolve => setTimeout(resolve, 100));
  return { container, editor };
};

const menuText = control => control.shadowRoot.querySelector('slot[name="menu-text"]');

const cleanup = container => container.remove();

export default {
  /*
    Slot
  */
  'should render a menu-text slot with the label as its fallback': async ({pass, fail}) => {
    const { container } = await create('<kc-bold></kc-bold>');
    const slot = menuText(container.querySelector('kc-bold'));
    const text = slot?.textContent;
    cleanup(container);
    if(!slot) return fail('kc-bold should have a menu-text slot');
    if(text !== 'Bold') return fail(`Expected "Bold", got "${text}"`);
    pass('menu-text slot falls back to the label');
  },

  'should keep the icon in the default slot': async ({pass, fail}) => {
    const { container } = await create('<kc-bold></kc-bold>');
    const icon = container.querySelector('kc-bold').shadowRoot.querySelector('slot:not([name]) k-icon');
    cleanup(container);
    if(!icon) return fail('The icon should still be the default slot content');
    pass('Icon stays in the default slot');
  },

  'should hide menu-text outside a menu': async ({pass, fail}) => {
    const { container } = await create('<kc-bold></kc-bold>');
    const display = getComputedStyle(menuText(container.querySelector('kc-bold'))).display;
    cleanup(container);
    if(display !== 'none') return fail(`menu-text should be hidden, display is ${display}`);
    pass('menu-text hidden outside a menu');
  },

  'should show menu-text as a block when in-menu is set': async ({pass, fail}) => {
    const { container } = await create('<kc-bold in-menu></kc-bold>');
    const display = getComputedStyle(menuText(container.querySelector('kc-bold'))).display;
    cleanup(container);
    if(display !== 'block') return fail(`menu-text should be block, display is ${display}`);
    pass('menu-text is a block in a menu');
  },

  'should use slotted menu-text instead of the label': async ({pass, fail}) => {
    const { container } = await create('<kc-bold><span slot="menu-text">Strong</span></kc-bold>');
    const assigned = menuText(container.querySelector('kc-bold')).assignedNodes().map(n => n.textContent);
    cleanup(container);
    if(assigned.join() !== 'Strong') return fail(`Expected slotted "Strong", got "${assigned}"`);
    pass('Slotted menu-text overrides the label');
  },

  'should label stateful controls by their state': async ({pass, fail}) => {
    const { container } = await create('<kc-media-play-pause></kc-media-play-pause>');
    const text = menuText(container.querySelector('kc-media-play-pause')).textContent;
    cleanup(container);
    if(text !== 'Play') return fail(`Expected "Play", got "${text}"`);
    pass('Stateful label follows the state');
  },

  'should add menu-text to popup controls': async ({pass, fail}) => {
    const { container } = await create('<kc-text-color></kc-text-color>');
    const text = menuText(container.querySelector('kc-text-color'))?.textContent;
    cleanup(container);
    if(text !== 'Text Color') return fail(`Expected "Text Color", got "${text}"`);
    pass('Popup control has menu-text');
  },

  /*
    in-menu
  */
  'should mark controls inside a kc-menu as in-menu': async ({pass, fail}) => {
    const { container } = await create('<k-markdown-editor><kc-menu><kc-bold id="b"></kc-bold><kc-undo id="u"></kc-undo></kc-menu></k-markdown-editor>');
    const marked = ['b', 'u'].every(id => container.querySelector(`#${id}`).hasAttribute('in-menu'));
    cleanup(container);
    if(!marked) return fail('Controls in a kc-menu should get in-menu');
    pass('kc-menu marks its controls');
  },

  'should mark controls moved into the control bar menu, and clear it on return': async ({pass, fail}) => {
    const { container } = await create('<div style="width:1000px"><k-markdown-editor><k-control-bar slot="controls-top"><kc-bold id="b"></kc-bold><kc-italic></kc-italic><kc-underline></kc-underline><kc-strikethrough></kc-strikethrough><kc-undo></kc-undo><kc-redo id="r"></kc-redo></k-control-bar></k-markdown-editor></div>');
    const wrapper = container.firstElementChild;
    const last = container.querySelector('#r');
    const until = async condition => {
      for(let i = 0; i < 20 && !condition(); i++) await new Promise(resolve => setTimeout(resolve, 100));
    };
    wrapper.style.width = '60px';
    await until(() => last.hasAttribute('in-menu'));
    const inMenu = last.hasAttribute('in-menu');
    wrapper.style.width = '1000px';
    await until(() => !last.hasAttribute('in-menu'));
    const stillMarked = last.hasAttribute('in-menu');
    cleanup(container);
    if(!inMenu) return fail('A control moved into the menu should get in-menu');
    if(stillMarked) return fail('A control back in the bar should lose in-menu');
    pass('Control bar sets and clears in-menu');
  },

  /*
    Volume, speed, time
  */
  'should show volume as a mute button next to a horizontal slider in a menu': async ({pass, fail}) => {
    const { container } = await create('<kc-media-volume in-menu></kc-media-volume>');
    const root = container.querySelector('kc-media-volume').shadowRoot;
    const slider = root.querySelector('k-slider');
    const mute = root.querySelector('button.mute');
    const dropdown = root.querySelector('k-dropdown');
    cleanup(container);
    if(!slider || !mute) return fail('Expected a mute button and a slider');
    if(slider.hasAttribute('vertical')) return fail('The slider should be horizontal');
    if(dropdown) return fail('The hover popup should not be used in a menu');
    pass('Volume is a mute button and a horizontal slider in a menu');
  },

  'should keep the volume popup outside a menu': async ({pass, fail}) => {
    const { container } = await create('<kc-media-volume></kc-media-volume>');
    const root = container.querySelector('kc-media-volume').shadowRoot;
    const vertical = root.querySelector('k-slider')?.hasAttribute('vertical');
    cleanup(container);
    if(!vertical) return fail('The standalone slider should stay vertical');
    pass('Standalone volume unchanged');
  },

  'should label the speed selector with "Speed" in a menu': async ({pass, fail}) => {
    const { container } = await create('<kc-media-speed in-menu></kc-media-speed>');
    const control = container.querySelector('kc-media-speed');
    const root = control.shadowRoot;
    const text = root.querySelector('slot[name="menu-text"]')?.textContent;
    const display = getComputedStyle(root.querySelector('slot[name="menu-text"]')).display;
    const rate = root.querySelector('.rate')?.textContent;
    cleanup(container);
    if(text !== 'Speed') return fail(`Expected "Speed", got "${text}"`);
    if(display !== 'block') return fail(`menu-text should show, display is ${display}`);
    if(rate !== '1x') return fail(`Expected the selector to show "1x", got "${rate}"`);
    pass('Speed shows the rate selector and "Speed"');
  },

  'should not show speed text outside a menu': async ({pass, fail}) => {
    const { container } = await create('<kc-media-speed></kc-media-speed>');
    const slot = container.querySelector('kc-media-speed').shadowRoot.querySelector('slot[name="menu-text"]');
    cleanup(container);
    if(slot) return fail('No menu-text slot outside a menu');
    pass('Standalone speed unchanged');
  },

  'should pad the time like the other menu items': async ({pass, fail}) => {
    const { container } = await create('<kc-media-time in-menu></kc-media-time><kc-bold in-menu></kc-bold>');
    const time = getComputedStyle(container.querySelector('kc-media-time'));
    const bold = getComputedStyle(container.querySelector('kc-bold'));
    const same = time.paddingLeft === bold.paddingLeft && time.paddingTop === bold.paddingTop;
    const message = `time ${time.paddingTop}/${time.paddingLeft}, bold ${bold.paddingTop}/${bold.paddingLeft}`;
    cleanup(container);
    if(!same) return fail(`Padding should match (${message})`);
    pass('Time is padded like the other items');
  },

  'should line up popup controls with the other rows in a menu': async ({pass, fail}) => {
    const { container } = await create('<div style="width:300px"><kc-bold in-menu></kc-bold><kc-md-image in-menu></kc-md-image><kc-md-table in-menu></kc-md-table></div>');
    const offsets = ['kc-bold', 'kc-md-image', 'kc-md-table'].map(tag => {
      const control = container.querySelector(tag);
      return Math.round(control.shadowRoot.querySelector('k-icon').getBoundingClientRect().left - control.getBoundingClientRect().left);
    });
    cleanup(container);
    if(new Set(offsets).size !== 1) return fail(`Icons should start at the same offset, got ${offsets}`);
    pass('Popup controls line up with the other rows');
  }
};
