import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';
import { boolExists } from '../utils/propConverters.js';

export default class Progress extends ShadowComponent {
	static properties = {
		percentage: { type: String },
		offset: { type: String },
		color: { type: String },
		label: { type: Boolean, converter: boolExists },
		indeterminate: { type: String, reflect: true }
	};

	constructor() {
		super();
		this.percentage = '25';
		this.offset = '0';
		this.color = 'var(--c_primary)';
		this.indeterminate = null;
	}
	
	/*
		Public Members
	*/
	get bars(){
		const percentages = (this.percentage||'25').split('|').map(p=>p.trim());
		const offsets = (this.offset||0).split('|').map(o=>o.trim());
		const colors = (this.color||'var(--c_primary)').split('|').map(c=>c.trim());
		return percentages.map( (percentage, i) => {
			let offset = offsets[0];
			if(offsets.length > i) offset = offsets[i];
			let color = colors[0];
			if(colors.length > i) color = colors[i];
			return {
				percentage,
				offset,
				color
			}
		});
	}

	/*
		Rendering
	*/
	render() {
		const [{color}] = this.bars;
		if(this.indeterminate !== null) return html`
			<div id="bar1" class="bar indeterminate" style="background:${color};animation-duration:${this.indeterminate||'2s'}"></div>
			<div id="bar2" class="bar indeterminate" style="background:${color};animation-duration:${this.indeterminate||'2s'}"></div>
		`;
		return html`${
			this.bars.map(({
				percentage,
				offset,
				color
			}) => html`
				<div 
					class="bar"
					style="left:${offset}%;width:${percentage}%;background:${color}"
				>
					${this.label?html`<div class="label">${percentage}%</div>`:''}
				</div>
			`)
		}`;
	}

	/*
		Styles
	*/
	static styles = css`
		:host {
			--radius: 99999px;
			
			display: block;
			height: 1rem;
			width: 100%;
			background-color: var(--c_border);
			position: relative;
			overflow: hidden;
			color: var(--tc_on_primary);
			font-size: 0.75rem;
			border-radius: var(--radius);
		}

		.bar {
			display: flex;
			align-items: center;
			height: 100%;
			transition: width 0.3s ease;
			position: absolute;
			left: 0;
			border-radius: var(--radius);
		}
		.label {
			padding: 0 var(--spacer);
		}

		:host([indeterminate]) .bar {
			width: 25%;
			transition: none;
		}
		:host([indeterminate]) #bar1 {
			animation-name: indeterminate-bar1;
			animation-timing-function: linear;
			animation-iteration-count: infinite;
		}
		:host([indeterminate]) #bar2 {
			animation-name: indeterminate-bar2;
			animation-timing-function: linear;
			animation-iteration-count: infinite;
		}

		@keyframes indeterminate-bar1 {
			0% {
				left: 0%;
			}
			100% {
				left: 100%;
			}
		}
		@keyframes indeterminate-bar2 {
			0% {
				left: 0%;
				opacity: 1;
			}
			74% {
				opacity: 1;
			}
			75% {
				left: 75%;
				opacity: 0;
			}
			76% {
				left: -24%;
				opacity: 0;
			}
			76.5% {
				opacity: 1;
			}
			100% {
				left: 0%;
				opacity: 1;
			}
		}
	`;
}

customElements.define('k-progress', Progress);