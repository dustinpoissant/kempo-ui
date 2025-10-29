import { LitElement, html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import Icon from './Icon.js';
import { boolExists } from '../utils/propConverters.js';

export default class ShowMore extends ShadowComponent {
	/* Properties */
	static properties = {
		opened: { type: Boolean, converter: boolExists, reflect: true }
	};

	/*
		Lifecycle Callbacks
	*/
	constructor() {
		super();
		this.opened = false;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('opened')) {
			this.dispatchEvent(new CustomEvent('change', {
				detail: { opened: this.opened }
			}));
			this.dispatchEvent(new CustomEvent(this.opened ? 'opened' : 'closed'));
		}
	}

	/*
		Event Handlers
	*/
	handleToggleClick = () => {
		this.toggle();
	};

	/*
		Public Methods
	*/
	more() {
		this.opened = true;
	}

	less() {
		this.opened = false;
	}

	toggle() {
		this.opened = !this.opened;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			--closed_height: 7rem;
			
			display: block;
		}
		:host(:not([opened])) #content {
			height: var(--closed_height);
			overflow-y: hidden;
		}
		:host(:not([opened])) #content {
			margin-bottom: calc(var(--closed_height) * -0.9);
		}
		:host(:not([opened])) #toggle {
			padding-top: calc(var(--closed_height) - 2rem);
			background: linear-gradient(to bottom, transparent 0%, var(--c_bg) 95%);
		}
		#toggle {
			width: 100%;
			padding: var(--spacer_h);
			text-align: center;
			background: var(--c_bg);
		}
		:host([opened]) #more,
		:host(:not([opened])) #less {
			display: none;
		}
	`;

	/*
		Rendering
	*/
	render() {
		return html`
			<div id="wrapper">
				<div id="content">
					<slot></slot>
				</div>
				<button id="toggle" @click=${this.handleToggleClick} class="no-btn">
					<span id="more">
						<slot name="more">Show More <k-icon name="arrow-down-double"></k-icon></slot>
					</span>
					<span id="less">
						<slot name="less">Show Less <k-icon name="arrow-up-double"></k-icon></slot>
					</span>
				</button>
			</div>
		`;
	}
}

customElements.define('k-show-more', ShowMore);
