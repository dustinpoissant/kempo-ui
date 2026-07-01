import t from"./ButtonControl.js";import{html as o,css as e}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static requires=["toggleLoop"];static hostEvents=["loop-changed"];connectedCallback(){super.connectedCallback(),this.hasAttribute("title")||(this.title="Loop")}updated(t){super.updated(t),this.toggleAttribute("active",!!this.host?.loop)}handleAction(){this.host?.toggleLoop?.()}render(){return o`<slot><k-icon name="repeat"></k-icon></slot>`}static styles=[...t.styles,e`
      :host([active]) {
        color: var(--tc_primary);
      }
    `]}customElements.define("kc-vid-loop",s);