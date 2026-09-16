// Appended by Mentoma Meet branding (Hamravesh web custom-config.js).

config.defaultLanguage = 'fa';
config.disableDeepLinking = true;
config.enableWelcomePage = false;
config.enableClosePage = false;
config.subject = 'جلسه منتوما';
config.localSubject = 'جلسه منتوما';
config.defaultLogoUrl = 'https://mentoma.ir/meet-branding/logo-mark.svg';
config.defaultLocalDisplayName = 'من';
config.defaultRemoteDisplayName = 'شرکت‌کننده';

config.prejoinConfig = config.prejoinConfig || {};
config.prejoinConfig.enabled = true;

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

(function brandMentomaMeet() {
  if (typeof document === 'undefined') return;

  var CSS_HREF = 'https://mentoma.ir/meet-branding/custom-mentoma.css';
  var SKIN_ID = 'mentoma-meet-skin';
  var FA_COPY = {
    welcomepage: {
      headerTitle: 'منتوما',
      headerSubtitle: 'جلسات امن و با کیفیت بالا',
      jitsiOnMobile: 'منتوما روی تلفن همراه',
      reducedUIText: 'به منتوما خوش‌آمدید!',
      logo: { logoDeepLinking: 'نشان‌وارهٔ منتوما' },
    },
  };

  function injectCss() {
    if (document.getElementById(SKIN_ID)) return;
    var link = document.createElement('link');
    link.id = SKIN_ID;
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    (document.head || document.documentElement).appendChild(link);
  }

  function patchI18n() {
    var i18n =
      window.i18next ||
      (window.APP && window.APP.translation && window.APP.translation.i18next);
    if (!i18n || typeof i18n.addResourceBundle !== 'function') return false;
    ['main', 'translation'].forEach(function (ns) {
      i18n.addResourceBundle('fa', ns, FA_COPY, true, true);
    });
    if (typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage('fa');
    }
    document.title = 'منتوما';
    return true;
  }

  injectCss();
  if (patchI18n()) return;

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (patchI18n() || tries > 40) clearInterval(timer);
  }, 250);
})();
