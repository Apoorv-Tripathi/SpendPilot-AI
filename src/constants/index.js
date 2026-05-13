export const AI_TOOLS = [
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '⌘',
    color: '#7C6FF7',
    plans: ['Free', 'Pro ($20/mo)', 'Business ($40/seat/mo)', 'Enterprise'],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '◎',
    color: '#6E40C9',
    plans: ['Individual ($10/mo)', 'Business ($19/seat/mo)', 'Enterprise ($39/seat/mo)'],
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '◆',
    color: '#D4774A',
    plans: ['Free', 'Pro ($20/mo)', 'Team ($30/seat/mo)', 'Enterprise'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '◉',
    color: '#10A37F',
    plans: ['Free', 'Plus ($20/mo)', 'Team ($30/seat/mo)', 'Enterprise'],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    icon: '∷',
    color: '#D4774A',
    plans: ['Pay-as-you-go', 'Committed Usage'],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    icon: '⬡',
    color: '#10A37F',
    plans: ['Pay-as-you-go', 'Committed Usage'],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✦',
    color: '#4285F4',
    plans: ['Free', 'Advanced ($20/mo)', 'Workspace', 'API Pay-as-you-go'],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: '⟡',
    color: '#00C4FF',
    plans: ['Free', 'Pro ($15/mo)', 'Teams ($30/seat/mo)', 'Enterprise'],
  },
]

export const USE_CASES = [
  { value: 'coding', label: 'Coding & Development' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'research', label: 'Research & Analysis' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'mixed', label: 'Mixed / Multiple' },
]

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Log Your AI Tools',
    description: 'Add every AI subscription your team uses — from coding assistants to LLM APIs. Capture plans, seats, and monthly spend.',
    icon: 'ClipboardList',
  },
  {
    step: '02',
    title: 'Instant Cost Breakdown',
    description: 'See your total AI spend visualized by tool, team size, and cost-per-seat. Identify which tools are carrying their weight.',
    icon: 'BarChart3',
  },
  {
    step: '03',
    title: 'Get Optimization Insights',
    description: 'Receive actionable recommendations to cut waste, consolidate redundant tools, and negotiate better enterprise pricing.',
    icon: 'Zap',
  },
]

export const STATS = [
  { value: '$340K+', label: 'Average annual AI waste found per team' },
  { value: '3.2×', label: 'Average tool consolidation ratio' },
  { value: '14 min', label: 'Time to complete your first audit' },
  { value: '94%', label: 'Teams find at least one redundant tool' },
]

export const TESTIMONIALS = [
  {
    quote: "We were paying for 6 different AI tools with overlapping capabilities. SpendLens found $8,400/month in waste in under 20 minutes.",
    name: "Priya Sharma",
    role: "CTO, FinScale",
    avatar: "PS",
  },
  {
    quote: "Finally a tool that talks to engineers, not just procurement. The per-seat breakdown was exactly what I needed to justify consolidating to one platform.",
    name: "Marcus Chen",
    role: "Eng Lead, Luma Labs",
    avatar: "MC",
  },
  {
    quote: "Our AI bill went from opaque to crystal clear. Negotiated 40% off our enterprise contract with the data SpendLens surfaced.",
    name: "Ananya Rao",
    role: "Head of Ops, Credex",
    avatar: "AR",
  },
]
