(function () {
  "use strict";

  var GA_ID = "G-6Y3N9GSJM4";
  var FORM_ENDPOINT = "https://formspree.io/f/xlgaogjo";
  var ATTRIBUTION_KEY = "men_lead_attribution";
  var PENDING_LEAD_KEY = "men_pending_lead";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var COMMERCIAL_SERVICES = {
    "iraq-market-entry-consulting": "Iraq Market Entry Consulting",
    "iraq-partner-identification-due-diligence": "Iraq Partner Identification & Due Diligence",
    "iraq-tender-project-support": "Iraq Tender & Project Support",
    "iraq-epc-epcf-project-support": "Iraq EPC & EPCF Project Support",
    "iraq-customs-logistics-support": "Iraq Customs & Logistics Support"
  };

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
      "iraq-business-encyclopedia": "Iraq Business Encyclopedia",
      "research-methodology": "Iraq intelligence research standards",
      "uk-iraq-trade": "UK–Iraq trade",
      "company-registration-iraq": "Company registration in Iraq",
      "gasoil-diesel-mazut-trading": "Iraq fuel trading",
      "project-nasiriyah-water-plant": "Nasiriyah water infrastructure",
      "iraq-market-entry-consulting": "Iraq market entry",
      "iraq-partner-identification-due-diligence": "Iraqi partner selection",
      "iraq-tender-project-support": "Iraq tender and project support",
      "iraq-epc-epcf-project-support": "Iraq EPC and EPCF projects",
      "iraq-customs-logistics-support": "Iraq customs and logistics"
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
    if (/logistics|transport|faw|\bports?\b|border|corridor|route|-(iran|turkey|turkiye|syria|saudi|kuwait|jordan)-(trade|opportunity)/i.test(value)) return "Logistics & Transport";
    if (/health/i.test(value)) return "Healthcare";
    if (/registration/i.test(value)) return "Company Registration";
    return "";
  }

  function inferGovernorate(interest) {
    var value = String(interest || "").toLowerCase().replace(/^province-/, "");
    var map = {
      "anbar": "Al Anbar", "babylon": "Babylon", "baghdad": "Baghdad", "basra": "Basra",
      "dhiqar": "Dhi Qar", "diyala": "Diyala", "duhok": "Duhok", "erbil": "Erbil",
      "halabja": "Halabja", "karbala": "Karbala", "kirkuk": "Kirkuk", "maysan": "Maysan",
      "mosul": "Mosul / Nineveh", "nineveh": "Mosul / Nineveh", "muthanna": "Al Muthanna", "najaf": "Najaf",
      "qadisiyyah": "Al-Qadisiyyah", "salahaldin": "Salah al-Din",
      "sulaymaniyah": "Sulaymaniyah", "wasit": "Wasit"
    };
    var slug = Object.keys(map).find(function (key) {
      return value === key || value.indexOf(key + "-") === 0;
    });
    return slug ? map[slug] : "";
  }

  function inferSupport(interest) {
    var value = String(interest || "");
    if (/iraq-business-encyclopedia|research-methodology/i.test(value)) {
      return "Market Entry Strategy";
    }
    if (/partner-verification|partner-identification|due-diligence/i.test(value)) {
      return "Partner Identification & Due Diligence";
    }
    if (/tender-identification|tender(?:-project)?-support/i.test(value)) {
      return "Tender & Project Support";
    }
    if (/epc-epcf|epcf-project|epc-project/i.test(value)) {
      return "EPC / EPCF Project Support";
    }
    if (/customs-logistics-support/i.test(value)) {
      return "Logistics & Customs";
    }
    if (/project-intelligence|commercial-opportunity|construction-mandate|opportunity-assessment/i.test(value)) {
      return "Project / Opportunity Assessment";
    }
    if (/stakeholder-engagement|government-relations|negotiation/i.test(value)) {
      return "Stakeholder Engagement & Negotiation";
    }
    if (/logistics|border|corridor|route|-(iran|turkey|turkiye|syria|saudi|kuwait|jordan)-(trade|opportunity)/i.test(value)) {
      return "Cross-Border Route Assessment";
    }
    if (/market-entry|market-intelligence|governorates-investment|executive-market-report/i.test(value)) {
      return "Market Entry Strategy";
    }
    return "";
  }

  function initCommercialServiceTracking() {
    var context = pageContext();
    if (COMMERCIAL_SERVICES[context.slug]) {
      track("service_view", {
        service_name: COMMERCIAL_SERVICES[context.slug],
        service_slug: context.slug,
        page_type: "commercial_service"
      });
    }

    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (!link) return;
      var url;
      try { url = new URL(link.href, window.location.href); } catch (error) { return; }
      if (url.origin !== window.location.origin) return;
      var serviceSlug = cleanSlug(url.pathname);
      if (!COMMERCIAL_SERVICES[serviceSlug]) return;
      track("service_click", {
        service_name: COMMERCIAL_SERVICES[serviceSlug],
        service_slug: serviceSlug,
        lead_source_path: canonicalPath(),
        link_url: url.href
      });
    }, true);
  }

  function initConsultationLinkTracking() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest('a[href*="consultation"]') : null;
      if (!link || link.hasAttribute("data-men-lead-type")) return;
      var url;
      try { url = new URL(link.href, window.location.href); } catch (error) { return; }
      if (url.pathname.replace(/\.html$/i, "").replace(/\/$/, "") !== "/consultation") return;
      var type = url.searchParams.get("type") === "opportunity" ? "opportunity" : "consultation";
      track(type === "opportunity" ? "opportunity_click" : "consultation_click", {
        lead_type: type,
        interest: url.searchParams.get("interest") || pageContext().slug,
        lead_source_path: canonicalPath(),
        link_url: url.href
      });
    }, true);
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

  function isFormspreeForm(form) {
    return Boolean(form && form.action && form.action.indexOf("formspree.io") !== -1);
  }

  function showSpamProtectionStatus(form, message) {
    var status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.add("is-error");
    status.hidden = false;
    status.focus();
  }

  function initFormSpamProtection() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('form[action*="formspree.io"]'));
    if (!forms.length) return;

    forms.forEach(function (form) {
      form.dataset.menLoadedAt = String(Date.now());
    });

    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!isFormspreeForm(form)) return;

      var elapsed = Date.now() - Number(form.dataset.menLoadedAt || Date.now());
      var trap = form.querySelector('[name="_gotcha"]');
      var messageField = form.querySelector('[name="message"]');
      var message = messageField ? String(messageField.value || "") : "";
      var shortenedUrl = /(?:https?:\/\/)?(?:bit\.ly|is\.gd|tinyurl\.com|t\.co|rb\.gy|cutt\.ly|shorturl\.at|tiny\.one|rebrand\.ly)\//i;
      var blocked = Boolean(trap && trap.value.trim()) || elapsed < 3000 || shortenedUrl.test(message);

      if (blocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showSpamProtectionStatus(
          form,
          shortenedUrl.test(message)
            ? "For security, please replace shortened links with the full website address."
            : "Please wait a moment, review the form and submit it again."
        );
        return;
      }

      var timingField = form.querySelector('[name="form_elapsed_seconds"]');
      if (!timingField) {
        timingField = document.createElement("input");
        timingField.type = "hidden";
        timingField.name = "form_elapsed_seconds";
        form.appendChild(timingField);
      }
      timingField.value = String(Math.max(3, Math.round(elapsed / 1000)));
    }, true);
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
    var support = inferSupport(interest);
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
    if (support) {
      var supportSelect = form.querySelector('[name="support_required"]');
      if (supportSelect) supportSelect.value = support;
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
    initFormSpamProtection();
    initConsultationLinkTracking();
    initCommercialServiceTracking();
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
