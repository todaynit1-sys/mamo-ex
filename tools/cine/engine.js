/* 공기 한 줌의 여정 · 시네마틱 애니메이션 엔진
   30초(6초 × 5장면) 루프, 1200×720 논리 좌표, 네온 야간 톤.
   주제별 스크립트는 CINE.story({scenes:[fn×5]}) 로 장면을 등록한다. 각 장면 함수는 (u, T, now)를 받는다.
   u: 장면 안 연출 시간(0~4.8, 실제 6초를 0.8배로 받음), T: 전체 경과(0~30초), now: 실제 시계(초, 반복 연출용) */
(() => {
'use strict';
const D = window.STORY, W = 1200, H = 720, SCENE = 6, LOOP = 30, PACE = .8;
const cv = document.getElementById('cv'), c = cv.getContext('2d'), $ = id => document.getElementById(id);
const P = {bg0:'#040910', bg1:'#0a1726', bg2:'#11263a', line:'#1d3448', text:'#e8f1f5', muted:'#7f98a8', dim:'#4d6577',
  cyan:'#3de0ff', mag:'#ff3d9a', amber:'#ffb547', mint:'#5fe0b5', violet:'#a58bff', red:'#ff5a5a', green:'#57e39a', white:'#ffffff'};
const A = D.accent || P.cyan;
const DISP = '"Black Han Sans","IBM Plex Sans KR","Malgun Gothic",sans-serif', SANS = '"IBM Plex Sans KR","Malgun Gothic",sans-serif', MONO = '"JetBrains Mono",Consolas,monospace';

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }, eout = t => 1 - Math.pow(1 - clamp(t), 3);
const back = t => { t = clamp(t); const s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2) };
const fade = (u, a, b, d = .35) => clamp(Math.min((u - a) / d, (b - u) / d));
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n) };

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
function glow(col, blur, fn) { c.save(); c.shadowColor = col; c.shadowBlur = blur; fn(); c.restore() }
function alpha(a, fn) { if (a <= 0) return; c.save(); c.globalAlpha *= clamp(a); fn(); c.restore() }
function grad(x1, y1, x2, y2, stops) { const g = c.createLinearGradient(x1, y1, x2, y2); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g }
function tw(s, size, weight = 500, font = SANS) { c.font = `${weight} ${size}px ${font}`; return c.measureText(s).width }
function kinetic(s, x, y, size, t0, u, col = P.text) {
  c.font = `400 ${size}px ${DISP}`; c.textAlign = 'left'; let cx = x;
  for (let i = 0; i < s.length; i++) { const ch = s[i], w = c.measureText(ch).width, k = eout((u - t0 - i * .03) / .42);
    if (k > 0) { c.globalAlpha = k; c.fillStyle = col; c.fillText(ch, cx, y + (1 - k) * size * .45) } cx += w }
  c.globalAlpha = 1; return cx - x;
}
function chip(x, y, s, col = A, al = 'left', size = 14) { const w = tw(s, size, 600) + 18, X = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x;
  alpha(.18, () => box(X, y - size - 3, w, size + 11, col, (size + 11) / 2)); box(X, y - size - 3, w, size + 11, null, (size + 11) / 2, col, 1.2); txt(s, X + 9, y + 1, size, col, 'left', 600); return w }
function panel(x, y, w, h, title, sub, col = A) {
  box(x, y, w, h, 'rgba(6,13,22,.88)', 14, 'rgba(61,224,255,.18)');
  line(x + 18, y + 1, x + 70, y + 1, col, 3);
  if (title) txt(title, x + 20, y + 36, 19, P.text, 'left', 700);
  if (sub) mono(sub, x + 20, y + 58, 12, P.muted, 'left', 500);
}
function tick(x, y, k = 1, col = P.green, s = 1) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-9, 0); const a = clamp(k * 2), b = clamp(k * 2 - 1);
  c.lineTo(lerp(-9, -2, a), lerp(0, 8, a)); if (b > 0) c.lineTo(lerp(-2, 13, b), lerp(8, -10, b)); c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); c.restore() }
