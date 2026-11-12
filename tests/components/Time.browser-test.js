import Time from '../../src/components/Time.js';

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
    Time.formAssociated === true ? pass('Time is form-associated') : fail('Time should be form-associated');
  },

  'should submit the time with its form': async ({pass, fail}) => {
    const { form } = await mountField('<k-time name="t" value="12:00"></k-time>');
    const submitted = new FormData(form).get('t');
    form.remove();
    submitted === '12:00' ? pass('Submits the time') : fail(`Submitted ${submitted}`);
  },

  'readonly time has the readonly property': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-time name="t" readonly value="12:00"></k-time>');
    const readonly = el.readonly === true;
    form.remove();
    readonly ? pass('readonly is true') : fail('readonly should be true');
  },

  'readonly time input is read only': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-time name="t" readonly value="12:00"></k-time>');
    const input = el.shadowRoot.querySelector('input');
    form.remove();
    input.readOnly === true ? pass('Input is read only') : fail('Input should be read only');
  },

  'readonly time ignores changes': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-time name="t" readonly value="12:00"></k-time>');
    const input = el.shadowRoot.querySelector('input');
    input.value = '13:00';
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;
    const value = el.value;
    form.remove();
    value === '12:00' ? pass('Readonly time kept its value') : fail(`value is ${value}`);
  },

  'readonly time still submits its value': async ({pass, fail}) => {
    const { form } = await mountField('<k-time name="t" readonly value="12:00"></k-time>');
    const submitted = new FormData(form).get('t');
    form.remove();
    submitted === '12:00' ? pass('Submits the time') : fail(`Submitted ${submitted}`);
  },

  'required time blocks submission while empty': async ({pass, fail}) => {
    const { form } = await mountField('<k-time name="t" required></k-time>');
    const blocked = !form.checkValidity();
    form.remove();
    blocked ? pass('Required time gates the form') : fail('An empty required time should block submission');
  },

  'disabled fieldset disables the time': async ({pass, fail}) => {
    const { form, el } = await mountFieldset('<k-time name="t" value="12:00"></k-time>', 'k-time');
    const disabled = el.disabled === true;
    form.remove();
    disabled ? pass('Time is disabled by its fieldset') : fail('A disabled fieldset should disable the time');
  },

  'form reset restores the time it was added with': async ({pass, fail}) => {
    const { form, el } = await mountField('<k-time name="t" value="12:00"></k-time>');
    el.value = '13:00';
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    const restored = el.value === '12:00';
    form.remove();
    restored ? pass('Reset restored the time') : fail(`value is ${el.value}`);
  }
};
