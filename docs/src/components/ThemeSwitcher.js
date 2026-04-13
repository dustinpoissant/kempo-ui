import t from"./ShadowComponent.js";import{html as e,css as r}from"../lit-all.min.js";import s from"../utils/theme.js";import"./Icon.js";export default class n extends t{static properties={currentTheme:{type:String,reflect:!0,attribute:"current-theme"}};constructor(){super(),this.currentTheme=s.get()}handleClick=()=>{const t=s.get();"auto"===t&&s.set("light"),"light"===t&&s.set("dark"),"dark"===t&&s.set("auto")};connectedCallback(){super.connectedCallback(),this.unsubscribe=s.subscribe(t=>{this.currentTheme=t})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}static styles=r`
		:host {
			--padding: var(--spacer);
			display: flex;
		}
		button {
			padding: var(--padding);
		}
	`;render(){const t="auto"===this.currentTheme?"mode-auto":"light"===this.currentTheme?"mode-light":"mode-dark";return e`
			<button
				class="no-btn"
				@click=${this.handleClick}
			>
				<k-icon name=${t}></k-icon>
			</button>
		`}static styles=r`
		:host {
			--padding: var(--spacer, 1rem);
		}
		button.no-btn {
			padding: var(--padding);
			border-radius: var(--radius);
		}
	`;static setTheme(t){s.set(t)}static getCurrentTheme(){return s.get()}static getCalculatedCurrentTheme(){return s.getCalculated()}}customElements.define("k-theme-switcher",n);