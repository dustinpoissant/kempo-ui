import r from"./Control.js";import{html as e,css as t}from"../../lit-all.min.js";import"../Icon.js";import"../Dropdown.js";import{bound as o}from"../../utils/number.js";export default class n extends r{static requires=["replaceSelection"];static hostMode="write";handleDropdownOpened=()=>{requestAnimationFrame(()=>{const r=this.shadowRoot.querySelector(".tbl-cols");r&&(r.value="3",r.select());const e=this.shadowRoot.querySelector(".tbl-rows");e&&(e.value="2")})};handleFormKeydown=r=>{"Enter"===r.key?(r.preventDefault(),this.submit()):"Escape"===r.key&&this.shadowRoot.querySelector("k-dropdown")?.close()};submit(){const r=this.clamp(this.shadowRoot.querySelector(".tbl-cols").value,1,20),e=this.clamp(this.shadowRoot.querySelector(".tbl-rows").value,1,50);r&&e&&(this.host?.replaceSelection?.(this.buildTable(r,e),{selectInserted:!1}),this.shadowRoot.querySelector("k-dropdown")?.close())}clamp(r,e,t){const n=parseInt(r,10);return Number.isFinite(n)?o(n,e,t):0}buildTable(r,e){const t=Array.from({length:r},(r,e)=>` Header ${e+1} `).join("|"),o=Array.from({length:r},()=>" --- ").join("|"),n=Array.from({length:r},()=>"   ").join("|");return`\n${[`|${t}|`,`|${o}|`,...Array.from({length:e},()=>`|${n}|`)].join("\n")}\n`}render(){return e`
      <k-dropdown @opened=${this.handleDropdownOpened}>
        <button slot="trigger" type="button" class="no-btn trigger" title="Table"><k-icon name="table"></k-icon></button>
        <div class="tbl-form" @keydown=${this.handleFormKeydown}>
          <input class="tbl-cols" type="number" min="1" max="20" inputmode="numeric" aria-label="Columns" value="3" />
          <span class="tbl-x" aria-hidden="true">×</span>
          <input class="tbl-rows" type="number" min="1" max="50" inputmode="numeric" aria-label="Rows" value="2" />
          <button type="button" class="primary" @click=${()=>this.submit()}>Insert</button>
        </div>
      </k-dropdown>
    `}static styles=[r.styles,t`
      :host { border: 1px solid var(--c_border); border-radius: var(--radius); margin: var(--spacer_q); }
      .trigger { min-width: 2.5rem; min-height: 2.5rem; background: transparent; border: none; border-radius: var(--radius); cursor: pointer; }
      .trigger:hover { background: oklch(from var(--c_bg__inv) l c h / 0.15); }
      .tbl-form { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem; }
      .tbl-form input { width: 2.5rem; padding: 0.35rem 0.4rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit; text-align: center; -moz-appearance: textfield; }
      .tbl-form input::-webkit-inner-spin-button,
      .tbl-form input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      .tbl-x { color: var(--tc_muted); font-weight: bold; }
      .tbl-form button.primary { padding: 0.4rem 0.8rem; border: 1px solid var(--c_primary); border-radius: var(--radius); background: var(--c_primary); color: white; cursor: pointer; font: inherit; }
    `]}customElements.define("kc-md-table",n);