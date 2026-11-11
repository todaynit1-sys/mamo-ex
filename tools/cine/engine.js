/* 공기 한 줌의 여정 · 시네마틱 모션그래픽 엔진 v2
   30초(6초 × 5장면) 루프, 1200×720 논리 좌표, 네온 야간 톤.
   주제별 스크립트는 CINE.story({scenes:[fn×5], cams:[…], trans:[…]}) 로 장면을 등록한다.
   각 장면 함수는 (u, T, now)를 받는다.
     u: 장면 안 연출 시간(0~4.8, 실제 6초를 0.8배로 받음. 다음 장면으로 넘어가는 동안은 4.8을 조금 넘는다)
     T: 전체 경과(0~30초), now: 실제 시계(초, 반복 연출용)
   v2에서 더한 것: 2.5D 카메라(줌·팬·시차), 장면 전환(밀기·조리개·블레이드·셔터), 큰 타이틀 카드,
   블룸·비네트·필름 그레인, 떠다니는 입자, 스프링 이징과 등장 연출 도우미(pop/slide/reveal/trace/callout…). */
(() => {
'use strict';
const D = window.STORY, W = 1200, H = 720, SCENE = 6, LOOP = 30, PACE = .8, TR = .8;
const cv = document.getElementById('cv'), c = cv.getContext('2d'), $ = id => document.getElementById(id);
const P = {bg0:'#040910', bg1:'#0a1726', bg2:'#11263a', line:'#1d3448', text:'#e8f1f5', muted:'#7f98a8', dim:'#4d6577',
  cyan:'#3de0ff', mag:'#ff3d9a', amber:'#ffb547', mint:'#5fe0b5', violet:'#a58bff', red:'#ff5a5a', green:'#57e39a', white:'#ffffff'};
const A = D.accent || P.cyan;
const DISP = '"Black Han Sans","IBM Plex Sans KR","Malgun Gothic",sans-serif', SANS = '"IBM Plex Sans KR","Malgun Gothic",sans-serif', MONO = '"JetBrains Mono",Consolas,monospace';
const GUIDES = new URLSearchParams(location.search).get('guides') === '1';   // ?guides=1: 제목·자막 영역을 빨간 점선으로 표시(제작용)
let NOW = 0, SS = 1, Q = 2;                       // 시계, 기기 배율, 품질 단계(2 전체 · 1 블룸 끔 · 0 그림자도 끔)
const CAM = {x: W / 2, y: H / 2, z: 1}, IDENT = [1, 0, 0, 1, 0, 0]; let B = IDENT;

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }, eout = t => 1 - Math.pow(1 - clamp(t), 3), ein = t => Math.pow(clamp(t), 3);
const back = t => { t = clamp(t); const s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2) };
const spring = t => { t = clamp(t); return 1 - Math.exp(-7 * t) * Math.cos(11 * t) * (1 - t) };
const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t) };
const seg = (u, a, b) => clamp((u - a) / (b - a));
const fade = (u, a, b, d = .35) => clamp(Math.min((u - a) / d, (b - u) / d));
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n) };
const wave = (t, f = 1, ph = 0) => Math.sin(t * f + ph);

// ---------- color ----------
function rgba(col, a = 1) {
  if (col[0] === '#') { let h = col.slice(1); if (h.length === 3) h = h.replace(/./g, m => m + m); const n = parseInt(h.slice(0, 6), 16); return `rgba(${n >> 16},${n >> 8 & 255},${n & 255},${a})` }
  const m = col.match(/^rgba?\(([^)]*)\)?$/); if (m) { const p = m[1].split(',').map(s => s.trim()).filter(Boolean); return `rgba(${p[0]},${p[1]},${p[2]},${a})` }
  return col;
}
function shade(col, amt) { if (col[0] !== '#') return col; let h = col.slice(1); if (h.length === 3) h = h.replace(/./g, m => m + m); const n = parseInt(h.slice(0, 6), 16), t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  const f = v => Math.round(v + (t - v) * p); return `rgb(${f(n >> 16)},${f(n >> 8 & 255)},${f(n & 255)})` }

// ---------- primitives ----------
function rr(x, y, w, h, r = 8) { c.beginPath(); c.roundRect(x, y, w, h, r) }
function box(x, y, w, h, fill, r = 8, stroke, lw = 1.5) { rr(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill() } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke() } }
function line(x1, y1, x2, y2, col = A, w = 2, cap = 'round') { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w; c.lineCap = cap; c.stroke(); c.lineCap = 'butt' }
function poly(pts, fill, stroke, lw = 1.5) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill() } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke() } }
function circ(x, y, r, fill, stroke, lw = 2) { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 6.2832); if (fill) { c.fillStyle = fill; c.fill() } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke() } }
function ell(x, y, rx, ry, fill) { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, 6.2832); c.fillStyle = fill; c.fill() }
function txt(s, x, y, size = 18, col = P.text, al = 'left', weight = 500, font = SANS) { c.font = `${weight} ${size}px ${font}`; c.fillStyle = col; c.textAlign = al; c.fillText(s, x, y) }
function mono(s, x, y, size = 16, col = P.text, al = 'left', weight = 600) { txt(s, x, y, size, col, al, weight, MONO) }
function disp(s, x, y, size = 40, col = P.text, al = 'left') { txt(s, x, y, size, col, al, 400, DISP) }
function glow(col, blur, fn) { if (Q < 1) return fn(); c.save(); c.shadowColor = col; c.shadowBlur = blur * SS; fn(); c.restore() }
function alpha(a, fn) { if (a <= 0) return; c.save(); c.globalAlpha *= clamp(a); fn(); c.restore() }
function grad(x1, y1, x2, y2, stops) { const g = c.createLinearGradient(x1, y1, x2, y2); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function rgrad(x, y, r0, r1, stops) { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function tw(s, size, weight = 500, font = SANS) { c.font = `${weight} ${size}px ${font}`; return c.measureText(s).width }
// 부드러운 빛 덩어리: 색별로 한 번만 만들어 두고 찍는다(그림자 블러보다 훨씬 가볍다).
const SPR = new Map();
function sprite(col) { let s = SPR.get(col); if (!s) { s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  q.addColorStop(0, rgba(col, 1)); q.addColorStop(.3, rgba(col, .5)); q.addColorStop(.65, rgba(col, .14)); q.addColorStop(1, rgba(col, 0)); g.fillStyle = q; g.fillRect(0, 0, 64, 64); SPR.set(col, s) } return s }
function halo(x, y, r, col = A, a = 1, add = true) { if (a <= 0 || r <= 0) return; const ga = c.globalAlpha, op = c.globalCompositeOperation; c.globalAlpha = ga * clamp(a); if (add) c.globalCompositeOperation = 'lighter';
  c.drawImage(sprite(col), x - r, y - r, r * 2, r * 2); c.globalAlpha = ga; c.globalCompositeOperation = op }
function kinetic(s, x, y, size, t0, u, col = P.text) {
  c.font = `400 ${size}px ${DISP}`; c.textAlign = 'left'; let cx = x; const ga = c.globalAlpha;
  for (let i = 0; i < s.length; i++) { const ch = s[i], w = c.measureText(ch).width, k = eout((u - t0 - i * .035) / .45);
    if (k > 0) { c.globalAlpha = ga * k; c.fillStyle = col; c.fillText(ch, cx, y + (1 - k) * size * .5) } cx += w }
  c.globalAlpha = ga; return cx - x;
}
function chip(x, y, s, col = A, al = 'left', size = 14) { const w = tw(s, size, 600) + size * 1.3, h = size + 12, X = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x;
  box(X, y - size - 4, w, h, 'rgba(4,10,18,.78)', h / 2); alpha(.2, () => box(X, y - size - 4, w, h, col, h / 2)); box(X, y - size - 4, w, h, null, h / 2, col, 1.3); txt(s, X + w / 2, y + 1, size, col, 'center', 700); return w }
function panel(x, y, w, h, title, sub, col = A, k = 1) {
  if (k <= 0) return; c.save(); if (k < 1) { const e = eout(k), s = lerp(.95, 1, e); c.globalAlpha *= clamp(k * 2.5); c.translate(x + w / 2, y + h / 2 + (1 - e) * 16); c.scale(s, s); c.translate(-x - w / 2, -y - h / 2) }
  alpha(.5, () => { c.fillStyle = 'rgba(0,0,0,.5)'; rr(x + 4, y + 10, w, h, 16); c.fill() });
  rr(x, y, w, h, 16); c.fillStyle = grad(x, y, x, y + h, [[0, 'rgba(16,31,50,.93)'], [1, 'rgba(5,11,20,.93)']]); c.fill();
  c.strokeStyle = grad(x, y, x + w, y + h, [[0, rgba(col, .75)], [.35, 'rgba(130,180,210,.18)'], [.7, 'rgba(130,180,210,.1)'], [1, rgba(col, .35)]]); c.lineWidth = 1.5; c.stroke();
  c.save(); rr(x, y, w, h, 16); c.clip(); c.fillStyle = grad(x, y, x, y + 70, [[0, rgba(col, .1)], [1, rgba(col, 0)]]); c.fillRect(x, y, w, 70); c.restore();
  glow(col, 12, () => line(x + 20, y + 1, x + 78, y + 1, col, 3));
  line(x + w - 26, y + h - 12, x + w - 12, y + h - 12, rgba(col, .5), 1.5, 'butt'); line(x + w - 12, y + h - 26, x + w - 12, y + h - 12, rgba(col, .5), 1.5, 'butt');
  if (title) txt(title, x + 20, y + 37, 20, P.text, 'left', 700);
  if (sub) mono(sub, x + 20, y + 59, 12, P.muted, 'left', 500);
  c.restore();
}
function tick(x, y, k = 1, col = P.green, s = 1) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-9, 0); const a = clamp(k * 2), b = clamp(k * 2 - 1);
  c.lineTo(lerp(-9, -2, a), lerp(0, 8, a)); if (b > 0) c.lineTo(lerp(-2, 13, b), lerp(8, -10, b)); c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); c.restore() }
function cross(x, y, k = 1, col = P.red) { if (k <= 0) return; const d = 8 * clamp(k); line(x - d, y - d, x + d, y + d, col, 4); line(x + d, y - d, x - d, y + d, col, 4) }
function arrow(x1, y1, x2, y2, col = A, w = 3, head = 12, k = 1) { const x = lerp(x1, x2, clamp(k)), y = lerp(y1, y2, clamp(k)); line(x1, y1, x, y, col, w); const a = Math.atan2(y2 - y1, x2 - x1);
  if (k > .05) poly([[x, y], [x - head * Math.cos(a - .45), y - head * Math.sin(a - .45)], [x - head * Math.cos(a + .45), y - head * Math.sin(a + .45)]], col) }
