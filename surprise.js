// 🎁 Surprise system: Daily Mystery Box, XP, levels, streaks and ⚡ GOD MODE

const RARITY = [
  { n: 'Common', w: 55, icon: '⚪', xp: 20 },
  { n: 'Rare', w: 28, icon: '🔵', xp: 50 },
  { n: 'Epic', w: 13, icon: '🟣', xp: 120 },
  { n: 'Legendary', w: 4, icon: '🟡', xp: 300 },
];

const GIFTS = {
  Common: [
    { t: 'Pro Tip', b: 'Start your question with a role: "Act as a senior Python developer and..." — answers get way sharper.' },
    { t: 'Pro Tip', b: 'Add "explain like I am 12" to any hard topic and get a crystal-clear breakdown.' },
    { t: 'Pro Tip', b: 'Use /mode code for programming and /mode reasoning for maths — each uses specialised models.' },
  ],
  Rare: [
    { t: 'Prompt Template', b: 'Act as [role]. Task: [what you want]. Context: [details]. Format: [bullets/table/steps]. Tone: [casual/pro].' },
    { t: 'Study Template', b: 'Teach me [topic] in 5 steps, give 3 examples, then quiz me with 5 questions.' },
    { t: 'Idea Template', b: 'Give me 10 unique ideas for [goal], rank them by effort vs impact, and pick the best one with a plan.' },
  ],
  Epic: [
    { t: 'Secret Mega Prompt', b: 'You are an expert in [field]. First ask me 3 clarifying questions. Then give a step-by-step plan, common mistakes to avoid, and a checklist I can copy.' },
    { t: 'Secret Debug Prompt', b: 'Here is my code and the error. 1) Explain the root cause. 2) Show the fixed code. 3) Explain why it works. 4) Give a test to confirm.' },
  ],
  Legendary: [
    { t: '⚡ GOD MODE Unlocked', b: 'Your NEXT question gets the max-power treatment: strongest reasoning models + ultra-detailed expert answer.' },
  ],
};

const TITLES = ['Newbie', 'Explorer', 'Thinker', 'Creator', 'Hacker', 'Architect', 'Legend', 'Mythic'];
const level = (xp) => Math.floor(Math.sqrt(xp / 40)) + 1;
const title = (xp) => TITLES[Math.min(TITLES.length - 1, level(xp) - 1)];
const today = () => new Date().toISOString().slice(0, 10);

function roll() {
  const total = RARITY.reduce((a, r) => a + r.w, 0);
  let x = Math.random() * total;
  for (const r of RARITY) { if ((x -= r.w) < 0) return r; }
  return RARITY[0];
}

function openBox(u) {
  const d = today();
  if (u.lastBox === d) return { already: true };
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  u.streak = u.lastBox === y ? (u.streak || 0) + 1 : 1;
  u.lastBox = d;
  let r = roll();
  if (u.streak >= 7 && r.n === 'Common') r = RARITY[1]; // streak bonus
  const gift = GIFTS[r.n][Math.floor(Math.random() * GIFTS[r.n].length)];
  const gain = r.xp + u.streak * 5;
  u.xp = (u.xp || 0) + gain;
  if (r.n === 'Legendary') {
    u.god = true;
    u.badges = u.badges || [];
    if (!u.badges.includes('👑 Legendary Finder')) u.badges.push('👑 Legendary Finder');
  }
  return { r, gift, gain, lucky: Math.floor(Math.random() * 99) + 1 };
}

module.exports = { openBox, level, title };
