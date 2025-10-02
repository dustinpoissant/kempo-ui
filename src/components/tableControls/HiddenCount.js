import TableControl from './TableControl.js';
import { html } from '../../lit-all.min.js';

export default class HiddenCount extends TableControl {
	/*
		Properties
	*/
	static properties = {
		hiddenCount: { type: Number }
	};

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.updateHiddenCount();
		this.onTableEvent('recordHidden recordShown', this.handleHiddenChange);
	}

	/*
		Event Handlers
	*/
	handleHiddenChange = () => {
		this.updateHiddenCount();
	};

	/*
		Methods
	*/
	updateHiddenCount = () => {
		this.hiddenCount = this.table?.getHiddenRecords().length || 0;
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<div class="pyq pxh"><span>${this.hiddenCount}</span>&nbsp;Hidden Records</div>
		`;
	}
}

customElements.define('k-tc-hidden-count', HiddenCount);
