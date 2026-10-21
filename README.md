🤖 Seong AI Bot
Premium Telegram AI bot for Vercel. Routes messages through OpenRouter :free models with automatic fallback.
Owner: @SeongEra (Developer • Coder • AI Builder • Executor)
Features
4 modes (Reasoning / Writer / Fast / Code) + 🎯 Auto Smart routing, 12 models, automatic fallback + cooldown of failing models
Unicode thinking animation (spinner, progress bar, live model name)
Answers framed with ═════, math-italic unicode for normal text, code blocks untouched, **bold** rendered bold and whole-bold lines quoted
Every answer ends with response time, model, quick commands and owner credit
Chat memory (/new to reset), inline buttons, /help guide
🎁 Surprise system: welcome gifts, Daily Mystery Box (4 rarities), XP, levels, streaks, ⚡ God Mode
Duplicate-update protection, per-user lock, long-answer splitting, group support (mention or reply)
Deploy (5 steps)
BotFather → /newbot → copy the token.
OpenRouter → create an API key (openrouter.ai/keys).
Push this folder to a GitHub repo → Vercel → Add New Project → import it.
In Vercel → Settings → Environment Variables add everything from .env.example.
For memory that survives restarts add Upstash Redis from Vercel Marketplace (Storage tab) – it adds the env vars automatically.
Deploy, then open once: https://YOUR-APP.vercel.app/api/setup?key=YOUR_SETUP_KEY
You should see "ok": true. Open your bot and send /start.
Notes
Model IDs are exactly the ones you supplied. If an ID does not exist on OpenRouter it returns an error and is auto-skipped (10 min cooldown). Check the live list with /models and at openrouter.ai/models?q=free.
Free models have rate limits (OpenRouter documents a per-minute and per-day cap, higher once the account has bought some credits). For heavy traffic add several keys in OPENROUTER_API_KEYS.
Without Redis the bot still works, but memory/XP can reset when Vercel recycles the function.
Vercel Hobby allows up to 60s per request which this project uses (vercel.json).
