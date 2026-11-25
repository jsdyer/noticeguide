# Notice Guide

[Open Notice Guide](https://coolcode.ca/noticeguide/) — a private, browser-only Canadian ISP copyright-notice reader.

<!-- coolcode:guide -->
Paste a forwarded notice or open a plain-text `.txt`/`.eml` file to extract labelled claimant, work, allegation, event date and network fields. Payment, settlement, personal-information and court-document phrases are highlighted for human review. Try the fictional example before using your own notice. A missing extraction is not proof a legally required field is absent, and a flag is not a legal determination. Notice text never leaves the tab; the app uses no analytics or browser storage. A downloaded review contains the extracted private information. Clear or reload to remove the working text.
<!-- /coolcode:guide -->

## Legal references

Reviewed **2026-11-25** against the Justice Canada consolidation current to 2026-10-29 (last amended 2024-11-07) and ISED consumer guidance:

- [Copyright Act s. 41.25](https://laws-lois.justice.gc.ca/eng/acts/C-42/section-41.25.html): required particulars and prohibited settlement/payment/personal-information requests, including references and hyperlinks.
- [Copyright Act s. 41.26](https://laws-lois.justice.gc.ca/eng/acts/C-42/section-41.26.html): forwarding and record retention.
- [ISED: Notices to Canadian Internet subscribers](https://www.ised-isde.canada.ca/site/office-consumer-affairs/en/connected-consumer/notices-canadian-internet-subscribers): a forwarded notice is an allegation, separate from litigation; the notice regime itself does not require a subscriber response.

This is general information, not legal advice. Court papers or other legal correspondence need individual review. The app does not authenticate messages, investigate an IP address, verify ownership, or determine infringement.

## Privacy and limits

The JavaScript parser reads local text only; it performs no fetches. CSP blocks outbound connections, forms, remote scripts and embedded objects. The normal CoolCode metrics script is deliberately omitted in this repository's builder. Source/report links contain only the application ID. Notice URLs appear as non-clickable text. No cookies, localStorage, sessionStorage or service worker. The parser limits input to 250,000 characters. It handles common labels and simple XML text; it does not decode binary/PDF/image inputs, encoded email MIME parts or attachments. Negation detection is conservative, not natural-language understanding. English extraction only; the cited statute also supplies French text.

## Expand or customize

Edit `web/model.mjs`: `FIELD_SPECS` defines field patterns; `decodeNotice()` defines review flags; `REFERENCES` and `REVIEWED` contain source links and the date of actual human review. Add a fixture and test any new wording, including negated/educational examples. Do not advance the review date from a build or automated availability check. No API key or refresh collector is required. Revisit references when law or ISED guidance changes.

## Build and publish

```sh
node --test tests/*.test.mjs
python3 -m unittest discover -s tests -v
python3 scripts/build.py
```

GitHub Actions checks the app in Chromium and publishes `dist/` to GitHub Pages from `main`. PRs only validate. Never commit `dist/`. The hub catalogue record is `tool.json`. No scheduled collector, watchdog freshness target or VPS service is needed.
