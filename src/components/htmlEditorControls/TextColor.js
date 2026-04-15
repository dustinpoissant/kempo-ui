import DropdownControl from './DropdownControl.js';
import {html, css} from '../../lit-all.min.js';
import '../Icon.js';

export default class TextColor extends DropdownControl {
	static properties = {
		editorMode: {type: String, state: true},
		colors: {type: String},
		disableRemove: {type: Boolean, attribute: 'disable-remove'},
		disablePicker: {type: Boolean, attribute: 'disable-picker'}
	};

	/*
		Styles
	*/
	static styles = [
		DropdownControl.styles,
		css`
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
		`
	];

	/*
		Constructor
	*/
	constructor(){
		super();
		this.colors = '#000000,#e60000,#ff9900,#ffff00,#008a00,#0066cc,#9933ff,#ffffff,#facccc,#ffebcc,#ffffcc,#cce8cc,#cce0f5,#ebd6ff';
		this.disableRemove = false;
		this.disablePicker = false;
		this.icon = 'format_color_text';
	}

	/*
		Lifecycle Callbacks
	*/
	connectedCallback(){
		super.connectedCallback();
		this.updateEditorMode();
		this.editor?.addEventListener('mode-changed', () => this.updateEditorMode());
	}

	/*
		Event Handlers
	*/
	handleRemove = (e) => {
		if(this.editor){
			this.editor.removeTextColor();
		}
		this.opened = false;
	};

	handleSwatchClick = (e) => {
		const color = e.target.style.backgroundColor;
		if(this.editor && color){
			const rgb = color.match(/\d+/g);
			const hex = rgb ? '#' + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('') : color;
			this.editor.setTextColor(hex);
		}
		this.opened = false;
	};

	handlePickerChange = (e) => {
		const color = e.target.value;
		if(this.editor && color){
			this.editor.setTextColor(color);
		}
		this.opened = false;
	};

	/*
		Utility Functions
	*/
	updateEditorMode(){
		if(!this.editor) return;
		this.editorMode = this.editor.mode;
	}

	getColorArray(){
		return this.colors.split(',').map(c => c.trim()).filter(c => c);
	}

	/*
		Rendering
	*/
	render(){
		this.hidden = this.editorMode === 'code';

		const colorArray = this.getColorArray();

		return html`
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
					${!this.disableRemove ? html`
						<button class="remove-btn" @click=${this.handleRemove}>
							Remove Color
						</button>
					` : ''}
					
					<div class="color-swatches">
						${colorArray.map(color => html`
							<button 
								class="color-swatch" 
								style="background-color: ${color}"
								@click=${this.handleSwatchClick}
							></button>
						`)}
					</div>

					${!this.disablePicker ? html`
						<div class="picker-row">
							<label>Custom:</label>
							<input 
								type="color" 
								@input=${this.handlePickerChange}
							/>
						</div>
					` : ''}
				</div>
			</k-dropdown>
		`;
	}
}

customElements.define('k-hec-text-color', TextColor);
