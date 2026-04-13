import t from"./TableControl.js";import{html as e}from"../../lit-all.min.js";import"../Icon.js";export default class o extends t{constructor(){super(),this.maxWidth=136}export=()=>{const t=this.record;if(t){const e=JSON.stringify(t),o=new Blob([e],{type:"application/json"}),n=URL.createObjectURL(o),r=document.createElement("a");r.href=n,r.download="data.json",r.click(),URL.revokeObjectURL(n)}else{const t=JSON.stringify(this.table.records),e=new Blob([t],{type:"application/json"}),o=URL.createObjectURL(e),n=document.createElement("a");n.href=o,n.download="data.json",n.click(),URL.revokeObjectURL(o)}};render(){return e`
			<button class="no-btn ph" @click="${this.export}">
				<slot>
					<k-icon name="export-file"></k-icon>
					Export JSON
				</slot>
			</button>
		`}}customElements.define("k-tc-export-json",o);