function cross(x, y, k = 1, col = P.red) { if (k <= 0) return; const d = 8 * clamp(k); line(x - d, y - d, x + d, y + d, col, 4); line(x + d, y - d, x - d, y + d, col, 4) }
function arrow(x1, y1, x2, y2, col = A, w = 3, head = 12, k = 1) { const x = lerp(x1, x2, clamp(k)), y = lerp(y1, y2, clamp(k)); line(x1, y1, x, y, col, w); const a = Math.atan2(y2 - y1, x2 - x1);
  if (k > .05) poly([[x, y], [x - head * Math.cos(a - .45), y - head * Math.sin(a - .45)], [x - head * Math.cos(a + .45), y - head * Math.sin(a + .45)]], col) }
function dashed(x1, y1, x2, y2, col, w, now, dash = [8, 8], speed = 30) { c.save(); c.setLineDash(dash); c.lineDashOffset = -now * speed; line(x1, y1, x2, y2, col, w); c.restore() }
function rings(x, y, now, col = A, r0 = 10, r1 = 70, n = 3, speed = .9, a = 1, lw = 2) { for (let k = 0; k < n; k++) { const ph = (now * speed + k / n) % 1; alpha(a * (1 - ph), () => circ(x, y, lerp(r0, r1, ph), null, col, lw)) } }
function counter(v, dp = 0) { return v.toLocaleString('ko-KR', {minimumFractionDigits: dp, maximumFractionDigits: dp}) }
// stateless smoke/particle plume: seed-based, loops forever
function plume(x, y, now, o = {}) { const n = o.n || 16, len = o.len || 120, dx = o.dx ?? 30, col = o.col || 'rgba(190,200,210,', sp = o.speed || .35, r0 = o.r0 || 4, r1 = o.r1 || 16, a0 = o.a ?? .5;
  for (let i = 0; i < n; i++) { const ph = (now * sp + i / n + (o.seed || 0)) % 1, wob = Math.sin(ph * 6 + i * 2.1) * (o.wob ?? 8);
    circ(x + dx * ph + wob, y - len * ph, lerp(r0, r1, ph), col + (a0 * (1 - ph)).toFixed(3) + ')') } }
function dots(pts, now, col = A, n = 6, r = 3.2, speed = .5) { // particles flowing along a polyline
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d }
  for (let j = 0; j < n; j++) { let s = ((now * speed + j / n) % 1) * tot, i = 0; while (i < L.length - 1 && s > L[i]) { s -= L[i]; i++ } const q = s / L[i];
    glow(col, 10, () => circ(lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q), r, col)) } }

// ---------- backdrops ----------
const STARS = Array.from({length: 70}, (_, i) => ({x: hash(i) * W, y: hash(i + 99) * 330, r: hash(i + 7) * 1.3 + .3, p: hash(i + 3) * 6}));
const SKY = []; for (let x = -20, i = 0; x < W + 60; i++) { const w = 34 + hash(i * 3.1) * 64, h = 60 + hash(i * 1.7) * 190; SKY.push({x, w, h, b: h > 210}); x += w + 4 + hash(i * 5.3) * 12 }
function night(now, o = {}) {
  const gy = o.ground ?? 600;
  c.fillStyle = grad(0, 0, 0, gy, [[0, '#03070c'], [.72, '#0b1a28'], [1, o.haze || '#1b2238']]); c.fillRect(0, 0, W, gy);
  c.fillStyle = grad(0, gy - 150, 0, gy, [[0, 'rgba(255,61,154,0)'], [1, o.glow || 'rgba(255,61,154,.12)']]); c.fillRect(0, gy - 150, W, 150);
  for (const s of STARS) { if (s.y > gy - 140) continue; c.globalAlpha = .3 + .35 * Math.sin(now * 1.4 + s.p); c.fillStyle = '#cfe6f5'; c.fillRect(s.x, s.y, s.r, s.r) } c.globalAlpha = 1;
  if (o.skyline !== false) { const off = -((now * (o.pan || 0)) % 400); for (const b of SKY) { const x = b.x + off; c.fillStyle = '#08131e'; c.fillRect(x, gy - b.h * (o.city || 1), b.w, b.h * (o.city || 1));
    if (b.b && Math.sin(now * 3 + b.x) > .3) { c.fillStyle = '#ff4a4a'; c.fillRect(x + b.w / 2 - 2, gy - b.h * (o.city || 1) - 4, 4, 4) } } }
  c.fillStyle = o.floor || '#070d14'; c.fillRect(0, gy, W, H - gy); c.fillStyle = '#16283a'; c.fillRect(0, gy, W, 2);
  c.fillStyle = grad(0, gy, 0, H, [[0, 'rgba(61,224,255,.07)'], [1, 'rgba(61,224,255,0)']]); c.fillRect(0, gy, W, H - gy);
  if (o.grid !== false) { c.save(); c.beginPath(); c.rect(0, gy + 2, W, H - gy); c.clip(); const vx = W / 2, off = ((now * (o.gridSpeed || 0)) % 1);
    for (let k = -14; k <= 14; k++) line(vx + k * 26, gy, vx + k * 190, H + 40, 'rgba(61,224,255,.07)', 1, 'butt');
    for (let j = 0; j < 8; j++) { const q = Math.pow((j + off) / 8, 1.8), y = gy + (H - gy) * q; line(0, y, W, y, 'rgba(61,224,255,' + (.03 + .06 * q).toFixed(3) + ')', 1, 'butt') } c.restore() }
}
function blueprint() { c.fillStyle = P.bg0; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(61,224,255,.05)'; c.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) line(x, 0, x, H, 'rgba(61,224,255,.05)', 1, 'butt'); for (let y = 0; y <= H; y += 40) line(0, y, W, y, 'rgba(61,224,255,.05)', 1, 'butt');
  c.fillStyle = grad(0, 0, 0, H, [[0, 'rgba(61,224,255,.04)'], [1, 'rgba(255,61,154,.04)']]); c.fillRect(0, 0, W, H) }