function dashed(x1, y1, x2, y2, col, w, now, dash = [8, 8], speed = 30) { c.save(); c.setLineDash(dash); c.lineDashOffset = -now * speed; line(x1, y1, x2, y2, col, w); c.restore() }
function rings(x, y, now, col = A, r0 = 10, r1 = 70, n = 3, speed = .9, a = 1, lw = 2) { for (let k = 0; k < n; k++) { const ph = (now * speed + k / n) % 1; alpha(a * (1 - ph), () => circ(x, y, lerp(r0, r1, ph), null, col, lw)) } }
function counter(v, dp = 0) { return v.toLocaleString('ko-KR', {minimumFractionDigits: dp, maximumFractionDigits: dp}) }
// 연기·입자 기둥: 시드 기반이라 상태 없이 끝없이 반복된다.
function plume(x, y, now, o = {}) { const n = o.n || 16, len = o.len || 120, dx = o.dx ?? 30, col = rgba(o.col || 'rgba(190,200,210,', 1), sp = o.speed || .35, r0 = o.r0 || 4, r1 = o.r1 || 16, a0 = o.a ?? .5;
  for (let i = 0; i < n; i++) { const ph = (now * sp + i / n + (o.seed || 0)) % 1, wob = Math.sin(ph * 6 + i * 2.1) * (o.wob ?? 8);
    halo(x + dx * ph + wob, y - len * ph, lerp(r0, r1, ph) * 2.1, col, a0 * 1.5 * (1 - ph) * clamp(ph * 8), false) } }
function dots(pts, now, col = A, n = 6, r = 3.2, speed = .5) { // 꺾은선을 따라 흐르는 입자
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d }
  for (let j = 0; j < n; j++) { let s = ((now * speed + j / n) % 1) * tot, i = 0; while (i < L.length - 1 && s > L[i]) { s -= L[i]; i++ } const q = s / L[i], px = lerp(pts[i][0], pts[i + 1][0], q), py = lerp(pts[i][1], pts[i + 1][1], q);
    halo(px, py, r * 4.5, col, .75); circ(px, py, r, col) } }

// ---------- motion helpers (v2) ----------
// k(0→1)에 맞춰 fn을 튀어나오듯 등장시킨다. (x, y)는 확대 기준점.
function pop(k, x, y, fn, o = {}) { if (k <= 0) return; const e = (o.ease || back)(clamp(k)), s = lerp(o.from ?? .55, 1, e); c.save(); c.globalAlpha *= clamp(k * 2.4); c.translate(x, y + (o.dy || 0) * (1 - eout(k))); c.scale(s, s); c.translate(-x, -y); fn(); c.restore() }
// (dx, dy)만큼 떨어진 곳에서 미끄러져 들어온다.
function slide(k, dx, dy, fn) { if (k <= 0) return; const e = eout(k); c.save(); c.globalAlpha *= clamp(k * 2.2); c.translate(dx * (1 - e), dy * (1 - e)); fn(); c.restore() }
// 마스크 뒤에서 글자가 올라오는 제목용 등장.
function reveal(s, x, y, size, k, col = P.text, al = 'left', weight = 700, font = SANS) { if (k <= 0) return 0; c.font = `${weight} ${size}px ${font}`; const w = c.measureText(s).width, X = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x, e = eout(k);
  c.save(); c.beginPath(); c.rect(X - 6, y - size * 1.05, w + 12, size * 1.4); c.clip(); c.globalAlpha *= clamp(k * 3); c.fillStyle = col; c.textAlign = 'left'; c.fillText(s, X, y + (1 - e) * size); c.restore(); return w }
function typeOn(s, x, y, size, k, col = P.text, al = 'left', weight = 600, font = MONO) { if (k <= 0) return; const n = Math.ceil(s.length * clamp(k)), full = tw(s, size, weight, font), X = al === 'center' ? x - full / 2 : al === 'right' ? x - full : x, part = s.slice(0, n);
  txt(part, X, y, size, col, 'left', weight, font); if (k < 1 || Math.sin(NOW * 7) > 0) { const w = tw(part, size, weight, font); c.fillStyle = col; c.fillRect(X + w + 3, y - size * .82, size * .5, size * .95) } }
// 꺾은선을 k만큼만 그리고 끝에 빛나는 머리를 단다.
function trace(pts, k, col = A, w = 3, o = {}) { if (k <= 0 || pts.length < 2) return; const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d }
  let rem = tot * clamp(k), hx = pts[0][0], hy = pts[0][1]; c.beginPath(); c.moveTo(hx, hy);
  for (let i = 0; i < L.length && rem > 0; i++) { const q = Math.min(1, rem / L[i]); hx = lerp(pts[i][0], pts[i + 1][0], q); hy = lerp(pts[i][1], pts[i + 1][1], q); c.lineTo(hx, hy); rem -= L[i] }
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; if (o.dash) c.setLineDash(o.dash); if (o.glow === false) c.stroke(); else glow(col, o.glow || 10, () => c.stroke()); c.setLineDash([]); c.lineCap = 'butt'; c.lineJoin = 'miter';
  if (o.head !== false && k < 1) { halo(hx, hy, w * 6, col, .9); circ(hx, hy, w * 1.1, '#fff') } return [hx, hy] }
// 지시선: 점 → 선 → 글자 순으로 나타난다. al로 글자 정렬을 정한다.
function callout(x, y, x2, y2, label, k, col = A, o = {}) { if (k <= 0) return; const size = o.size || 20, al = o.al || (x2 >= x ? 'left' : 'right'), dir = al === 'left' ? 1 : -1;
  halo(x, y, 20, col, .7 * clamp(k * 3)); circ(x, y, 5 * back(seg(k, 0, .35)), col); circ(x, y, 9 * eout(seg(k, 0, .4)), null, rgba(col, .6), 1.5);
  trace([[x, y], [x2, y2], [x2 + dir * 26, y2]], seg(k, .15, .65), col, 2, {glow: 6, head: false});
  const t = seg(k, .5, 1); if (t > 0) { reveal(label, x2 + dir * 34, y2 + size * .36, size, t, o.text || P.text, al, 700); if (o.sub) alpha(t, () => txt(o.sub, x2 + dir * 34, y2 + size * .36 + size * 1.15, size * .72, P.muted, al, 500)) } }
// 항목이 차례로 미끄러져 들어오고 체크가 그려지는 목록.
function checklist(x, y, items, u, t0, o = {}) { const gap = o.gap || 48, size = o.size || 21, col = o.col || P.green, step = o.step ?? .38;
  items.forEach((it, i) => { const a = t0 + i * step, k = seg(u, a, a + .45), yy = y + i * gap; if (k <= 0) return;
    slide(k, -22, 0, () => { circ(x + 14, yy - size * .34, 14, rgba(col, .14), rgba(col, .85), 1.6); const tk = seg(u, a + .22, a + .6); tick(x + 13, yy - size * .34 - 1, tk, col, .72); if (tk > 0 && tk < 1) burst(x + 14, yy - size * .34, tk, col, 8, 30);
      txt(it, x + 40, yy, size, P.text, 'left', 600) }) }) }
// 강조용 방사형 스파크: k 0→1 동안 한 번 터진다.
function burst(x, y, k, col = A, n = 10, r = 46) { if (k <= 0 || k >= 1) return; const e = eout(k); c.save(); c.globalAlpha *= 1 - k; for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + .3, r0 = r * (.35 + .65 * e), r1 = r * (.55 + .75 * e);
  line(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, col, 2.5) } c.restore(); halo(x, y, r * 1.4, col, .5 * (1 - k)) }
// 도장: 크게 떨어져 '쾅' 찍힌다.
function stamp(x, y, label, k, col = P.red, r = 46, o = {}) { if (k <= 0) return; const e = clamp(k / .35), s = lerp(2.4, 1, ein(e) * .4 + eout(e) * .6), rot = o.rot ?? -.2;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha *= clamp(k * 5); circ(0, 0, r, rgba(col, .1), col, 4); circ(0, 0, r - 8, null, rgba(col, .7), 1.5); txt(label, 0, (o.size || r * .5) * .36, o.size || r * .5, col, 'center', 700); c.restore();
  burst(x, y, seg(k, .3, .9), col, 12, r * 1.5) }
// 빛줄기(볼류메트릭 콘).
function beam(x, y, ang, len, spread, col = '#dff4ff', a = .2) { c.save(); c.translate(x, y); c.rotate(ang); c.globalCompositeOperation = 'lighter'; c.fillStyle = grad(0, 0, len, 0, [[0, rgba(col, a)], [1, rgba(col, 0)]]);
  c.beginPath(); c.moveTo(0, -spread * .12); c.lineTo(len, -spread); c.lineTo(len, spread); c.lineTo(0, spread * .12); c.closePath(); c.fill(); c.restore() }
// 패널 위를 지나가는 광택.
function shine(x, y, w, h, k, r = 14) { if (k <= 0 || k >= 1) return; c.save(); rr(x, y, w, h, r); c.clip(); const sx = lerp(x - w * .5, x + w * 1.2, eio(k)); c.fillStyle = grad(sx, 0, sx + w * .3, 0, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.2)'], [1, 'rgba(255,255,255,0)']]);
  c.transform(1, 0, -.4, 1, 0, 0); c.fillRect(x - w, y - 10, w * 4, h + 20); c.restore() }
// 큰 숫자 타일.
function kpi(x, y, label, val, unit, col = A, k = 1, o = {}) { if (k <= 0) return; const size = o.size || 54; slide(k, 0, 14, () => { txt(label, x, y, o.lsize || 16, P.muted, o.al || 'left', 600);
  c.font = `700 ${size}px ${MONO}`; const w = c.measureText(val).width, al = o.al || 'left', X = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x; glow(col, 14, () => txt(val, X, y + size * 1.02, size, col, 'left', 700, MONO)); if (unit) txt(unit, X + w + 8, y + size * 1.02, size * .36, P.muted, 'left', 600) }) }
// 선 그래프: (x, y)는 왼쪽 아래. fn(q)는 0~1 값을 돌려준다. k만큼 그려진다.
function lineChart(x, y, w, h, fn, k, o = {}) { const col = o.col || A, N = 90, kk = clamp(k);
  if (o.grid !== false) { for (let j = 0; j <= 4; j++) line(x, y - h * j / 4, x + w, y - h * j / 4, 'rgba(140,180,205,' + (j ? .08 : .22) + ')', 1, 'butt') }
  if (o.limit != null) { const ly = y - h * o.limit; dashed(x, ly, x + w, ly, o.limitCol || P.red, 1.8, NOW, [7, 6], 12); if (o.limitLabel) txt(o.limitLabel, x + w, ly - 8, 14, o.limitCol || P.red, 'right', 700) }
  if (kk <= 0) return; const n = Math.max(1, Math.round(N * kk));
  if (o.fill !== false) { c.beginPath(); c.moveTo(x, y); for (let i = 0; i <= n; i++) { const q = i / N; c.lineTo(x + w * q, y - h * clamp(fn(q))) } c.lineTo(x + w * n / N, y); c.closePath(); c.fillStyle = grad(0, y - h, 0, y, [[0, rgba(col, .3)], [1, rgba(col, 0)]]); c.fill() }
  c.beginPath(); for (let i = 0; i <= n; i++) { const q = i / N, yy = y - h * clamp(fn(q)); i ? c.lineTo(x + w * q, yy) : c.moveTo(x + w * q, yy) } c.strokeStyle = col; c.lineWidth = o.lw || 3; c.lineJoin = 'round'; glow(col, 10, () => c.stroke()); c.lineJoin = 'miter';
  const hx = x + w * n / N, hy = y - h * clamp(fn(n / N)); if (o.head !== false) { halo(hx, hy, 22, col, .9); circ(hx, hy, 5, '#fff', col, 2) } return [hx, hy] }
