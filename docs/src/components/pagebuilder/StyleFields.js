import e from"../ShadowComponent.js";import{html as t,css as r}from"../../lit-all.min.js";import{ALIGNS as s,BACKGROUNDS as i,TEXT_COLOURS as a,cleanSides as o}from"../../utils/styles.js";import"../Slider.js";const l=[["","0"],["q","¼"],["h","½"],["f","1"]],n={default:"Default",alt:"Alternate",inv:"Inverse",primary:"Primary",secondary:"Secondary",success:"Success",warning:"Warning",danger:"Danger",muted:"Muted"},d="Top left corner",c="Top right corner",p="Bottom left corner",g="Bottom right corner",m="Top border",b="Right border",u="Bottom border",h="Left border";export default class y extends e{static properties={node:{attribute:!1},host:{attribute:!1},hide:{attribute:!1},version:{type:Number}};get styles(){return this.node.attrs?.styles||{}}shows(e){return!this.hide?.includes(e)}setStyle(e,t,r=!1){this.host.setWidgetAttribute(this.node.id,"styles",{...this.styles,[e]:t},r)}setSide(e,t,r){this.setStyle(e,{...o(this.styles[e]),[t]:r})}toggleIn(e,t,r){const s=Array.isArray(this.styles[e])?this.styles[e]:[];this.setStyle(e,r?[...s.filter(e=>e!==t),t]:s.filter(e=>e!==t))}renderModel(){const e=o(this.styles.margin),r=o(this.styles.padding),s=Array.isArray(this.styles.corners)?this.styles.corners:[],i=Array.isArray(this.styles.sides)?this.styles.sides:[],a=(e,r,s,i)=>t`
      <select class="space ${e}-${s}" aria-label="${i} ${s}" title="${i} ${s}" @change="${t=>this.setSide(e,s,t.target.value)}">
        ${l.map(([e,i])=>t`<option value="${e}" ?selected="${r[s]===e}">${i}</option>`)}
      </select>`,n=(e,r,a)=>{const o=("corners"===e?s:i).includes(r);return t`<button type="button" class="pick ${e}-${r}${o?" on":""}" aria-pressed="${o}" title="${a}" aria-label="${a}" @click="${()=>this.toggleIn(e,r,!o)}"></button>`};return t`
      <div class="model">
        ${["top","left","right","bottom"].map(t=>a("margin",e,t,"Margin"))}
        <div class="box ${s.map(e=>`round-${e}`).join(" ")} ${i.map(e=>`on-${e}`).join(" ")}">
          ${n("corners","tl",d)}
          ${n("sides","top",m)}
          ${n("corners","tr",c)}
          ${n("sides","left",h)}
          <div class="inner">
            ${["top","left","right","bottom"].map(e=>a("padding",r,e,"Padding"))}
            <span class="widget tc-muted">Widget</span>
          </div>
          ${n("sides","right",b)}
          ${n("corners","bl",p)}
          ${n("sides","bottom",u)}
          ${n("corners","br",g)}
        </div>
      </div>`}renderBackground(){const e=this.styles.background||"",r=Number(this.styles.alpha??100);return t`
      <div class="mb">
        <label class="d-b mbq" for="pb-style-background">Background</label>
        <select id="pb-style-background" class="full" @change="${e=>this.setStyle("background",e.target.value)}">
          <option value="" ?selected="${!e}">None</option>
          ${i.map(r=>t`<option value="${r}" ?selected="${e===r}">${n[r]}</option>`)}
        </select>
        <div class="alpha">
          <k-slider class="slider" aria-label="Background opacity" min="0" max="100" format="0" ?disabled="${!e}" .value="${String(r)}" @change="${e=>Number(e.detail.value)!==r&&this.setStyle("alpha",Number(e.detail.value),!0)}"></k-slider>
          <span class="amount">
            <input type="number" aria-label="Background opacity (%)" min="0" max="100" ?disabled="${!e}" .value="${String(r)}" style="${"width: 4ch; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: right; -moz-appearance: textfield;"}" @input="${e=>this.setStyle("alpha",Math.min(100,Math.max(0,Number(e.target.value)||0)),!0)}">%</span>
        </div>
      </div>`}renderTextColour(){const e=this.styles.textColour||"";return t`
      <div class="mb">
        <label class="d-b mbq" for="pb-style-text">Text colour</label>
        <select id="pb-style-text" class="full" @change="${e=>this.setStyle("textColour",e.target.value)}">
          <option value="" ?selected="${!e}">Theme default</option>
          ${a.map(r=>t`<option value="${r}" ?selected="${e===r}">${n[r]}</option>`)}
        </select>
      </div>`}renderAlign(){const e=this.styles.align||"";return t`
      <div class="mb">
        <label class="d-b mbq" for="pb-style-align">Text alignment</label>
        <select id="pb-style-align" class="full" @change="${e=>this.setStyle("align",e.target.value)}">
          <option value="" ?selected="${!e}">Default</option>
          ${s.map(r=>t`<option value="${r}" ?selected="${e===r}">${r[0].toUpperCase()+r.slice(1)}</option>`)}
        </select>
      </div>`}render(){return this.node?t`
      ${this.shows("box")?this.renderModel():""}
      ${this.shows("background")?this.renderBackground():""}
      ${this.shows("textColour")?this.renderTextColour():""}
      ${this.shows("align")?this.renderAlign():""}
      ${this.shows("id")?t`
        <div class="mb">
          <label class="d-b mbq">ID</label>
          <input type="text" class="full" .value="${this.styles.id??""}" @input="${e=>this.setStyle("id",e.target.value,!0)}">
        </div>`:""}
      ${this.shows("classes")?t`
        <div class="mb">
          <label class="d-b mbq">Classes</label>
          <input type="text" class="full" .value="${this.styles.classes??""}" @input="${e=>this.setStyle("classes",e.target.value,!0)}">
        </div>`:""}
    `:""}static styles=r`
    .model {
      display: grid;
      grid-template-columns: 3.25rem 1fr 3.25rem;
      grid-template-rows: auto 11rem auto;
      grid-template-areas:
        ". margin-top ."
        "margin-left box margin-right"
        ". margin-bottom .";
      gap: var(--spacer_q);
      margin-bottom: var(--spacer_h);
    }
    .model select.space {
      box-sizing: border-box;
      width: 2rem;
      height: 1.35rem;
      min-width: 0;
      justify-self: center;
      align-self: center;
      padding: 0;
      text-align: center;
      text-align-last: center;
      font-size: 0.9rem;
      appearance: none;
      -webkit-appearance: none;
      background-image: none;
    }
    .space.margin-top { grid-area: margin-top; }
    .space.margin-left { grid-area: margin-left; }
    .space.margin-right { grid-area: margin-right; }
    .space.margin-bottom { grid-area: margin-bottom; }
    .box {
      grid-area: box;
      display: grid;
      grid-template-columns: 1.25rem 1fr 1.25rem;
      grid-template-rows: 1.25rem 1fr 1.25rem;
      grid-template-areas:
        "corners-tl sides-top corners-tr"
        "sides-left inner sides-right"
        "corners-bl sides-bottom corners-br";
      border: 2px solid oklch(from var(--c_border) l c h / 0.35);
    }
    .box.round-tl { border-top-left-radius: 1.5rem; }
    .box.round-tr { border-top-right-radius: 1.5rem; }
    .box.round-bl { border-bottom-left-radius: 1.5rem; }
    .box.round-br { border-bottom-right-radius: 1.5rem; }
    .box.on-top { border-top-color: var(--c_primary); }
    .box.on-right { border-right-color: var(--c_primary); }
    .box.on-bottom { border-bottom-color: var(--c_primary); }
    .box.on-left { border-left-color: var(--c_primary); }
    .box button.pick {
      min-width: 0;
      min-height: 0;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      cursor: pointer;
    }
    .box button.pick:hover { background: oklch(from var(--c_primary) l c h / 0.12); }
    .box button.pick:focus-visible { outline: 2px solid var(--c_primary); outline-offset: -2px; }
    .pick.corners-tl { grid-area: corners-tl; }
    .pick.corners-tr { grid-area: corners-tr; }
    .pick.corners-bl { grid-area: corners-bl; }
    .pick.corners-br { grid-area: corners-br; }
    .pick.sides-top { grid-area: sides-top; }
    .pick.sides-right { grid-area: sides-right; }
    .pick.sides-bottom { grid-area: sides-bottom; }
    .pick.sides-left { grid-area: sides-left; }
    .inner {
      grid-area: inner;
      display: grid;
      grid-template-columns: 3rem 1fr 3rem;
      grid-template-rows: auto 1fr auto;
      grid-template-areas:
        "padding-top padding-top padding-top"
        "padding-left widget padding-right"
        "padding-bottom padding-bottom padding-bottom";
      min-width: 0;
    }
    .inner .space.padding-top { grid-area: padding-top; }
    .inner .space.padding-left { grid-area: padding-left; }
    .inner .space.padding-right { grid-area: padding-right; }
    .inner .space.padding-bottom { grid-area: padding-bottom; }
    .widget {
      grid-area: widget;
      align-self: center;
      text-align: center;
      font-size: 0.75rem;
    }
    .alpha {
      display: flex;
      align-items: center;
      gap: var(--spacer_h);
      margin-top: var(--spacer_q);
    }
    .alpha .slider {
      flex: 1 1 auto;
      min-width: 0;
    }
    .amount {
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
    }
  `}customElements.define("k-page-builder-styles",y);