function lab(floorY = 560) { c.fillStyle = grad(0, 0, 0, floorY, [[0, '#0a1622'], [1, '#12263a']]); c.fillRect(0, 0, W, floorY);
  for (let x = 0; x < W; x += 120) line(x, 0, x, floorY, 'rgba(61,224,255,.04)', 1, 'butt');
  for (const lx of [260, 600, 940]) { c.fillStyle = '#dff4ff'; c.fillRect(lx - 60, 0, 120, 5); c.fillStyle = grad(0, 0, 0, 260, [[0, 'rgba(223,244,255,.12)'], [1, 'rgba(223,244,255,0)']]);
    poly([[lx - 60, 5], [lx + 60, 5], [lx + 130, 260], [lx - 130, 260]], c.fillStyle) }
  c.fillStyle = '#1b2f40'; c.fillRect(0, floorY, W, 14); c.fillStyle = '#0b1622'; c.fillRect(0, floorY + 14, W, H - floorY - 14);
  for (let x = 20; x < W; x += 150) box(x, floorY + 26, 136, H - floorY - 40, null, 6, '#16293a') }

// ---------- objects ----------
function factory(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s);
  const w = o.w || 260, h = o.h || 130, col = o.col || '#10202f';
  c.fillStyle = col; c.fillRect(0, -h, w, h); const n = Math.floor(w / 60); c.beginPath(); c.moveTo(0, -h);
  for (let i = 0; i < n; i++) { c.lineTo(i * w / n, -h - 26); c.lineTo((i + 1) * w / n, -h) } c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,196,110,.55)'; for (let wx = 16; wx < w - 16; wx += 24) c.fillRect(wx, -h + 30, 10, 12);
  if (o.label) txt(o.label, 16, -18, 16, '#9db2bf', 'left', 700);
  if (o.stack !== false) { const sx = o.sx ?? w * .72, sh = o.sh || 150; c.fillStyle = '#16304a'; c.fillRect(sx - 12, -h - sh, 24, sh + 2); c.fillStyle = '#b8554a'; c.fillRect(sx - 12, -h - sh + 12, 24, 9);
    c.fillStyle = Math.sin((o.now || 0) * 4 + x) > 0 ? '#ff4a4a' : '#4a1a1a'; c.fillRect(sx - 2, -h - sh - 6, 4, 4);
    if (o.smoke) plume(sx, -h - sh - 6, o.now || 0, {col: o.smokeCol || 'rgba(190,200,210,', a: o.smokeA ?? .45, len: 140, dx: 50, n: 14}) }
  c.restore() }
