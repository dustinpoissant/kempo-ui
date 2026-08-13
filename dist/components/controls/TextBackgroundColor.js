import o from"./Control.js";import{html as r,css as e}from"../../lit-all.min.js";import"../Dropdown.js";import"../Icon.js";export default class t extends o{static requires=["setTextBackgroundColor"];static hostMode="visual";static properties={...o.properties,colors:{type:String},disableRemove:{type:Boolean,attribute:"disable-remove"},disablePicker:{type:Boolean,attribute:"disable-picker"}};constructor(){super(),this.colors="#ffff00,#00ffff,#ff66ff,#99ff99,#ffcc99,#ff9999,#cccccc,#ffffff,#ffffcc,#ccffff,#ffccff,#ccffcc",this.disableRemove=!1,this.disablePicker=!1}get opened(){return this.shadowRoot?.querySelector("k-dropdown")?.opened??!1}set opened(o){const r=this.shadowRoot?.querySelector("k-dropdown");r&&(r.opened=o)}handleRemove=()=>{this.host?.removeTextBackgroundColor?.(),this.shadowRoot.querySelector("k-dropdown")?.close()};handleSwatch=o=>{const r=o.target.style.backgroundColor;if(!r)return;const e=r.match(/\d+/g),t=e?"#"+e.map(o=>parseInt(o).toString(16).padStart(2,"0")).join(""):r;this.host?.setTextBackgroundColor?.(t),this.shadowRoot.querySelector("k-dropdown")?.close()};handlePicker=o=>{this.host?.setTextBackgroundColor?.(o.target.value),this.shadowRoot.querySelector("k-dropdown")?.close()};render(){const o=this.colors.split(",").map(o=>o.trim()).filter(Boolean);return r`
      <k-dropdown>
        <button slot="trigger" class="no-btn trigger" title="Highlight Color">
          <k-icon name="format_color_fill"></k-icon>
        </button>
        <div class="content">
          ${this.disableRemove?"":r`<button class="remove" @click=${this.handleRemove}>Remove Color</button>`}
          <div class="swatches">
            ${o.map(o=>r`<button class="swatch" style="background-color:${o}" @click=${this.handleSwatch}></button>`)}
          </div>
          ${this.disablePicker?"":r`
            <div class="picker"><label>Custom:</label><input type="color" @input=${this.handlePicker} /></div>
          `}
        </div>
      </k-dropdown>
    `}static styles=[o.styles,e`
      :host { border: 1px solid var(--c_border); border-radius: var(--radius); margin: var(--spacer_q); }
      .trigger { min-width: 2.5rem; min-height: 2.5rem; background: transparent; border: none; border-radius: var(--radius); cursor: pointer; }
      .trigger:hover { background: oklch(from var(--c_bg__inv) l c h / 0.15); }
      .content { padding: 8px; min-width: 200px; }
      .remove { width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid var(--c_border); background: transparent; cursor: pointer; border-radius: var(--radius); }
      .swatches { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
      .swatch { width: 32px; height: 32px; border: 1px solid var(--c_border); cursor: pointer; border-radius: 4px; }
      .swatch:hover { box-shadow: 0 0 4px rgba(0,122,204,0.3); }
      .picker { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
      .picker input { flex: 1; height: 32px; border: 1px solid var(--c_border); border-radius: 4px; cursor: pointer; }
    `]}customElements.define("kc-text-background-color",t);