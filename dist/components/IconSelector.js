import{html as e,css as t,ref as a,createRef as i,nothing as o}from"../lit-all.min.js";import l from"./ShadowComponent.js";import"./Icon.js";import"./Dialog.js";import"./FilterList.js";import"./FilterItem.js";import{boolExists as r}from"../utils/propConverters.js";export default class s extends l{static formAssociated=!0;static properties={value:{type:String,reflect:!0},name:{type:String,reflect:!0},icons:{type:String},dialogTitle:{type:String,attribute:"dialog-title"},placeholder:{type:String},iconOnly:{type:Boolean,reflect:!0,attribute:"icon-only",converter:r},allowClear:{type:Boolean,reflect:!0,attribute:"allow-clear",converter:r},autoChoose:{type:Boolean,reflect:!0,attribute:"auto-choose",converter:r},readonly:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},dialogOpen:{type:Boolean,state:!0},pendingValue:{type:String,state:!0}};#e=i();#t=i();#a=i();#i="";constructor(){super(),this.internals=this.attachInternals(),this.value="",this.name="",this.icons="",this.dialogTitle="Choose an Icon",this.placeholder="Choose an Icon",this.iconOnly=!1,this.allowClear=!1,this.dialogOpen=!1,this.pendingValue="",this.autoChoose=!1,this.readonly=!1,this.disabled=!1}firstUpdated(){super.firstUpdated(),this.#i=this.value}updated(e){super.updated(e),e.has("value")&&this.internals.setFormValue(this.value)}formResetCallback(){this.value=this.#i}formStateRestoreCallback(e){this.value=e}formDisabledCallback(e){this.disabled=e}#o=async()=>{this.disabled||this.readonly||(this.pendingValue=this.value,this.dialogOpen=!0,await this.updateComplete,this.#e.value.open(),setTimeout(()=>this.#a.value?.focus()))};#l=()=>{this.dialogOpen=!1};#r=()=>{this.allowClear&&(this.pendingValue="",""!==this.value&&(this.value="",this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0}))))};#s=()=>{this.pendingValue!==this.value&&(this.value=this.pendingValue,this.dispatchEvent(new CustomEvent("change",{detail:{value:this.value},bubbles:!0})))};#n=e=>{this.#t.value?.filter(e.target.value)};#c=e=>{this.#t.value?.handleKeydown(e)};#d=(e,t)=>{e.preventDefault(),this.pendingValue=t.value,this.autoChoose&&(this.#s(),this.#e.value.close())};#h=()=>{const e=this.icons?this.icons.split(",").map(e=>e.trim()).filter(Boolean):s.icons,t=new Map(e.map(e=>[e,{name:e,src:""}]));return s.#p.forEach((e,a)=>t.set(a,{name:a,src:e})),[...t.values()].map(e=>({...e,value:e.src?`src:${e.src}`:e.name}))};render(){const t=this.value||"",i=this.#h(),l=t.startsWith("src:"),r=i.find(e=>e.value===t)||{name:l?t.slice(4).split("/").pop().replace(/\.svg$/,""):t,src:l?t.slice(4):""};return e`
			<button
				id="trigger"
				type="button"
				?disabled=${this.disabled}
				title=${this.iconOnly?r.name||this.placeholder:o}
				aria-label=${this.iconOnly?r.name||this.placeholder:o}
				@click=${this.#o}
			>
				${r.name?e`
					${r.src?e`<k-icon src=${r.src}></k-icon>`:e`<k-icon name=${r.name}></k-icon>`}
					${this.iconOnly?"":e`<span>${r.name}</span>`}
				`:this.iconOnly?e`<k-icon></k-icon>`:e`<span class="tc-muted">${this.placeholder}</span>`}
			</button>
			<k-dialog
				${a(this.#e)}
				cancel-text=${this.allowClear?"Clear":"Cancel"}
				confirm-text=${this.autoChoose?"":"Choose Icon"}
				.confirmAction=${this.#s}
				.cancelAction=${this.#r}
				@close=${this.#l}
			>
				<h5 slot="title" class="pyh px m0">${this.dialogTitle}</h5>
				${this.dialogOpen?e`
					<div class="p">
						<input
							${a(this.#a)}
							type="search"
							class="mb"
							placeholder="Filter icons..."
							autocomplete="off"
							@input=${this.#n}
							@keydown=${this.#c}
						/>
						<k-filter-list ${a(this.#t)}>
						${i.map(t=>e`
							<k-filter-item filter-keywords=${t.name}>
								<a
									href="#"
									class="icon-option ph r${t.value===this.pendingValue?" bg-primary":""}"
									title=${t.name}
									aria-label=${t.name}
									@click=${e=>this.#d(e,t)}
								>${t.src?e`<k-icon src=${t.src}></k-icon>`:e`<k-icon name=${t.name}></k-icon>`}</a>
							</k-filter-item>
						`)}
					</k-filter-list>
					</div>
				`:""}
			</k-dialog>
		`}static styles=t`
		:host {
			display: block;
		}
		:host([icon-only]) {
			display: inline-block;
		}
		:host([icon-only]) #trigger {
			width: auto;
		}
		:host([disabled]) {
			opacity: 0.5;
			pointer-events: none;
		}
		:host([readonly]) {
			opacity: 0.75;
		}
		:host([readonly]) #trigger {
			pointer-events: none;
		}
		#trigger {
			display: flex;
			align-items: center;
			gap: var(--spacer_h);
			width: 100%;
			box-sizing: border-box;
			padding: var(--spacer_h) var(--spacer);
			border: 1px solid var(--c_border);
			border-radius: var(--radius);
			background: var(--c_bg);
			color: var(--tc);
			font: inherit;
			text-align: left;
			cursor: pointer;
			transition: border-color var(--animation_ms);
		}
		#trigger:focus-visible {
			outline: none;
			border-color: var(--c_primary);
		}
		k-dialog {
			--width: 32rem;
		}
		k-filter-list {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
			gap: var(--spacer_h);
		}
		.icon-option {
			color: var(--tc);
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 1.25rem;
			transition: background var(--animation_ms);
		}
		.icon-option.bg-primary {
			color: var(--tc_light);
		}
		.icon-option:hover:not(.bg-primary) {
			background: var(--c_bg__alt);
		}
	`;static#p=new Map;static add(e,t=""){s.#p.set(e,t)}static icons=["account-circle","account_tree","add","arrow","arrow-circle","arrow-line","arrow_drop_down","arrows-outward","attach_file","auto_fix_high","bookmark_add","button","call","cancel","card","cards","chat_bubble","check","check_circle","chevron","chevron-double","chevron-line","close","code","code_blocks","comment","content_copy","contrast","copy","dashboard_customize","delete","delete_sweep","desktop_windows","done_all","dot","download","drag-handle","edit","error","expand_circle","export-file","expansion_panels","fast_forward","fast_rewind","file","file-text","filter","fit_screen","folder","folder-open","format_align_center","format_align_justify","format_align_left","format_align_right","format_bold","format_clear","format_color_fill","format_color_text","format_h1","format_h2","format_h3","format_h4","format_h5","format_h6","format_italic","format_list_bulleted","format_list_numbered","format_paragraph","format_quote","format_strikethrough","format_underlined","frame_source","fullscreen","fullscreen_exit","gallery-thumbnail","github-mark","help","hide","iframe","image","content_slider","keyboard","label","library_add","license","link","mail","map","mark_chat_unread","menu","mic","mode-auto","mode-dark","mode-light","more_vert","npm","open_in_browser","panorama","pause","photo_library","pip","play","public","public_off","queue_music","record_voice_over","redo","repeat","repeat_one","replay","restore_page","save","search","send","settings","show","shuffle","skip_next","skip_previous","smartphone","star","star_filled","stop","strikethrough_s","tab","table","table-visibility","tablet","text_decrease","text_fields","text_increase","undo","unfold_less","unfold_more","upload","view_column","visibility","volume_off","volume_up","warning","width_full","wrap_text","wysiwyg"]}window.customElements.define("k-icon-selector",s);