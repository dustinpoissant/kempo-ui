import WidgetSettings from './WidgetSettings.js';
import PageBuilderFields from './PageBuilderFields.js';
import { html } from '../../lit-all.min.js';
import '../Accordion.js';
import '../Icon.js';
import imageSize from '../../utils/imageSize.js';

/*
  The settings of a Photo viewer: its own settings (photos per row), then each photo listed in an accordion with its
  address and alternative text, buttons to move it or remove it, and an Add photos button, which opens the media library
  with several pictures selectable (Add photo, one empty photo to fill in, when there is no media library). A photo with no address is
  left out of the page.
*/
export default class PhotoViewerSettings extends WidgetSettings {
  /*
    Protected Members
  */
  get photos() {
    return Array.isArray(this.node.attrs?.images) ? this.node.attrs.images : [];
  }

  /*
    Public Methods
  */
  editPhotos(change, coalesce = false) {
    this.edit(node => {
      const photos = Array.isArray(node.attrs.images) ? structuredClone(node.attrs.images) : [];
      node.attrs.images = change(photos);
      return true;
    }, coalesce);
  }

  addPhoto() {
    this.editPhotos(photos => [...photos, { src: '', alt: '' }]);
  }

  /* Opens the media library with several pictures selectable, and adds each one chosen, in order, in one step. */
  choosePhotos = async () => {
    const picked = await window.kempo?.openAssetPicker?.({ multiple: true });
    if(!picked?.length) return;
    const start = this.photos.length;
    this.editPhotos(photos => [...photos, ...picked.map(({ url, alt }) => ({ src: url, alt }))]);
    picked.forEach(({ url }, offset) => this.measurePhoto(start + offset, url));
  };

  movePhoto(index, step) {
    this.editPhotos(photos => {
      const target = index + step;
      if(target >= 0 && target < photos.length) [photos[index], photos[target]] = [photos[target], photos[index]];
      return photos;
    });
  }

  removePhoto(index) {
    this.editPhotos(photos => photos.filter((_, position) => position !== index));
  }

  setPhoto(index, name, value) {
    this.editPhotos(photos => {
      photos[index] = { ...photos[index], [name]: value };
      if(name === 'src'){
        delete photos[index].width;
        delete photos[index].height;
      }
      return photos;
    }, true);
    if(name === 'src') this.measurePhoto(index, value);
  }

  async measurePhoto(index, src) {
    const id = this.node.id;
    const size = await imageSize(src);
    if(!size) return;
    this.host.editWidget(id, node => {
      if(node.attrs.images?.[index]?.src !== src) return false;
      const photos = structuredClone(node.attrs.images);
      photos[index] = { ...photos[index], width: size.width, height: size.height };
      node.attrs.images = photos;
      return true;
    }, true);
  }

  /*
    Rendering
  */
  renderPhoto(photo, index) {
    const id = `pb-photo-${index}`;
    return html`
      <k-accordion-header for-panel="${id}">${photo.alt || photo.src || `Photo ${index + 1}`}</k-accordion-header>
      <k-accordion-panel name="${id}">
        <div class="p">
          <div class="mb">
            <label class="d-b mbq" for="${id}-src">Address<small class="d-b tc-muted">The address of the picture.</small></label>
            ${PageBuilderFields.pickers.image({ id: `${id}-src`, value: photo.src ?? '', change: value => this.setPhoto(index, 'src', value) })}
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${id}-alt">Alternative text<small class="d-b tc-muted">Describes the picture for people who cannot see it.</small></label>
            <input id="${id}-alt" type="text" class="full" .value="${photo.alt ?? ''}" @input="${event => this.setPhoto(index, 'alt', event.target.value)}">
          </div>
          <div class="mb">
            <label class="d-b mbq" for="${id}-caption">Caption<small class="d-b tc-muted">Shown under the picture. Leave it empty for no caption.</small></label>
            <input id="${id}-caption" type="text" class="full" .value="${photo.caption ?? ''}" @input="${event => this.setPhoto(index, 'caption', event.target.value)}">
          </div>
          <div class="btn-grp">
            <button title="Move up" aria-label="Move up" ?disabled="${index === 0}" @click="${() => this.movePhoto(index, -1)}"><k-icon name="arrow" direction="up"></k-icon></button>
            <button title="Move down" aria-label="Move down" ?disabled="${index === this.photos.length - 1}" @click="${() => this.movePhoto(index, 1)}"><k-icon name="arrow" direction="down"></k-icon></button>
            <button class="danger" title="Remove" aria-label="Remove" @click="${() => this.removePhoto(index)}"><k-icon name="delete"></k-icon></button>
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
          ? html`<button class="primary full" @click="${this.choosePhotos}"><k-icon name="image"></k-icon> Add photos</button>`
          : html`<button class="primary full" @click="${this.addPhoto}">Add photo</button>`}
      </div>
      <k-accordion>
        ${this.photos.map((photo, index) => this.renderPhoto(photo, index))}
      </k-accordion>
    `;
  }
}

customElements.define('k-page-builder-photo-viewer-settings', PhotoViewerSettings);
