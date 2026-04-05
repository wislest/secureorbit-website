(function () {
    var config = {
        contactEmail: "contact@secureorbit.cloud",
        CERTWATCH_PRICING_FORM_URL: "",
        CERTWATCH_SCAN_FORM_URL: "",
        CERTWATCH_CALL_URL: "https://calendly.com/wislest/30min",
        CERTWATCH_SAMPLE_REPORT_URL: ""
    };

    function normalizePlan(plan) {
        return ["starter", "portfolio", "custom"].indexOf(plan) >= 0 ? plan : "custom";
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

    function buildExternalUrl(baseUrl, params) {
        var url = new URL(baseUrl, window.location.origin);
        Object.keys(params || {}).forEach(function (key) {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            }
        });
        return url.toString();
    }

    function encodeMailto(subject, lines) {
        return "mailto:" + encodeURIComponent(config.contactEmail) +
            "?subject=" + encodeURIComponent(subject) +
            "&body=" + encodeURIComponent(lines.join("\n"));
    }

    function buildPricingMailto(details) {
        var plan = normalizePlan(details.plan);
        var planLabel = {
            starter: "Starter Monitoring",
            portfolio: "Portfolio Monitoring",
            custom: "Managed Monitoring at Scale"
        }[plan];

        return encodeMailto(
            "Request Pricing - CertWatch - " + planLabel,
            [
                "Request Type: pricing",
                "Selected Plan: " + plan,
                "Full Name: " + (details.full_name || ""),
                "Work Email: " + (details.work_email || ""),
                "Company: " + (details.company || ""),
                "Domains to Review: " + (details.domains || ""),
                "Notes: " + (details.notes || ""),
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
                "Work Email: " + (details.work_email || ""),
                "Company: " + (details.company || ""),
                "Domains to Review: " + (details.domains_to_review || ""),
                "Notes: " + (details.notes || ""),
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
        getSampleReportHref: function () {
            return config.CERTWATCH_SAMPLE_REPORT_URL || "/#sample-report";
        },
        buildPricingMailto: buildPricingMailto,
        buildScanMailto: buildScanMailto,
        normalizePlan: normalizePlan
    };
})();
