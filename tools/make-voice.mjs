// 장면별 음성 해설 MP3 생성기.
// 사용법: npm i msedge-tts  →  node make-voice.mjs <프로젝트 폴더>
// tools/voice-script.json 의 대본을 Microsoft 한국어 신경망 음성(ko-KR-SunHiNeural)으로 합성해
// assets/voice/<id>-<장면번호>.mp3 로 저장한다. 장면 길이(max, 기본 5.6초)를 넘으면 말 속도를 올려 다시 만든다.
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";

const root = process.argv[2] || path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const script = JSON.parse(fs.readFileSync(path.join(root, "tools", "voice-script.json"), "utf8"));
const out = path.join(root, "assets", "voice");
fs.mkdirSync(out, { recursive: true });
const VOICE = "ko-KR-SunHiNeural";
const RATES = ["+8%", "+16%", "+24%", "+32%"];

async function synth(text, rate) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate });
  const chunks = [];
  await new Promise((res, rej) => { audioStream.on("data", d => chunks.push(d)); audioStream.on("close", res); audioStream.on("error", rej); });
  tts.close?.();
  return Buffer.concat(chunks);
}
const secs = b => b.length * 8 / 48000;

const report = {};
const only = process.argv[3];
for (const [id, def] of Object.entries(script)) {
  if (only && id !== only) continue;
  if (id.startsWith("_")) continue;
  report[id] = [];
  for (let i = 0; i < def.lines.length; i++) {
    const max = def.max?.[i] ?? 5.6;
    let buf, used;
    for (const r of RATES) { buf = await synth(def.lines[i], r); used = r; if (secs(buf) <= max) break; }
    fs.writeFileSync(path.join(out, `${id}-${i + 1}.mp3`), buf);
    report[id].push({ line: def.lines[i], rate: used, sec: +secs(buf).toFixed(2), max, fits: secs(buf) <= max });
    console.log(id, i + 1, used, secs(buf).toFixed(2), "/", max, secs(buf) <= max ? "ok" : "LONG");
  }
}
const rp = path.join(out, "report.json"), prev = fs.existsSync(rp) ? JSON.parse(fs.readFileSync(rp, "utf8")) : {};
fs.writeFileSync(rp, JSON.stringify({ ...prev, ...report }, null, 2));
