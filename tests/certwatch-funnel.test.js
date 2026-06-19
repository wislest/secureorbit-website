const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Load i18n.js + certwatch-funnel.js into a shared context with minimal DOM /
// localStorage stubs, so the funnel resolves strings through window.SO_I18N
// exactly as it does in the browser.
function loadFunnel(runtimeConfig, storedLang) {
    const i18nSource = fs.readFileSync(path.join(__dirname, "..", "i18n.js"), "utf8");
    const funnelSource = fs.readFileSync(path.join(__dirname, "..", "certwatch-funnel.js"), "utf8");
    const store = {};
    if (storedLang) store.so_lang = storedLang;

    const context = {
        URL,
        encodeURIComponent,
        console,
        CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
        document: {
            readyState: "complete",
            documentElement: { setAttribute: function () {}, getAttribute: function () { return null; } },
            querySelectorAll: function () { return []; },
            addEventListener: function () {},
            dispatchEvent: function () { return true; }
        },
        window: {
            location: { origin: "https://secureorbit.cloud", href: "https://secureorbit.cloud/" },
            CERTWATCH_RUNTIME_CONFIG: runtimeConfig || {},
            localStorage: {
                getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
                setItem: function (k, v) { store[k] = String(v); },
                removeItem: function (k) { delete store[k]; }
            }
        }
    };

    vm.createContext(context);
    vm.runInContext(i18nSource, context);
    vm.runInContext(funnelSource, context);
    return context.window.certWatchFunnel;
}

function runTest(name, fn) {
    try {
        fn();
        console.log("PASS " + name);
    } catch (error) {
        console.error("FAIL " + name);
        console.error(error.stack || error.message);
        process.exitCode = 1;
    }
}

runTest("lead flow capabilities default to conservative trust flags", () => {
    const funnel = loadFunnel();
    const capabilities = funnel.getLeadFlowCapabilities();

    assert.equal(capabilities.endpointConfigured, true);
    assert.equal(capabilities.autoresponseConfirmed, false);
    assert.equal(capabilities.replyHandlingConfirmed, false);
});

runTest("confirmed submission redirect only accepts the configured same-origin success path", () => {
    const funnel = loadFunnel({
        CERTWATCH_SUCCESS_PATH: "/form-success.html"
    });

    assert.equal(
        funnel.isExpectedSuccessUrl("https://secureorbit.cloud/form-success.html?type=pricing"),
        true
    );
    assert.equal(
        funnel.isExpectedSuccessUrl("https://formsubmit.co/thank-you"),
        false
    );
});

runTest("starter CTA falls back to the pricing-request form when no checkout URL is configured", () => {
    const funnel = loadFunnel();

    assert.equal(funnel.getStarterCheckoutHref(), "/request.html?plan=starter");
    assert.equal(funnel.getStarterCtaLabel("fr"), "Obtenir un prix exact");
    assert.equal(funnel.getStarterCtaLabel("en"), "Get exact pricing");
});

runTest("starter CTA becomes a direct Stripe subscribe when a checkout URL is configured", () => {
    const funnel = loadFunnel({
        CERTWATCH_STARTER_CHECKOUT_URL: "https://buy.stripe.com/test_123"
    });

    assert.equal(funnel.getStarterCheckoutHref(), "https://buy.stripe.com/test_123");
    assert.equal(funnel.getStarterCtaLabel("en"), "Subscribe — $99/month");
    assert.equal(funnel.getStarterCtaLabel("fr"), "S'abonner — 99 $/mois");
});

runTest("portfolio CTA falls back to the pricing-request form when no checkout URL is configured", () => {
    const funnel = loadFunnel();

    assert.equal(funnel.getCheckoutHref("portfolio"), "/request.html?plan=portfolio");
    assert.equal(funnel.getCtaLabel("portfolio", "en"), "Get exact pricing");
    assert.equal(funnel.getCtaLabel("portfolio", "fr"), "Obtenir un prix exact");
});

runTest("portfolio CTA becomes a direct Stripe subscribe when a checkout URL is configured", () => {
    const funnel = loadFunnel({
        CERTWATCH_PORTFOLIO_CHECKOUT_URL: "https://buy.stripe.com/test_portfolio"
    });

    assert.equal(funnel.getCheckoutHref("portfolio"), "https://buy.stripe.com/test_portfolio");
    assert.equal(funnel.getCtaLabel("portfolio", "en"), "Subscribe — $249/month");
    assert.equal(funnel.getCtaLabel("portfolio", "fr"), "S'abonner — 249 $/mois");
});

runTest("generalized checkout helpers do not cross-wire plans", () => {
    const funnel = loadFunnel({
        CERTWATCH_STARTER_CHECKOUT_URL: "https://buy.stripe.com/test_starter"
    });

    // Configuring only Starter must not turn the Portfolio button into a subscribe link.
    assert.equal(funnel.getCheckoutHref("starter"), "https://buy.stripe.com/test_starter");
    assert.equal(funnel.getCheckoutHref("portfolio"), "/request.html?plan=portfolio");
    assert.equal(funnel.getCtaLabel("portfolio", "en"), "Get exact pricing");
});

runTest("default language is French (no stored choice)", () => {
    const funnel = loadFunnel({
        CERTWATCH_STARTER_CHECKOUT_URL: "https://buy.stripe.com/test_123"
    });

    // No lang argument -> resolves through SO_I18N.getLang() which defaults to FR.
    assert.equal(funnel.getStarterCtaLabel(), "S'abonner — 99 $/mois");
    assert.equal(funnel.getCallLabel(), "Réserver un appel");
    assert.equal(funnel.getPlanLabel("portfolio"), "Surveillance Portfolio");
});

runTest("a stored English preference is honoured by default", () => {
    const funnel = loadFunnel({ CERTWATCH_STARTER_CHECKOUT_URL: "https://buy.stripe.com/test_123" }, "en");

    assert.equal(funnel.getStarterCtaLabel(), "Subscribe — $99/month");
    assert.equal(funnel.getCallLabel(), "Book a call");
    assert.equal(funnel.getPlanLabel("portfolio"), "Portfolio Monitoring");
});

runTest("auto-response message is localized to the visitor's language", () => {
    const funnel = loadFunnel();

    assert.ok(funnel.buildAutoresponseMessage("free_scan", "fr").startsWith("Merci"));
    assert.ok(funnel.buildAutoresponseMessage("free_scan", "en").startsWith("Thanks"));
    assert.ok(funnel.buildAutoresponseMessage("pricing", "fr").startsWith("Merci"));
    assert.ok(funnel.buildAutoresponseMessage("pricing", "en").startsWith("Thanks"));
});
