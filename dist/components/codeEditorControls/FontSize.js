import e from"./CodeEditorControl.js";import{html as o,css as s}from"../../lit-all.min.js";import"./FontSizeDecrease.js";import"./FontSizeIncrease.js";import"../ControlGroup.js";export default class t extends e{static styles=[e.styles,s`
			:host {
				display: inline-flex;
				gap: 0;
			}
		`];render(){return o`
			<k-control-group class="b r mq">
				<k-cec-font-size-decrease></k-cec-font-size-decrease>
				<k-cec-font-size-increase></k-cec-font-size-increase>
			</k-control-group>
		`}}customElements.define("k-cec-font-size",t);