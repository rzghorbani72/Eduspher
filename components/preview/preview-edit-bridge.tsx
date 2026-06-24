"use client";

import { useEffect } from "react";

const HOVER = "me-hover";
const SELECTED = "me-selected";
const EDITING = "me-editing";
const TOOLBAR_ID = "me-format-toolbar";

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
      fontWeight: tool.cmd === "bold" ? "bold" : "normal",
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

  placeToolbar(bar, target);
  document.body.appendChild(bar);
  return bar;
}

function placeToolbar(bar: HTMLElement, target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const barH = 36;
  const top = rect.top > barH + 12 ? rect.top - barH - 8 : rect.bottom + 8;
  bar.style.left = `${Math.max(4, rect.left)}px`;
  bar.style.top = `${top}px`;
}

export function PreviewEditBridge() {
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

    const findBlockEl = (target: EventTarget | null): HTMLElement | null => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.dataset?.blockId) return el;
        el = el.parentElement;
      }
      return null;
    };

    // Return true if target is inside a [data-dynamic] container
    const isInsideDynamic = (
      target: EventTarget | null,
      blockEl: HTMLElement,
    ): boolean => {
      let el = target as HTMLElement | null;
      while (el && el !== blockEl) {
        if (el.dataset?.dynamic) return true;
        el = el.parentElement;
      }
      return false;
    };

    // Find the nearest data-editable ancestor, stopping at (not including) blockEl.
    // Returns null if the target is inside a [data-dynamic] container.
    const findEditableEl = (
      target: EventTarget | null,
      blockEl: HTMLElement,
    ): HTMLElement | null => {
      let el = target as HTMLElement | null;
      while (el && el !== blockEl) {
        if (el.dataset?.dynamic) return null; // inside live data — not editable
        if (el.dataset?.editable) return el;
        el = el.parentElement;
      }
      return null;
    };

    // Show a self-removing toast near the cursor for live-data click feedback
    let liveToast: HTMLElement | null = null;
    const showLiveToast = (x: number, y: number) => {
      liveToast?.remove();
      const toast = document.createElement("div");
      toast.style.cssText = `
        position: fixed; z-index: 99998;
        left: ${x + 12}px; top: ${y - 36}px;
        background: #78350f; color: #fef3c7;
        border: 1px solid #92400e;
        border-radius: 6px; padding: 5px 10px;
        font-size: 12px; font-family: sans-serif;
        white-space: nowrap; pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      `;
      toast.textContent = "محتوای زنده — از داشبورد مدیریت می‌شود";
      document.body.appendChild(toast);
      liveToast = toast;
      setTimeout(() => { toast.remove(); if (liveToast === toast) liveToast = null; }, 2200);
    };

    const commitEdit = () => {
      if (!activeEdit) return;
      const { el, blockId, fieldKey, isRich, original } = activeEdit;
      if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }

      el.removeAttribute("contenteditable");
      el.classList.remove(EDITING);

      const value = isRich ? el.innerHTML : el.innerText.trim();
      if (value !== original) {
        window.parent?.postMessage(
          { source: "mentoma-editor", type: "field-update", blockId, fieldKey, value },
          "*",
        );
      }

      // Restore block selection outline after inline edit
      const blockEl = document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
      blockEl?.classList.add(SELECTED);

      document.getElementById(TOOLBAR_ID)?.remove();
      activeEdit = null;
    };

    const enterEdit = (editableEl: HTMLElement, blockId: string) => {
      if (activeEdit) commitEdit();

      const fieldKey = editableEl.dataset.editable!;
      const isRich = editableEl.dataset.editableKind === "rich";
      const original = isRich ? editableEl.innerHTML : editableEl.innerText.trim();

      // Hide the block-level selection ring while typing so the edit border is clear
      document.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`)?.classList.remove(SELECTED);

      editableEl.setAttribute("contenteditable", "true");
      editableEl.classList.add(EDITING);

      // Focus must happen in the same microtask; requestAnimationFrame is NOT used
      // here so the browser keeps this as a trusted user-gesture focus call.
      editableEl.focus();

      // Place cursor at end of content
      const range = document.createRange();
      range.selectNodeContents(editableEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      activeEdit = { el: editableEl, blockId, fieldKey, isRich, original };

      if (isRich) {
        const bar = buildToolbar(editableEl);
        editableEl.addEventListener("keyup", () => placeToolbar(bar, editableEl));
      }

      // Commit on blur — the 150 ms delay lets toolbar's mousedown (which
      // calls preventDefault, keeping focus) cancel this before it fires.
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

      // Toolbar buttons handle their own events — pass through
      if (target.closest?.(`#${TOOLBAR_ID}`)) return;

      // Clicks INSIDE the active editable are normal text-selection clicks
      if (activeEdit && activeEdit.el.contains(target)) return;

      // Click anywhere outside the active editable → commit the edit
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

      // If click is on dynamic (live-data) content, show an informational toast
      // and just select the block — never enter inline edit.
      if (isInsideDynamic(target, blockEl)) {
        document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
        blockEl.classList.remove(HOVER);
        blockEl.classList.add(SELECTED);
        window.parent?.postMessage(
          { source: "mentoma-editor", type: "select", blockId },
          "*",
        );
        showLiveToast(e.clientX, e.clientY);
        return;
      }

      // Check if the clicked element (or any ancestor up to the block) is a
      // text-editable node. A single click on text enters inline edit directly.
      const editableEl = findEditableEl(target, blockEl);
      if (editableEl) {
        // Select the block visually and notify AdminPanel (opens the sidebar panel)
        document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
        blockEl.classList.remove(HOVER);
        blockEl.classList.add(SELECTED);
        window.parent?.postMessage(
          { source: "mentoma-editor", type: "select", blockId },
          "*",
        );
        // Enter inline edit immediately — no second click required
        enterEdit(editableEl, blockId);
        return;
      }

      // Click on non-editable area → just select the block
      document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
      blockEl.classList.remove(HOVER);
      blockEl.classList.add(SELECTED);
      window.parent?.postMessage(
        { source: "mentoma-editor", type: "select", blockId },
        "*",
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeEdit) return;
      if (e.key === "Escape") {
        const { el, isRich, original } = activeEdit;
        if (isRich) el.innerHTML = original;
        else el.innerText = original;
        el.removeAttribute("contenteditable");
        el.classList.remove(EDITING);
        document
          .querySelector<HTMLElement>(`[data-block-id="${activeEdit.blockId}"]`)
          ?.classList.add(SELECTED);
        document.getElementById(TOOLBAR_ID)?.remove();
        if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }
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
        // If the incoming highlight is for the block the user is currently
        // editing, don't commit — this happens when AdminPanel echoes back the
        // 'select' we just sent after clicking into inline edit mode.
        if (activeEdit && data.blockId === activeEdit.blockId) {
          // Keep the block ring off while editing; do nothing else
          return;
        }

        // Switching to a different block → commit any open edit first
        if (activeEdit) commitEdit();

        document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
        if (data.blockId) {
          const el = document.querySelector<HTMLElement>(`[data-block-id="${data.blockId}"]`);
          el?.classList.add(SELECTED);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      if (data.type === "toggle-visible" && data.blockId) {
        const el = document.querySelector<HTMLElement>(`[data-block-id="${data.blockId}"]`);
        if (el) el.style.display = data.visible ? "" : "none";
      }

      // Sidebar input changed → mirror the text into the preview immediately
      if (data.type === "sync-field" && data.blockId && data.fieldKey) {
        const el = document.querySelector<HTMLElement>(
          `[data-block-id="${data.blockId}"] [data-editable="${data.fieldKey}"]`,
        );
        // Don't overwrite the element the user is currently typing in
        if (el && el !== activeEdit?.el) {
          if (el.dataset.editableKind === "rich") el.innerHTML = data.value ?? "";
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
      liveToast?.remove();
    };
  }, []);

  return (
    <style>{`
      [data-block-id] { cursor: pointer; }
      .${HOVER}    { outline: 2px dashed color-mix(in srgb, #ef4444 60%, transparent); outline-offset: -2px; }
      .${SELECTED} { outline: 2px dashed #ef4444; outline-offset: -2px; position: relative; }

      /* Subtle hint that text elements are editable */
      [data-editable]:not([contenteditable]) {
        cursor: text;
        border-radius: 3px;
        transition: outline 120ms ease;
      }
      [data-editable]:not([contenteditable]):hover {
        outline: 1px dashed rgba(59,130,246,0.45);
        outline-offset: 3px;
      }
      /* Active inline edit — blue border, caret */
      [data-editable][contenteditable] {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 3px;
        border-radius: 3px;
        cursor: text;
        caret-color: #3b82f6;
        min-width: 4px;
      }

      /* Live / dynamic data — show a "not editable" cursor and amber hint on hover */
      [data-dynamic] * { cursor: default !important; }
      [data-dynamic]:hover {
        outline: 1px dashed rgba(245,158,11,0.5);
        outline-offset: 4px;
        border-radius: 4px;
      }
    `}</style>
  );
}