// 말풍선.
function speech(x, y, w, h, k, col = A, o = {}) { if (k <= 0) return; pop(k, x + (o.tailX ?? 30), y + h + 14, () => { c.beginPath(); c.roundRect(x, y, w, h, 16); c.fillStyle = o.fill || 'rgba(8,18,30,.94)'; c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.stroke();
  const tx = x + (o.tailX ?? 30); poly([[tx - 10, y + h - 1], [tx + 12, y + h - 1], [tx - 4, y + h + 16]], o.fill || 'rgba(8,18,30,.98)'); line(tx - 10, y + h, tx - 4, y + h + 16, col, 2); line(tx + 12, y + h, tx - 4, y + h + 16, col, 2) }) }
// 알약 배지(점 + 글자). 튀어나오며 등장.
function badge(x, y, label, col = A, k = 1, o = {}) { if (k <= 0) return 0; const size = o.size || 18, w = tw(label, size, 700) + size * 2.4, h = size + 18, X = o.al === 'center' ? x - w / 2 : o.al === 'right' ? x - w : x;
  pop(k, X + w / 2, y, () => { box(X, y - h / 2, w, h, 'rgba(5,12,21,.9)', h / 2, col, 1.6); alpha(.16, () => box(X, y - h / 2, w, h, col, h / 2)); halo(X + size * .9, y, size * .9, col, .8); circ(X + size * .9, y, size * .28, col); txt(label, X + size * 1.6, y + size * .36, size, o.text || P.text, 'left', 700) }); return w }
// 두 점을 휘어 잇는 곡선을 점 목록으로 돌려준다(trace·dots에 그대로 넣는다). bend: 가운데를 아래(+)·위(-)로 당기는 양.
const curve = (x1, y1, x2, y2, bend = 0, n = 26) => Array.from({length: n + 1}, (_, i) => { const t = i / n, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend; return [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2] });
// 원형 아이콘. kind: sun wind bolt talk check home pin bulb doc factory car truck gauge flask leaf search gear people chart drop shield clock cloud warn won tool send eye star · o.bare: 바탕 원 없이 그림만
function icon(kind, x, y, r, col = A, o = {}) { if (!o.bare) { halo(x, y, r * 2.1, col, .32); circ(x, y, r, 'rgba(5,14,24,.94)', col, 2) }
  c.save(); c.translate(x, y); c.scale(r / 24, r / 24); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
  const L = (...p) => { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke() }, F = (...p) => { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); c.fill() }, O = (cx, cy, q, fill) => { c.beginPath(); c.arc(cx, cy, q, 0, 6.2832); fill ? c.fill() : c.stroke() };
  switch (kind) {
    case 'sun': O(0, 0, 6, 1); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + NOW * .6; L(Math.cos(a) * 10.5, Math.sin(a) * 10.5, Math.cos(a) * 15.5, Math.sin(a) * 15.5) } break;
    case 'wind': c.save(); c.translate(0, 2); c.rotate(NOW * 2); for (let i = 0; i < 3; i++) { c.rotate(2.094); L(0, 0, 0, -14) } c.restore(); O(0, 2, 2.4, 1); break;
    case 'bolt': case 'grid': F(3, -15, -9, 2, -1, 2, -4, 15, 9, -3, 1, -3); break;
    case 'talk': c.beginPath(); c.roundRect(-12, -11, 24, 17, 5); c.stroke(); F(-6, 6, -8, 13, 1, 6); break;
    case 'check': c.lineWidth = 3.2; L(-9, 0, -3, 7, 10, -8); break;
    case 'home': F(-13, -1, 0, -13, 13, -1); c.fillRect(-9, -1, 18, 12); break;
    case 'pin': case 'map': c.beginPath(); c.arc(0, -4, 8, Math.PI * .85, Math.PI * .15); c.lineTo(0, 13); c.closePath(); c.fill(); c.fillStyle = '#061320'; O(0, -4, 3, 1); break;
    case 'bulb': O(0, -3, 8, 1); c.fillRect(-4, 5, 8, 6); for (const a of [-2.3, -1.57, -.84]) L(Math.cos(a) * 12, -3 + Math.sin(a) * 12, Math.cos(a) * 16, -3 + Math.sin(a) * 16); break;
    case 'doc': c.beginPath(); c.roundRect(-9, -13, 18, 26, 3); c.stroke(); L(-4, -6, 4, -6); L(-4, 0, 4, 0); L(-4, 6, 1, 6); break;
    case 'factory': F(-13, 12, -13, -2, -5, -8, -5, -2, 3, -8, 3, 12); c.fillRect(6, -14, 6, 26); break;
    case 'car': c.beginPath(); c.roundRect(-14, -2, 28, 9, 3); c.fill(); F(-8, -2, -4, -10, 6, -10, 10, -2); c.fillStyle = '#061320'; O(-7, 8, 3.4, 1); O(7, 8, 3.4, 1); c.fillStyle = col; O(-7, 8, 1.6, 1); O(7, 8, 1.6, 1); break;
    case 'truck': c.fillRect(-14, -8, 17, 14); F(4, 6, 4, -4, 10, -4, 14, 1, 14, 6); c.fillStyle = '#061320'; O(-8, 8, 3.2, 1); O(9, 8, 3.2, 1); break;
    case 'gauge': c.beginPath(); c.arc(0, 4, 12, Math.PI, 0); c.stroke(); L(0, 4, 6, -5); O(0, 4, 2.2, 1); break;
    case 'flask': L(-4, -13, 4, -13); c.beginPath(); c.moveTo(-3, -13); c.lineTo(-3, -3); c.lineTo(-11, 12); c.lineTo(11, 12); c.lineTo(3, -3); c.lineTo(3, -13); c.stroke(); F(-7, 5, 7, 5, 10, 11, -10, 11); break;
    case 'leaf': c.beginPath(); c.moveTo(-10, 11); c.quadraticCurveTo(-12, -10, 12, -12); c.quadraticCurveTo(12, 10, -10, 11); c.fill(); c.strokeStyle = '#061320'; L(-8, 9, 6, -6); break;
    case 'search': O(-3, -3, 8); L(3, 3, 12, 12); break;
    case 'gear': O(0, 0, 5); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + NOW * .5; L(Math.cos(a) * 8.5, Math.sin(a) * 8.5, Math.cos(a) * 13, Math.sin(a) * 13) } break;
    case 'people': O(-6, -6, 4.5, 1); O(7, -4, 3.8, 1); c.beginPath(); c.roundRect(-13, 1, 14, 11, 5); c.fill(); c.beginPath(); c.roundRect(2, 2, 11, 10, 4); c.fill(); break;
    case 'chart': c.fillRect(-11, 2, 5, 10); c.fillRect(-3, -5, 5, 17); c.fillRect(5, -12, 5, 24); break;
    case 'drop': c.beginPath(); c.moveTo(0, -14); c.bezierCurveTo(10, -2, 10, 12, 0, 12); c.bezierCurveTo(-10, 12, -10, -2, 0, -14); c.fill(); break;
    case 'shield': c.beginPath(); c.moveTo(0, -14); c.lineTo(11, -9); c.lineTo(11, 1); c.quadraticCurveTo(10, 10, 0, 14); c.quadraticCurveTo(-10, 10, -11, 1); c.lineTo(-11, -9); c.closePath(); c.stroke(); L(-5, 0, -1, 5, 6, -4); break;
    case 'clock': O(0, 0, 12); L(0, -7, 0, 0, 5, 4); break;
    case 'cloud': c.beginPath(); c.arc(-6, 3, 6, 0, 6.2832); c.arc(1, -3, 8, 0, 6.2832); c.arc(8, 3, 5.5, 0, 6.2832); c.fill(); c.fillRect(-6, 3, 14, 6); break;
    case 'warn': c.beginPath(); c.moveTo(0, -13); c.lineTo(13, 10); c.lineTo(-13, 10); c.closePath(); c.stroke(); L(0, -4, 0, 3); O(0, 7, 1.4, 1); break;
    case 'won': c.font = `700 24px ${SANS}`; c.textAlign = 'center'; c.fillText('₩', 0, 9); break;
    case 'tool': c.lineWidth = 3.4; L(-10, 10, 3, -3); O(7, -7, 5); break;
    case 'send': F(-12, -2, 13, -11, 4, 12, 0, 3); break;
    case 'eye': c.beginPath(); c.moveTo(-13, 0); c.quadraticCurveTo(0, -12, 13, 0); c.quadraticCurveTo(0, 12, -13, 0); c.stroke(); O(0, 0, 4, 1); break;
    case 'star': c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 6 : 14; c.lineTo(Math.cos(a) * q, Math.sin(a) * q) } c.closePath(); c.fill(); break;
  }
  c.restore() }
// 지도 핀: 위에서 떨어져 꽂히고, 이름표가 튀어나온다.
function pin(x, y, col, label, k, now = NOW, size = 19) { if (k <= 0) return; const drop = (1 - back(k)) * -110;
  alpha(clamp(k * 2), () => { c.save(); c.translate(x, y); c.scale(1, .45); rings(0, 0, now, col, 8, 48, 2, .8, .65); circ(0, 0, 7, rgba(col, .55)); c.restore() });
  c.save(); c.translate(x, y + drop); c.globalAlpha *= clamp(k * 3); glow(col, 14, () => { c.beginPath(); c.arc(0, -34, 15, Math.PI * .85, Math.PI * .15); c.lineTo(0, 0); c.closePath(); c.fillStyle = col; c.fill() }); circ(0, -34, 6, '#061320'); c.restore();
  if (label) pop(seg(k, .55, 1), x, y - 64, () => chip(x, y - 62, label, col, 'center', size)) }
