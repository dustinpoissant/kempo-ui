import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { bound } from '../utils/number.js';
import './Icon.js';

const STAR_COUNT = 5;

export default class Rating extends ShadowComponent {
	static formAssociated = true;

	static properties = {
		value: { type: Number, reflect: true },
		name: { type: String, reflect: true },
		disabled: { type: Boolean, reflect: true },
		hoverValue: { type: Number, state: true }
	};

	constructor() {
		super();
		this.internals = this.attachInternals();
		this.value = 0;
		this.name = '';
		this.disabled = false;
		this.hoverValue = null;
		this.initialValue = 0;
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		this.initialValue = this.value;
		const form = this.closest('form');
		if(form) {
			form.addEventListener('reset', this.handleReset);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		const form = this.closest('form');
		if(form) {
			form.removeEventListener('reset', this.handleReset);
		}
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if(changedProperties.has('value')) {
			this.internals.setFormValue(String(this.value));
			this.dispatchEvent(new CustomEvent('change', {
				detail: { value: this.value },
				bubbles: true
			}));
		}
	}

	/*
		Event Handlers
	*/
	handleReset = () => {
		this.value = this.initialValue;
	};

	handleStarClick = (rank) => {
		if(this.disabled) return;
		this.value = bound(rank, 0, STAR_COUNT);
	};

	handleStarEnter = (rank) => {
		if(this.disabled) return;
		this.hoverValue = rank;
	};

	handleMouseLeave = () => {
		this.hoverValue = null;
	};

	/*
		Rendering
	*/
	render() {
		const displayValue = this.hoverValue ?? this.value;
		return html`
			<div id="stars" @mouseleave=${this.handleMouseLeave}>
				${Array.from({ length: STAR_COUNT }, (_, i) => {
					const rank = i + 1;
					const filled = rank <= displayValue;
					return html`
						<button
							type="button"
							class="no-btn star${filled ? ' filled' : ''}"
							?disabled=${this.disabled}
							aria-label="Rate ${rank} of ${STAR_COUNT}"
							?aria-pressed=${filled}
							@click=${() => this.handleStarClick(rank)}
							@mouseenter=${() => this.handleStarEnter(rank)}
						><k-icon name=${filled ? 'star_filled' : 'star'}></k-icon></button>
					`;
				})}
			</div>
		`;
	}

	static styles = css`
		:host {
			--star_size: 1.5rem;
			--star_color: var(--tc_muted);
			--star_color__filled: var(--tc_primary);
			--star_gap: 0.25rem;

			display: inline-block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		#stars {
			display: flex;
			gap: var(--star_gap);
		}
		.star {
			display: flex;
			padding: 0;
			border: none;
			background: none;
			color: var(--star_color);
			font-size: var(--star_size);
			line-height: 1;
			cursor: pointer;
		}
		.star:focus:not(:focus-visible) {
			box-shadow: none;
		}
		.star:disabled {
			cursor: not-allowed;
		}
		.star k-icon {
			font-size: var(--star_size);
		}
		.star.filled {
			color: var(--star_color__filled);
		}
	`;
}

window.customElements.define('k-rating', Rating);
