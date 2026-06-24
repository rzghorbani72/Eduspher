"use client";

import { useEffect } from "react";

const HOVER = "me-hover";
const SELECTED = "me-selected";
const EDITING = "me-editing";
const TOOLBAR_ID = "me-format-toolbar";

// Injected DOM toolbar — appears above the active contenteditable element.
// Uses mousedown (not click) on buttons so focus stays on the editable.
function buildToolbar(target: HTMLElement): HTMLElement {
  document.getElementById(TOOLBAR_ID)?.remove();

  const bar = document.createElement("div");
  bar.id = TOOLBAR_ID;
  bar.setAttribute("aria-label", "Text formatting");
  Object.assign(bar.style, {
    position: "fixed",
    zIndex: "99999",
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    padding: "4px",
    display: "flex",
    gap: "2px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    pointerEvents: "all",
  });

  const tools: { cmd: string; label: string; title: string }[] = [
    { cmd: "bold",      label: "B",  title: "Bold (Ctrl+B)"      },
    { cmd: "italic",    label: "I",  title: "Italic (Ctrl+I)"    },
    { cmd: "underline", label: "U",  title: "Underline (Ctrl+U)" },
  ];

  for (const tool of tools) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = tool.title;
    btn.textContent = tool.label;
    Object.assign(btn.style, {
      padding: "4px 10px",
      background: "transparent",
      border: "none",
      borderRadius: "4px",
      color: "#e4e4e7",
      fontSize: "13px",
      fontWeight: tool.cmd === "bold" ? "bold" : tool.cmd === "italic" ? "normal" : "normal",
      fontStyle: tool.cmd === "italic" ? "italic" : "normal",
      textDecoration: tool.cmd === "underline" ? "underline" : "none",
      cursor: "pointer",
      lineHeight: "1",
    });
    btn.addEventListener("mouseover", () => { btn.style.background = "#3f3f46"; });
    btn.addEventListener("mouseout",  () => { btn.style.background = "transparent"; });
    // mousedown keeps focus on the contenteditable (blur is not triggered)
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.execCommand(tool.cmd, false);
      target.focus();
    });
    bar.appendChild(btn);
  }

  positionToolbar(bar, target);
  document.body.appendChild(bar);
  return bar;
}

function positionToolbar(bar: HTMLElement, target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const barH = 36;
  const top = rect.top > barH + 12 ? rect.top - barH - 8 : rect.bottom + 8;
  bar.style.left = `${Math.max(4, rect.left)}px`;
  bar.style.top = `${top}px`;
}

