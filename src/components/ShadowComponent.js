import { LitElement } from '../lit-all.min.js';

export default class ShadowComponent extends LitElement {

    #childrenObserver;

    connectedCallback() {
        super.connectedCallback();

        this.#childrenObserver = new MutationObserver(() => {
            this.childrenUpdated();
            this.requestUpdate();
        });

        this.#childrenObserver.observe(this, {
            childList: true,
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#childrenObserver?.disconnect();
    }

    childrenUpdated() {}

    createRenderRoot() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = window.kempo?.pathToStylesheet || 'https://cdn.jsdelivr.net/npm/kempo-css@2/dist/kempo.min.css';
        shadowRoot.appendChild(link);
        
        // Inject component styles if they exist
        const styles = this.constructor.styles;
        if (styles) {
            const styleEl = document.createElement('style');
            if (Array.isArray(styles)) {
                /*
                  A subclass whose own `static styles` wraps a parent's `static styles` — e.g.
                  `[ButtonControl.styles, css\`...\`]` where ButtonControl.styles is itself
                  `[Control.styles, css\`...\`]` — produces an array nested one level deep. Without
                  flattening first, `.map(s => s.cssText || s)` leaves that inner array as a raw
                  array (arrays have no `.cssText`), and `.join('\n')` then stringifies it via
                  JS's default Array.prototype.toString, which joins its own elements with a bare
                  `,` instead of a newline. A `,` sitting between two closed `}` blocks is not valid
                  CSS anywhere a rule is expected, so the browser's parser treats it as the start of
                  a broken selector list and silently drops the entire next rule — every property in
                  it, not just one. `.flat(Infinity)` first means it doesn't matter how many layers
                  of "wrap the parent's styles" a subclass chain adds.
                */
                styleEl.textContent = styles.flat(Infinity).map(s => s.cssText || s).join('\n');
            } else {
                styleEl.textContent = styles.cssText || styles;
            }
            shadowRoot.appendChild(styleEl);
        }
        
        const renderContainer = document.createElement('div');
        renderContainer.style.display = 'contents';
        shadowRoot.appendChild(renderContainer);
        
        return renderContainer;
    }
}
