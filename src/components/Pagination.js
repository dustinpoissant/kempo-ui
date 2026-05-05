import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

const controlsLoaded = Symbol();
const autoPageReset = Symbol();

export default class Pagination extends ShadowComponent {
  /*
    Reactive Properties / Attributes
  */
  static properties = {
    page: { type: Number, reflect: true, attribute: 'page' },
    totalItems: { type: Number, reflect: true, attribute: 'total-items' },
    itemsPerPage: { type: Number, reflect: true, attribute: 'items-per-page' },
    controls: { type: String, reflect: true }
  };

  /*
    Constructor
  */
  constructor() {
    super();
    this.page = 1;
    this[controlsLoaded] = false;
    this.totalItems = 0;
    this.itemsPerPage = 10;
    this.controls = '';
  }

  /*
    Lifecycle
  */
  async loadControls() {
    if(this[controlsLoaded]) return;
    this[controlsLoaded] = true;
    const base = new URL('./paginationControls/', import.meta.url).href;
    await Promise.all([
      import(/* @vite-ignore */ `${base}PrevPage.js`),
      import(/* @vite-ignore */ `${base}NextPage.js`),
      import(/* @vite-ignore */ `${base}FirstPage.js`),
      import(/* @vite-ignore */ `${base}LastPage.js`),
      import(/* @vite-ignore */ `${base}PageInfo.js`),
      import(/* @vite-ignore */ `${base}ItemsPerPage.js`),
      import(/* @vite-ignore */ `${base}GotoPage.js`),
      import(/* @vite-ignore */ `${base}PageCount.js`)
    ]);
    this.requestUpdate();
  }

  willUpdate(changedProperties) {
    if(changedProperties.has('itemsPerPage') && changedProperties.get('itemsPerPage') !== undefined){
      this[autoPageReset] = true;
      this.page = 1;
    } else if(changedProperties.has('totalItems')){
      const maxPage = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
      if(this.page > maxPage){
        this[autoPageReset] = true;
        this.page = maxPage;
      }
    }
    if(changedProperties.has('page') && !this[autoPageReset]){
      const clamped = Math.max(1, Math.min(this.page, this.totalPages));
      if(clamped !== this.page) this.page = clamped;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if(changedProperties.has('page') && changedProperties.get('page') !== undefined && !this[autoPageReset]){
      this.dispatchEvent(new CustomEvent('page-change', {
        detail: {
          currentPage: this.page,
          totalPages: this.totalPages,
          itemsPerPage: this.itemsPerPage,
          totalItems: this.totalItems
        },
        bubbles: true
      }));
    }
    this[autoPageReset] = false;
    if(changedProperties.has('itemsPerPage') && changedProperties.get('itemsPerPage') !== undefined){
      this.dispatchEvent(new CustomEvent('items-per-page-change', {
        detail: {
          itemsPerPage: this.itemsPerPage,
          totalPages: this.totalPages,
          totalItems: this.totalItems
        },
        bubbles: true
      }));
    }
    if(changedProperties.has('controls') && this.controls && this.controls !== 'none'){
      this.loadControls();
    }
  }

  /*
    Protected Members
  */
  get totalPages() {
    if(!this.totalItems || !this.itemsPerPage) return 1;
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /*
    Public Methods
  */
  nextPage() {
    this.page = this.page + 1;
  }

  previousPage() {
    this.page = this.page - 1;
  }

  /*
    Rendering
  */
  render() {
    const set = this.constructor.controlSets[this.controls] ?? this.constructor.controlSets[''];
    return html`
      <nav aria-label="Pagination">
        <slot>${set ?? nothing}</slot>
      </nav>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    nav {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
    }
  `;

  /*
    Pre-built control sets used as slot fallback content when the `controls`
    attribute is set. Control modules are loaded dynamically by loadControls().
  */
  static controlSets = {
    '': null,
    none: null,
    simple: html`
      <k-pg-prev></k-pg-prev>
      <k-pg-page-info></k-pg-page-info>
      <k-pg-next></k-pg-next>
    `,
    full: html`
      <k-pg-first></k-pg-first>
      <k-pg-prev></k-pg-prev>
      <k-pg-goto-page></k-pg-goto-page>
      <k-pg-next></k-pg-next>
      <k-pg-last></k-pg-last>
      <k-pg-items-per-page></k-pg-items-per-page>
    `
  };
}

window.customElements.define('k-pagination', Pagination);
