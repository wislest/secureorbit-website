/*
 * SecureOrbit bilingual (FR/EN) runtime — static site, no build step.
 *
 * Compliance model (Québec, Charte de la langue française / Loi 96):
 *   French is the DEFAULT and is the text authored inline in the HTML, so the
 *   site renders in French even with JavaScript disabled. English is provided
 *   as a translation layer:
 *     - Static DOM text: co-located on each element via data-en / data-en-html
 *       and data-en-<attr> (placeholder, title, aria-label, content).
 *     - Dynamic JS strings (button states, form statuses, confirmation copy,
 *       email auto-responses, CTA labels): the STRINGS dictionary below.
 *
 * Language is FR by default. If the visitor explicitly chooses EN, the choice
 * is remembered in localStorage. No browser-language auto-detection.
 *
 * Load order on every page: i18n.js -> certwatch-funnel.js -> certwatch-content.js -> inline.
 */
(function () {
    "use strict";

    var STORAGE_KEY = "so_lang";
    var SUPPORTED = ["fr", "en"];
    var ATTR_KEYS = ["placeholder", "title", "aria-label", "content"];

    // --- Dynamic strings (not tied to a static DOM node) ---------------------
    // Keep fr and en key sets identical (tests/i18n.test.js enforces parity).
    var STRINGS = {
        fr: {
            // CTA labels (computed by the funnel)
            "cta.subscribe": "S'abonner — {price}",
            "cta.getPricing": "Obtenir un prix exact",
            "cta.bookCall": "Réserver un appel",
            "cta.requestCall": "Demander un appel",
            // Plan names
            "plan.starter": "Surveillance Starter",
            "plan.portfolio": "Surveillance Portfolio",
            "plan.custom": "Surveillance gérée à grande échelle",
            // Email auto-response sent to the visitor (formsubmit _autoresponse)
            "autoresponse.free_scan": "Merci d'avoir contacté SecureOrbit pour un scan de certificat gratuit CertWatch. Nous avons bien reçu votre demande et vous répondrons sous peu avec la prochaine étape. Pour ajouter du contexte, écrivez à contact@secureorbit.cloud.",
            "autoresponse.pricing": "Merci d'avoir contacté SecureOrbit au sujet de la surveillance gérée de certificats CertWatch. Nous avons bien reçu votre demande de prix et vous répondrons sous peu avec la portée de surveillance recommandée et la prochaine étape. Pour ajouter du contexte, écrivez à contact@secureorbit.cloud.",
            // mailto trailing sentences / subjects (operator-facing structured fields kept as-is)
            "mail.pricing.subject": "Demande de prix - CertWatch - {plan}",
            "mail.pricing.closing": "Merci de répondre avec la portée de surveillance recommandée et les prochaines étapes.",
            "mail.scan.subject": "Demande de scan de certificat gratuit - CertWatch",
            "mail.scan.closing": "Merci d'examiner ces domaines et de revenir vers moi avec la prochaine étape.",
            "mail.call.subject": "Réserver un appel - CertWatch",
            "mail.call.l1": "J'aimerais discuter de la portée de surveillance CertWatch.",
            "mail.call.company": "Entreprise :",
            "mail.call.domains": "Domaines / environnements à discuter :",
            "mail.call.timing": "Disponibilités :",
            // request.html — button + inline status
            "req.btn.default": "Obtenir un prix exact",
            "req.btn.submitting": "Envoi en cours…",
            "req.status.submitting.title": "Envoi de votre demande à SecureOrbit.",
            "req.status.submitting.body": "Nous confirmerons la réception sur cette page. Pour ajouter du contexte après l'envoi, écrivez à <a class=\"text-emerald-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.",
            "req.status.fallback": "<p class=\"font-semibold\">Merci. Votre demande de prix a été transmise à SecureOrbit.</p><p class=\"mt-1\">Nous examinerons votre portée et reviendrons par courriel avec la prochaine étape.</p><p class=\"mt-1\">Sans réponse sous 1 jour ouvrable, écrivez-nous à <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "req.status.success": "<p class=\"font-semibold\">Merci. Votre demande a été transmise pour examen par SecureOrbit.</p><p class=\"mt-1\">Nous examinerons votre portée et reviendrons depuis <a class=\"text-emerald-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "req.status.endpointMissing": "<p class=\"font-semibold\">Point de collecte du formulaire non configuré.</p><p class=\"mt-1\">Écrivez à <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a> pendant que le formulaire est en cours de connexion.</p>",
            // scan.html — button + inline status
            "scan.btn.default": "Obtenir un scan de certificat gratuit",
            "scan.btn.submitting": "Envoi en cours…",
            "scan.status.submitting": "<p class=\"font-semibold\">Envoi de votre demande à SecureOrbit…</p>",
            "scan.status.confirm": "<p class=\"font-semibold\">Vérifiez votre boîte de réception pour confirmer &#9993;</p><p class=\"mt-1\">Nous venons de vous envoyer un lien de confirmation. Cliquez dessus pour lancer votre scan gratuit — votre rapport sera envoyé directement dans votre boîte de réception.</p>",
            "scan.status.alreadyUsed": "<p class=\"font-semibold\">Ce courriel a déjà utilisé son scan gratuit.</p><p class=\"mt-1\">Pour plus de domaines ou un nouveau rapport, écrivez à <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "scan.status.tooMany": "<p class=\"font-semibold\">Trop de demandes en ce moment.</p><p class=\"mt-1\">Réessayez dans quelques minutes, ou écrivez à <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "scan.status.error": "<p class=\"font-semibold\">Nous n'avons pas pu envoyer le formulaire automatiquement.</p><p class=\"mt-1\">Veuillez envoyer vos domaines à <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a> et nous ferons le suivi.</p>",
            "scan.status.iframeFallback": "<p class=\"font-semibold\">Merci. Votre demande de scan gratuit a été transmise à SecureOrbit.</p><p class=\"mt-1\">Nous examinerons votre portée et reviendrons par courriel avec la prochaine étape.</p><p class=\"mt-1\">Sans réponse sous 1 jour ouvrable, écrivez-nous à <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "scan.status.iframeSuccess": "<p class=\"font-semibold\">Merci. Votre demande a été transmise pour examen par SecureOrbit.</p><p class=\"mt-1\">Nous examinerons les domaines partagés et reviendrons depuis <a class=\"text-emerald-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            // form-success.html variants
            "success.default.title": "Abonnement confirmé — bienvenue à bord",
            "success.default.msg": "Merci. Votre abonnement SecureOrbit Starter est confirmé. Notre équipe met en place votre surveillance gérée de certificats et vous écrira sous <strong class=\"text-white\">1 jour ouvrable</strong> pour confirmer la portée et les prochaines étapes.",
            "success.default.step1": "Nous confirmons le(s) domaine(s) soumis et la portée de surveillance.",
            "success.default.step2": "Nous mettons en place la surveillance continue des certificats et la découverte par CT sur votre portée.",
            "success.default.step3": "Vous commencez à recevoir des alertes et des rapports mensuels — aucun tableau de bord à gérer.",
            "success.pricing.title": "Demande de prix reçue",
            "success.pricing.msg": "Merci. Nous examinerons votre portée et votre nombre de domaines, confirmerons la bonne approche de surveillance CertWatch, et répondrons avec un prix exact sous <strong class=\"text-white\">1 jour ouvrable</strong>.",
            "success.pricing.step1": "Nous examinons votre portée, votre nombre de domaines et vos exigences.",
            "success.pricing.step2": "Nous confirmons la bonne approche de surveillance CertWatch et le prix exact.",
            "success.pricing.step3": "Nous faisons le suivi par courriel avec la prochaine étape.",
            "success.free_scan.title": "Demande de scan reçue",
            "success.free_scan.msg": "Merci. Nous lancerons un scan de certificat sur les domaines soumis et ferons le suivi par courriel avec ce que nous trouvons et la prochaine étape recommandée, sous <strong class=\"text-white\">1 jour ouvrable</strong>.",
            "success.free_scan.step1": "Nous lançons un scan de certificat sur vos domaines soumis.",
            "success.free_scan.step2": "Nous résumons les constats et la prochaine étape recommandée.",
            "success.free_scan.step3": "Nous faisons le suivi par courriel — sans engagement."
        },
        en: {
            "cta.subscribe": "Subscribe — {price}",
            "cta.getPricing": "Get exact pricing",
            "cta.bookCall": "Book a call",
            "cta.requestCall": "Request a call",
            "plan.starter": "Starter Monitoring",
            "plan.portfolio": "Portfolio Monitoring",
            "plan.custom": "Managed Monitoring at Scale",
            "autoresponse.free_scan": "Thanks for contacting SecureOrbit about a CertWatch free certificate scan. We received your request and will reply shortly with the next step. If you need to add context, email contact@secureorbit.cloud.",
            "autoresponse.pricing": "Thanks for contacting SecureOrbit about CertWatch managed certificate monitoring. We received your pricing request and will reply shortly with the recommended monitoring scope and next step. If you need to add context, email contact@secureorbit.cloud.",
            "mail.pricing.subject": "Request Pricing - CertWatch - {plan}",
            "mail.pricing.closing": "Please reply with the recommended monitoring scope and next steps.",
            "mail.scan.subject": "Free Certificate Scan Request - CertWatch",
            "mail.scan.closing": "Please review these domains and follow up with the next step.",
            "mail.call.subject": "Book a Call - CertWatch",
            "mail.call.l1": "I'd like to talk through CertWatch monitoring scope.",
            "mail.call.company": "Company:",
            "mail.call.domains": "Domains / environments to discuss:",
            "mail.call.timing": "Preferred timing:",
            "req.btn.default": "Get exact pricing",
            "req.btn.submitting": "Submitting…",
            "req.status.submitting.title": "Submitting your request to SecureOrbit.",
            "req.status.submitting.body": "We will confirm receipt on this page. If you need to add context after submitting, email <a class=\"text-emerald-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.",
            "req.status.fallback": "<p class=\"font-semibold\">Thanks. Your pricing request has been submitted to SecureOrbit.</p><p class=\"mt-1\">We&apos;ll review your scope and follow up by email with the next step.</p><p class=\"mt-1\">If you do not receive a response within 1 business day, contact us at <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "req.status.success": "<p class=\"font-semibold\">Thanks. Your request was submitted for SecureOrbit review.</p><p class=\"mt-1\">We will review your scope and follow up from <a class=\"text-emerald-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "req.status.endpointMissing": "<p class=\"font-semibold\">Lead form endpoint not configured.</p><p class=\"mt-1\">Email <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a> while the form backend is being connected.</p>",
            "scan.btn.default": "Get a Free Certificate Scan",
            "scan.btn.submitting": "Submitting…",
            "scan.status.submitting": "<p class=\"font-semibold\">Submitting your request to SecureOrbit…</p>",
            "scan.status.confirm": "<p class=\"font-semibold\">Check your inbox to confirm &#9993;</p><p class=\"mt-1\">We just emailed you a confirmation link. Click it to start your free scan &mdash; your report will be sent straight to your inbox.</p>",
            "scan.status.alreadyUsed": "<p class=\"font-semibold\">This email already used its free scan.</p><p class=\"mt-1\">For more domains or a fresh report, email <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "scan.status.tooMany": "<p class=\"font-semibold\">Too many requests right now.</p><p class=\"mt-1\">Please try again in a few minutes, or email <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "scan.status.error": "<p class=\"font-semibold\">We could not submit the form automatically.</p><p class=\"mt-1\">Please email your domains to <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a> and we&apos;ll follow up.</p>",
            "scan.status.iframeFallback": "<p class=\"font-semibold\">Thanks. Your free scan request has been submitted to SecureOrbit.</p><p class=\"mt-1\">We&apos;ll review your scope and follow up by email with the next step.</p><p class=\"mt-1\">If you do not receive a response within 1 business day, contact us at <a class=\"text-amber-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "scan.status.iframeSuccess": "<p class=\"font-semibold\">Thanks. Your request was submitted for SecureOrbit review.</p><p class=\"mt-1\">We will review the domains you shared and follow up from <a class=\"text-emerald-200 underline\" href=\"mailto:contact@secureorbit.cloud\">contact@secureorbit.cloud</a>.</p>",
            "success.default.title": "Subscription confirmed — welcome aboard",
            "success.default.msg": "Thank you. Your SecureOrbit Starter subscription is confirmed. Our team is setting up your managed certificate monitoring and will email you within <strong class=\"text-white\">1 business day</strong> to confirm scope and next steps.",
            "success.default.step1": "We confirm the domain(s) you submitted and the monitoring scope.",
            "success.default.step2": "We set up continuous certificate monitoring and CT-based discovery on your scope.",
            "success.default.step3": "You start receiving alerts and monthly reports — no dashboard to manage.",
            "success.pricing.title": "Pricing request received",
            "success.pricing.msg": "Thank you. We’ll review your scope and domain count, confirm the right CertWatch monitoring approach, and reply with exact pricing within <strong class=\"text-white\">1 business day</strong>.",
            "success.pricing.step1": "We review your scope, domain count and requirements.",
            "success.pricing.step2": "We confirm the right CertWatch monitoring approach and exact pricing.",
            "success.pricing.step3": "We follow up by email with the next step.",
            "success.free_scan.title": "Scan request received",
            "success.free_scan.msg": "Thank you. We’ll run a certificate scan on the domains you submitted and follow up by email with what we find and the recommended next step, within <strong class=\"text-white\">1 business day</strong>.",
            "success.free_scan.step1": "We run a certificate scan on your submitted domains.",
            "success.free_scan.step2": "We summarise findings and the recommended next step.",
            "success.free_scan.step3": "We follow up by email — no commitment required."
        }
    };

    function normalizeLang(lang) {
        return SUPPORTED.indexOf(lang) >= 0 ? lang : "fr";
    }

    function getLang() {
        try {
            return normalizeLang(window.localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            return "fr";
        }
    }

    function t(key, lang) {
        lang = normalizeLang(lang || getLang());
        var table = STRINGS[lang] || STRINGS.fr;
        if (table[key] != null) return table[key];
        if (STRINGS.fr[key] != null) return STRINGS.fr[key];
        return key;
    }

    function format(str, params) {
        if (!params) return str;
        return str.replace(/\{(\w+)\}/g, function (m, k) {
            return params[k] != null ? params[k] : m;
        });
    }

    // Cache the French (inline) value the first time we see an element, so we
    // can restore it when switching back from English.
    function cacheFr(el) {
        if (el.__soFrCached) return;
        el.__soFrCached = true;
        if (el.hasAttribute("data-en-html")) {
            el.__soFrHtml = el.innerHTML;
        } else if (el.hasAttribute("data-en")) {
            el.__soFrText = el.textContent;
        }
        ATTR_KEYS.forEach(function (attr) {
            if (el.hasAttribute("data-en-" + attr)) {
                el["__soFrAttr_" + attr] = el.getAttribute(attr);
            }
        });
    }

    function applyToElement(el, lang) {
        cacheFr(el);
        var en = lang === "en";
        if (el.hasAttribute("data-en-html")) {
            el.innerHTML = en ? el.getAttribute("data-en-html") : el.__soFrHtml;
        } else if (el.hasAttribute("data-en")) {
            el.textContent = en ? el.getAttribute("data-en") : el.__soFrText;
        }
        ATTR_KEYS.forEach(function (attr) {
            if (el.hasAttribute("data-en-" + attr)) {
                el.setAttribute(attr, en ? el.getAttribute("data-en-" + attr) : el["__soFrAttr_" + attr]);
            }
        });
    }

    function apply(lang) {
        lang = normalizeLang(lang);
        document.documentElement.setAttribute("lang", lang);

        var selector = "[data-en],[data-en-html]";
        ATTR_KEYS.forEach(function (attr) { selector += ",[data-en-" + attr + "]"; });
        var nodes = document.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            applyToElement(nodes[i], lang);
        }

        // Reflect active language on the FR|EN switch(es).
        var switches = document.querySelectorAll("[data-setlang]");
        for (var j = 0; j < switches.length; j++) {
            var active = switches[j].getAttribute("data-setlang") === lang;
            switches[j].setAttribute("aria-pressed", String(active));
            switches[j].classList.toggle("so-lang-active", active);
        }
    }

    function setLang(lang) {
        lang = normalizeLang(lang);
        try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
        apply(lang);
        try {
            document.dispatchEvent(new CustomEvent("so:langchange", { detail: { lang: lang } }));
        } catch (e) { /* older browsers */ }
    }

    function bindSwitches() {
        var switches = document.querySelectorAll("[data-setlang]");
        for (var i = 0; i < switches.length; i++) {
            switches[i].addEventListener("click", function (event) {
                event.preventDefault();
                setLang(this.getAttribute("data-setlang"));
            });
        }
    }

    // Inject the minimal CSS for the FR|EN switch once, so individual pages only
    // need the switch markup (data-setlang buttons) — no per-page <style> edits.
    function injectStyle() {
        if (!document.createElement || !document.head) return;
        if (document.getElementById && document.getElementById("so-i18n-style")) return;
        var style = document.createElement("style");
        style.id = "so-i18n-style";
        style.textContent =
            ".so-lang-switch{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.2);" +
            "border-radius:9999px;overflow:hidden;font-size:.72rem;font-weight:600;line-height:1;}" +
            ".so-lang-switch button{padding:.3rem .6rem;color:#cbd5e1;background:transparent;border:0;cursor:pointer;}" +
            ".so-lang-switch button:hover{color:#fff;}" +
            ".so-lang-switch button.so-lang-active{background:linear-gradient(to right,#3b82f6,#9333ea);color:#fff;}";
        (document.head || document.documentElement).appendChild(style);
    }

    function init() {
        injectStyle();
        bindSwitches();
        apply(getLang());
    }

    window.SO_I18N = {
        getLang: getLang,
        setLang: setLang,
        apply: apply,
        t: t,
        format: format,
        tf: function (key, params, lang) { return format(t(key, lang), params); },
        _dict: STRINGS // exposed for the key-parity test (public content, not secret)
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
