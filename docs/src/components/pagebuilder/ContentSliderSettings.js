import e from"./WidgetSettings.js";import{html as t}from"../../lit-all.min.js";import{defaultNode as i}from"../../utils/pageTree.js";import"../Icon.js";export default class s extends e{get slides(){return this.node.slots?.default||[]}get startSlide(){return this.slides.find(e=>e.id===this.node.attrs?.active)||this.slides[0]}addSlide(){this.edit(e=>(e.slots.default=e.slots.default||[],e.slots.default.push(i(this.registry,"slide")),!0))}moveSlide(e,t){this.edit(i=>{const s=i.slots.default,l=e+t;return l<0||l>=s.length?"That slide cannot move there":([s[e],s[l]]=[s[l],s[e]],!0)})}removeSlide(e){this.edit(t=>(t.slots.default.splice(e,1),!0))}setStart(e){this.edit(t=>(t.attrs.active=e,!0))}renderSlide(e){return t`
      <div class="p b mbq">
        <span class="d-b mbq">Slide ${e+1}</span>
        <div class="btn-grp">
          <button title="Move left" aria-label="Move left" ?disabled="${0===e}" @click="${()=>this.moveSlide(e,-1)}"><k-icon name="arrow" direction="left"></k-icon></button>
          <button title="Move right" aria-label="Move right" ?disabled="${e===this.slides.length-1}" @click="${()=>this.moveSlide(e,1)}"><k-icon name="arrow" direction="right"></k-icon></button>
          <button class="danger" title="Remove" aria-label="Remove" @click="${()=>this.removeSlide(e)}"><k-icon name="delete"></k-icon></button>
        </div>
      </div>
    `}render(){return this.node?t`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.addSlide}">Add slide</button>
      </div>
      ${this.slides.length?t`
        <div class="mb">
          <label class="d-b mbq" for="pb-slider-start">Start on slide<small class="d-b tc-muted">The first slide is shown first unless you pick another.</small></label>
          <select id="pb-slider-start" class="full" @change="${e=>this.setStart(e.target.value)}">
            ${this.slides.map((e,i)=>t`<option value="${e.id}" ?selected="${e.id===this.startSlide.id}">Slide ${i+1}</option>`)}
          </select>
        </div>`:""}
      ${this.slides.map((e,t)=>this.renderSlide(t))}
    `:""}}customElements.define("k-page-builder-content-slider-settings",s);