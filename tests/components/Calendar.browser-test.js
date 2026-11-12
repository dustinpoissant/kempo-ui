import Calendar from '../../src/components/Calendar.js';

const mountFieldset = async (markup, tag) => {
  const form = document.createElement('form');
  form.innerHTML = `<fieldset disabled>${markup}</fieldset>`;
  document.body.appendChild(form);
  const el = form.querySelector(tag);
  await el.updateComplete;
  await new Promise(resolve => setTimeout(resolve));
  return { form, el };
};

const mountField = async markup => {
  const form = document.createElement('form');
  form.innerHTML = markup;
  document.body.appendChild(form);
  const el = form.firstElementChild;
  await el.updateComplete;
  await new Promise(resolve => setTimeout(resolve));
  return { form, el };
};

export default {
  'should be form-associated': async ({pass, fail}) => {
    Calendar.formAssociated === true ? pass('Calendar is form-associated') : fail('Calendar should be form-associated');
  },

  'should submit the selected date with its form': async ({pass, fail}) => {
    const { form } = await mountField('<k-calendar name="d" value="2026-04-15"></k-calendar>');
    const submitted = new FormData(form).get('d');
    form.remove();
    submitted === '2026-04-15' ? pass('Submits the date') : fail(`Submitted ${submitted}`);
  },

  'readonly calendar has the readonly property': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-calendar name="d" readonly value="2026-04-15"></k-calendar>');
    const readonly = el.readonly === true;
    form.remove();
    readonly ? pass('readonly is true') : fail('readonly should be true');
  },

  'readonly calendar ignores day clicks': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-calendar name="d" readonly value="2026-04-15"></k-calendar>');
    const day = [...el.shadowRoot.querySelectorAll('.day')].find(button => button.textContent.trim() === '20' && !button.classList.contains('outside'));
    if(!day){
      form.remove();
      return fail('Day 20 was not rendered');
    }
    day.click();
    await el.updateComplete;
    const value = el.value;
    form.remove();
    value === '2026-04-15' ? pass('Readonly calendar kept the date') : fail(`value is ${value}`);
  },

  'readonly calendar still submits its date': async ({pass, fail}) => {
    const { form } = await mountField('<k-calendar name="d" readonly value="2026-04-15"></k-calendar>');
    const submitted = new FormData(form).get('d');
    form.remove();
    submitted === '2026-04-15' ? pass('Submits the date') : fail(`Submitted ${submitted}`);
  },

  'readonly calendar keeps month navigation usable': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-calendar name="d" readonly value="2026-04-15"></k-calendar>');
    const month = el.shadowRoot.querySelector('.month-select');
    const usable = month && month.disabled === false;
    form.remove();
    usable ? pass('Month dropdown is enabled') : fail('Month dropdown should stay enabled while readonly');
  },

  'disabled fieldset disables the calendar': async ({pass, fail}) => {
    const { form, el } = await mountFieldset('<k-calendar name="d" value="2026-04-15"></k-calendar>', 'k-calendar');
    const disabled = el.disabled === true;
    form.remove();
    disabled ? pass('Calendar is disabled by its fieldset') : fail('A disabled fieldset should disable the calendar');
  },

  'form reset restores the date it was added with': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-calendar name="d" value="2026-04-15"></k-calendar>');
    el.value = '2026-05-01';
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    const restored = el.value === '2026-04-15';
    form.remove();
    restored ? pass('Reset restored the date') : fail(`value is ${el.value}`);
  }
};
