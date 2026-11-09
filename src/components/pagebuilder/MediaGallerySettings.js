import WidgetSettings from './WidgetSettings.js';
import PageBuilderFields from './PageBuilderFields.js';
import Toast from '../Toast.js';
import { html, nothing } from '../../lit-all.min.js';
import { resolveType } from '../MediaGallery.js';
import '../Accordion.js';
import '../Icon.js';

/*
  Utility Functions
*/
const typeOptions = [
  { value: '', label: 'Automatic (from the file)' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' }
];

/*
  The settings of a Media gallery: its own settings (thumbnail position, shape, controls, visualizer), then each item
  listed in an accordion with its address, type, poster or cover art, thumbnail and alternative text, buttons to move it
  or remove it, and an Add media button, which opens the media library with several items selectable (Add item, one empty
  item to fill in, when there is no media library). An item with no address is left out of the page.
*/
export default class MediaGallerySettings extends WidgetSettings {
  /*
    Protected Members
  */
  get items() {
    return Array.isArray(this.node.attrs?.items) ? this.node.attrs.items : [];
  }

  /*
    Public Methods
  */
  editItems(change, coalesce = false) {
    this.edit(node => {
      const items = Array.isArray(node.attrs.items) ? structuredClone(node.attrs.items) : [];
      node.attrs.items = change(items);
      return true;
    }, coalesce);
  }

  addItem() {
    this.editItems(items => [...items, { src: '' }]);
  }

  /*
    Opens the media library with pictures, videos and sounds selectable together, and adds each one chosen, in order, in one
    step. A kempo-files address has no extension, so the type is written from what the library says the file is. A sound's
    thumbnail is its album cover, unless the item is given one of its own later.
  */
  chooseItems = async () => {
    const picked = await window.kempo?.openAssetPicker?.({ kind: '', multiple: true });
    if(!picked?.length) return;
    const items = await Promise.all(picked.map(async ({ url, alt, kind, thumbnail }) => ({
      src: url,
      ...(['image', 'video', 'audio'].includes(kind) ? { type: kind } : {}),
      ...(alt ? { alt } : {}),
      ...(kind === 'audio' && thumbnail ? { thumb: thumbnail } : {}),
      ...(kind === 'video' ? await this.frameOf(url) : {})
    })));
    this.editItems(existing => [...existing, ...items]);
  };

  moveItem(index, step) {
    this.editItems(items => {
      const target = index + step;
      if(target >= 0 && target < items.length) [items[index], items[target]] = [items[target], items[index]];
      return items;
    });
  }

  removeItem(index) {
    this.editItems(items => items.filter((_, position) => position !== index));
  }

  /* A video's poster: a frame of it, as the library made it, if there is one yet. */
  async frameOf(src) {
    const frame = await window.kempo?.coverFor?.(src, 'md');
    return frame ? { poster: frame } : {};
  }

  /* Sets a video's poster to a frame of it. */
  async useFrame(index, src) {
    const frame = await window.kempo?.coverFor?.(src, 'md');
    if(!frame){
      Toast.error('This video has no frame yet');
      return;
    }
    this.setItem(index, 'poster', frame);
  }

  /* Sets a sound's thumbnail to the album cover its file carries (asked of the library), if it has one. */
  async useCover(index, src) {
    const cover = await window.kempo?.coverFor?.(src);
    if(!cover){
      Toast.error('This sound has no album cover');
      return;
    }
    this.setItem(index, 'thumb', cover);
  }

  setItem(index, name, value) {
    this.editItems(items => {
      items[index] = { ...items[index], [name]: value };
      if(!value) delete items[index][name];
      return items;
    }, true);
  }

  /*
    Rendering
  */
  renderPicker(id, label, hint, kind, item, index, name) {
    return html`
      <div class="mb">
        <label class="d-b mbq" for="${id}">${label}<small class="d-b tc-muted">${hint}</small></label>
        ${PageBuilderFields.pickers[kind]({ id, value: item[name] ?? '', change: value => this.setItem(index, name, value) })}
      </div>
    `;
  }

  renderItem(item, index) {
    const id = `pb-gallery-item-${index}`;
    const type = resolveType(item.src ?? '', item.type);
    const fileName = decodeURIComponent((item.src ?? '').split(/[?#]/)[0].split('/').pop() ?? '');
    return html`
      <k-accordion-header for-panel="${id}">${item.alt || fileName || `Item ${index + 1}`}</k-accordion-header>
      <k-accordion-panel name="${id}">
        <div class="p">
          ${this.renderPicker(`${id}-src`, 'Address', 'The address of the picture, video or sound.', ['video', 'audio'].includes(type) ? type : 'image', item, index, 'src')}
          <div class="mb">
            <label class="d-b mbq" for="${id}-type">Type<small class="d-b tc-muted">Automatic goes by the end of the address, and a picture when it is not recognised.</small></label>
            <select id="${id}-type" class="full" .value="${item.type ?? ''}" @change="${event => this.setItem(index, 'type', event.target.value)}">
              ${typeOptions.map(option => html`<option value="${option.value}" ?selected="${option.value === (item.type ?? '')}">${option.label}</option>`)}
            </select>
          </div>
          ${type === 'video' || type === 'audio' ? this.renderPicker(`${id}-poster`, type === 'video' ? 'Poster' : 'Cover art', type === 'video' ? 'The picture shown before the video plays.' : 'The picture shown above the player. Without one the visualizer fills the space.', 'image', item, index, 'poster') : nothing}
          ${this.renderPicker(`${id}-thumb`, 'Thumbnail', 'The small picture in the strip. Leave it empty to use the picture or poster.', 'image', item, index, 'thumb')}
          ${type === 'audio' && window.kempo?.coverFor ? html`
            <div class="mb">
              <button class="full" @click="${() => this.useCover(index, item.src)}"><k-icon name="image"></k-icon> Use album cover</button>
            </div>` : nothing}
          ${type === 'video' && window.kempo?.coverFor ? html`
            <div class="mb">
              <button class="full" @click="${() => this.useFrame(index, item.src)}"><k-icon name="image"></k-icon> Use a frame of the video</button>
            </div>` : nothing}
          <div class="mb">
            <label class="d-b mbq" for="${id}-alt">Alternative text<small class="d-b tc-muted">Describes the item for people who cannot see it.</small></label>
            <input id="${id}-alt" type="text" class="full" .value="${item.alt ?? ''}" @input="${event => this.setItem(index, 'alt', event.target.value)}">
          </div>
          <div class="btn-grp">
            <button title="Move up" aria-label="Move up" ?disabled="${index === 0}" @click="${() => this.moveItem(index, -1)}"><k-icon name="arrow" direction="up"></k-icon></button>
            <button title="Move down" aria-label="Move down" ?disabled="${index === this.items.length - 1}" @click="${() => this.moveItem(index, 1)}"><k-icon name="arrow" direction="down"></k-icon></button>
            <button class="danger" title="Remove" aria-label="Remove" @click="${() => this.removeItem(index)}"><k-icon name="delete"></k-icon></button>
          </div>
        </div>
      </k-accordion-panel>
    `;
  }

  render() {
    if(!this.node) return '';
    return html`
      ${this.renderFields()}
      <div class="mb">
        ${window.kempo?.openAssetPicker
          ? html`<button class="primary full" @click="${this.chooseItems}"><k-icon name="image"></k-icon> Add media</button>`
          : html`<button class="primary full" @click="${this.addItem}">Add item</button>`}
      </div>
      <k-accordion>
        ${this.items.map((item, index) => this.renderItem(item, index))}
      </k-accordion>
    `;
  }
}

customElements.define('k-page-builder-media-gallery-settings', MediaGallerySettings);
