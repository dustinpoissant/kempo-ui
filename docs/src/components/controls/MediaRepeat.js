import t from"./ButtonControl.js";import{html as e,css as o}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static requires=["toggleLoop"];static hostEvents=["loop-changed"];connectedCallback(){super.connectedCallback(),this.hasAttribute("title")||(this.title="Repeat")}updated(t){super.updated(t),this.toggleAttribute("active",!!this.host?.loop)}handleAction(){this.host?.toggleLoop?.()}render(){return e`<slot><k-icon name="repeat_one"></k-icon></slot><slot name="menu-text">Repeat</slot>`}static styles=[...t.styles,o`
      :host([active]) {
        color: var(--tc_primary);
      }
    `]}customElements.define("kc-media-repeat",s);