function coin(x, y, r, a = 1) { alpha(a, () => { halo(x, y, r * 2.6, P.amber, .55); circ(x, y, r, '#ffc23d', '#fff0b8', 1.6); txt('₩', x, y + r * .42, r * 1.15, '#7a4a00', 'center', 700) }) }
// 아이콘 + 제목 + 설명 카드. 오른쪽에서 미끄러져 들어온다.
function card(x, y, w, h, kind, title, sub, col, k = 1) { slide(k, 46, 0, () => { box(x, y, w, h, 'rgba(7,16,27,.96)', 14, col, 1.8); alpha(.1, () => box(x, y, w, h, col, 14)); icon(kind, x + 46, y + h / 2, 26, col); txt(title, x + 88, y + h / 2 + (sub ? -5 : 9), 25, col, 'left', 700); if (sub) txt(sub, x + 88, y + h / 2 + 25, 17, P.text, 'left', 500) }) }
// 언덕 실루엣 두 겹. night(now, {skyline: false, back: () => hills(gy)}) 처럼 쓴다.
function hills(gy) { layer(.45, () => { c.fillStyle = '#0b1c30'; c.beginPath(); c.moveTo(0, gy + 300); for (let x = 0; x <= W; x += 20) c.lineTo(x, gy - 74 - Math.sin(x * .006 + 1) * 36 - Math.sin(x * .017) * 12); c.lineTo(W, gy + 300); c.closePath(); c.fill() });
  layer(.72, () => { c.fillStyle = '#081523'; c.beginPath(); c.moveTo(0, gy + 300); for (let x = 0; x <= W; x += 20) c.lineTo(x, gy - 30 - Math.sin(x * .008 + 3) * 22 - Math.sin(x * .021 + 1) * 8); c.lineTo(W, gy + 300); c.closePath(); c.fill() }) }
// 시차 레이어: depth 0은 화면에 고정, 1은 카메라와 함께 움직이는 기본 평면.
function useBase() { c.setTransform(SS * B[0], SS * B[1], SS * B[2], SS * B[3], SS * B[4], SS * B[5]) }
function layer(d, fn) { c.save(); useBase(); const z = 1 + (CAM.z - 1) * d; c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-(W / 2 + (CAM.x - W / 2) * d), -(H / 2 + (CAM.y - H / 2) * d)); try { fn() } finally { c.restore() } }

// ---------- backdrops ----------
const STARS = Array.from({length: 120}, (_, i) => ({x: hash(i) * W, y: hash(i + 99) * 440, r: hash(i + 7) * 1.5 + .4, p: hash(i + 3) * 6, b: hash(i + 31)}));
function skyline(seed, minW, spanW, minH, spanH, gap) { const out = []; for (let x = -40, i = 0; x < W + 80; i++) { const w = minW + hash(i * 3.1 + seed) * spanW, h = minH + hash(i * 1.7 + seed) * spanH, win = [];
  for (let wy = 14; wy < h - 10; wy += 15) for (let wx = 6; wx < w - 8; wx += 12) if (hash(wx * 7.3 + wy * 3.7 + i * 11 + seed) > .68) win.push([wx, wy, hash(wx + wy + i)]);
  out.push({x, w, h, b: h > minH + spanH * .78, win, roof: hash(i * 9.1 + seed)}); x += w + gap + hash(i * 5.3 + seed) * 12 } return out }
const SKY = skyline(0, 34, 64, 60, 190, 4), SKY_FAR = skyline(41, 46, 80, 110, 230, 10);
function night(now, o = {}) {
  const gy = o.ground ?? 600, city = o.city || 1, tint = o.tint || A, pan = o.pan || 0;
  layer(0, () => { c.fillStyle = grad(0, 0, 0, H, [[0, '#02040a'], [.4, '#061226'], [.72, '#0e2140'], [1, o.haze || '#1b2238']]); c.fillRect(0, 0, W, H);
    halo(W * .2 + Math.sin(now * .11) * 80, H * .3, 430, tint, .1); halo(W * .8 + Math.cos(now * .09) * 90, H * .42, 480, P.mag, .07) });
  layer(.06, () => { for (const s of STARS) { const tw2 = .35 + .45 * Math.sin(now * (1 + s.b) + s.p); c.globalAlpha = tw2; c.fillStyle = s.b > .86 ? '#ffe9c4' : '#cfe6f5'; c.fillRect(s.x, s.y, s.r, s.r); if (s.b > .93) halo(s.x, s.y, 7, '#cfe6f5', tw2 * .7) } c.globalAlpha = 1 });
  c.fillStyle = grad(0, gy - 260, 0, gy, [[0, 'rgba(255,61,154,0)'], [1, o.glow || 'rgba(255,61,154,.14)']]); c.fillRect(0, gy - 260, W, 260);
  c.save(); c.translate(W / 2, gy); c.scale(1, .32); halo(0, 0, 640, tint, .16); c.restore();
  if (o.skyline !== false) {
    layer(.42, () => { const off = -((now * pan * .45) % 1400); for (const r of [0, 1400]) for (const b of SKY_FAR) { const x = b.x + off + r; if (x > W + 20 || x + b.w < -20) continue; c.fillStyle = '#0c1d34'; c.fillRect(x, gy - b.h * city, b.w, b.h * city + 400) }
      c.fillStyle = grad(0, gy - 300, 0, gy, [[0, 'rgba(14,33,64,0)'], [1, 'rgba(30,44,92,.55)']]); c.fillRect(0, gy - 300, W, 300) });
    layer(.7, () => { const off = -((now * pan) % 1400); for (const r of [0, 1400]) for (const b of SKY) { const x = b.x + off + r, h = b.h * city; if (x > W + 20 || x + b.w < -20) continue; c.fillStyle = '#07121d'; c.fillRect(x, gy - h, b.w, h + 400);
        c.fillStyle = 'rgba(120,170,220,.07)'; c.fillRect(x, gy - h, 2, h);
        for (const [wx, wy, ph] of b.win) { if (wy > h - 8) continue; c.fillStyle = ph > .8 ? rgba(tint, .32 + .2 * Math.sin(now * .7 + ph * 40)) : 'rgba(255,205,130,' + (.22 + .16 * Math.sin(now * .5 + ph * 30)).toFixed(3) + ')'; c.fillRect(x + wx, gy - h + wy, 5, 6) }
        if (b.b) { const on = Math.sin(now * 3 + b.x) > .3; line(x + b.w / 2, gy - h, x + b.w / 2, gy - h - 16, '#12263a', 2, 'butt'); if (on) { halo(x + b.w / 2, gy - h - 18, 12, '#ff4a4a', .9); c.fillStyle = '#ff6a6a'; c.fillRect(x + b.w / 2 - 2, gy - h - 20, 4, 4) } } } });
  }
  if (o.back) o.back();   // 지평선 뒤에 놓을 것(언덕 등)
  c.fillStyle = grad(0, gy, 0, H, [[0, o.floor || '#08111b'], [1, '#03070c']]); c.fillRect(0, gy, W, H - gy);
  c.fillStyle = grad(0, gy, 0, H, [[0, rgba(tint, .1)], [.5, rgba(tint, .02)], [1, rgba(tint, 0)]]); c.fillRect(0, gy, W, H - gy);
  if (o.grid !== false) { c.save(); c.beginPath(); c.rect(0, gy + 2, W, H - gy); c.clip(); const vx = W / 2, off = ((now * (o.gridSpeed || 0)) % 1);
    for (let k = -14; k <= 14; k++) line(vx + k * 26, gy, vx + k * 190, H + 40, rgba(tint, .07), 1, 'butt');
    for (let j = 0; j < 8; j++) { const q = Math.pow((j + off) / 8, 1.8), y = gy + (H - gy) * q; line(0, y, W, y, rgba(tint, .03 + .07 * q), 1, 'butt') } c.restore() }
  c.fillStyle = rgba(tint, .55); c.fillRect(0, gy, W, 1.5);
  c.fillStyle = grad(0, gy - 70, 0, gy + 46, [[0, 'rgba(120,150,210,0)'], [.6, 'rgba(120,150,210,.1)'], [1, 'rgba(120,150,210,0)']]); c.fillRect(0, gy - 70, W, 116);
}
function blueprint(o = {}) { const now = NOW, tint = o.tint || A;
  layer(0, () => { c.fillStyle = rgrad(W * .5, H * .45, 40, 860, [[0, '#0e233b'], [.55, '#07121f'], [1, '#02050a']]); c.fillRect(0, 0, W, H);
    halo(W * .14 + Math.sin(now * .13) * 60, H * .22 + Math.cos(now * .1) * 40, 440, tint, .13); halo(W * .9 + Math.cos(now * .12) * 70, H * .84 + Math.sin(now * .08) * 40, 470, P.mag, .09) });
  layer(.5, () => { const ox = (now * 5) % 40, oy = (now * 3) % 40; c.lineWidth = 1; c.strokeStyle = 'rgba(120,200,255,.045)'; c.beginPath(); for (let x = -40 + ox; x <= W + 40; x += 40) { c.moveTo(x, 0); c.lineTo(x, H) } for (let y = -40 + oy; y <= H + 40; y += 40) { c.moveTo(0, y); c.lineTo(W, y) } c.stroke();
    const mx = (now * 5) % 200, my = (now * 3) % 200; c.strokeStyle = 'rgba(120,200,255,.07)'; c.beginPath(); for (let x = -200 + mx; x <= W + 200; x += 200) { c.moveTo(x, 0); c.lineTo(x, H) } for (let y = -200 + my; y <= H + 200; y += 200) { c.moveTo(0, y); c.lineTo(W, y) } c.stroke();
    c.strokeStyle = rgba(tint, .3); c.beginPath(); for (let x = -200 + mx; x <= W + 200; x += 200) for (let y = -200 + my; y <= H + 200; y += 200) { c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.moveTo(x, y - 5); c.lineTo(x, y + 5) } c.stroke() });
  layer(.85, () => { for (let i = 0; i < 26; i++) { const ph = (now * (.02 + hash(i) * .03) + hash(i + 5)) % 1, x = hash(i + 11) * W + Math.sin(now * .4 + i) * 20, y = H + 20 - ph * (H + 40); halo(x, y, 5 + hash(i + 2) * 7, i % 3 ? tint : P.mag, .35 * Math.sin(ph * Math.PI)) } });
}
function lab(floorY = 560) { const now = NOW;
  c.fillStyle = grad(0, 0, 0, floorY, [[0, '#081320'], [.6, '#10243a'], [1, '#17304a']]); c.fillRect(0, 0, W, floorY);
  for (let x = 0; x < W; x += 120) { line(x, 0, x, floorY, 'rgba(120,200,255,.05)', 1, 'butt'); c.fillStyle = 'rgba(120,200,255,.018)'; if ((x / 120) % 2) c.fillRect(x, 0, 120, floorY) }
  line(0, floorY - 150, W, floorY - 150, 'rgba(120,200,255,.06)', 1, 'butt');
  for (const lx of [260, 600, 940]) { const fl = .9 + .1 * Math.sin(now * 2.3 + lx); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = grad(0, 0, 0, 330, [[0, `rgba(210,238,255,${.2 * fl})`], [1, 'rgba(210,238,255,0)']]); poly([[lx - 60, 5], [lx + 60, 5], [lx + 165, 330], [lx - 165, 330]], c.fillStyle); c.restore();
    glow('#dff4ff', 18, () => { c.fillStyle = '#eaf8ff'; c.fillRect(lx - 60, 0, 120, 5) });
    for (let i = 0; i < 7; i++) { const ph = (now * .05 + hash(i + lx)) % 1; halo(lx - 90 + hash(i * 3 + lx) * 180, 20 + ph * 280, 4, '#dff4ff', .5 * Math.sin(ph * Math.PI)) } }
  c.fillStyle = grad(0, floorY, 0, floorY + 14, [[0, '#2a4860'], [1, '#162a3c']]); c.fillRect(0, floorY, W, 14); c.fillStyle = grad(0, floorY + 14, 0, H, [[0, '#0d1a28'], [1, '#060d15']]); c.fillRect(0, floorY + 14, W, H - floorY - 14);
  for (let x = 20; x < W; x += 150) { box(x, floorY + 26, 136, H - floorY - 40, 'rgba(255,255,255,.012)', 6, '#182c3e'); c.fillStyle = '#2b4a62'; c.fillRect(x + 56, floorY + 38, 24, 3) }
}

