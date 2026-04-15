import e from"./DropdownControl.js";import{html as o,css as t}from"../../lit-all.min.js";import"../Icon.js";export default class r extends e{static properties={editorMode:{type:String,state:!0},colors:{type:String},disableRemove:{type:Boolean,attribute:"disable-remove"},disablePicker:{type:Boolean,attribute:"disable-picker"}};static styles=[e.styles,t`
			.dropdown-content {
				padding: 8px;
				min-width: 200px;
			}

			.remove-btn {
				width: 100%;
				padding: 8px;
				margin-bottom: 8px;
				border: 1px solid var(--border-color, #ccc);
				background: var(--background-color, white);
				cursor: pointer;
				border-radius: 4px;
			}

			.remove-btn:hover {
				background: var(--hover-background-color, #f5f5f5);
			}

			.color-swatches {
				display: grid;
			grid-template-columns: repeat(6, 1fr);
			}

			.color-swatch {
				width: 32px;
				height: 32px;
				border: 1px solid var(--border-color, #ccc);
				cursor: pointer;
				border-radius: 4px;
			}

			.color-swatch:hover {
				border-color: var(--primary-color, #007acc);
				box-shadow: 0 0 4px rgba(0, 122, 204, 0.3);
			}

			.picker-row {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			.picker-row label {
				flex-shrink: 0;
			}

			.picker-row input[type="color"] {
				flex: 1;
				height: 32px;
				border: 1px solid var(--border-color, #ccc);
				border-radius: 4px;
				cursor: pointer;
			}
		`];constructor(){super(),this.colors="#000000,#e60000,#ff9900,#ffff00,#008a00,#0066cc,#9933ff,#ffffff,#facccc,#ffebcc,#ffffcc,#cce8cc,#cce0f5,#ebd6ff",this.disableRemove=!1,this.disablePicker=!1,this.icon="format_color_text"}connectedCallback(){super.connectedCallback(),this.updateEditorMode(),this.editor?.addEventListener("mode-changed",()=>this.updateEditorMode())}handleRemove=e=>{this.editor&&this.editor.removeTextColor(),this.opened=!1};handleSwatchClick=e=>{const o=e.target.style.backgroundColor;if(this.editor&&o){const e=o.match(/\d+/g),t=e?"#"+e.map(e=>parseInt(e).toString(16).padStart(2,"0")).join(""):o;this.editor.setTextColor(t)}this.opened=!1};handlePickerChange=e=>{const o=e.target.value;this.editor&&o&&this.editor.setTextColor(o),this.opened=!1};updateEditorMode(){this.editor&&(this.editorMode=this.editor.mode)}getColorArray(){return this.colors.split(",").map(e=>e.trim()).filter(e=>e)}render(){this.hidden="code"===this.editorMode;const e=this.getColorArray();return o`
			<k-dropdown 
				?opened=${this.opened}
				@opened=${this.handleOpened}
				@closed=${this.handleClosed}
			>
				<button 
					slot="trigger" 
					class="${this.buttonClasses}"
				>
					<k-icon name="format_color_text"></k-icon>
				</button>
				
				<div class="dropdown-content">
					${this.disableRemove?"":o`
						<button class="remove-btn" @click=${this.handleRemove}>
							Remove Color
						</button>
					`}
					
					<div class="color-swatches">
						${e.map(e=>o`
							<button 
								class="color-swatch" 
								style="background-color: ${e}"
								@click=${this.handleSwatchClick}
							></button>
						`)}
					</div>

					${this.disablePicker?"":o`
						<div class="picker-row">
							<label>Custom:</label>
							<input 
								type="color" 
								@input=${this.handlePickerChange}
							/>
						</div>
					`}
				</div>
			</k-dropdown>
		`}}customElements.define("k-hec-text-color",r);