(function () {
  "use strict";

  var GA_ID = "G-6Y3N9GSJM4";
  var STORAGE_KEY = "men_analytics_choice";
  var PANEL_ID = "men-cookie-panel";
  var SETTINGS_ID = "men-cookie-settings";

  var copy = {
    en: {
      title: "Your privacy choices",
      body: "We use optional Google Analytics to understand how the site is used. Analytics is disabled unless you accept. You can change your choice at any time.",
      policy: "Cookie Policy",
      decline: "Decline analytics",
      accept: "Accept analytics",
      settings: "Cookie settings",
      label: "Analytics cookie preferences"
    },
    ar: {
      title: "خيارات الخصوصية",
      body: "نستخدم Google Analytics اختيارياً لفهم كيفية استخدام الموقع. تبقى التحليلات معطّلة ما لم توافق، ويمكنك تغيير اختيارك في أي وقت.",
      policy: "سياسة ملفات الارتباط",
      decline: "رفض التحليلات",
      accept: "قبول التحليلات",
      settings: "إعدادات ملفات الارتباط",
      label: "تفضيلات ملفات تحليلات الارتباط"
    }
  };

  function getLanguage() {
    var params = new URLSearchParams(window.location.search);
    var documentLanguage = (document.documentElement.lang || "").toLowerCase();
    return params.get("lang") === "ar" || documentLanguage.indexOf("ar") === 0 || document.documentElement.dir === "rtl" ? "ar" : "en";
  }

  function safeGet() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (error) { return null; }
  }

  function safeSet(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (error) { /* Consent still applies for this page view. */ }
  }

  function queueDefaultConsent() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    });
  }

  function clearAnalyticsCookies() {
    var host = window.location.hostname.replace(/^www\./, "");
    var domains = ["", host, "." + host];
    document.cookie.split(";").forEach(function (item) {
      var name = item.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) return;
      domains.forEach(function (domain) {
        var domainPart = domain ? "; domain=" + domain : "";
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + domainPart + "; SameSite=Lax";
      });
    });
  }

  function loadAnalytics() {
    if (window.__menAnalyticsLoaded) return;
    window.__menAnalyticsLoaded = true;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: "SameSite=None;Secure"
    });

    var tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(tag);
  }

  function applyChoice(value) {
    safeSet(value);
    if (value === "accepted") {
      loadAnalytics();
    } else {
      window.gtag("consent", "update", { analytics_storage: "denied" });
      clearAnalyticsCookies();
    }
    hidePanel();
    window.dispatchEvent(new CustomEvent("men:analytics-consent", { detail: { choice: value } }));
  }

  function panel() { return document.getElementById(PANEL_ID); }
  function settingsButton() { return document.getElementById(SETTINGS_ID); }

  function showPanel() {
    if (panel()) panel().hidden = false;
    if (settingsButton()) settingsButton().hidden = true;
  }

  function hidePanel() {
    if (panel()) panel().hidden = true;
    if (settingsButton()) settingsButton().hidden = false;
  }

  function updateLanguage() {
    var lang = getLanguage();
    var text = copy[lang];
    var policy = document.querySelector("[data-men-cookie-policy]");
    var values = {
      "[data-men-cookie-title]": text.title,
      "[data-men-cookie-body]": text.body,
      "[data-men-cookie-decline]": text.decline,
      "[data-men-cookie-accept]": text.accept,
      "[data-men-cookie-settings]": text.settings
    };
    Object.keys(values).forEach(function (selector) {
      var element = document.querySelector(selector);
      if (element) element.textContent = values[selector];
    });
    if (policy) {
      policy.textContent = text.policy;
      policy.href = "/cookie-policy" + (lang === "ar" ? "?lang=ar" : "");
    }
    if (panel()) panel().setAttribute("aria-label", text.label);
    if (settingsButton()) settingsButton().setAttribute("aria-label", text.settings);
    document.querySelectorAll("[data-men-legal-en]").forEach(function (element) { element.hidden = lang !== "en"; });
    document.querySelectorAll("[data-men-legal-ar]").forEach(function (element) { element.hidden = lang !== "ar"; });
    document.querySelectorAll("[data-men-policy-link]").forEach(function (link) {
      var base = link.getAttribute("data-men-policy-link");
      link.href = base + (lang === "ar" ? "?lang=ar" : "");
    });
  }

  function renderControls() {
    if (panel()) return;
    var wrapper = document.createElement("div");
    wrapper.innerHTML =
      '<section class="men-cookie-panel" id="' + PANEL_ID + '" role="dialog" aria-live="polite" aria-modal="false" hidden>' +
        '<div class="men-cookie-copy"><strong data-men-cookie-title></strong><p data-men-cookie-body></p>' +
        '<a data-men-cookie-policy href="/cookie-policy"></a></div>' +
        '<div class="men-cookie-actions">' +
          '<button class="men-cookie-button men-cookie-decline" type="button" data-men-cookie-decline></button>' +
          '<button class="men-cookie-button men-cookie-accept" type="button" data-men-cookie-accept></button>' +
        '</div>' +
      '</section>' +
      '<button class="men-cookie-settings" id="' + SETTINGS_ID + '" type="button" data-men-cookie-settings hidden></button>';
    while (wrapper.firstChild) document.body.appendChild(wrapper.firstChild);

    document.querySelector("[data-men-cookie-accept]").addEventListener("click", function () { applyChoice("accepted"); });
    document.querySelector("[data-men-cookie-decline]").addEventListener("click", function () { applyChoice("declined"); });
    settingsButton().addEventListener("click", showPanel);
    updateLanguage();

    if (safeGet()) hidePanel(); else showPanel();

    new MutationObserver(updateLanguage).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"]
    });
  }

  queueDefaultConsent();
  if (safeGet() === "accepted") loadAnalytics();

  window.MENConsent = {
    open: showPanel,
    accept: function () { applyChoice("accepted"); },
    decline: function () { applyChoice("declined"); },
    choice: safeGet
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderControls);
  } else {
    renderControls();
  }
})();
