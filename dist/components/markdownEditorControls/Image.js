import e from"./MarkdownEditorControl.js";import{html as t,css as o}from"../../lit-all.min.js";import"../Icon.js";import"../Dropdown.js";import r from"../Dialog.js";export default class i extends e{static properties={...e.properties,popup:{type:String,reflect:!0}};constructor(){super(),this.label="Image",this.popup="dropdown"}command(){"dialog"===this.popup&&this.#e()}#t(e,t){return!!e&&(this.editor?.replaceSelection(`![${t}](${e})`,{selectInserted:!1}),!0)}handleDropdownOpened=()=>{requestAnimationFrame(()=>{this.#o?.focus();const e=this.getSelection();this.#r&&(this.#r.value=e.text||"")})};handleDropdownClosed=()=>{this.#o&&(this.#o.value=""),this.#r&&(this.#r.value="")};handleFormKeydown=e=>{"Enter"===e.key?(e.preventDefault(),this.#i()):"Escape"===e.key&&this.shadowRoot?.querySelector("k-dropdown")?.close()};handleInsertClick=()=>this.#i();handleCancelClick=()=>{this.shadowRoot?.querySelector("k-dropdown")?.close()};#i(){const e=this.#o?.value.trim()||"",t=this.#r?.value.trim()||"";e?(this.#t(e,t),this.shadowRoot?.querySelector("k-dropdown")?.close()):this.#o?.focus()}get#o(){return this.shadowRoot?.querySelector(".image-url")}get#r(){return this.shadowRoot?.querySelector(".image-alt")}#e(){if(!this.editor)return;const e=this.getSelection(),t=document.createElement("input");t.type="url",t.placeholder="https://example.com/image.png",t.required=!0,t.style.cssText="padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;";const o=document.createElement("input");o.type="text",o.placeholder="Description for screen readers",o.value=e.text||"",o.style.cssText="padding: 0.5rem; border: 1px solid var(--c_border); border-radius: var(--radius); font: inherit;";const i=document.createElement("div");i.className="p",i.style.cssText="display: flex; flex-direction: column; gap: 1rem;",i.innerHTML='\n      <div style="display: flex; flex-direction: column; gap: 0.25rem;">\n        <label style="font-weight: bold;">Image URL</label>\n      </div>\n      <div style="display: flex; flex-direction: column; gap: 0.25rem;">\n        <label style="font-weight: bold;">Alt text</label>\n      </div>\n    ',i.children[0].appendChild(t),i.children[1].appendChild(o),r.create(i,{title:"Insert Image",cancelText:"Cancel",confirmText:"Insert",confirmClasses:"success ml",confirmAction:e=>{const r=t.value.trim();if(!r)return e.keepDialogOpen=!0,void t.focus();this.#t(r,o.value.trim())}}),queueMicrotask(()=>t.focus())}render(){return"dialog"===this.popup?t`
        <button
          type="button"
          class=${this.btnClass}
          title=${this.label}
          aria-label=${this.label}
          @click=${this.handleClick}
        >
          <k-icon name="image"></k-icon>
        </button>
      `:t`
      <k-dropdown
        @opened=${this.handleDropdownOpened}
        @closed=${this.handleDropdownClosed}
      >
        <button
          slot="trigger"
          type="button"
          class=${this.btnClass}
          title=${this.label}
          aria-label=${this.label}
        >
          <k-icon name="image"></k-icon>
        </button>
        <div class="image-form" @keydown=${this.handleFormKeydown}>
          <label>Image URL</label>
          <input
            class="image-url"
            type="url"
            required
            placeholder="https://example.com/image.png"
          />
          <label>Alt text</label>
          <input
            class="image-alt"
            type="text"
            placeholder="Description for screen readers"
          />
          <div class="image-actions">
            <button type="button" class="no-btn" @click=${this.handleCancelClick}>Cancel</button>
            <button type="button" class="no-btn primary" @click=${this.handleInsertClick}>Insert</button>
          </div>
        </div>
      </k-dropdown>
    `}static styles=[e.styles,o`
      .image-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem;
        min-width: 16rem;
      }
      .image-form label {
        font-weight: bold;
        font-size: 0.875rem;
      }
      .image-form input {
        padding: 0.5rem;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        font: inherit;
        background: var(--c_bg);
        color: var(--tc);
      }
      .image-form input:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
      .image-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.25rem;
      }
      .image-actions button {
        padding: 0.4rem 0.8rem;
        border: 1px solid var(--c_border);
        border-radius: var(--radius);
        background: var(--c_bg);
        color: var(--tc);
        cursor: pointer;
        font: inherit;
      }
      .image-actions button.primary {
        background: var(--c_primary);
        color: white;
        border-color: var(--c_primary);
      }
      .image-actions button:focus-visible {
        outline: none;
        box-shadow: var(--focus_shadow);
      }
    `]}customElements.define("k-md-image",i);