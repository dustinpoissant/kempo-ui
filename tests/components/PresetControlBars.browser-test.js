import '../../src/components/Audio.js';
import '../../src/components/Video.js';
import '../../src/components/Pagination.js';
import '../../src/components/HtmlEditor.js';
import '../../src/components/MarkdownEditor.js';
import '../../src/components/CodeEditor.js';

const WIDGETS = [
  ['k-audio', 'full'],
  ['k-video', 'full'],
  ['k-pagination', 'full'],
  ['k-html-editor', 'full'],
  ['k-markdown-editor', 'full'],
  ['k-code-editor', 'full']
];

const create = async (tag, controls) => {
  const container = document.createElement('div');
  container.style.width = '900px';
  container.innerHTML = `<${tag} controls="${controls}"></${tag}>`;
  document.body.appendChild(container);
  const el = container.firstElementChild;
  await el.updateComplete;
  await new Promise(resolve => setTimeout(resolve, 400));
  return { container, el };
};

export default {
  'should render each widget preset as a control bar': async ({pass, fail}) => {
    const missing = [];
    for(const [tag, controls] of WIDGETS){
      const { container, el } = await create(tag, controls);
      if(!el.shadowRoot.querySelector('k-control-bar')) missing.push(tag);
      container.remove();
    }
    if(missing.length) return fail(`No control bar in: ${missing}`);
    pass('Every preset uses a control bar');
  },

  'should find the widget as the host of preset controls': async ({pass, fail}) => {
    const wrong = [];
    for(const [tag, controls] of WIDGETS){
      const { container, el } = await create(tag, controls);
      const control = el.shadowRoot.querySelector('k-control-bar > [priority]:not(k-control-group)');
      if(control?.host !== el) wrong.push(tag);
      container.remove();
    }
    if(wrong.length) return fail(`Host not found for: ${wrong}`);
    pass('Preset controls find their widget');
  },

  'should mark the widget so its toolbar can fill the width': async ({pass, fail}) => {
    const wrong = [];
    for(const [tag, controls] of WIDGETS){
      const { container, el } = await create(tag, controls);
      if(!el.hasAttribute('has-control-bar')) wrong.push(tag);
      container.remove();
    }
    if(wrong.length) return fail(`Not marked: ${wrong}`);
    pass('Widgets with a preset bar are marked');
  },

  'should never move the seek bar and keep play/pause longest in media presets': async ({pass, fail}) => {
    for(const tag of ['k-audio', 'k-video']){
      const { container, el } = await create(tag, 'full');
      const bar = el.shadowRoot.querySelector('k-control-bar');
      const seek = bar.querySelector('kc-media-seek');
      const play = bar.querySelector('kc-media-play-pause');
      const others = [...bar.children].filter(c => c !== play && c !== seek && !c.hasAttribute('priority')).length;
      container.remove();
      if(!seek.hasAttribute('no-collapse')) return fail(`${tag}: the seek bar should have no-collapse`);
      if(Number(play.getAttribute('priority')) < 10) return fail(`${tag}: play/pause should have a very high priority`);
      if(!others) return fail(`${tag}: expected lower priority controls to move first`);
    }
    pass('Seek stays, play/pause has a very high priority');
  },

  'should collapse the right side of a media preset first and keep the seek bar': async ({pass, fail}) => {
    const { container, el } = await create('k-audio', 'full');
    container.style.width = '300px';
    await new Promise(resolve => setTimeout(resolve, 500));
    const bar = el.shadowRoot.querySelector('k-control-bar');
    const moved = bar.moved.map(c => c.tagName.toLowerCase());
    const seekMoved = moved.includes('kc-media-seek');
    const playMoved = moved.includes('kc-media-play-pause');
    container.remove();
    if(!moved.includes('kc-media-download')) return fail(`The right side should move first, moved: ${moved}`);
    if(seekMoved) return fail('The seek bar should never move');
    if(playMoved) return fail('Play/pause should stay while there are other controls to move');
    pass('Media preset collapses sensibly');
  },

  'should keep the most used editor controls longest': async ({pass, fail}) => {
    const { container, el } = await create('k-html-editor', 'full');
    container.style.width = '330px';
    await new Promise(resolve => setTimeout(resolve, 600));
    const bar = el.shadowRoot.querySelector('k-control-bar');
    const moved = bar.moved.map(c => c.tagName.toLowerCase());
    const boldGroup = bar.querySelector('k-control-group[priority="3"]');
    const fullscreenMoved = moved.includes('kc-fullscreen');
    const boldMoved = moved.includes('k-control-group') && bar.moved.includes(boldGroup);
    container.remove();
    if(!fullscreenMoved) return fail(`Fullscreen should move into the menu, moved: ${moved}`);
    if(boldMoved) return fail('The bold/italic group should stay while lower priority controls move');
    pass('Frequently used controls stay in the bar');
  }
};
