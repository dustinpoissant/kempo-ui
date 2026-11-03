import t from"./ButtonControl.js";import{html as e,css as s}from"../../lit-all.min.js";import"../Icon.js";export default class l extends t{static requires=["toggleShuffle"];static hostEvents=["shuffle-changed"];connectedCallback(){super.connectedCallback(),this.hasAttribute("title")||(this.title="Shuffle")}updated(t){super.updated(t),this.toggleAttribute("active",!!this.host?.shuffled),this.setAttribute("aria-pressed",String(!!this.host?.shuffled))}handleAction(){this.host?.toggleShuffle?.()}render(){return e`<slot><k-icon name="shuffle"></k-icon></slot><slot name="menu-text">Shuffle</slot>`}static styles=[...t.styles,s`
      :host([active]) {
        color: var(--tc_primary);
      }
    `]}customElements.define("kc-audio-shuffle",l);