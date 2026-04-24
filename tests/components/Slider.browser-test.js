import Slider from '../../src/components/Slider.js';

const createSlider = async (attrs = {}) => {
  const container = document.createElement('div');
  const parts = [];
  if(attrs.value !== undefined) parts.push(`value="${attrs.value}"`);
  if(attrs.name !== undefined) parts.push(`name="${attrs.name}"`);
  if(attrs.min !== undefined) parts.push(`min="${attrs.min}"`);
  if(attrs.max !== undefined) parts.push(`max="${attrs.max}"`);
  if(attrs.steps !== undefined) parts.push(`steps="${attrs.steps}"`);
  if(attrs.format !== undefined) parts.push(`format="${attrs.format}"`);
  if(attrs.disabled) parts.push('disabled');
  if(attrs.vertical) parts.push('vertical');
  if(attrs.tooltip) parts.push('tooltip');
  container.innerHTML = `<k-slider ${parts.join(' ')}>${attrs.label || ''}</k-slider>`;
  document.body.appendChild(container);
  const el = container.querySelector('k-slider');
  await el.updateComplete;
  return { container, el };
};

const cleanup = (container) => {
  if(container && container.parentNode){
    container.parentNode.removeChild(container);
  }
};

export default {
  /*
    Element Creation
  */
  'should create slider element': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(!el){
      cleanup(container);
      return fail('Slider element should be created');
    }
    if(!(el instanceof Slider)){
      cleanup(container);
      return fail('Element should be instance of Slider');
    }
    cleanup(container);
    pass('Slider element created correctly');
  },

  'should have shadow root': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(!el.shadowRoot){
      cleanup(container);
      return fail('Slider should have shadow root');
    }
    cleanup(container);
    pass('Slider has shadow root');
  },

  /*
    Default Properties
  */
  'should have default value of "0"': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.value !== '0'){
      cleanup(container);
      return fail(`Expected value "0", got "${el.value}"`);
    }
    cleanup(container);
    pass('Default value is "0"');
  },

  'should have default min of 0': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.min !== 0){
      cleanup(container);
      return fail(`Expected min 0, got ${el.min}`);
    }
    cleanup(container);
    pass('Default min is 0');
  },

  'should have default max of 100': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.max !== 100){
      cleanup(container);
      return fail(`Expected max 100, got ${el.max}`);
    }
    cleanup(container);
    pass('Default max is 100');
  },

  'should have default steps of null': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.steps !== null){
      cleanup(container);
      return fail(`Expected steps null, got ${el.steps}`);
    }
    cleanup(container);
    pass('Default steps is null');
  },

  'should have default disabled of false': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.disabled !== false){
      cleanup(container);
      return fail(`Expected disabled false, got ${el.disabled}`);
    }
    cleanup(container);
    pass('Default disabled is false');
  },

  'should have default vertical of false': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.vertical !== false){
      cleanup(container);
      return fail(`Expected vertical false, got ${el.vertical}`);
    }
    cleanup(container);
    pass('Default vertical is false');
  },

  'should not be a range by default': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.isRange !== false){
      cleanup(container);
      return fail(`Expected isRange false, got ${el.isRange}`);
    }
    cleanup(container);
    pass('Default isRange is false');
  },

  /*
    Property Reflection
  */
  'should reflect value attribute': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    if(el.value !== '50'){
      cleanup(container);
      return fail(`Expected value "50", got "${el.value}"`);
    }
    cleanup(container);
    pass('Value attribute reflects correctly');
  },

  'should reflect min attribute': async ({pass, fail}) => {
    const { container, el } = await createSlider({ min: 10 });
    if(el.min !== 10){
      cleanup(container);
      return fail(`Expected min 10, got ${el.min}`);
    }
    cleanup(container);
    pass('Min attribute reflects correctly');
  },

  'should reflect max attribute': async ({pass, fail}) => {
    const { container, el } = await createSlider({ max: 200 });
    if(el.max !== 200){
      cleanup(container);
      return fail(`Expected max 200, got ${el.max}`);
    }
    cleanup(container);
    pass('Max attribute reflects correctly');
  },

  'should reflect steps attribute': async ({pass, fail}) => {
    const { container, el } = await createSlider({ steps: '0,25,50,75,100' });
    if(el.steps !== '0,25,50,75,100'){
      cleanup(container);
      return fail(`Expected steps "0,25,50,75,100", got ${el.steps}`);
    }
    cleanup(container);
    pass('Steps attribute reflects correctly');
  },

  /*
    stepValues Getter
  */
  'should parse step values correctly': async ({pass, fail}) => {
    const { container, el } = await createSlider({ steps: '10,30,50,70,90' });
    const sv = el.stepValues;
    if(!sv || sv.length !== 5 || sv[0] !== 10 || sv[4] !== 90){
      cleanup(container);
      return fail(`Expected [10,30,50,70,90], got ${JSON.stringify(sv)}`);
    }
    cleanup(container);
    pass('stepValues parsed correctly');
  },

  'should return null stepValues when no steps': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.stepValues !== null){
      cleanup(container);
      return fail(`Expected null, got ${JSON.stringify(el.stepValues)}`);
    }
    cleanup(container);
    pass('stepValues is null when no steps');
  },

  /*
    lower / upper Getters
  */
  'lower getter should return numeric value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '42' });
    if(el.lower !== 42){
      cleanup(container);
      return fail(`Expected lower 42, got ${el.lower}`);
    }
    cleanup(container);
    pass('lower getter works');
  },

  'lower getter should return first part of range value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20,80' });
    if(el.lower !== 20){
      cleanup(container);
      return fail(`Expected lower 20, got ${el.lower}`);
    }
    cleanup(container);
    pass('lower getter works for range');
  },

  'upper getter should return second part of range value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20,80' });
    if(el.upper !== 80){
      cleanup(container);
      return fail(`Expected upper 80, got ${el.upper}`);
    }
    cleanup(container);
    pass('upper getter works for range');
  },

  'upper getter should return max when not in range mode': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    if(el.upper !== 100){
      cleanup(container);
      return fail(`Expected upper 100, got ${el.upper}`);
    }
    cleanup(container);
    pass('upper getter defaults to max');
  },

  /*
    isRange Getter
  */
  'isRange should be true when value has comma': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20,80' });
    if(el.isRange !== true){
      cleanup(container);
      return fail(`Expected isRange true, got ${el.isRange}`);
    }
    cleanup(container);
    pass('isRange is true for comma-separated value');
  },

  'isRange should be false for single value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    if(el.isRange !== false){
      cleanup(container);
      return fail(`Expected isRange false, got ${el.isRange}`);
    }
    cleanup(container);
    pass('isRange is false for single value');
  },

  /*
    setValue Method
  */
  'should have setValue method': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(typeof el.setValue !== 'function'){
      cleanup(container);
      return fail('Slider should have setValue method');
    }
    cleanup(container);
    pass('Slider has setValue method');
  },

  'setValue should update value': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    el.setValue(42);
    if(el.value !== '42'){
      cleanup(container);
      return fail(`Expected value "42", got "${el.value}"`);
    }
    cleanup(container);
    pass('setValue updates value');
  },

  'setValue should clamp to min': async ({pass, fail}) => {
    const { container, el } = await createSlider({ min: 10, max: 100 });
    el.setValue(5);
    if(el.lower !== 10){
      cleanup(container);
      return fail(`Expected lower 10, got ${el.lower}`);
    }
    cleanup(container);
    pass('setValue clamps to min');
  },

  'setValue should clamp to max': async ({pass, fail}) => {
    const { container, el } = await createSlider({ min: 0, max: 50 });
    el.setValue(80);
    if(el.lower !== 50){
      cleanup(container);
      return fail(`Expected lower 50, got ${el.lower}`);
    }
    cleanup(container);
    pass('setValue clamps to max');
  },

  'setValue should snap to nearest step': async ({pass, fail}) => {
    const { container, el } = await createSlider({ steps: '0,25,50,75,100' });
    el.setValue(30);
    if(el.lower !== 25){
      cleanup(container);
      return fail(`Expected lower 25, got ${el.lower}`);
    }
    cleanup(container);
    pass('setValue snaps to nearest step');
  },

  'setValue should not change value when disabled': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20', disabled: true });
    el.setValue(80);
    if(el.lower !== 20){
      cleanup(container);
      return fail(`Expected lower 20, got ${el.lower}`);
    }
    cleanup(container);
    pass('setValue does nothing when disabled');
  },

  /*
    Events
  */
  'should dispatch change event when value changes': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '0' });
    let eventFired = false;
    let eventValue = null;
    el.addEventListener('change', (e) => {
      eventFired = true;
      eventValue = e.detail.value;
    });
    el.setValue(50);
    await el.updateComplete;
    if(!eventFired){
      cleanup(container);
      return fail('Change event should have fired');
    }
    if(eventValue !== '50'){
      cleanup(container);
      return fail(`Expected event value "50", got "${eventValue}"`);
    }
    cleanup(container);
    pass('Change event dispatched correctly');
  },

  'should not dispatch change event when value stays the same': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    let eventFired = false;
    el.addEventListener('change', () => {
      eventFired = true;
    });
    el.setValue(50);
    await el.updateComplete;
    if(eventFired){
      cleanup(container);
      return fail('Change event should not fire when value unchanged');
    }
    cleanup(container);
    pass('No change event when value unchanged');
  },

  /*
    Percentage Getter
  */
  'should calculate percentage correctly': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50', min: 0, max: 100 });
    if(el.percentage !== 50){
      cleanup(container);
      return fail(`Expected 50%, got ${el.percentage}%`);
    }
    cleanup(container);
    pass('Percentage calculated correctly');
  },

  'should calculate percentage with custom range': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '30', min: 20, max: 40 });
    if(el.percentage !== 50){
      cleanup(container);
      return fail(`Expected 50%, got ${el.percentage}%`);
    }
    cleanup(container);
    pass('Percentage with custom range calculated correctly');
  },

  /*
    Rendering
  */
  'should render track element': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    const track = el.shadowRoot.querySelector('#track');
    if(!track){
      cleanup(container);
      return fail('Track element should exist');
    }
    cleanup(container);
    pass('Track element rendered');
  },

  'should render thumb element': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    const thumb = el.shadowRoot.querySelector('.thumb');
    if(!thumb){
      cleanup(container);
      return fail('Thumb element should exist');
    }
    cleanup(container);
    pass('Thumb element rendered');
  },

  'should render fill element': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    const fill = el.shadowRoot.querySelector('#fill');
    if(!fill){
      cleanup(container);
      return fail('Fill element should exist');
    }
    cleanup(container);
    pass('Fill element rendered');
  },

  'should render step dots when steps are set': async ({pass, fail}) => {
    const { container, el } = await createSlider({ steps: '0,25,50,75,100' });
    const dots = el.shadowRoot.querySelectorAll('.step-dot');
    if(dots.length !== 5){
      cleanup(container);
      return fail(`Expected 5 step dots, got ${dots.length}`);
    }
    cleanup(container);
    pass('Step dots rendered correctly');
  },

  'should not render step dots when no steps': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    const dots = el.shadowRoot.querySelectorAll('.step-dot');
    if(dots.length !== 0){
      cleanup(container);
      return fail(`Expected 0 step dots, got ${dots.length}`);
    }
    cleanup(container);
    pass('No step dots when no steps');
  },

  /*
    Vertical Mode
  */
  'should have vertical attribute when set': async ({pass, fail}) => {
    const { container, el } = await createSlider({ vertical: true, value: '50' });
    if(!el.vertical){
      cleanup(container);
      return fail('Expected vertical to be true');
    }
    if(!el.hasAttribute('vertical')){
      cleanup(container);
      return fail('Expected vertical attribute on element');
    }
    cleanup(container);
    pass('Vertical attribute set correctly');
  },

  'vertical slider should render track': async ({pass, fail}) => {
    const { container, el } = await createSlider({ vertical: true, value: '40' });
    const track = el.shadowRoot.querySelector('#track');
    const fill = el.shadowRoot.querySelector('#fill');
    if(!track || !fill){
      cleanup(container);
      return fail('Vertical slider should render track and fill');
    }
    cleanup(container);
    pass('Vertical slider renders track and fill');
  },

  'vertical slider should render step dots': async ({pass, fail}) => {
    const { container, el } = await createSlider({ vertical: true, steps: '0,50,100' });
    const dots = el.shadowRoot.querySelectorAll('.step-dot');
    if(dots.length !== 3){
      cleanup(container);
      return fail(`Expected 3 step dots, got ${dots.length}`);
    }
    cleanup(container);
    pass('Vertical step dots rendered');
  },

  /*
    Range Mode (comma-separated value)
  */
  'comma-separated value should enable range mode': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20,80' });
    if(!el.isRange){
      cleanup(container);
      return fail('Expected isRange to be true');
    }
    cleanup(container);
    pass('Comma-separated value enables range');
  },

  'range mode should render two thumbs': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20,80' });
    const thumbs = el.shadowRoot.querySelectorAll('.thumb');
    if(thumbs.length !== 2){
      cleanup(container);
      return fail(`Expected 2 thumbs, got ${thumbs.length}`);
    }
    cleanup(container);
    pass('Range mode renders two thumbs');
  },

  'single mode should render one thumb': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    const thumbs = el.shadowRoot.querySelectorAll('.thumb');
    if(thumbs.length !== 1){
      cleanup(container);
      return fail(`Expected 1 thumb, got ${thumbs.length}`);
    }
    cleanup(container);
    pass('Single mode renders one thumb');
  },

  'upperPercentage should be correct': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '0,50' });
    if(el.upperPercentage !== 50){
      cleanup(container);
      return fail(`Expected 50%, got ${el.upperPercentage}%`);
    }
    cleanup(container);
    pass('upperPercentage calculated correctly');
  },

  /*
    setUpper Method
  */
  'should have setUpper method': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '10,90' });
    if(typeof el.setUpper !== 'function'){
      cleanup(container);
      return fail('Slider should have setUpper method');
    }
    cleanup(container);
    pass('Slider has setUpper method');
  },

  'setUpper should update upper value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '10,90' });
    el.setUpper(60);
    if(el.upper !== 60){
      cleanup(container);
      return fail(`Expected upper 60, got ${el.upper}`);
    }
    cleanup(container);
    pass('setUpper updates upper value');
  },

  'setUpper should not go below lower': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50,80' });
    el.setUpper(30);
    if(el.upper !== 80){
      cleanup(container);
      return fail(`Expected upper 80, got ${el.upper}`);
    }
    cleanup(container);
    pass('setUpper does not go below lower');
  },

  'setValue should not exceed upper in range mode': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20,60' });
    el.setValue(80);
    if(el.lower !== 20){
      cleanup(container);
      return fail(`Expected lower 20, got ${el.lower}`);
    }
    cleanup(container);
    pass('setValue does not exceed upper');
  },

  'setUpper should snap to nearest step': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '0,100', steps: '0,25,50,75,100' });
    el.setUpper(60);
    if(el.upper !== 50){
      cleanup(container);
      return fail(`Expected upper 50, got ${el.upper}`);
    }
    cleanup(container);
    pass('setUpper snaps to nearest step');
  },

  'setUpper should do nothing when not in range mode': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    el.setUpper(80);
    if(el.isRange){
      cleanup(container);
      return fail('Should not become range mode');
    }
    cleanup(container);
    pass('setUpper does nothing outside range mode');
  },

  'range change event should include comma-separated value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '10,90' });
    let detail = null;
    el.addEventListener('change', (e) => {
      detail = e.detail;
    });
    el.setUpper(70);
    await el.updateComplete;
    if(!detail){
      cleanup(container);
      return fail('Change event should have fired');
    }
    if(detail.value !== '10,70'){
      cleanup(container);
      return fail(`Expected event value "10,70", got "${detail.value}"`);
    }
    cleanup(container);
    pass('Range change event has comma-separated value');
  },

  /*
    Vertical Range
  */
  'vertical range should render two thumbs': async ({pass, fail}) => {
    const { container, el } = await createSlider({ vertical: true, value: '20,80' });
    const thumbs = el.shadowRoot.querySelectorAll('.thumb');
    if(thumbs.length !== 2){
      cleanup(container);
      return fail(`Expected 2 thumbs, got ${thumbs.length}`);
    }
    cleanup(container);
    pass('Vertical range renders two thumbs');
  },

  /*
    Form Association
  */
  'should be form-associated': async ({pass, fail}) => {
    if(Slider.formAssociated !== true){
      return fail('Expected static formAssociated to be true');
    }
    pass('Slider is form-associated');
  },

  'should have name property': async ({pass, fail}) => {
    const { container, el } = await createSlider({ name: 'volume' });
    if(el.name !== 'volume'){
      cleanup(container);
      return fail(`Expected name "volume", got "${el.name}"`);
    }
    cleanup(container);
    pass('Name property works');
  },

  /*
    Format & Tooltip
  */
  'should have default format of null': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.format !== null){
      cleanup(container);
      return fail(`Expected format null, got ${el.format}`);
    }
    cleanup(container);
    pass('Default format is null');
  },

  'should reflect format attribute': async ({pass, fail}) => {
    const { container, el } = await createSlider({ format: '$0.00' });
    if(el.format !== '$0.00'){
      cleanup(container);
      return fail(`Expected format "$0.00", got "${el.format}"`);
    }
    cleanup(container);
    pass('Format attribute reflects correctly');
  },

  'formatValue should format with pattern': async ({pass, fail}) => {
    const { container, el } = await createSlider({ format: '$0.00' });
    const result = el.formatValue(25);
    if(result !== '$25.00'){
      cleanup(container);
      return fail(`Expected "$25.00", got "${result}"`);
    }
    cleanup(container);
    pass('formatValue formats correctly');
  },

  'formatValue should return raw number when no format': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    const result = el.formatValue(42);
    if(result !== '42'){
      cleanup(container);
      return fail(`Expected "42", got "${result}"`);
    }
    cleanup(container);
    pass('formatValue returns raw number without format');
  },

  'formatValue should respect decimal precision': async ({pass, fail}) => {
    const { container, el } = await createSlider({ format: '0.0%' });
    const result = el.formatValue(12.456);
    if(result !== '12.5%'){
      cleanup(container);
      return fail(`Expected "12.5%", got "${result}"`);
    }
    cleanup(container);
    pass('formatValue respects decimal precision');
  },

  'tooltip should appear when thumb is active': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50', tooltip: true });
    el.handleThumbDown('lower', { preventDefault: () => {}, stopPropagation: () => {} });
    await el.updateComplete;
    const tooltip = el.shadowRoot.querySelector('.tooltip');
    if(!tooltip){
      window.dispatchEvent(new MouseEvent('mouseup'));
      cleanup(container);
      return fail('Tooltip should appear when dragging');
    }
    if(tooltip.textContent !== '50'){
      window.dispatchEvent(new MouseEvent('mouseup'));
      cleanup(container);
      return fail(`Expected tooltip "50", got "${tooltip.textContent}"`);
    }
    window.dispatchEvent(new MouseEvent('mouseup'));
    await el.updateComplete;
    const gone = el.shadowRoot.querySelector('.tooltip');
    if(gone){
      cleanup(container);
      return fail('Tooltip should disappear after releasing');
    }
    cleanup(container);
    pass('Tooltip appears and disappears correctly');
  },

  'tooltip should not appear without tooltip attribute': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    el.handleThumbDown('lower', { preventDefault: () => {}, stopPropagation: () => {} });
    await el.updateComplete;
    const tooltip = el.shadowRoot.querySelector('.tooltip');
    window.dispatchEvent(new MouseEvent('mouseup'));
    if(tooltip){
      cleanup(container);
      return fail('Tooltip should not appear without tooltip attribute');
    }
    cleanup(container);
    pass('No tooltip without attribute');
  },

  'tooltip should use format': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '25', format: '$0.00', tooltip: true });
    el.handleThumbDown('lower', { preventDefault: () => {}, stopPropagation: () => {} });
    await el.updateComplete;
    const tooltip = el.shadowRoot.querySelector('.tooltip');
    if(!tooltip || tooltip.textContent !== '$25.00'){
      window.dispatchEvent(new MouseEvent('mouseup'));
      cleanup(container);
      return fail(`Expected tooltip "$25.00", got "${tooltip ? tooltip.textContent : 'none'}"`);
    }
    window.dispatchEvent(new MouseEvent('mouseup'));
    cleanup(container);
    pass('Tooltip uses format attribute');
  },

  'formattedValue should return formatted single value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50', format: '$0.00' });
    if(el.formattedValue !== '$50.00'){
      cleanup(container);
      return fail(`Expected "$50.00", got "${el.formattedValue}"`);
    }
    cleanup(container);
    pass('formattedValue works for single value');
  },

  'formattedValue should return formatted range value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '20,80', format: '$0.00' });
    if(el.formattedValue !== '$20.00,$80.00'){
      cleanup(container);
      return fail(`Expected "$20.00,$80.00", got "${el.formattedValue}"`);
    }
    cleanup(container);
    pass('formattedValue works for range value');
  },

  'formattedValue should return raw value without format': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '50' });
    if(el.formattedValue !== '50'){
      cleanup(container);
      return fail(`Expected "50", got "${el.formattedValue}"`);
    }
    cleanup(container);
    pass('formattedValue returns raw value without format');
  },

  'change event should use formatted value': async ({pass, fail}) => {
    const { container, el } = await createSlider({ value: '0', format: '$0.00' });
    let eventValue = null;
    el.addEventListener('change', (e) => { eventValue = e.detail.value; });
    el.setValue(50);
    await el.updateComplete;
    if(eventValue !== '$50.00'){
      cleanup(container);
      return fail(`Expected change event value "$50.00", got "${eventValue}"`);
    }
    cleanup(container);
    pass('Change event uses formatted value');
  },

  'tooltip property defaults to false': async ({pass, fail}) => {
    const { container, el } = await createSlider();
    if(el.tooltip !== false){
      cleanup(container);
      return fail(`Expected tooltip false, got ${el.tooltip}`);
    }
    cleanup(container);
    pass('Default tooltip is false');
  },
};
