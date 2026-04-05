# CertWatch Static Lead Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect every primary CertWatch CTA to a meaningful, static, GitHub Pages-compatible lead capture flow for pricing, free scans, calls, and sample reports.

**Architecture:** Add a small shared config script that centralizes configurable external URLs and mailto fallbacks, then create two dedicated static pages for pricing and scan requests. Update the homepage CTAs and existing CertWatch content bindings to point at those static flows while preserving the current visual language and in-page sample report fallback.

**Tech Stack:** Static HTML, inline JavaScript, shared browser config script, Tailwind CDN styles already used by the site

---

### Task 1: Add shared CertWatch funnel configuration

**Files:**
- Create: `certwatch-funnel.js`
- Modify: `index.html`
- Modify: `certwatch-content.js`

- [ ] **Step 1: Add a shared static config script with placeholders and helpers**

```js
window.certWatchFunnelConfig = {
  contactEmail: "contact@secureorbit.cloud",
  CERTWATCH_PRICING_FORM_URL: "",
  CERTWATCH_SCAN_FORM_URL: "",
  CERTWATCH_CALL_URL: "",
  CERTWATCH_SAMPLE_REPORT_URL: ""
};
```

- [ ] **Step 2: Add helper functions that build request, scan, call, and sample-report destinations**

```js
window.certWatchFunnel = {
  getPricingHref(plan) { /* prefer external URL, otherwise /request.html?plan=... */ },
  getScanHref() { /* prefer external URL, otherwise /scan.html?request_type=free_scan */ },
  getCallHref() { /* prefer configured URL, otherwise mailto fallback */ },
  getSampleReportHref() { /* prefer configured URL, otherwise #sample-report */ }
};
```

- [ ] **Step 3: Load the shared config before homepage CTA override logic**

Run: manual HTML include update in `index.html`
Expected: `window.certWatchFunnel` is available before CTA override code runs

- [ ] **Step 4: Update CTA bindings in `certwatch-content.js` to use the shared helpers**

```js
ctaLinks: {
  "hero-primary-cta": window.certWatchFunnel.getScanHref(),
  "hero-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
  "about-primary-cta": window.certWatchFunnel.getPricingHref(),
  "about-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
  "contact-primary-cta": window.certWatchFunnel.getPricingHref(),
  "contact-secondary-cta": window.certWatchFunnel.getSampleReportHref(),
  "contact-tertiary-cta": window.certWatchFunnel.getCallHref(),
  "contact-schedule-link": window.certWatchFunnel.getCallHref()
}
```

### Task 2: Create the dedicated pricing request page

**Files:**
- Create: `request.html`

- [ ] **Step 1: Build a static request page that matches the existing dark gradient CertWatch style**

```html
<form id="pricing-request-form">
  <input name="full_name">
  <input name="work_email" type="email">
  <input name="company">
  <select name="plan">
    <option value="starter">Starter</option>
    <option value="portfolio">Portfolio</option>
    <option value="custom">Custom</option>
  </select>
  <textarea name="domains"></textarea>
  <textarea name="notes"></textarea>
</form>
```

- [ ] **Step 2: Read `?plan=` from the URL and preselect the corresponding option**

Run: open `/request.html?plan=portfolio`
Expected: the `portfolio` option is selected

- [ ] **Step 3: Implement static submission behavior**

```js
if (config.CERTWATCH_PRICING_FORM_URL) {
  form.action = config.CERTWATCH_PRICING_FORM_URL;
} else {
  submitButton.href = buildPricingMailto(selectedPlan, formValues);
}
```

- [ ] **Step 4: Show a small confirmation message**

Expected copy: `Your request is ready to send` and `SecureOrbit will follow up to confirm monitoring scope`

### Task 3: Create the dedicated free scan page

**Files:**
- Create: `scan.html`

- [ ] **Step 1: Build a static free scan intake page with the required fields**

```html
<input name="full_name">
<input name="work_email" type="email">
<input name="company">
<textarea name="domains_to_review"></textarea>
<textarea name="notes"></textarea>
<input type="hidden" name="request_type" value="free_scan">
```

- [ ] **Step 2: Implement static submission behavior using external URL or mailto fallback**

Run: open `/scan.html`
Expected: clicking the submit CTA prepares either an external form submission or a mailto draft with `request_type=free_scan`

- [ ] **Step 3: Show a small confirmation message after preparation**

Expected copy: `Your request is ready to send`

### Task 4: Rewire homepage CertWatch CTAs and trust copy

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update hero CTA labels and destinations**

Expected:
- Hero primary CTA text becomes `Get a Free Certificate Scan`
- Hero primary CTA points to the scan flow
- Hero secondary CTA text becomes `View Sample Report`

- [ ] **Step 2: Update pricing card CTAs to preserve plan selection**

Expected:
- Starter pricing CTA points to `/request.html?plan=starter`
- Portfolio pricing CTA points to `/request.html?plan=portfolio`
- Managed Monitoring at Scale CTA points to call booking helper

- [ ] **Step 3: Add concise trust copy near the pricing/request area**

Expected copy: `We'll review your request and reply with the right monitoring scope.`

### Task 5: Manual verification and summary

**Files:**
- Modify: `README.md` only if needed for config notes

- [ ] **Step 1: Manually verify CTA destinations**

Run:
- open homepage and inspect CertWatch CTA href values
- open `/request.html?plan=starter`
- open `/request.html?plan=portfolio`
- open `/scan.html`

Expected:
- each CTA has a meaningful destination
- plan query params prefill correctly
- sample report falls back to `#sample-report` when no external URL is configured

- [ ] **Step 2: Capture concise PR notes**

Expected:
- summary of config additions
- new pages added
- manual test notes recorded in final response
