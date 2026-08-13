import MarkdownEditor from '../../../src/components/MarkdownEditor.js';
import MdImage from '../../../src/components/controls/MdImage.js';

/*
  kc-md-image inserts an image by URL, and optionally hands off to a host-supplied picker via
  window.kempo.openAssetPicker — the hook a media library extension installs so an author can
  choose an already-uploaded asset instead of typing its URL.

  The hook is entirely optional: with nothing installed the control must behave exactly as it did
  before, which is what most of these assert.
*/

const createControl = async () => {
  const container = document.createElement('div');
  container.innerHTML = `
    <k-markdown-editor mode="write">
      <kc-md-image slot="toolbar-top-left"></kc-md-image>
    </k-markdown-editor>
  `;
  document.body.appendChild(container);
  const editor = container.querySelector('k-markdown-editor');
  await editor.updateComplete;
  const control = container.querySelector('kc-md-image');
  await control.updateComplete;
  return { container, editor, control };
};

const cleanup = container => {
  if(container?.parentNode) container.parentNode.removeChild(container);
  // Never leak a hook into the next test — it would silently change what the others assert
  delete window.kempo?.openAssetPicker;
};

const openDropdown = async control => {
  control.handleDropdownOpened();
  await control.updateComplete;
};

const browseButton = control => control.shadowRoot.querySelector('.image-actions button.browse');

export default {
  'should create kc-md-image element': async ({pass, fail}) => {
    const { container, control } = await createControl();
    const ok = control instanceof MdImage;
    cleanup(container);
    return ok ? pass('MdImage element created') : fail('element is not an MdImage instance');
  },

  'no browse button when no picker is installed': async ({pass, fail}) => {
    const { container, control } = await createControl();
    await openDropdown(control);
    const button = browseButton(control);
    cleanup(container);
    return button
      ? fail('browse button rendered with no window.kempo.openAssetPicker installed')
      : pass('control is unchanged without the hook');
  },

  'browse button appears once a picker is installed': async ({pass, fail}) => {
    const { container, control } = await createControl();
    window.kempo = window.kempo || {};
    /*
      Installed after the control was created and first rendered — the hook is resolved when the
      dropdown opens, so a host page can register it at any point.
    */
    window.kempo.openAssetPicker = async () => null;
    await openDropdown(control);
    const button = browseButton(control);
    cleanup(container);
    return button ? pass('browse button rendered') : fail('browse button missing despite an installed picker');
  },

  'a chosen asset is inserted as markdown': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    window.kempo = window.kempo || {};
    let receivedArgs = null;
    window.kempo.openAssetPicker = async (opts) => {
      receivedArgs = opts;
      return { url: '/media/uploads/abc123.png', alt: 'A cat' };
    };

    await openDropdown(control);
    const altInput = control.shadowRoot.querySelector('.image-alt');
    altInput.value = 'typed alt';

    await control.browseLibrary();
    await editor.updateComplete;
    await new Promise(r => setTimeout(r, 0)); // replaceSelection defers through updateComplete

    const value = editor.textarea?.value ?? '';
    cleanup(container);

    if(receivedArgs?.alt !== 'typed alt') return fail(`picker was not passed the typed alt text, got ${JSON.stringify(receivedArgs)}`);
    // The picker's own alt wins — it describes the asset that was actually chosen
    if(!value.includes('![A cat](/media/uploads/abc123.png)')){
      return fail(`expected the markdown image in the editor, got ${JSON.stringify(value)}`);
    }
    pass('chosen asset inserted');
  },

  'cancelling the picker inserts nothing': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    window.kempo = window.kempo || {};
    // Every dismissal path — cancel, overlay click, Escape — resolves null
    window.kempo.openAssetPicker = async () => null;

    await openDropdown(control);
    await control.browseLibrary();
    await editor.updateComplete;
    await new Promise(r => setTimeout(r, 0));

    const value = editor.textarea?.value ?? '';
    cleanup(container);
    return value === ''
      ? pass('nothing inserted on cancel')
      : fail(`expected an untouched editor, got ${JSON.stringify(value)}`);
  },

  'a picker that throws does not break the control': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    window.kempo = window.kempo || {};
    window.kempo.openAssetPicker = async () => { throw new Error('picker exploded'); };

    await openDropdown(control);
    try {
      await control.browseLibrary();
    } catch(e) {
      cleanup(container);
      return fail(`browseLibrary let the error escape: ${e.message}`);
    }
    await editor.updateComplete;
    const value = editor.textarea?.value ?? '';
    cleanup(container);
    return value === '' ? pass('error contained') : fail(`editor was modified despite the failure: ${JSON.stringify(value)}`);
  },

  'typing a url still works with a picker installed': async ({pass, fail}) => {
    const { container, editor, control } = await createControl();
    window.kempo = window.kempo || {};
    window.kempo.openAssetPicker = async () => ({ url: '/should/not/be/used.png' });

    await openDropdown(control);
    control.shadowRoot.querySelector('.image-url').value = 'https://example.com/pic.png';
    control.shadowRoot.querySelector('.image-alt').value = 'manual';
    control.submit();
    await editor.updateComplete;
    await new Promise(r => setTimeout(r, 0));

    const value = editor.textarea?.value ?? '';
    cleanup(container);
    return value.includes('![manual](https://example.com/pic.png)')
      ? pass('manual entry unaffected')
      : fail(`expected the typed url, got ${JSON.stringify(value)}`);
  }
};
