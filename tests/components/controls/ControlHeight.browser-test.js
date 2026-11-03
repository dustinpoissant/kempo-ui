import '../../../src/components/controls/Bold.js';
import '../../../src/components/controls/TcSearch.js';
import '../../../src/components/controls/TcExportCsv.js';
import '../../../src/components/controls/TcPageSize.js';
import '../../../src/components/controls/PgItemsPerPage.js';
import '../../../src/components/controls/MediaSpeed.js';
import '../../../src/components/controls/MediaTime.js';
import '../../../src/components/controls/MediaVolume.js';
import '../../../src/components/controls/MediaMetadata.js';
import '../../../src/components/controls/MediaLink.js';
import '../../../src/components/controls/MdImage.js';
import '../../../src/components/controls/Menu.js';

const TAGS = ['kc-bold', 'kc-tc-search', 'kc-tc-export-csv', 'kc-tc-page-size', 'kc-pg-items-per-page', 'kc-media-speed', 'kc-media-time', 'kc-media-volume', 'kc-media-metadata', 'kc-media-link', 'kc-md-image', 'kc-menu'];

const create = async style => {
  const container = document.createElement('div');
  container.style.cssText = style;
  container.innerHTML = TAGS.map(tag => `<${tag}></${tag}>`).join('');
  document.body.appendChild(container);
  await Promise.all([...container.children].map(c => c.updateComplete));
  await new Promise(resolve => setTimeout(resolve, 100));
  return container;
};

const heights = container => [...container.children].map(c => `${c.tagName.toLowerCase()}:${Math.round(c.getBoundingClientRect().height)}`);

export default {
  'should make every control 40px tall': async ({pass, fail}) => {
    const container = await create('');
    const wrong = heights(container).filter(h => !h.endsWith(':40'));
    container.remove();
    if(wrong.length) return fail(`Not 40px tall: ${wrong}`);
    pass('All controls are 40px tall');
  },

  'should size the visible parts of controls to the same height': async ({pass, fail}) => {
    const container = await create('');
    const inner = {
      'kc-tc-search': 'input',
      'kc-tc-page-size': 'select',
      'kc-media-speed': 'button',
      'kc-md-image': 'button'
    };
    const wrong = Object.entries(inner).map(([tag, selector]) => {
      const height = Math.round(container.querySelector(tag).shadowRoot.querySelector(selector).getBoundingClientRect().height);
      return [tag, height];
    }).filter(([, height]) => height < 38 || height > 40);
    container.remove();
    if(wrong.length) return fail(`Inner element is not 38-40px tall: ${wrong.map(w => w.join(':'))}`);
    pass('Visible parts fill the control');
  },

  'should follow --control_height': async ({pass, fail}) => {
    const container = await create('--control_height: 56px');
    const wrong = heights(container).filter(h => !h.endsWith(':56'));
    container.remove();
    if(wrong.length) return fail(`Not 56px tall: ${wrong}`);
    pass('--control_height changes every control');
  }
};
