import { postMessageToPanel } from '@/lib/trusted-panel-origin';
import { REMOVE_BTN_CLASS, TOOLBAR_ID } from './constants';

export function attachRemovableButtons(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-removable]').forEach((el) => {
    if (el.querySelector(`.${REMOVE_BTN_CLASS}`)) return;
    const flagKey = el.dataset.removable!;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = REMOVE_BTN_CLASS;
    btn.title = 'Remove';
    btn.textContent = '×';
    Object.assign(btn.style, {
      position: 'absolute',
      zIndex: '21',
      top: '4px',
      insetInlineEnd: '4px',
      width: '22px',
      height: '22px',
      borderRadius: '9999px',
      border: 'none',
      background: 'rgba(239,68,68,0.9)',
      color: '#fff',
      fontSize: '14px',
      lineHeight: '1',
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
      const blockEl = el.closest<HTMLElement>('[data-block-id]');
      const blockId = blockEl?.dataset.blockId;
      if (!blockId) return;
      postMessageToPanel({
        source: 'template-editor',
        type: 'toggle-removable',
        blockId,
        fieldKey: flagKey,
        restore: false,
      });
    });
    el.addEventListener('mouseenter', () => {
      btn.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      btn.style.opacity = '0';
    });
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.appendChild(btn);
  });
}

export function buildToolbar(target: HTMLElement, blockId: string): HTMLElement {
  document.getElementById(TOOLBAR_ID)?.remove();

  const bar = document.createElement('div');
  bar.id = TOOLBAR_ID;
  Object.assign(bar.style, {
    position: 'fixed',
    zIndex: '99999',
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '8px',
    padding: '4px',
    display: 'flex',
    gap: '2px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    pointerEvents: 'all',
  });

  const tools = [
    { cmd: 'bold', label: 'B', weight: 'bold', style: 'normal', deco: 'none' },
    {
      cmd: 'italic',
      label: 'I',
      weight: 'normal',
      style: 'italic',
      deco: 'none',
    },
    {
      cmd: 'underline',
      label: 'U',
      weight: 'normal',
      style: 'normal',
      deco: 'underline',
    },
  ];

  for (const tool of tools) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = tool.cmd;
    btn.textContent = tool.label;
    Object.assign(btn.style, {
      padding: '4px 10px',
      background: 'transparent',
      border: 'none',
      borderRadius: '4px',
      color: '#e4e4e7',
      fontSize: '13px',
      fontWeight: tool.weight,
      fontStyle: tool.style,
      textDecoration: tool.deco,
      cursor: 'pointer',
      lineHeight: '1',
    });
    btn.addEventListener('mouseover', () => {
      btn.style.background = '#3f3f46';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = 'transparent';
    });
    // mousedown keeps focus on the contenteditable (blur not triggered)
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      document.execCommand(tool.cmd, false);
      target.focus();
    });
    bar.appendChild(btn);
  }

  const accentField = target.dataset.accentColorField;
  if (accentField) {
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.title = 'accent';
    const current = target.style.color || getComputedStyle(target).color;
    if (current) colorInput.value = rgbToHex(current);
    Object.assign(colorInput.style, {
      width: '28px',
      height: '28px',
      padding: '0',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
    });
    colorInput.addEventListener('mousedown', (e) => e.preventDefault());
    colorInput.addEventListener('input', () => {
      target.style.color = colorInput.value;
      postMessageToPanel({
        source: 'template-editor',
        type: 'accent-color-update',
        blockId,
        fieldKey: accentField,
        value: colorInput.value,
      });
    });
    bar.appendChild(colorInput);
  }

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.title = 'clear';
  clearBtn.textContent = '⌫';
  Object.assign(clearBtn.style, {
    padding: '4px 8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: '13px',
    cursor: 'pointer',
  });
  clearBtn.addEventListener('mousedown', (e) => e.preventDefault());
  clearBtn.addEventListener('click', () => {
    target.innerText = '';
    target.focus();
  });
  bar.appendChild(clearBtn);

  placeToolbar(bar, target);
  document.body.appendChild(bar);
  return bar;
}

export function rgbToHex(color: string): string {
  if (color.startsWith('#')) return color.slice(0, 7);
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return '#3b82f6';
  const hex = (n: string) => Number(n).toString(16).padStart(2, '0');
  return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
}

export function placeToolbar(bar: HTMLElement, target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const top = rect.top > 44 ? rect.top - 40 : rect.bottom + 8;
  bar.style.left = `${Math.max(4, rect.left)}px`;
  bar.style.top = `${top}px`;
}

/** Immutably write `value` at `path` inside an array/object tree. */
export function setAtPath(node: unknown, path: string[], value: string | number): unknown {
  const [head, ...rest] = path;
  const next = rest.length === 0 ? value : setAtPath(nodeChild(node, head), rest, value);

  if (Array.isArray(node)) {
    const index = Number(head);
    if (!Number.isInteger(index) || index < 0 || index >= node.length) return node;
    return node.map((entry, i) => (i === index ? next : entry));
  }
  if (typeof node === 'object' && node !== null) {
    return { ...(node as Record<string, unknown>), [head]: next };
  }
  return node;
}

export function nodeChild(node: unknown, key: string): unknown {
  if (Array.isArray(node)) return node[Number(key)];
  if (typeof node === 'object' && node !== null) return (node as Record<string, unknown>)[key];
  return undefined;
}
