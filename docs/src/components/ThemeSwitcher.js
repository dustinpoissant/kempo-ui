import ShadowComponent from"./ShadowComponent.js";import{html,css}from"../lit-all.min.js";import"./Icon.js";export default class ThemeSwitcher extends ShadowComponent{static properties={currentTheme:{type:String,reflect:!0,attribute:"current-theme"}};constructor(){super(),this.currentTheme=ThemeSwitcher.getCurrentTheme()}handleClick=()=>{const e=ThemeSwitcher.getCurrentTheme();"auto"===e&&ThemeSwitcher.setTheme("light"),"light"===e&&ThemeSwitcher.setTheme("dark"),"dark"===e&&ThemeSwitcher.setTheme("auto")};handleStorageChange=()=>{this.currentTheme=ThemeSwitcher.getCurrentTheme()};connectedCallback(){super.connectedCallback(),window.addEventListener("storage",this.handleStorageChange)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("storage",this.handleStorageChange)}static styles=css`
		:host {
			--padding: var(--spacer);
			display: flex;
		}
		button {
			padding: var(--padding);
		}
	`;render(){const e="auto"===this.currentTheme?"mode-auto":"light"===this.currentTheme?"mode-light":"mode-dark";return html`
			<button
				class="no-btn"
				@click=${this.handleClick}
			>
				<k-icon name=${e}></k-icon>
			</button>
		`}static styles=css`
		:host {
			--padding: var(--spacer, 1rem);
		}
		button.no-btn {
			padding: var(--padding);
		}
	`;static setTheme(e){localStorage.setItem("theme",e),document.documentElement.setAttribute("theme",e),window.dispatchEvent(new StorageEvent("storage",{key:"theme",newValue:e}))}static getCurrentTheme(){let e=document.documentElement.getAttribute("theme");return e||(e=localStorage.getItem("theme")),e||"auto"}}const colorSchemeQuery=window.matchMedia("(prefers-color-scheme: dark)"),colorSchemeChangeHandler=e=>document.documentElement.setAttribute("auto-theme",e.matches?"dark":"light");colorSchemeQuery.addEventListener("change",colorSchemeChangeHandler),colorSchemeChangeHandler(colorSchemeQuery),ThemeSwitcher.setTheme(ThemeSwitcher.getCurrentTheme()),customElements.define("k-theme-switcher",ThemeSwitcher);