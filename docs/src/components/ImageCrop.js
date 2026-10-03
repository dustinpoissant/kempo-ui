import{html as t,css as e}from"../lit-all.min.js";import i from"./ShadowComponent.js";import{bound as a}from"../utils/number.js";import"./Icon.js";const r=["nw","n","ne","e","se","s","sw","w"],s={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"};export default class n extends i{static formAssociated=!0;static properties={src:{type:String,reflect:!0},name:{type:String,reflect:!0},aspectRatio:{type:String,reflect:!0,attribute:"aspect-ratio"},maxWidth:{type:Number,reflect:!0,attribute:"max-width"},maxHeight:{type:Number,reflect:!0,attribute:"max-height"},type:{type:String,reflect:!0},quality:{type:Number,reflect:!0},label:{type:String,reflect:!0},placeholder:{type:String,reflect:!0},disabled:{type:Boolean,reflect:!0},required:{type:Boolean,reflect:!0},image:{state:!0},cropRect:{state:!0},scale:{state:!0},dragging:{state:!0}};#t=null;#e="";#i=0;#a=null;#r=null;constructor(){super(),this.internals=this.attachInternals(),this.src="",this.name="",this.aspectRatio="",this.maxWidth=0,this.maxHeight=0,this.type="image/png",this.quality=.92,this.label="Upload Image",this.placeholder="or drop an image here",this.disabled=!1,this.required=!1,this.image=null,this.cropRect=null,this.scale=1,this.dragging=!1}connectedCallback(){super.connectedCallback(),this.#a=new ResizeObserver(()=>this.fitStage()),this.#a.observe(this),this.syncFormValue()}disconnectedCallback(){super.disconnectedCallback(),this.#a?.disconnect(),this.revokeObjectUrl()}firstUpdated(){this.src&&!this.image&&this.loadImage(this.src)}updated(t){super.updated(t),t.has("src")&&void 0!==t.get("src")&&this.src&&this.loadImage(this.src),t.has("aspectRatio")&&this.image&&(this.cropRect=this.fitCrop(this.cropRect),this.commit()),["maxWidth","maxHeight","type","quality"].some(e=>t.has(e))&&this.syncFormValue(),t.has("required")&&this.updateValidity(),(t.has("image")||t.has("scale"))&&this.drawStage()}formResetCallback(){this.src?this.loadImage(this.src):this.clear()}formDisabledCallback(t){this.disabled=t}get hasImage(){return!!this.image}get ratio(){return(t=>{if(!t)return null;const[e,i=1]=String(t).split(/[:/]/).map(Number),a=e/i;return Number.isFinite(a)&&a>0?a:null})(this.aspectRatio)}get crop(){if(!this.cropRect)return null;const{x:t,y:e,width:i,height:a}=this.cropRect;return{x:Math.round(t),y:Math.round(e),width:Math.round(i),height:Math.round(a)}}set crop(t){this.image&&t&&(this.cropRect=this.fitCrop({x:t.x,y:t.y,width:t.width,height:t.height}),this.commit())}get outputSize(){if(!this.cropRect)return null;const{width:t,height:e}=this.cropRect,i=Math.min(1,this.maxWidth>0?this.maxWidth/t:1/0,this.maxHeight>0?this.maxHeight/e:1/0);return{width:Math.max(1,Math.round(t*i)),height:Math.max(1,Math.round(e*i))}}loadImage=async t=>{if(!t)return this.clear();const e=new Image;let i=t;t instanceof Blob?i=URL.createObjectURL(t):/^(blob|data):/.test(t)||(e.crossOrigin="anonymous"),e.src=i;try{await e.decode()}catch(e){return t instanceof Blob&&URL.revokeObjectURL(i),this.dispatchEvent(new CustomEvent("error",{detail:{message:"The file could not be loaded as an image."},bubbles:!0})),!1}return this.revokeObjectUrl(),t instanceof Blob&&(this.#t=i),this.#e=t instanceof File?t.name:"",this.image=e,this.fitStage(),this.cropRect=this.fitCrop(null),this.dispatchEvent(new CustomEvent("load",{detail:{width:e.naturalWidth,height:e.naturalHeight},bubbles:!0})),this.commit(),!0};clear=()=>{this.revokeObjectUrl(),this.#e="",this.image=null,this.cropRect=null,this.commit()};openFilePicker=()=>{this.disabled||this.shadowRoot.getElementById("file").click()};getCroppedCanvas=()=>{if(!this.image)return null;const{x:t,y:e,width:i,height:a}=this.cropRect,r=this.outputSize,s=document.createElement("canvas");s.width=r.width,s.height=r.height;const n=s.getContext("2d");return n.imageSmoothingQuality="high","image/jpeg"===this.type&&(n.fillStyle="#fff",n.fillRect(0,0,r.width,r.height)),n.drawImage(this.image,t,e,i,a,0,0,r.width,r.height),s};toBlob=(t=this.type,e=this.quality)=>new Promise(i=>{const a=this.getCroppedCanvas();if(!a)return i(null);a.toBlob(i,t,e)});toDataURL=(t=this.type,e=this.quality)=>this.getCroppedCanvas()?.toDataURL(t,e)??null;toFile=async t=>{const e=await this.toBlob();if(!e)return null;const i=(this.#e||"image").replace(/\.[^.]+$/,"");return new File([e],t||`${i}-cropped.${s[e.type]||"png"}`,{type:e.type})};revokeObjectUrl=()=>{this.#t&&URL.revokeObjectURL(this.#t),this.#t=null};fitCrop=t=>{const e=this.image.naturalWidth,i=this.image.naturalHeight,r=this.ratio;let{x:s,y:n,width:h,height:o}=t||{x:0,y:0,width:e,height:i};if(r){if(t){const t=s+h/2,e=n+o/2;h=Math.min(h,o*r),o=h/r,s=t-h/2,n=e-o/2}h/o>e/i?(h=Math.min(h,e),o=h/r):(o=Math.min(o,i),h=o*r),h>e&&(h=e,o=h/r),o>i&&(o=i,h=o*r),t||(s=(e-h)/2,n=(i-o)/2)}return h=a(h,1,e),o=a(o,1,i),{x:a(s,0,e-h),y:a(n,0,i-o),width:h,height:o}};fitStage=()=>{if(!this.image)return;const t=parseFloat(getComputedStyle(this).getPropertyValue("--crop_max_height"))||480,e=this.clientWidth||this.image.naturalWidth;this.scale=Math.min(e/this.image.naturalWidth,t/this.image.naturalHeight)};drawStage=()=>{const t=this.shadowRoot.getElementById("canvas");if(!t||!this.image)return;const e=window.devicePixelRatio||1;t.width=Math.round(this.image.naturalWidth*this.scale*e),t.height=Math.round(this.image.naturalHeight*this.scale*e),t.getContext("2d").drawImage(this.image,0,0,t.width,t.height)};updateValidity=()=>{this.required&&!this.image?this.internals.setValidity({valueMissing:!0},"Please select an image.",this.shadowRoot.getElementById("upload")||void 0):this.internals.setValidity({})};syncFormValue=async()=>{const t=++this.#i;this.updateValidity();const e=await this.toFile();t===this.#i&&this.internals.setFormValue(e)};commit=()=>{this.syncFormValue(),this.dispatchEvent(new CustomEvent("change",{detail:{crop:this.crop,...this.outputSize||{width:0,height:0}},bubbles:!0}))};handleFileChange=t=>{const[e]=t.target.files;t.target.value="",e&&this.acceptFile(e)};acceptFile=t=>{if(!t.type.startsWith("image/"))return this.dispatchEvent(new CustomEvent("error",{detail:{message:"Please choose an image file."},bubbles:!0}));this.loadImage(t)};handleDragOver=t=>{!this.disabled&&t.dataTransfer?.types.includes("Files")&&(t.preventDefault(),this.setAttribute("dragover",""))};handleDragLeave=()=>this.removeAttribute("dragover");handleDrop=t=>{this.removeAttribute("dragover"),!this.disabled&&t.dataTransfer?.files.length&&(t.preventDefault(),this.acceptFile(t.dataTransfer.files[0]))};handlePointerDown=t=>{this.disabled||t.button>0||(t.preventDefault(),t.currentTarget.setPointerCapture(t.pointerId),this.#r={handle:t.target.dataset.handle||"move",startX:t.clientX,startY:t.clientY,rect:{...this.cropRect}},this.dragging=!0)};handlePointerMove=t=>{if(!this.#r)return;const{handle:e,startX:i,startY:r,rect:s}=this.#r,n=(t.clientX-i)/this.scale,h=(t.clientY-r)/this.scale,o=this.image.naturalWidth,l=this.image.naturalHeight;this.cropRect="move"===e?{...s,x:a(s.x+n,0,o-s.width),y:a(s.y+h,0,l-s.height)}:this.resizeRect(e,s,(e.includes("w")?s.x:s.x+s.width)+n,(e.includes("n")?s.y:s.y+s.height)+h)};handlePointerUp=()=>{this.#r&&(this.#r=null,this.dragging=!1,this.commit())};handleKeyDown=t=>{const e={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[t.key];if(!e||this.disabled)return;t.preventDefault();const i=(t.ctrlKey||t.metaKey?10:1)/this.scale,{x:r,y:s,width:n,height:h}=this.cropRect,o=this.image.naturalWidth,l=this.image.naturalHeight;if(t.shiftKey){const t=n+e[0]*i+e[1]*i*(this.ratio||n/h),a=this.ratio?{width:t,height:t/this.ratio}:{width:n+e[0]*i,height:h+e[1]*i};this.cropRect=this.fitCrop({x:r,y:s,...a})}else this.cropRect={x:a(r+e[0]*i,0,o-n),y:a(s+e[1]*i,0,l-h),width:n,height:h};this.commit()};resizeRect=(t,e,i,r)=>{const s=this.image.naturalWidth,n=this.image.naturalHeight,h=this.ratio,o=24/this.scale,l=t.includes("w"),c=t.includes("e"),d=t.includes("n"),p=t.includes("s"),g=e.x+e.width,u=e.y+e.height;if(!h){const t=l?a(i,0,g-o):e.x,h=c?a(i,e.x+o,s):g,m=d?a(r,0,u-o):e.y;return{x:t,y:m,width:h-t,height:(p?a(r,e.y+o,n):u)-m}}const m=l?g:c?e.x:e.x+e.width/2,b=d?u:p?e.y:e.y+e.height/2,f=l||c,y=d||p,x=f?l?m:s-m:2*Math.min(m,s-m),v=y?d?b:n-b:2*Math.min(b,n-b),w=f?Math.abs(i-m):0,R=y?Math.abs(r-b):0,k=a(Math.max(w,R*h),o,Math.max(o,Math.min(x,v*h))),$=k/h;return{x:l?m-k:c?m:m-k/2,y:d?b-$:p?b:b-$/2,width:k,height:$}};renderEmpty(){return t`
			<div id="dropzone">
				<k-icon name="image" class="dropzone-icon"></k-icon>
				<button id="upload" type="button" ?disabled=${this.disabled} @click=${this.openFilePicker}>${this.label}</button>
				<span class="placeholder">${this.placeholder}</span>
			</div>
		`}renderCropper(){const{x:e,y:i,width:a,height:s}=this.cropRect,n=this.scale;return t`
			<div id="stage" style="width:${this.image.naturalWidth*n}px;height:${this.image.naturalHeight*n}px">
				<canvas id="canvas"></canvas>
				<div
					id="box"
					class=${this.dragging?"dragging":""}
					tabindex=${this.disabled?-1:0}
					role="group"
					aria-label="Crop area"
					style="left:${e*n}px;top:${i*n}px;width:${a*n}px;height:${s*n}px"
					@pointerdown=${this.handlePointerDown}
					@pointermove=${this.handlePointerMove}
					@pointerup=${this.handlePointerUp}
					@pointercancel=${this.handlePointerUp}
					@keydown=${this.handleKeyDown}
				>
					${r.map(e=>t`<span class="handle ${e}" data-handle=${e}></span>`)}
				</div>
			</div>
			<div id="bar">
				<span id="size">${this.outputSize.width} &times; ${this.outputSize.height}</span>
				<span class="spacer"></span>
				<button type="button" class="mr" ?disabled=${this.disabled} @click=${this.openFilePicker}>Change</button>
				<button type="button" class="danger" ?disabled=${this.disabled} @click=${this.clear}>Remove</button>
			</div>
		`}render(){return t`
			<div
				id="root"
				@dragover=${this.handleDragOver}
				@dragleave=${this.handleDragLeave}
				@drop=${this.handleDrop}
			>
				<input id="file" type="file" accept="image/*" hidden @change=${this.handleFileChange} />
				${this.image&&this.cropRect?this.renderCropper():this.renderEmpty()}
			</div>
		`}static styles=e`
		:host {
			--crop_max_height: 480;
			--crop_color: var(--c_primary);
			--crop_handle_size: 0.875rem;
			display: block;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		#file {
			display: none;
		}
		#dropzone {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--spacer_h);
			padding: calc(var(--spacer) * 2) var(--spacer);
			border: 2px dashed var(--c_border);
			border-radius: var(--radius);
			text-align: center;
		}
		:host([dragover]) #dropzone {
			border-color: var(--crop_color);
			background: color-mix(in srgb, var(--crop_color) 10%, transparent);
		}
		.dropzone-icon {
			font-size: 2.5rem;
			color: var(--tc_muted);
		}
		.placeholder {
			color: var(--tc_muted);
		}
		#stage {
			position: relative;
			overflow: hidden;
			max-width: 100%;
			margin: 0 auto;
			border-radius: var(--radius);
			background: repeating-conic-gradient(var(--c_border) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px;
			user-select: none;
			-webkit-user-select: none;
		}
		#canvas {
			display: block;
			width: 100%;
			height: 100%;
		}
		#box {
			position: absolute;
			box-sizing: border-box;
			border: 2px solid var(--crop_color);
			box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
			cursor: move;
			touch-action: none;
			outline: none;
			background:
				linear-gradient(to right, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.4) calc(33.33% - 0.5px) calc(33.33% + 0.5px), transparent calc(33.33% + 0.5px) calc(66.66% - 0.5px), rgba(255, 255, 255, 0.4) calc(66.66% - 0.5px) calc(66.66% + 0.5px), transparent calc(66.66% + 0.5px)),
				linear-gradient(to bottom, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.4) calc(33.33% - 0.5px) calc(33.33% + 0.5px), transparent calc(33.33% + 0.5px) calc(66.66% - 0.5px), rgba(255, 255, 255, 0.4) calc(66.66% - 0.5px) calc(66.66% + 0.5px), transparent calc(66.66% + 0.5px));
		}
		#box:focus-visible {
			box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 0 2px var(--c_bg), 0 0 0 4px var(--crop_color);
		}
		.handle {
			position: absolute;
			width: var(--crop_handle_size);
			height: var(--crop_handle_size);
			box-sizing: border-box;
			border: 2px solid var(--crop_color);
			border-radius: 50%;
			background: var(--c_bg);
			touch-action: none;
		}
		.handle.nw { left: 0; top: 0; cursor: nwse-resize; transform: translate(0, 0); }
		.handle.n { left: 50%; top: 0; cursor: ns-resize; transform: translate(-50%, 0); }
		.handle.ne { left: 100%; top: 0; cursor: nesw-resize; transform: translate(-100%, 0); }
		.handle.e { left: 100%; top: 50%; cursor: ew-resize; transform: translate(-100%, -50%); }
		.handle.se { left: 100%; top: 100%; cursor: nwse-resize; transform: translate(-100%, -100%); }
		.handle.s { left: 50%; top: 100%; cursor: ns-resize; transform: translate(-50%, -100%); }
		.handle.sw { left: 0; top: 100%; cursor: nesw-resize; transform: translate(0, -100%); }
		.handle.w { left: 0; top: 50%; cursor: ew-resize; transform: translate(0, -50%); }
		#bar {
			display: flex;
			align-items: center;
			margin-top: var(--spacer_h);
		}
		#size {
			color: var(--tc_muted);
			font-variant-numeric: tabular-nums;
		}
		.spacer {
			flex: 1;
		}
	`}window.customElements.define("k-image-crop",n);