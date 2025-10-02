import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class ShowAll extends TableControl {
	/*
		Constructor
	*/
	constructor() {
		super({ maxWidth: 40 });
	}

	/*
		Event Handlers
	*/
	handleShowAll = () => {
		if(this.table){
			this.table.showAllRecords();
		}
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="no-btn icon-btn" @click="${this.handleShowAll}">
				<k-icon name="show"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-tc-show-all', ShowAll);
