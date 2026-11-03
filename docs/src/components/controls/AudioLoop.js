import t from"./ButtonControl.js";import{html as o,css as e}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static requires=["togglePlaylistLoop"];static hostEvents=["playlist-loop-changed"];connectedCallback(){super.connectedCallback(),this.hasAttribute("title")||(this.title="Loop playlist")}updated(t){super.updated(t),this.toggleAttribute("active",!!this.host?.playlistLoop)}handleAction(){this.host?.togglePlaylistLoop?.()}render(){return o`<slot><k-icon name="repeat"></k-icon></slot><slot name="menu-text">Loop playlist</slot>`}static styles=[...t.styles,e`
      :host([active]) {
        color: var(--tc_primary);
      }
    `]}customElements.define("kc-audio-loop",s);