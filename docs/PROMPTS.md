# SpendLens — AI Prompts

This document records all prompts used in the application and their rationale.

---

## 1. Audit Summary Prompt

**File:** `backend/services/geminiService.js` → `buildPrompt()`
**Model:** Groq `llama-3.1-8b-instant` (or Gemini 2.0 Flash)
**Trigger:** Every `POST /api/audits` call

### Prompt

```
You are a financial advisor specialising in AI tooling costs. Write a professional, 
personalised audit summary in EXACTLY 100 words (±5 words). Be specific, honest, 
and actionable. Do NOT use markdown, bullet points, or headers — plain paragraph only.

AUDIT DATA:
- Team: {teamSize} people, primary use case: {primaryUseCase}
- Total monthly AI spend: ${totalMonthlySpend}
- Potential monthly savings: ${potentialMonthlySavings}
- Potential annual savings: ${potentialAnnualSavings}
- Waste score: {wasteScore}/100 (100 = perfect, lower = more waste)
- Total findings: {totalFindings} ({criticalCount} critical, {highCount} high)
- Verdict: {mood}

TOP FINDINGS:
- {finding1.title} (save ${finding1.monthlySavings}/mo)
- {finding2.title} (save ${finding2.monthlySavings}/mo)
- {finding3.title} (save ${finding3.monthlySavings}/mo)

Write the summary now:
```

### Design decisions

- **100-word limit** — fits in the email template and sidebar without truncation
- **Plain paragraph** — prevents markdown symbols appearing in email HTML
- **Top 3 findings only** — keeps the prompt under token limits and stays focused
- **"Write the summary now:"** — imperative ending reduces preamble in the response
- **Timeout of 10 seconds** — prevents slow AI from blocking the API response

### Fallback summary

When AI is unavailable (key missing, quota exceeded, timeout), a rule-based fallback is generated in `buildFallbackSummary()` using the same data. It produces grammatically correct English without any AI.

---

## 2. Email Subject Line (Generated)

**File:** `backend/services/emailService.js`
**Not AI-generated** — computed from audit data:

```js
`Your AI Spend Audit — ${formatCurrency(metrics.potentialAnnualSavings)} potential savings found`
```

**Rationale:** Specific dollar amount in subject line improves open rates and sets accurate expectations.

---

## Prompt Improvement Notes

If the AI summary quality is poor, try these adjustments in `buildPrompt()`:

1. **More specific output format:**
   ```
   Start with: "Your [teamSize]-person team is spending..."
   End with: "We recommend starting with [top finding]."
   ```

2. **Stronger word count enforcement:**
   ```
   CRITICAL: Your response must be between 95 and 105 words. Count carefully.
   ```

3. **Anti-hallucination instruction:**
   ```
   Only reference the data provided above. Do not invent tool names, 
   prices, or findings not listed here.
   ```
