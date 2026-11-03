import Control from './Control.js';
import '../Sortable.js';
import { html, css, nothing, repeat } from '../../lit-all.min.js';

export default class AudioPlaylist extends Control {
  static requires = ['playTrack', 'reorderTracks'];
  static hostEvents = ['playlist-changed', 'track-changed'];

  /*
    Lifecycle Callbacks
  */
  connectedCallback() {
    super.connectedCallback();
    this.host?.addEventListener('playlist-shuffling', this.recordRowPositions);
  }

  disconnectedCallback() {
    this.host?.removeEventListener('playlist-shuffling', this.recordRowPositions);
    super.disconnectedCallback();
  }

  updated(changed) {
    super.updated(changed);
    this.animateRowMoves();
  }

  /*
    Animation
  */
  recordRowPositions = () => {
    this.rowPositions = new Map([...this.shadowRoot.querySelectorAll('k-sortable-item')].map(row => [row, row.getBoundingClientRect()]));
  };

  animateRowMoves() {
    if(!this.rowPositions) return;
    const positions = this.rowPositions;
    this.rowPositions = null;
    for(const row of this.shadowRoot.querySelectorAll('k-sortable-item')){
      const before = positions.get(row);
      if(!before) continue;
      const dy = before.top - row.getBoundingClientRect().top;
      if(dy) row.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], { duration: 500, easing: 'ease-out' });
    }
  }

  /*
    Event Handlers
  */
  handleSort = (event) => {
    const order = [...event.currentTarget.children].map(item => Number(item.dataset.index));
    this.host.reorderTracks(order);
  };

  handlePointerDown = (event) => {
    this.pressX = event.clientX;
    this.pressY = event.clientY;
  };

  handleRowClick = (event, track) => {
    if(Math.hypot(event.clientX - this.pressX, event.clientY - this.pressY) > 5) return;
    this.host.playTrack(this.host.tracks.indexOf(track));
  };

  /*
    Rendering
  */
  render() {
    const tracks = this.host?.tracks ?? [];
    if(!tracks.length) return nothing;
    const current = this.host.trackIndex;
    return html`
      <k-sortable @sort=${this.handleSort}>
        ${repeat(tracks, track => track, (track, index) => html`
          <k-sortable-item
            data-index=${index}
            ?current=${index === current}
            @pointerdown=${this.handlePointerDown}
            @click=${event => this.handleRowClick(event, track)}
          >
            <span class="title">${track.trackTitle}</span>
            <span class="artist">${track.artist}</span>
          </k-sortable-item>
        `)}
      </k-sortable>
    `;
  }

  static styles = [
    Control.styles,
    css`
      :host {
        display: block;
        width: 100%;
        height: auto;
      }
      k-sortable-item {
        cursor: pointer;
      }
      k-sortable-item[current] {
        color: var(--tc_primary, #7cb7ff);
        font-weight: 600;
      }
      .artist {
        margin-left: 0.5rem;
        opacity: 0.7;
      }
    `
  ];
}

customElements.define('kc-audio-playlist', AudioPlaylist);
