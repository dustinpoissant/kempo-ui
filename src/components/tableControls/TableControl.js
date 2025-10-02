import ShadowComponent from '../ShadowComponent.js';
import { html, css } from '../../lit-all.min.js';

export default class TableControl extends ShadowComponent {
	/*
		Properties
	*/
	static properties = {
		maxWidth: { type: Number, reflect: true, attribute: 'max-width' }
	};

	/*
		Constructor
	*/
	constructor({
		maxWidth = 40
	} = {}) {
		super();
		this.maxWidth = maxWidth;
	}

	/*
		Lifecycle Callbacks
	*/
	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('maxWidth')){
			if(this.maxWidth){
				this.style.setProperty('--max-width', `${this.maxWidth}px`);
			} else {
				this.style.removeProperty('--max-width');
			}
		}
	}

	firstUpdated() {
		if(this.maxWidth){
			this.style.setProperty('--max-width', `${this.maxWidth}px`);
		} else {
			this.style.removeProperty('--max-width');
		}
	}

	/*
		Getters for Table Integration
	*/
	get table() {
		if (this.getRootNode() instanceof ShadowRoot) {
			return this.getRootNode().host.closest('k-table');
		} else {
			return this.closest('k-table');
		}
	}

	get record() {
		if (this.getRootNode() instanceof ShadowRoot) {
			const $record = this.closest('.record');
			if ($record) {
				const index = $record.dataset.index;
				if (index !== undefined) {
					return this.table.records[index];
				}
			}
		}
		return false;
	}

	/*
		Table Event Handling
	*/
	async onTableEvent(eventNames, handler) {
		// Wait for k-table to be defined before trying to find it
		await customElements.whenDefined('k-table');
		
		if(this.table){
			const events = eventNames.split(' ');
			events.forEach(eventName => {
				this.table.addEventListener(eventName, handler);
			});
			this.requestUpdate(); // Force update after table is found
		}
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: inline-flex;
		}
		
		.icon-btn {
			display: inline-flex !important;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
		}
		.icon-btn:disabled {
			opacity: 0.6;
		}
	`;
}

customElements.define('k-table-control', TableControl);
