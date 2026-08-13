import '../../../src/components/HtmlEditor.js';
import InsertImage from '../../../src/components/controls/InsertImage.js';

/*
  kc-insert-image is the HtmlEditor counterpart to kc-md-image. Typing a URL needs nothing from the
  host; a host that also sets window.kempo.openAssetPicker gets a Browse button. The hook is
  optional, so most of these assert the control is unchanged without one.
*/

const createControl = async () => {
  const container = document.createElement('div');
  container.innerHTML = `
    <k-html-editor>
      <kc-insert-image slot="toolbar-top-left"></kc-insert-image>
    </k-html-editor>
  `;
  document.body.appendChild(container);
  const editor = container.querySelector('k-html-editor');
  await new Promise(r => editor.addEventListener('ready', r, { once: true }));
  const control = container.querySelector('kc-insert-image');
  await control.updateComplete;
  return { container, editor, control };
};

const cleanup = container => {
  if(container?.parentNode) container.parentNode.removeChild(container);
  // Never leak a hook into the next test — it would change what the others assert
  delete window.kempo?.openAssetPicker;
};

const openDropdown = async control => {
  control.handleDropdownOpened();
  await control.updateComplete;
};

const browseButton = control => control.shadowRoot.querySelector('.image-actions button.browse');

export default {
  'should create kc-insert-image element': async ({pass, fail}) => {
    const { container, control } = await createControl();
    const ok = control instanceof InsertImage;
    cleanup(container);
    return ok ? pass('InsertImage created') : fail('element is not an InsertImage instance');
  },

  'no browse button without a picker': async ({pass, fail}) => {
    const { container, control } = await createControl();
    await openDropdown(control);
    const button = browseButton(control);
    cleanup(container);
    return button ? fail('browse button rendered with no picker installed') : pass('unchanged without the hook');
  },

  'browse button appears once a picker is installed': async ({pass, fail}) => {
    const { container, control } = await createControl();
    window.kempo = window.kempo || {};
    // Installed after first render — the hook is resolved when the dropdown opens
    window.kempo.openAssetPicker = async () => null;
    await openDropdown(control);
    const button = browseButton(control);
    cleanup(container);
    return button ? pass('browse button rendered') : fail('browse button missing despite an installed picker');
  },

  'typing a url inserts an image': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    await openDropdown(control);
    control.shadowRoot.querySelector('.image-url').value = 'https://example.com/pic.png';
    control.shadowRoot.querySelector('.image-alt').value = 'A picture';
    control.submit();
    await new Promise(r => setTimeout(r, 400));

    const img = editor.shadowRoot.querySelector('img');
    const value = editor.value ?? '';
    cleanup(container);
    // Asserts a real rendered element, not just the serialised value — before the image node
    // existed lexical dropped the <img> entirely and value stayed an empty string
    if(!img) return fail('no image was rendered in the editor');
    if(img.getAttribute('src') !== 'https://example.com/pic.png') return fail(`src is ${img.getAttribute('src')}`);
    if(img.getAttribute('alt') !== 'A picture') return fail(`alt is ${img.getAttribute('alt')}`);
    if(!value.includes('src="https://example.com/pic.png"')) return fail(`value missing the image: ${value}`);
    pass('image inserted');
  },

  'a chosen asset is inserted': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    window.kempo = window.kempo || {};
    let received = null;
    window.kempo.openAssetPicker = async (opts) => {
      received = opts;
      return { url: '/media/uploads/abc.png', alt: 'From the library' };
    };

    await openDropdown(control);
    control.shadowRoot.querySelector('.image-alt').value = 'typed alt';
    await control.browseLibrary();
    await new Promise(r => setTimeout(r, 400));

    const img = editor.shadowRoot.querySelector('img');
    cleanup(container);
    if(received?.alt !== 'typed alt') return fail(`picker not passed the typed alt, got ${JSON.stringify(received)}`);
    if(!img) return fail('no image was rendered in the editor');
    if(img.getAttribute('src') !== '/media/uploads/abc.png') return fail(`src is ${img.getAttribute('src')}`);
    // The picker's alt wins — it describes the asset actually chosen
    if(img.getAttribute('alt') !== 'From the library') return fail(`expected the picker's alt, got ${img.getAttribute('alt')}`);
    pass('chosen asset inserted');
  },

  'cancelling the picker inserts nothing': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    window.kempo = window.kempo || {};
    window.kempo.openAssetPicker = async () => null;

    await openDropdown(control);
    const before = editor.value ?? '';
    await control.browseLibrary();
    await new Promise(r => setTimeout(r, 60));

    const after = editor.value ?? '';
    cleanup(container);
    return after === before ? pass('nothing inserted on cancel') : fail(`editor changed: ${after}`);
  },

  'a picker that throws does not break the control': async ({pass, fail}) => {
    const { container, control } = await createControl();
    window.kempo = window.kempo || {};
    window.kempo.openAssetPicker = async () => { throw new Error('picker exploded'); };

    await openDropdown(control);
    try {
      await control.browseLibrary();
    } catch(e) {
      cleanup(container);
      return fail(`browseLibrary let the error escape: ${e.message}`);
    }
    cleanup(container);
    pass('error contained');
  },

  'alt text cannot break out of the attribute': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    await openDropdown(control);
    control.shadowRoot.querySelector('.image-url').value = 'https://example.com/x.png';
    // A quote here would close alt="" early and let the rest become real attributes
    control.shadowRoot.querySelector('.image-alt').value = '" onerror="alert(1)';
    control.submit();
    await new Promise(r => setTimeout(r, 400));

    const img = editor.shadowRoot?.querySelector('img') || null;
    const value = editor.value ?? '';
    cleanup(container);

    /*
      The image must actually exist for this to mean anything — an assertion that no onerror
      attribute is present passes trivially against an editor that inserted nothing at all.
    */
    if(!img) return fail('no image was rendered, so this proves nothing about escaping');
    if(img.hasAttribute('onerror')) return fail('the injected onerror became a real attribute');
    if(img.getAttribute('alt') !== '" onerror="alert(1)') return fail(`alt was mangled: ${img.getAttribute('alt')}`);

    /*
      Parsed rather than pattern-matched: the serialised value legitimately contains the text
      "onerror=" inside an escaped alt (alt="&quot; onerror=&quot;alert(1)"), so a regex over the
      markup reports a breakout that has not happened. Re-parsing asks the real question — did it
      become an attribute — the way a browser rendering this value later would.
    */
    const reparsed = new DOMParser().parseFromString(value, 'text/html').querySelector('img');
    if(!reparsed) return fail(`serialised value did not round-trip to an image: ${value}`);
    if(reparsed.hasAttribute('onerror')) return fail(`re-parsing the value yields a live onerror: ${value}`);
    if(reparsed.getAttribute('alt') !== '" onerror="alert(1)') return fail(`alt did not survive the round trip: ${reparsed.getAttribute('alt')}`);
    pass('alt escaped and kept as text');
  }
};
