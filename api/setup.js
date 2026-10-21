async function tg(method, body = {}) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.description || 'Telegram error');
  return j.result;
}


// Open once after deploying:  https://YOUR-APP.vercel.app/api/setup?key=YOUR_SETUP_KEY
module.exports = async (req, res) => {
  if (!process.env.SETUP_KEY || req.query.key !== process.env.SETUP_KEY) return res.status(401).send('Unauthorized');
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `https://${host}/api/webhook`;

    await tg('setWebhook', {
      url,
      secret_token: process.env.WEBHOOK_SECRET || undefined,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
      max_connections: 40,
    });

    await tg('setMyCommands', {
      commands: [
        { command: 'start', description: '🚀 Start the bot' },
        { command: 'mode', description: '🎛 Choose AI mode' },
        { command: 'surprise', description: '🎁 Daily mystery box' },
        { command: 'new', description: '🆕 New chat (clear memory)' },
        { command: 'profile', description: '📊 Level, XP & streak' },
        { command: 'models', description: '🧬 Model lineup' },
        { command: 'help', description: '📖 How to use' },
        { command: 'about', description: '👑 Owner info' },
      ],
    });
    await tg('setMyShortDescription', { short_description: '🤖 Premium free AI bot • 12 models • Daily surprises • by @SeongEra' });
    await tg('setMyDescription', {
      description:
        'Seong AI Bot — a premium free AI assistant.\n\n🧠 Reasoning • ✍️ Writer • ⚡ Fast • 💻 Code\n🎁 Daily surprises & God Mode\n\nOwner: @SeongEra (Developer • Coder • AI Builder • Executor)',
    });

    const info = await tg('getWebhookInfo');
    res.status(200).json({ ok: true, webhook: url, info });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
