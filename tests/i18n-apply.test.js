const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// A tiny fake DOM element implementing only what the i18n engine touches.
function FakeEl(attrs, initial) {
    this._attrs = Object.assign({}, attrs);
    this._text = initial && initial.text != null ? initial.text : "";
    this._html = initial && initial.html != null ? initial.html : "";
    this.classList = { toggle: function () {}, add: function () {}, remove: function () {} };
}
FakeEl.prototype.hasAttribute = function (n) { return Object.prototype.hasOwnProperty.call(this._attrs, n); };
FakeEl.prototype.getAttribute = function (n) { return this.hasAttribute(n) ? this._attrs[n] : null; };
FakeEl.prototype.setAttribute = function (n, v) { this._attrs[n] = v; };
Object.defineProperty(FakeEl.prototype, "textContent", {
    get: function () { return this._text; }, set: function (v) { this._text = v; }
});
Object.defineProperty(FakeEl.prototype, "innerHTML", {
    get: function () { return this._html; }, set: function (v) { this._html = v; }
});

function loadEngine(elements, switches) {
    const source = fs.readFileSync(path.join(__dirname, "..", "i18n.js"), "utf8");
    const store = {};
    const context = {
        console,
        CustomEvent: function (t, i) { this.type = t; this.detail = i && i.detail; },
        document: {
            readyState: "complete",
            documentElement: { setAttribute: function () {}, getAttribute: function () { return null; } },
            // Return switches for the [data-setlang] query, translatable elements otherwise.
            querySelectorAll: function (sel) { return sel.indexOf("data-setlang") >= 0 ? switches : elements; },
            addEventListener: function () {},
            dispatchEvent: function () { return true; }
        },
        window: {
            localStorage: {
                getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
                setItem: function (k, v) { store[k] = String(v); }
            }
        }
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context.window.SO_I18N;
}

function runTest(name, fn) {
    try { fn(); console.log("PASS " + name); }
    catch (e) { console.error("FAIL " + name); console.error(e.stack || e.message); process.exitCode = 1; }
}

runTest("apply swaps text / html / attribute both directions; FR is restored exactly", () => {
    const text = new FakeEl({ "data-en": "Pricing" }, { text: "Tarification" });
    const html = new FakeEl(
        { "data-en-html": 'Email <a href="x">us</a>' },
        { html: 'Écrivez-<a href="x">nous</a>' }
    );
    const attr = new FakeEl({ "data-en-placeholder": "name", placeholder: "nom" }, {});

    const i18n = loadEngine([text, html, attr], []);

    // init() already ran apply(getLang()) === apply('fr'); FR values intact.
    assert.equal(text.textContent, "Tarification");
    assert.equal(html.innerHTML, 'Écrivez-<a href="x">nous</a>');
    assert.equal(attr.getAttribute("placeholder"), "nom");

    i18n.setLang("en");
    assert.equal(text.textContent, "Pricing");
    assert.equal(html.innerHTML, 'Email <a href="x">us</a>');
    assert.equal(attr.getAttribute("placeholder"), "name");

    i18n.setLang("fr");
    assert.equal(text.textContent, "Tarification");
    assert.equal(html.innerHTML, 'Écrivez-<a href="x">nous</a>');
    assert.equal(attr.getAttribute("placeholder"), "nom");
});