// ---------- objects ----------
function factory(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s);
  const w = o.w || 260, h = o.h || 130, col = o.col || '#10202f', now = o.now ?? NOW, n = Math.max(1, Math.floor(w / 60));
  if (o.stack !== false) { const sx = o.sx ?? w * .72, sh = o.sh || 150, top = -h - sh; c.fillStyle = grad(sx - 14, 0, sx + 14, 0, [[0, '#1b3856'], [.4, '#2b5072'], [1, '#10243a']]); poly([[sx - 10, top], [sx + 10, top], [sx + 13, -h + 2], [sx - 13, -h + 2]], c.fillStyle);
    c.fillStyle = '#c95a4e'; c.fillRect(sx - 10.5, top + 12, 21, 9); c.fillStyle = 'rgba(235,242,246,.85)'; c.fillRect(sx - 10.8, top + 27, 21.6, 5); box(sx - 13, top - 3, 26, 6, '#33587a', 2);
    const on = Math.sin(now * 4 + x) > 0; if (on) halo(sx, top - 6, 14, '#ff4a4a', .9); c.fillStyle = on ? '#ff6a6a' : '#4a1a1a'; c.fillRect(sx - 2, top - 8, 4, 4);
    if (o.smoke) plume(sx, top - 6, now, {col: o.smokeCol || 'rgba(190,200,210,', a: o.smokeA ?? .45, len: 150, dx: 54, n: 15, r1: 19}) }
  c.fillStyle = grad(0, -h - 26, 0, 0, [[0, shade(col, .1)], [1, shade(col, -.3)]]); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h); for (let i = 0; i < n; i++) { c.lineTo(i * w / n, -h - 26); c.lineTo((i + 1) * w / n, -h) } c.lineTo(w, 0); c.closePath(); c.fill();
  c.strokeStyle = rgba(A, .28); c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -h); for (let i = 0; i < n; i++) { c.lineTo(i * w / n, -h - 26); c.lineTo((i + 1) * w / n, -h) } c.stroke();
  for (let rx = 10; rx < w; rx += 10) { c.fillStyle = 'rgba(255,255,255,.018)'; c.fillRect(rx, -h + 2, 1, h - 4) }
  c.fillStyle = grad(0, -h + 14, 0, -h + 70, [[0, 'rgba(255,190,100,.14)'], [1, 'rgba(255,190,100,0)']]); c.fillRect(8, -h + 14, w - 16, 56);
  for (let wx = 16; wx < w - 16; wx += 24) { c.fillStyle = `rgba(255,200,116,${(.62 + .22 * Math.sin(now * 1.1 + wx * .7)).toFixed(3)})`; c.fillRect(wx, -h + 30, 10, 12) }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, -6, w, 6);
  if (o.label) txt(o.label, 16, -18, 16, '#a9bdca', 'left', 700);
  c.restore() }
function tank(x, y, s = 1, col = '#223e52') { c.save(); c.translate(x, y); c.scale(s, s);
  ell(0, 2, 58, 9, 'rgba(0,0,0,.4)'); c.fillStyle = grad(-50, 0, 50, 0, [[0, '#122434'], [.3, col], [.42, shade(col, .16)], [.6, col], [1, '#0b1824']]); c.fillRect(-50, -140, 100, 140);
  ell(0, 0, 50, 12, '#0b1824'); ell(0, -140, 50, 14, shade(col, .18)); ell(0, -141, 40, 9.5, shade(col, .06)); for (const yy of [-100, -55]) { line(-50, yy, 50, yy, 'rgba(175,195,208,.34)', 2.5, 'butt'); line(-50, yy + 3, 50, yy + 3, 'rgba(0,0,0,.25)', 1.5, 'butt') }
  line(38, -138, 38, -4, '#7a97a8', 2); line(46, -138, 46, -4, '#7a97a8', 2); for (let j = 0; j < 9; j++) line(38, -130 + j * 15, 46, -130 + j * 15, '#7a97a8', 1.5, 'butt');
  c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(-36, -136, 7, 132); c.restore() }
function pipe(pts, col = '#2a4a60', w = 12) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = w + 3; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
  c.strokeStyle = 'rgba(205,228,240,.2)'; c.lineWidth = w * .28; c.stroke(); c.lineJoin = 'miter' }
function flange(x, y, vert = false) { c.fillStyle = '#7a97a8'; if (vert) { c.fillRect(x - 11, y - 3, 22, 6); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 11, y - 3, 22, 1.5) } else { c.fillRect(x - 3, y - 11, 6, 22); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 3, y - 11, 1.5, 22) } }
function limb(x1, y1, x2, y2, col, w) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.stroke() }
// 사람: 발 가운데가 기준점, 오른쪽을 본다. pose: stand | walk | point | tablet | probe | wave · 옵션: flip, vest, hat, helmet:false, woman, stripes:false(반사띠 없는 평상복)
function person(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  const now = o.now ?? NOW, pose = o.pose || 'stand', vest = o.vest || '#f08a2e', skin = o.skin || '#f2cba6', pants = o.pants || '#243a52', dark = shade(vest, -.3), hairC = o.hair || (o.woman ? '#75415a' : '#2a2320');
  const walk = pose === 'walk', sw = walk ? Math.sin(now * 9) : 0, bob = walk ? Math.abs(Math.sin(now * 9)) * 1.6 : Math.sin(now * 2.1 + x * .013) * .7;
  ell(0, 2, 20, 4.5, 'rgba(0,0,0,.42)');
  limb(-5, -34, -5 + sw * 8, -6, shade(pants, -.15), 8.5); limb(5, -34, 5 - sw * 8, -6, pants, 8.5);
  box(-5 + sw * 8 - 5, -7, 14, 7, '#0c141d', 3); box(5 - sw * 8 - 5, -7, 14, 7, '#0c141d', 3);
  c.translate(0, -bob);
  const armL = (x2, y2) => { limb(-10, -60, x2, y2, dark, 6.5); circ(x2, y2, 3.6, skin) }, armR = (x2, y2) => { limb(10, -60, x2, y2, shade(vest, -.1), 6.5); circ(x2, y2, 3.6, skin) };
  if (o.woman) { c.fillStyle = hairC; c.beginPath(); c.moveTo(-6, -88); c.bezierCurveTo(-23, -88, -19, -66, -27, -56); c.bezierCurveTo(-33, -44, -22, -36, -13, -43); c.bezierCurveTo(-10, -50, -14, -58, -9, -68); c.closePath(); c.fill() }
  if (pose === 'stand' || walk) armL(-13 - sw * 6, -37); else if (pose === 'point' || pose === 'wave') armL(-13, -38);
  rr(-12.5, -67, 25, 38, [9, 9, 6, 6]); c.fillStyle = grad(-12, 0, 12, 0, [[0, dark], [.38, vest], [1, shade(vest, -.12)]]); c.fill();
  if (o.stripes !== false) { c.fillStyle = 'rgba(252,247,214,.95)'; c.fillRect(-12.5, -54, 25, 3.2); c.fillRect(-12.5, -44, 25, 3.2) }
  if (pose === 'point') armR(31, -73);
  else if (pose === 'wave') armR(24 + Math.sin(now * 7) * 4, -85);
  else if (pose === 'tablet') { armL(15, -45); armR(20, -47); c.save(); c.translate(22, -51); c.rotate(-.12); box(-11, -9, 23, 17, '#0b1824', 3, A, 1.5); alpha(.55 + .35 * Math.sin(now * 5), () => { c.fillStyle = A; c.fillRect(-8, -6, 17, 3); c.fillRect(-8, -1, 11, 2.5); c.fillRect(-8, 3, 14, 2.5) }); c.restore() }
  else if (pose === 'probe') { armL(22, -45); armR(27, -42) }
  else armR(13 + sw * 6, -37);
  box(-3.5, -72, 7, 8, shade(skin, -.14), 3); circ(0, -79, 9.6, skin);
  const blink = ((now * .37 + hash(x + y)) % 1) < .035; if (!blink) { circ(1.4, -79.5, 1.25, '#2b2523'); circ(6, -79.5, 1.25, '#2b2523') } else { line(.4, -79.5, 2.4, -79.5, '#2b2523', 1.2); line(5, -79.5, 7, -79.5, '#2b2523', 1.2) }
  alpha(.55, () => circ(6.8, -75.6, 1.9, '#f29a8a')); c.beginPath(); c.arc(3.9, -76.4, 2.3, .25, Math.PI - .5); c.strokeStyle = '#8a4a40'; c.lineWidth = 1; c.lineCap = 'round'; c.stroke();
  if (o.helmet !== false) { const hat = o.hat || '#f5c542'; if (o.woman) { c.fillStyle = hairC; c.fillRect(-9.8, -83, 5, 9) } c.fillStyle = hat; c.beginPath(); c.arc(0, -82, 10.6, Math.PI, 0); c.closePath(); c.fill(); box(-12.5, -83.6, 26.5, 3.4, shade(hat, -.12), 1.7);
    c.beginPath(); c.arc(-1, -82, 7.4, Math.PI * 1.15, Math.PI * 1.55); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.6; c.stroke() }
  else { c.fillStyle = hairC; c.beginPath(); c.arc(0, -81, 10, Math.PI * .95, Math.PI * 2.08); c.closePath(); c.fill(); if (o.woman) c.fillRect(-10, -82, 4.6, 12) }
  if (o.woman) box(-11.5, -74, 5, 3.4, '#a58bff', 1.5);
  c.lineCap = 'butt'; c.restore() }
