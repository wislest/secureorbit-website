const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Load i18n.js into a context with minimal DOM / localStorage stubs and return
// the public SO_I18N API (including the internal _dict for parity checks).
function loadI18n(storedLang) {
    const source = fs.readFileSync(path.join(__dirname, "..", "i18n.js"), "utf8");
    const store = {};
    if (storedLang) store.so_lang = storedLang;

    const context = {
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
            localStorage: {
                getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
                setItem: function (k, v) { store[k] = String(v); },
                removeItem: function (k) { delete store[k]; }
            }
        }
    };

    vm.createContext(context);
    vm.runInContext(source, context);
    return context.window.SO_I18N;
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

runTest("every dynamic string exists in both fr and en (key parity)", () => {
    const i18n = loadI18n();
    const fr = Object.keys(i18n._dict.fr).sort();
    const en = Object.keys(i18n._dict.en).sort();

    const missingInEn = fr.filter((k) => !i18n._dict.en.hasOwnProperty(k));
    const missingInFr = en.filter((k) => !i18n._dict.fr.hasOwnProperty(k));

    assert.deepEqual(missingInEn, [], "keys present in fr but missing in en: " + missingInEn.join(", "));
    assert.deepEqual(missingInFr, [], "keys present in en but missing in fr: " + missingInFr.join(", "));
    assert.deepEqual(fr, en);
});

runTest("no string value is left empty", () => {
    const i18n = loadI18n();
    ["fr", "en"].forEach((lang) => {
        Object.keys(i18n._dict[lang]).forEach((key) => {
            const value = i18n._dict[lang][key];
            assert.ok(typeof value === "string" && value.trim().length > 0, "empty value for " + lang + "." + key);
        });
    });
});

runTest("getLang defaults to fr and honours a stored choice", () => {
    assert.equal(loadI18n().getLang(), "fr");
    assert.equal(loadI18n("en").getLang(), "en");
    assert.equal(loadI18n("xx").getLang(), "fr"); // unsupported -> fr
});

runTest("tf interpolates the price placeholder", () => {
    const i18n = loadI18n();
    assert.equal(i18n.tf("cta.subscribe", { price: "99 $/mois" }, "fr"), "S'abonner — 99 $/mois");
    assert.equal(i18n.tf("cta.subscribe", { price: "$99/month" }, "en"), "Subscribe — $99/month");
});
