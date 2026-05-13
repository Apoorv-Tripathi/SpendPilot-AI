# SpendLens — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (React)                      │
│                                                         │
│  LandingPage → AuditPage → ResultsPage → SharedAudit   │
│                    │              │                      │
│           useAuditForm     useAuditReport               │
│                    │              │                      │
│              localStorage   sessionStorage              │
│                                  │                      │
│              auditEngine.js (local, instant)            │
└──────────────────────┬──────────────────────────────────┘
                       │ fetch (background, non-blocking)
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  EXPRESS BACKEND                         │
│                                                         │
│  POST /api/audits   → auditController → Audit model    │
│  POST /api/leads    → leadController  → Lead model     │
│  GET  /api/audits/:id → fetch by publicId              │
│  GET  /og/audit/:id   → OG meta HTML for crawlers      │
│                                                         │
│  Services: geminiService → Groq/Gemini AI              │
│            emailService  → Resend                      │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼────┐                 ┌────▼────┐
    │ MongoDB │                 │ Resend  │
    │ Atlas   │                 │ Email   │
    └─────────┘                 └─────────┘
```

## Key Design Principles

### 1. Local-first audit engine

The audit engine (`src/engine/`) runs entirely in the browser using pure JS with no network calls. Results appear instantly. The backend save is additive — if it fails, the user still sees their results.

### 2. Non-blocking backend operations

- `api.saveAudit()` is called without `await` after the local engine runs
- Email sending is fire-and-forget inside the lead controller
- AI summary generation races against a 10-second timeout with a fallback

### 3. Rule-based audit engine

```json
{
  "publicId": "xK3mN9pQ",       // short unique ID for sharing
  "context": {
    "teamSize": 10,
    "primaryUseCase": "coding",
    "teamBucket": "medium"
  },
  "tools": [{ "toolId": "cursor", "monthlySpend": 200, "seats": 10, "plan": "Pro" }],
  "findings": [{ "id": "...", "type": "redundancy", "severity": "high", ... }],
  "metrics": { "totalMonthlySpend": 200, "potentialMonthlySavings": 80, "wasteScore": 72 },
  "verdict": { "headline": "...", "mood": "good" },
  "aiSummary": { "text": "...", "isFallback": false, "model": "llama-3.1-8b-instant" },
  "leadId": ObjectId,
  "viewCount": 14,
  "createdAt": ISODate
}
```

### leads collection

