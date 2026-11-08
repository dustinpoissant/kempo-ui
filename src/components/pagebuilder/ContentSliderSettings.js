import WidgetSettings from './WidgetSettings.js';
import { html } from '../../lit-all.min.js';
import { defaultNode } from '../../utils/pageTree.js';
import '../Icon.js';

/*
  The settings of a Content slider: its own settings, then an Add slide button, the slide it starts on, and each slide
  listed with buttons to move it or remove it. A slide's content is edited on the page.
*/
export default class ContentSliderSettings extends WidgetSettings {
  /*
    Protected Members
  */
  get slides() {
    return this.node.slots?.default || [];
  }

  /* The slide the slider starts on: the one chosen, or the first. */
  get startSlide() {
    return this.slides.find(slide => slide.id === this.node.attrs?.active) || this.slides[0];
  }

  /*
    Public Methods
  */
  addSlide() {
    this.edit(node => {
      node.slots.default = node.slots.default || [];
      node.slots.default.push(defaultNode(this.registry, 'slide'));
      return true;
    });
  }

  moveSlide(index, step) {
    this.edit(node => {
      const list = node.slots.default;
      const target = index + step;
      if(target < 0 || target >= list.length) return 'That slide cannot move there';
      [list[index], list[target]] = [list[target], list[index]];
      return true;
    });
  }

  removeSlide(index) {
    this.edit(node => {
      node.slots.default.splice(index, 1);
      return true;
    });
  }

  setStart(id) {
    this.edit(node => {
      node.attrs.active = id;
      return true;
    });
  }

  /*
    Rendering
  */
  renderSlide(index) {
    return html`
      <div class="p b mbq">
        <span class="d-b mbq">Slide ${index + 1}</span>
        <div class="btn-grp">
          <button title="Move left" aria-label="Move left" ?disabled="${index === 0}" @click="${() => this.moveSlide(index, -1)}"><k-icon name="arrow" direction="left"></k-icon></button>
          <button title="Move right" aria-label="Move right" ?disabled="${index === this.slides.length - 1}" @click="${() => this.moveSlide(index, 1)}"><k-icon name="arrow" direction="right"></k-icon></button>
          <button class="danger" title="Remove" aria-label="Remove" @click="${() => this.removeSlide(index)}"><k-icon name="delete"></k-icon></button>
        </div>
      </div>
    `;
  }

  render() {
    if(!this.node) return '';
    return html`
      ${this.renderFields()}
      <div class="mb">
        <button class="primary full" @click="${this.addSlide}">Add slide</button>
      </div>
      ${this.slides.length ? html`
        <div class="mb">
          <label class="d-b mbq" for="pb-slider-start">Start on slide<small class="d-b tc-muted">The first slide is shown first unless you pick another.</small></label>
          <select id="pb-slider-start" class="full" @change="${event => this.setStart(event.target.value)}">
            ${this.slides.map((slide, index) => html`<option value="${slide.id}" ?selected="${slide.id === this.startSlide.id}">Slide ${index + 1}</option>`)}
          </select>
        </div>` : ''}
      ${this.slides.map((slide, index) => this.renderSlide(index))}
    `;
  }
}

customElements.define('k-page-builder-content-slider-settings', ContentSliderSettings);
