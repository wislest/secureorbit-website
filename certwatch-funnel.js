(function () {
    var runtime = window.CERTWATCH_RUNTIME_CONFIG || {};
    var config = {
        contactEmail: runtime.contactEmail || "contact@secureorbit.cloud",
        CERTWATCH_LEAD_FORM_ENDPOINT: runtime.CERTWATCH_LEAD_FORM_ENDPOINT || "https://formsubmit.co/contact@secureorbit.cloud",
        CERTWATCH_INTERNAL_CC_EMAIL: runtime.CERTWATCH_INTERNAL_CC_EMAIL || "",
        CERTWATCH_CALL_URL: runtime.CERTWATCH_CALL_URL || "https://calendly.com/wislest/30min",
        CERTWATCH_STARTER_CHECKOUT_URL: runtime.CERTWATCH_STARTER_CHECKOUT_URL || "",
        CERTWATCH_PORTFOLIO_CHECKOUT_URL: runtime.CERTWATCH_PORTFOLIO_CHECKOUT_URL || "",
        CERTWATCH_SAMPLE_REPORT_URL: runtime.CERTWATCH_SAMPLE_REPORT_URL || "",
        CERTWATCH_SUCCESS_PATH: runtime.CERTWATCH_SUCCESS_PATH || "/form-success.html",
        CERTWATCH_AUTORESPONSE_CONFIRMED: runtime.CERTWATCH_AUTORESPONSE_CONFIRMED === true,
        CERTWATCH_REPLY_HANDLING_CONFIRMED: runtime.CERTWATCH_REPLY_HANDLING_CONFIRMED === true
    };

    // --- i18n bridge ---------------------------------------------------------
    // Uses window.SO_I18N when present (browser); degrades to the English
    // fallback when absent (e.g. the node test harness) so the funnel keeps
    // working standalone.
    function currentLang(lang) {
        if (lang) return lang;
        return (window.SO_I18N && window.SO_I18N.getLang && window.SO_I18N.getLang()) || "fr";
    }
    function tr(key, lang, fallback) {
        if (window.SO_I18N && window.SO_I18N.t) return window.SO_I18N.t(key, currentLang(lang));
        return fallback;
    }
    function tf(key, params, lang, fallback) {
        if (window.SO_I18N && window.SO_I18N.tf) return window.SO_I18N.tf(key, params, currentLang(lang));
        return fallback;
    }

    function normalizePlan(plan) {
        return ["starter", "portfolio", "custom"].indexOf(plan) >= 0 ? plan : "custom";
    }

    function getPlanLabel(plan, lang) {
        var key = { starter: "plan.starter", portfolio: "plan.portfolio", custom: "plan.custom" }[normalizePlan(plan)];
        var fallback = { starter: "Starter Monitoring", portfolio: "Portfolio Monitoring", custom: "Managed Monitoring at Scale" }[normalizePlan(plan)];
        return tr(key, lang, fallback);
    }

    function checkoutUrlForPlan(plan) {
        return {
            starter: config.CERTWATCH_STARTER_CHECKOUT_URL,
            portfolio: config.CERTWATCH_PORTFOLIO_CHECKOUT_URL
        }[normalizePlan(plan)] || "";
    }

    function planPriceLabel(plan, lang) {
        var p = normalizePlan(plan);
        if (currentLang(lang) === "fr") {
            return { starter: "99 $/mois", portfolio: "249 $/mois" }[p] || "";
        }
        return { starter: "$99/month", portfolio: "$249/month" }[p] || "";
    }

    function buildUrl(path, params) {
        var url = new URL(path, window.location.origin);
        Object.keys(params || {}).forEach(function (key) {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            }
        });
        return url.pathname + url.search;
    }

    function encodeMailto(subject, lines) {
        return "mailto:" + encodeURIComponent(config.contactEmail) +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(lines.join("\n"));
    }

    function buildPricingMailto(details, lang) {
        var plan = normalizePlan(details.plan);
        return encodeMailto(
            tf("mail.pricing.subject", { plan: getPlanLabel(plan, lang) }, lang, "Request Pricing - CertWatch - " + getPlanLabel(plan, lang)),
            [
                "Request Type: pricing",
                "Selected Plan: " + plan,
                "Full Name: " + (details.full_name || ""),
                "Work Email: " + (details.email || details.work_email || ""),
                "Company: " + (details.company_name || details.company || ""),
                "Domains to Review: " + (details.domains_to_review || details.domains || ""),
                "Approximate Number of Domains: " + (details.domain_count || ""),
                "Main Concern or Objective: " + (details.main_objective || details.notes || ""),
                "",
                tr("mail.pricing.closing", lang, "Please reply with the recommended monitoring scope and next steps.")
            ]
        );
    }

    function buildScanMailto(details, lang) {
        return encodeMailto(
            tr("mail.scan.subject", lang, "Free Certificate Scan Request - CertWatch"),
            [
                "Request Type: free_scan",
                "Full Name: " + (details.full_name || ""),
                "Work Email: " + (details.email || details.work_email || ""),
                "Company: " + (details.company_name || details.company || ""),
                "Domains to Review: " + (details.domains_to_review || ""),
                "Approximate Number of Domains: " + (details.domain_count || ""),
                "Main Concern or Objective: " + (details.main_objective || details.notes || ""),
                "",
                tr("mail.scan.closing", lang, "Please review these domains and follow up with the next step.")
            ]
        );
    }

    function buildCallMailto(lang) {
        return encodeMailto(
            tr("mail.call.subject", lang, "Book a Call - CertWatch"),
            [
                tr("mail.call.l1", lang, "I'd like to talk through CertWatch monitoring scope."),
                "",
                tr("mail.call.company", lang, "Company:"),
                tr("mail.call.domains", lang, "Domains / environments to discuss:"),
                tr("mail.call.timing", lang, "Preferred timing:")
            ]
        );
    }

    function buildThankYouHref(requestType) {
        var url = new URL(config.CERTWATCH_SUCCESS_PATH, window.location.origin);
        if (requestType) {
            url.searchParams.set("type", requestType);
        }
        return url.toString();
    }

    function isExpectedSuccessUrl(href) {
        if (!href) {
            return false;
        }

        try {
            var url = new URL(href, window.location.origin);
            return url.origin === window.location.origin && url.pathname === config.CERTWATCH_SUCCESS_PATH;
        } catch (error) {
            return false;
        }
    }

    function didIframeReachSuccessUrl(frame) {
        try {
            return !!frame && !!frame.contentWindow && isExpectedSuccessUrl(frame.contentWindow.location.href);
        } catch (error) {
            return false;
        }
    }

    function getLeadFlowCapabilities() {
        return {
            endpointConfigured: !!config.CERTWATCH_LEAD_FORM_ENDPOINT,
            autoresponsePrepared: true,
            autoresponseConfirmed: config.CERTWATCH_AUTORESPONSE_CONFIRMED,
            replyHandlingPrepared: true,
            replyHandlingConfirmed: config.CERTWATCH_REPLY_HANDLING_CONFIRMED,
            successRedirectPath: config.CERTWATCH_SUCCESS_PATH
        };
    }

    function buildAutoresponseMessage(requestType, lang) {
        if (requestType === "free_scan") {
            return tr("autoresponse.free_scan", lang, "Thanks for contacting SecureOrbit about a CertWatch free certificate scan. We received your request and will reply shortly with the next step. If you need to add context, email contact@secureorbit.cloud.");
        }
        return tr("autoresponse.pricing", lang, "Thanks for contacting SecureOrbit about CertWatch managed certificate monitoring. We received your pricing request and will reply shortly with the recommended monitoring scope and next step. If you need to add context, email contact@secureorbit.cloud.");
    }

    function buildInternalSubject(requestType, details) {
        // Operator-facing (you). Kept in English for a consistent inbox.
        var company = details.company_name || details.company || "Unknown Company";
        if (requestType === "free_scan") {
            return "CertWatch Free Scan Request - " + company;
        }
        return "CertWatch Pricing Request - " + company + " - " + getPlanLabel(details.plan || "custom", "en");
    }

    function fillLeadForm(form, options) {
        var requestType = options.requestType;
        var details = options.details || {};
        var lang = currentLang(options.lang);
        var replyEmail = details.email || details.work_email || "";
        var internalSummary = [
            "Request type: " + requestType,
            "Visitor language: " + lang,
            "Full name: " + (details.full_name || ""),
            "Company: " + (details.company_name || details.company || ""),
            "Work email: " + replyEmail,
            "Domains to review: " + (details.domains_to_review || details.domains || ""),
            "Approximate number of domains: " + (details.domain_count || ""),
            "Main concern or objective: " + (details.main_objective || details.notes || "")
        ];

        if (requestType === "pricing") {
            internalSummary.splice(2, 0, "Selected plan: " + getPlanLabel(details.plan || "custom", "en"));
        }

        function setValue(name, value) {
            var field = form.querySelector('[name="' + name + '"]');
            if (field) {
                field.value = value || "";
            }
        }

        form.action = config.CERTWATCH_LEAD_FORM_ENDPOINT || "";
        form.method = "POST";

        setValue("_subject", buildInternalSubject(requestType, details));
        setValue("_next", buildThankYouHref(requestType));
        setValue("_autoresponse", buildAutoresponseMessage(requestType, lang));
        setValue("_replyto", replyEmail);
        setValue("_cc", config.CERTWATCH_INTERNAL_CC_EMAIL);
        setValue("internal_summary", internalSummary.join("\n"));
        setValue("submission_source", window.location.href);
    }

    window.certWatchFunnelConfig = config;
    window.certWatchFunnel = {
        getCallLabel: function (lang) {
            return config.CERTWATCH_CALL_URL
                ? tr("cta.bookCall", lang, "Book a call")
                : tr("cta.requestCall", lang, "Request a call");
        },
        getPricingHref: function (plan) {
            var normalizedPlan = plan ? normalizePlan(plan) : "";
            return buildUrl("/request.html", normalizedPlan ? { plan: normalizedPlan } : {});
        },
        getScanHref: function () {
            return buildUrl("/scan.html", { request_type: "free_scan" });
        },
        getCallHref: function (lang) {
            return config.CERTWATCH_CALL_URL || buildCallMailto(lang);
        },
        // Direct Stripe Checkout (Payment Link) for a fixed-price plan when configured;
        // otherwise fall back to the managed pricing-request form (no regression).
        getCheckoutHref: function (plan) {
            var normalizedPlan = normalizePlan(plan);
            return checkoutUrlForPlan(normalizedPlan) || buildUrl("/request.html", { plan: normalizedPlan });
        },
        getCtaLabel: function (plan, lang) {
            var normalizedPlan = normalizePlan(plan);
            var checkoutUrl = checkoutUrlForPlan(normalizedPlan);
            var priceLabel = planPriceLabel(normalizedPlan, lang);
            if (checkoutUrl && priceLabel) {
                return tf("cta.subscribe", { price: priceLabel }, lang, "Subscribe — " + priceLabel);
            }
            return tr("cta.getPricing", lang, "Get exact pricing");
        },
        // Backward-compatible Starter shortcuts (delegate to the generalized helpers).
        getStarterCheckoutHref: function () {
            return this.getCheckoutHref("starter");
        },
        getStarterCtaLabel: function (lang) {
            return this.getCtaLabel("starter", lang);
        },
        getLeadFormEndpoint: function () {
            return config.CERTWATCH_LEAD_FORM_ENDPOINT;
        },
        getLeadFlowCapabilities: getLeadFlowCapabilities,
        getSampleReportHref: function () {
            return config.CERTWATCH_SAMPLE_REPORT_URL || "/#sample-report";
        },
        getPlanLabel: getPlanLabel,
        buildThankYouHref: buildThankYouHref,
        isExpectedSuccessUrl: isExpectedSuccessUrl,
        didIframeReachSuccessUrl: didIframeReachSuccessUrl,
        buildAutoresponseMessage: buildAutoresponseMessage,
        buildInternalSubject: buildInternalSubject,
        fillLeadForm: fillLeadForm,
        buildPricingMailto: buildPricingMailto,
        buildScanMailto: buildScanMailto,
        normalizePlan: normalizePlan
    };
})();
