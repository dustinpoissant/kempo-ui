import t from"./Control.js";import{html as e,css as s}from"../../lit-all.min.js";import"../Icon.js";const a=["javascript","typescript","html","css","json","markdown","python","java","csharp","cpp","go","rust","php","ruby","sql","xml","yaml","shell","plaintext"];export default class l extends t{static requires=["setLanguage"];static hostMode="code";static hostEvents=["language-changed"];static properties={...t.properties,value:{type:String,state:!0}};constructor(){super(),this.value="javascript"}connectedCallback(){super.connectedCallback(),this.host&&(this.value=this.host.language||"javascript")}willUpdate(t){super.willUpdate?.(t),this.host&&(this.value=this.host.language||"javascript")}handleChange=t=>{this.invokeHost("setLanguage",t.target.value)};static styles=[t.styles,s`
      :host {
        align-items: center;
        padding: 0 0.25rem;
        gap: 0.25rem;
      }
    `];render(){return e`
      <select .value=${this.value} @change=${this.handleChange} title="Language">
        ${a.map(t=>e`
          <option value="${t}" ?selected=${this.value===t}>${t}</option>
        `)}
      </select>
    `}}customElements.define("kc-language",l);