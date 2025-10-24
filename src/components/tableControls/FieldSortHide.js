import TableControl from './TableControl.js';
import { html, render } from '../../lit-all.min.js';
import '../Icon.js';
import Dialog from '../Dialog.js';

export default class FieldSortHide extends TableControl {
	/*
		Constructor
	*/
	constructor() {
		super({ maxWidth: 40 });
	}

	/*
		Event Handlers
	*/
	handleClick = () => {
		this.openDialog();
	};

	/*
		Methods
	*/
	openDialog = () => {
		import('../Sortable.js');

		const dialogContent = document.createElement('div');

		render(html`
			<div class="m">
				<k-sortable id="sorting" @sort="${(e) => {
					const newOrder = Array.from(e.target.querySelectorAll('k-sortable-item'))
						.map(item => item.getAttribute('data-field'));
					this.table.reorderFields(newOrder);
				}}">
					${this.table.fields.map(field => html`
						<k-sortable-item data-field="${field.name}">
							<label class="field pb0">
								<input
									class="field-visibility"
									data-field="${field.name}"
									type="checkbox"
									.checked="${!field.hidden}"
									@change="${(e) => {
										this.table.setFieldHiddenState(field.name, !e.target.checked);
									}}"
									style="height: 1.25rem; width: 1.25rem"
								/>
								${field.label}
							</label>
						</k-sortable-item>
					`)}
				</k-sortable>
			</div>
		`, dialogContent);

		Dialog.create(dialogContent, {
			title: 'Show / Hide / Order Fields',
			width: '400px',
			cancelText: 'Close'
		});
	};

	/*
		Rendering
	*/
	render() {
		return html`
			<button class="no-btn icon-btn" @click="${this.handleClick}">
				<k-icon name="table-visibility"></k-icon>
			</button>
		`;
	}
}

customElements.define('k-tc-field-sort-hide', FieldSortHide);
