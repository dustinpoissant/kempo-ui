import PageBuilder from '../../src/components/PageBuilder.js';
import PageBuilderFields from '../../src/components/pagebuilder/PageBuilderFields.js';
import { html } from '../../src/lit-all.min.js';

/*
  Utility Functions
*/
const page = (...nodes) => ({ attrs: { title: 'Test' }, slots: { default: nodes } });

const text = (id, html) => ({ id, type: 'text', attrs: { html }, slots: {} });

const createBuilder = async (value) => {
  const builder = document.createElement('k-page-builder');
  if(value) builder.value = value;
  document.body.appendChild(builder);
  await builder.updateComplete;
  await builder.frame().ready;
  return builder;
};

const cleanup = builder => {
  builder?.remove();
};

const wait = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

/* A builder in a box of the given width, which is what decides whether it is narrow. */
const createInBox = async width => {
  const box = document.createElement('div');
  box.style.width = `${width}px`;
  const builder = document.createElement('k-page-builder');
  box.appendChild(builder);
  document.body.appendChild(box);
  await builder.updateComplete;
  await builder.frame().ready;
  await wait();
  return { box, builder };
};

const shown = (builder, selector) => {
  const el = builder.renderRoot.querySelector(selector);
  return !!el && !el.hidden && el.getBoundingClientRect().width > 0;
};

const barControls = builder => [...builder.renderRoot.querySelector('k-control-bar').querySelectorAll('kc-pb-view, kc-pb-tree, kc-pb-settings, kc-pb-device')].map(el => el.localName + (el.getAttribute('view') ? `:${el.getAttribute('view')}` : ''));

