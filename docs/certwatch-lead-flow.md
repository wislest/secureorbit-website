# CertWatch Lead Capture Flow

## Current Day 1 routing

- `request.html` submits CertWatch pricing requests to the shared lead form endpoint in [certwatch-funnel.js](/C:/Users/blackpanther/projects/secureorbit-website/certwatch-funnel.js).
- `scan.html` submits free certificate scan requests to the same endpoint with a different request type and subject line.
- The default static-site-compatible endpoint is `https://formsubmit.co/contact@secureorbit.cloud`.
- Successful submissions stay on the same form page.
- The inline success state is now shown only if the hidden submission target finishes on the same-origin success page at `/form-success.html`.
- If the hidden target does not reach that success page, the UI now shows a warning instead of a false success message.

## Required fields

- `company_name`
- `email`
- `domains_to_review`
- `domain_count`
- `main_objective`

`full_name` is also collected because it improves reply handling and manual qualification.

## Acknowledgment and reply flow

- Prospect acknowledgment is only prepared today via the hidden `_autoresponse` field populated in `certwatch-funnel.js`.
- Internal notification subject is populated per request type, with pricing requests including the selected monitoring plan.
- The hidden `_replyto` field is populated from the prospect's work email for provider-side reply handling on the internal notification path.
- The public UI does not promise acknowledgment delivery or reply behavior unless SecureOrbit has manually confirmed that setup end-to-end.

## Internal routing notes

- Primary inbox: `contact@secureorbit.cloud`
- Optional internal copy: set `CERTWATCH_INTERNAL_CC_EMAIL` in `window.CERTWATCH_RUNTIME_CONFIG` if a second SecureOrbit mailbox should receive a copy.
- To switch providers later, update `CERTWATCH_LEAD_FORM_ENDPOINT` in `window.CERTWATCH_RUNTIME_CONFIG` or edit the defaults in [certwatch-funnel.js](/C:/Users/blackpanther/projects/secureorbit-website/certwatch-funnel.js).
- After live verification, SecureOrbit can explicitly enable stronger UI trust language by setting:
  - `CERTWATCH_AUTORESPONSE_CONFIRMED: true`
  - `CERTWATCH_REPLY_HANDLING_CONFIRMED: true`

Example runtime override:

```html
<script>
  window.CERTWATCH_RUNTIME_CONFIG = {
    CERTWATCH_LEAD_FORM_ENDPOINT: "https://formsubmit.co/your-confirmed-token",
    CERTWATCH_INTERNAL_CC_EMAIL: "sales@secureorbit.cloud",
    CERTWATCH_AUTORESPONSE_CONFIRMED: true,
    CERTWATCH_REPLY_HANDLING_CONFIRMED: true
  };
</script>
```

## Provider caveat

- FormSubmit requires the destination inbox or token endpoint to be confirmed before production traffic is sent.
- `_autoresponse` does not fire on AJAX submissions, so the forms intentionally use standard browser form posts.
- The static site cannot directly prove mailbox delivery. It can only verify that the provider accepted the submission and redirected the hidden frame to the configured same-origin success page.
- If SecureOrbit moves to another form backend, keep the same field names and preserve reply-to plus acknowledgment behavior.

## Manual verification checklist

1. Open `/request.html?plan=starter` and confirm the scope selector preselects Starter Monitoring.
2. Open `/request.html?plan=portfolio` and confirm the scope selector preselects Portfolio Monitoring.
3. Submit a pricing request with a real work email and confirm the page stays on `request.html`.
4. Confirm the inline state is green only when the hidden target reaches `/form-success.html`; otherwise it should show the amber warning state.
5. Confirm the intake email arrives at `contact@secureorbit.cloud` with the expected subject and field values.
6. Confirm the internal notification supports replying back to the prospect as intended.
7. If acknowledgment email is expected in production, confirm it actually arrives before setting `CERTWATCH_AUTORESPONSE_CONFIRMED` to `true`.
8. Open `/scan.html`, submit a free scan request, and confirm the same green-vs-amber behavior.
9. Confirm the sample report and pricing cross-links still work from `request.html` and `scan.html`.
10. Confirm Calendly links still point to the existing live URL and were not changed.
