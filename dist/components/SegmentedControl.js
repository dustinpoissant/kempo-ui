import{html as t,css as e,unsafeHTML as s}from"../lit-all.min.js";import n from"./ShadowComponent.js";class a extends n{static properties={value:{type:String,reflect:!0}};constructor(){super(),this.value=""}connectedCallback(){super.connectedCallback(),this.addEventListener("slotchange",this.handleSlotChange,!0)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("slotchange",this.handleSlotChange,!0)}updated(t){super.updated(t),t.has("value")&&this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))}handleSlotChange=()=>{this.requestUpdate()};handleButtonClick=t=>{this.value=t};getOptions=()=>Array.from(this.children).filter(t=>"K-SC-OPTION"===t.tagName);render(){const e=this.getOptions();return t`
      <div class="btn-grp">
        ${e.map(e=>{const n=e.getAttribute("value")||"",a=n===this.value;return t`
            <button
              class="${a?"primary":""}"
              @click=${()=>this.handleButtonClick(n)}
              ?aria-pressed=${a}
            >${s(e.innerHTML)}</button>
          `})}
      </div>
      <slot style="display:none;"></slot>
    `}static styles=e`
    :host {
      display: block;
    }
  `}class l extends HTMLElement{connectedCallback(){this.hasAttribute("value")||this.setAttribute("value","")}}export default a;customElements.define("k-segmented-control",a),customElements.define("k-sc-option",l);