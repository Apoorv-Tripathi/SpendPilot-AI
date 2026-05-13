/**
 * auditKnowledge.js
 * ─────────────────────────────────────────────────────────────────────────────
 * The ground-truth pricing and capability database for every supported tool.
 * All numbers are monthly USD as of mid-2025.
 *
 * ARCHITECTURE NOTE:
 *   This file is intentionally separate from constants/index.js (which drives UI).
 *   The engine needs richer, more opinionated data than the UI needs.
 *   When prices change, update ONLY this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} PlanSpec
 * @property {string}   id            - Machine-readable plan key
 * @property {string}   label         - Human-readable label
 * @property {number}   pricePerSeat  - USD / seat / month (0 = free)
 * @property {number}   minSeats      - Minimum seats required (1 = single-user)
 * @property {number|null} maxSeats   - Upper limit before next tier; null = unlimited
 * @property {string[]} capabilities  - What this plan can do
 * @property {boolean}  isEnterprise  - True → custom pricing, not directly comparable
 */

/**
 * @typedef {Object} ToolSpec
 * @property {string}     id            - Matches form toolName
 * @property {string}     name          - Display name
 * @property {string}     category      - 'coding' | 'chat' | 'api' | 'writing'
 * @property {string[]}   bestFor       - Use-case affinities
 * @property {string[]}   overlaps      - Tool IDs that do similar things
 * @property {PlanSpec[]} plans         - Ordered from cheapest → most expensive
 */

/** @type {Record<string, ToolSpec>} */
export const TOOL_KNOWLEDGE = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding',
    bestFor: ['coding'],
    overlaps: ['github-copilot', 'windsurf'],
    plans: [
      { id: 'free',       label: 'Free',       pricePerSeat: 0,   minSeats: 1, maxSeats: 1,    capabilities: ['basic autocomplete', '200 completions/month'] },
      { id: 'pro',        label: 'Pro',         pricePerSeat: 20,  minSeats: 1, maxSeats: null, capabilities: ['unlimited completions', 'Claude & GPT-4 access', 'codebase context'] },
      { id: 'business',   label: 'Business',    pricePerSeat: 40,  minSeats: 2, maxSeats: null, capabilities: ['everything in Pro', 'centralized billing', 'admin controls', 'SSO'] },
      { id: 'enterprise', label: 'Enterprise',  pricePerSeat: null, minSeats: 50, maxSeats: null, isEnterprise: true, capabilities: ['custom deployment', 'dedicated support'] },
    ],
  },

  'github-copilot': {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'coding',
    bestFor: ['coding'],
    overlaps: ['cursor', 'windsurf'],
    plans: [
      { id: 'individual', label: 'Individual', pricePerSeat: 10,  minSeats: 1, maxSeats: 1,    capabilities: ['autocomplete', 'chat in IDE', 'basic models'] },
      { id: 'business',   label: 'Business',   pricePerSeat: 19,  minSeats: 1, maxSeats: null, capabilities: ['everything Individual', 'org policy controls', 'audit logs'] },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 39,  minSeats: 1, maxSeats: null, capabilities: ['everything Business', 'fine-tuning', 'codebase indexing'] },
    ],
  },

  claude: {
    id: 'claude',
    name: 'Claude',
    category: 'chat',
    bestFor: ['writing', 'research', 'coding', 'mixed'],
    overlaps: ['chatgpt', 'gemini'],
    plans: [
      { id: 'free',       label: 'Free',      pricePerSeat: 0,   minSeats: 1, maxSeats: 1,    capabilities: ['limited messages', 'Claude 3.5 Haiku'] },
      { id: 'pro',        label: 'Pro',        pricePerSeat: 20,  minSeats: 1, maxSeats: 1,    capabilities: ['5× more usage', 'Claude 3.5 Sonnet & Opus', 'Projects'] },
      { id: 'team',       label: 'Team',       pricePerSeat: 30,  minSeats: 1, maxSeats: null, capabilities: ['everything Pro', 'centralized billing', 'higher rate limits'] },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: null, minSeats: 1, maxSeats: null, isEnterprise: true, capabilities: ['custom context windows', 'SSO', 'admin controls'] },
    ],
  },

  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'chat',
    bestFor: ['writing', 'research', 'mixed', 'data'],
    overlaps: ['claude', 'gemini'],
    plans: [
      { id: 'free',       label: 'Free',       pricePerSeat: 0,   minSeats: 1, maxSeats: 1,    capabilities: ['GPT-4o mini', 'limited GPT-4o'] },
      { id: 'plus',       label: 'Plus',        pricePerSeat: 20,  minSeats: 1, maxSeats: 1,    capabilities: ['GPT-4o', 'DALL·E 3', 'code interpreter', 'plugins'] },
      { id: 'team',       label: 'Team',        pricePerSeat: 30,  minSeats: 2, maxSeats: null, capabilities: ['everything Plus', 'admin console', 'workspace', 'no data training'] },
      { id: 'enterprise', label: 'Enterprise',  pricePerSeat: null, minSeats: 1, maxSeats: null, isEnterprise: true, capabilities: ['unlimited GPT-4', 'SSO', 'advanced admin'] },
    ],
  },

  'anthropic-api': {
    id: 'anthropic-api',
    name: 'Anthropic API',
    category: 'api',
    bestFor: ['coding', 'data', 'research', 'mixed'],
    overlaps: ['openai-api'],
    plans: [
      { id: 'payg',      label: 'Pay-as-you-go',  pricePerSeat: 0,   minSeats: 1, maxSeats: null, capabilities: ['per-token billing', 'all Claude models'] },
      { id: 'committed', label: 'Committed Usage', pricePerSeat: 0,   minSeats: 1, maxSeats: null, capabilities: ['volume discounts (up to 30%)', 'priority rate limits'] },
    ],
    // API-specific thresholds (monthly USD)
    apiThresholds: {
      lowUsage: 50,       // Below this → consider a chat plan instead
      committedMin: 5000, // Above this → committed usage makes sense
    },
  },

  'openai-api': {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'api',
    bestFor: ['coding', 'data', 'research', 'mixed'],
    overlaps: ['anthropic-api'],
    plans: [
      { id: 'payg',      label: 'Pay-as-you-go',  pricePerSeat: 0, minSeats: 1, maxSeats: null, capabilities: ['per-token billing', 'all GPT models', 'DALL·E', 'Whisper'] },
      { id: 'committed', label: 'Committed Usage', pricePerSeat: 0, minSeats: 1, maxSeats: null, capabilities: ['volume discounts', 'higher rate limits'] },
    ],
    apiThresholds: {
      lowUsage: 50,
      committedMin: 5000,
    },
  },

  gemini: {
    id: 'gemini',
    name: 'Gemini',
    category: 'chat',
    bestFor: ['research', 'writing', 'data', 'mixed'],
    overlaps: ['chatgpt', 'claude'],
    plans: [
      { id: 'free',      label: 'Free',              pricePerSeat: 0,  minSeats: 1, maxSeats: 1,    capabilities: ['Gemini 1.5 Flash', 'basic features'] },
      { id: 'advanced',  label: 'Advanced',           pricePerSeat: 20, minSeats: 1, maxSeats: 1,    capabilities: ['Gemini Ultra', 'Google One 2TB', 'priority access'] },
      { id: 'workspace', label: 'Workspace Add-on',   pricePerSeat: 30, minSeats: 1, maxSeats: null, capabilities: ['Gemini in Docs/Sheets/Slides', 'Meet AI', 'admin controls'] },
      { id: 'api-payg',  label: 'API Pay-as-you-go',  pricePerSeat: 0,  minSeats: 1, maxSeats: null, capabilities: ['per-token billing', 'all Gemini models'] },
    ],
  },

  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'coding',
    bestFor: ['coding'],
    overlaps: ['cursor', 'github-copilot'],
    plans: [
      { id: 'free',       label: 'Free',       pricePerSeat: 0,  minSeats: 1, maxSeats: 1,    capabilities: ['5 user prompt credits/day', 'basic completions'] },
      { id: 'pro',        label: 'Pro',         pricePerSeat: 15, minSeats: 1, maxSeats: 1,    capabilities: ['unlimited completions', 'all AI models', 'cascade agent'] },
      { id: 'teams',      label: 'Teams',       pricePerSeat: 30, minSeats: 2, maxSeats: null, capabilities: ['everything Pro', 'team management', 'centralized billing'] },
      { id: 'enterprise', label: 'Enterprise',  pricePerSeat: null, minSeats: 25, maxSeats: null, isEnterprise: true, capabilities: ['custom deployment', 'SSO'] },
    ],
  },
}

