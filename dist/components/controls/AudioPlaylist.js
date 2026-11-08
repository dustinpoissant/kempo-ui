import t from"./Control.js";import"../Sortable.js";import{html as e,css as s,nothing as o,repeat as i}from"../../lit-all.min.js";export default class r extends t{static requires=["playTrack","reorderTracks"];static hostEvents=["playlist-changed","track-changed"];connectedCallback(){super.connectedCallback(),this.host?.addEventListener("playlist-shuffling",this.recordRowPositions)}disconnectedCallback(){this.host?.removeEventListener("playlist-shuffling",this.recordRowPositions),super.disconnectedCallback()}updated(t){super.updated(t),this.animateRowMoves()}recordRowPositions=()=>{this.rowPositions=new Map([...this.shadowRoot.querySelectorAll("k-sortable-item")].map(t=>[t,t.getBoundingClientRect()]))};animateRowMoves(){if(!this.rowPositions)return;const t=this.rowPositions;this.rowPositions=null;for(const e of this.shadowRoot.querySelectorAll("k-sortable-item")){const s=t.get(e);if(!s)continue;const o=s.top-e.getBoundingClientRect().top;o&&e.animate([{transform:`translateY(${o}px)`},{transform:"translateY(0)"}],{duration:500,easing:"ease-out"})}}handleSort=t=>{const e=[...t.currentTarget.children].map(t=>Number(t.dataset.index));this.host.reorderTracks(e)};handlePointerDown=t=>{this.pressX=t.clientX,this.pressY=t.clientY};handleRowClick=(t,e)=>{Math.hypot(t.clientX-this.pressX,t.clientY-this.pressY)>5||this.host.playTrack(this.host.tracks.indexOf(e))};render(){const t=this.host?.tracks??[];if(!t.length)return o;const s=this.host.trackIndex;return e`
      <k-sortable @sort=${this.handleSort}>
        ${i(t,t=>t,(t,o)=>{return e`
          <k-sortable-item
            data-index=${o}
            ?current=${o===s}
            @pointerdown=${this.handlePointerDown}
            @click=${e=>this.handleRowClick(e,t)}
          >
            <span class="title">${t.trackTitle||(i=t.src,decodeURIComponent(new URL(i,document.baseURI).pathname.split("/").pop()))}</span>
            <span class="artist">${t.artist}</span>
          </k-sortable-item>
        `;var i})}
      </k-sortable>
    `}static styles=[t.styles,s`
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
    `]}customElements.define("kc-audio-playlist",r);