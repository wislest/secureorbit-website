window.certWatchContent = {
    // NOTE: visible pricing/FAQ copy lives directly in index.html (bilingual via
    // data-en). This file only supplies CTA hrefs (language-independent) and the
    // data arrays kept for reference. Dynamic CTA *labels* (Subscribe vs Get exact
    // pricing) are recomputed live in index.html on load and on language change.
    pricingTiers: [
        {
            eyebrow: "Tier 1",
            eyebrowClass: "text-blue-300",
            name: "Starter Monitoring",
            price: "Starting at $99/month",
            features: [
                "Up to 10 domains",
                "Continuous monitoring",
                "Alerts",
                "Monthly report"
            ],
            ctaHref: window.certWatchFunnel.getCheckoutHref("starter"),
            ctaStyle: "primary",
            highlight: false
        },
        {
            eyebrow: "Tier 2",
            eyebrowClass: "text-purple-300",
            name: "Portfolio Monitoring",
            price: "Starting at $249/month",
            features: [
                "Up to 50 domains",
                "Everything in Starter",
                "CT-based discovery",
                "Priority alerts"
            ],
            ctaHref: window.certWatchFunnel.getCheckoutHref("portfolio"),
            ctaStyle: "primary",
            highlight: true
        },
        {
            eyebrow: "Tier 3",
            eyebrowClass: "text-yellow-300",
            name: "Managed Monitoring at Scale",
            price: "Custom",
            features: [
                "Unlimited domains",
                "Full coverage",
                "Custom reporting",
                "Direct support"
            ],
            ctaHref: window.certWatchFunnel.getCallHref(),
            ctaStyle: "light",
            highlight: false
        }
    ],
    // CTA hrefs are language-independent; applied once on load.
    ctaLinks: {
        "pricing-starter-cta": window.certWatchFunnel.getCheckoutHref("starter"),
        "pricing-portfolio-cta": window.certWatchFunnel.getCheckoutHref("portfolio"),
        "hero-primary-cta": window.certWatchFunnel.getScanHref(),
        "hero-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
        "about-primary-cta": window.certWatchFunnel.getPricingHref(),
        "about-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
        "contact-primary-cta": window.certWatchFunnel.getPricingHref(),
        "contact-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
        "contact-tertiary-cta": window.certWatchFunnel.getCallHref(),
        "contact-schedule-link": window.certWatchFunnel.getCallHref(),
        "pricing-custom-cta": window.certWatchFunnel.getCallHref(),
        "easm-call-cta": window.certWatchFunnel.getCallHref()
    }
};
