import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class FilterList extends ShadowComponent {
	/*
		Rendering
	*/
	render() {
		return html`<slot></slot>`;
	}

	/*
		Public Methods
	*/
	filter(term) {
		const words = term.toLowerCase().split(/\s+/).filter(w => w.length > 0);
		this.querySelectorAll('k-filter-item').forEach(item => {
			const keywords = (item.getAttribute('filter-keywords') || '').toLowerCase();
			item.hidden = words.length > 0 && !words.every(w => keywords.includes(w));
		});
	}

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
