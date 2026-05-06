import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import { boolTrueFalse } from '../utils/propConverters.js';
import './Icon.js';
import { bound } from '../utils/number.js';

export default class ContentSlider extends ShadowComponent {
	/* Properties */
	static properties = {
		index: { type: Number, reflect: true },
		controls: { type: Boolean, reflect: true, converter: boolTrueFalse },
		globalControls: { type: Boolean, reflect: true, attribute: 'global-controls', converter: boolTrueFalse },
		keyboardControls: { type: Boolean, reflect: true, attribute: 'keyboard-controls', converter: boolTrueFalse },
		loop: { type: Boolean, reflect: true, converter: boolTrueFalse }
	};

	constructor() {
		super();
		this.index = 0;
		this.controls = true;
		this.globalControls = false;
		this.keyboardControls = true;
		this.loop = false;
		this.content = [];
		this.tabIndex = 0;
	}

	/*
		Event Handlers
	*/
	handlePrevClick = () => {
		this.previous();
	}

	handleNextClick = () => {
		this.next();
	}

	handleKeydown = event => {
		if(event.code === 'ArrowLeft') {
			event.preventDefault();
			this.dispatchEvent(new CustomEvent('keyleft'));
			this.previous();
		} else if(event.code === 'ArrowRight') {
			event.preventDefault();
			this.dispatchEvent(new CustomEvent('keyright'));
			this.next();
		}
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.updateContent();
		this.setupKeyboardControls();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeKeyboardControls();
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('index')) {
			this.validateAndSetIndex();
			this.renderContent();
			this.dispatchEvent(new CustomEvent('change', { detail: { index: this.index } }));
		}

		if(changedProperties.has('keyboardControls') || changedProperties.has('globalControls')) {
			this.removeKeyboardControls();
			this.setupKeyboardControls();
		}
	}

	/*
		Private Methods
	*/
	updateContent() {
		this.content = [...this.querySelectorAll(':scope > *')];
		this.validateAndSetIndex();
		this.renderContent();
	}

	validateAndSetIndex() {
		if(this.content.length === 0) return;
		
		const validIndex = bound(this.index, 0, this.content.length - 1);
		if(this.index !== validIndex) {
			this.index = validIndex;
		}
	}

	renderContent() {
		if(this.content.length === 0) return;
		
		this.innerHTML = '';
		if(this.content[this.index]) {
			this.appendChild(this.content[this.index]);
		}
	}

	setupKeyboardControls() {
		if(this.keyboardControls) {
			if(this.globalControls) {
				window.addEventListener('keydown', this.handleKeydown);
			} else {
				this.addEventListener('keydown', this.handleKeydown);
			}
		}
	}

	removeKeyboardControls() {
		window.removeEventListener('keydown', this.handleKeydown);
		this.removeEventListener('keydown', this.handleKeydown);
	}

	/*
		Public Methods
	*/
	previous() {
		let newIndex = this.index - 1;
		if(this.loop && newIndex < 0) {
			newIndex = this.content.length - 1;
		}
		this.dispatchEvent(new CustomEvent('previous', { detail: { index: newIndex } }));
		this.index = newIndex;
	}

	next() {
		let newIndex = this.index + 1;
		if(this.loop && newIndex >= this.content.length) {
			newIndex = 0;
		}
		this.dispatchEvent(new CustomEvent('next', { detail: { index: newIndex } }));
		this.index = newIndex;
	}

	goto(newIndex) {
		this.dispatchEvent(new CustomEvent('goto', { detail: { index: newIndex } }));
		this.index = newIndex;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			display: block;
			position: relative;
			outline: none;
		}
		#prev,
		#next {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			font-size: 2rem;
		}
		#next {
			right: 0;
		}
		:host(:not([controls="true"])) #controls {
			display: none;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="content">
				<slot></slot>
			</div>
			<div id="controls">
				<button
					id="prev"
					class="no-btn"
					@click=${this.handlePrevClick}
				>
					<slot name="prev">
						<k-icon name="chevron" direction="left"></k-icon>
					</slot>
				</button>
				<button
					id="next"
					class="no-btn"
					@click=${this.handleNextClick}
				>
					<slot name="next">
						<k-icon name="chevron"></k-icon>
					</slot>
				</button>
			</div>
		`;
	}
}

customElements.define('k-content-slider', ContentSlider);