function tank(x, y, s = 1, col = '#223e52') { c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = grad(-50, 0, 50, 0, [[0, '#15293a'], [.4, col], [1, '#0f1e2b']]); c.fillRect(-50, -140, 100, 140);
  ell(0, -140, 50, 14, '#34566c'); ell(0, 0, 50, 12, '#0f1e2b'); for (const yy of [-100, -55]) line(-50, yy, 50, yy, 'rgba(159,176,187,.35)', 2);
  line(38, -138, 38, -4, '#6b8797', 2); for (let j = 0; j < 8; j++) line(30, -128 + j * 16, 46, -128 + j * 16, '#6b8797', 1.5); c.restore() }
function pipe(pts, col = '#2a4a60', w = 12) { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'round'; c.stroke();
  c.strokeStyle = 'rgba(200,220,230,.18)'; c.lineWidth = w * .3; c.stroke(); c.lineJoin = 'miter' }
function flange(x, y, vert = false) { c.fillStyle = '#6b8797'; if (vert) c.fillRect(x - 11, y - 3, 22, 6); else c.fillRect(x - 3, y - 11, 6, 22) }
function person(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  const now = o.now || 0, pose = o.pose || 'stand', vest = o.vest || '#f08a2e', sw = pose === 'walk' ? Math.sin(now * 9) * 7 : 0;
  ell(0, 2, 18, 4, 'rgba(0,0,0,.35)'); c.lineCap = 'round';
  c.strokeStyle = '#27415a'; c.lineWidth = 7; line(-4, -32, -4 + sw, -2, '#27415a', 7); line(4, -32, 4 - sw, -2, '#27415a', 7);
  box(-11, -64, 22, 34, vest, 6); c.fillStyle = '#f3f0d8'; c.fillRect(-11, -52, 22, 3); c.fillRect(-11, -43, 22, 3);
  if (pose === 'point') { line(-8, -58, -12, -36, vest, 6); line(8, -58, 30, -70, vest, 6) }
  else if (pose === 'tablet') { line(-8, -58, 14, -44, vest, 6); line(8, -58, 18, -46, vest, 6); box(10, -56, 20, 15, '#0d1b28', 3, A, 1.5); alpha(.6 + .4 * Math.sin(now * 5), () => c.fillRect(13, -53, 14, 9)) }
  else if (pose === 'probe') { line(-8, -58, 22, -44, vest, 6); line(8, -58, 26, -42, vest, 6) }
  else { line(-8, -58, -10 - sw * .6, -36, vest, 6); line(8, -58, 10 + sw * .6, -36, vest, 6) }
  circ(0, -73, 8, '#e8c4a0'); if (o.helmet !== false) { c.fillStyle = o.hat || '#f5c542'; c.beginPath(); c.arc(0, -76, 10, Math.PI, 0); c.fill(); c.fillRect(-12, -77, 24, 3) }
  else { c.fillStyle = '#2a2320'; c.beginPath(); c.arc(0, -76, 9, Math.PI, 0); c.fill() }
  c.lineCap = 'butt'; c.restore() }
