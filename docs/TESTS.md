# SpendLens — Test Documentation

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage report
npm run test:coverage
```

## Test Suite Overview

**File:** `__tests__/auditEngine.test.js`
**Total tests:** 65
**Framework:** Jest with Babel (ESM support)

## Test Groups

### 1. `teamSizeBucket()` — 5 tests
Verifies team size categorisation: solo (1), small (2–5), medium (6–20), large (21–100), enterprise (101+).

### 2. `detectExcessSeats()` — 3 tests
Verifies seat overage detection: equal seats, excess seats, and fewer seats than team.

### 3. `detectOverpayment()` — 4 tests
Verifies billing anomaly detection with a 20% tolerance threshold for taxes/rounding.

### 4. `computeExpectedCost()` — 4 tests
Verifies plan cost calculation including enterprise (returns 0), null plan, paid plans, and minimum seat enforcement.

### 5. `costPerSeat()` — 3 tests
Verifies per-seat cost division including edge cases (0 seats, single seat).

### 6. `savingsSeverity()` — 5 tests
Verifies severity bucketing: critical (≥$500), high ($200–$499), medium ($50–$199), low ($1–$49), info ($0).

### 7. `resolvePlan()` — 5 tests
Verifies fuzzy plan label matching: Pro, Business, unknown tools, empty labels, case-insensitive matching.

### 8. `findRedundancies()` — 5 tests
Verifies redundancy group detection across coding assistants, chat assistants, multiple groups, and no-redundancy cases.

### 9. `runAudit()` — basic structure — 5 tests
Verifies the full audit report shape, teamSize normalisation, empty row filtering, empty tools graceful handling, and Date type.

### 10. `runAudit()` — metrics calculations — 6 tests
Verifies totalMonthlySpend, totalAnnualSpend (12×), perEmployeeCost, savings cap (80%), wasteScore range, and healthy team score.

### 11. `runAudit()` — verdict generation — 3 tests
Verifies $0 spend returns "good" mood, verdict has non-empty strings, and wasteful stacks return concerning/critical mood.

### 12. `runAudit()` — finding rules — 7 tests
Verifies: redundant coding assistants flagged, redundant chat assistants flagged, excess seats flagged, business plan on solo user flagged, no false positive on equal seats, findings sorted by severity, no duplicate IDs.

### 13. `groupFindingsByTool()` — 3 tests
Verifies Map return type, tool initialisation, per-tool routing, and global finding routing.

### 14. End-to-end: well-optimised team — 2 tests
A clean 5-person coding team with one correctly-priced Cursor Pro subscription produces no critical findings and a wasteScore ≥ 70.

### 15. End-to-end: maximally wasteful team — 4 tests
A 3-person team with 5 overlapping tools, enterprise plans, and 15 seats finds ≥3 findings, >$200/mo savings, concerning/critical verdict, and all findings have required fields.

## What Is NOT Tested Here

- React component rendering (would require jsdom + @testing-library/react)
- Backend API endpoints (would require supertest + MongoDB in-memory)
- Email delivery (Resend integration)
- AI summary generation (Gemini/Groq)

These are considered integration/e2e tests and are left for a future test suite.

## CI Integration

Tests run automatically on every push via GitHub Actions (`.github/workflows/ci.yml`). The pipeline fails if any test fails or the production build fails.
