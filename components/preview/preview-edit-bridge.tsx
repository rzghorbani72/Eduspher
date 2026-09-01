"use client";

import { useEffect } from "react";

import { usePreviewScrollMemory } from "./use-preview-scroll-memory";
import { applyLiveTheme } from "./apply-live-theme";
import type { ThemeConfigInput } from "@/lib/theme-apply";
import { isTrustedPanelOrigin, postMessageToPanel } from "@/lib/trusted-panel-origin";
import { sanitizeRichText } from "@/lib/sanitize";

const HOVER = "me-hover";
const SELECTED = "me-selected";
const EDITING = "me-editing";
const TOOLBAR_ID = "me-format-toolbar";
const BLOCK_TOOLBAR_ID = "me-block-toolbar";
const MEDIA_BTN_CLASS = "me-media-upload-btn";
const REMOVE_BTN_CLASS = "me-remove-btn";
// Canvas media (hero backgrounds, decorative visuals) renders above the fold
// on every page view and counts against the academy's storage plan — capped
// tighter than the platform's general 10MB upload limit on purpose. Keep in
// sync with any server-side limit if one is added for this upload path.
const MAX_CANVAS_MEDIA_BYTES = 4 * 1024 * 1024;

function removeBlockToolbar() {
  document.getElementById(BLOCK_TOOLBAR_ID)?.remove();
}

function showBlockToolbar(blockEl: HTMLElement) {
  removeBlockToolbar();
  const blockId = blockEl.dataset.blockId;
  if (!blockId) return;

  const bar = document.createElement("div");
  bar.id = BLOCK_TOOLBAR_ID;
  Object.assign(bar.style, {
    position: "absolute",
    zIndex: "99998",
    top: "8px",
    insetInlineEnd: "8px",
    display: "flex",
    gap: "4px",
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    padding: "4px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
    pointerEvents: "all",
  });

  const actions = [
    { action: "move-up", label: "↑" },
    { action: "move-down", label: "↓" },
    { action: "hide", label: "◌" },
    { action: "delete", label: "×" },
  ];

  for (const { action, label } of actions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = action;
    btn.textContent = label;
    Object.assign(btn.style, {
      padding: "4px 8px",
      background: "transparent",
      border: "none",
      borderRadius: "4px",
      color: action === "delete" ? "#f87171" : "#e4e4e7",
      fontSize: "13px",
      cursor: "pointer",
      lineHeight: "1",
    });
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      postMessageToPanel(
        { source: "template-editor", type: "block-action", blockId, action },
      );
    });
    bar.appendChild(btn);
  }

  if (getComputedStyle(blockEl).position === "static") {
    blockEl.style.position = "relative";
  }
  blockEl.appendChild(bar);
}

type MediaPickRequest = {
  blockId: string;
  fieldKey: string;
  // Set only for "restore with photo": the visibility flag to also turn on
  // once the upload succeeds, so both changes land as one config patch and
  // the slot restore never triggers a second, dialog-killing reload.
  restoreKey?: string;
};

function attachMediaUploadButtons(
  root: ParentNode,
  requestPick: (target: MediaPickRequest) => void,
) {
  root.querySelectorAll<HTMLElement>("[data-media-editable]").forEach((slot) => {
    if (slot.querySelector(`.${MEDIA_BTN_CLASS}`)) return;
    const fieldKey = slot.dataset.mediaEditable!;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = MEDIA_BTN_CLASS;
    btn.title = "Upload";
    btn.textContent = "↑";
    Object.assign(btn.style, {
      position: "absolute",
      zIndex: "20",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "40px",
      height: "40px",
      borderRadius: "9999px",
      border: "2px solid #fff",
      background: "rgba(24,24,27,0.82)",
      color: "#fff",
      fontSize: "18px",
      cursor: "pointer",
      opacity: "0",
      transition: "opacity 0.15s",
      pointerEvents: "all",
    });
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const blockEl = slot.closest<HTMLElement>("[data-block-id]");
      const blockId = blockEl?.dataset.blockId;
      if (!blockId) return;
      // File picker must open in this document — parent cannot call input.click()
      // from postMessage (user-activation is lost across the iframe boundary).
      requestPick({ blockId, fieldKey });
    });
    slot.addEventListener("mouseenter", () => { btn.style.opacity = "1"; });
    slot.addEventListener("mouseleave", () => {
      if (btn.dataset.uploading !== "1") btn.style.opacity = "0";
    });
    if (getComputedStyle(slot).position === "static") slot.style.position = "relative";
    slot.appendChild(btn);
  });
}

