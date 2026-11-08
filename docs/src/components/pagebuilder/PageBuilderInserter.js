import e from"../ShadowComponent.js";import{html as t,css as s}from"../../lit-all.min.js";import{widgetIcon as r}from"../../utils/pageLabels.js";const i={content:"Content",media:"Media",layout:"Layout",interactive:"Interactive"},a=Object.keys(i);export default class o extends e{static properties={registry:{attribute:!1},host:{attribute:!1},query:{state:!0}};constructor(){super(),this.query=""}static styles=s`
    :host { display: block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: 0.5rem; }
    .grid button { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.75rem 0.5rem; text-align: center; height: 100%; }
    .grid small { opacity: 0.65; }
  `;focusSearch(){this.renderRoot.querySelector("input")?.focus()}matches(e){const t=this.query.trim().toLowerCase();return!t||[e.title,e.description,...e.keywords||[]].some(e=>String(e||"").toLowerCase().includes(t))}groups(){const e=[...this.registry.values()].filter(e=>!e.section&&this.host.canAdd(e.name)&&this.matches(e)),t=new Map;for(const s of e)t.has(s.category)||t.set(s.category,[]),t.get(s.category).push(s);const s=new Map(e.filter(e=>e.categoryTitle).map(e=>[e.category,e.categoryTitle]));return[...t.keys()].sort((e,t)=>{const s=a.indexOf(e),r=a.indexOf(t);return(-1===s?99:s)-(-1===r?99:r)}).map(e=>({name:e,title:i[e]||s.get(e)||e[0].toUpperCase()+e.slice(1).replace(/[-_]+/g," "),widgets:t.get(e)}))}handleSearchKeyDown(e,t){"Enter"===e.key&&t.length&&this.host.insert(t[0].widgets[0].name)}render(){const e=this.groups();return t`
      <div class="p">
        <input type="search" class="full mb" placeholder="Search widgets" aria-label="Search widgets" .value="${this.query}" @input="${e=>{this.query=e.target.value}}" @keydown="${t=>this.handleSearchKeyDown(t,e)}">
        ${e.length?e.map(e=>t`
          <h6 class="mb">${e.title}</h6>
          <div class="grid mb">
            ${e.widgets.map(e=>t`
              <button @click="${()=>this.host.insert(e.name)}" title="${e.description||""}">
                ${r(e)}
                <span>${e.title}</span>
              </button>
            `)}
          </div>
        `):t`<p class="tc-muted">No widget matches that.</p>`}
      </div>
    `}}customElements.define("k-page-builder-inserter",o);