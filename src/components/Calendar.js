import { html, css } from '../lit-all.min.js';
import ShadowComponent from './ShadowComponent.js';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default class Calendar extends ShadowComponent {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    name: { type: String, reflect: true },
    mode: { type: String, reflect: true },
    min: { type: String, reflect: true },
    max: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    view: { state: true },
    hoverDate: { state: true }
  };

  /*
    Lifecycle Callbacks
  */
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.value = '';
    this.name = '';
    this.mode = 'single';
    this.min = '';
    this.max = '';
    this.disabled = false;
    this.required = false;
    const today = new Date();
    this.view = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    this.hoverDate = null;
  }

  #skipViewSync = false;

  updated(changedProperties) {
    super.updated(changedProperties);
    this.internals.setFormValue(this.value);
    if(this.required && !this.value){
      this.internals.setValidity(
        { valueMissing: true },
        'Please select a date.',
        this.shadowRoot?.querySelector('.day')
      );
    } else {
      this.internals.setValidity({});
    }
    if(changedProperties.has('value') && changedProperties.get('value') !== undefined){
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true
      }));
    }
    if(changedProperties.has('value') && this.value && !this.#skipViewSync){
      const first = this.fromIso(this.value.split(',')[0]);
      if(first){
        const newView = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`;
        if(newView !== this.view){
          this.view = newView;
        }
      }
    }
    this.#skipViewSync = false;
  }

  /*
    Utility
  */
  get isRange() {
    return this.mode === 'range';
  }

  get viewYear() {
    return Number(this.view.split('-')[0]);
  }

  get viewMonth() {
    return Number(this.view.split('-')[1]) - 1;
  }

  get parsed() {
    if(!this.value){
      return this.isRange ? { start: null, end: null } : { date: null };
    }
    if(this.isRange){
      const [s, e] = this.value.split(',');
      return {
        start: s ? this.fromIso(s) : null,
        end: e ? this.fromIso(e) : null
      };
    }
    return { date: this.fromIso(this.value) };
  }

  toIso = (date) => {
    if(!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  fromIso = (str) => {
    if(!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    if(isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m - 1, d);
  };

  isSameDay = (a, b) => {
    if(!a || !b) return false;
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  };

  isWithinRange = (date, start, end) => {
    if(!start || !end || !date) return false;
    const t = date.getTime();
    return t > start.getTime() && t < end.getTime();
  };

  resolveDate = (input) => {
    if(!input) return null;
    const key = String(input).toLowerCase();
    if(key === 'today' || key === 'tomorrow' || key === 'yesterday'){
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      if(key === 'tomorrow') d.setDate(d.getDate() + 1);
      if(key === 'yesterday') d.setDate(d.getDate() - 1);
      return d;
    }
    return this.fromIso(input);
  };

  get minDate() {
    return this.resolveDate(this.min) || this.fromIso('1900-01-01');
  }

  get maxDate() {
    if(this.max) return this.resolveDate(this.max);
    const now = new Date();
    return new Date(now.getFullYear() + 10, 11, 31);
  }

  isDisabledDate = (date) => {
    if(!date) return false;
    const minDate = this.minDate;
    if(minDate && date < minDate) return true;
    const maxDate = this.maxDate;
    if(maxDate && date > maxDate) return true;
    return false;
  };

  get availableYears() {
    const minY = this.minDate?.getFullYear() ?? 1900;
    const maxY = this.maxDate?.getFullYear() ?? (new Date().getFullYear() + 10);
    const years = [];
    for(let y = minY; y <= maxY; y++) years.push(y);
    return years;
  }

  isMonthDisabled = (year, month) => {
    const lastDay = new Date(year, month + 1, 0);
    const firstDay = new Date(year, month, 1);
    const min = this.minDate;
    const max = this.maxDate;
    if(min && lastDay < min) return true;
    if(max && firstDay > max) return true;
    return false;
  };

  get weekGrid() {
    const year = this.viewYear;
    const month = this.viewMonth;
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);
    const weeks = [];
    for(let w = 0; w < 6; w++){
      const days = [];
      for(let d = 0; d < 7; d++){
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + w * 7 + d);
        days.push(date);
      }
      weeks.push(days);
    }
    return weeks;
  }

  get monthLabel() {
    return `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;
  }

  /*
    Navigation
  */
  prevMonth = () => {
    const d = new Date(this.viewYear, this.viewMonth - 1, 1);
    this.view = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  nextMonth = () => {
    const d = new Date(this.viewYear, this.viewMonth + 1, 1);
    this.view = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  goToMonth = (year, month) => {
    this.view = `${year}-${String(month + 1).padStart(2, '0')}`;
  };

  goToToday = () => {
    const today = new Date();
    this.view = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  /*
    Event Handlers
  */
  handleDayClick = (date) => {
    if(this.disabled || this.isDisabledDate(date)) return;
    this.#skipViewSync = true;
    if(this.isRange){
      const { start, end } = this.parsed;
      if(!start || end){
        this.value = this.toIso(date);
      } else if(date < start){
        this.value = `${this.toIso(date)},${this.toIso(start)}`;
      } else {
        this.value = `${this.toIso(start)},${this.toIso(date)}`;
      }
    } else {
      this.value = this.toIso(date);
    }
  };

  handleDayHover = (date) => {
    if(this.isRange){
      this.hoverDate = date;
    }
  };

  handleMouseLeave = () => {
    if(this.isRange){
      this.hoverDate = null;
    }
  };

  handleMonthChange = (e) => {
    this.goToMonth(this.viewYear, Number(e.target.value));
  };

  handleYearChange = (e) => {
    this.goToMonth(Number(e.target.value), this.viewMonth);
  };

  /*
    Rendering
  */
  render() {
    const today = new Date();
    const parsed = this.parsed;
    const single = parsed.date;
    const rawStart = parsed.start;
    const rawEnd = parsed.end;
    const previewEnd = this.isRange && rawStart && !rawEnd && this.hoverDate ? this.hoverDate : rawEnd;
    const rangeStart = this.isRange && rawStart && previewEnd && rawStart > previewEnd ? previewEnd : rawStart;
    const rangeEnd = this.isRange && rawStart && previewEnd && rawStart > previewEnd ? rawStart : previewEnd;

    return html`
      <div class="header">
        <select
          class="month-select"
          aria-label="Month"
          ?disabled=${this.disabled}
          @change=${this.handleMonthChange}
        >
          ${MONTH_NAMES.map((name, i) => html`
            <option
              value=${i}
              ?selected=${i === this.viewMonth}
              ?disabled=${this.isMonthDisabled(this.viewYear, i)}
            >${name}</option>
          `)}
        </select>
        <select
          class="year-select"
          aria-label="Year"
          ?disabled=${this.disabled}
          @change=${this.handleYearChange}
        >
          ${this.availableYears.map(y => html`
            <option value=${y} ?selected=${y === this.viewYear}>${y}</option>
          `)}
        </select>
      </div>
      <div class="grid" @mouseleave=${this.handleMouseLeave}>
        <div class="row head">
          ${DAY_LABELS.map(d => html`<div class="dow">${d}</div>`)}
        </div>
        ${this.weekGrid.map(week => html`
          <div class="row">
            ${week.map(date => {
              const outside = date.getMonth() !== this.viewMonth;
              const isToday = this.isSameDay(date, today);
              const isSelected = !this.isRange && this.isSameDay(date, single);
              const isStart = this.isRange && this.isSameDay(date, rangeStart);
              const isEnd = this.isRange && this.isSameDay(date, rangeEnd);
              const inRange = this.isRange && this.isWithinRange(date, rangeStart, rangeEnd);
              const disabled = this.isDisabledDate(date);
              const isPreview = this.isRange && !rawEnd && (isStart || isEnd || inRange) && !isSelected;
              const classes = [
                'day',
                outside ? 'outside' : '',
                isToday ? 'today' : '',
                isSelected ? 'selected' : '',
                isStart ? 'range-start' : '',
                isEnd && !isStart ? 'range-end' : '',
                inRange ? 'in-range' : '',
                isPreview ? 'preview' : '',
                disabled ? 'disabled' : ''
              ].filter(Boolean).join(' ');
              return html`
                <button
                  type="button"
                  class="no-btn ${classes}"
                  ?disabled=${disabled || this.disabled}
                  aria-selected=${isSelected || isStart || isEnd ? 'true' : 'false'}
                  @click=${() => this.handleDayClick(date)}
                  @mouseenter=${() => this.handleDayHover(date)}
                >${date.getDate()}</button>
              `;
            })}
          </div>
        `)}
      </div>
    `;
  }

  /*
    Styles
  */
  static styles = css`
    :host {
      --day_size: 2rem;
      --day_radius: var(--radius);
      --day_bg__selected: var(--c_primary);
      --day_tc__selected: white;
      --day_bg__range: var(--c_bg__alt);
      --day_bg__hover: var(--c_bg__alt);

      display: inline-block;
      border: 1px solid var(--c_border);
      border-radius: var(--radius);
      padding: 0.5rem;
      background: var(--c_bg);
      user-select: none;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem;
      margin-bottom: 0.25rem;
    }
    .month-select,
    .year-select {
      font-weight: 600;
      width: auto;
    }
    .month-select {
      flex: 1;
    }
    .grid {
      display: flex;
      flex-direction: column;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(7, var(--day_size));
    }
    .row.head {
      margin-bottom: 0.25rem;
    }
    .dow {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--tc_muted);
      font-weight: 500;
      height: var(--day_size);
    }
    .day {
      appearance: none;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--day_radius);
      width: var(--day_size);
      height: var(--day_size);
      cursor: pointer;
      color: var(--tc);
      font: inherit;
      font-size: 0.875rem;
      padding: 0;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background var(--animation_ms), color var(--animation_ms);
    }
    .day:hover:not(:disabled):not(.selected):not(.range-start):not(.range-end) {
      background: var(--day_bg__hover);
    }
    .day:focus-visible {
      outline: none;
      border-color: var(--c_primary);
      box-shadow: var(--focus_shadow);
      z-index: 1;
    }
    .day.outside {
      color: var(--tc_muted);
      opacity: 0.5;
    }
    .day.today {
      font-weight: 700;
      border-color: var(--c_primary);
    }
    .day.selected,
    .day.in-range,
    .day.range-start,
    .day.range-end {
      background: var(--day_bg__selected);
      color: var(--day_tc__selected);
      border-color: transparent;
    }
    .day.in-range {
      border-radius: 0;
    }
    .day.range-start:not(.range-end) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .day.range-end:not(.range-start) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .day.outside.in-range,
    .day.outside.range-start,
    .day.outside.range-end {
      opacity: 0.6;
    }
    .day.preview.in-range,
    .day.preview.range-start,
    .day.preview.range-end {
      opacity: 0.75;
    }
    .day:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  `;
}

customElements.define('k-calendar', Calendar);
