"use client";

import { useEffect } from "react";

import { usePreviewScrollMemory } from "./use-preview-scroll-memory";

const HOVER = "me-hover";
const SELECTED = "me-selected";
const EDITING = "me-editing";
const TOOLBAR_ID = "me-format-toolbar";

function buildToolbar(target: HTMLElement): HTMLElement {
  document.getElementById(TOOLBAR_ID)?.remove();

  const bar = document.createElement("div");
  bar.id = TOOLBAR_ID;
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

  const tools = [
    { cmd: "bold",      label: "B", weight: "bold",   style: "normal",  deco: "none"      },
    { cmd: "italic",    label: "I", weight: "normal",  style: "italic",  deco: "none"      },
    { cmd: "underline", label: "U", weight: "normal",  style: "normal",  deco: "underline" },
  ];

  for (const tool of tools) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = tool.cmd;
    btn.textContent = tool.label;
    Object.assign(btn.style, {
      padding: "4px 10px",
      background: "transparent",
      border: "none",
      borderRadius: "4px",
      color: "#e4e4e7",
      fontSize: "13px",
      fontWeight: tool.weight,
      fontStyle: tool.style,
      textDecoration: tool.deco,
      cursor: "pointer",
      lineHeight: "1",
    });
    btn.addEventListener("mouseover", () => { btn.style.background = "#3f3f46"; });
    btn.addEventListener("mouseout",  () => { btn.style.background = "transparent"; });
    // mousedown keeps focus on the contenteditable (blur not triggered)
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.execCommand(tool.cmd, false);
      target.focus();
    });
    bar.appendChild(btn);
  }

  placeToolbar(bar, target);
  document.body.appendChild(bar);
  return bar;
}

function placeToolbar(bar: HTMLElement, target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const top = rect.top > 44 ? rect.top - 40 : rect.bottom + 8;
  bar.style.left = `${Math.max(4, rect.left)}px`;
  bar.style.top  = `${top}px`;
}

