window.certWatchContent = {
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
            ctaLabel: "Get exact pricing",
            ctaHref: window.certWatchFunnel.getPricingHref("starter"),
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
            ctaLabel: "Get exact pricing",
            ctaHref: window.certWatchFunnel.getPricingHref("portfolio"),
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
            ctaLabel: window.certWatchFunnel.getCallLabel(),
            ctaHref: window.certWatchFunnel.getCallHref(),
            ctaStyle: "light",
            highlight: false
        }
    ],
    pricingNote: "Final pricing depends on domain count and monitoring scope.",
    faqItems: [
        {
            question: "Is CertWatch self-service or managed?",
            answer: "CertWatch is a managed service. SecureOrbit operates the monitoring, reviews findings internally, and sends your team alerts, monthly reports, and recommended next steps."
        },
        {
            question: "Do clients get a dashboard?",
            answer: "No client dashboard is required. We run the console internally so your team gets the outcomes without needing another portal to learn or manage."
        },
        {
            question: "How often are reports sent?",
            answer: "Reports are sent monthly, with alerts delivered in between whenever certificate issues, discoveries, or coverage changes need attention."
        },
        {
            question: "What happens when a certificate is close to expiration?",
            answer: "We alert your team before the expiration window becomes urgent, include the issue in reporting, and provide recommendations on the renewal owner and next action."
        },
        {
            question: "Can you monitor multiple domains and discovered subdomains?",
            answer: "Yes. CertWatch can monitor multiple domains across your scope and surface newly discovered certificate activity, including relevant subdomains observed through certificate transparency data."
        }
    ],
    ctaLinks: {
        "hero-primary-cta": window.certWatchFunnel.getScanHref(),
        "hero-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
        "about-primary-cta": window.certWatchFunnel.getPricingHref(),
        "about-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
        "contact-primary-cta": window.certWatchFunnel.getPricingHref(),
        "contact-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
        "contact-tertiary-cta": window.certWatchFunnel.getCallHref(),
        "contact-schedule-link": window.certWatchFunnel.getCallHref(),
        "pricing-custom-cta": window.certWatchFunnel.getCallHref()
    },
    ctaText: {
        "contact-schedule-link": window.certWatchFunnel.getCallLabel(),
        "contact-tertiary-cta": window.certWatchFunnel.getCallLabel(),
        "pricing-custom-cta": window.certWatchFunnel.getCallLabel()
    }
};
