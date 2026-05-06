import t from"./MarkdownEditorControl.js";import{html as e,css as r}from"../../lit-all.min.js";import"../Icon.js";import"../Dropdown.js";import{bound as o}from"../../utils/number.js";export default class n extends t{constructor(){super(),this.label="Table"}command(){}handleDropdownOpened=()=>{requestAnimationFrame(()=>{const t=this.shadowRoot?.querySelector(".tbl-cols");t&&(t.value="3",t.select());const e=this.shadowRoot?.querySelector(".tbl-rows");e&&(e.value="2")})};handleFormKeydown=t=>{"Enter"===t.key?(t.preventDefault(),this.#t()):"Escape"===t.key&&this.shadowRoot?.querySelector("k-dropdown")?.close()};handleInsertClick=()=>this.#t();#t(){const t=this.#e(this.shadowRoot?.querySelector(".tbl-cols")?.value,1,20),e=this.#e(this.shadowRoot?.querySelector(".tbl-rows")?.value,1,50);if(!t||!e)return;const r=this.editor;r&&(r.replaceSelection(this.#r(t,e),{selectInserted:!1}),this.shadowRoot?.querySelector("k-dropdown")?.close())}#e(t,e,r){const n=parseInt(t,10);return Number.isFinite(n)?o(n,e,r):0}#r(t,e){const r=Array.from({length:t},(t,e)=>` Header ${e+1} `).join("|"),o=Array.from({length:t},()=>" --- ").join("|"),n=Array.from({length:t},()=>"   ").join("|");return`\n${[`|${r}|`,`|${o}|`,...Array.from({length:e},()=>`|${n}|`)].join("\n")}\n`}render(){return e`
      <k-dropdown @opened=${this.handleDropdownOpened}>
        <button
          slot="trigger"
          type="button"
          class=${this.btnClass}
          title=${this.label}
          aria-label=${this.label}
        >
          <k-icon name="table"></k-icon>
        </button>
        <div class="tbl-form" @keydown=${this.handleFormKeydown}>
          <input
            class="tbl-cols"
            type="number"
            min="1"
            max="20"
            inputmode="numeric"
            aria-label="Columns"
            value="3"
          />
          <span class="tbl-x" aria-hidden="true">×</span>
          <input
            class="tbl-rows"
            type="number"
            min="1"
            max="50"
            inputmode="numeric"
            aria-label="Rows"
            value="2"
          />
          <button type="button" class="primary" @click=${this.handleInsertClick}>Insert</button>
        </div>
      </k-dropdown>
    `}static styles=[t.styles,r`
      .tbl-form {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem;
      }
      .tbl-form input {
        width: 2.5rem;
        padding: 0.35rem 0.4rem;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        font: inherit;
        background: var(--c_bg);
        color: var(--tc);
        text-align: center;
        /* Hide the up/down spinner buttons that take up extra width. */
        -moz-appearance: textfield;
      }
      .tbl-form input::-webkit-inner-spin-button,
      .tbl-form input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .tbl-form input:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
      .tbl-x {
        color: var(--tc_muted);
        font-weight: bold;
      }
      .tbl-form button.primary {
        padding: 0.4rem 0.8rem;
        border: 1px solid var(--c_primary);
        border-radius: var(--radius);
        background: var(--c_primary);
        color: white;
        cursor: pointer;
        font: inherit;
      }
      .tbl-form button.primary:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
    `]}customElements.define("k-md-table",n);