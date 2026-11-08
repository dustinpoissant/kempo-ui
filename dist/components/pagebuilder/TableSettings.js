import t from"./WidgetSettings.js";import{html as s}from"../../lit-all.min.js";const e=/^(\d+(?:\.\d+)?)(%|px)$/,n=[["",""],["",""]];export default class a extends t{get rows(){const t=this.node.attrs?.rows;return Array.isArray(t)&&t.length?t:n}get columns(){return Math.max(1,...this.rows.map(t=>t.length))}get spans(){const t=this.node.attrs?.spans;return t&&"object"==typeof t?t:{}}editRows(t){this.edit(s=>{const e=t(Array.isArray(s.attrs.rows)&&s.attrs.rows.length?structuredClone(s.attrs.rows):structuredClone(n)),a=Math.max(1,...e.map(t=>t.length));return s.attrs.rows=e,s.attrs.spans&&(s.attrs.spans=Object.fromEntries(Object.entries(s.attrs.spans).filter(([t])=>{const[s,n]=t.split(".").map(Number);return s<e.length&&n<a}))),!0})}addRow(){this.editRows(t=>[...t,Array(this.columns).fill("")])}removeRow(){this.editRows(t=>t.length>1?t.slice(0,-1):t)}addColumn(){this.editRows(t=>t.map(t=>[...t,""]))}removeColumn(){this.editRows(t=>this.columns>1?t.map(t=>t.slice(0,-1)):t)}setSpan(t,s,e){this.edit(n=>{const a={...n.attrs.spans||{}},r=Math.min(this.columns-s,Math.max(1,Math.floor(Number(e))||1));return r>1?a[`${t}.${s}`]=r:delete a[`${t}.${s}`],n.attrs.spans=a,!0},!0)}setWidth(t,s,e){this.edit(n=>{const a=Array.isArray(n.attrs.widths)?[...n.attrs.widths]:[];for(;a.length<this.columns;)a.push("");const r=Number(e);return a[t]=s&&Number.isFinite(r)&&""!==e?`${Math.max(0,r)}${s}`:"",n.attrs.widths=a,!0},!0)}renderWidths(){const t=Array.isArray(this.node.attrs?.widths)?this.node.attrs.widths:[];return s`
      <div class="mb">
        <label class="d-b mbq">Column widths<small class="d-b tc-muted">Automatic fits a column to its text. A percentage is a share of the table, and pixels are a fixed width.</small></label>
        ${Array.from({length:this.columns},(n,a)=>{const r=e.exec(t[a]||""),l=r?r[2]:"";return s`
            <div class="d-f mbq">
              <span class="mrq">Column ${a+1}</span>
              <select aria-label="Width of column ${a+1}" class="mrq" @change="${t=>this.setWidth(a,t.target.value,r?r[1]:"25")}">
                <option value="" ?selected="${!l}">Automatic</option>
                <option value="%" ?selected="${"%"===l}">Percentage</option>
                <option value="px" ?selected="${"px"===l}">Pixels</option>
              </select>
              <input type="number" min="0" class="flex" aria-label="Width of column ${a+1} in ${"px"===l?"pixels":"percent"}" ?disabled="${!l}" .value="${r?r[1]:""}" @input="${t=>this.setWidth(a,l,t.target.value)}">
            </div>`})}
      </div>
    `}renderStructure(){return s`
      <div class="mb">
        <label class="d-b mbq">Rows and columns<small class="d-b tc-muted">${this.rows.length} rows, ${this.columns} columns. Type in the cells on the page.</small></label>
        <div class="btn-grp mt">
          <button @click="${this.addRow}">Add row</button>
          <button ?disabled="${this.rows.length<2}" @click="${this.removeRow}">Remove row</button>
        </div>
        <div class="btn-grp mt">
          <button @click="${this.addColumn}">Add column</button>
          <button ?disabled="${this.columns<2}" @click="${this.removeColumn}">Remove column</button>
        </div>
      </div>
    `}renderSpans(){const t=this.spans;return s`
      <div class="mb">
        <label class="d-b mbq">Columns a cell spans<small class="d-b tc-muted">A cell that spans more than one column covers the cells after it. Their text is kept, and comes back when the span is set back to 1.</small></label>
        ${this.rows.map((e,n)=>{const a=[];for(let e=0;e<this.columns;){const r=Math.min(this.columns-e,Math.max(1,Math.floor(Number(t[`${n}.${e}`]))||1)),l=e;a.push(s`
              <input type="number" min="1" max="${this.columns-l}" style="flex: ${r} 1 0; min-width: 0" class="mrq" aria-label="Row ${n+1}, column ${l+1}: columns spanned" .value="${String(r)}" @input="${t=>this.setSpan(n,l,t.target.value)}">`),e+=r}return s`<div class="d-f mbq">${a}</div>`})}
      </div>
    `}render(){return this.node?s`
      ${this.renderFields()}
      ${this.renderStructure()}
      ${this.renderSpans()}
      ${this.renderWidths()}
    `:""}}customElements.define("k-page-builder-table-settings",a);