function van(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const now = o.now || 0;
  if (o.beam) { c.globalCompositeOperation = 'lighter'; c.fillStyle = grad(300, 0, 700, 0, [[0, 'rgba(220,240,255,.28)'], [1, 'rgba(220,240,255,0)']]); poly([[300, -62], [740, -120], [740, 30], [300, -46]], c.fillStyle); c.globalCompositeOperation = 'source-over' }
  ell(150, 2, 160, 7, 'rgba(0,0,0,.5)');
  if (o.mast !== false) { const mh = o.mastH ?? 70; line(48, -122, 48, -122 - mh, '#c8d4db', 5); poly([[34, -134 - mh], [62, -134 - mh], [55, -122 - mh], [41, -122 - mh]], '#dfe8ed'); if (o.intake) rings(48, -128 - mh, now, A, 8, 70, 3, 1.1, .7) }
  c.fillStyle = grad(0, -124, 0, -20, [[0, '#f6f9fb'], [1, '#b9c7d0']]); c.beginPath(); c.moveTo(8, -20); c.lineTo(4, -104); c.quadraticCurveTo(6, -124, 26, -124); c.lineTo(216, -126);
  c.quadraticCurveTo(232, -126, 244, -112); c.lineTo(278, -76); c.quadraticCurveTo(284, -70, 296, -66); c.lineTo(306, -62); c.quadraticCurveTo(314, -58, 314, -46); c.lineTo(314, -26); c.quadraticCurveTo(314, -20, 306, -20); c.closePath(); c.fill();
  c.save(); c.clip(); c.fillStyle = grad(0, 0, 314, 0, [[0, A], [.6, '#7b8cff'], [1, P.mag]]); poly([[0, -50], [314, -54], [314, -40], [0, -36]], c.fillStyle); c.restore();
  poly([[222, -114], [242, -114], [270, -80], [222, -80]], '#10202c', 'rgba(61,224,255,.5)', 1.2);
  txt(o.label || '수도권대기환경청', 18, -80, 23, '#0c1d2a', 'left', 400, DISP); if (o.sub) mono(o.sub, 20, -62, 11, '#1d4a63', 'left', 700);
  box(104, -136, 72, 11, '#1a2733', 5); const bl = Math.sin(now * 9) > 0; glow(bl ? A : P.mag, 18, () => { box(107, -134, 32, 7, bl ? A : '#16414d', 3); box(141, -134, 32, 7, bl ? '#4d1631' : P.mag, 3) });
  glow('#fff3cf', 16, () => box(304, -60, 9, 9, '#ffe9b0', 2)); glow('#ff3b3b', 14, () => box(4, -64, 5, 13, '#ff3b3b', 2));
  for (const wx of [70, 262]) { circ(wx, -22, 23, '#05080c'); circ(wx, -22, 12, '#9fb3bf'); for (let k = 0; k < 5; k++) { const a = (o.spin || 0) + k * 1.2566; line(wx, -22, wx + Math.cos(a) * 11, -22 + Math.sin(a) * 11, '#3b4d59', 2.5) } circ(wx, -22, 4, '#1d2a33') }
  c.restore() }
function truck(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const now = o.now || 0, old = o.old;
  ell(140, 2, 150, 7, 'rgba(0,0,0,.5)');
  const body = old ? '#5b5f6e' : (o.col || '#dfe8ec'), cab = old ? '#6c7182' : (o.cab || '#cfdadf');
  box(0, -118, 190, 92, body, 6); if (old) { c.fillStyle = 'rgba(90,60,40,.35)'; for (let i = 0; i < 6; i++) c.fillRect(12 + i * 30, -110 + (i % 2) * 20, 14, 30) }
  c.beginPath(); c.moveTo(194, -26); c.lineTo(194, -96); c.lineTo(250, -96); c.lineTo(282, -56); c.lineTo(282, -26); c.closePath(); c.fillStyle = cab; c.fill();
  poly([[204, -88], [244, -88], [266, -60], [204, -60]], '#10202c'); c.fillStyle = old ? '#3b3f4b' : A; c.fillRect(0, -34, 282, 7);
  if (o.label) txt(o.label, 95, -68, 17, old ? '#d0d3da' : '#10202c', 'center', 700);
  if (o.exhaust !== false) { c.fillStyle = '#39424c'; c.fillRect(-12, -40, 16, 6); if (o.smoke) plume(-14, -38, now, {col: old ? 'rgba(40,40,44,' : 'rgba(200,210,220,', a: old ? .85 : .25, len: 90, dx: -110, n: 16, r0: 5, r1: old ? 30 : 14, speed: .6, wob: 10}) }
  glow('#fff3cf', 14, () => box(274, -54, 8, 9, '#ffe9b0', 2));
  for (const wx of [52, 236]) { circ(wx, -18, 22, '#05080c'); circ(wx, -18, 11, '#8f9ea8'); for (let k = 0; k < 5; k++) { const a = (o.spin || 0) + k * 1.2566; line(wx, -18, wx + Math.cos(a) * 10, -18 + Math.sin(a) * 10, '#3b4d59', 2.5) } }
  c.restore() }
