// 기존 두 영상(SIFT-MS, 굴뚝 시료)에 음성 해설을 붙인다: node tools/patch-originals.js
// tools/cine/shell/<id>.html(패치 전 사본) → 루트 <id>.html
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const voice = fs.readFileSync(path.join(__dirname, 'cine', 'voice.js'), 'utf8');
const CSS = '<style>.play.voice{background:transparent;color:inherit;border:1px solid currentColor;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}.play.voice.on{box-shadow:inset 0 0 0 1px currentColor}.play.voice[hidden]{display:none}</style>';
const JOBS = {'sift-ms': 'S[sceneAt(T)]+.6', stack: 'SCN[sceneAt(T)].t+.001'};
const clips = id => { const out = []; for (let i = 1; ; i++) { const f = path.join(root, 'assets', 'voice', `${id}-${i}.mp3`); if (!fs.existsSync(f)) break; out.push('data:audio/mpeg;base64,' + fs.readFileSync(f).toString('base64')) } return out };
const must = (html, find, repl) => { if (!html.includes(find)) throw new Error('patch point missing: ' + find.slice(0, 60)); return html.replace(find, repl) };
for (const [id, restart] of Object.entries(JOBS)) {
  let h = fs.readFileSync(path.join(__dirname, 'cine', 'shell', `${id}.html`), 'utf8');
  h = must(h, '<button class="play" id="play" type="button">일시정지</button>', '<button class="play" id="play" type="button">일시정지</button><button class="play voice" id="voice" type="button" aria-pressed="false">음성 해설 듣기</button>');
  h = must(h, '</head>', CSS + '</head>');
  const at = h.lastIndexOf('<script>', h.indexOf('const reduce=matchMedia'));
  h = h.slice(0, at) + `<script>window.MAMO_CLIPS=${JSON.stringify(clips(id))};</script><script>${voice}</script>` + h.slice(at);
  h = must(h, "playEl.onclick=()=>{playing=!playing;playEl.textContent=playing?'일시정지':'재생';};",
    `const V=window.MAMO_VOICE.init({button:document.getElementById('voice'),clips:window.MAMO_CLIPS||[],id:'${id}',onEnable:()=>{T=${restart};if(!playing){playing=true;playEl.textContent='일시정지'}cur=-1}});\nplayEl.onclick=()=>{playing=!playing;playEl.textContent=playing?'일시정지':'재생';if(!playing)V.stop()};`);
  h = must(h, 'function setCaption(i){if(i===cur)return;cur=i;', 'function setCaption(i){if(i===cur)return;cur=i;if(playing)V.scene(i);');
  fs.writeFileSync(path.join(root, `${id}.html`), h);
  console.log('patched', id, (h.length / 1024).toFixed(0) + 'KB');
}
