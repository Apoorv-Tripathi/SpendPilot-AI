# USER_INTERVIEWS.md — User Research

*Interviews conducted during early validation. Names anonymised to initials.*

---

## Interview 1 — Engineering Lead at a Series A Startup

**Participant:** R.K.
**Role:** VP Engineering
**Company stage:** Series A, 38 people, $4M ARR
**AI tools in use:** Cursor, ChatGPT Team, Claude Pro (personal), OpenAI API
**Interview length:** 22 minutes

### Direct Quotes

> *"I approved Cursor for the whole engineering team in January. By March I had no idea if anyone was actually using it. There's no usage dashboard that shows me per-seat activity."*

> *"Our OpenAI API bill went from $200 to $1,400 in six weeks and nobody could tell me why. Turns out one engineer was running embeddings jobs in a loop during testing and forgot to add a rate limit."*

> *"The problem isn't that we're spending money on AI — it's that I can't justify the spend to the CFO because I have no data. I need a one-pager I can show finance."*

### Most Surprising Insight

R.K. didn't actually want to cut spending — he wanted **evidence that the spending was justified**. The framing of "find waste" was slightly wrong. The real job-to-be-done was "help me defend my AI budget to finance."

### What Changed in the Product After This Interview

- Added the **waste score (0–100)** so healthy spend can be communicated positively, not just flagged
- Added **"Looks good" findings** for tools that are correctly priced — gives engineering leads something positive to show
- Changed the results headline copy from "waste detected" framing to include a "your spend looks healthy" variant

---

## Interview 2 — Founder of a 12-Person Product Agency

**Participant:** S.M.
**Role:** Co-founder & CEO
**Company stage:** Bootstrapped, 12 people, $1.2M ARR
**AI tools in use:** ChatGPT Plus (×8 seats), Gemini Advanced (×3), Midjourney, Claude Pro (×2)
**Interview length:** 18 minutes

### Direct Quotes

> *"We're paying for ChatGPT Team for the whole company but honestly, the designers only use Midjourney and the account managers barely open ChatGPT. It's a habit from 2023 that nobody cancelled."*

> *"I tried to audit this manually with a spreadsheet once. Took me two hours and I still wasn't sure I had everything. Half our tools are on personal cards that get expensed."*

> *"What I actually want to know is: if I had to pick ONE AI tool for the whole company, which one gives us the most coverage? That's the question nobody answers."*

### Most Surprising Insight

The **shadow IT problem** — tools on personal cards that get expensed — is much larger than expected. Many small companies have no central billing view. SpendLens can only audit what users manually enter, which means self-reporting bias is a real data quality issue.

### What Changed in the Product After This Interview

- Added the **"primary use case" field** to the form — helps the engine give use-case-specific recommendations (writing teams don't need Cursor)
- Added the **"misaligned tool" rule** — flags when a team's use case doesn't match the tools they're paying for
- Added a note in the form: *"Estimates are fine — you can include tools on personal expenses too"*

---

## Interview 3 — Head of Engineering at a Mid-Size SaaS Company

**Participant:** A.P.
**Role:** Head of Engineering
**Company stage:** Post-Series B, 110 people, $18M ARR
**AI tools in use:** GitHub Copilot Enterprise, Cursor Business, Claude Team, OpenAI API, Anthropic API
**Interview length:** 31 minutes

### Direct Quotes

> *"We're running Cursor and Copilot simultaneously for 60 engineers. I know that's redundant. But switching costs are real — half the team has muscle memory on Copilot and the other half swears by Cursor. Nobody wants to be the one to kill their tool."*

> *"We spend about $14,000 a month on AI tooling and I have no idea if that's high or low for a company our size. There's no benchmark. Am I being ripped off or is this normal?"*

> *"The Anthropic API bill is the one that surprises me every month. We use it for a customer-facing feature and the token costs scale weirdly. I've tried to model it and I can't predict next month within 30%."*

### Most Surprising Insight

At this scale, the blocker to cutting tools isn't budget — it's **internal politics and switching costs**. A.P. knew the redundancy existed and couldn't act on it. SpendLens needs to not just identify waste but provide **ammunition for internal conversations** — data that makes the case compelling enough to overcome inertia.

### What Changed in the Product After This Interview

- Made the **reasoning section** of each finding card more detailed — specifically written to be shared with skeptical colleagues, not just read by the person doing the audit
- Added the **"Duplicate this tool" button** in the form so larger teams can quickly log multiple seats of the same tool at different plan levels
- Added **annual savings prominently** everywhere — the monthly number feels small; $1,440/year feels worth a conversation
