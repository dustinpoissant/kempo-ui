import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';
import '../Icon.js';

export default class FirstPage extends TableControl {
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
			this.table.firstPage();
		}
	};

	/*
		Utility Functions
	*/

	get isDisabled() {
		if(!this.table) return true;
		return this.table.getCurrentPage() === 1;
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
				<k-icon name="first"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-tc-first-page', FirstPage);