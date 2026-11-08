import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';
import { widgetIcon } from '../../utils/pageLabels.js';

const CATEGORY_TITLES = {
  content: 'Content',
  media: 'Media',
  layout: 'Layout',
  interactive: 'Interactive'
};
const CATEGORY_ORDER = Object.keys(CATEGORY_TITLES);

/*
  The list of widgets a person can add, searchable and grouped by category. It lists the widgets that can go where the
  new one will be put (the host's canAdd), and calls host.insert(name) when one is chosen. Sections (columns, tabs) are
  not listed: they are added from their parent's settings.
*/
export default class PageBuilderInserter extends ShadowComponent {
  static properties = {
    registry: { attribute: false },
    host: { attribute: false },
    query: { state: true }
  };

  constructor() {
    super();
    this.query = '';
  }

  static styles = css`
    :host { display: block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.5rem; }
    .grid button { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.75rem 0.5rem; text-align: center; height: 100%; }
    .grid small { opacity: 0.65; }
  `;

  /*
    Public Methods
  */
  focusSearch() {
    this.renderRoot.querySelector('input')?.focus();
  }

  /*
    Protected Members
  */
  matches(definition) {
    const query = this.query.trim().toLowerCase();
    if(!query) return true;
    return [definition.title, definition.description, ...(definition.keywords || [])].some(text => String(text || '').toLowerCase().includes(query));
  }

  groups() {
    const offered = [...this.registry.values()].filter(definition => !definition.section && this.host.canAdd(definition.name) && this.matches(definition));
    const byCategory = new Map();
    for(const definition of offered){
      if(!byCategory.has(definition.category)) byCategory.set(definition.category, []);
      byCategory.get(definition.category).push(definition);
    }
    const titles = new Map(offered.filter(definition => definition.categoryTitle).map(definition => [definition.category, definition.categoryTitle]));
    const names = [...byCategory.keys()].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return names.map(name => ({ name, title: CATEGORY_TITLES[name] || titles.get(name) || name[0].toUpperCase() + name.slice(1).replace(/[-_]+/g, ' '), widgets: byCategory.get(name) }));
  }

  /*
    Event Handlers
  */
  handleSearchKeyDown(event, groups) {
    if(event.key === 'Enter' && groups.length) this.host.insert(groups[0].widgets[0].name);
  }

  /*
    Rendering
  */
  render() {
    const groups = this.groups();
    return html`
      <div class="p">
        <input type="search" class="full mb" placeholder="Search widgets" aria-label="Search widgets" .value="${this.query}" @input="${event => { this.query = event.target.value; }}" @keydown="${event => this.handleSearchKeyDown(event, groups)}">
        ${groups.length ? groups.map(group => html`
          <h6 class="mb">${group.title}</h6>
          <div class="grid mb">
            ${group.widgets.map(definition => html`
              <button @click="${() => this.host.insert(definition.name)}" title="${definition.description || ''}">
                ${widgetIcon(definition)}
                <span>${definition.title}</span>
              </button>
            `)}
          </div>
        `) : html`<p class="tc-muted">No widget matches that.</p>`}
      </div>
    `;
  }
}

customElements.define('k-page-builder-inserter', PageBuilderInserter);
