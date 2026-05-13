# SpendLens — AI Spend Audit SaaS

A production-quality frontend for auditing AI tool spending across engineering teams. Built for the Credex internship assignment.

---

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Framework | React 18 + Vite                   |
| Routing   | React Router DOM v6               |
| Styling   | Tailwind CSS v3                   |
| Icons     | Lucide React                      |
| State     | useState + localStorage           |
| Backend   | _Coming soon (Express + MongoDB)_ |

---

## Folder Structure

```
src/
├── components/
│   ├── ui/               # Reusable primitives
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Badge.jsx
│   │   └── Tooltip.jsx
│   ├── layout/           # App shell
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── landing/          # Landing page sections
│   │   ├── HeroSection.jsx
│   │   ├── StatsBar.jsx
│   │   ├── HowItWorksSection.jsx
│   │   ├── TestimonialsSection.jsx
│   │   └── CTASection.jsx
│   └── form/             # Audit form components
│       ├── ToolCard.jsx
│       ├── SpendSummary.jsx
│       └── FormProgress.jsx
├── pages/
│   ├── LandingPage.jsx
│   └── AuditPage.jsx
├── hooks/
│   └── useAuditForm.js   # Form state + localStorage
├── constants/
│   └── index.js          # Tools, use cases, copy
├── utils/
│   └── index.js          # formatCurrency, debounce, etc.
└── styles/
    └── globals.css       # Tailwind + custom CSS layers
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Features

### Landing Page

- **Dynamic tool entries** — Add/remove/duplicate AI tools
- **8 supported tools** — Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf
- **Per-tool fields** — Name, plan, monthly spend, seats; cost-per-seat auto-calculated
- **Team context** — Team size + primary use case
- **Live sidebar** — Real-time spend totals, per-employee cost, breakdown bar chart
- **Progress tracker** — 3-step completion indicator
- **localStorage persistence** — Auto-saves with 500ms debounce; survives page refresh
- **Collapsible cards** — Minimize filled cards to reduce clutter
- **Form reset** — With confirmation guard
- **Success state** — Summary screen after submission

### Design System