function van(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const now = o.now ?? NOW;
  if (o.beam) { c.globalCompositeOperation = 'lighter'; c.fillStyle = grad(300, 0, 760, 0, [[0, 'rgba(220,240,255,.32)'], [1, 'rgba(220,240,255,0)']]); poly([[306, -60], [760, -130], [760, 34], [306, -46]], c.fillStyle); c.globalCompositeOperation = 'source-over' }
  ell(150, 2, 164, 8, 'rgba(0,0,0,.52)'); halo(150, 0, 150, A, .12);
  if (o.mast !== false) { const mh = o.mastH ?? 70; line(48, -122, 48, -122 - mh, '#c8d4db', 5); line(46.5, -122, 46.5, -122 - mh, 'rgba(255,255,255,.5)', 1.2, 'butt'); poly([[34, -134 - mh], [62, -134 - mh], [55, -122 - mh], [41, -122 - mh]], '#dfe8ed'); if (o.intake) rings(48, -128 - mh, now, A, 8, 70, 3, 1.1, .7) }
  c.fillStyle = grad(0, -126, 0, -20, [[0, '#fbfdfe'], [.55, '#dbe5ea'], [1, '#a9b9c3']]); c.beginPath(); c.moveTo(8, -20); c.lineTo(4, -104); c.quadraticCurveTo(6, -124, 26, -124); c.lineTo(216, -126);
  c.quadraticCurveTo(232, -126, 244, -112); c.lineTo(278, -76); c.quadraticCurveTo(284, -70, 296, -66); c.lineTo(306, -62); c.quadraticCurveTo(314, -58, 314, -46); c.lineTo(314, -26); c.quadraticCurveTo(314, -20, 306, -20); c.closePath(); c.fill();
  c.save(); c.clip(); c.fillStyle = grad(0, 0, 314, 0, [[0, A], [.6, '#7b8cff'], [1, P.mag]]); poly([[0, -50], [314, -54], [314, -40], [0, -36]], c.fillStyle); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, -124, 314, 3); c.restore();
  poly([[222, -114], [242, -114], [270, -80], [222, -80]], '#10202c', 'rgba(61,224,255,.5)', 1.2); poly([[226, -110], [236, -110], [246, -98], [226, -98]], 'rgba(160,220,255,.16)');
  txt(o.label || '수도권대기환경청', 18, -80, 23, '#0c1d2a', 'left', 400, DISP); if (o.sub) mono(o.sub, 20, -62, 11, '#1d4a63', 'left', 700);
  box(104, -136, 72, 11, '#1a2733', 5); const bl = Math.sin(now * 9) > 0; halo(bl ? 123 : 157, -130, 26, bl ? A : P.mag, .8); box(107, -134, 32, 7, bl ? A : '#16414d', 3); box(141, -134, 32, 7, bl ? '#4d1631' : P.mag, 3);
  halo(309, -55, 20, '#fff3cf', .9); box(304, -60, 9, 9, '#ffe9b0', 2); halo(6, -58, 14, '#ff3b3b', .7); box(4, -64, 5, 13, '#ff3b3b', 2);
  for (const wx of [70, 262]) { circ(wx, -22, 23, '#05080c'); circ(wx, -22, 12, '#9fb3bf'); for (let k = 0; k < 5; k++) { const a = (o.spin || 0) + k * 1.2566; line(wx, -22, wx + Math.cos(a) * 11, -22 + Math.sin(a) * 11, '#3b4d59', 2.5) } circ(wx, -22, 4, '#1d2a33') }
  c.restore() }
function truck(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const now = o.now ?? NOW, old = o.old;
  ell(140, 2, 154, 8, 'rgba(0,0,0,.52)');
  const body = old ? '#5b5f6e' : (o.col || '#dfe8ec'), cab = old ? '#6c7182' : (o.cab || '#cfdadf');
  rr(0, -118, 190, 92, 6); c.fillStyle = grad(0, -118, 0, -26, [[0, shade(body, .1)], [1, shade(body, -.18)]]); c.fill(); if (old) { c.fillStyle = 'rgba(96,62,40,.4)'; for (let i = 0; i < 6; i++) c.fillRect(12 + i * 30, -110 + (i % 2) * 20, 14, 30) } else { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(6, -116, 178, 3) }
  c.beginPath(); c.moveTo(194, -26); c.lineTo(194, -96); c.lineTo(250, -96); c.lineTo(282, -56); c.lineTo(282, -26); c.closePath(); c.fillStyle = grad(0, -96, 0, -26, [[0, shade(cab, .08)], [1, shade(cab, -.2)]]); c.fill();
  poly([[204, -88], [244, -88], [266, -60], [204, -60]], '#10202c'); poly([[208, -85], [226, -85], [236, -72], [208, -72]], 'rgba(160,220,255,.14)'); c.fillStyle = old ? '#3b3f4b' : A; c.fillRect(0, -34, 282, 7);
  if (o.label) txt(o.label, 95, -68, 17, old ? '#d0d3da' : '#10202c', 'center', 700);
  if (o.exhaust !== false) { c.fillStyle = '#39424c'; c.fillRect(-12, -40, 16, 6); if (o.smoke) plume(-14, -38, now, {col: old ? 'rgba(46,44,48,' : 'rgba(200,210,220,', a: old ? .85 : .25, len: 90, dx: -110, n: 16, r0: 5, r1: old ? 30 : 14, speed: .6, wob: 10}) }
  halo(279, -50, 18, '#fff3cf', .85); box(274, -54, 8, 9, '#ffe9b0', 2);
  for (const wx of [52, 236]) { circ(wx, -18, 22, '#05080c'); circ(wx, -18, 11, '#8f9ea8'); for (let k = 0; k < 5; k++) { const a = (o.spin || 0) + k * 1.2566; line(wx, -18, wx + Math.cos(a) * 10, -18 + Math.sin(a) * 10, '#3b4d59', 2.5) } circ(wx, -18, 3.5, '#1d2a33') }
  c.restore() }
function car(x, y, s = 1, col = '#4d7bd6', o = {}) { c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); ell(82, 3, 96, 7, 'rgba(0,0,0,.48)');
  // 오른쪽을 보는 세단: 짧은 트렁크, 기운 앞유리, 긴 보닛, 앞뒤 램프.
  c.beginPath(); c.moveTo(0, -18); c.lineTo(0, -33); c.quadraticCurveTo(2, -40, 12, -40); c.lineTo(32, -40);
  c.lineTo(51, -63); c.quadraticCurveTo(55, -68, 64, -68); c.lineTo(95, -68); c.quadraticCurveTo(103, -68, 108, -62);
  c.lineTo(124, -40); c.lineTo(154, -36); c.quadraticCurveTo(166, -34, 166, -22); c.lineTo(166, -18); c.closePath(); c.fillStyle = grad(0, -68, 0, -18, [[0, shade(col, .18)], [.55, col], [1, shade(col, -.3)]]); c.fill();
  poly([[53, -61], [78, -61], [78, -42], [37, -42]], '#10202c'); poly([[83, -61], [96, -61], [117, -42], [83, -42]], '#10202c'); poly([[56, -59], [66, -59], [54, -45], [44, -45]], 'rgba(160,220,255,.16)');
  line(81, -61, 81, -22, 'rgba(8,22,34,.45)', 1.5); line(38, -39, 27, -39, 'rgba(255,255,255,.38)', 2);
  box(123, -41, 12, 3, '#8f9ead', 2); box(140, -36, 18, 3, 'rgba(255,255,255,.4)', 2);
  halo(160, -28, 18, '#fff3cf', .85); box(155, -32, 9, 8, '#fff0bd', 2); box(1, -34, 6, 10, '#ff4545', 2); box(161, -22, 5, 4, '#162330', 1);
  for (const wx of [35, 130]) { circ(wx, -13, 14, '#05080c'); circ(wx, -13, 7, '#a9b9c3');
    for (let k = 0; k < 4; k++) { const a = (o.spin || 0) + k * Math.PI / 2; line(wx, -13, wx + Math.cos(a) * 6, -13 + Math.sin(a) * 6, '#415564', 1.4) }
    circ(wx, -13, 2.2, '#263744') } c.restore() }
function tree(x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); const sw = Math.sin(NOW * 1.1 + x * .05) * 2.2; ell(0, 2, 22, 4, 'rgba(0,0,0,.35)'); line(0, 0, sw * .3, -42, '#3d3129', 6);
  circ(sw * .5, -56, 25, '#0f3229'); circ(-15 + sw * .6, -46, 18, '#164437'); circ(13 + sw * .8, -64, 18, '#1d5a48'); circ(4 + sw, -72, 11, '#27705a'); alpha(.5, () => circ(-6 + sw, -66, 5, '#3a8f72')); c.restore() }
function monitor(x, y, w, h, o = {}) { if (o.stand !== false) { c.fillStyle = '#22364a'; c.fillRect(x + w / 2 - 6, y + h + 6, 12, 18); c.fillRect(x + w / 2 - 30, y + h + 22, 60, 5) }
  box(x - 6, y - 6, w + 12, h + 12, '#22364a', 10, '#35506a', 1); box(x, y, w, h, '#040b13', 5); c.save(); rr(x, y, w, h, 5); c.clip(); c.fillStyle = grad(x, y, x + w, y + h, [[0, 'rgba(120,200,255,.08)'], [.5, 'rgba(120,200,255,0)']]); c.fillRect(x, y, w, h); c.restore() }
function doc(x, y, w, h, o = {}) { alpha(.45, () => box(x + 5, y + 8, w, h, 'rgba(0,0,0,.6)', 6)); box(x, y, w, h, o.fill || '#eef3f1', 6); if (o.head) { box(x, y, w, 34, o.head, [6, 6, 0, 0]); if (o.title) txt(o.title, x + 14, y + 23, 15, '#fff', 'left', 700) }
  const rows = o.rows || 5; for (let i = 0; i < rows; i++) { const yy = y + (o.head ? 56 : 24) + i * 22; c.fillStyle = '#c6d2d6'; c.fillRect(x + 14, yy, (w - 28) * (i % 3 === 2 ? .6 : .9), 6) } }
function phone(x, y, s = 1, fn) { c.save(); c.translate(x, y); c.scale(s, s); halo(0, 0, 190, A, .1); box(-60, -120, 120, 240, '#0d1824', 18, '#3a5266', 3); box(-52, -106, 104, 212, '#050d15', 8); c.save(); rr(-52, -106, 104, 212, 8); c.clip(); fn && fn(); c.restore(); box(-16, -114, 32, 4, '#3a5266', 2);
  c.save(); rr(-60, -120, 120, 240, 18); c.clip(); c.fillStyle = grad(-60, -120, 30, 60, [[0, 'rgba(255,255,255,.07)'], [.5, 'rgba(255,255,255,0)']]); c.fillRect(-60, -120, 120, 240); c.restore(); c.restore() }
