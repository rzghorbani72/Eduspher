// Appended by Mentoma Meet branding (Hamravesh web ConfigMap / custom-config.js).

config.defaultLanguage = 'fa';
config.disableDeepLinking = true;
config.subject = 'جلسه منتوما';
config.localSubject = 'جلسه منتوما';

config.prejoinConfig = config.prejoinConfig || {};
config.prejoinConfig.enabled = true;

// Prefer Mentoma product name in connection/leave copy (with APP_NAME=منتوما).
config.disabledNotifications = (config.disabledNotifications || []).concat([
  // Leave the thank-you toast enabled — it will say منتوما once APP_NAME is set.
]);

config.toolbarButtons = config.toolbarButtons || [
  'microphone',
  'camera',
  'desktop',
  'chat',
  'raisehand',
  'participants-pane',
  'tileview',
  'fullscreen',
  'hangup',
  'settings',
];
