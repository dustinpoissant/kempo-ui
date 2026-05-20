import Control from './Control.js';
import { html, css } from '../../lit-all.min.js';
import './FontSizeIncrease.js';
import './FontSizeDecrease.js';
import '../ControlGroup.js';

/*
  Composite control rendering decrease + increase as a single grouped pair.
  Mode/host visibility follows the children.
*/
export default class FontSize extends Control {
  static hostMode = 'code';

  static styles = [
    Control.styles,
    css`
      :host { gap: 0; }
    `
  ];

  render() {
    return html`
      <k-control-group class="b r mq">
        <kc-font-size-decrease></kc-font-size-decrease>
        <kc-font-size-increase></kc-font-size-increase>
      </k-control-group>
    `;
  }
}

customElements.define('kc-font-size', FontSize);