export function PreviewEditBridge() {
  useEffect(() => {
    let selectedBlockId: string | null = null;

    type ActiveEdit = {
      el: HTMLElement;
      blockId: string;
      fieldKey: string;
      isRich: boolean;
      original: string;
    };
    let activeEdit: ActiveEdit | null = null;
    let blurTimer: ReturnType<typeof setTimeout> | null = null;

    // Walk up to the nearest element with data-block-id
    const findBlockEl = (target: EventTarget | null): HTMLElement | null => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.dataset?.blockId) return el;
        el = el.parentElement;
      }
      return null;
    };

    // Walk up to the nearest element with data-editable, stopping at blockEl
    const findEditableEl = (
      target: EventTarget | null,
      blockEl: HTMLElement,
    ): HTMLElement | null => {
      let el = target as HTMLElement | null;
      while (el && el !== blockEl.parentElement) {
        if (el.dataset?.editable) return el;
        el = el.parentElement;
      }
      return null;
    };

    const commitEdit = () => {
      if (!activeEdit) return;
      const { el, blockId, fieldKey, isRich, original } = activeEdit;

      el.removeAttribute("contenteditable");
      el.classList.remove(EDITING);

      const value = isRich ? el.innerHTML : el.innerText.trim();

      if (value !== original) {
        window.parent?.postMessage(
          { source: "mentoma-editor", type: "field-update", blockId, fieldKey, value },
          "*",
        );
      }

      // Restore block outline after inline edit completes
      const blockEl = document.querySelector<HTMLElement>(
        `[data-block-id="${blockId}"]`,
      );
      blockEl?.classList.add(SELECTED);

      document.getElementById(TOOLBAR_ID)?.remove();
      activeEdit = null;
      if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }
    };

    const enterEdit = (editableEl: HTMLElement, blockId: string) => {
      if (activeEdit) commitEdit();

      const fieldKey = editableEl.dataset.editable!;
      const isRich = editableEl.dataset.editableKind === "rich";
      const original = isRich ? editableEl.innerHTML : editableEl.innerText.trim();

      // Drop block outline while inline-editing so the edit border stands out
      document
        .querySelector<HTMLElement>(`[data-block-id="${blockId}"]`)
        ?.classList.remove(SELECTED);

      editableEl.setAttribute("contenteditable", "true");
      editableEl.classList.add(EDITING);
      editableEl.focus();

      // Move cursor to end
      const range = document.createRange();
      range.selectNodeContents(editableEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      activeEdit = { el: editableEl, blockId, fieldKey, isRich, original };

      if (isRich) {
        const bar = buildToolbar(editableEl);
        editableEl.addEventListener("keyup", () => positionToolbar(bar, editableEl));
      }

      // Commit on blur — delayed so toolbar mousedown (which prevents blur)
      // can cancel this before it fires.
      const onBlur = () => {
        blurTimer = setTimeout(() => {
          if (activeEdit?.el === editableEl) commitEdit();
        }, 150);
      };
      editableEl.addEventListener("blur", onBlur, { once: true });
    };

    const onOver = (e: MouseEvent) => {
      if (activeEdit) return;
      const el = findBlockEl(e.target);
      document.querySelectorAll(`.${HOVER}`).forEach((n) => n.classList.remove(HOVER));
      if (el && !el.classList.contains(SELECTED)) el.classList.add(HOVER);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Toolbar buttons handle their own events — don't interfere
      if (target.closest?.(`#${TOOLBAR_ID}`)) return;

      // Clicks inside the active editable are text selection — let them through
      if (activeEdit && activeEdit.el.contains(target)) return;

      // Click outside active edit → commit
      if (activeEdit) {
        commitEdit();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const blockEl = findBlockEl(target);
      if (!blockEl) return;

      e.preventDefault();
      e.stopPropagation();

      const blockId = blockEl.dataset.blockId!;

      // If this block is already selected, a click on a data-editable element
      // enters inline edit mode directly.
      if (blockEl.classList.contains(SELECTED)) {
        const editableEl = findEditableEl(target, blockEl);
        if (editableEl) {
          enterEdit(editableEl, blockId);
          return;
        }
      }

      // Default: select the block, tell AdminPanel
      document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
      blockEl.classList.remove(HOVER);
      blockEl.classList.add(SELECTED);
      selectedBlockId = blockId;
      window.parent?.postMessage(
        { source: "mentoma-editor", type: "select", blockId },
        "*",
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeEdit) return;
      if (e.key === "Escape") {
        // Restore original content on Escape
        const { el, isRich, original } = activeEdit;
        if (isRich) el.innerHTML = original;
        else el.innerText = original;
        el.removeAttribute("contenteditable");
        el.classList.remove(EDITING);
        document
          .querySelector<HTMLElement>(`[data-block-id="${activeEdit.blockId}"]`)
          ?.classList.add(SELECTED);
        document.getElementById(TOOLBAR_ID)?.remove();
        activeEdit = null;
        e.preventDefault();
      }
    };

    const onMessage = (e: MessageEvent) => {
      const data = e.data as {
        source?: string;
        type?: string;
        blockId?: string;
        fieldKey?: string;
        value?: string;
        visible?: boolean;
      };
      if (!data || data.source !== "mentoma-admin") return;

      if (data.type === "highlight") {
        if (activeEdit) commitEdit();
        document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
        selectedBlockId = data.blockId ?? null;
        if (data.blockId) {
          const el = document.querySelector<HTMLElement>(
            `[data-block-id="${data.blockId}"]`,
          );
          el?.classList.add(SELECTED);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      if (data.type === "toggle-visible" && data.blockId) {
        const el = document.querySelector<HTMLElement>(
          `[data-block-id="${data.blockId}"]`,
        );
        if (el) el.style.display = data.visible ? "" : "none";
      }

      // Sidebar input changed → sync the live text in preview (keeps both in sync
      // without waiting for the iframe reload).
      if (data.type === "sync-field" && data.blockId && data.fieldKey) {
        const el = document.querySelector<HTMLElement>(
          `[data-block-id="${data.blockId}"] [data-editable="${data.fieldKey}"]`,
        );
        // Don't overwrite while the user is actively editing that element
        if (el && el !== activeEdit?.el) {
          const isRich = el.dataset.editableKind === "rich";
          if (isRich) el.innerHTML = data.value ?? "";
          else el.innerText = data.value ?? "";
        }
      }
    };

    document.addEventListener("mouseover", onOver);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("message", onMessage);

    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("message", onMessage);
      document.getElementById(TOOLBAR_ID)?.remove();
    };

    // selectedBlockId is module-level state, not React state — ESLint would
    // flag it as unused but it's kept for future multi-select or breadcrumb use.
    void selectedBlockId;
  }, []);

  return (
    <style>{`
      [data-block-id] { cursor: pointer; }
      .${HOVER}    { outline: 2px dashed color-mix(in srgb, #ef4444 60%, transparent); outline-offset: -2px; }
      .${SELECTED} { outline: 2px dashed #ef4444; outline-offset: -2px; position: relative; }

      /* Editable text hints */
      [data-editable]:not([contenteditable]) {
        cursor: text;
        border-radius: 3px;
        transition: outline 120ms ease;
      }
      [data-editable]:not([contenteditable]):hover {
        outline: 1px dashed rgba(59,130,246,0.5);
        outline-offset: 2px;
      }
      [data-editable][contenteditable] {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 3px;
        border-radius: 3px;
        cursor: text;
        caret-color: #3b82f6;
        min-width: 4px;
      }
    `}</style>
  );
}