function car(x, y, s = 1, col = '#4d7bd6', o = {}) { c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); ell(60, 2, 64, 5, 'rgba(0,0,0,.45)');
  c.beginPath(); c.moveTo(0, -18); c.lineTo(4, -34); c.lineTo(30, -38); c.lineTo(46, -56); c.lineTo(92, -56); c.lineTo(110, -38); c.lineTo(122, -34); c.lineTo(124, -18); c.closePath(); c.fillStyle = col; c.fill();
  poly([[50, -52], [70, -52], [70, -38], [36, -38]], '#10202c'); poly([[74, -52], [90, -52], [104, -38], [74, -38]], '#10202c');
  glow('#fff3cf', 12, () => box(116, -32, 7, 6, '#ffe9b0', 2)); box(0, -32, 5, 6, '#ff3b3b', 2);
  for (const wx of [28, 98]) { circ(wx, -12, 12, '#05080c'); circ(wx, -12, 5, '#8f9ea8') } c.restore() }
function tree(x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); line(0, 0, 0, -40, '#3a2f28', 6); circ(0, -56, 24, '#12382f'); circ(-14, -46, 17, '#18483b'); circ(12, -64, 17, '#1e5a48'); c.restore() }
function monitor(x, y, w, h, o = {}) { box(x - 6, y - 6, w + 12, h + 12, '#22364a', 10); box(x, y, w, h, '#050d15', 5); if (o.stand !== false) { c.fillStyle = '#22364a'; c.fillRect(x + w / 2 - 6, y + h + 6, 12, 18); c.fillRect(x + w / 2 - 30, y + h + 22, 60, 5) } }
function doc(x, y, w, h, o = {}) { box(x, y, w, h, o.fill || '#eef3f1', 6); if (o.head) { box(x, y, w, 34, o.head, [6, 6, 0, 0]); if (o.title) txt(o.title, x + 14, y + 23, 15, '#fff', 'left', 700) }
  const rows = o.rows || 5; for (let i = 0; i < rows; i++) { const yy = y + (o.head ? 56 : 24) + i * 22; c.fillStyle = '#c6d2d6'; c.fillRect(x + 14, yy, (w - 28) * (i % 3 === 2 ? .6 : .9), 6) } }
function phone(x, y, s = 1, fn) { c.save(); c.translate(x, y); c.scale(s, s); box(-60, -120, 120, 240, '#0d1824', 18, '#3a5266', 3); box(-52, -106, 104, 212, '#050d15', 8); c.save(); rr(-52, -106, 104, 212, 8); c.clip(); fn && fn(); c.restore(); box(-16, -114, 32, 4, '#3a5266', 2); c.restore() }
function station(x, y, s = 1, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const now = o.now || 0;
  ell(90, 2, 110, 7, 'rgba(0,0,0,.45)'); box(0, -120, 180, 120, '#d9e3e8', 6); c.fillStyle = '#b8c7cf'; c.fillRect(0, -120, 180, 10);
  box(22, -92, 60, 60, '#0d1b28', 4, 'rgba(61,224,255,.4)'); for (let i = 0; i < 4; i++) { c.fillStyle = [P.cyan, P.mint, P.amber, P.violet][i]; c.globalAlpha = .6 + .4 * Math.sin(now * 3 + i); c.fillRect(30 + i * 13, -80, 8, 36 * (.4 + .5 * Math.abs(Math.sin(now + i)))); } c.globalAlpha = 1;
  box(104, -92, 56, 92, '#9fb0b8', 3); circ(150, -46, 3, '#5d707a');
  line(130, -120, 130, -186, '#c8d4db', 5); poly([[116, -198], [144, -198], [138, -186], [122, -186]], '#dfe8ed'); if (o.intake) rings(130, -192, now, A, 8, 60, 3, 1, .7);
  line(40, -120, 40, -170, '#c8d4db', 3); for (let k = 0; k < 3; k++) { const a = now * 8 + k * 2.09; circ(40 + Math.cos(a) * 12, -170 + Math.sin(a) * 3, 3.5, '#e8eef2') }
  txt(o.label || '대기측정소', 90, -104, 13, '#2a4658', 'center', 700); c.restore() }
function bars(x, y, w, h, vals, cols, o = {}) { const n = vals.length, bw = w / n * .6, gap = w / n; vals.forEach((v, i) => { const bh = h * clamp(v); const col = Array.isArray(cols) ? cols[i] : cols;
  glow(col, o.glow ?? 12, () => box(x + i * gap + (gap - bw) / 2, y - bh, bw, Math.max(1, bh), col, 4)); if (o.labels) txt(o.labels[i], x + i * gap + gap / 2, y + 22, 14, P.muted, 'center', 600) }) }
