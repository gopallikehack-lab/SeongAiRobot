// Seong AI Bot — configuration
const MODES = {
  reasoning: {
    icon: '🧠', name: 'Reasoning', desc: 'Deep thinking, maths, logic, analysis',
    models: [
      'nvidia/nemotron-3-ultra-550b-a55b:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    ],
  },
  writer: {
    icon: '✍️', name: 'Writer', desc: 'Essays, stories, emails, captions, translation',
    models: [
      'google/gemma-4-31b-it:free',
      'thinkingmachines/inkling:free',
      'xingchen-agi/xing4.0-29b-a4b:free',
    ],
  },
  fast: {
    icon: '⚡', name: 'Fast', desc: 'Instant short answers & quick chat',
    models: [
      'minimax/minimax-m3.1-flash:free',
      'nvidia/nemotron-3.5-lightning:free',
      'liquid/lfm-2.5-2.6b:free',
    ],
  },
  code: {
    icon: '💻', name: 'Code', desc: 'Programming, debugging, scripts, APIs',
    models: [
      'cohere/north-mini-code:free',
      'poolside/laguna-s-2.1:free',
      'recursive/flint-v1.0:free',
    ],
  },
};

// If every model of the chosen mode fails, these modes are tried next (in order)
const FALLBACK = {
  fast: ['writer', 'reasoning', 'code'],
  writer: ['fast', 'reasoning', 'code'],
  reasoning: ['writer', 'fast', 'code'],
  code: ['reasoning', 'writer', 'fast'],
};

const OWNER = {
  handle: '@SeongEra',
  roles: ['Developer', 'Coder', 'AI Builder', 'Executor'],
};

const BOT_NAME = 'Seong AI Bot';

module.exports = { MODES, FALLBACK, OWNER, BOT_NAME };
