import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import { boolExists } from '../utils/propConverters.js';
import './Icon.js';

const firstFocusable = element => {
	const focusableElements = element.querySelectorAll(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);
	return focusableElements[0];
};

export default class Dialog extends ShadowComponent {
	/*
		Properties
	*/
	static properties = {
		opened: { type: Boolean, reflect: true, converter: boolExists },
		closeBtn: { type: Boolean, reflect: true, attribute: 'close-btn', converter: boolExists },
		overlayClose: { type: Boolean, reflect: true, attribute: 'overlay-close', converter: boolExists },
		confirmText: { type: String, reflect: true, attribute: 'confirm-text' },
		confirmClasses: { type: String, reflect: true, attribute: 'confirm-classes' },
		cancelText: { type: String, reflect: true, attribute: 'cancel-text' },
		cancelClasses: { type: String, reflect: true, attribute: 'cancel-classes' }
	};

	constructor() {
		super();
		this.opened = false;
		this.closeBtn = true;
		this.overlayClose = true;
		this.confirmText = '';
		this.confirmClasses = 'success ml';
		this.cancelText = '';
		this.cancelClasses = '';
		this.confirmAction = () => {};
		this.cancelAction = () => {};
		this.closeCallback = () => {};
		this.previousFocus = null;
	}

	/*
		Event Handlers
	*/
	handleClick = event => {
		const { target } = event;
		const id = target.id || target.closest('[id]')?.id;
		
		if((id === 'overlay' && this.overlayClose) || id === 'close') {
			this.close();
		} else if(id === 'cancel') {
			this.cancelAction(event);
			if(!event.defaultPrevented) this.close();
		} else if(id === 'confirm') {
			this.confirmAction(event);
			if(!event.defaultPrevented) this.close();
		}
	}

