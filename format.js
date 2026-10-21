// Formatting helpers: Mathematical Italic unicode + Markdown -> Telegram HTML

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 𝐴𝐵𝐶 𝑎𝑏𝑐  (Mathematical Italic). 'h' is a special codepoint (ℎ).
function italic(s) {
  let out = '';
  for (const ch of String(s)) {
    const c = ch.codePointAt(0);
    if (c >= 65 && c <= 90) out += String.fromCodePoint(0x1d434 + c - 65);
    else if (c >= 97 && c <= 122) out += ch === 'h' ? '\u210e' : String.fromCodePoint(0x1d44e + c - 97);
    else out += ch;
  }
  return out;
}

// plain talking text -> escaped + math italic
const talk = (s) => esc(italic(s));

// inline: **bold**, `code`, urls
function inline(s) {
  const parts = s.split(/(\*\*[^*\n]+?\*\*|`[^`\n]+`|https?:\/\/[^\s<]+)/g);
  return parts
    .map((seg, i) => {
      if (!seg) return '';
      if (i % 2 === 0) return talk(seg.replace(/(?<!\*)\*(?!\*)/g, ''));
      if (seg.startsWith('**')) return `<b>${talk(seg.slice(2, -2))}</b>`;
      if (seg.startsWith('`')) return `<code>${esc(seg.slice(1, -1))}</code>`;
      return esc(seg); // url stays untouched
    })
    .join('');
}

function prose(text) {
  return text
    .split('\n')
    .map((line) => {
      let m;
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return '┈┈┈┈┈┈┈┈┈┈┈┈┈┈';
      if ((m = line.match(/^\s{0,3}#{1,6}\s+(.*)$/))) return `<blockquote><b>${talk(m[1].replace(/\*\*/g, ''))}</b></blockquote>`;
      if ((m = line.match(/^\s*\*\*([^*]+)\*\*\s*:?\s*$/))) return `<blockquote><b>${talk(m[1])}</b></blockquote>`; // whole line bold -> quote + bold
      if ((m = line.match(/^\s*>\s?(.*)$/))) return `<blockquote>${inline(m[1])}</blockquote>`;
      if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) return `◈ ${inline(m[1])}`;
      if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) return `<b>${m[1]}.</b> ${inline(m[2])}`;
      return inline(line);
    })
    .join('\n');
}

// full render: code blocks stay as code (NOT italic), everything else is math italic
function renderText(raw) {
  return raw
    .split(/(```[\s\S]*?```)/g)
    .map((p, i) => {
      if (i % 2 === 1) {
        const m = p.match(/^```([\w+#.-]*)\n?([\s\S]*?)```$/);
        const lang = m ? m[1] : '';
        const code = (m ? m[2] : p).replace(/\n$/, '');
        return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${esc(code)}</code></pre>`;
      }
      return prose(p);
    })
    .join('');
}

// split long answers safely (keeps ``` fences balanced)
function splitRaw(s, max = 1700) {
  const out = [];
  let cur = '';
  let fence = false;
  const flush = () => {
    if (!cur.trim()) { cur = ''; return; }
    out.push(fence ? cur + '\n```' : cur);
    cur = fence ? '```\n' : '';
  };
  for (const raw of s.split('\n')) {
    let line = raw;
    while (line.length > max) {
      if (cur.length) flush();
      cur += line.slice(0, max);
      line = line.slice(max);
      flush();
    }
    if (cur.length + line.length + 1 > max) flush();
    cur += (cur && !cur.endsWith('\n') ? '\n' : '') + line;
    if (/^\s*```/.test(line)) fence = !fence;
  }
  if (cur.trim()) out.push(cur);
  return out.length ? out : [''];
}

module.exports = { esc, italic, talk, renderText, splitRaw };