/* The frame draws the page once its modules have loaded, so a check that reads the page waits for the widget to appear. */
const waitForWidget = async (builder, id) => {
  const doc = builder.renderRoot.querySelector('iframe').contentDocument;
  for(let tries = 0; tries < 50; tries++){
    const found = doc.querySelector(`[data-pb-id="${id}"]`);
    if(found) return found;
    await new Promise(resolve => setTimeout(resolve, 50));
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

/*
  Tests
*/
export default {
  'should be a page builder': async ({ pass, fail }) => {
    const builder = await createBuilder();
    if(!(builder instanceof PageBuilder)){
      cleanup(builder);
      return fail('the element is not a PageBuilder');
    }
    cleanup(builder);
    pass('the element is a PageBuilder');
  },

  'should show the value it is given': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>Hello</p>')));
    const shown = await waitForWidget(builder, 't1');
    if(!shown){
      cleanup(builder);
      return fail('the widget is not in the page');
    }
    if(builder.value.slots.default[0].attrs.html !== '<p>Hello</p>'){
      cleanup(builder);
      return fail('the value was changed');
    }
    cleanup(builder);
    pass('the page shows the value');
  },

  'should emit change with the new page when a widget is added': async ({ pass, fail }) => {
    const builder = await createBuilder();
    let detail = null;
    builder.addEventListener('change', event => { detail = event.detail; });
    builder.insert('image');
    if(!detail || detail.value.slots.default.length !== 1 || detail.value.slots.default[0].type !== 'image'){
      cleanup(builder);
      return fail('change did not carry the new page');
    }
    cleanup(builder);
    pass('change carries the page');
  },

  'should undo and redo a change': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>One</p>')));
    builder.insert('image');
    if(builder.value.slots.default.length !== 2){
      cleanup(builder);
      return fail('the image was not added');
    }
    builder.undo();
    if(builder.value.slots.default.length !== 1){
      cleanup(builder);
      return fail('undo did not remove the image');
    }
    builder.redo();
    if(builder.value.slots.default.length !== 2){
      cleanup(builder);
      return fail('redo did not add the image back');
    }
    cleanup(builder);
    pass('undo and redo move through the history');
  },

  'should emit save and count the page as saved': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>One</p>')));
    let saved = null;
    builder.addEventListener('save', event => { saved = event.detail.value; });
    builder.setWidgetAttribute('t1', 'html', '<p>Two</p>', true);
    if(!builder.dirty){
      cleanup(builder);
      return fail('a change did not make the page dirty');
    }
    builder.save();
    if(!saved || saved.slots.default[0].attrs.html !== '<p>Two</p>'){
      cleanup(builder);
      return fail('save did not carry the page');
    }
    if(builder.dirty){
      cleanup(builder);
      return fail('the page is still dirty after saving');
    }
    cleanup(builder);
    pass('save emits and clears dirty');
  },

  'should not emit change for a value it is given': async ({ pass, fail }) => {
    const builder = await createBuilder();
    let changes = 0;
    builder.addEventListener('change', () => { changes++; });
    builder.value = page(text('t1', '<p>Given</p>'));
    if(changes !== 0){
      cleanup(builder);
      return fail('setting the value emitted change');
    }
    cleanup(builder);
    pass('a given value is not a change');
  },

  'should show Confirm deletion in the page settings, and keep it as an editor setting': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const before = builder.settings.confirmDeletion;
    builder.setEditorSetting('confirmDeletion', true);
    await builder.updateComplete;
    const panel = builder.renderRoot.querySelector('k-page-builder-settings');
    await panel.updateComplete;
    const toggle = panel.shadowRoot.querySelector('#pb-setting-confirm');
    const shown = toggle?.value === true;
    const kept = builder.settings.confirmDeletion === true && JSON.parse(localStorage.getItem('kempo-ui:page-builder')).confirmDeletion === true;
    builder.setEditorSetting('confirmDeletion', before);
    cleanup(builder);
    if(!toggle) return fail('the page settings have no Confirm deletion toggle');
    if(!shown) return fail('the toggle does not show the setting');
    if(!kept) return fail('the setting was not kept');
    pass('Confirm deletion is a page settings toggle');
  },

  'should lay the toolbar out in groups, with Add, Save, the tree and settings pinned': async ({ pass, fail }) => {
    const builder = await createBuilder();
    const bar = builder.renderRoot.querySelector('k-control-bar');
    const kids = [...bar.children];
    const names = group => [...group.children].map(control => control.localName);
    const left = kids.filter(el => !el.getAttribute('slot')).map(el => (el.localName === 'k-control-group' ? names(el) : el.localName));
    const center = kids.filter(el => el.getAttribute('slot') === 'center').map(names);
    const right = kids.filter(el => el.getAttribute('slot') === 'right').map(el => (el.localName === 'k-control-group' ? names(el) : el.localName));
    const addGroup = kids.find(el => el.querySelector?.('kc-pb-add'));
    const saveGroup = kids.find(el => el.querySelector?.('kc-pb-save'));
    const deviceGroup = kids.find(el => el.querySelector?.('kc-pb-device'));
    const checks = [
      [JSON.stringify(left) === JSON.stringify(['kc-pb-tree', ['kc-pb-add', 'kc-pb-delete', 'kc-pb-duplicate'], ['kc-undo', 'kc-redo'], ['kc-pb-move-up', 'kc-pb-move-down', 'kc-pb-move-in', 'kc-pb-move-out']]), `left slot was ${JSON.stringify(left)}`],
      [JSON.stringify(center) === JSON.stringify([['kc-pb-device', 'kc-pb-device', 'kc-pb-device']]), `center slot was ${JSON.stringify(center)}`],
      [JSON.stringify(right) === JSON.stringify(['kc-menu', ['kc-pb-save', 'kc-pb-reset'], 'kc-pb-shortcuts', 'kc-pb-settings']), `right slot was ${JSON.stringify(right)}`],
      [addGroup?.hasAttribute('split'), 'the group with Add is not split'],
      [addGroup?.querySelector('kc-pb-add')?.hasAttribute('no-collapse'), 'Add can collapse'],
      [!addGroup?.querySelector('kc-pb-duplicate')?.hasAttribute('priority'), 'Duplicate has a priority, so it does not go into the menu first'],
      [Number(addGroup?.querySelector('kc-pb-delete')?.getAttribute('priority')) > Number(deviceGroup?.getAttribute('priority')), 'Delete does not go into the menu after everything else'],
      [saveGroup?.hasAttribute('split'), 'the group with Save is not split'],
      [!kids.find(el => el.querySelector?.('kc-pb-move-up'))?.hasAttribute('split'), 'the move controls are split, they should collapse together'],
      [saveGroup?.querySelector('kc-pb-save')?.hasAttribute('no-collapse'), 'Save can collapse'],
      [!saveGroup?.querySelector('kc-pb-reset')?.hasAttribute('priority') && !saveGroup?.hasAttribute('priority'), 'Reset has a priority, so it does not go into the menu early'],
      [bar.querySelector('kc-menu')?.hasAttribute('split'), 'the Templates menu cannot collapse into the more menu'],
      [bar.querySelector('kc-pb-tree')?.hasAttribute('no-collapse'), 'the tree button can collapse'],
      [bar.querySelector('kc-pb-settings')?.hasAttribute('no-collapse'), 'the settings button can collapse'],
      [!bar.querySelector('kc-pb-editor-settings'), 'the editor settings control is still in the bar'],
      [bar.querySelectorAll('kc-menu').length === 1, 'the bar has a menu besides the Templates menu']
    ];
    cleanup(builder);
    const failed = checks.find(([ok]) => !ok);
    if(failed) return fail(failed[1]);
    pass('the toolbar has the requested layout');
  },

  'should show one view at a time on a narrow screen, switched by three view controls': async ({ pass, fail }) => {
    const { box, builder } = await createInBox(400);
    const controls = barControls(builder);
    const results = [];
    for(const view of ['page', 'tree', 'settings']){
      builder.setView(view);
      await builder.updateComplete;
      await wait(50);
      results.push([view, shown(builder, 'aside.tree'), shown(builder, '.canvas'), shown(builder, 'aside.attrs'), builder.renderRoot.querySelector(`kc-pb-view[view="${view}"]`)?.hasAttribute('active')]);
    }
    const fillsWidth = (() => { const el = builder.renderRoot.querySelector('aside.attrs'); return Math.abs(el.getBoundingClientRect().width - builder.clientWidth) < 2; })();
    box.remove();
    if(!builder.mobile) return fail('A 400px builder is not narrow');
    if(controls.join() !== 'kc-pb-view:tree,kc-pb-view:page,kc-pb-view:settings') return fail(`The bar should have the three view controls and no tree, settings or device control, got ${controls}`);
    const expected = { page: [false, true, false], tree: [true, false, false], settings: [false, false, true] };
    for(const [view, tree, canvas, settings, active] of results){
      if([tree, canvas, settings].join() !== expected[view].join()) return fail(`The ${view} view should show ${expected[view]} (tree, page, settings), showed ${[tree, canvas, settings]}`);
      if(!active) return fail(`The ${view} control should be active in the ${view} view`);
    }
    if(!fillsWidth) return fail('The panel should fill the width');
    pass('One view at a time, switched by three controls');
  },

  'should go back to the three panels when it is wide enough': async ({ pass, fail }) => {
    const { box, builder } = await createInBox(400);
    box.style.width = '1300px';
    await wait(300);
    const controls = barControls(builder);
    const panels = [shown(builder, 'aside.tree'), shown(builder, '.canvas'), shown(builder, 'aside.attrs')];
    box.remove();
    if(builder.mobile) return fail('A 1300px builder is still narrow');
    if(controls.join() !== 'kc-pb-tree,kc-pb-device,kc-pb-device,kc-pb-device,kc-pb-settings') return fail(`The tree, device and settings controls should be back, got ${controls}`);
    if(panels.join() !== 'true,true,true') return fail(`All three panels should show, showed ${panels}`);
    pass('The wide layout returns');
  },

  'should use mobile-width as the width it becomes narrow at': async ({ pass, fail }) => {
    const { box, builder } = await createInBox(900);
    const wideAtFirst = !builder.mobile;
    builder.mobileWidth = 1000;
    await builder.updateComplete;
    const narrowNow = builder.mobile;
    box.remove();
    if(!wideAtFirst) return fail('900px should not be narrow with the default width');
    if(!narrowNow) return fail('900px should be narrow when mobile-width is 1000');
    pass('mobile-width sets the breakpoint');
  },

  'should make the tree and settings toggles switch views on a narrow screen': async ({ pass, fail }) => {
    const { box, builder } = await createInBox(400);
    builder.toggleTree();
    const tree = builder.view;
    builder.toggleTree();
    const backToPage = builder.view;
    builder.toggleSettings();
    const settings = builder.view;
    box.remove();
    if(tree !== 'tree' || backToPage !== 'page' || settings !== 'settings') return fail(`toggleTree and toggleSettings should switch the view, got ${tree}, ${backToPage}, ${settings}`);
    pass('The toggles map to views');
  },

  'should use short menu text for the move and reset controls': async ({ pass, fail }) => {
    const builder = await createBuilder();
    await wait(200);
    const tags = ['kc-pb-move-up', 'kc-pb-move-down', 'kc-pb-move-in', 'kc-pb-move-out', 'kc-pb-reset'];
    const got = tags.map(tag => builder.renderRoot.querySelector(`k-control-bar ${tag}`)?.shadowRoot?.querySelector('slot[name="menu-text"]')?.textContent.trim());
    cleanup(builder);
    const expected = ['Move Up', 'Move Down', 'Move Into Widget', 'Move Out of Widget', 'Reset Page'];
    if(got.join('|') !== expected.join('|')) return fail(`The menu text should be ${expected.join(', ')}, got ${got.join(', ')}`);
    pass('The menu text is short');
  },

  'should show a visible drag handle on the selected widget': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('h1', '<p>Drag me</p>')));
    await waitForWidget(builder, 'h1');
    builder.select('h1');
    await wait(200);
    const doc = builder.renderRoot.querySelector('iframe').contentDocument;
    const handle = doc.getElementById('pb-handle');
    const rule = [...doc.styleSheets].flatMap(sheet => { try { return [...sheet.cssRules]; } catch { return []; } }).find(r => r.selectorText === '#pb-handle');
    cleanup(builder);
    if(handle.style.display !== 'flex') return fail(`The handle should show on the selected widget, its display is "${handle.style.display}"`);
    if(!rule) return fail('The frame has no rule for the handle');
    if(!rule.style.backgroundColor && !rule.style.background.includes('var(--pb-accent)')) return fail(`The handle has no accent background: "${rule.style.background}"`);
    if(rule.style.width !== '2.5rem' || rule.style.height !== '1.75rem') return fail(`The handle is not the larger size: ${rule.style.width} x ${rule.style.height}`);
    pass('The drag handle has the accent background and the larger size');
  },

  'should give each column a width at desktop, tablet and mobile, with icon buttons to move and remove it': async ({ pass, fail }) => {
    const row = { id: 'r2', type: 'columns', attrs: {}, slots: { default: [{ id: 'c2', type: 'column', attrs: {}, slots: { default: [] } }, { id: 'c3', type: 'column', attrs: {}, slots: { default: [] } }] } };
    const builder = await createBuilder({ attrs: {}, slots: { default: [row] } });
    builder.select('r2');
    await wait(400);
    const panel = builder.renderRoot.querySelector('k-page-builder-settings');
    await panel.updateComplete;
    const settings = panel.shadowRoot.querySelector('k-page-builder-columns-settings');
    await settings?.updateComplete;
    const selects = ['pb-column-0-desktop', 'pb-column-0-tablet', 'pb-column-0-mobile'].map(id => settings?.shadowRoot?.querySelector(`#${id}`));
    if(selects.some(select => !select)) { cleanup(builder); return fail('A column should have a width for desktop, tablet and mobile'); }
    const labels = [...selects[0].options].map(option => option.textContent.trim());
    if(!labels.includes('1/2') || !labels.includes('Full width') || labels.some(label => /of 12/.test(label))) { cleanup(builder); return fail(`The widths should be simplest fractions, got ${labels.join(', ')}`); }
    selects[0].value = '6';
    selects[0].dispatchEvent(new Event('change', { bubbles: true }));
    await wait(100);
    const stored = builder.value.slots.default[0].slots.default[0].attrs.desktop;
    const iconButtons = [...settings.shadowRoot.querySelectorAll('.btn-grp button')];
    const iconsOnly = iconButtons.length === 6 && iconButtons.every(button => button.textContent.trim() === '' && button.getAttribute('aria-label'));
    cleanup(builder);
    if(stored !== '6') return fail(`Choosing 1/2 on desktop should store 6, stored ${stored}`);
    if(!iconsOnly) return fail('The move and remove buttons should be icons with labels');
    pass('Each column has three widths, and icon buttons to move and remove it');
  },

  'should show columns without preconfigured layouts, only Add column and its columns': async ({ pass, fail }) => {
    const row = { id: 'r1', type: 'columns', attrs: {}, slots: { default: [{ id: 'c1', type: 'column', attrs: {}, slots: { default: [] } }] } };
    const builder = await createBuilder({ attrs: {}, slots: { default: [row] } });
    builder.select('r1');
    await wait(400);
    const panel = builder.renderRoot.querySelector('k-page-builder-settings');
    await panel.updateComplete;
    const settings = panel.shadowRoot.querySelector('k-page-builder-columns-settings');
    await settings?.updateComplete;
    const buttons = [...(settings?.shadowRoot?.querySelectorAll('button') || [])].map(b => b.textContent.trim());
    cleanup(builder);
    if(!settings) return fail('The columns settings did not load');
    if(buttons.some(text => /column/i.test(text) && text !== 'Add column' && !/^Column \d/.test(text) && !/Remove|Move/.test(text))) return fail(`The columns still have preset layout buttons: ${buttons.join(', ')}`);
    if(!buttons.includes('Add column')) return fail('The columns should still have Add column');
    pass('Columns have no preconfigured layouts');
  },

  'should mark the save button while there are changes to save, and clear it on save': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>One</p>')));
    const control = () => builder.renderRoot.querySelector('kc-pb-save');
    const before = control().hasAttribute('dirty');
    builder.setWidgetAttribute('t1', 'html', '<p>Two</p>', true);
    await builder.updateComplete;
    const changed = control().hasAttribute('dirty');
    const title = control().getAttribute('title');
    builder.save();
    await builder.updateComplete;
    const saved = control().hasAttribute('dirty');
    const shadow = [...control().shadowRoot.querySelectorAll('style')].map(style => style.textContent).join('');
    cleanup(builder);
    if(before) return fail('A page that was just given should not have changes to save');
    if(!changed) return fail('A change should mark the save button');
    if(!/unsaved changes/.test(title)) return fail(`The save button should say there are unsaved changes, said "${title}"`);
    if(saved) return fail('Saving should clear the mark');
    if(!shadow.includes(':host([dirty])') || !shadow.includes('--c_success')) return fail('The save button has no green style for the mark');
    pass('The save button shows unsaved changes in green');
  },

  'should disable the move buttons when nothing is selected, from the first load': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>One</p>')));
    await wait(200);
    const moves = ['kc-pb-move-up', 'kc-pb-move-down', 'kc-pb-move-in', 'kc-pb-move-out'].map(tag => builder.renderRoot.querySelector(tag));
    const initially = moves.map(control => control.disabled);
    builder.select('t1');
    await builder.updateComplete;
    await wait(100);
    const whenSelected = moves.map(control => control.disabled);
    builder.setSelection([]);
    await builder.updateComplete;
    await wait(100);
    const afterDeselect = moves.map(control => control.disabled);
    cleanup(builder);
    if(initially.some(disabled => !disabled)) return fail(`The move buttons should be disabled on the first load, got ${initially}`);
    if(whenSelected.some(disabled => disabled)) return fail(`The move buttons should be enabled with a widget selected, got ${whenSelected}`);
    if(afterDeselect.some(disabled => !disabled)) return fail(`The move buttons should be disabled again after deselecting, got ${afterDeselect}`);
    pass('The move buttons follow the selection, from the first load');
  },

  'should choose a button icon in the settings, and show it on the page': async ({ pass, fail }) => {
    const button = { id: 'b1', type: 'button', attrs: { kind: 'link', href: '/x', label: 'Save', icon: 'save' }, slots: {} };
    const builder = await createBuilder(page(button));
    builder.select('b1');
    await wait(400);
    const picker = deepQuery(builder.renderRoot, '#pb-field-icon');
    if(!picker || picker.localName !== 'k-icon-selector') { cleanup(builder); return fail('The button settings should have an icon picker'); }
    if(picker.value !== 'save') { cleanup(builder); return fail(`The picker should show save, got ${picker.value}`); }
    picker.dispatchEvent(new CustomEvent('change', { detail: { value: 'facebook' }, bubbles: true }));
    await wait(100);
    const stored = builder.value.slots.default[0].attrs.icon;
    const drawn = await waitForWidget(builder, 'b1');
    const drawnWithIcon = drawn?.innerHTML.includes('name="facebook"');
    cleanup(builder);
    if(stored !== 'facebook') return fail(`The icon should be stored as facebook, stored ${stored}`);
    if(!drawnWithIcon) return fail('The button on the page should show the chosen icon');
    pass('A button takes its icon from the picker, and the page shows it');
  },

  'should put the controls a site adds to the extra slots in their places in the bar': async ({ pass, fail }) => {
    const builder = await createBuilder(page());
    const names = ['left-end', 'center-start', 'center-end', 'right-start'];
    const before = names.filter(name => builder.renderRoot.querySelector(`slot[name="${name}"]`));
    const buttons = names.map(name => {
      const button = document.createElement('button');
      button.slot = name;
      button.className = 'btn';
      button.textContent = name;
      builder.appendChild(button);
      return button;
    });
    await builder.updateComplete;
    await wait(100);
    const inSlots = names.map((name, index) => builder.renderRoot.querySelector(`slot[name="${name}"]`)?.assignedElements().includes(buttons[index]));
    const leftAfterMove = builder.renderRoot.querySelector('slot[name="left-end"]')?.parentElement.previousElementSibling.querySelector('kc-pb-move-up');
    cleanup(builder);
    if(before.length) return fail(`Without controls there should be no extra slots, found ${before.join(', ')}`);
    if(inSlots.some(ok => !ok)) return fail(`Each control should be in its slot, got ${inSlots.join(', ')}`);
    if(!leftAfterMove) return fail('The left end control should come after the move controls');
    pass('Extra controls are placed at each slot, and the slots only appear when used');
  },

  'should move a site\'s extra controls into the more menu when the bar is narrow': async ({ pass, fail }) => {
    const { box, builder } = await createInBox(320);
    const button = document.createElement('button');
    button.slot = 'right-start';
    button.className = 'btn';
    button.textContent = 'Publish';
    builder.appendChild(button);
    await builder.updateComplete;
    await wait(400);
    const moved = button.hasAttribute('in-menu');
    cleanup(builder);
    box.remove();
    if(!moved) return fail('A narrow bar should move the extra control into the more menu');
    pass('Extra controls collapse with their group');
  },

  'should edit a text widget on the page, and save the change when it loses focus': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>Before</p>')));
    builder.select('t1');
    const el = await waitForWidget(builder, 't1');
    let changes = 0;
    builder.addEventListener('change', () => changes++);
    const editable = el?.isContentEditable;
    if(!editable){ cleanup(builder); return fail('A text widget should be editable on the page while it is selected'); }
    el.focus();
    el.innerHTML = '<p>After</p>';
    await wait(100);
    const beforeBlur = changes;
    el.blur();
    await wait(100);
    const stored = builder.value.slots.default[0].attrs.html;
    const afterBlur = changes;
    el.focus();
    el.blur();
    await wait(100);
    const afterUnchangedFocus = changes;
    cleanup(builder);
    if(beforeBlur !== 0) return fail('The change should wait until the text loses focus');
    if(!stored.includes('After') || stored.includes('Before')) return fail(`Losing focus should save the edit, stored: ${stored}`);
    if(afterBlur !== 1) return fail(`Losing focus should record one change, recorded ${afterBlur}`);
    if(afterUnchangedFocus !== afterBlur) return fail('Focusing and leaving the text without an edit should record nothing');
    pass('An edit on the page is saved when the text loses focus');
  },

  'should set a widget\'s margin in its settings, and show it on the page': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>Spaced</p>')));
    builder.select('t1');
    await wait(500);
    const spacing = deepQuery(builder.renderRoot, 'k-page-builder-styles');
    await spacing?.updateComplete;
    const select = spacing ? deepQuery(spacing.shadowRoot, 'select[aria-label="Margin top"]') : null;
    if(!select){ cleanup(builder); return fail('A widget should have margin and padding settings'); }
    select.value = 'f';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(300);
    const stored = builder.value.slots.default[0].attrs.styles?.margin?.top;
    const drawn = await waitForWidget(builder, 't1');
    const onPage = drawn?.classList.contains('mt');
    cleanup(builder);
    if(stored !== 'f') return fail(`The top margin should be stored as f, stored: ${stored}`);
    if(!onPage) return fail('The widget on the page should have the mt class');
    pass('A margin set in the settings is stored and drawn');
  },

  'should set a background opacity with the slider or the number box': async ({ pass, fail }) => {
    const builder = await createBuilder(page({ id: 't1', type: 'text', attrs: { html: '<p>Tinted</p>', styles: { background: 'primary', alpha: 100 } }, slots: {} }));
    builder.select('t1');
    await wait(500);
    const styles = deepQuery(builder.renderRoot, 'k-page-builder-styles');
    await styles?.updateComplete;
    const slider = styles ? deepQuery(styles.shadowRoot, 'k-slider') : null;
    slider?.dispatchEvent(new CustomEvent('change', { detail: { value: '40' }, bubbles: true }));
    await wait(200);
    const bySlider = builder.value.slots.default[0].attrs.styles?.alpha;
    const number = styles ? deepQuery(styles.shadowRoot, 'input[aria-label="Background opacity (%)"]') : null;
    if(number){
      number.value = '75';
      number.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await wait(200);
    const byNumber = builder.value.slots.default[0].attrs.styles?.alpha;
    cleanup(builder);
    if(!slider || !number) return fail('The background should have an opacity slider and a number box');
    if(bySlider !== 40) return fail(`The slider should set the opacity to 40, got ${bySlider}`);
    if(byNumber !== 75) return fail(`The number box should set the opacity to 75, got ${byNumber}`);
    pass('The opacity can be set with the slider or the number box');
  },

  'should leave the background out of the styles of a button, which has its own color, and keep it for other widgets': async ({ pass, fail }) => {
    const nodes = [{ id: 'b1', type: 'button', attrs: { label: 'Go', kind: 'link', href: '/x' }, slots: {} }, text('t1', '<p>Text</p>')];
    const builder = await createBuilder({ attrs: { title: 'T', description: '' }, slots: { default: nodes } });
    const read = async id => {
      builder.select(id);
      await wait(500);
      const styles = deepQuery(builder.renderRoot, 'k-page-builder-styles');
      await styles?.updateComplete;
      return {
        background: !!(styles && deepQuery(styles.shadowRoot, '#pb-style-background')),
        align: !!(styles && deepQuery(styles.shadowRoot, '#pb-style-align')),
        colour: !!(styles && deepQuery(styles.shadowRoot, '#pb-style-text')),
        margin: !!(styles && deepQuery(styles.shadowRoot, 'select[aria-label="Margin top"]'))
      };
    };
    const button = await read('b1');
    const other = await read('t1');
    cleanup(builder);
    if(button.background) return fail('A button should have no background in its Styles tab');
    if(!button.align || !button.colour || !button.margin) return fail(`A button keeps the rest of the Styles tab, got ${JSON.stringify(button)}`);
    if(!other.background) return fail('Other widgets keep the background');
    pass('A widget can hide a part of its Styles tab');
  },

  'should edit the cells of a table on the page, and keep each one where it was typed': async ({ pass, fail }) => {
    const table = { id: 'tb1', type: 'table', attrs: { rows: [['Name', 'Qty'], ['Pen', '2'], ['', '']], spans: {} }, slots: {} };
    const builder = await createBuilder(page(table));
    const widget = await waitForWidget(builder, 'tb1');
    const cell = (row, column) => widget.querySelector(`[data-pb-edit="rows.${row}.${column}"]`);
    const blur = element => element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    const editable = cell(1, 0)?.isContentEditable && cell(0, 1)?.isContentEditable;
    cell(1, 0).innerHTML = '<b>Pencil</b>';
    blur(cell(1, 0));
    cell(2, 1).innerHTML = 'Sum';
    blur(cell(2, 1));
    cell(0, 0).innerHTML = '<br>';
    blur(cell(0, 0));
    await wait(200);
    const rows = builder.value.slots.default[0].attrs.rows;
    cleanup(builder);
    if(!editable) return fail('The cells should be contenteditable');
    if(rows[1][0] !== '<b>Pencil</b>') return fail(`A cell should keep what was typed, got ${rows[1][0]}`);
    if(rows[2][1] !== 'Sum') return fail(`Another cell should keep its text, got ${rows[2][1]}`);
    if(rows[0][0] !== '') return fail(`A cell emptied on the page should be empty, got ${JSON.stringify(rows[0][0])}`);
    if(rows[1][1] !== '2' || rows[0][1] !== 'Qty') return fail('Cells that were not edited should stay as they were');
    pass('Table cells are edited on the page');
  },

  'should add a row on Enter in a table cell and a column on Ctrl+Enter, and leave Shift+Enter alone': async ({ pass, fail }) => {
    const table = { id: 'tb1', type: 'table', attrs: { rows: [['A', 'B'], ['c', 'd']] }, slots: {} };
    const builder = await createBuilder(page(table));
    let widget = await waitForWidget(builder, 'tb1');
    const press = (element, init) => {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
      element.dispatchEvent(event);
      return event;
    };
    const cell = (row, column) => widget.querySelector(`[data-pb-edit="rows.${row}.${column}"]`);
    const state = () => builder.value.slots.default[0].attrs;
    const stillThere = id => builder.renderRoot.querySelector('iframe').contentDocument.querySelector(`[data-pb-id="${id}"]`);
    cell(1, 1).innerHTML = 'typed';
    const shift = press(cell(1, 1), { key: 'Enter', shiftKey: true });
    await wait(200);
    const afterShift = state().rows.length;
    const enter = press(cell(1, 1), { key: 'Enter' });
    await wait(500);
    widget = stillThere('tb1');
    const afterEnter = JSON.parse(JSON.stringify(state().rows));
    const focusedRow = widget.ownerDocument.activeElement?.dataset?.pbEdit;
    const ctrl = press(widget.ownerDocument.activeElement, { key: 'Enter', ctrlKey: true });
    await wait(500);
    widget = stillThere('tb1');
    const afterCtrl = JSON.parse(JSON.stringify(state().rows));
    const focusedColumn = widget.ownerDocument.activeElement?.dataset?.pbEdit;
    const drawnCells = widget.querySelectorAll('[data-pb-edit]').length;
    cleanup(builder);
    if(shift.defaultPrevented || afterShift !== 2) return fail('Shift+Enter must be left to the browser: a new line, no new row');
    if(!enter.defaultPrevented) return fail('Enter should be handled');
    if(afterEnter.length !== 3 || afterEnter[1][1] !== 'typed' || afterEnter[2].join('|') !== '|') return fail(`Enter should add a blank row below and keep the text, got ${JSON.stringify(afterEnter)}`);
    if(focusedRow !== 'rows.2.1') return fail(`The caret should be in the same column of the new row, got ${focusedRow}`);
    if(!ctrl.defaultPrevented) return fail('Ctrl+Enter should be handled');
    if(afterCtrl.some(row => row.length !== 3)) return fail(`Ctrl+Enter should add a column to every row, got ${JSON.stringify(afterCtrl)}`);
    if(focusedColumn !== 'rows.2.2') return fail(`The caret should be in the new column, got ${focusedColumn}`);
    if(drawnCells !== 9) return fail(`The page should draw 3 by 3 cells, got ${drawnCells}`);
    pass('Enter adds a row and Ctrl+Enter a column, with the caret following');
  },

  'should wrap a table so it scrolls sideways, until Make responsive is turned off': async ({ pass, fail }) => {
    const table = { id: 'tb1', type: 'table', attrs: { rows: [['A', 'B', 'C'], ['d', 'e', 'f']], widths: ['', '', '900px'] }, slots: {} };
    const builder = await createBuilder(page(table));
    let widget = await waitForWidget(builder, 'tb1');
    const wrapped = widget.classList.contains('table-wrapper') && widget.firstElementChild?.tagName === 'TABLE';
    builder.select('tb1');
    await wait(500);
    const settings = deepQuery(builder.renderRoot, 'k-page-builder-table-settings');
    await settings?.updateComplete;
    const fields = settings ? deepQuery(settings.shadowRoot, 'k-page-builder-fields')?.shadowRoot : null;
    const toggle = [...(fields?.querySelectorAll('k-toggle') ?? [])].find(entry => /Make responsive/.test(entry.textContent));
    const wasOn = toggle?.value;
    toggle?.dispatchEvent(new CustomEvent('change', { detail: { value: false }, bubbles: true }));
    await wait(500);
    widget = await waitForWidget(builder, 'tb1');
    const unwrapped = widget.tagName === 'TABLE' && !widget.closest('.table-wrapper');
    const stored = builder.value.slots.default[0].attrs.responsive;
    cleanup(builder);
    if(!wrapped) return fail('A table should be wrapped in .table-wrapper (kempo-css makes it scroll sideways) by default');
    if(!toggle) return fail('The table settings should have a Make responsive toggle');
    if(wasOn !== true) return fail('Make responsive should be on by default');
    if(!unwrapped || stored !== false) return fail(`Turned off, the table should have no wrapper, stored ${stored}`);
    pass('Make responsive wraps the table');
  },

  'should leave an empty table cell big enough to click into': async ({ pass, fail }) => {
    const table = { id: 'tb1', type: 'table', attrs: { rows: [['', ''], ['', '']], widths: [] }, slots: {} };
    const builder = await createBuilder(page(table));
    const widget = await waitForWidget(builder, 'tb1');
    await wait(200);
    const sizes = [...widget.querySelectorAll('[data-pb-edit]')].map(cell => { const box = cell.getBoundingClientRect(); return [Math.round(box.width), Math.round(box.height)]; });
    cleanup(builder);
    if(sizes.length !== 4) return fail(`There should be four cells, got ${sizes.length}`);
    if(sizes.some(([width, height]) => width < 40 || height < 16)) return fail(`An empty cell should still be a place to click, got ${JSON.stringify(sizes)}`);
    pass('Empty cells are not collapsed in the builder');
  },

  'should set the columns a table cell spans from its settings, with no text boxes for the cells': async ({ pass, fail }) => {
    const table = { id: 'tb1', type: 'table', attrs: { rows: [['A', 'B', 'C'], ['d', 'e', 'f']] }, slots: {} };
    const builder = await createBuilder(page(table));
    builder.select('tb1');
    await wait(500);
    const settings = deepQuery(builder.renderRoot, 'k-page-builder-table-settings');
    await settings?.updateComplete;
    const textBoxes = settings ? settings.shadowRoot.querySelectorAll('input[type="text"]').length : -1;
    const span = settings?.shadowRoot.querySelector('input[aria-label="Row 2, column 1: columns spanned"]');
    if(span){
      span.value = '2';
      span.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await wait(400);
    const stored = builder.value.slots.default[0].attrs.spans;
    const widget = await waitForWidget(builder, 'tb1');
    const cells = widget.querySelectorAll('tbody tr:first-child [data-pb-edit]').length;
    const colspan = widget.querySelector('tbody td')?.getAttribute('colspan');
    cleanup(builder);
    if(textBoxes !== 0) return fail(`The cells should not be typed in the settings, found ${textBoxes} text boxes`);
    if(!span) return fail('Each cell should have a spanned columns box');
    if(stored?.['1.0'] !== 2) return fail(`The span should be stored for the cell, got ${JSON.stringify(stored)}`);
    if(colspan !== '2' || cells !== 2) return fail(`The page should draw a cell with colspan 2 and one cell less, got colspan ${colspan} and ${cells} cells`);
    pass('A cell spans columns from the settings');
  },

  'should leave only the id in the styles of a script, which draws nothing': async ({ pass, fail }) => {
    const nodes = [{ id: 's1', type: 'script', attrs: { code: 'x();' }, slots: {} }, text('t1', '<p>Text</p>')];
    const builder = await createBuilder({ attrs: { title: 'T', description: '' }, slots: { default: nodes } });
    const read = async id => {
      builder.select(id);
      await wait(500);
      const styles = deepQuery(builder.renderRoot, 'k-page-builder-styles');
      await styles?.updateComplete;
      const labels = styles ? [...styles.shadowRoot.querySelectorAll('label')].map(label => label.textContent.trim()) : [];
      return { labels, box: !!(styles && deepQuery(styles.shadowRoot, 'select[aria-label="Margin top"]')), background: !!(styles && deepQuery(styles.shadowRoot, '#pb-style-background')), align: !!(styles && deepQuery(styles.shadowRoot, '#pb-style-align')), colour: !!(styles && deepQuery(styles.shadowRoot, '#pb-style-text')) };
    };
    const script = await read('s1');
    const other = await read('t1');
    cleanup(builder);
    if(script.labels.join(',') !== 'ID') return fail(`A script should only have the ID, got ${JSON.stringify(script.labels)}`);
    if(script.box || script.background || script.align || script.colour) return fail(`A script should have none of the other styles, got ${JSON.stringify(script)}`);
    if(!other.box || !other.background || !other.align || !other.colour || !other.labels.includes('Classes')) return fail(`Other widgets keep all the styles, got ${JSON.stringify(other)}`);
    pass('A script only has an ID in its Styles tab');
  },

  'should draw image fields with the picker a site sets, in place of the default': async ({ pass, fail }) => {
    const defaultPicker = PageBuilderFields.pickers.image;
    PageBuilderFields.pickers.image = ({ id, value }) => html`<button id="${id}" data-site-picker>${value || 'none'}</button>`;
    const image = { id: 'i1', type: 'image', attrs: { src: '/a.png' }, slots: {} };
    const builder = await createBuilder(page(image));
    builder.select('i1');
    await wait(400);
    const picker = deepQuery(builder.renderRoot, '[data-site-picker]');
    PageBuilderFields.pickers.image = defaultPicker;
    const shownText = picker?.textContent.trim();
    cleanup(builder);
    if(shownText !== '/a.png') return fail(`The site's picker should show the image, got ${shownText}`);
    pass('A site can replace the image picker');
  },

  'should cancel a mouse press on the blank page while it deselects the widget': async ({ pass, fail }) => {
    const builder = await createBuilder(page(text('t1', '<p>One</p>')));
    builder.select('t1');
    await waitForWidget(builder, 't1');
    const doc = builder.renderRoot.querySelector('iframe').contentDocument;
    const press = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });
    doc.getElementById('pb-root').dispatchEvent(press);
    const { selection } = builder;
    cleanup(builder);
    if(!press.defaultPrevented) return fail('A press on the blank page should be cancelled, so the browser does not place a caret while the widget is deselected');
    if(selection.length) return fail(`A press on the blank page should deselect, still selected: ${selection}`);
    pass('A press on the blank page is cancelled and deselects');
  },

  'should draw video and audio fields with the pickers a site sets': async ({ pass, fail }) => {
    const defaults = { video: PageBuilderFields.pickers.video, audio: PageBuilderFields.pickers.audio };
    PageBuilderFields.pickers.video = ({ id, value }) => html`<button id="${id}" data-video-picker>${value || 'none'}</button>`;
    PageBuilderFields.pickers.audio = ({ id, value }) => html`<button id="${id}" data-audio-picker>${value || 'none'}</button>`;
    const video = { id: 'v1', type: 'video', attrs: { src: '/a.mp4' }, slots: {} };
    const audio = { id: 'a1', type: 'audio', attrs: { src: '/a.mp3' }, slots: {} };
    const builder = await createBuilder(page(video, audio));
    builder.select('v1');
    await wait(400);
    const videoText = deepQuery(builder.renderRoot, '[data-video-picker]')?.textContent.trim();
    builder.select('a1');
    await wait(400);
    const audioText = deepQuery(builder.renderRoot, '[data-audio-picker]')?.textContent.trim();
    Object.assign(PageBuilderFields.pickers, defaults);
    cleanup(builder);
    if(videoText !== '/a.mp4') return fail(`The video picker should show the video, got ${videoText}`);
    if(audioText !== '/a.mp3') return fail(`The audio picker should show the audio, got ${audioText}`);
    pass('A site can replace the video and audio pickers');
  },

  'should register a widget with the static addWidget': async ({ pass, fail }) => {
    PageBuilder.addWidget({ name: 'builder-test-quote', title: 'Test quote', category: 'content', tag: 'pb-builder-test-quote', content: { name: 'text', mode: 'text' }, attributes: [{ name: 'text', type: 'string', virtual: true, label: 'Quote' }] });
    const builder = await createBuilder();
    if(!builder.canAdd('builder-test-quote')){
      cleanup(builder);
      return fail('the new widget cannot be added');
    }
    builder.insert('builder-test-quote');
    if(builder.value.slots.default[0]?.type !== 'builder-test-quote'){
      cleanup(builder);
      return fail('the new widget was not inserted');
    }
    cleanup(builder);
    pass('addWidget registers a widget');
  }
};
