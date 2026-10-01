// 시네마틱 애니메이션 11편 빌드: node tools/build-cine.js
// tools/cine/shell/<id>.html(페이지 틀) + engine.js + voice.js + topics/<id>.js + assets/voice/*.mp3
// → 루트의 <id>.html. 내려받은 단일 파일에서도 재생되도록 코드와 음성을 모두 파일 안에 넣는다.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), cine = path.join(__dirname, 'cine');
const topics = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'topics.json'), 'utf8'));
const ACCENT = {'sift-ms': '#3de0ff', emissions: '#ffb547', stack: '#5fe0b5', vehicles: '#a58bff'};
const IDS = ['seasonal', 'education', 'integrated', 'haps', 'quota', 'network', 'mobile-air', 'vehicles', 'fuel', 'road'];
const engine = fs.readFileSync(path.join(cine, 'engine.js'), 'utf8'), voice = fs.readFileSync(path.join(cine, 'voice.js'), 'utf8');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=IBM+Plex+Sans+KR:wght@400;500;700&family=JetBrains+Mono:wght@500;600;700&display=swap">';
const CSS = '#voice{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}#voice.on,#subtitles.on{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}#voice[hidden]{display:none}.stage{position:relative}.subtitle{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);width:max-content;max-width:calc(100% - 32px);padding:9px 16px;border-radius:9px;background:rgba(2,8,15,.88);border:1px solid rgba(224,241,250,.28);box-shadow:0 4px 22px rgba(0,0,0,.5);color:#fff;font-size:clamp(14px,1.7vw,20px);font-weight:700;line-height:1.45;text-align:center;word-break:keep-all;overflow-wrap:anywhere;text-shadow:0 2px 4px #000;pointer-events:none}.subtitle[hidden]{display:none!important}html .stage>.caption,html.embedded .stage>.caption{position:absolute!important;width:1px!important;height:1px!important;min-height:0!important;padding:0!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important}@media(max-width:640px){.subtitle{bottom:8px;max-width:calc(100% - 16px);padding:6px 9px;font-size:clamp(13px,3.7vw,17px)}}';
const TOTAL_CAPTION_CSS = '@media(max-width:640px){.subtitle{position:static;left:auto;bottom:auto;transform:none;width:100%;max-width:none;min-height:58px;margin:0;padding:10px 14px;border:0;border-top:1px solid rgba(224,241,250,.28);border-radius:0;box-shadow:none;background:#102738;font-size:14px;line-height:1.5}}';
const clips = id => { const out = []; for (let i = 1; ; i++) { const f = path.join(root, 'assets', 'voice', `${id}-${i}.mp3`); if (!fs.existsSync(f)) break; out.push('data:audio/mpeg;base64,' + fs.readFileSync(f).toString('base64')) } return out };
const only = process.argv[2];
for (const id of IDS) {
  if (only && only !== id) continue;
  let html = fs.readFileSync(path.join(cine, 'shell', `${id}.html`), 'utf8');
  const t = topics.find(x => x.id === id); if (!t) throw new Error('topic ' + id);
  const code = fs.readFileSync(path.join(cine, 'topics', `${id}.js`), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const story = JSON.parse(scripts[0][1].replace(/^\s*window\.STORY=/, '').replace(/;\s*$/, ''));
  const glyphs = [...new Set((code.match(/'[^'\n]*'/g) || []).join('').split('').filter(ch => ch.charCodeAt(0) > 127))].join('');
  Object.assign(story, {names: t.names, captions: t.captions, title: t.title, desc: t.desc, accent: ACCENT[t.dept] || story.accent, voice: clips(id), glyphs});
  const js2 = `${voice}\n${engine}\n${code}`;
  let k = 0;
  html = html.replace(/<script>([\s\S]*?)<\/script>/g, (m) => { k++; if (k === 1) return `<script>window.STORY=${JSON.stringify(story)};</script>`; if (k === 2) return `<script>${js2.replace(/<\/script/gi, '<\\/script')}</script>`; return m });
  html = html.replace(/:root\{--accent:[^;}]+/, `:root{--accent:${story.accent}`);
  if (!html.includes('fonts.googleapis.com')) html = html.replace('</title>', '</title>' + FONTS);
  if (!html.includes('#voice{')) html = html.replace('</style>', CSS + (t.dept === 'emissions' ? TOTAL_CAPTION_CSS : '') + '</style>');
  if (!html.includes('id="voice"')) html = html.replace('<button id="replay">처음부터</button>', '<button id="replay">처음부터</button><button id="voice" type="button" aria-pressed="false">음성 해설 듣기</button>');
  html = html.replace('</canvas><figcaption class="caption">', '</canvas><div class="subtitle" id="subtitle" aria-hidden="true"></div><figcaption class="caption">');
  html = html.replace('<button id="voice" type="button" aria-pressed="false">음성 해설 듣기</button>', '<button id="voice" type="button" aria-pressed="false">음성 해설 듣기</button><button id="subtitles" class="on" type="button" aria-pressed="true">자막 끄기</button>');
  html = html.replace('아래 자막으로 내용을 확인할 수 있습니다.', '화면 자막으로 내용을 확인할 수 있습니다.');
  html = html.replace('교육용 개념도 · 20초 반복 재생', '교육용 개념도 · 30초 반복 재생 · 음성: AI 합성').split('20초 애니메이션').join('30초 애니메이션').split('00:00 / 00:20').join('00:00 / 00:30');
  fs.writeFileSync(path.join(root, `${id}.html`), html);
  if(id === 'mobile-air') fs.writeFileSync(path.join(root, 'inventory.html'), html);
  console.log('built', id, (html.length / 1024).toFixed(0) + 'KB', 'voice', story.voice.length);
}
