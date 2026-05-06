import { html, css, nothing } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { bound, closest } from '../utils/number.js';
import { commaSeparatedArray } from '../utils/propConverters.js';

export default class Pagination extends ShadowComponent {
	/*
		Reactive Properties / Attributes
	*/
	static properties = {
		page: { type: Number, reflect: true, attribute: 'page' },
		totalItems: { type: Number, reflect: true, attribute: 'total-items' },
		itemsPerPage: { type: Number, reflect: true, attribute: 'items-per-page' },
		controls: { type: String, reflect: true },
		pageSizes: {
			converter: commaSeparatedArray(v => {
				const n = parseInt(v);
				return isNaN(n) ? null : n;
			}, [5, 10, 25, 50, 100]),
			reflect: true,
			attribute: 'page-sizes'
		}
	};

	/*
		Constructor
	*/
	constructor() {
		super();
		this.page = 1;
		this.totalItems = 0;
		this.itemsPerPage = 10;
		this.pageSizes = [5, 10, 25, 50, 100];
		this.controls = '';
	}

	/*
		Lifecycle
	*/
	loadControls() {
		const modules = this.constructor.controlModules[this.controls];
		if (!modules?.length) return;
		const loaded = this.constructor.loadedModules;
		const base = new URL('./paginationControls/', import.meta.url).href;
		modules.filter(m => !loaded.has(m)).forEach(m => {
			loaded.add(m);
			import(`${base}${m}.js`);
		});
	}

	willUpdate(changedProperties) {
		changedProperties.forEach((oldVal, propName) => {
			const newVal = this[propName];
			switch (propName) {
				case 'pageSizes':
					if(typeof(newVal) === 'undefined'){
						this.pageSizes = [5, 10, 25, 50, 100];
					} else {
						this.itemsPerPage = closest(this.itemsPerPage, this.pageSizes);
					}
					break;
				case 'itemsPerPage':
					if(typeof(newVal) === 'undefined'){
						this.itemsPerPage = this.pageSizes?.[0] || 10;
					} else {
						this.itemsPerPage = closest(this.itemsPerPage, this.pageSizes);
						if(oldVal !== undefined) {
							this.page = Math.ceil(((this.page - 1) * oldVal + 1) / this.itemsPerPage);
						}
					}
					break;
				case 'totalItems':
					if(typeof(newVal) === 'undefined'){
						this.totalItems = 0;
					} else {
						const maxPage = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
						if(this.page > maxPage) this.page = maxPage;
					}
					break;
				case 'page':
					if(typeof(newVal) === 'undefined'){
						this.page = 1;
					} else {
						const clamped = bound(this.page, 1, this.totalPages);
						if(clamped !== this.page) this.page = clamped;
					}
					break;
				case 'controls':
					if(typeof(newVal) === 'undefined'){
						this.controls = '';
					}
					break;
			}
		});
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		const shouldFirePageChange = (changedProperties.has('page') && changedProperties.get('page') !== undefined) || (changedProperties.has('itemsPerPage') && changedProperties.get('itemsPerPage') !== undefined);
		if (shouldFirePageChange) {
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
		if (changedProperties.has('controls') && this.controls && this.controls !== 'none') {
			this.loadControls();
		}
	}

	/*
		Protected Members
	*/
	get totalPages() {
		if (!this.totalItems || !this.itemsPerPage) return 1;
		return Math.ceil(this.totalItems / this.itemsPerPage);
	}

	/*
		Public Methods
	*/
	nextPage() {
		this.page = bound(this.page + 1, 1, this.totalPages);
	}

	previousPage() {
		this.page = bound(this.page - 1, 1, this.totalPages);
	}

	/*
		Rendering
	*/
	render() {
		const set = this.constructor.controlSets[this.controls];
		return html`
      <div id="controls" aria-label="Pagination">
        <div class="left">
          <slot>${set?.left ?? nothing}</slot>
        </div>
        <div class="right">
          <slot name="right">${set?.right ?? nothing}</slot>
        </div>
			</div>
    `;
	}

	static styles = css`
    :host {
      display: block;
    }
    #controls {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
    }
    .left {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
    }
    .right {
      display: flex;
      align-items: center;
      gap: var(--spacer_q, 0.25rem);
      flex-wrap: wrap;
      margin-left: auto;
    }
  `;

	static loadedModules = new Set();
	static controlModules = {
		simple: ['PrevPage', 'NextPage', 'PageInfo'],
		full: ['FirstPage', 'PrevPage', 'GotoPage', 'NextPage', 'LastPage', 'ItemsPerPage']
	};

	static controlSets = {
		'': { left: null, right: null },
		none: { left: null, right: null },
		simple: {
			left: html`
        <k-pg-prev></k-pg-prev>
        <k-pg-page-info></k-pg-page-info>
        <k-pg-next></k-pg-next>
      `,
			right: null
		},
		full: {
			left: html`
        <k-pg-first></k-pg-first>
        <k-pg-prev></k-pg-prev>
        <k-pg-goto-page></k-pg-goto-page>
        <k-pg-next></k-pg-next>
        <k-pg-last></k-pg-last>
      `,
			right: html`<k-pg-items-per-page></k-pg-items-per-page>`
		}
	};
}

window.customElements.define('k-pagination', Pagination);
