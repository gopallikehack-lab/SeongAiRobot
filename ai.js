const { MODES, FALLBACK } = require('./config');

const bad = global.__bad || (global.__bad = new Map()); // model -> cooldown-until
const keys = () =>
  (process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

// Smart auto-routing when the user is in "auto" mode
function pickMode(text) {
  const t = text.toLowerCase();
  if (/```|\b(code|function|bug|error|python|javascript|typescript|html|css|api|sql|script|compile|regex|java|c\+\+|react|node|django|flask|bot|github|json)\b/.test(t)) return 'code';
  if (/\b(solve|why|prove|calculate|math|equation|logic|analy[sz]e|step by step|compare|reason|explain|derive|probability)\b/.test(t)) return 'reasoning';
  if (/\b(write|essay|story|poem|email|letter|caption|post|rewrite|translate|blog|speech|paragraph|script for)\b/.test(t)) return 'writer';
  return t.length < 90 ? 'fast' : 'writer';
}

function plan(mode) {
  const order = [mode, ...(FALLBACK[mode] || [])];
  const list = [];
  for (const m of order) for (const id of MODES[m].models) list.push({ id, mode: m });
  const now = Date.now();
  const ok = list.filter((x) => !((bad.get(x.id) || 0) > now));
  return ok.length ? ok : list;
}

function cool(id, status, ms) {
  const d = ms || (status === 429 ? 90e3 : status === 404 || status === 400 ? 600e3 : status === 401 || status === 402 ? 300e3 : 120e3);
  bad.set(id, Date.now() + d);
}

async function ask({ messages, mode, onTry }) {
  const K = keys();
  if (!K.length) throw new Error('NO_KEY');
  const deadline = Date.now() + 52000;
  let n = 0;
  for (const c of plan(mode)) {
    const left = deadline - Date.now();
    if (left < 4000) break;
    if (onTry) onTry(c);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), Math.min(20000, left - 1000));
    try {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          Authorization: 'Bearer ' + K[n % K.length],
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'https://t.me/SeongEra',
          'X-Title': 'Seong AI Bot',
        },
        body: JSON.stringify({ model: c.id, messages, max_tokens: 1800, temperature: 0.7 }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) { cool(c.id, r.status); continue; }
      const text = String((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '')
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .trim();
      if (!text) { cool(c.id, 0, 60e3); continue; }
      return { text, model: c.id, mode: c.mode };
    } catch (_) {
      cool(c.id, 0, 120e3);
    } finally {
      clearTimeout(to);
      n++;
    }
  }
  throw new Error('ALL_FAILED');
}

module.exports = { ask, pickMode, bad };
