const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadFunnel(runtimeConfig) {
    const source = fs.readFileSync(path.join(__dirname, "..", "certwatch-funnel.js"), "utf8");
    const context = {
        URL,
        encodeURIComponent,
        window: {
            location: {
                origin: "https://secureorbit.cloud"
            },
            CERTWATCH_RUNTIME_CONFIG: runtimeConfig || {}
        }
    };

    vm.createContext(context);
    vm.runInContext(source, context);
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
    assert.equal(funnel.getStarterCtaLabel(), "Get exact pricing");
});

runTest("starter CTA becomes a direct Stripe subscribe when a checkout URL is configured", () => {
    const funnel = loadFunnel({
        CERTWATCH_STARTER_CHECKOUT_URL: "https://buy.stripe.com/test_123"
    });

    assert.equal(funnel.getStarterCheckoutHref(), "https://buy.stripe.com/test_123");
    assert.equal(funnel.getStarterCtaLabel(), "Subscribe — $99/month");
});

runTest("portfolio CTA falls back to the pricing-request form when no checkout URL is configured", () => {
    const funnel = loadFunnel();

    assert.equal(funnel.getCheckoutHref("portfolio"), "/request.html?plan=portfolio");
    assert.equal(funnel.getCtaLabel("portfolio"), "Get exact pricing");
});

runTest("portfolio CTA becomes a direct Stripe subscribe when a checkout URL is configured", () => {
    const funnel = loadFunnel({
        CERTWATCH_PORTFOLIO_CHECKOUT_URL: "https://buy.stripe.com/test_portfolio"
    });

    assert.equal(funnel.getCheckoutHref("portfolio"), "https://buy.stripe.com/test_portfolio");
    assert.equal(funnel.getCtaLabel("portfolio"), "Subscribe — $249/month");
});

runTest("generalized checkout helpers do not cross-wire plans", () => {
    const funnel = loadFunnel({
        CERTWATCH_STARTER_CHECKOUT_URL: "https://buy.stripe.com/test_starter"
    });

    // Configuring only Starter must not turn the Portfolio button into a subscribe link.
    assert.equal(funnel.getCheckoutHref("starter"), "https://buy.stripe.com/test_starter");
    assert.equal(funnel.getCheckoutHref("portfolio"), "/request.html?plan=portfolio");
    assert.equal(funnel.getCtaLabel("portfolio"), "Get exact pricing");
});
