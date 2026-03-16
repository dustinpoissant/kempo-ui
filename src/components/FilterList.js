import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class FilterList extends ShadowComponent {
	#focusedIndex = -1;

	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}

	/*
		Public Methods
	*/
	handleKeydown = e => {
		const items = this.#visibleItems();
		if(!items.length) return;

		if(e.key === 'ArrowDown') {
			e.preventDefault();
			this.#focusedIndex = Math.min(this.#focusedIndex + 1, items.length - 1);
			this.#applyFocus(items);
		} else if(e.key === 'ArrowUp') {
			e.preventDefault();
			this.#focusedIndex = Math.max(this.#focusedIndex - 1, 0);
			this.#applyFocus(items);
		} else if(e.key === 'Enter' && this.#focusedIndex >= 0 && this.#focusedIndex < items.length) {
			e.preventDefault();
			items[this.#focusedIndex].querySelector('a')?.click();
		}
	};

	clearFocus = () => {
		this.#focusedIndex = -1;
		this.querySelectorAll('k-filter-item[kb-focus]').forEach(el => el.removeAttribute('kb-focus'));
	};

	filter(term) {
		const words = term.toLowerCase().split(/\s+/).filter(w => w.length > 0);
		this.querySelectorAll('k-filter-item').forEach(item => {
			const keywords = (item.getAttribute('filter-keywords') || '').toLowerCase();
			item.hidden = words.length > 0 && !words.every(w => keywords.includes(w));
		});
		this.clearFocus();
	}

	/*
		Private Methods
	*/
	#visibleItems = () => [...this.querySelectorAll('k-filter-item:not([hidden])')];

	#applyFocus = items => {
		this.querySelectorAll('k-filter-item[kb-focus]').forEach(el => el.removeAttribute('kb-focus'));
		items[this.#focusedIndex]?.setAttribute('kb-focus', '');
		items[this.#focusedIndex]?.scrollIntoView({ block: 'nearest' });
	};

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
		}
	`;
}

customElements.define('k-filter-list', FilterList);
