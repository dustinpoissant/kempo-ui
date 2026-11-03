import{html as t,css as e}from"../lit-all.min.js";import i from"./ControlBar.js";export default class o extends i{static nonCollapsible=`${i.nonCollapsible}, .flex`;static properties={...i.properties,fixed:{type:Boolean,reflect:!0}};constructor(){super(),this.fixed=!1}findControlHost=()=>null;render(){return t`
      <nav id="bar">
        <div class="section"><slot></slot></div>
        <div class="section" id="center"><slot name="center"></slot></div>
        <div class="section">
          <slot name="right"></slot>
          <kc-menu id="more" title="More" hidden>
            <k-icon slot="icon" name="more_vert"></k-icon>
            <div><div id="tray"><slot name="overflow"></slot></div></div>
          </kc-menu>
        </div>
      </nav>
    `}static styles=[i.styles,e`
      :host {
        display: block;
        flex: none;
        min-width: 0;
        --bar_border: transparent;
      }
      :host([fixed]) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
      }
      #bar {
        width: 100%;
      }
      .section:first-child {
        flex: 1 1 auto;
      }
      ::slotted(a) {
        display: inline-block;
        padding: var(--spacer);
        text-decoration: none !important;
      }
      ::slotted(.link) {
        display: inline-block;
        padding: var(--spacer) !important;
        text-decoration: none !important;
      }
    `]}customElements.define("k-nav",o);