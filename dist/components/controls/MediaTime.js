import t from"./Control.js";import{html as e,css as s}from"../../lit-all.min.js";import i from"../../utils/formatDuration.js";export default class a extends t{static requires=[];static hostEvents=["timeupdate","loadedmetadata","seeked"];render(){return e`<span class="time">${i(this.host?.currentTime??0)}</span>`}static styles=[t.styles,s`
      .time { padding: 0 0.15rem; white-space: nowrap; font-variant-numeric: tabular-nums; }
      :host([in-menu]) .time { padding: 0; }
    `]}customElements.define("kc-media-time",a);