function station(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const now = o.now ?? NOW;
  ell(90, 2, 112, 8, 'rgba(0,0,0,.48)'); rr(0, -120, 180, 120, 6); c.fillStyle = grad(0, -120, 0, 0, [[0, '#eef4f7'], [1, '#b9c9d2']]); c.fill(); c.fillStyle = '#a9bac4'; c.fillRect(0, -120, 180, 10); c.fillStyle = A; c.fillRect(0, -16, 180, 4);
  box(22, -92, 60, 60, '#0d1b28', 4, 'rgba(61,224,255,.4)'); for (let i = 0; i < 4; i++) { c.fillStyle = [P.cyan, P.mint, P.amber, P.violet][i]; c.globalAlpha = .6 + .4 * Math.sin(now * 3 + i); c.fillRect(30 + i * 13, -80, 8, 36 * (.4 + .5 * Math.abs(Math.sin(now + i)))); } c.globalAlpha = 1;
  box(104, -92, 56, 92, '#9fb0b8', 3); circ(150, -46, 3, '#5d707a');
  line(130, -120, 130, -186, '#c8d4db', 5); poly([[116, -198], [144, -198], [138, -186], [122, -186]], '#dfe8ed'); if (o.intake) rings(130, -192, now, A, 8, 60, 3, 1, .7);
  line(40, -120, 40, -170, '#c8d4db', 3); for (let k = 0; k < 3; k++) { const a = now * 8 + k * 2.09; circ(40 + Math.cos(a) * 12, -170 + Math.sin(a) * 3, 3.5, '#e8eef2') }
  txt(o.label || '대기측정소', 90, -104, 13, '#2a4658', 'center', 700); c.restore() }
function bars(x, y, w, h, vals, cols, o = {}) { const n = vals.length, bw = w / n * .6, gap = w / n; vals.forEach((v, i) => { const bh = h * clamp(v), col = Array.isArray(cols) ? cols[i] : cols, bx = x + i * gap + (gap - bw) / 2;
  glow(col, o.glow ?? 12, () => { rr(bx, y - bh, bw, Math.max(1, bh), [5, 5, 1, 1]); c.fillStyle = grad(0, y - bh, 0, y, [[0, shade(col, .2)], [1, rgba(col, .55)]]); c.fill() }); if (o.labels) txt(o.labels[i], x + i * gap + gap / 2, y + 22, 14, P.muted, 'center', 600) }) }
function spark(x, y, w, h, fn, k = 1, col = A, lw = 2.5) { c.beginPath(); const N = 80; for (let i = 0; i <= N * clamp(k); i++) { const q = i / N, yy = y - h * clamp(fn(q)); i ? c.lineTo(x + w * q, yy) : c.moveTo(x + w * q, yy) } c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); c.lineJoin = 'miter' }
function gauge(x, y, r, v, col = A, label, valTxt) { c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, Math.PI * .8, Math.PI * 2.2); c.strokeStyle = '#16293a'; c.lineWidth = 12; c.stroke();
  c.beginPath(); c.arc(x, y, r, Math.PI * .8, Math.PI * (.8 + 1.4 * clamp(v))); c.strokeStyle = col; glow(col, 16, () => c.stroke()); c.lineCap = 'butt';
  const a = Math.PI * (.8 + 1.4 * clamp(v)); halo(x + Math.cos(a) * r, y + Math.sin(a) * r, 16, col, .9); circ(x + Math.cos(a) * r, y + Math.sin(a) * r, 3.5, '#fff');
  if (valTxt) mono(valTxt, x, y + 8, r * .42, P.text, 'center', 700); if (label) txt(label, x, y + r * .72, 13, P.muted, 'center', 600) }
function mapGrid(x, y, w, h, o = {}) { alpha(.5, () => box(x + 5, y + 10, w, h, 'rgba(0,0,0,.55)', 14)); box(x, y, w, h, '#06101a', 14); c.save(); rr(x, y, w, h, 14); c.clip();
  const bs = o.block || 110; for (let bx = x - 10, i = 0; bx < x + w; bx += bs, i++) for (let by = y - 10, j = 0; by < y + h; by += bs, j++) { box(bx + 12, by + 12, bs - 24, bs - 24, '#0d1c29', 3); const hh = hash(i * 7 + j * 13); if (hh > .35) box(bx + 20, by + 20, (bs - 40) * (.4 + hh * .5), (bs - 40) * .45, '#12273a', 2); if (hh > .6) box(bx + 20, by + bs * .58, (bs - 40) * .5, (bs - 40) * .3, '#102233', 2) }
  for (let bx = x - 10; bx < x + w + 10; bx += bs) { line(bx, y, bx, y + h, '#14293c', 14, 'butt'); line(bx, y, bx, y + h, 'rgba(120,190,230,.06)', 1, 'butt') } for (let by = y - 10; by < y + h + 10; by += bs) { line(x, by, x + w, by, '#14293c', 14, 'butt'); line(x, by, x + w, by, 'rgba(120,190,230,.06)', 1, 'butt') }
  if (o.river) { c.lineCap = 'butt'; c.beginPath(); c.moveTo(x, y + h * .78); c.bezierCurveTo(x + w * .3, y + h * .6, x + w * .6, y + h * .95, x + w, y + h * .7); c.strokeStyle = 'rgba(61,150,255,.26)'; c.lineWidth = 30; c.stroke(); c.strokeStyle = 'rgba(140,210,255,.14)'; c.lineWidth = 2; c.setLineDash([14, 22]); c.lineDashOffset = -NOW * 14; c.stroke(); c.setLineDash([]) }
  const sx = x + ((NOW * .16) % 1.3) * w; c.fillStyle = grad(sx - 120, 0, sx, 0, [[0, rgba(A, 0)], [1, rgba(A, .07)]]); c.fillRect(sx - 120, y, 120, h);
  c.restore(); box(x, y, w, h, null, 14, '#1d3448') }
function haze(k, col = '160,140,110') { c.fillStyle = grad(0, 150, 0, 620, [[0, `rgba(${col},0)`], [1, `rgba(${col},${.5 * clamp(k)})`]]); c.fillRect(0, 150, W, 470) }

// ---------- camera ----------
// cams[i]: 함수 (u, now) → {x, y, z} · 키프레임 배열 [[t, x, y, z], …] · false(고정) · 생략(느린 자동 이동)
function camFor(i, u) { const spec = STORY.cams && STORY.cams[i]; let x = W / 2, y = H / 2, z = 1;
  if (typeof spec === 'function') { const r = spec(u, NOW) || {}; x = r.x ?? x; y = r.y ?? y; z = r.z ?? z }
  else if (Array.isArray(spec) && spec.length) { let a = spec[0], b = spec[spec.length - 1]; for (let j = 0; j < spec.length - 1; j++) if (u >= spec[j][0]) { a = spec[j]; b = spec[j + 1] } if (u <= spec[0][0]) b = a = spec[0]; if (u >= spec[spec.length - 1][0]) a = b = spec[spec.length - 1];
    const q = a === b ? 0 : eio((u - a[0]) / (b[0] - a[0])); x = lerp(a[1], b[1], q); y = lerp(a[2], b[2], q); z = lerp(a[3], b[3], q) }
  else if (spec !== false) { const q = smooth(u / 5.2), dir = i % 2 ? 1 : -1; z = i % 2 ? lerp(1.06, 1.012, q) : lerp(1.012, 1.06, q); x = W / 2 + dir * lerp(-14, 14, q); y = H / 2 + lerp(6, -6, q) }
  z = Math.max(1, z); const hw = W / 2 / z, hh = H / 2 / z; CAM.x = clamp(x, hw, W - hw); CAM.y = clamp(y, hh, H - hh); CAM.z = z }

