(function () {
  "use strict";

  function setLanguage(language, updateUrl) {
    var lang = language === "ar" ? "ar" : "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-legal-lang]").forEach(function (section) {
      section.hidden = section.getAttribute("data-legal-lang") !== lang;
    });
    document.querySelectorAll("[data-legal-language]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-legal-language") === lang ? "true" : "false");
    });
    document.querySelectorAll("[data-legal-link]").forEach(function (link) {
      var base = link.getAttribute("data-legal-link");
      link.href = base + (lang === "ar" ? "?lang=ar" : "");
    });
    var home = document.querySelector("[data-legal-home]");
    if (home) {
      home.textContent = lang === "ar" ? "العودة إلى الرئيسية" : "Back to home";
      home.href = lang === "ar" ? "/?lang=ar" : "/";
    }
    if (updateUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (lang === "ar") url.searchParams.set("lang", "ar"); else url.searchParams.delete("lang");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var initial = new URLSearchParams(window.location.search).get("lang") === "ar" ? "ar" : "en";
    document.querySelectorAll("[data-legal-language]").forEach(function (button) {
      button.addEventListener("click", function () { setLanguage(button.getAttribute("data-legal-language"), true); });
    });
    setLanguage(initial, false);
  });
})();
