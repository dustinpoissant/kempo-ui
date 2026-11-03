import e from"./Control.js";import{html as t,css as s,nothing as i}from"../../lit-all.min.js";export default class r extends e{static requires=[];static hostEvents=["src-changed"];render(){if(!this.host?.src)return i;const e=new URL(this.host.src,document.baseURI).href;return t`<a class="link" href="${e}" target="_blank" rel="noopener">${e}</a>`}static styles=[e.styles,s`
      :host {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
      }
      .link {
        display: block;
        min-width: 0;
        padding: 0 0.25rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: inherit;
        font: inherit;
      }
    `]}customElements.define("kc-media-link",r);