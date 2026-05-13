# SpendLens — Reflection

## What Went Well

### Local-first architecture
The decision to run the audit engine entirely in the browser was the best architectural call in the project. Results are instant, the app works offline, and backend failures are invisible to users. This pattern — compute locally, sync to backend — should be the default for any tool that doesn't strictly require server-side computation.

### Rule-based engine over AI
Using hardcoded business rules instead of AI for the audit logic resulted in a system that is transparent, testable, deterministic, and honest. Every recommendation has explicit reasoning. This is more trustworthy for a financial tool than a black-box AI that might hallucinate savings.

### Modular rule system
Each audit rule is an independent function that can be read, tested, and modified without understanding the rest of the engine. Adding a new rule took literally two steps: write the function, add it to the registry. This proved its value when iterating on rule logic.

### Design system discipline
Using Tailwind CSS layers (base/components/utilities) with custom CSS variables kept the codebase clean. The `card-glass`, `btn-primary`, `input-field` abstractions meant consistent styling without repetition or drift.

---

## What Was Challenging

### Gemini API quota
The free tier for Gemini 2.0 Flash had a 0-request quota on first access, which was confusing. The fallback system meant this wasn't user-facing, but debugging it cost time. Lesson: always build the fallback before testing the primary AI path.

### ESM + Jest
Running Jest with native ES modules required `--experimental-vm-modules` and a Babel config. The interplay between Vite's ESM build and Jest's CommonJS transform took iteration to get right.

### Keeping backend save non-blocking
The temptation was to `await api.saveAudit()` before navigating to results. Resisting that and making it fire-and-forget required careful state management — merging the backend response (publicId, aiSummary) back into already-displayed local state.

---

## What I Would Do Differently

### PDF export
`window.print()` is a workaround. A proper PDF export using Puppeteer on the backend (or a service like html-pdf-node) would produce a more professional shareable artifact.

### Rate limit by user session, not just IP
The current rate limiter is IP-based. Behind shared NAT or VPNs, this can unfairly block legitimate users. A session token or fingerprint-based limiter would be more accurate.

### More granular test coverage
The 65 tests cover engine logic well but there are no component tests (React) or API integration tests (supertest). For a production system I'd add both. Specifically, the `LeadCaptureForm` submit flow and the `SharedAuditPage` data loading deserve tests.

### Pricing update automation
The pricing database is manually maintained. A weekly script that scrapes pricing pages (or uses a structured data source) and diffs against `auditKnowledge.js` would keep data fresh without manual intervention.

---

## Product Observations

### The "redundant tools" finding resonates most
In testing, users immediately recognized the redundant coding assistants finding. Many teams genuinely do pay for both Cursor and GitHub Copilot without realizing the overlap. This is the highest-signal recommendation.

### The waste score needs calibration
A team with one well-priced tool gets a high waste score even though there's nothing to optimize. The score should probably only be calculated when there's meaningful spend to analyze (>$100/mo).

### Email open rates would be the key metric
The lead capture → email flow is the main conversion funnel. Subject line personalization (actual dollar amount) should drive open rates. A/B testing the subject line format would be the first growth experiment to run.
