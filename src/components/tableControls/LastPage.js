import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class LastPage extends TableControl {
	constructor() {
		super();
		this.pageChangeHandler = () => this.requestUpdate();
	}

	/*
		Lifecycle Callbacks
	*/

	connectedCallback() {
		super.connectedCallback();
		if(this.table){
			this.table.addEventListener('pageChange', this.pageChangeHandler);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if(this.table){
			this.table.removeEventListener('pageChange', this.pageChangeHandler);
		}
	}

	/*
		Event Handlers
	*/

	handleClick = () => {
		if(this.table){
			this.table.lastPage();
		}
	};

	/*
		Utility Functions
	*/

	get isDisabled() {
		if(!this.table) return true;
		return this.table.getCurrentPage() === this.table.getTotalPages();
	}

	/*
		Rendering Logic
	*/

	render() {
		return html`
			<button 
				class="no-btn icon-btn" 
				?disabled="${this.isDisabled}"
				@click="${this.handleClick}"
			>
				<k-icon name="last"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-tc-last-page', LastPage);