export function PreviewEditBridge() {
  usePreviewScrollMemory();

  useEffect(() => {
    type ActiveEdit = {
      el: HTMLElement;
      blockId: string;
      fieldKey: string;
      isRich: boolean;
      original: string;
    };
    let activeEdit: ActiveEdit | null = null;
    let blurTimer: ReturnType<typeof setTimeout> | null = null;
    let liveToast: HTMLElement | null = null;

    // ── Helpers ──────────────────────────────────────────────────────────────

    const findBlockEl = (t: EventTarget | null): HTMLElement | null => {
      let el = t as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.dataset?.blockId) return el;
        el = el.parentElement;
      }
      return null;
    };

    // Walk up from target to (not including) blockEl, stop early inside dynamic.
    const findEditableEl = (t: EventTarget | null, blockEl: HTMLElement): HTMLElement | null => {
      let el = t as HTMLElement | null;
      while (el && el !== blockEl) {
        if (el.dataset?.dynamic)   return null;   // live data — never editable
        if (el.dataset?.editable)  return el;
        el = el.parentElement;
      }
      return null;
    };

    const isInsideDynamic = (t: EventTarget | null, blockEl: HTMLElement): boolean => {
      let el = t as HTMLElement | null;
      while (el && el !== blockEl) {
        if (el.dataset?.dynamic) return true;
        el = el.parentElement;
      }
      return false;
    };

    const showLiveToast = (x: number, y: number) => {
      liveToast?.remove();
      const d = document.createElement("div");
      Object.assign(d.style, {
        position: "fixed", zIndex: "99998",
        left: `${x + 12}px`, top: `${y - 36}px`,
        background: "#78350f", color: "#fef3c7",
        border: "1px solid #92400e", borderRadius: "6px",
        padding: "5px 10px", fontSize: "12px",
        fontFamily: "sans-serif", whiteSpace: "nowrap",
        pointerEvents: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
      });
      d.textContent = "محتوای زنده — از داشبورد مدیریت می‌شود";
      document.body.appendChild(d);
      liveToast = d;
      setTimeout(() => { d.remove(); if (liveToast === d) liveToast = null; }, 2200);
    };

    // ── Edit lifecycle ────────────────────────────────────────────────────────

    const commitEdit = () => {
      if (!activeEdit) return;
      if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }

      const { el, blockId, fieldKey, isRich, original } = activeEdit;
      el.removeAttribute("contenteditable");
      el.classList.remove(EDITING);

      const value = isRich ? el.innerHTML : el.innerText.trim();
      if (value !== original) {
        window.parent?.postMessage(
          { source: "template-editor", type: "field-update", blockId, fieldKey, value },
          "*",
        );
      }

      // Restore block selection ring
      document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`)?.classList.add(SELECTED);
      document.getElementById(TOOLBAR_ID)?.remove();
      activeEdit = null;
    };

    // enterEdit is called from onMouseDown BEFORE the browser focuses the element.
    // Setting contenteditable here lets the browser's natural mousedown→focus→cursor
    // sequence place the cursor exactly where the user clicked — no manual range needed.
    const enterEdit = (editableEl: HTMLElement, blockId: string) => {
      const fieldKey = editableEl.dataset.editable!;
      const isRich   = editableEl.dataset.editableKind === "rich";
      const original = isRich ? editableEl.innerHTML : editableEl.innerText.trim();

      // Drop block ring so the blue editing outline is unambiguous
      document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`)?.classList.remove(SELECTED);

      editableEl.setAttribute("contenteditable", "true");
      editableEl.classList.add(EDITING);
      activeEdit = { el: editableEl, blockId, fieldKey, isRich, original };

      if (isRich) {
        const bar = buildToolbar(editableEl);
        editableEl.addEventListener("keyup", () => placeToolbar(bar, editableEl));
      }

      // Commit on blur; the 150 ms delay lets toolbar's mousedown cancel this first.
      const onBlur = () => {
        blurTimer = setTimeout(() => {
          if (activeEdit?.el === editableEl) commitEdit();
        }, 150);
      };
      editableEl.addEventListener("blur", onBlur, { once: true });
    };

    // ── Mouse events ──────────────────────────────────────────────────────────

    const onOver = (e: MouseEvent) => {
      if (activeEdit) return;
      const el = findBlockEl(e.target);
      document.querySelectorAll(`.${HOVER}`).forEach((n) => n.classList.remove(HOVER));
      if (el && !el.classList.contains(SELECTED)) el.classList.add(HOVER);
    };

    // mousedown: the entry point for inline editing.
    // By setting contenteditable here (without stopPropagation), the browser's
    // natural focus + cursor-placement fires immediately after — exactly like
    // clicking into any contenteditable in a real editor (Medium, Notion, etc.).
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Toolbar buttons prevent blur themselves via their own mousedown handler
      if (target.closest?.(`#${TOOLBAR_ID}`)) return;

      // Clicks inside the currently active editable = text selection — pass through
      if (activeEdit && activeEdit.el.contains(target)) return;

      const blockEl = findBlockEl(target);

      if (!blockEl) {
        // Clicked completely outside any block
        if (activeEdit) { commitEdit(); }
        return;
      }

      if (isInsideDynamic(target, blockEl)) return; // handled in onClick

      const editableEl = findEditableEl(target, blockEl);

      if (editableEl) {
        // Switching from one editable to another: commit first
        if (activeEdit && activeEdit.el !== editableEl) commitEdit();

        if (!activeEdit) {
          enterEdit(editableEl, blockEl.dataset.blockId!);
        }
        // Do NOT preventDefault / stopPropagation.
        // The browser's default mousedown behavior will focus the contenteditable
        // and place the cursor exactly where the user clicked.
        return;
      }

      // Clicked on a non-editable part of the block → commit any open edit.
      if (activeEdit) commitEdit();
      // Let onClick handle block selection.
    };

    // click: handles block selection, link prevention, and dynamic toasts.
    // Editing itself is handled by mousedown above.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest?.(`#${TOOLBAR_ID}`)) return;

      // Inside the active editable: only block link navigation
      if (activeEdit && activeEdit.el.contains(target)) {
        e.preventDefault();   // stop any <a> / <Link> from navigating
        e.stopPropagation();  // don't fall into block-select below
        return;
      }

      // Click outside active edit → commit (blur may not have fired yet)
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

      // Dynamic content
      if (isInsideDynamic(target, blockEl)) {
        document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
        blockEl.classList.add(SELECTED);
        window.parent?.postMessage(
          { source: "template-editor", type: "select", blockId }, "*",
        );
        showLiveToast(e.clientX, e.clientY);
        return;
      }

      // Select the block
      document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
      blockEl.classList.remove(HOVER);
      blockEl.classList.add(SELECTED);
      window.parent?.postMessage(
        { source: "template-editor", type: "select", blockId }, "*",
      );
    };

    // ── Keyboard ──────────────────────────────────────────────────────────────

    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeEdit) return;
      if (e.key === "Escape") {
        const { el, isRich, original } = activeEdit;
        if (isRich) el.innerHTML = original;
        else        el.innerText  = original;
        el.blur(); // triggers blur → commitEdit (value === original → no postMessage)
        e.preventDefault();
      }
    };

    // ── postMessage from AdminPanel ───────────────────────────────────────────

    const onMessage = (e: MessageEvent) => {
      const data = e.data as {
        source?: string; type?: string;
        blockId?: string; fieldKey?: string; value?: string;
        visible?: boolean; scroll?: boolean;
      };
      if (!data || data.source !== "template-admin") return;

      if (data.type === "highlight") {
        // Same block as active edit → just ignore (don't commit mid-edit)
        if (activeEdit && data.blockId === activeEdit.blockId) return;

        if (activeEdit) commitEdit();
        document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
        if (data.blockId) {
          const el = document.querySelector<HTMLElement>(`[data-block-id="${data.blockId}"]`);
          el?.classList.add(SELECTED);
          // Only jump when the user picked a different section. Re-painting the
          // ring after a save-triggered reload must leave scroll where it was.
          if (data.scroll) el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      if (data.type === "toggle-visible" && data.blockId) {
        const el = document.querySelector<HTMLElement>(`[data-block-id="${data.blockId}"]`);
        if (el) el.style.display = data.visible ? "" : "none";
      }

      // Sidebar-driven field sync (keeps preview text in sync with any sidebar controls)
      if (data.type === "sync-field" && data.blockId && data.fieldKey) {
        const el = document.querySelector<HTMLElement>(
          `[data-block-id="${data.blockId}"] [data-editable="${data.fieldKey}"]`,
        );
        if (el && el !== activeEdit?.el) {
          if (el.dataset.editableKind === "rich") el.innerHTML = data.value ?? "";
          else                                    el.innerText  = data.value ?? "";
        }
      }
    };

    // ── Register ──────────────────────────────────────────────────────────────

    document.addEventListener("mouseover",  onOver);
    document.addEventListener("mousedown",  onMouseDown, true);  // capture
    document.addEventListener("click",      onClick,     true);  // capture
    document.addEventListener("keydown",    onKeyDown);
    window.addEventListener("message",      onMessage);

    // Announce that the listener above is live. The iframe's `load` event fires
    // before React hydrates, so anything the editor sent then was dropped —
    // this handshake is what makes the selection survive a reload.
    window.parent?.postMessage({ source: "template-editor", type: "ready" }, "*");

    return () => {
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mousedown",  onMouseDown, true);
      document.removeEventListener("click",      onClick,     true);
      document.removeEventListener("keydown",    onKeyDown);
      window.removeEventListener("message",      onMessage);
      document.getElementById(TOOLBAR_ID)?.remove();
      liveToast?.remove();
    };
  }, []);

  return (
    <style>{`
      /* Unselected blocks show pointer — "click to select" */
      [data-block-id]:not(.${SELECTED}) { cursor: pointer; }

      /* Once selected, default cursor so children can show their own cursor */
      .${SELECTED} { cursor: default; outline: 2px dashed #ef4444; outline-offset: -2px; position: relative; }
      .${HOVER}    { outline: 2px dashed color-mix(in srgb, #ef4444 60%, transparent); outline-offset: -2px; }

      /* Editable text — text cursor and a subtle blue hint on hover */
      [data-editable]:not([contenteditable]) { cursor: text; border-radius: 3px; }
      [data-editable]:not([contenteditable]):hover {
        outline: 1px dashed rgba(59,130,246,0.45);
        outline-offset: 3px;
      }

      /* Active inline edit */
      [data-editable][contenteditable] {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 3px;
        border-radius: 3px;
        caret-color: #3b82f6;
        min-width: 4px;
      }

      /* Live / dynamic content */
      [data-dynamic] * { cursor: default !important; }
      [data-dynamic]:hover {
        outline: 1px dashed rgba(245,158,11,0.5);
        outline-offset: 4px;
        border-radius: 4px;
      }
    `}</style>
  );
}