/**
 * Upload feedback on the button itself. While it runs the button stays visible
 * (it normally only appears on hover) and counts up, so the canvas never looks
 * like the click did nothing.
 */
function setMediaButtonUploading(
  btn: HTMLButtonElement,
  uploading: boolean,
  percent: number,
) {
  btn.disabled = uploading;
  btn.dataset.uploading = uploading ? "1" : "";
  btn.style.opacity = uploading ? "1" : "0";
  btn.style.cursor = uploading ? "default" : "pointer";
  btn.style.fontSize = uploading ? "12px" : "18px";
  btn.textContent = uploading ? `${Math.round(percent)}%` : "\u2191";
}

function attachRemovableRestoreButtons(
  root: ParentNode = document,
  requestPick?: (target: MediaPickRequest) => void,
) {
  root.querySelectorAll<HTMLElement>("[data-removable-restore]").forEach((el) => {
    if (el.dataset.restoreBound === "1") return;
    el.dataset.restoreBound = "1";
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const flagKey = el.dataset.removableRestore!;
      const mediaKey = el.dataset.removableRestoreMedia;
      const blockEl = el.closest<HTMLElement>("[data-block-id]");
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
        source: "template-editor",
        type: "toggle-removable",
        blockId,
        fieldKey: flagKey,
        restore: true,
      });
    });
  });
}

function attachRemovableButtons(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-removable]").forEach((el) => {
    if (el.querySelector(`.${REMOVE_BTN_CLASS}`)) return;
    const flagKey = el.dataset.removable!;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = REMOVE_BTN_CLASS;
    btn.title = "Remove";
    btn.textContent = "×";
    Object.assign(btn.style, {
      position: "absolute",
      zIndex: "21",
      top: "4px",
      insetInlineEnd: "4px",
      width: "22px",
      height: "22px",
      borderRadius: "9999px",
      border: "none",
      background: "rgba(239,68,68,0.9)",
      color: "#fff",
      fontSize: "14px",
      lineHeight: "1",
      cursor: "pointer",
      opacity: "0",
      transition: "opacity 0.15s",
      pointerEvents: "all",
    });
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const blockEl = el.closest<HTMLElement>("[data-block-id]");
      const blockId = blockEl?.dataset.blockId;
      if (!blockId) return;
      postMessageToPanel({
        source: "template-editor",
        type: "toggle-removable",
        blockId,
        fieldKey: flagKey,
        restore: false,
      });
    });
    el.addEventListener("mouseenter", () => { btn.style.opacity = "1"; });
    el.addEventListener("mouseleave", () => { btn.style.opacity = "0"; });
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(btn);
  });
}

function buildToolbar(target: HTMLElement, blockId: string): HTMLElement {
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

  const accentField = target.dataset.accentColorField;
  if (accentField) {
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.title = "accent";
    const current = target.style.color || getComputedStyle(target).color;
    if (current) colorInput.value = rgbToHex(current);
    Object.assign(colorInput.style, {
      width: "28px",
      height: "28px",
      padding: "0",
      border: "none",
      background: "transparent",
      cursor: "pointer",
    });
    colorInput.addEventListener("mousedown", (e) => e.preventDefault());
    colorInput.addEventListener("input", () => {
      target.style.color = colorInput.value;
      postMessageToPanel({
        source: "template-editor",
        type: "accent-color-update",
        blockId,
        fieldKey: accentField,
        value: colorInput.value,
      });
    });
    bar.appendChild(colorInput);
  }

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.title = "clear";
  clearBtn.textContent = "⌫";
  Object.assign(clearBtn.style, {
    padding: "4px 8px",
    background: "transparent",
    border: "none",
    borderRadius: "4px",
    color: "#e4e4e7",
    fontSize: "13px",
    cursor: "pointer",
  });
  clearBtn.addEventListener("mousedown", (e) => e.preventDefault());
  clearBtn.addEventListener("click", () => {
    target.innerText = "";
    target.focus();
  });
  bar.appendChild(clearBtn);

  placeToolbar(bar, target);
  document.body.appendChild(bar);
  return bar;
}

