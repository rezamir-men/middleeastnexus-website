/*!
 * Middle East Nexus — Lead generation (Phase 1)
 * Rebuilt 2026-09-26 (the repository copy had been overwritten by an
 * "Unsupported Media Type" upload error).
 *
 * 1. Fixed bottom conversion bar on content pages (EN / AR, follows the page's language toggle).
 * 2. First-touch attribution (landing page, referrer, UTM) kept for the visit.
 * 3. Smart consultation form: context from URL (?type, ?interest, ?source), consultation/opportunity
 *    switch, sector / governorate / support preselection, Formspree AJAX submit with spam checks.
 * 4. GA4 events: consultation_click, opportunity_click, form_start, form_submit, form_error,
 *    generate_lead (fired once, on /thank-you, only after Formspree confirmed success).
 */
(function () {
  "use strict";

  var ATTR_KEY = "men_lead_attribution";
  var LAST_PAGE_KEY = "men_lead_last_page";
  var LEAD_TOKEN_KEY = "men_lead_success";
  var MIN_FILL_MS = 2500;
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  /* ---------------- helpers ---------------- */
  function ss(method, key, value) {
    try {
      if (method === "get") return window.sessionStorage.getItem(key);
      if (method === "set") window.sessionStorage.setItem(key, value);
      if (method === "del") window.sessionStorage.removeItem(key);
    } catch (e) { /* storage blocked: degrade silently */ }
    return null;
  }
  function readJSON(key) {
    try { return JSON.parse(ss("get", key) || "null"); } catch (e) { return null; }
  }
  function params() {
    try { return new URLSearchParams(window.location.search); }
    catch (e) { return { get: function () { return null; } }; }
  }
  function track(name, data) {
    data = data || {};
    data.page_path = data.page_path || window.location.pathname;
    try {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("event", name, data);
    } catch (e) { /* never break the page for analytics */ }
  }
  function isArabic() {
    var l = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    return l.indexOf("ar") === 0 || document.documentElement.getAttribute("dir") === "rtl";
  }
  function cleanPath(p) {
    p = (p || "/").replace(/\.html$/, "").replace(/\/index$/, "/");
    return p || "/";
  }
  function pageTitle() {
    var t = (document.title || "").split(" | ")[0].trim();
    return t || "Iraq Market Entry";
  }
  function slugFromPath(p) {
    var s = cleanPath(p).replace(/^\/+|\/+$/g, "").replace(/^ar\//, "");
    return s || "iraq-market-entry";
  }
  function humanize(slug) {
    if (!slug) return "";
    var upper = { epc: "EPC", epcf: "EPCF", us: "US", uk: "UK", ar: "AR" };
    return String(slug).replace(/^\/+/, "").split(/[-_\/]+/).filter(Boolean).map(function (w) {
      var lw = w.toLowerCase();
      return upper[lw] || lw.charAt(0).toUpperCase() + lw.slice(1);
    }).join(" ");
  }
  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1).trim() + "…" : s; }
  function onReady(fn) {
    // deferred scripts run while readyState is "interactive", before DOMContentLoaded:
    // wait for it so privacy-consent.js has set up gtag first
    if (document.readyState !== "complete") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* ---------------- 1. attribution ---------------- */
  function captureAttribution() {
    var q = params();
    var attr = readJSON(ATTR_KEY);
    var hasUtm = UTM_KEYS.some(function (k) { return q.get(k); });
    if (!attr) {
      attr = {
        landing_page: window.location.pathname + window.location.search,
        initial_referrer: document.referrer || "(direct)"
      };
      UTM_KEYS.forEach(function (k) { attr[k] = q.get(k) || ""; });
      ss("set", ATTR_KEY, JSON.stringify(attr));
    } else if (hasUtm && !UTM_KEYS.some(function (k) { return attr[k]; })) {
      UTM_KEYS.forEach(function (k) { attr[k] = q.get(k) || ""; });
      ss("set", ATTR_KEY, JSON.stringify(attr));
    }
    return attr;
  }

  function rememberPage() {
    if (document.getElementById("men-consultation-form") || document.getElementById("ar-consultation-form")) return;
    if (document.body && document.body.hasAttribute("data-men-thank-you")) return;
    ss("set", LAST_PAGE_KEY, JSON.stringify({ path: cleanPath(window.location.pathname), title: pageTitle() }));
  }

  /* ---------------- 2. conversion bar ---------------- */
  var COPY = {
    en: {
      eyebrow: "Confidential Iraq advisory",
      lead: "Reading about ",
      tail: "? Turn it into a practical next step.",
      consult: "Request a Consultation",
      opp: "Discuss an Opportunity",
      label: "Iraq consultation options"
    },
    ar: {
      eyebrow: "استشارة سرية حول العراق",
      lead: "تقرأ عن ",
      tail: "؟ حوّلها إلى خطوة عملية.",
      consult: "اطلب استشارة",
      opp: "ناقش فرصة",
      label: "خيارات الاستشارة حول العراق"
    }
  };

  function consultationHref(type, arabic) {
    var base = arabic ? "/ar/consultation" : "/consultation";
    return base + "?type=" + type +
      "&interest=" + encodeURIComponent(slugFromPath(window.location.pathname)) +
      "&source=" + encodeURIComponent(cleanPath(window.location.pathname));
  }

  function shouldShowBar() {
    var b = document.body;
    if (!b) return false;
    if (b.hasAttribute("data-men-thank-you") || b.hasAttribute("data-men-no-leadbar")) return false;
    if (document.getElementById("men-consultation-form") || document.getElementById("ar-consultation-form")) return false;
    if (document.querySelector(".sticky-expert-cta")) return false; // page already has its own sticky CTA
    if (document.querySelector(".men-leadbar")) return false;
    return true;
  }

  function renderBar(bar) {
    var ar = isArabic();
    var c = ar ? COPY.ar : COPY.en;
    var topic = truncate(pageTitle(), 70);
    bar.setAttribute("dir", ar ? "rtl" : "ltr");
    bar.setAttribute("aria-label", c.label);
    bar.querySelector(".men-leadbar__eyebrow").textContent = c.eyebrow;
    var title = bar.querySelector(".men-leadbar__title");
    title.textContent = "";
    title.appendChild(document.createTextNode(c.lead));
    var ctx = document.createElement("span");
    ctx.className = "men-leadbar__context";
    ctx.textContent = topic;
    title.appendChild(ctx);
    title.appendChild(document.createTextNode(c.tail));
    var bc = bar.querySelector("[data-men-lead='consultation']");
    var bo = bar.querySelector("[data-men-lead='opportunity']");
    bc.textContent = c.consult; bc.href = consultationHref("consultation", ar);
    bo.textContent = c.opp; bo.href = consultationHref("opportunity", ar);
  }

  function buildBar() {
    if (!shouldShowBar()) return;
    var bar = document.createElement("aside");
    bar.className = "men-leadbar";
    bar.innerHTML =
      '<div class="men-leadbar__inner">' +
        '<div class="men-leadbar__copy">' +
          '<span class="men-leadbar__eyebrow"></span>' +
          '<p class="men-leadbar__title"></p>' +
        "</div>" +
        '<div class="men-leadbar__actions">' +
          '<a class="men-leadbar__button men-leadbar__button--primary" data-men-lead="consultation" href="/consultation"></a>' +
          '<a class="men-leadbar__button" data-men-lead="opportunity" href="/consultation?type=opportunity"></a>' +
        "</div>" +
      "</div>";
    var spacer = document.createElement("div");
    spacer.className = "men-leadbar-spacer";
    spacer.setAttribute("aria-hidden", "true");
    document.body.appendChild(spacer);
    document.body.appendChild(bar);
    document.body.classList.add("men-has-leadbar");

    // keep the cookie-settings button clear of the bar
    var st = document.createElement("style");
    st.textContent =
      ".men-has-leadbar .men-cookie-settings{bottom:calc(98px + env(safe-area-inset-bottom))}" +
      "@media (max-width:760px){.men-has-leadbar .men-cookie-settings{bottom:calc(120px + env(safe-area-inset-bottom))}}";
    document.head.appendChild(st);

    renderBar(bar);
    if (window.MutationObserver) {
      new MutationObserver(function () { renderBar(bar); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "dir"] });
    }
  }

  /* ---------------- 3. click tracking (bar + every consultation link) ---------------- */
  function bindClickTracking() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!/(^|\/)(ar\/)?consultation(\.html)?(\?|#|$)/.test(href)) return;
      var q;
      try { q = new URL(a.href, window.location.href).searchParams; } catch (err) { q = null; }
      var type = (q && q.get("type")) || "consultation";
      track(type === "opportunity" ? "opportunity_click" : "consultation_click", {
        interest: (q && q.get("interest")) || "",
        link_location: a.closest(".men-leadbar") ? "leadbar" : "inline",
        link_text: (a.textContent || "").trim().slice(0, 80)
      });
    }, true);
  }

  /* ---------------- 4. consultation form ---------------- */
  var BORDER_GOVS = {
    anbar: ["Al Anbar", ""], nineveh: ["Mosul / Nineveh", "الموصل / نينوى"], mosul: ["Mosul / Nineveh", "الموصل / نينوى"],
    duhok: ["Duhok", ""], erbil: ["Erbil", "أربيل"], sulaymaniyah: ["Sulaymaniyah", ""], halabja: ["Halabja", ""],
    diyala: ["Diyala", "ديالى"], wasit: ["Wasit", ""], maysan: ["Maysan", "ميسان"], basra: ["Basra", "البصرة"],
    muthanna: ["Al Muthanna", ""], najaf: ["Najaf", "النجف"]
  };
  var PAGE_GOVS = {
    baghdad: ["Baghdad", "بغداد"], babylon: ["Babylon", "بابل"], karbala: ["Karbala", "كربلاء"],
    kirkuk: ["Kirkuk", "كركوك"], dhiqar: ["Dhi Qar", "ذي قار"], "dhi-qar": ["Dhi Qar", "ذي قار"],
    qadisiyyah: ["Al-Qadisiyyah", ""], "salah-al-din": ["Salah al-Din", ""]
  };
  var LOGISTICS = ["Logistics & Transport", "النقل والخدمات اللوجستية"];
  // [pattern, sectorEN, sectorAR, supportEN, supportAR]
  var INTEREST_RULES = [
    [/border-trade-corridors|border-route|cross-border|three-border/, LOGISTICS[0], LOGISTICS[1], "Cross-Border Route Assessment", "الخدمات اللوجستية والجمارك"],
    [/customs-logistics/, LOGISTICS[0], LOGISTICS[1], "Logistics & Customs", "الخدمات اللوجستية والجمارك"],
    [/logistics/, LOGISTICS[0], LOGISTICS[1], "", ""],
    [/tender/, "", "", "Tender & Project Support", "دعم مناقصة أو مشروع"],
    [/epc/, "", "", "EPC / EPCF Project Support", "دعم مناقصة أو مشروع"],
    [/partner-identification|due-diligence/, "", "", "Partner Identification & Due Diligence", "البحث عن شريك والتحقق منه"],
    [/company-registration|register/, "Company Registration", "", "Company Registration", "تسجيل شركة"],
    [/market-entry/, "", "", "Market Entry Strategy", "استراتيجية دخول السوق"],
    [/construction|housing|real-estate/, "Construction & Real Estate", "البناء والعقارات", "", ""],
    [/water|nasiriyah/, "Water & Wastewater", "المياه والصرف الصحي", "", ""],
    [/energy|oil|gas|diesel|mazut/, "Energy, Oil & Gas", "الطاقة والنفط والغاز", "", ""],
    [/healthcare|health/, "Healthcare", "الرعاية الصحية", "", ""],
    [/homepage-opportunity|opportunit/, "", "", "Project / Opportunity Assessment", "تقييم مشروع أو فرصة"]
  ];

  function selectByText(select, text) {
    if (!select || !text || select.value) return false;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].text.trim() === text) { select.selectedIndex = i; return true; }
    }
    return false;
  }
  function setHidden(form, name, value) {
    var el = form.querySelector('input[name="' + name + '"]');
    if (el && value != null) el.value = value;
  }

  function preselect(form, interest, arabic) {
    var idx = arabic ? 1 : 0;
    var sector = form.querySelector('[name="sector"]');
    var gov = form.querySelector('[name="target_governorate"]');
    var support = form.querySelector('[name="support_required"]');
    var key = (interest || "").toLowerCase();

    Object.keys(BORDER_GOVS).some(function (g) {
      if (key.indexOf(g + "-") === 0 || key === "province-" + g) {
        selectByText(gov, BORDER_GOVS[g][idx]);
        if (/trade|route|corridor|border|logistics|opportunity/.test(key)) {
          selectByText(sector, LOGISTICS[idx]);
          selectByText(support, arabic ? "الخدمات اللوجستية والجمارك" : "Cross-Border Route Assessment");
        }
        return true;
      }
      return false;
    });
    Object.keys(PAGE_GOVS).some(function (g) {
      if (key === "province-" + g || key.indexOf(g + "-") === 0) { selectByText(gov, PAGE_GOVS[g][idx]); return true; }
      return false;
    });
    for (var i = 0; i < INTEREST_RULES.length; i++) {
      var r = INTEREST_RULES[i];
      if (r[0].test(key)) {
        selectByText(sector, arabic ? r[2] : r[1]);
        selectByText(support, arabic ? r[4] : r[3]);
        if ((sector && sector.value) && (support && support.value)) break;
      }
    }
  }

  var FORM_COPY = {
    consultation: {
      heading: "Request a Consultation",
      intro: "Tell us where you are in your Iraq market journey and what practical support you need.",
      subject: "New qualified lead — Middle East Nexus"
    },
    opportunity: {
      heading: "Discuss an Opportunity",
      intro: "Share the project, investment or commercial opportunity you want to assess or develop in Iraq.",
      subject: "New opportunity enquiry — Middle East Nexus"
    }
  };

  function setType(form, type) {
    type = type === "opportunity" ? "opportunity" : "consultation";
    var copy = FORM_COPY[type];
    setHidden(form, "lead_type", type);
    setHidden(form, "_subject", copy.subject);
    var btns = document.querySelectorAll("[data-type-choice]");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute("data-type-choice") === type;
      btns[i].classList.toggle("is-active", on);
      btns[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
    var opp = document.querySelectorAll("[data-opportunity-field]");
    for (var j = 0; j < opp.length; j++) opp[j].hidden = type !== "opportunity";
    var h = document.querySelector("[data-consultation-heading]");
    var p = document.querySelector("[data-consultation-intro]");
    if (h) h.textContent = copy.heading;
    if (p) p.textContent = copy.intro;
  }

  function statusEl(form) {
    var el = form.querySelector("[data-form-status]");
    if (!el) {
      el = document.createElement("p");
      el.setAttribute("data-form-status", "");
      el.setAttribute("tabindex", "-1");
      el.setAttribute("role", "status");
      el.style.cssText = "margin:18px 0 0;padding:12px 14px;border:1px solid rgba(200,169,110,.3);border-radius:4px;font-size:.9rem;";
      el.hidden = true;
      form.appendChild(el);
    }
    return el;
  }
  function showStatus(form, msg, isError) {
    var el = statusEl(form);
    el.textContent = msg;
    el.hidden = false;
    el.classList.toggle("is-error", !!isError);
    if (isError) el.style.color = "#ffb4a8";
    else el.style.color = "";
    try { el.focus({ preventScroll: false }); } catch (e) { el.focus(); }
  }

  function initForm() {
    var form = document.getElementById("men-consultation-form") || document.getElementById("ar-consultation-form");
    if (!form) return;
    var arabic = form.id === "ar-consultation-form" || isArabic();
    var q = params();
    var attr = readJSON(ATTR_KEY) || {};
    var last = readJSON(LAST_PAGE_KEY) || {};
    var interest = q.get("interest") || "";
    var source = q.get("source") || "";
    var sourcePath = source && source.charAt(0) === "/" ? cleanPath(source) : "";
    if (!sourcePath && last.path) sourcePath = last.path;
    var sourceTitle = (last.path && (last.path === sourcePath || !source)) ? last.title : "";
    var contextLabel = sourceTitle || humanize(interest) || humanize(source) || (arabic ? "دخول السوق العراقي" : "Iraq Market Entry");

    setHidden(form, "auto_interest", interest);
    setHidden(form, "lead_source_path", sourcePath || source);
    setHidden(form, "lead_source_title", sourceTitle || humanize(source));
    setHidden(form, "landing_page", attr.landing_page || window.location.pathname + window.location.search);
    setHidden(form, "initial_referrer", attr.initial_referrer || document.referrer || "(direct)");
    UTM_KEYS.forEach(function (k) { setHidden(form, k, q.get(k) || attr[k] || ""); });

    var chip = document.querySelector("[data-source-context]");
    if (chip) chip.textContent = truncate(contextLabel, 80);

    if (form.id === "men-consultation-form") {
      setType(form, q.get("type"));
      var btns = document.querySelectorAll("[data-type-choice]");
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function () { setType(form, this.getAttribute("data-type-choice")); });
      }
    } else if (q.get("type") === "opportunity") {
      setHidden(form, "lead_type", "arabic_opportunity");
    }
    preselect(form, interest || slugFromPath(sourcePath), arabic);

    var loadedAt = Date.now();
    var started = false;
    form.addEventListener("focusin", function () {
      if (started) return;
      started = true;
      track("form_start", { form_id: form.id, lead_type: (form.querySelector('[name="lead_type"]') || {}).value || "", interest: interest });
    });

    var sending = false;
    form.addEventListener("submit", function (e) {
      var leadType = (form.querySelector('[name="lead_type"]') || {}).value || "";
      var meta = { form_id: form.id, lead_type: leadType, interest: interest };
      if (sending) { e.preventDefault(); return; }

      if (form.checkValidity && !form.checkValidity()) {
        e.preventDefault();
        if (form.reportValidity) form.reportValidity();
        track("form_error", Object.assign({ error_type: "validation" }, meta));
        return;
      }
      var gotcha = form.querySelector('[name="_gotcha"]');
      if (gotcha && gotcha.value) { e.preventDefault(); return; } // bot: drop silently
      if (Date.now() - loadedAt < MIN_FILL_MS) {
        e.preventDefault();
        showStatus(form, arabic ? "يرجى مراجعة البيانات ثم الإرسال مرة أخرى." : "Please review your details and submit again.", true);
        track("form_error", Object.assign({ error_type: "too_fast" }, meta));
        loadedAt = 0; // a genuine second attempt goes through
        return;
      }
      if (!window.fetch || !window.FormData) return; // native POST; Formspree redirects via _next

      e.preventDefault();
      sending = true;
      var btn = form.querySelector('[type="submit"]');
      var btnText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = arabic ? "جارٍ الإرسال…" : "Sending…"; }
      track("form_submit", meta);

      var nextInput = form.querySelector('[name="_next"]');
      var next = nextInput && nextInput.value ? nextInput.value : "/thank-you?status=success" + (arabic ? "&lang=ar" : "");

      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) {
            return res.json().catch(function () { return {}; }).then(function (data) {
              var msg = data && data.errors && data.errors.length ? data.errors.map(function (x) { return x.message; }).join(" ") : "";
              throw new Error(msg || ("HTTP " + res.status));
            });
          }
          ss("set", LEAD_TOKEN_KEY, JSON.stringify({ lead_type: leadType, interest: interest, form_id: form.id, t: Date.now() }));
          try { window.location.href = new URL(next, window.location.href).pathname + new URL(next, window.location.href).search; }
          catch (err) { window.location.href = next; }
        })
        .catch(function (err) {
          sending = false;
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
          track("form_error", Object.assign({ error_type: "submit", error_message: String(err && err.message || err).slice(0, 100) }, meta));
          showStatus(form, arabic
            ? "تعذّر إرسال الطلب. يرجى المحاولة مرة أخرى أو مراسلتنا على info@middleeastnexus.co.uk"
            : "Your enquiry could not be sent. Please try again or email info@middleeastnexus.co.uk", true);
        });
    });
  }

  /* ---------------- 5. thank-you page ---------------- */
  var THANKS_AR = {
    ".eyebrow": "تم استلام الطلب",
    "h1": "شكراً لك. طلبك الآن لدينا.",
    ".lead": "استلمنا طلبك التجاري السري، وسنراجع القطاع والموقع ومرحلة المشروع ونوع الدعم المطلوب قبل الرد.",
    ".company": "ميدل إيست نيكسوس · لندن · العراق"
  };
  function initThankYou() {
    if (!document.body || !document.body.hasAttribute("data-men-thank-you")) return;
    var q = params();
    if (q.get("lang") === "ar") {
      document.documentElement.setAttribute("lang", "ar");
      document.documentElement.setAttribute("dir", "rtl");
      Object.keys(THANKS_AR).forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) el.textContent = THANKS_AR[sel];
      });
      var next = document.querySelector(".next");
      if (next) next.innerHTML = '<strong>للأمور العاجلة:</strong> راسلنا على <a href="mailto:info@middleeastnexus.co.uk">info@middleeastnexus.co.uk</a> مع ذكر أي موعد نهائي أو مرجع في عنوان الرسالة.';
      var links = document.querySelectorAll(".actions a");
      if (links[0]) { links[0].textContent = "العودة إلى ميدل إيست نيكسوس"; links[0].href = "/ar/"; }
      if (links[1]) { links[1].textContent = "استكشف معلومات السوق العراقي"; links[1].href = "/blog?lang=ar"; }
      document.title = "شكراً لك | ميدل إيست نيكسوس";
    }
    var token = readJSON(LEAD_TOKEN_KEY);
    if (token && token.t && Date.now() - token.t < 30 * 60 * 1000) {
      ss("del", LEAD_TOKEN_KEY); // one lead per confirmed submission; reloads do not re-fire
      var fire = function () {
        setTimeout(function () {
          track("generate_lead", { lead_type: token.lead_type || "", interest: token.interest || "", form_id: token.form_id || "" });
        }, 0);
      };
      if (document.readyState === "complete") fire(); else window.addEventListener("load", fire);
    } else if (token) {
      ss("del", LEAD_TOKEN_KEY);
    }
  }

  /* ---------------- boot ---------------- */
  captureAttribution();
  bindClickTracking();
  onReady(function () {
    rememberPage();
    buildBar();
    initForm();
    initThankYou();
  });
})();
