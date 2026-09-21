import { postMessageToPanel } from '@/lib/trusted-panel-origin';

export const BLOCK_TOOLBAR_ID = 'me-block-toolbar';
const SELECTED = 'me-selected';

/** Persian section names, sent by the panel once the canvas is ready. */
let blockLabels: Record<string, string> = {};
export function setBlockLabels(labels: Record<string, string>) {
  blockLabels = labels;
}

/** Header and footer are pinned: they cannot be moved out of place or deleted. */
export function isPinnedBlock(blockEl: HTMLElement): boolean {
  const type = blockEl.dataset.blockType;
  return type === 'header' || type === 'footer';
}

function hasMovableNeighbour(blockEl: HTMLElement, dir: 'up' | 'down'): boolean {
  let el = dir === 'up' ? blockEl.previousElementSibling : blockEl.nextElementSibling;
  while (el instanceof HTMLElement) {
    if (el.dataset.blockId && !isPinnedBlock(el)) return true;
    el = dir === 'up' ? el.previousElementSibling : el.nextElementSibling;
  }
  return false;
}

const ICONS = {
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  hide: '<path d="M10.7 5.1a10.7 10.7 0 0 1 11.2 6.6 1 1 0 0 1 0 .7 10.7 10.7 0 0 1-1.4 2.5"/><path d="M14.1 14.2a3 3 0 0 1-4.2-4.2"/><path d="M17.5 17.5a10.8 10.8 0 0 1-15.4-5.2 1 1 0 0 1 0-.7 10.8 10.8 0 0 1 4.4-5.1"/><path d="m2 2 20 20"/>',
  delete:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  edit: '<path d="M21.2 6.8a1 1 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5z"/>',
} as const;

function svg(icon: keyof typeof ICONS): string {
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[icon]}</svg>`;
}

type ToolbarAction = {
  action: 'move-up' | 'move-down' | 'hide' | 'delete';
  icon: keyof typeof ICONS;
  title: string;
  danger?: boolean;
};

function iconButton({ action, icon, title, danger }: ToolbarAction): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.title = title;
  btn.setAttribute('aria-label', title);
  btn.dataset.action = action;
  btn.innerHTML = svg(icon);
  Object.assign(btn.style, {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e4e4e7',
    cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s',
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.background = danger ? 'rgba(248,113,113,0.18)' : 'rgba(255,255,255,0.12)';
    btn.style.color = danger ? '#f87171' : '#fff';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'transparent';
    btn.style.color = '#e4e4e7';
  });
  return btn;
}

function separator(): HTMLSpanElement {
  const sep = document.createElement('span');
  Object.assign(sep.style, {
    width: '1px',
    height: '16px',
    background: '#3f3f46',
    margin: '0 2px',
  });
  return sep;
}

export function removeBlockToolbar() {
  document.getElementById(BLOCK_TOOLBAR_ID)?.remove();
}

/**
 * Floating toolbar for the hovered/selected section: the section's name (click
 * to open its settings), then only the moves it can make, then hide, then
 * delete. Fixed order so the same action is always in the same place.
 */
export function showBlockToolbar(blockEl: HTMLElement, showUndoToast: (msg: string) => void) {
  removeBlockToolbar();
  const blockId = blockEl.dataset.blockId;
  if (!blockId) return;

  const bar = document.createElement('div');
  bar.id = BLOCK_TOOLBAR_ID;
  bar.dir = 'rtl';
  Object.assign(bar.style, {
    position: 'absolute',
    zIndex: '99998',
    top: '10px',
    insetInlineEnd: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '10px',
    padding: '3px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
    fontFamily: 'inherit',
    pointerEvents: 'all',
  });
  bar.addEventListener('mousedown', (e) => e.preventDefault());

  const select = () => {
    document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
    blockEl.classList.add(SELECTED);
    postMessageToPanel({ source: 'template-editor', type: 'select', blockId });
  };

  const type = blockEl.dataset.blockType ?? '';
  const name = document.createElement('button');
  name.type = 'button';
  name.title = 'تنظیمات این بخش';
  name.innerHTML = `${svg('edit')}<span>${blockLabels[type] ?? type}</span>`;
  Object.assign(name.style, {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '28px',
    padding: '0 10px 0 8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  });
  name.addEventListener('mouseenter', () => (name.style.background = 'rgba(255,255,255,0.12)'));
  name.addEventListener('mouseleave', () => (name.style.background = 'transparent'));
  name.addEventListener('click', (e) => {
    e.stopPropagation();
    select();
  });
  bar.appendChild(name);
  bar.appendChild(separator());

  const pinned = isPinnedBlock(blockEl);
  const actions: (ToolbarAction & { enabled: boolean })[] = [
    {
      action: 'move-up',
      icon: 'up',
      title: 'انتقال به بالا',
      enabled: !pinned && hasMovableNeighbour(blockEl, 'up'),
    },
    {
      action: 'move-down',
      icon: 'down',
      title: 'انتقال به پایین',
      enabled: !pinned && hasMovableNeighbour(blockEl, 'down'),
    },
    { action: 'hide', icon: 'hide', title: 'پنهان کردن بخش', enabled: true },
    { action: 'delete', icon: 'delete', title: 'حذف بخش', danger: true, enabled: !pinned },
  ];

  for (const a of actions.filter((x) => x.enabled)) {
    if (a.action === 'delete') bar.appendChild(separator());
    const btn = iconButton(a);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      postMessageToPanel({
        source: 'template-editor',
        type: 'block-action',
        blockId,
        action: a.action,
      });
      if (a.action === 'hide') showUndoToast('بخش پنهان شد');
      if (a.action === 'delete') showUndoToast('بخش حذف شد');
    });
    bar.appendChild(btn);
  }

  if (getComputedStyle(blockEl).position === 'static') blockEl.style.position = 'relative';
  blockEl.appendChild(bar);
}
