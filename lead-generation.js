(function () {
  "use strict";

  var GA_ID = "G-6Y3N9GSJM4";
  var FORM_ENDPOINT = "https://formspree.io/f/xlgaogjo";
  var ATTRIBUTION_KEY = "men_lead_attribution";
  var PENDING_LEAD_KEY = "men_pending_lead";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  function track(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params || {});
    }
  }

  function safeSessionGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (error) { return null; }
  }

  function safeSessionSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (error) { /* Storage is optional. */ }
  }

  function safeSessionRemove(key) {
    try { window.sessionStorage.removeItem(key); } catch (error) { /* Storage is optional. */ }
  }

  function readStoredJson(key) {
    var value = safeSessionGet(key);
    if (!value) return {};
    try { return JSON.parse(value) || {}; } catch (error) { return {}; }
  }

  function canonicalPath() {
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) {
      try { return new URL(canonical.href).pathname; } catch (error) { /* Use current path. */ }
    }
    return window.location.pathname;
  }

  function cleanSlug(pathname) {
    var path = (pathname || "/").replace(/^\/+|\/+$/g, "").replace(/\.html$/i, "");
    return path || "iraq-market-entry";
  }

  function titleCase(value) {
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function pageContext() {
    var slug = cleanSlug(canonicalPath());
    var label = "Iraq market entry";
    var provinceMap = {
      "anbar": "Al Anbar", "babylon": "Babylon", "baghdad": "Baghdad", "basra": "Basra",
      "dhiqar": "Dhi Qar", "diyala": "Diyala", "duhok": "Duhok", "erbil": "Erbil",
      "halabja": "Halabja", "karbala": "Karbala", "kirkuk": "Kirkuk", "maysan": "Maysan",
      "mosul": "Mosul / Nineveh", "muthanna": "Al Muthanna", "najaf": "Najaf",
      "qadisiyyah": "Al-Qadisiyyah", "salahaldin": "Salah al-Din",
      "sulaymaniyah": "Sulaymaniyah", "wasit": "Wasit"
    };
    var sectorMap = {
      "iraq-construction-sector": "Iraq construction & housing",
      "iraq-water-sector": "Iraq water & wastewater",
      "iraq-energy-sector": "Iraq energy",
      "iraq-logistics-sector": "Iraq logistics & transport",
      "iraq-healthcare-sector": "Iraq healthcare",
      "iraq-sectors": "Iraq business sectors",
      "uk-iraq-trade": "UK–Iraq trade",
      "company-registration-iraq": "Company registration in Iraq",
      "gasoil-diesel-mazut-trading": "Iraq fuel trading",
      "project-nasiriyah-water-plant": "Nasiriyah water infrastructure"
    };

    if (slug.indexOf("province-") === 0) {
      var provinceSlug = slug.replace("province-", "");
      label = (provinceMap[provinceSlug] || titleCase(provinceSlug)) + " opportunities";
    } else if (sectorMap[slug]) {
      label = sectorMap[slug];
    } else if (slug.indexOf("from-tehran-to-baghdad") === 0) {
      label = "Iraq business experience";
    } else if (slug.indexOf("blog-") === 0 || slug.indexOf("category-") === 0 || slug === "blog") {
      label = "this Iraq market insight";
    }

    return {
      slug: slug,
      label: label,
      path: canonicalPath(),
      title: document.title || label
    };
  }

  function captureAttribution() {
    var params = new URLSearchParams(window.location.search);
    var stored = readStoredJson(ATTRIBUTION_KEY);
    var hasUtm = UTM_KEYS.some(function (key) { return params.has(key); });

    if (!stored.landing_page || hasUtm) {
      stored.landing_page = stored.landing_page || window.location.pathname;
      stored.initial_referrer = stored.initial_referrer || document.referrer || "direct";
      UTM_KEYS.forEach(function (key) {
        if (!stored[key] && params.get(key)) stored[key] = params.get(key);
      });
      safeSessionSet(ATTRIBUTION_KEY, JSON.stringify(stored));
    }
    return stored;
  }

  function buildConsultationUrl(type, context, attribution) {
    var params = new URLSearchParams();
    params.set("type", type);
    params.set("interest", context.slug);
    params.set("source", context.path);
    UTM_KEYS.forEach(function (key) {
      if (attribution[key]) params.set(key, attribution[key]);
    });
    return "/consultation?" + params.toString();
  }

  function localizedText(en, ar) {
    return document.documentElement.dir === "rtl" || document.documentElement.lang === "ar" ? ar : en;
  }

  function initLeadBar() {
    var slug = cleanSlug(canonicalPath());
    if (slug === "consultation" || slug === "thank-you" || document.querySelector(".men-leadbar")) return;

    var context = pageContext();
    var attribution = captureAttribution();
    var consultationUrl = buildConsultationUrl("consultation", context, attribution);
    var opportunityUrl = buildConsultationUrl("opportunity", context, attribution);
    var bar = document.createElement("aside");
    var spacer = document.createElement("div");

    bar.className = "men-leadbar";
    bar.setAttribute("aria-label", "Business enquiry");
    bar.innerHTML =
      '<div class="men-leadbar__inner">' +
        '<div class="men-leadbar__copy">' +
          '<span class="men-leadbar__eyebrow" data-en="Turn intelligence into action" data-ar="حوّل المعلومات إلى خطوات عملية">Turn intelligence into action</span>' +
          '<span class="men-leadbar__title"><span data-en="Planning your next move in " data-ar="هل تخطط لخطوتك التالية في ">Planning your next move in </span><span class="men-leadbar__context">' + context.label + '</span>?</span>' +
        '</div>' +
        '<div class="men-leadbar__actions">' +
          '<a class="men-leadbar__button men-leadbar__button--primary" data-men-lead-type="consultation" data-en="Request a Consultation" data-ar="اطلب استشارة" href="' + consultationUrl + '">Request a Consultation</a>' +
          '<a class="men-leadbar__button" data-men-lead-type="opportunity" data-en="Discuss an Opportunity" data-ar="ناقش فرصة" href="' + opportunityUrl + '">Discuss an Opportunity</a>' +
        '</div>' +
      '</div>';

    spacer.className = "men-leadbar-spacer";
    spacer.setAttribute("aria-hidden", "true");
    document.body.appendChild(spacer);
    document.body.appendChild(bar);

    bar.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("[data-men-lead-type]") : null;
      if (!link) return;
      var type = link.getAttribute("data-men-lead-type");
      track(type === "opportunity" ? "opportunity_click" : "consultation_click", {
        lead_type: type,
        interest: context.slug,
        lead_source_path: context.path,
        link_url: link.href
      });
    });

    if (document.documentElement.dir === "rtl" || new URLSearchParams(window.location.search).get("lang") === "ar") {
      bar.querySelectorAll("[data-ar]").forEach(function (element) {
        element.textContent = element.getAttribute("data-ar");
      });
    }
  }

  function inferSector(interest) {
    var value = String(interest || "");
    if (/energy|fuel|gasoil|diesel|mazut/i.test(value)) return "Energy, Oil & Gas";
    if (/construction|housing|real-estate|hotel/i.test(value)) return "Construction & Real Estate";
    if (/water|nasiriyah/i.test(value)) return "Water & Wastewater";
    if (/logistics|transport|faw|port/i.test(value)) return "Logistics & Transport";
    if (/health/i.test(value)) return "Healthcare";
    if (/registration/i.test(value)) return "Company Registration";
    return "";
  }

  function inferGovernorate(interest) {
    var match = String(interest || "").match(/^province-(.+)$/i);
    if (!match) return "";
    var map = {
      "anbar": "Al Anbar", "babylon": "Babylon", "baghdad": "Baghdad", "basra": "Basra",
      "dhiqar": "Dhi Qar", "diyala": "Diyala", "duhok": "Duhok", "erbil": "Erbil",
      "halabja": "Halabja", "karbala": "Karbala", "kirkuk": "Kirkuk", "maysan": "Maysan",
      "mosul": "Mosul / Nineveh", "muthanna": "Al Muthanna", "najaf": "Najaf",
      "qadisiyyah": "Al-Qadisiyyah", "salahaldin": "Salah al-Din",
      "sulaymaniyah": "Sulaymaniyah", "wasit": "Wasit"
    };
    return map[match[1].toLowerCase()] || "";
  }

  function interestLabel(interest) {
    var governorate = inferGovernorate(interest);
    if (governorate) return governorate + " Governorate";
    return titleCase(interest);
  }

  function setFormType(form, type) {
    var normalized = type === "opportunity" ? "opportunity" : "consultation";
    var typeInput = form.querySelector('[name="lead_type"]');
    var heading = document.querySelector("[data-consultation-heading]");
    var intro = document.querySelector("[data-consultation-intro]");
    var opportunityField = document.querySelector("[data-opportunity-field]");

    if (typeInput) typeInput.value = normalized;
    document.querySelectorAll("[data-type-choice]").forEach(function (button) {
      var active = button.getAttribute("data-type-choice") === normalized;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (heading) heading.textContent = normalized === "opportunity" ? "Discuss an Iraq Opportunity" : "Request a Consultation";
    if (intro) intro.textContent = normalized === "opportunity"
      ? "Share the project, investment or commercial opportunity you want to assess or advance in Iraq."
      : "Tell us where you are in your Iraq market journey and what practical support you need.";
    if (opportunityField) opportunityField.hidden = normalized !== "opportunity";
  }

  function populateHiddenFields(form, context, attribution, params) {
    var fields = {
      auto_interest: params.get("interest") || context.slug,
      lead_source_path: params.get("source") || document.referrer || "direct",
      lead_source_title: context.title,
      landing_page: attribution.landing_page || window.location.pathname,
      initial_referrer: attribution.initial_referrer || document.referrer || "direct"
    };
    UTM_KEYS.forEach(function (key) { fields[key] = params.get(key) || attribution[key] || ""; });
    Object.keys(fields).forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (input) input.value = fields[name];
    });
  }

  function showFormStatus(message, isError) {
    var status = document.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
    status.hidden = false;
    status.focus();
  }

  function initConsultationForm() {
    var form = document.querySelector("#men-consultation-form");
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var attribution = captureAttribution();
    var context = pageContext();
    var interest = params.get("interest") || "iraq-market-entry";
    var sourceLabel = document.querySelector("[data-source-context]");
    var sector = inferSector(interest);
    var governorate = inferGovernorate(interest);
    var started = false;

    setFormType(form, params.get("type"));
    populateHiddenFields(form, context, attribution, params);

    if (sourceLabel) sourceLabel.textContent = interestLabel(interest);
    if (sector) {
      var sectorSelect = form.querySelector('[name="sector"]');
      if (sectorSelect) sectorSelect.value = sector;
    }
    if (governorate) {
      var governorateSelect = form.querySelector('[name="target_governorate"]');
      if (governorateSelect) governorateSelect.value = governorate;
    }

    document.querySelectorAll("[data-type-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        setFormType(form, button.getAttribute("data-type-choice"));
      });
    });

    form.addEventListener("focusin", function () {
      if (started) return;
      started = true;
      track("form_start", {
        form_id: "consultation_form",
        lead_type: form.querySelector('[name="lead_type"]').value,
        interest: form.querySelector('[name="auto_interest"]').value,
        lead_source_path: form.querySelector('[name="lead_source_path"]').value
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var button = form.querySelector('[type="submit"]');
      var originalText = button.textContent;
      var data = new FormData(form);
      var leadContext = {
        lead_type: data.get("lead_type") || "consultation",
        interest: data.get("auto_interest") || "iraq-market-entry",
        lead_source_path: data.get("lead_source_path") || "direct",
        sector: data.get("sector") || "",
        utm_source: data.get("utm_source") || "",
        utm_medium: data.get("utm_medium") || "",
        utm_campaign: data.get("utm_campaign") || ""
      };

      button.disabled = true;
      button.textContent = "Sending…";

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      }).then(function (response) {
        if (!response.ok) throw new Error("Submission failed");
        track("form_submit", Object.assign({ form_id: "consultation_form" }, leadContext));
        safeSessionSet(PENDING_LEAD_KEY, JSON.stringify(leadContext));
        window.location.assign("/thank-you?status=success");
      }).catch(function () {
        button.disabled = false;
        button.textContent = originalText;
        track("form_error", Object.assign({ form_id: "consultation_form" }, leadContext));
        showFormStatus("We could not send the form. Please try again or email info@middleeastnexus.co.uk.", true);
      });
    });
  }

  function initThankYou() {
    if (!document.body || !document.body.hasAttribute("data-men-thank-you")) return;
    var pending = readStoredJson(PENDING_LEAD_KEY);
    if (!pending.lead_type) return;

    var eventData = {
      lead_type: pending.lead_type || "consultation",
      interest: pending.interest || "unknown",
      lead_source_path: pending.lead_source_path || "unknown",
      sector: pending.sector || "",
      utm_source: pending.utm_source || "",
      utm_medium: pending.utm_medium || "",
      utm_campaign: pending.utm_campaign || "",
      currency: "GBP",
      value: 0
    };
    track("generate_lead", eventData);
    safeSessionRemove(PENDING_LEAD_KEY);
  }

  function init() {
    captureAttribution();
    initLeadBar();
    initConsultationForm();
    initThankYou();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
