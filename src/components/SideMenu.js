import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';
import { boolTrueFalse } from '../utils/propConverters.js';
import './FocusCapture.js';

export default class SideMenu extends ShadowComponent {
	/*
		Properties
	*/
	static properties = {
		opened: { type: Boolean, reflect: true },
		overlayClose: { type: Boolean, reflect: true, attribute: 'overlay-close', converter: boolTrueFalse },
		side: { type: String, reflect: true }
	};

	constructor() {
		super();
		this.opened = false;
		this.overlayClose = true;
		this.side = 'left';
	}

	/*
		Event Handlers
	*/
	overlayClick = () => {
		if(this.overlayClose) this.close();
	}

	/*
		Lifecycle Callbacks
	*/
	updated(changedProperties) {
		super.updated(changedProperties);
		
		if(changedProperties.has('opened')) {
			if(this.opened) {
				this.dispatchEvent(new CustomEvent('change', { detail: 'open' }));
				this.dispatchEvent(new CustomEvent('open'));
			} else {
				this.dispatchEvent(new CustomEvent('change', { detail: 'close' }));
				this.dispatchEvent(new CustomEvent('close'));
			}
		}
	}

	/*
		Methods
	*/
	open() {
		this.opened = true;
	}

	close() {
		this.opened = false;
	}

	toggle() {
		this.opened ? this.close() : this.open();
		this.dispatchEvent(new CustomEvent('toggle'));
	}

	/*
		Rendering
	*/
	render() {
		return html`
			<k-focus-capture>
				<div id="container">
					<button id="overlay" @click=${this.overlayClick}>
						<div id="overlay-x">âœ•</div>
					</button>
					<div id="menu">
						<slot></slot>
					</div>
				</div>
			</k-focus-capture>
		`;
	}
	static styles = css`
		:host {
			--bg: var(--c_bg);
			--width: 20rem;

			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			max-width: 100%;
			height: 100vh;
			z-index: 100;
			pointer-events: none;
		}
		:host([opened]) {
			pointer-events: auto;
		}
		k-focus-capture {
			width: 100%;
			height: 100%;
		}
		#container {
			position: relative;
			width: 100%;
			height: 100%;
			opacity: 0;
			transition: opacity var(--animation_ms, 256ms);
		}
		:host([opened]) #container {
			opacity: 1;
		}
		#overlay {
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			background: var(--overlay, rgba(0, 0, 0, 0.5));
			border: none;
			padding: 0;
			cursor: pointer;
			z-index: 1;
		}
		#overlay-x {
			position: absolute;
			top: var(--spacer_h);
			right: var(--spacer_h);
			font-size: 1.75rem;
			cursor: pointer;
			color: var(--tc_light);
		}
		:host([overlay-close="false"]) #overlay-x {
			display: none;
		}
		:host([overlay-close="false"]) #overlay {
			cursor: default;
		}
		#menu {
			position: absolute;
			width: var(--width);
			max-width: calc(100vw - 6rem);
			height: 100vh;
			overflow-y: auto;
			left: calc(var(--width) * -1);
			top: 0;
			background: var(--bg);
			transition: left var(--animation_ms, 256ms);
			padding: var(--menu_padding, var(--spacer));
			z-index: 2;
		}
		:host([opened]) #menu {
			left: 0;
		}
		:host([side="right"]) #menu {
			left: auto;
			transition: right var(--animation_ms, 256ms);
			right: calc(var(--width) * -1);
		}
		:host([opened][side="right"]) #menu {
			right: 0;
		}
		:host([side="right"]) #overlay-x {
			right: auto;
			left: var(--spacer_h);
		}
	`;
}
window.customElements.define('k-side-menu', SideMenu);