// ---------- scene, transitions ----------
const STORY = {scenes: []};
function drawScene(i, ur, base, clipFn) {
  c.save(); B = base || IDENT; useBase(); c.beginPath(); if (clipFn) clipFn(); else c.rect(0, 0, W, H); c.clip();
  camFor(i, ur * PACE); c.translate(W / 2, H / 2); c.scale(CAM.z, CAM.z); c.translate(-CAM.x, -CAM.y);
  try { STORY.scenes[i](ur * PACE, T, NOW) } catch (e) { if (!drawScene.err) { drawScene.err = true; console.error(e) } }
  c.restore(); B = IDENT; useBase(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}
const zoomBase = z => [z, 0, 0, z, W / 2 * (1 - z), H / 2 * (1 - z)];
const TRANS = ['push', 'iris', 'blades', 'shutter', 'iris'];
function neon(x1, y1, x2, y2, a = 1) { alpha(a, () => { glow(A, 18, () => line(x1, y1, x2, y2, A, 4, 'butt')); line(x1, y1, x2, y2, '#fff', 1.5, 'butt') }) }
function transition(p, i, u) { const k = clamp(u / TR), e = eio(k), type = (STORY.trans && STORY.trans[i]) || TRANS[i % TRANS.length], up = SCENE + u, edge = Math.sin(k * Math.PI);
  if (type === 'push') { drawScene(p, up, [1, 0, 0, 1, -e * W, 0]); drawScene(i, u, [1, 0, 0, 1, (1 - e) * W, 0]); const sx = (1 - e) * W; neon(sx, 0, sx, H, edge); halo(sx, H / 2, 260, A, .25 * edge) }
  else if (type === 'blades') { const N = 8, sl = 170, bw = (W + sl) / N, ks = j => eio(clamp(k * 1.7 - j * .1)); drawScene(p, up, zoomBase(1 + e * .06));
    drawScene(i, u, IDENT, () => { for (let j = 0; j < N; j++) { const x0 = j * bw - sl, q = ks(j) * (bw + 1); c.moveTo(x0 + sl, 0); c.lineTo(x0 + sl + q, 0); c.lineTo(x0 + q, H); c.lineTo(x0, H); c.closePath() } });
    for (let j = 0; j < N; j++) { const q = ks(j); if (q > 0 && q < 1) { const x0 = j * bw - sl + q * bw; neon(x0 + sl, 0, x0, H, Math.sin(q * Math.PI)) } } }
  else if (type === 'shutter') { const N = 5, bh = H / N, ks = j => eio(clamp(k * 1.6 - j * .12)); drawScene(p, up, zoomBase(1 + e * .06));
    drawScene(i, u, IDENT, () => { for (let j = 0; j < N; j++) { const q = ks(j) * W; c.rect(j % 2 ? W - q : 0, j * bh, q, bh + 1) } });
    for (let j = 0; j < N; j++) { const q = ks(j); if (q > 0 && q < 1) { const x = j % 2 ? W - q * W : q * W; neon(x, j * bh, x, (j + 1) * bh, Math.sin(q * Math.PI)) } } }
  else { const R = e * 790, fx = STORY.focus && STORY.focus[i] ? STORY.focus[i][0] : W / 2, fy = STORY.focus && STORY.focus[i] ? STORY.focus[i][1] : H / 2; drawScene(p, up, zoomBase(1 + e * .14));
    drawScene(i, u, zoomBase(lerp(1.1, 1, e)), () => c.arc(fx, fy, R, 0, 6.2832)); alpha(edge, () => { glow(A, 22, () => circ(fx, fy, R, null, A, 5)); circ(fx, fy, R, null, '#fff', 1.5); circ(fx, fy, R + 16, null, rgba(P.mag, .6), 2) }) }
  c.fillStyle = `rgba(255,255,255,${(.1 * (1 - k) * edge).toFixed(3)})`; c.fillRect(0, 0, W, H);
}

// ---------- ambience, header, post ----------
function ambient(now) { for (let i = 0; i < 22; i++) { const sp = .012 + hash(i + 70) * .02, ph = (now * sp + hash(i + 50)) % 1, depth = .6 + hash(i + 90) * 1.2, x = (hash(i + 20) * (W + 200) - 100 + Math.sin(now * .3 + i) * 30 - (CAM.x - W / 2) * depth + W * 4) % (W + 200) - 100, y = H + 30 - ph * (H + 60) - (CAM.y - H / 2) * depth;
  halo(x, y, (3 + hash(i + 2) * 9) * depth, i % 4 ? '#cfe9ff' : A, (.1 + .16 * hash(i + 8)) * Math.sin(ph * Math.PI)) } }
function header(i, u) {
  c.fillStyle = grad(0, 0, 0, 170, [[0, 'rgba(2,6,12,.74)'], [1, 'rgba(2,6,12,0)']]); c.fillRect(0, 0, W, 170);
  mono(`수도권대기환경청  ·  ${D.department || ''}`, 44, 48, 13, A, 'left', 600);
  const px = W - 44 - 5 * 40; for (let j = 0; j < 5; j++) { box(px + j * 40, 41, 34, 4, 'rgba(255,255,255,.16)', 2); const f = j < i ? 1 : j > i ? 0 : u / SCENE; if (f > 0) glow(A, 8, () => box(px + j * 40, 41, Math.max(4, 34 * f), 4, A, 2)) }
  mono(`0${i + 1} / 05`, px - 14, 48, 13, P.muted, 'right', 600);
  if (STORY.hideTitle && STORY.hideTitle[i]) return;
  const name = D.names[i], dock = eio(seg(u, 1.0, 1.5)), wBig = tw(name, 116, 400, DISP), big = Math.min(116, 116 * 880 / wBig), size = lerp(big, 44, dock), x = lerp(92, 42, dock), y = lerp(430, 104, dock), open = eout(seg(u, .1, .45));
  if (dock < 1) { alpha((1 - dock) * open, () => { c.fillStyle = grad(0, 0, W, 0, [[0, 'rgba(2,6,12,.88)'], [.55, 'rgba(2,6,12,.52)'], [1, 'rgba(2,6,12,.1)']]); c.fillRect(0, 0, W, H) });
    alpha((1 - dock) * open, () => { c.font = `400 150px ${DISP}`; c.textAlign = 'left'; c.lineWidth = 2; c.strokeStyle = rgba(A, .75); const nx = 90 - (1 - open) * 50, nw = c.measureText(`0${i + 1}`).width; c.strokeText(`0${i + 1}`, nx, 292);
      mono('SCENE', nx + nw + 22, 222, 15, P.muted, 'left', 600); mono(D.department || '', nx + nw + 22, 248, 17, A, 'left', 600); txt(D.title || '', nx + nw + 22, 278, 17, P.text, 'left', 500); glow(A, 10, () => line(94, 318, 94 + 190 * open, 318, A, 3)) }) }
  glow('rgba(0,0,0,.8)', 14, () => kinetic(name, x, y, size, .2, u, P.text));
  const w = tw(name, size, 400, DISP), ul = eout(seg(u, .45, 1)); if (ul > 0) glow(A, 10, () => line(x + 4, y + size * .36, x + 4 + w * ul * lerp(.45, 1, dock), y + size * .36, A, lerp(5, 3, dock)));
  if (GUIDES) { c.strokeStyle = 'rgba(255,0,0,.8)'; c.lineWidth = 2; c.setLineDash([8, 6]); c.strokeRect(0, 0, 560, 140); c.strokeRect(840, 0, 360, 70); c.strokeRect(150, 622, 900, 98); c.setLineDash([]); mono('TITLE', 8, 134, 12, '#f66'); mono('SUBTITLE', 158, 640, 12, '#f66') }
}
const blm = document.createElement('canvas'), blm2 = document.createElement('canvas'); blm.width = 300; blm.height = 180; blm2.width = 76; blm2.height = 46; const bc = blm.getContext('2d'), bc2 = blm2.getContext('2d');
const grain = document.createElement('canvas'); grain.width = grain.height = 160; { const g = grain.getContext('2d'), im = g.createImageData(160, 160); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() < .5 ? 0 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.random() * 26 } g.putImageData(im, 0, 0) } let grainPat = null, vig = null;
function bloom() { if (Q < 2) return; bc.globalCompositeOperation = 'source-over'; bc.globalAlpha = 1; bc.drawImage(cv, 0, 0, 300, 180); bc.globalCompositeOperation = 'multiply'; bc.drawImage(blm, 0, 0); bc2.drawImage(blm, 0, 0, 76, 46);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.globalAlpha = .5; c.drawImage(blm2, 0, 0, cv.width, cv.height); c.globalAlpha = .28; c.drawImage(blm, 0, 0, cv.width, cv.height); c.restore() }
function post() { if (!vig) vig = rgrad(W / 2, H / 2, H * .42, H * 1.08, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.6)']]); c.fillStyle = vig; c.fillRect(0, 0, W, H);
  if (Q > 0) { if (!grainPat) grainPat = c.createPattern(grain, 'repeat'); c.save(); c.translate(Math.floor(Math.random() * 160), Math.floor(Math.random() * 160)); c.fillStyle = grainPat; c.globalAlpha = .3; c.fillRect(-160, -160, W + 320, H + 320); c.restore() } }

// ---------- player ----------
let T0guard = true;
const buttons = D.names.map((name, i) => { const b = document.createElement('button'); b.className = 'step'; b.type = 'button'; b.innerHTML = `<small>${i * SCENE}초</small><b>${name}</b><i></i>`;
  b.onclick = () => { T = i * SCENE + .02; T0guard = false; if (!playing) { playing = true; state() } cur = -2; }; $('steps').append(b); return b });
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const V = window.MAMO_VOICE.init({button: $('voice'), clips: D.voice || [], id: D.id,
  onEnable: () => { T = Math.floor(T / SCENE) * SCENE + .02; T0guard = false; if (!playing) { playing = true; state() } cur = -2 } });
const subtitleEl = $('subtitle'), subtitlesBtn = $('subtitles');
subtitlesBtn.onclick = () => { const on = subtitlesBtn.getAttribute('aria-pressed') !== 'true'; subtitlesBtn.setAttribute('aria-pressed', String(on)); subtitlesBtn.textContent = on ? '자막 끄기' : '자막 켜기'; subtitlesBtn.classList.toggle('on', on); subtitleEl.hidden = !on };
let T = reduce ? 3.6 : 0, playing = !reduce, last = performance.now(), cur = -1, slow = 0;
const qt = new URLSearchParams(location.search).get('t'); if (qt !== null && isFinite(+qt)) { T = clamp(+qt, 0, LOOP - .01); playing = false; T0guard = false }
function state() { $('play').textContent = playing ? '일시정지' : '재생' }
$('play').onclick = () => { playing = !playing; last = performance.now(); state(); if (!playing) V.stop(); else if (T % SCENE < 1) V.scene(Math.floor(T / SCENE)) };
$('replay').onclick = () => { T = 0; T0guard = false; playing = true; last = performance.now(); state(); cur = -2 };
function render(now) {
  NOW = now; SS = cv.width / W; B = IDENT; c.setTransform(SS, 0, 0, SS, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);
  const i = Math.min(4, Math.floor(T / SCENE)), u = T - i * SCENE;
  if (u < TR && !(T0guard && i === 0)) transition((i + 4) % 5, i, u); else drawScene(i, u, IDENT);
  camFor(i, u * PACE); ambient(now); bloom(); header(i, u); post();
  $('clock').textContent = `00:${String(Math.floor(T)).padStart(2, '0')} / 00:30`;
  if (cur !== i) { const fresh = cur !== -1; cur = i; $('capStep').textContent = `0${i + 1} ${D.names[i]}`; $('capText').textContent = D.captions[i]; subtitleEl.textContent = D.captions[i];
    buttons.forEach((b, j) => j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')); if (playing && (fresh || T < .5)) V.scene(i) }
  buttons.forEach((b, j) => b.querySelector('i').style.width = (j < i ? 100 : j > i ? 0 : u / SCENE * 100) + '%');
}
window.CINE_seek = (t, now) => { T = clamp(t, 0, LOOP - .01); playing = false; state(); T0guard = false; render(now ?? t * 1.37); return cv.toDataURL('image/jpeg', .8) };
function resize() { const w = cv.clientWidth || 800, cap = Q > 1 ? 2 : Q > 0 ? 1.5 : 1; cv.width = Math.round(w * Math.min(devicePixelRatio || 1, cap)); cv.height = Math.round(cv.width * H / W); render(performance.now() / 1000) }
new ResizeObserver(resize).observe(cv);
function frame(t) { const raw = (t - last) / 1000, dt = Math.max(0, Math.min(.1, raw)); last = t;
  if (playing && !document.hidden) { T += dt; if (T >= LOOP) { T -= LOOP; T0guard = false }
    if (raw > .045 && raw < .5) { if (++slow > 45 && Q > 0) { Q--; slow = 0; resize() } } else if (slow > 0) slow -= .5 }   // 느린 기기에서는 효과를 단계적으로 줄인다
  render(t / 1000); requestAnimationFrame(frame) }
window.CINE = {W, H, P, A, c, CAM, clamp, lerp, eio, eout, ein, back, spring, smooth, seg, fade, hash, wave, rgba, shade, rr, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, rgrad, tw, halo, kinetic, chip, panel, tick, cross, arrow, dashed, rings, counter, plume, dots,
  pop, slide, reveal, typeOn, trace, callout, checklist, burst, stamp, beam, shine, kpi, lineChart, speech, badge, layer, limb, curve, icon, pin, coin, card, hills,
  night, blueprint, lab, factory, tank, pipe, flange, person, van, truck, car, tree, monitor, doc, phone, station, bars, spark, gauge, mapGrid, haze,
  get now() { return NOW },
  story(def) { Object.assign(STORY, def); state(); resize(); requestAnimationFrame(frame);
    const g = (D.glyphs || '') + D.names.join('') + '0123456789/·%SCENE—'; if (document.fonts && document.fonts.load) Promise.all(['400 40px "Black Han Sans"', '500 16px "IBM Plex Sans KR"', '600 16px "IBM Plex Sans KR"', '700 16px "IBM Plex Sans KR"', '600 16px "JetBrains Mono"', '700 16px "JetBrains Mono"'].map(f => document.fonts.load(f, g).catch(() => {}))).then(() => render(performance.now() / 1000)) }};
})();
