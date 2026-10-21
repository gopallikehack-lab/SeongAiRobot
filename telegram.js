const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tg(method, body = {}) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.ok) {
    const e = new Error(j.description || 'Telegram error');
    e.code = j.error_code;
    e.retry = j.parameters && j.parameters.retry_after;
    throw e;
  }
  return j.result;
}

const strip = (h) =>
  h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

async function withRetry(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e.retry && e.retry <= 6) {
      await sleep(e.retry * 1000 + 200);
      return fn();
    }
    throw e;
  }
}

async function send(chat_id, text, extra = {}) {
  const body = { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra };
  return withRetry(async () => {
    try {
      return await tg('sendMessage', body);
    } catch (e) {
      if (/parse|entit/i.test(e.message)) return tg('sendMessage', { ...body, text: strip(text), parse_mode: undefined });
      throw e;
    }
  });
}

async function edit(chat_id, message_id, text, extra = {}) {
  const body = { chat_id, message_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra };
  try {
    return await tg('editMessageText', body);
  } catch (e) {
    if (/not modified/i.test(e.message)) return;
    if (/parse|entit/i.test(e.message)) {
      try { return await tg('editMessageText', { ...body, text: strip(text), parse_mode: undefined }); } catch (_) { return; }
    }
    throw e;
  }
}

module.exports = { tg, send, edit, sleep, withRetry };
