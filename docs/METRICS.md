# METRICS.md — Metrics & Measurement

## North Star Metric

**Audits completed with at least one actionable finding**

Why: A completed audit with a real finding means the user got value. It's the moment SpendLens proves its worth. Volume of visits, signups, or even email captures are all downstream of this moment.

Target: 500 meaningful audits in the first 60 days.

---

## 3 Input Metrics

**1. Audit start rate**
- Definition: % of landing page visitors who begin filling the form
- Target: > 30%
- If below 20%: headline or CTA copy isn't resonating

**2. Audit completion rate**
- Definition: % of started audits that reach the results page
- Target: > 70%
- If below 50%: form is too long or tool selection is confusing

**3. Email capture rate**
- Definition: % of results page viewers who submit their email
- Target: > 20%
- If below 10%: findings aren't compelling enough or CTA placement is wrong

---

## What to Track First

In the first 30 days, ignore everything except:

1. **Did they finish the audit?** — Yes/No per session
2. **Did they find a saving > $0?** — Signals engine quality
3. **Did they share the report?** — Organic distribution signal
4. **Did they enter their email?** — Revenue intent signal

Set up Plausible or Fathom (privacy-first, free tier) on day one. Don't touch Google Analytics — it's overkill and GDPR-annoying for early stage.

---

## Pivot Trigger Metric

**If audit completion rate drops below 40% for two consecutive weeks** — the form is broken, too long, or the value proposition isn't clear enough before asking for effort.

**If email capture rate stays below 8% after 200 audits** — findings aren't useful enough. The audit engine rules need more work, or the results UI isn't communicating savings clearly.

**If both are healthy but no one returns** — the product is a one-time tool, not a recurring one. That's the signal to build ongoing monitoring (weekly spend alerts, new tool detection) to create a reason to come back.