	handleKeydown = event => {
		if(event.keyCode === 27) {
			this.close();
		}
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('keydown', this.handleKeydown);
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('opened')) {
			this.dispatchEvent(new CustomEvent(this.opened ? 'opened' : 'close'));
		}
	}

	/*
		Public Methods
	*/
	open() {
		this.opened = true;
		window.addEventListener('keydown', this.handleKeydown);
		
		// Use updateComplete or setTimeout as fallback
		const updatePromise = this.updateComplete || this.requestUpdate();
		if(updatePromise && updatePromise.then) {
			updatePromise.then(() => {
				const toFocus = this.shadowRoot.querySelector('[autofocus]') || firstFocusable(this.shadowRoot);
				if(toFocus) toFocus.focus();
			});
		} else {
			// Fallback for when updateComplete/requestUpdate don't return a promise
			setTimeout(() => {
				const toFocus = this.shadowRoot.querySelector('[autofocus]') || firstFocusable(this.shadowRoot);
				if(toFocus) toFocus.focus();
			}, 0);
		}
	}

	close() {
		this.opened = false;
		this.blur();
		this.closeCallback();
		window.removeEventListener('keydown', this.handleKeydown);
	}

	toggle() {
		this.opened ? this.close() : this.open();
	}

	focus() {
		const firstFocus = firstFocusable(this.shadowRoot);
		if(firstFocus) {
			this.previousFocus = document.activeElement;
			firstFocus.focus();
		}
	}

	blur() {
		if(this.previousFocus) {
			this.previousFocus.focus();
		}
	}

	/*
		Private Methods
	*/
	hasTitle() {
		return !!this.querySelector('[slot="title"]');
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 100;
			display: none;
			justify-content: center;
			align-items: center;
		}
		:host([opened]) {
			display: flex;
		}
		#overlay {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: var(--c_overlay);
			border: 0px solid transparent;
			box-shadow: 0 0 0 transparent;
		}
		#wrapper {
			position: relative;
			z-index: 1;
			pointer-events: none;
		}
		#dialog {
			display: flex;
			flex-direction: column;
			min-width: var(--min_width, 20rem);
			width: var(--width, fit-content);
			max-width: var(--max_width, calc(100vw - 4rem));
			min-height: var(--min_height, 12rem);
			height: var(--height, fit-content);
			max-height: var(--max_height, calc(100vh - 4rem));
			background-color: var(--c_bg);
			box-shadow: var(--drop_shadow);
			border-radius: var(--radius);
			pointer-events: all;
		}
		#header {
			display: flex;
			align-items: center;
		}
		#header.has-title {
			border-bottom: 1px solid var(--c_border);
		}
		#title {
			flex: 1 1 auto;
		}
		#close {
			border: 0px;
			background: transparent;
			box-shadow: 0 0 0 transparent;
			color: var(--tc);
		}
		#close k-icon {
			pointer-events: none;
		}
		#body {
			flex: 1 1 auto;
		}
		#footer {
			display: flex;
			justify-content: flex-end;
			padding: var(--spacer_h);
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`
			<button id="overlay" aria-label="Close the Dialog" @click=${this.handleClick}></button>
			<div id="wrapper">
				<div
					id="dialog"
					role="dialog"
					aria-modal="true"
					aria-labelledby="title"
				>
					<div
						id="header"
						class="${this.hasTitle() ? 'has-title' : ''}"
					>
						<div id="title">
							<slot name="title"></slot>
						</div>
						${this.closeBtn ? html`
							<button id="close" @click=${this.handleClick}>
								<k-icon name="close"></k-icon>
							</button>
						` : ''}
					</div>
					<div id="body">
						<slot></slot>
					</div>
					${this.cancelText || this.confirmText ? html`
						<div id="footer">
							${this.cancelText ? html`
								<button id="cancel" class="${this.cancelClasses}" @click=${this.handleClick}>
									${this.cancelText}
								</button>
							` : ''}
							${this.confirmText ? html`
								<button id="confirm" class="${this.confirmClasses}" @click=${this.handleClick}>
									${this.confirmText}
								</button>
							` : ''}
						</div>
					` : ''}
				</div>
			</div>
		`;
	}

	/*
		Static Methods
	*/
	static create(contents = '', options = {}) {
		if(options.closeExisting !== false) {
			document.querySelectorAll('k-dialog').forEach(d => d.close());
		}

		const {
			removeOnClose = true,
			closeCallback = () => {}
		} = options;

		const dialog = new Dialog();
		
		// Set properties
		Object.assign(dialog, {
			opened: true,
			...options,
			closeCallback: (...args) => {
				if(removeOnClose) {
					dialog.remove();
				}
				closeCallback(...args);
			}
		});

		// Set content
		if(contents instanceof HTMLElement || contents instanceof DocumentFragment) {
			dialog.appendChild(contents);
		} else if(contents) {
			dialog.innerHTML = contents;
		}

		// Set CSS custom properties for dimensions
		if(options.width) dialog.style.setProperty('--width', options.width);
		if(options.minWidth) dialog.style.setProperty('--min_width', options.minWidth);
		if(options.maxWidth) dialog.style.setProperty('--max_width', options.maxWidth);
		if(options.height) dialog.style.setProperty('--height', options.height);
		if(options.minHeight) dialog.style.setProperty('--min_height', options.minHeight);
		if(options.maxHeight) dialog.style.setProperty('--max_height', options.maxHeight);

		document.body.appendChild(dialog);
		dialog.open();
		
		return dialog;
	}

	static confirm(text, responseCallback, options = {}) {
		const title = options.title || 'Confirm';
		return Dialog.create(`
			<h5 slot="title" class="pyh px m0">${title}</h5>
			<p class="p">${text}</p>
		`, {
			closeBtn: false,
			overlayClose: false,
			confirmText: 'Yes',
			confirmClasses: 'success ml',
			confirmAction: () => responseCallback(true),
			cancelText: 'No',
			cancelClasses: 'danger',
			cancelAction: () => responseCallback(false),
			...options
		});
	}

	static alert(text, responseCallback, options = {}) {
		const title = options.title || 'Alert';
		return Dialog.create(`
			<h5 slot="title" class="pyh px m0">${title}</h5>
			<p class="p">${text}</p>
		`, {
			closeCallback: responseCallback,
			cancelText: 'Ok',
			...options
		});
	}

	static error(text, responseCallback, options = {}) {
		const title = options.title || 'Error';
		return Dialog.create(`
			<h5 slot="title" class="pyh px m0 tc-danger">${title}</h5>
			<p class="p">${text}</p>
		`, {
			closeCallback: responseCallback,
			cancelText: 'Ok',
			...options
		});
	}

	static success(text, responseCallback, options = {}) {
		const title = options.title || 'Success';
		return Dialog.create(`
			<h5 slot="title" class="pyh px m0 tc-success">${title}</h5>
			<p class="p">${text}</p>
		`, {
			closeCallback: responseCallback,
			cancelText: 'Ok',
			...options
		});
	}
}

customElements.define('k-dialog', Dialog);
