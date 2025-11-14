import ShadowComponent from './ShadowComponent.js';
import { html, css } from '../lit-all.min.js';

export default class ColorPicker extends ShadowComponent {
	static formAssociated = true;
	
	/* Properties */
	static properties = {
		name: {
			type: String,
			reflect: true,
			attribute: 'name'
		},
		format: {
			type: String,
			reflect: true,
			attribute: 'format'
		},
		value: {
			type: String,
			reflect: true,
			attribute: 'value'
		},
		red: {
			type: Number
		},
		green: {
			type: Number
		},
		blue: {
			type: Number
		},
		alpha: {
			type: Number
		}
	};
	constructor(){
		super();
		this.internals = this.attachInternals();
		this.format = "hex";
		this.red = 0;
		this.green = 0;
		this.blue = 0;
		this.alpha = 1;
	}
	
	/* Lifecycle */
	connectedCallback(){
		super.connectedCallback();
		// Capture original attributes BEFORE Lit processes them
		this.originalHadFormat = this.hasAttribute('format');
		this.originalValue = this.getAttribute('value');
	}
	
	firstUpdated(changedProperties){
		super.firstUpdated(changedProperties);
		
		// If value was set but format wasn't, auto-detect
		if(this.originalValue && !this.originalHadFormat){
			for(const [formatName, format] of Object.entries(this.constructor.formats)){
				if(format.detect(this.originalValue)){
					this.format = formatName;
					break;
				}
			}
		}
	}
	
	updated(changedProperties){
		super.updated(changedProperties);
		
		if(changedProperties.has('format')){
			this.requestUpdate();
		}
		
		if(changedProperties.has('red') || changedProperties.has('green') || changedProperties.has('blue') || changedProperties.has('alpha') || changedProperties.has('format')){
			this.updateFormValue();
		}
	}
	
	/* Members */
	get value(){
		if (this.red === undefined || this.green === undefined || this.blue === undefined) {
			// Default to black in current format
			const format = this.constructor.formats[this.format];
			if (format && format.toString) {
				return format.toString(0, 0, 0, 1);
			}
			return "#000000";
		}
		const format = this.constructor.formats[this.format];
		if (!format || !format.toString) {
			return "#000000";
		}
		return format.toString(this.red, this.green, this.blue, this.alpha || 1);
	}
	set value(val){
		if (!val || typeof val !== 'string') return;
		
		// Try to detect and parse the format
		for (const [formatName, format] of Object.entries(this.constructor.formats)) {
			if (format.detect(val)) {
				const parsed = format.parse(val);
				if (parsed) {
					this.red = parsed.r;
					this.green = parsed.g;
					this.blue = parsed.b;
					// Only update alpha if the input actually specified an alpha value
					if (parsed.hasAlpha) {
						this.alpha = parsed.a;
					}
					this.updateFormValue();
					return;
				}
			}
		}
		
		// If no format matched, default to black
		this.red = 0;
		this.green = 0;
		this.blue = 0;
		this.alpha = 1;
		this.updateFormValue();
	}
	
	updateFormValue(){
		const formValue = this.value;
		this.internals.setFormValue(formValue);
	}
	
	/* Methods */
	onColorInputChange(event){
		const parsed = this.constructor.formats.hex.parse(event.target.value);
		if (parsed) {
			this.red = parsed.r;
			this.green = parsed.g;
			this.blue = parsed.b;
			this.alpha = 1;
		}
	}
	onTextInputChange(event){
		this.value = event.target.value;
	}
	