/**
 * Redundancy groups: tools within the same group compete directly.
 * Having 2+ tools from the same group is a strong waste signal.
 */
export const REDUNDANCY_GROUPS = [
  {
    id: 'coding-assistants',
    label: 'AI Coding Assistants',
    tools: ['cursor', 'github-copilot', 'windsurf'],
    note: 'These tools all provide AI-assisted coding. Most teams only need one.',
  },
  {
    id: 'chat-assistants',
    label: 'General AI Chat',
    tools: ['claude', 'chatgpt', 'gemini'],
    note: 'These are general-purpose AI assistants with significant feature overlap.',
  },
  {
    id: 'llm-apis',
    label: 'LLM APIs',
    tools: ['anthropic-api', 'openai-api'],
    note: 'Running both APIs is common for experimentation, but production workloads usually standardize on one.',
  },
]

/**
 * Use-case affinity scores per tool category.
 * 1 = perfect fit, 0 = poor fit.
 */
export const USE_CASE_AFFINITY = {
  coding: {
    'coding-assistants': 1.0,
    'chat-assistants':   0.4,
    'api':               0.8,
  },
  writing: {
    'coding-assistants': 0.1,
    'chat-assistants':   1.0,
    'api':               0.5,
  },
  research: {
    'coding-assistants': 0.1,
    'chat-assistants':   0.9,
    'api':               0.6,
  },
  data: {
    'coding-assistants': 0.5,
    'chat-assistants':   0.6,
    'api':               1.0,
  },
  mixed: {
    'coding-assistants': 0.7,
    'chat-assistants':   0.8,
    'api':               0.7,
  },
}
