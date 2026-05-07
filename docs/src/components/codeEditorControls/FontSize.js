import e from"./CodeEditorControl.js";import{html as s,css as t}from"../../lit-all.min.js";import"./FontSizeDecrease.js";import"./FontSizeIncrease.js";import"./ControlGroup.js";export default class o extends e{static styles=[e.styles,t`
			:host {
				display: inline-flex;
				gap: 0;
			}
		`];render(){return s`
			<k-cec-group class="b r mq">
				<k-cec-font-size-decrease></k-cec-font-size-decrease>
				<k-cec-font-size-increase></k-cec-font-size-increase>
			</k-cec-group>
		`}}customElements.define("k-cec-font-size",o);