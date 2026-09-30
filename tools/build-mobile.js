// 모바일 읽기 모드(m.html)용 장면 자료 생성: node tools/build-mobile.js
// assets/topics.json 의 장면 이름·자막 + SIFT-MS·굴뚝 시료 영상 안의 장면 자막 + 음성 대본을 모아
// assets/mobile-scenes.js 로 쓴다. 장면 이미지는 assets/thumbs/<id>-<장면>.jpg, 음성은 assets/voice/<id>-<장면>.mp3.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const topics = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'topics.json'), 'utf8'));
const voice = JSON.parse(fs.readFileSync(path.join(__dirname, 'voice-script.json'), 'utf8'));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
function fromSift() { const h = read('sift-ms.html'); return {names: JSON.parse(h.match(/const NAMES=(\[[^\]]*\])/)[1].replace(/'/g, '"')), captions: JSON.parse(h.match(/const (?:SUBS|TEXTS)=(\[[^\]]*\])/)[1])} }
function fromStack() { const h = read('stack.html'), names = [], captions = []; for (const m of h.matchAll(/name:'([^']*)', text:"([^"]*)"/g)) { names.push(m[1]); captions.push(m[2]) } return {names, captions} }
const out = {};
for (const t of topics) {
  let s = {names: t.names, captions: t.captions};
  if (t.id === 'sift-ms') s = fromSift(); else if (t.id === 'stack') s = fromStack();
  const n = s.names.length;
  out[t.id] = {names: s.names, captions: s.captions.slice(0, n),
    voice: Array.from({length: n}, (_, i) => fs.existsSync(path.join(root, 'assets', 'voice', `${t.id}-${i + 1}.mp3`)) ? `assets/voice/${t.id}-${i + 1}.mp3` : null),
    thumbs: Array.from({length: n}, (_, i) => fs.existsSync(path.join(root, 'assets', 'thumbs', `${t.id}-${i + 1}.jpg`)) ? `assets/thumbs/${t.id}-${i + 1}.jpg` : null),
    lines: (voice[t.id] && voice[t.id].lines) || []};
  if (out[t.id].captions.length !== n) throw new Error('caption count ' + t.id);
}
fs.writeFileSync(path.join(root, 'assets', 'mobile-scenes.js'), 'window.MAMO_SCENES=' + JSON.stringify(out) + ';\n');
console.log('mobile scenes', Object.keys(out).length);
