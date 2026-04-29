import MarkdownEditorControl from './MarkdownEditorControl.js';
import { html, css } from '../../lit-all.min.js';
import '../SpeechToText.js';

/*
  Speech-to-text control. Reuses the standalone `<k-speech-to-text>`
  component (which provides its own mic-button UI and handles the Web
  Speech API) and just listens for its `end` event to drop the final
  transcript into the editor at the cursor.
*/
export default class MarkdownSpeechToText extends MarkdownEditorControl {
  static properties = {
    ...MarkdownEditorControl.properties,
    language: { type: String, reflect: true },
    continuous: { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.label = 'Speech to text';
    this.language = 'en-US';
    this.continuous = false;
  }

  /*
    The trigger button lives inside the embedded `<k-speech-to-text>`,
    which handles its own click-to-listen logic. Our base-class
    handleClick (which calls command()) is unused; the speech component
    drives the lifecycle and we just react to the `end` event.
  */
  command() {}

  handleEnd = (e) => {
    const text = (e.detail?.text || '').trim();
    if(!text) return;
    // Trailing space so successive recordings don't run together.
    this.editor?.replaceSelection(text + ' ', { selectInserted: false });
  };

  render() {
    return html`
      <k-speech-to-text
        language=${this.language}
        ?continuous=${this.continuous}
        @end=${this.handleEnd}
      ></k-speech-to-text>
    `;
  }

  static styles = [
    MarkdownEditorControl.styles,
    css`
    :host {
      margin: var(--spacer_q);
    }
      k-speech-to-text {
        /* Shrink the default 2.5rem circular mic button so it sits
           comfortably alongside other toolbar controls. */
        --btn_size: 2rem;
      }
    `
  ];
}

customElements.define('k-md-speech-to-text', MarkdownSpeechToText);
