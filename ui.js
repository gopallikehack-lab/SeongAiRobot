const { MODES, OWNER, BOT_NAME } = require('./config');
const { italic: I, esc } = require('./format');

const LINE = '═════════════════════';
const btn = (text, data) => ({ text, callback_data: data });

const modeKB = (cur) => ({
  inline_keyboard: [
    [btn((cur === 'reasoning' ? '✅ ' : '') + '🧠 Reasoning', 'mode:reasoning'), btn((cur === 'writer' ? '✅ ' : '') + '✍️ Writer', 'mode:writer')],
    [btn((cur === 'fast' ? '✅ ' : '') + '⚡ Fast', 'mode:fast'), btn((cur === 'code' ? '✅ ' : '') + '💻 Code', 'mode:code')],
    [btn((cur === 'auto' ? '✅ ' : '') + '🎯 Auto Smart', 'mode:auto')],
    [btn('🎁 Surprise', 'box'), btn('📖 Guide', 'help')],
  ],
});

const mainKB = () => ({
  inline_keyboard: [
    [btn('🎛 Modes', 'modes'), btn('🎁 Daily Surprise', 'box')],
    [btn('📊 Profile', 'me'), btn('🆕 New Chat', 'new')],
    [btn('📖 Guide', 'help'), btn('👑 Owner', 'about')],
  ],
});

const quickKB = () => ({
  inline_keyboard: [
    [btn('🆕 New Chat', 'new'), btn('🎛 Modes', 'modes')],
    [btn('🎁 Surprise', 'box'), btn('📖 Guide', 'help')],
  ],
});

const ownerLines = () =>
  `👑 ${I('Owner')}: <b>${OWNER.handle}</b>\n🛠 ${OWNER.roles.map(I).join(' • ')}`;

function footer(sec, modelName, modeKey) {
  return (
    `<b>${LINE}</b>\n` +
    `⏱ ${I('Response time')}: <b>${sec}s</b>\n` +
    `🧬 ${I('Model')}: <code>${esc(modelName)}</code> ${MODES[modeKey].icon}\n` +
    `💡 /mode • /new • /surprise • /help\n` +
    `<b>${LINE}</b>\n` +
    `${ownerLines()}\n🤖 ${I(BOT_NAME)}`
  );
}

const header = (god) => `<b>═════ 🤖 ${I('Seong AI')}${god ? ' ⚡ GOD MODE' : ''} ═════</b>\n\n`;
const contHeader = (i, n) => `<b>═════ ${I('continued')} ${i}/${n} ═════</b>\n\n`;

// ---------- ✨ Thinking animation (pure unicode) ----------
const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const ORB = ['◐', '◓', '◑', '◒'];
const SPARK = ['✦', '✧', '⋆', '˚', '✺', '✧', '⋆'];
const STAGES = [
  'Reading your message',
  'Waking up neural nets',
  'Routing to the best model',
  'Thinking deeply',
  'Polishing the answer',
  'Almost there',
];

function frame(n, st) {
  const el = (Date.now() - st.t0) / 1000;
  const pct = Math.min(97, Math.floor(100 * (1 - Math.exp(-el / 9))));
  const filled = Math.round(pct / 10);
  const bar = '▰'.repeat(filled) + '▱'.repeat(10 - filled);
  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(el / 3))];
  const sparks = Array.from({ length: 9 }, (_, i) => SPARK[(i + n) % SPARK.length]).join(' ');
  const model = st.model ? `\n🧬 ${esc(st.model)}` : '';
  return (
    `<b>═════ ✦ ${I('Seong AI')} ✦ ═════</b>\n` +
    `${SPIN[n % SPIN.length]} ${I('Thinking')}${'.'.repeat(n % 4)}\n` +
    `${ORB[n % ORB.length]} ${I(stage)}\n` +
    `${bar} <b>${pct}%</b>\n` +
    `⏱ ${el.toFixed(1)}s${model}\n` +
    `<b>${LINE}</b>\n${sparks}`
  );
}

