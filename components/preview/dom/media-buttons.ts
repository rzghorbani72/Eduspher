import { postMessageToPanel } from '@/lib/trusted-panel-origin';
import { MEDIA_BTN_CLASS, UNDO_TOAST_ID } from './constants';

export function showUndoToast(message: string) {
  document.getElementById(UNDO_TOAST_ID)?.remove();
  const bar = document.createElement('div');
  bar.id = UNDO_TOAST_ID;
  Object.assign(bar.style, {
    position: 'fixed',
    zIndex: '99999',
    insetInlineStart: '50%',
    transform: 'translateX(-50%)',
    bottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#18181b',
    color: '#e4e4e7',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
  });

  const label = document.createElement('span');
  label.textContent = message;
  bar.appendChild(label);

  const undoBtn = document.createElement('button');
  undoBtn.type = 'button';
  undoBtn.textContent = 'بازگرداندن';
  Object.assign(undoBtn.style, {
    background: 'transparent',
    border: 'none',
    color: '#93c5fd',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0',
  });
  undoBtn.addEventListener('click', () => {
    postMessageToPanel({ source: 'template-editor', type: 'undo' });
    bar.remove();
  });
  bar.appendChild(undoBtn);

  document.body.appendChild(bar);
  setTimeout(() => bar.remove(), 8000);
}

export type MediaPickRequest = {
  blockId: string;
  fieldKey: string;
  // `video` slots skip the canvas byte cap: the panel sends them through the
  // quota-checked direct video upload instead of the image endpoint.
  kind?: 'image' | 'video';
  // Set only for "restore with photo": the visibility flag to also turn on
  // once the upload succeeds, so both changes land as one config patch and
  // the slot restore never triggers a second, dialog-killing reload.
  restoreKey?: string;
};

export function attachMediaUploadButtons(
  root: ParentNode,
  requestPick: (target: MediaPickRequest) => void,
) {
  root
    .querySelectorAll<HTMLElement>('[data-media-editable],[data-video-editable]')
    .forEach((slot) => {
      if (slot.querySelector(`.${MEDIA_BTN_CLASS}`)) return;
      const kind = slot.dataset.videoEditable ? 'video' : 'image';
      const fieldKey = (slot.dataset.mediaEditable ?? slot.dataset.videoEditable)!;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = MEDIA_BTN_CLASS;
      btn.title = 'Upload';
      btn.textContent = '↑';
      Object.assign(btn.style, {
        position: 'absolute',
        zIndex: '20',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40px',
        height: '40px',
        borderRadius: '9999px',
        border: '2px solid #fff',
        background: 'rgba(24,24,27,0.82)',
        color: '#fff',
        fontSize: '18px',
        cursor: 'pointer',
        opacity: '0',
        transition: 'opacity 0.15s',
        pointerEvents: 'all',
      });
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const blockEl = slot.closest<HTMLElement>('[data-block-id]');
        const blockId = blockEl?.dataset.blockId;
        if (!blockId) return;
        // File picker must open in this document — parent cannot call input.click()
        // from postMessage (user-activation is lost across the iframe boundary).
        requestPick({ blockId, fieldKey, kind });
      });
      if (kind === 'video') {
        btn.dataset.idleLabel = '↑ بارگذاری ویدیو یا تصویر';
        btn.textContent = btn.dataset.idleLabel;
        // An empty video box is one big upload target; once footage is in,
        // clicks must reach the player controls, so only the button remains.
        slot.addEventListener('click', (e) => {
          if (slot.querySelector('video')) return;
          e.preventDefault();
          e.stopPropagation();
          btn.click();
        });
        slot.style.cursor = 'pointer';
        Object.assign(btn.style, {
          // Corner of the banner: the centre is where the headline sits.
          top: '24px',
          left: 'auto',
          insetInlineStart: '24px',
          transform: 'none',
          width: 'auto',
          height: 'auto',
          padding: '12px 20px',
          fontSize: '14px',
          opacity: '1',
        });
      }
      slot.addEventListener('mouseenter', () => {
        btn.style.opacity = '1';
      });
      slot.addEventListener('mouseleave', () => {
        if (btn.dataset.uploading !== '1' && kind !== 'video') btn.style.opacity = '0';
      });
      if (getComputedStyle(slot).position === 'static') slot.style.position = 'relative';
      slot.appendChild(btn);
    });
}

/**
 * Upload feedback on the button itself. While it runs the button stays visible
 * (it normally only appears on hover) and counts up, so the canvas never looks
 * like the click did nothing.
 */
export function setMediaButtonUploading(
  btn: HTMLButtonElement,
  uploading: boolean,
  percent: number,
) {
  btn.disabled = uploading;
  btn.dataset.uploading = uploading ? '1' : '';
  btn.style.opacity = uploading || btn.dataset.idleLabel ? '1' : '0';
  btn.style.cursor = uploading ? 'default' : 'pointer';
  btn.style.fontSize = uploading ? '12px' : btn.dataset.idleLabel ? '14px' : '18px';
  btn.textContent = uploading ? `${Math.round(percent)}%` : (btn.dataset.idleLabel ?? '\u2191');
}

export function attachRemovableRestoreButtons(
  root: ParentNode = document,
  requestPick?: (target: MediaPickRequest) => void,
) {
  root.querySelectorAll<HTMLElement>('[data-removable-restore]').forEach((el) => {
    if (el.dataset.restoreBound === '1') return;
    el.dataset.restoreBound = '1';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const flagKey = el.dataset.removableRestore!;
      const mediaKey = el.dataset.removableRestoreMedia;
      const blockEl = el.closest<HTMLElement>('[data-block-id]');
      const blockId = blockEl?.dataset.blockId;
      if (!blockId) return;

      if (mediaKey) {
        // "Restore with photo": open the upload dialog right here in the
        // iframe — the parent cannot open a file picker from a
        // postMessage-triggered click (user-activation does not cross the
        // iframe boundary). The visibility flag is restored together with
        // the uploaded URL once picked (see fileInput's change handler
        // below), so a cancelled dialog leaves the slot untouched and a
        // successful one only reloads the preview once.
        requestPick?.({ blockId, fieldKey: mediaKey, restoreKey: flagKey });
        return;
      }

      postMessageToPanel({
        source: 'template-editor',
        type: 'toggle-removable',
        blockId,
        fieldKey: flagKey,
        restore: true,
      });
    });
  });
}