	/* Rendering */
	render(){
		return html`
			<div id="container">
				<select
					id="format"
					value="${this.format}"
					@change=${(e) => this.format = e.target.value}
				>${
					this.constructor.formats ? Object.keys(this.constructor.formats).map(formatName => html`<option value="${formatName}" ?selected=${this.format === formatName}>${formatName.toUpperCase()}</option>`) : null
				}</select>
				<input
					id="text"
					type="text"
					value="${this.value}"
					@change=${this.onTextInputChange}
				/>
				<div id="color-wrapper">
					<input
						id="color"
						type="color"
						value="${this.constructor.formats.hex.toString(this.red || 0, this.green || 0, this.blue || 0, 1)}"
						@change=${this.onColorInputChange}
					/>
				</div>
			</div>
		`;
	}
	static styles = css`
		:host {
			display: block;
		}
		#container {
			display: grid;
			grid-template-columns: 7rem 1fr auto;
			align-items: stretch;
		}
		#format {
			flex-shrink: 0;
		}
		#text {
			min-width: 0;
		}
		#color-wrapper {
			display: contents;
		}
		#color {
			aspect-ratio: 1;
			height: 100%;
		}
	`;
	
	/* Static Members */
	static formats = {
		hex: {
			detect: (value) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/.test(value),
			parse: (value) => {
				let hex = value.slice(1);
				let len = hex.length;
				let r, g, b, a = 1, hasAlpha = false;
				if (len === 3 || len === 4) {
					r = parseInt(hex[0] + hex[0], 16);
					g = parseInt(hex[1] + hex[1], 16);
					b = parseInt(hex[2] + hex[2], 16);
					if (len === 4) {
						a = parseInt(hex[3] + hex[3], 16) / 255;
						hasAlpha = true;
					}
				} else if (len === 6 || len === 8) {
					r = parseInt(hex.slice(0, 2), 16);
					g = parseInt(hex.slice(2, 4), 16);
					b = parseInt(hex.slice(4, 6), 16);
					if (len === 8) {
						a = parseInt(hex.slice(6, 8), 16) / 255;
						hasAlpha = true;
					}
				}
				return { r, g, b, a, hasAlpha };
			},
			toString: (r,g,b,a) => {
				r = Math.round(r);
				g = Math.round(g);
				b = Math.round(b);
				let hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
				if (a < 1) {
					let alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
					hex += alphaHex;
				}
				return '#' + hex;
			}
		},
		rgb: {
			detect: (value) => /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*(?:0?\.\d+|1(?:\.0*)?|\d+(?:\.\d*)?))?\s*\)$/.test(value),
			parse: (value) => {
				const match = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/);
				if (!match) return null;
				const r = parseInt(match[1], 10);
				const g = parseInt(match[2], 10);
				const b = parseInt(match[3], 10);
				const a = match[4] ? parseFloat(match[4]) : 1;
				const hasAlpha = !!match[4];
				return { r, g, b, a, hasAlpha };
			},
			toString: (r,g,b,a) => {
				r = Math.round(r);
				g = Math.round(g);
				b = Math.round(b);
				if (a < 1) {
					return `rgba(${r}, ${g}, ${b}, ${a})`;
				} else {
					return `rgb(${r}, ${g}, ${b})`;
				}
			}
		},
		hsl: {
			detect: (value) => /^hsla?\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?%\s*,\s*\d+(?:\.\d+)?%\s*(?:,\s*(?:0?\.\d+|1(?:\.0*)?|\d+(?:\.\d*)?))?\s*\)$/.test(value),
			parse: (value) => {
				const match = value.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*([\d.]+))?\s*\)$/);
				if (!match) return null;
				let h = parseFloat(match[1]) / 360;
				let s = parseFloat(match[2]) / 100;
				let l = parseFloat(match[3]) / 100;
				let a = match[4] ? parseFloat(match[4]) : 1;
				const hasAlpha = !!match[4];
				let r, g, b;
				if (s === 0) {
					r = g = b = l;
				} else {
					const hue2rgb = (p, q, t) => {
						if (t < 0) t += 1;
						if (t > 1) t -= 1;
						if (t < 1/6) return p + (q - p) * 6 * t;
						if (t < 1/2) return q;
						if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
						return p;
					};
					const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
					const p = 2 * l - q;
					r = hue2rgb(p, q, h + 1/3);
					g = hue2rgb(p, q, h);
					b = hue2rgb(p, q, h - 1/3);
				}
				return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a, hasAlpha };
			},
			toString: (r,g,b,a) => {
				r /= 255; g /= 255; b /= 255;
				const max = Math.max(r, g, b);
				const min = Math.min(r, g, b);
				let h, s, l = (max + min) / 2;
				
				if (max === min) {
					h = s = 0; // achromatic
				} else {
					const d = max - min;
					s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
					switch (max) {
						case r: h = (g - b) / d + (g < b ? 6 : 0); break;
						case g: h = (b - r) / d + 2; break;
						case b: h = (r - g) / d + 4; break;
					}
					h /= 6;
				}
				
				h = Math.round(h * 360);
				s = Math.round(s * 100);
				l = Math.round(l * 100);
				
				if (a < 1) {
					return `hsla(${h}, ${s}%, ${l}%, ${a})`;
				} else {
					return `hsl(${h}, ${s}%, ${l}%)`;
				}
			}
		},
		hwb: {
			detect: (value) => /^hwb\(\s*(\d+(?:\.\d+)?)(?:deg)?\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*(?:\/\s*([\d.]+))?\s*\)$/i.test(value),
			parse: (value) => {
				const match = value.match(/^hwb\(\s*(\d+(?:\.\d+)?)(?:deg)?\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*(?:\/\s*([\d.]+))?\s*\)$/i);
				if (!match) return null;
				let h = parseFloat(match[1]);
				let w = parseFloat(match[2]) / 100;
				let b = parseFloat(match[3]) / 100;
				let a = match[4] ? parseFloat(match[4]) : 1;
				let ratio = 1 - w - b;
				let r, g, b_val;
				if (ratio > 0) {
					let hue = h / 360;
					let x = 1 - Math.abs((hue * 6) % 2 - 1);
					let m = w + ratio * (1 - x);
					let n = w + ratio * x;
					if (hue < 1/6) {
						r = w + ratio;
						g = n;
						b_val = w;
					} else if (hue < 2/6) {
						r = m;
						g = w + ratio;
						b_val = w;
					} else if (hue < 3/6) {
						r = w;
						g = w + ratio;
						b_val = n;
					} else if (hue < 4/6) {
						r = w;
						g = m;
						b_val = w + ratio;
					} else if (hue < 5/6) {
						r = n;
						g = w;
						b_val = w + ratio;
					} else {
						r = w + ratio;
						g = w;
						b_val = m;
					}
				} else {
					r = g = b_val = w;
				}
				const hasAlpha = !!match[4];
				return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b_val * 255), a, hasAlpha };
			},
			toString: (r,g,b,a) => {
				r /= 255; g /= 255; b /= 255;
				const max = Math.max(r, g, b);
				const min = Math.min(r, g, b);
				const delta = max - min;
				
				let h = 0;
				if (delta !== 0) {
					switch (max) {
						case r: h = ((g - b) / delta) % 6; break;
						case g: h = (b - r) / delta + 2; break;
						case b: h = (r - g) / delta + 4; break;
					}
					h = Math.round(h * 60);
					if (h < 0) h += 360;
				}
				
				const w = Math.round(min * 100);
				const bl = Math.round((1 - max) * 100);
				
				if (a < 1) {
					return `hwb(${h} ${w}% ${bl}% / ${a})`;
				} else {
					return `hwb(${h} ${w}% ${bl}%)`;
				}
			}
		},
		lab: {
			detect: (value) => /^lab\(\s*(\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*(?:\/\s*([\d.]+))?\s*\)$/i.test(value),
			parse: (value) => {
				const match = value.match(/^lab\(\s*(\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*(?:\/\s*([\d.]+))?\s*\)$/i);
				if (!match) return null;
				let l = parseFloat(match[1]) / 100;
				let a = parseFloat(match[2]);
				let b = parseFloat(match[3]);
				let alpha = match[4] ? parseFloat(match[4]) : 1;
				// Lab to XYZ
				let fy = (l * 100 + 16) / 116;
				let fx = fy + a / 500;
				let fz = fy - b / 200;
				let xr = fx > 0.206893034 ? fx * fx * fx : (fx - 16/116) / 7.787;
				let yr = fy > 0.206893034 ? fy * fy * fy : (fy - 16/116) / 7.787;
				let zr = fz > 0.206893034 ? fz * fz * fz : (fz - 16/116) / 7.787;
				let x = xr * 0.95047;
				let y = yr * 1.0;
				let z = zr * 1.08883;
				// XYZ to linear RGB
				let r_linear = x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
				let g_linear = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
				let b_linear = x * 0.0556434 - y * 0.2040259 + z * 1.0572252;
				// Linear to sRGB
				let r = r_linear <= 0.0031308 ? r_linear * 12.92 : 1.055 * Math.pow(r_linear, 1/2.4) - 0.055;
				let g = g_linear <= 0.0031308 ? g_linear * 12.92 : 1.055 * Math.pow(g_linear, 1/2.4) - 0.055;
				let b_val = b_linear <= 0.0031308 ? b_linear * 12.92 : 1.055 * Math.pow(b_linear, 1/2.4) - 0.055;
				const hasAlpha = !!match[4];
				return { r: Math.round(Math.max(0, Math.min(1, r)) * 255), g: Math.round(Math.max(0, Math.min(1, g)) * 255), b: Math.round(Math.max(0, Math.min(1, b_val)) * 255), a: alpha, hasAlpha };
			},
			toString: (r,g,b,a) => {
				r /= 255; g /= 255; b /= 255;
				// sRGB to linear RGB
				r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
				g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
				b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
				// Linear RGB to XYZ
				const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
				const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
				const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
				// XYZ to Lab
				const xr = x / 0.95047;
				const yr = y / 1.0;
				const zr = z / 1.08883;
				const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr + 16/116);
				const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr + 16/116);
				const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr + 16/116);
				const l = Math.round((116 * fy - 16) * 100) / 100;
				const aa = Math.round((500 * (fx - fy)) * 100) / 100;
				const bb = Math.round((200 * (fy - fz)) * 100) / 100;
				
				if (a < 1) {
					return `lab(${l}% ${aa} ${bb} / ${a})`;
				} else {
					return `lab(${l}% ${aa} ${bb})`;
				}
			}
		},
		lch: {
			detect: (value) => /^lch\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:deg)?\s*(?:\/\s*([\d.]+))?\s*\)$/i.test(value),
			parse: (value) => {
				const match = value.match(/^lch\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:deg)?\s*(?:\/\s*([\d.]+))?\s*\)$/i);
				if (!match) return null;
				let l = parseFloat(match[1]);
				let c = parseFloat(match[2]);
				let h = parseFloat(match[3]);
				let alpha = match[4] ? parseFloat(match[4]) : 1;
				let a = c * Math.cos(h * Math.PI / 180);
				let b = c * Math.sin(h * Math.PI / 180);
				// Now use lab conversion
				let l_norm = l / 100;
				let fy = (l_norm * 100 + 16) / 116;
				let fx = fy + a / 500;
				let fz = fy - b / 200;
				let xr = fx > 0.206893034 ? fx * fx * fx : (fx - 16/116) / 7.787;
				let yr = fy > 0.206893034 ? fy * fy * fy : (fy - 16/116) / 7.787;
				let zr = fz > 0.206893034 ? fz * fz * fz : (fz - 16/116) / 7.787;
				let x = xr * 0.95047;
				let y = yr * 1.0;
				let z = zr * 1.08883;
				let r_linear = x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
				let g_linear = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
				let b_linear = x * 0.0556434 - y * 0.2040259 + z * 1.0572252;
				let r = r_linear <= 0.0031308 ? r_linear * 12.92 : 1.055 * Math.pow(r_linear, 1/2.4) - 0.055;
				let g = g_linear <= 0.0031308 ? g_linear * 12.92 : 1.055 * Math.pow(g_linear, 1/2.4) - 0.055;
				let b_val = b_linear <= 0.0031308 ? b_linear * 12.92 : 1.055 * Math.pow(b_linear, 1/2.4) - 0.055;
				const hasAlpha = !!match[4];
				return { r: Math.round(Math.max(0, Math.min(1, r)) * 255), g: Math.round(Math.max(0, Math.min(1, g)) * 255), b: Math.round(Math.max(0, Math.min(1, b_val)) * 255), a: alpha, hasAlpha };
			},
			toString: (r,g,b,a) => {
				// First convert RGB to Lab
				r /= 255; g /= 255; b /= 255;
				r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
				g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
				b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
				const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
				const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
				const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
				const xr = x / 0.95047;
				const yr = y / 1.0;
				const zr = z / 1.08883;
				const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr + 16/116);
				const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr + 16/116);
				const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr + 16/116);
				const l_val = (116 * fy - 16) / 100;
				const aa = 500 * (fx - fy);
				const bb = 200 * (fy - fz);
				// Now convert Lab to LCH
				const c = Math.sqrt(aa * aa + bb * bb);
				let h = Math.atan2(bb, aa) * 180 / Math.PI;
				if (h < 0) h += 360;
				
				const l = Math.round(l_val * 100 * 100) / 100;
				const chroma = Math.round(c * 100) / 100;
				const hue = Math.round(h * 100) / 100;
				
				if (a < 1) {
					return `lch(${l}% ${chroma} ${hue} / ${a})`;
				} else {
					return `lch(${l}% ${chroma} ${hue})`;
				}
			}
		},
		oklab: {
			detect: (value) => /^oklab\(\s*(\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*(?:\/\s*([\d.]+))?\s*\)$/i.test(value),
			parse: (value) => {
				const match = value.match(/^oklab\(\s*(\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*(?:\/\s*([\d.]+))?\s*\)$/i);
				if (!match) return null;
				let l = parseFloat(match[1]) / 100;
				let a = parseFloat(match[2]);
				let b = parseFloat(match[3]);
				let alpha = match[4] ? parseFloat(match[4]) : 1;
				// Oklab to linear RGB
				let l_ = l + 0.3963377774 * a + 0.2158037573 * b;
				let m_ = l - 0.1055613458 * a - 0.0638541728 * b;
				let s_ = l - 0.0894841775 * a - 1.2914855480 * b;
				let r_linear = l_ * 4.0767416621 - m_ * 3.3077115913 + s_ * 0.2309699292;
				let g_linear = l_ * -1.2684380046 + m_ * 2.6097574011 - s_ * 0.3413193965;
				let b_linear = l_ * -0.0041960863 - m_ * 0.7034186147 + s_ * 1.7076147010;
				// Linear to sRGB
				let r = r_linear <= 0.0031308 ? r_linear * 12.92 : 1.055 * Math.pow(r_linear, 1/2.4) - 0.055;
				let g = g_linear <= 0.0031308 ? g_linear * 12.92 : 1.055 * Math.pow(g_linear, 1/2.4) - 0.055;
				let b_val = b_linear <= 0.0031308 ? b_linear * 12.92 : 1.055 * Math.pow(b_linear, 1/2.4) - 0.055;
				const hasAlpha = !!match[4];
				return { r: Math.round(Math.max(0, Math.min(1, r)) * 255), g: Math.round(Math.max(0, Math.min(1, g)) * 255), b: Math.round(Math.max(0, Math.min(1, b_val)) * 255), a: alpha, hasAlpha };
			},
			toString: (r,g,b,a) => {
				r /= 255; g /= 255; b /= 255;
				// sRGB to linear RGB
				r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
				g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
				b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
				// Linear RGB to Oklab
				const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
				const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
				const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
				const l_root = Math.pow(l_, 1/3);
				const m_root = Math.pow(m_, 1/3);
				const s_root = Math.pow(s_, 1/3);
				const l_val = 0.2104542553 * l_root + 0.7936177850 * m_root - 0.0040720468 * s_root;
				const a_val = 1.9779984951 * l_root - 2.4285922050 * m_root + 0.4505937099 * s_root;
				const b_val = 0.0259040371 * l_root + 0.7827717662 * m_root - 0.8086757660 * s_root;
				
				const l = Math.round(l_val * 100 * 100) / 100;
				const aa = Math.round(a_val * 100) / 100;
				const bb = Math.round(b_val * 100) / 100;
				
				if (a < 1) {
					return `oklab(${l}% ${aa} ${bb} / ${a})`;
				} else {
					return `oklab(${l}% ${aa} ${bb})`;
				}
			}
		},
		oklch: {
			detect: (value) => /^oklch\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:deg)?\s*(?:\/\s*([\d.]+))?\s*\)$/i.test(value),
			parse: (value) => {
				const match = value.match(/^oklch\(\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:deg)?\s*(?:\/\s*([\d.]+))?\s*\)$/i);
				if (!match) return null;
				let l = parseFloat(match[1]) / 100;
				let c = parseFloat(match[2]);
				let h = parseFloat(match[3]);
				let alpha = match[4] ? parseFloat(match[4]) : 1;
				let a = c * Math.cos(h * Math.PI / 180);
				let b = c * Math.sin(h * Math.PI / 180);
				// Now use oklab conversion
				let l_ = l + 0.3963377774 * a + 0.2158037573 * b;
				let m_ = l - 0.1055613458 * a - 0.0638541728 * b;
				let s_ = l - 0.0894841775 * a - 1.2914855480 * b;
				let r_linear = l_ * 4.0767416621 - m_ * 3.3077115913 + s_ * 0.2309699292;
				let g_linear = l_ * -1.2684380046 + m_ * 2.6097574011 - s_ * 0.3413193965;
				let b_linear = l_ * -0.0041960863 - m_ * 0.7034186147 + s_ * 1.7076147010;
				let r = r_linear <= 0.0031308 ? r_linear * 12.92 : 1.055 * Math.pow(r_linear, 1/2.4) - 0.055;
				let g = g_linear <= 0.0031308 ? g_linear * 12.92 : 1.055 * Math.pow(g_linear, 1/2.4) - 0.055;
				let b_val = b_linear <= 0.0031308 ? b_linear * 12.92 : 1.055 * Math.pow(b_linear, 1/2.4) - 0.055;
				const hasAlpha = !!match[4];
				return { r: Math.round(Math.max(0, Math.min(1, r)) * 255), g: Math.round(Math.max(0, Math.min(1, g)) * 255), b: Math.round(Math.max(0, Math.min(1, b_val)) * 255), a: alpha, hasAlpha };
			},
			toString: (r,g,b,a) => {
				// First convert RGB to Oklab
				r /= 255; g /= 255; b /= 255;
				r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
				g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
				b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
				const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
				const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
				const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
				const l_root = Math.pow(l_, 1/3);
				const m_root = Math.pow(m_, 1/3);
				const s_root = Math.pow(s_, 1/3);
				const l_val = 0.2104542553 * l_root + 0.7936177850 * m_root - 0.0040720468 * s_root;
				const a_val = 1.9779984951 * l_root - 2.4285922050 * m_root + 0.4505937099 * s_root;
				const b_val = 0.0259040371 * l_root + 0.7827717662 * m_root - 0.8086757660 * s_root;
				// Now convert Oklab to OKLCH
				const c = Math.sqrt(a_val * a_val + b_val * b_val);
				let h = Math.atan2(b_val, a_val) * 180 / Math.PI;
				if (h < 0) h += 360;
				
				const l = Math.round(l_val * 100 * 100) / 100;
				const chroma = Math.round(c * 100) / 100;
				const hue = Math.round(h * 100) / 100;
				
				if (a < 1) {
					return `oklch(${l}% ${chroma} ${hue} / ${a})`;
				} else {
					return `oklch(${l}% ${chroma} ${hue})`;
				}
			}
		}
	}
}
window.customElements.define('k-color-picker', ColorPicker);
