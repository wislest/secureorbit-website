(function () {
    var runtime = window.CERTWATCH_RUNTIME_CONFIG || {};
    var config = {
        contactEmail: runtime.contactEmail || "contact@secureorbit.cloud",
        CERTWATCH_LEAD_FORM_ENDPOINT: runtime.CERTWATCH_LEAD_FORM_ENDPOINT || "https://formsubmit.co/contact@secureorbit.cloud",
        CERTWATCH_INTERNAL_CC_EMAIL: runtime.CERTWATCH_INTERNAL_CC_EMAIL || "",
        CERTWATCH_CALL_URL: runtime.CERTWATCH_CALL_URL || "https://calendly.com/wislest/30min",
        CERTWATCH_SAMPLE_REPORT_URL: runtime.CERTWATCH_SAMPLE_REPORT_URL || "",
        CERTWATCH_SUCCESS_PATH: runtime.CERTWATCH_SUCCESS_PATH || "/form-success.html",
        CERTWATCH_AUTORESPONSE_CONFIRMED: runtime.CERTWATCH_AUTORESPONSE_CONFIRMED === true,
        CERTWATCH_REPLY_HANDLING_CONFIRMED: runtime.CERTWATCH_REPLY_HANDLING_CONFIRMED === true
    };

    function normalizePlan(plan) {
        return ["starter", "portfolio", "custom"].indexOf(plan) >= 0 ? plan : "custom";
    }

    function getPlanLabel(plan) {
        return {
            starter: "Starter Monitoring",
            portfolio: "Portfolio Monitoring",
            custom: "Managed Monitoring at Scale"
        }[normalizePlan(plan)];
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

    function buildPricingMailto(details) {
        var plan = normalizePlan(details.plan);
        return encodeMailto(
            "Request Pricing - CertWatch - " + getPlanLabel(plan),
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
                "Please reply with the recommended monitoring scope and next steps."
            ]
        );
    }

    function buildScanMailto(details) {
        return encodeMailto(
            "Free Certificate Scan Request - CertWatch",
            [
                "Request Type: free_scan",
                "Full Name: " + (details.full_name || ""),
                "Work Email: " + (details.email || details.work_email || ""),
                "Company: " + (details.company_name || details.company || ""),
                "Domains to Review: " + (details.domains_to_review || ""),
                "Approximate Number of Domains: " + (details.domain_count || ""),
                "Main Concern or Objective: " + (details.main_objective || details.notes || ""),
                "",
                "Please review these domains and follow up with the next step."
            ]
        );
    }

    function buildCallMailto() {
        return encodeMailto(
            "Book a Call - CertWatch",
            [
                "I'd like to talk through CertWatch monitoring scope.",
                "",
                "Company:",
                "Domains / environments to discuss:",
                "Preferred timing:"
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

    function buildAutoresponseMessage(requestType) {
        if (requestType === "free_scan") {
            return "Thanks for contacting SecureOrbit about a CertWatch free certificate scan. We received your request and will reply shortly with the next step. If you need to add context, email contact@secureorbit.cloud.";
        }
        return "Thanks for contacting SecureOrbit about CertWatch managed certificate monitoring. We received your pricing request and will reply shortly with the recommended monitoring scope and next step. If you need to add context, email contact@secureorbit.cloud.";
    }

    function buildInternalSubject(requestType, details) {
        var company = details.company_name || details.company || "Unknown Company";
        if (requestType === "free_scan") {
            return "CertWatch Free Scan Request - " + company;
        }
        return "CertWatch Pricing Request - " + company + " - " + getPlanLabel(details.plan || "custom");
    }

    function fillLeadForm(form, options) {
        var requestType = options.requestType;
        var details = options.details || {};
        var replyEmail = details.email || details.work_email || "";
        var internalSummary = [
            "Request type: " + requestType,
            "Full name: " + (details.full_name || ""),
            "Company: " + (details.company_name || details.company || ""),
            "Work email: " + replyEmail,
            "Domains to review: " + (details.domains_to_review || details.domains || ""),
            "Approximate number of domains: " + (details.domain_count || ""),
            "Main concern or objective: " + (details.main_objective || details.notes || "")
        ];

        if (requestType === "pricing") {
            internalSummary.splice(1, 0, "Selected plan: " + getPlanLabel(details.plan || "custom"));
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
        setValue("_autoresponse", buildAutoresponseMessage(requestType));
        setValue("_replyto", replyEmail);
        setValue("_cc", config.CERTWATCH_INTERNAL_CC_EMAIL);
        setValue("internal_summary", internalSummary.join("\n"));
        setValue("submission_source", window.location.href);
    }

    window.certWatchFunnelConfig = config;
    window.certWatchFunnel = {
        getCallLabel: function () {
            return config.CERTWATCH_CALL_URL ? "Book a call" : "Request a call";
        },
        getPricingHref: function (plan) {
            var normalizedPlan = plan ? normalizePlan(plan) : "";
            return buildUrl("/request.html", normalizedPlan ? { plan: normalizedPlan } : {});
        },
        getScanHref: function () {
            return buildUrl("/scan.html", { request_type: "free_scan" });
        },
        getCallHref: function () {
            return config.CERTWATCH_CALL_URL || buildCallMailto();
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
