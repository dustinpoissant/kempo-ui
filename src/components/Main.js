import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class Main extends ShadowComponent {
	constructor() {
		super();
		this.widthMap = new Map();
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('aside_state_change', this.handleAsideChange);

		document.querySelectorAll('k-aside[main="push"]').forEach(aside => {
			if(aside.state !== 'offscreen' && typeof aside.getTargetWidth === 'function') {
				const width = aside.getTargetWidth(aside.state);
				if(width > 0) {
					this.widthMap.set(aside, { side: aside.side || 'left', width });
				}
			}
		});

		this.recalculate();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('aside_state_change', this.handleAsideChange);
	}

	/*
		Event Handlers
	*/
	handleAsideChange = (event) => {
		const { aside, state, main, width } = event.detail;
		if(main === 'overlay' || state === 'offscreen') {
			this.widthMap.delete(aside);
		} else {
			this.widthMap.set(aside, { side: aside.side || 'left', width });
		}
		this.recalculate();
	}

	recalculate = () => {
		let maxLeft = 0;
		let maxRight = 0;
		for(const [, { side, width }] of this.widthMap) {
			if(side === 'right') {
				maxRight = Math.max(maxRight, width);
			} else {
				maxLeft = Math.max(maxLeft, width);
			}
		}
		this.style.setProperty('--left-panel-width', `${maxLeft}px`);
		this.style.setProperty('--right-panel-width', `${maxRight}px`);
	}

	/*
		Rendering
	*/
	render() {
		return html`
			<main>
				<slot></slot>
			</main>
		`;
	}

	static styles = css`
		:host {
			display: block;
			margin-left: var(--left-panel-width, 0px);
			margin-right: var(--right-panel-width, 0px);
			transition: margin-left var(--animation_ms, 256ms), margin-right var(--animation_ms, 256ms);
		}
		main {
			max-width: var(--container_width, 90rem);
			margin-left: auto;
			margin-right: auto;
			padding-top: var(--spacer);
			padding-left: var(--spacer);
			padding-right: var(--spacer);
		}
	`;
}

window.customElements.define('k-main', Main);
