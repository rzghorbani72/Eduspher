export const HOVER = 'me-hover';

export const SELECTED = 'me-selected';

export const EDITING = 'me-editing';

export const TOOLBAR_ID = 'me-format-toolbar';

export const MEDIA_BTN_CLASS = 'me-media-upload-btn';

export const REMOVE_BTN_CLASS = 'me-remove-btn';

// Canvas media (hero backgrounds, decorative visuals) renders above the fold
// on every page view and counts against the academy's storage plan — capped
// tighter than the platform's general 10MB upload limit on purpose. Keep in
// sync with any server-side limit if one is added for this upload path.
export const MAX_CANVAS_MEDIA_BYTES = 4 * 1024 * 1024;

export const UNDO_TOAST_ID = 'me-undo-toast';
