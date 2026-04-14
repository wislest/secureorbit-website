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