function spark(x, y, w, h, fn, k = 1, col = A, lw = 2.5) { c.beginPath(); const N = 80; for (let i = 0; i <= N * clamp(k); i++) { const q = i / N, yy = y - h * clamp(fn(q)); i ? c.lineTo(x + w * q, yy) : c.moveTo(x + w * q, yy) } c.strokeStyle = col; c.lineWidth = lw; c.stroke() }
function gauge(x, y, r, v, col = A, label, valTxt) { c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, Math.PI * .8, Math.PI * 2.2); c.strokeStyle = '#16293a'; c.lineWidth = 12; c.stroke();
  c.beginPath(); c.arc(x, y, r, Math.PI * .8, Math.PI * (.8 + 1.4 * clamp(v))); c.strokeStyle = col; glow(col, 16, () => c.stroke()); c.lineCap = 'butt';
  if (valTxt) mono(valTxt, x, y + 8, r * .42, P.text, 'center', 700); if (label) txt(label, x, y + r * .72, 13, P.muted, 'center', 600) }
function mapGrid(x, y, w, h, o = {}) { box(x, y, w, h, '#07111a', 14); c.save(); rr(x, y, w, h, 14); c.clip();
  const bs = o.block || 110; for (let bx = x - 10; bx < x + w; bx += bs) for (let by = y - 10; by < y + h; by += bs) box(bx + 12, by + 12, bs - 24, bs - 24, '#0d1c29', 3);
  for (let bx = x - 10; bx < x + w + 10; bx += bs) line(bx, y, bx, y + h, '#12283a', 14, 'butt'); for (let by = y - 10; by < y + h + 10; by += bs) line(x, by, x + w, by, '#12283a', 14, 'butt');
  if (o.river) { c.strokeStyle = 'rgba(61,150,255,.25)'; c.lineWidth = 30; c.beginPath(); c.moveTo(x, y + h * .78); c.bezierCurveTo(x + w * .3, y + h * .6, x + w * .6, y + h * .95, x + w, y + h * .7); c.stroke() }
  c.restore(); box(x, y, w, h, null, 14, '#1d3448') }
function haze(k, col = '160,140,110') { c.fillStyle = grad(0, 150, 0, 620, [[0, `rgba(${col},0)`], [1, `rgba(${col},${.5 * clamp(k)})`]]); c.fillRect(0, 150, W, 470) }

// ---------- post, header, transitions ----------
const scan = document.createElement('canvas'); scan.width = 4; scan.height = 4; { const s = scan.getContext('2d'); s.fillStyle = 'rgba(0,0,0,.2)'; s.fillRect(0, 0, 4, 1) } let scanPat = null;
function post() { c.fillStyle = (() => { const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); return g })(); c.fillRect(0, 0, W, H);
  if (!scanPat) scanPat = c.createPattern(scan, 'repeat'); c.fillStyle = scanPat; c.globalAlpha = .45; c.fillRect(0, 0, W, H); c.globalAlpha = 1 }
function header(i, u) {
  mono(`수도권대기환경청  ·  ${D.department || ''}`, 44, 48, 13, A, 'left', 600);
  mono(`0${i + 1} / 05`, W - 44, 48, 13, P.muted, 'right', 600);
  const hide = STORY.hideTitle && STORY.hideTitle[i]; if (hide) return;
  c.fillStyle = grad(0, 0, 0, 150, [[0, 'rgba(3,7,12,.7)'], [1, 'rgba(3,7,12,0)']]); c.fillRect(0, 0, W, 150);
  kinetic(D.names[i], 42, 104, 44, .15, u, P.text);
  alpha(eout((u - .45) / .4), () => { const w = tw(D.names[i], 44, 400, DISP); line(46, 120, 46 + Math.min(w, 60 + w * eout((u - .45) / .6)), 120, A, 3) });
}
function wipe(i, u) { if (u > .55 || (i === 0 && T0guard)) return; const k = u / .55, x = lerp(-420, W + 420, eio(k));
  c.fillStyle = (() => { const g = c.createLinearGradient(x - 220, 0, x + 220, 0); g.addColorStop(0, 'rgba(61,224,255,0)'); g.addColorStop(.45, 'rgba(61,224,255,.85)'); g.addColorStop(.55, 'rgba(255,61,154,.85)'); g.addColorStop(1, 'rgba(255,61,154,0)'); return g })();
  poly([[x - 170, 0], [x + 270, 0], [x + 170, H], [x - 270, H]], c.fillStyle); c.fillStyle = `rgba(255,255,255,${.22 * (1 - k)})`; c.fillRect(0, 0, W, H) }
