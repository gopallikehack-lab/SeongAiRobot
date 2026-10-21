// Storage: Upstash Redis REST (or Vercel KV) with automatic in-memory fallback.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOK = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const mem = global.__mem || (global.__mem = new Map());
const live = () => !!(URL_ && TOK);

async function cmd(args) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function mget(k) {
  const e = mem.get(k);
  if (!e) return null;
  if (e.exp && e.exp < Date.now()) { mem.delete(k); return null; }
  return e.v;
}

module.exports = {
  live,
  async getJSON(k) {
    try {
      if (!live()) return mget(k);
      const v = await cmd(['GET', k]);
      return v ? JSON.parse(v) : null;
    } catch (_) {
      return mget(k);
    }
  },
  async setJSON(k, v, ttl) {
    mem.set(k, { v, exp: ttl ? Date.now() + ttl * 1000 : 0 });
    if (live()) {
      try { await cmd(ttl ? ['SET', k, JSON.stringify(v), 'EX', ttl] : ['SET', k, JSON.stringify(v)]); } catch (_) {}
    }
  },
  // returns true if the key was newly set (lock acquired / not a duplicate)
  async setNX(k, ttl) {
    if (live()) {
      try { return (await cmd(['SET', k, '1', 'NX', 'EX', ttl])) === 'OK'; } catch (_) {}
    }
    if (mget(k)) return false;
    mem.set(k, { v: 1, exp: Date.now() + ttl * 1000 });
    return true;
  },
  async del(k) {
    mem.delete(k);
    if (live()) { try { await cmd(['DEL', k]); } catch (_) {} }
  },
  async sadd(k, m) {
    if (live()) { try { return await cmd(['SADD', k, String(m)]); } catch (_) {} }
    const s = new Set(mget(k) || []);
    s.add(String(m));
    mem.set(k, { v: [...s], exp: 0 });
    return s.size;
  },
  async scard(k) {
    if (live()) { try { return await cmd(['SCARD', k]); } catch (_) {} }
    return (mget(k) || []).length;
  },
};