// ---------- Texts ----------
function helpText() {
  return (
    `<b>${LINE}</b>\n📖 <b>${I('How to use Seong AI Bot')}</b>\n<b>${LINE}</b>\n\n` +
    `1️⃣ ${I('Just type any question or message — the bot answers instantly.')}\n` +
    `2️⃣ ${I('Pick a brain with')} /mode ${I('or let')} 🎯 ${I('Auto Smart choose the best one.')}\n` +
    `3️⃣ ${I('The bot remembers your chat. Use')} /new ${I('to start fresh.')}\n` +
    `4️⃣ ${I('Open your free')} 🎁 /surprise ${I('every day for XP, rare prompts and')} ⚡ ${I('God Mode.')}\n\n` +
    `<b>🎛 ${I('Modes')}</b>\n` +
    Object.values(MODES).map((m) => `${m.icon} <b>${m.name}</b> — ${I(m.desc)}`).join('\n') +
    `\n🎯 <b>Auto</b> — ${I('picks the best mode for your message')}\n\n` +
    `<b>⌨️ ${I('Commands')}</b>\n` +
    `/start • /help • /mode • /models\n/new • /surprise • /profile • /about\n/ask ${I('your question (useful in groups)')}\n\n` +
    `<b>🛡 ${I('Never stuck')}</b>\n${I('If one AI model is busy, the bot silently switches to the next one — you always get an answer.')}\n\n` +
    `<b>${LINE}</b>\n${ownerLines()}`
  );
}

function aboutText() {
  return (
    `<b>${LINE}</b>\n🤖 <b>${I(BOT_NAME)}</b>\n<b>${LINE}</b>\n\n` +
    `${I('A premium free AI assistant with 12 models, auto-fallback, daily surprises and a smooth experience.')}\n\n` +
    `👑 ${I('Owner')}: <b>${OWNER.handle}</b>\n` +
    OWNER.roles.map((r) => `   ◈ ${I(r)}`).join('\n') +
    `\n\n💬 ${I('Contact')}: ${OWNER.handle}`
  );
}

function modesText(cur) {
  const label = cur === 'auto' ? '🎯 Auto Smart' : `${MODES[cur].icon} ${MODES[cur].name}`;
  return (
    `<b>${LINE}</b>\n🎛 <b>${I('Choose your AI mode')}</b>\n<b>${LINE}</b>\n\n` +
    Object.values(MODES).map((m) => `${m.icon} <b>${m.name}</b> — ${I(m.desc)}`).join('\n') +
    `\n🎯 <b>Auto</b> — ${I('picks the best mode for you')}\n\n${I('Current')}: <b>${label}</b>`
  );
}

function modelsText(bad) {
  const now = Date.now();
  const short = (id) => id.split('/')[1].replace(':free', '');
  return (
    `<b>${LINE}</b>\n🧬 <b>${I('Model lineup (all free)')}</b>\n<b>${LINE}</b>\n\n` +
    Object.values(MODES)
      .map((m) => `${m.icon} <b>${m.name}</b>\n` + m.models.map((id) => `   ${(bad.get(id) || 0) > now ? '🔴' : '🟢'} <code>${esc(short(id))}</code>`).join('\n'))
      .join('\n\n') +
    `\n\n🟢 ${I('ready')}  🔴 ${I('resting, auto-skipped')}`
  );
}

function welcomeText(name, n, isNew) {
  const gift = isNew
    ? `\n\n🎁 <b>${I('Welcome gifts unlocked')}</b>\n   ◈ +100 XP\n   ◈ 🌱 ${I('Founding Member')} #${n}\n   ◈ ⚡ ${I('1x GOD MODE (your next question)')}`
    : '';
  return (
    `<b>${LINE}</b>\n🤖 <b>${I(BOT_NAME)}</b>\n<b>${LINE}</b>\n\n` +
    `${I('Hello')} <b>${esc(name)}</b> 👋\n${I('Ask me anything — code, maths, writing, ideas, studies. Free, fast and never stuck.')}${gift}\n\n` +
    `${I('Tap a button below or just send your question')} 👇\n\n${ownerLines()}`
  );
}

module.exports = { LINE, modeKB, mainKB, quickKB, footer, header, contHeader, frame, helpText, aboutText, modesText, modelsText, welcomeText, ownerLines };