let T0guard = true;

// ---------- player ----------
const STORY = {scenes: []};
const buttons = D.names.map((name, i) => { const b = document.createElement('button'); b.className = 'step'; b.type = 'button'; b.innerHTML = `<small>${i * SCENE}초</small><b>${name}</b><i></i>`;
  b.onclick = () => { T = i * SCENE + .02; T0guard = false; if (!playing) { playing = true; state() } cur = -2; }; $('steps').append(b); return b });
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const V = window.MAMO_VOICE.init({button: $('voice'), clips: D.voice || [], id: D.id,
  onEnable: () => { T = Math.floor(T / SCENE) * SCENE + .02; T0guard = false; if (!playing) { playing = true; state() } cur = -2 } });
let T = V.on ? 0 : 1.6, playing = !reduce, last = performance.now(), cur = -1;
const qt = new URLSearchParams(location.search).get('t'); if (qt !== null && isFinite(+qt)) { T = clamp(+qt, 0, LOOP - .01); playing = false; T0guard = false }
function state() { $('play').textContent = playing ? '일시정지' : '재생' }
$('play').onclick = () => { playing = !playing; last = performance.now(); state(); if (!playing) V.stop(); else if (T % SCENE < 1) V.scene(Math.floor(T / SCENE)) };
$('replay').onclick = () => { T = 0; T0guard = false; playing = true; last = performance.now(); state(); cur = -2 };
function render(now) {
  const s = cv.width / W; c.setTransform(s, 0, 0, s, 0, 0); c.clearRect(0, 0, W, H);
  const i = Math.min(4, Math.floor(T / SCENE)), u = T - i * SCENE;
  c.save(); try { STORY.scenes[i](u * PACE, T, now) } catch (e) { console.error(e) } c.restore();
  header(i, u); post(); wipe(i, u);
  $('clock').textContent = `00:${String(Math.floor(T)).padStart(2, '0')} / 00:30`;
  if (cur !== i) { const fresh = cur !== -1; cur = i; $('capStep').textContent = `0${i + 1} ${D.names[i]}`; $('capText').textContent = D.captions[i];
    buttons.forEach((b, j) => j === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')); if (playing && (fresh || T < .5)) V.scene(i) }
  buttons.forEach((b, j) => b.querySelector('i').style.width = (j < i ? 100 : j > i ? 0 : u / SCENE * 100) + '%');
}
window.CINE_seek = t => { T = clamp(t, 0, LOOP - .01); playing = false; state(); T0guard = false; render(t * 1.37); return cv.toDataURL('image/jpeg', .8) };
function resize() { const w = cv.clientWidth || 800; cv.width = Math.round(w * Math.min(devicePixelRatio || 1, 2)); cv.height = Math.round(cv.width * H / W); render(performance.now() / 1000) }
new ResizeObserver(resize).observe(cv);
function frame(t) { const dt = Math.max(0, Math.min(.1, (t - last) / 1000)); last = t; if (playing && !document.hidden) { T += dt; if (T >= LOOP) { T -= LOOP; T0guard = false } } render(t / 1000); requestAnimationFrame(frame) }
window.CINE = {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, hash, rr, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, tw, kinetic, chip, panel, tick, cross, arrow, dashed, rings, counter, plume, dots,
  night, blueprint, lab, factory, tank, pipe, flange, person, van, truck, car, tree, monitor, doc, phone, station, bars, spark, gauge, mapGrid, haze,
  story(def) { Object.assign(STORY, def); state(); resize(); requestAnimationFrame(frame);
    const g = (D.glyphs || '') + D.names.join('') + '0123456789/·%'; if (document.fonts && document.fonts.load) Promise.all(['400 40px "Black Han Sans"', '500 16px "IBM Plex Sans KR"', '700 16px "IBM Plex Sans KR"', '600 16px "JetBrains Mono"'].map(f => document.fonts.load(f, g).catch(() => {}))).then(() => render(performance.now() / 1000)) }};
})();