function rgbToHex(color: string): string {
  if (color.startsWith("#")) return color.slice(0, 7);
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return "#3b82f6";
  const hex = (n: string) => Number(n).toString(16).padStart(2, "0");
  return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
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

    const rawValue = isRich ? el.innerHTML : el.innerText.trim();
      const value = isRich ? sanitizeRichText(rawValue) : rawValue;
      if (value !== original) {
        postMessageToPanel({
          source: "template-editor",
          type: "field-update",
          blockId,
          fieldKey,
          value,
        });
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

      const accentField = editableEl.dataset.accentColorField;
      if (isRich || accentField) {
        const bar = buildToolbar(editableEl, blockId);
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

      if (target.closest?.(`#${BLOCK_TOOLBAR_ID}`)) return;
      if (target.closest?.(`.${MEDIA_BTN_CLASS}`)) return;
      if (target.closest?.(`.${REMOVE_BTN_CLASS}`)) return;
      if (target.closest?.("[data-removable-restore]")) return;

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
      if (target.closest?.(`#${BLOCK_TOOLBAR_ID}`)) return;
      if (target.closest?.(`.${MEDIA_BTN_CLASS}`)) return;
      if (target.closest?.(`.${REMOVE_BTN_CLASS}`)) return;
      if (target.closest?.("[data-removable-restore]")) return;

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
        showBlockToolbar(blockEl);
        postMessageToPanel({ source: "template-editor", type: "select", blockId });
        showLiveToast(e.clientX, e.clientY);
        return;
      }

      // Select the block
      document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
      blockEl.classList.remove(HOVER);
      blockEl.classList.add(SELECTED);
      showBlockToolbar(blockEl);
      postMessageToPanel({ source: "template-editor", type: "select", blockId });
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
      if (!isTrustedPanelOrigin(e.origin)) return;

      const data = e.data as {
        source?: string; type?: string;
        blockId?: string; fieldKey?: string; value?: string;
        visible?: boolean; scroll?: boolean;
        theme?: ThemeConfigInput; direction?: "ltr" | "rtl";
        order?: string[];
        uploading?: boolean; percent?: number;
      };
      if (!data || data.source !== "template-admin") return;

      // This edit cannot be expressed against the current DOM (a field the
      // section does not mark editable, a section the server filtered out, a
      // layout prop rendered server-side). Ask for a rebuild rather than
      // silently dropping the change — the same fallback HMR makes.
      const requestReload = () => {
        postMessageToPanel({ source: "template-editor", type: "needs-reload" });
      };

      // Style change — repaint the CSS variables in place, no navigation.
      if (data.type === "sync-theme" && data.theme) {
        applyLiveTheme(data.theme, data.direction);
      }

      // Reorder / delete — the sections are already in the DOM, so move or drop
      // the nodes instead of asking the server to render the same HTML again.
      if (data.type === "sync-order" && data.order) {
        const canvas = document.querySelector<HTMLElement>("[data-theme-canvas]");
        if (!canvas) return;
        const present = new Set(data.order);
        for (const el of canvas.querySelectorAll<HTMLElement>("[data-block-id]")) {
          if (!present.has(el.dataset.blockId ?? "")) el.remove();
        }
        let missing = false;
        for (const blockId of data.order) {
          const el = canvas.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`);
          // A hidden section is filtered out server-side, so it is absent here
          // and cannot be re-ordered into place without a rebuild.
          if (el) canvas.appendChild(el);
          else missing = true;
        }
        if (missing) requestReload();
      }

      if (data.type === "highlight") {
        // Same block as active edit → just ignore (don't commit mid-edit)
        if (activeEdit && data.blockId === activeEdit.blockId) return;

        if (activeEdit) commitEdit();
        document.querySelectorAll(`.${SELECTED}`).forEach((n) => n.classList.remove(SELECTED));
        removeBlockToolbar();
        if (data.blockId) {
          const el = document.querySelector<HTMLElement>(`[data-block-id="${data.blockId}"]`);
          el?.classList.add(SELECTED);
          if (el) showBlockToolbar(el);
          // Only jump when the user picked a different section. Re-painting the
          // ring after a save-triggered reload must leave scroll where it was.
          if (data.scroll) el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      if (data.type === "toggle-visible" && data.blockId) {
        const el = document.querySelector<HTMLElement>(`[data-block-id="${data.blockId}"]`);
        if (!el) {
          requestReload();
        } else if (data.visible && el.children.length === 0) {
          // The wrapper is always rendered, but a section hidden at render time
          // has empty contents. Un-hiding it would reveal a blank gap, so the
          // markup has to be fetched.
          requestReload();
        } else {
          el.style.display = data.visible ? "" : "none";
        }
      }

      // The panel runs the upload; the button the user pressed is in here, so
      // it is what has to show the progress.
      if (data.type === "media-uploading" && data.blockId && data.fieldKey) {
        const slot = document.querySelector<HTMLElement>(
          `[data-block-id="${data.blockId}"] [data-media-editable="${data.fieldKey}"]`,
        );
        const btn = slot?.querySelector<HTMLButtonElement>(`.${MEDIA_BTN_CLASS}`);
        if (btn) setMediaButtonUploading(btn, data.uploading === true, data.percent ?? 0);
      }

      // Sidebar-driven field sync (keeps preview text in sync with any sidebar controls)
      if (data.type === "sync-field" && data.blockId && data.fieldKey) {
        const el = document.querySelector<HTMLElement>(
          `[data-block-id="${data.blockId}"] [data-editable="${data.fieldKey}"]`,
        );
        if (!el) {
          // Not a marked-up text node: a toggle, an alignment, a column count,
          // an image — all rendered server-side. Only a rebuild can show it.
          requestReload();
        } else if (el !== activeEdit?.el) {
          if (el.dataset.editableKind === "rich") {
            el.innerHTML = sanitizeRichText(data.value ?? "");
          } else {
            el.innerText = data.value ?? "";
          }
        }
      }
    };

    // ── Canvas media picker (must live in iframe for user-activation) ─────────

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,image/gif,image/webp";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    let pendingMedia: MediaPickRequest | null = null;

    const requestMediaPick = (target: MediaPickRequest) => {
      pendingMedia = target;
      fileInput.click();
    };

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      const pending = pendingMedia;
      pendingMedia = null;
      fileInput.value = "";
      if (!file || !pending) return;

      if (file.size > MAX_CANVAS_MEDIA_BYTES) {
        postMessageToPanel({
          source: "template-editor",
          type: "media-error",
          message: `حجم فایل باید کمتر از ${MAX_CANVAS_MEDIA_BYTES / (1024 * 1024)} مگابایت باشد.`,
        });
        return;
      }

      const buffer = await file.arrayBuffer();
      postMessageToPanel(
        {
          source: "template-editor",
          type: "media-file-selected",
          blockId: pending.blockId,
          fieldKey: pending.fieldKey,
          restoreKey: pending.restoreKey,
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
          buffer,
        },
        [buffer],
      );
    });

    // ── Register ──────────────────────────────────────────────────────────────

    attachMediaUploadButtons(document, requestMediaPick);
    attachRemovableButtons();
    attachRemovableRestoreButtons(document, requestMediaPick);

    document.addEventListener("mouseover",  onOver);
    document.addEventListener("mousedown",  onMouseDown, true);  // capture
    document.addEventListener("click",      onClick,     true);  // capture
    document.addEventListener("keydown",    onKeyDown);
    window.addEventListener("message",      onMessage);

    // Announce that the listener above is live. The iframe's `load` event fires
    // before React hydrates, so anything the editor sent then was dropped —
    // this handshake is what makes the selection survive a reload.
    postMessageToPanel({ source: "template-editor", type: "ready" });

    return () => {
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mousedown",  onMouseDown, true);
      document.removeEventListener("click",      onClick,     true);
      document.removeEventListener("keydown",    onKeyDown);
      window.removeEventListener("message",      onMessage);
      document.getElementById(TOOLBAR_ID)?.remove();
      removeBlockToolbar();
      liveToast?.remove();
      fileInput.remove();
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

      /* Media upload overlay target */
      [data-media-editable] { position: relative; }
      [data-media-editable]:hover { outline: 2px dashed rgba(59,130,246,0.55); outline-offset: 2px; }

      /* Removable decoration */
      [data-removable]:hover { outline: 1px dashed rgba(239,68,68,0.45); outline-offset: 2px; }
      [data-removable-restore] { cursor: pointer; pointer-events: all; }

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
