import t from"./Control.js";import{html as e,css as n}from"../../lit-all.min.js";import"../Icon.js";export default class s extends t{static requires=["play","seek"];static hostEvents=["play","pause","playing","ended"];handleClick=()=>{const t=this.host;t&&(t.ended&&t.seek(0),t.play())};render(){const t=this.host;return t&&t.paused?e`
      <button type="button" class="no-btn" title="${t.ended?"Replay":"Play"}" @click=${this.handleClick}>
        <k-icon name="${t.ended?"replay":"play"}"></k-icon>
      </button>
    `:e``}static styles=[t.styles,n`
      :host {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-flex;
      }
      button.no-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.55);
        border: none;
        color: #fff;
        font-size: 2.25rem;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
      }
      button.no-btn:hover {
        background: rgba(0, 0, 0, 0.75);
        transform: scale(1.08);
      }
    `]}customElements.define("kc-vid-play-big",s);