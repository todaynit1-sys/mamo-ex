// 자동차관리과 · 운행차 배출가스 저감 — 모션그래픽 v2
(() => {
const {P, A, c, W, H, clamp, lerp, eio, eout, smooth, seg, hash, rgba, shade, rr, box, line, poly, circ, ell, txt, glow, alpha, grad, halo, panel, chip, rings, dots, plume, pop, slide, reveal, trace, callout, checklist, burst, stamp, badge, beam, shine, icon, coin, curve, night, blueprint, truck, person, gauge, haze} = CINE;
const GY = 520, RY = 618, SOOT = '#857a80', RUST = '#d0a988', CLEAN = P.mint;

// ----- 공용 그림 -----
function lamp(x, y) { line(x, y, x, y - 190, '#2a3d4e', 5); line(x, y - 190, x + 46, y - 198, '#2a3d4e', 4); box(x + 34, y - 204, 30, 9, '#3b5468', 4); beam(x + 49, y - 194, Math.PI / 2, 196, 80, '#ffe2a8', .12); halo(x + 49, y - 194, 56, '#ffe2a8', .5); circ(x + 49, y - 195, 4, '#fff3cf') }
// 옆에서 본 도로: 연석(GY) 아래가 아스팔트. scroll은 왼쪽으로 흘러간 거리(차가 오른쪽으로 달리는 느낌).
function street(now, o = {}) { const scroll = o.scroll || 0;
  night(now, {ground: GY, city: 1, grid: false, glow: o.glow || 'rgba(165,139,255,.16)', pan: o.pan || 0, tint: o.tint});
  for (let i = 0; i < 5; i++) lamp((((i * 320 + 60 - scroll) % 1600) + 1600) % 1600 - 200, GY + 6);
  c.fillStyle = grad(0, GY, 0, GY + 18, [[0, '#32475a'], [1, '#1b2a36']]); c.fillRect(0, GY, W, 18); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(0, GY, W, 1.5);
  c.fillStyle = grad(0, GY + 18, 0, H, [[0, '#141e28'], [1, '#080d13']]); c.fillRect(0, GY + 18, W, H - GY - 18);
  const off = -(scroll % 180); c.fillStyle = 'rgba(225,235,240,.4)'; for (let x = off - 180; x < W + 180; x += 180) c.fillRect(x, 574, 86, 4);
  const off2 = -((scroll * 1.2) % 230); c.fillStyle = 'rgba(225,235,240,.55)'; for (let x = off2 - 230; x < W + 230; x += 230) c.fillRect(x, 668, 118, 6) }
// 차 뒤(왼쪽)로 길게 끌리며 피어오르는 매연
function smoke(x, y, now, k = 1, o = {}) { if (k <= 0) return; const n = o.n || 24, len = o.len || 320, rise = o.rise || 130;
  for (let i = 0; i < n; i++) { const q = (now * (o.speed || .5) + i / n) % 1, wob = Math.sin(i * 2.7 + q * 6) * 12 * q;
    halo(x - q * len + wob, y - Math.pow(q, .75) * rise - Math.sin(i * 1.3) * 8 * q, (10 + q * (o.r1 || 70)) * 1.6, o.col || SOOT, (o.a ?? .6) * k * (1 - q) * clamp(q * 7), false) } }
function pane(x, y, w, h, title, sub, col, k) { panel(x, y, w, h, null, null, col, k); if (k <= 0) return; slide(k, 0, 16, () => { txt(title, x + 24, y + 46, 25, P.text, 'left', 700); if (sub) txt(sub, x + 24, y + 72, 16, P.muted, 'left', 500) }) }
function along(pts, q) { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d }
  let s = clamp(q) * tot, i = 0; while (i < L.length - 1 && s > L[i]) { s -= L[i]; i++ } const t = L[i] ? Math.min(1, s / L[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], t), lerp(pts[i][1], pts[i + 1][1], t)] }
function hazard(x, y, w, h) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = '#f2b632'; c.fillRect(x, y, w, h); for (let i = -h; i < w + h; i += 22) poly([[x + i, y + h], [x + i + 11, y + h], [x + i + 11 + h, y], [x + i + h, y]], '#1a2028'); c.restore() }
function cone(x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); ell(0, 1, 15, 3.5, 'rgba(0,0,0,.4)'); box(-13, -5, 26, 6, '#c9571f', 2); poly([[-9, -5], [9, -5], [3, -34], [-3, -34]], '#f0782e'); poly([[-6.4, -17], [6.4, -17], [5, -24], [-5, -24]], '#f4f1e4'); c.restore() }

// ----- 2 조기폐차: 폐차 압축기 -----
function scrapBlock(x, y, w, h, seed = 0) { box(x, y, w, h, null, 5); c.fillStyle = grad(0, y, 0, y + h, [[0, '#626878'], [1, '#33384a']]); c.fill(); c.save(); rr(x, y, w, h, 5); c.clip();
  for (let i = 0; i < Math.round(w / 26); i++) { c.fillStyle = hash(i + seed) > .5 ? 'rgba(96,62,40,.55)' : 'rgba(20,24,34,.4)'; c.fillRect(x + hash(i + seed + 5) * w, y + hash(i + seed + 9) * h * .7, 10 + hash(i + seed + 3) * 22, 5 + hash(i + seed + 7) * 9) }
  for (let j = 1; j < 3; j++) line(x, y + h * j / 3, x + w, y + h * j / 3 + (hash(j + seed) - .5) * 6, 'rgba(0,0,0,.35)', 1.5, 'butt'); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(x, y, w, 2); c.restore() }
// pb: 누름판 아랫면의 y. busy: 누르는 중(경고등)
function pressHall(pb, now, busy) {
  box(606, 270, 448, 340, 'rgba(5,10,18,.62)', 4); for (let i = 0; i < 6; i++) line(650 + i * 72, 282, 650 + i * 72, 606, 'rgba(120,170,220,.06)', 2, 'butt');
  for (const px of [600, 1030]) { c.fillStyle = grad(px, 0, px + 30, 0, [[0, '#3a5063'], [.5, '#243441'], [1, '#162230']]); c.fillRect(px, 262, 30, 348); hazard(px, 562, 30, 48) }
  box(586, 232, 488, 46, null, 8); c.fillStyle = grad(0, 232, 0, 278, [[0, '#3d5468'], [1, '#1c2a37']]); c.fill(); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(594, 234, 472, 2); for (let i = 0; i < 9; i++) circ(612 + i * 54.5, 255, 3.2, '#6f879a');
  const on = busy ? Math.sin(now * 16) > 0 : Math.sin(now * 3) > .2, lc = busy ? P.red : P.amber; halo(830, 226, 30, lc, on ? .9 : .2); box(818, 220, 24, 13, on ? lc : shade(lc, -.6), 5);
  for (const rx of [718, 942]) { box(rx - 12, 276, 24, 26, '#2a3a48', 4); c.fillStyle = grad(rx - 7, 0, rx + 7, 0, [[0, '#7d93a5'], [.5, '#e3edf3'], [1, '#6c8294']]); c.fillRect(rx - 7, 300, 14, Math.max(0, pb - 330)) }
  box(632, pb - 32, 396, 32, null, 5); c.fillStyle = grad(0, pb - 32, 0, pb, [[0, '#4a5d70'], [1, '#27343f']]); c.fill(); hazard(640, pb - 12, 380, 9) }

// ----- 3 저감장치(DPF) 단면: 왼쪽에서 매연이 들어와 필터 벽에 붙고, 깨끗해진 가스만 오른쪽으로 나간다 -----
const FX0 = 356, FX1 = 844, FY0 = 348, RH = 29, PYC = 435;
const DPF_PARTS = [() => c.rect(-30, 405, 272, 60), () => { c.moveTo(238, 405); c.lineTo(304, 346); c.lineTo(304, 524); c.lineTo(238, 465); c.closePath() }, () => c.roundRect(300, 330, 600, 210, 36), () => { c.moveTo(896, 346); c.lineTo(962, 405); c.lineTo(962, 465); c.lineTo(896, 524); c.closePath() }, () => c.rect(958, 405, 272, 60)];
function dpf(now, grow, gas) {
  alpha(.45, () => { c.lineJoin = 'round'; c.lineWidth = 18; c.strokeStyle = 'rgba(0,0,0,.7)'; c.save(); c.translate(4, 12); for (const p of DPF_PARTS) { c.beginPath(); p(); c.stroke() } c.restore() });
  c.lineJoin = 'round'; c.lineWidth = 16; c.strokeStyle = grad(0, 322, 0, 548, [[0, '#a9bfd0'], [.3, '#5b7489'], [1, '#26394a']]); for (const p of DPF_PARTS) { c.beginPath(); p(); c.stroke() } c.lineJoin = 'miter';
  c.fillStyle = '#07121d'; for (const p of DPF_PARTS) { c.beginPath(); p(); c.fill() }
  line(340, 324, 860, 324, 'rgba(255,255,255,.4)', 2, 'butt'); for (const fx of [228, 958]) { box(fx, 387, 14, 12, '#8ea6b8', 2); box(fx, 471, 14, 12, '#5b7489', 2) } for (const fx of [322, 866]) { box(fx, 316, 12, 14, '#8ea6b8', 2); box(fx, 540, 12, 14, '#4b6377', 2) }
  // 필터 벽: 짝수 줄은 들어오는 통로(오른쪽이 막힘), 홀수 줄은 나가는 통로(왼쪽이 막힘)
  box(FX0, FY0, FX1 - FX0, RH * 6, '#0d1b28', 3);
  for (let r = 0; r < 6; r++) { const y = FY0 + r * RH, inl = r % 2 === 0; c.fillStyle = inl ? 'rgba(133,122,128,.13)' : rgba(CLEAN, .08 * gas); c.fillRect(FX0, y, FX1 - FX0, RH); box(inl ? FX1 - 14 : FX0, y + 3, 14, RH - 6, '#93a9ba', 2) }
  c.save(); c.setLineDash([9, 3]); for (let r = 0; r <= 6; r++) line(FX0, FY0 + r * RH, FX1, FY0 + r * RH, '#7089a0', 4, 'butt'); c.restore();
  c.save(); c.beginPath(); for (const p of DPF_PARTS) p(); c.clip();
  for (let i = 0; i < 12; i++) { const q = (now * .22 + i / 12) % 1; halo(-30 + q * 400, PYC + Math.sin(i * 2.3) * 12, 30 + q * 40, SOOT, .5 * (1 - q) * clamp(q * 6), false) }
  for (let i = 0; i < 10; i++) { const q = (now * .26 + i / 10) % 1; halo(850 + q * 380, PYC + Math.sin(i * 2.3) * 12, 34 + q * 20, CLEAN, .22 * gas * Math.sin(q * Math.PI)) }
  // 벽에 붙어 쌓이는 매연 입자
  for (let j = 0; j < 170; j++) { if (j / 170 > grow) break; const r = (j % 3) * 2, x = FX0 + 16 + Math.pow(hash(j + 200), .8) * (FX1 - FX0 - 36), up = hash(j + 210) > .5, y = FY0 + r * RH + (up ? 5 + hash(j + 220) * 4.5 : RH - 5 - hash(j + 220) * 4.5); circ(x, y, 2.4 + hash(j + 230) * 2.4, j % 4 ? '#7a6d73' : '#544a4f') }
  // 흘러 들어오는 매연 입자
  for (let i = 0; i < 64; i++) { const r = (i % 3) * 2, q = (now * .2 + hash(i + 300)) % 1, xs = FX0 + 30 + hash(i + 310) * (FX1 - FX0 - 60), yc = FY0 + r * RH + RH / 2 + (hash(i + 320) - .5) * 9, yp = PYC + (hash(i + 330) - .5) * 42, x = -30 + Math.min(1, q / .78) * (xs + 30), st = clamp((q - .78) / .22);
    const yw = FY0 + r * RH + (hash(i + 340) > .5 ? 6 : RH - 6), y = lerp(lerp(yp, yc, smooth(seg(x, 236, FX0 + 6))), yw, eout(st * 2.5)) + Math.sin(now * 5 + i) * 1.5 * (1 - st);
    alpha(1 - seg(st, .7, 1), () => circ(x, y, 3 + hash(i + 350) * 2.6, i % 3 ? '#a3959b' : '#74676d', 'rgba(20,16,18,.5)', 1)) }
  // 벽을 통과해 나가는 깨끗한 가스
  for (let i = 0; i < 46; i++) { const r = (i % 3) * 2 + 1, q = (now * .24 + hash(i + 400)) % 1, x0 = FX0 + 30 + hash(i + 410) * (FX1 - FX0 - 90), yo = FY0 + r * RH + RH / 2 + (hash(i + 420) - .5) * 8, yi = yo + (hash(i + 430) > .5 && r < 5 ? RH : -RH), a = clamp(q * 9) * (1 - seg(q, .9, 1)) * gas;
    const cross = clamp(q / .16), x = x0 + cross * 12 + Math.max(0, q - .16) / .84 * (1230 - x0), y = lerp(lerp(yi, yo, smooth(cross)), PYC + (hash(i + 440) - .5) * 40, smooth(seg(x, FX1 - 4, 962)));
    if (a > 0) { halo(x, y, 13, CLEAN, .7 * a); circ(x, y, 2.6, rgba('#d9fff2', a)) } }
  c.restore() }

// ----- 4 엔진교체: 굴착기와 엔진 -----
// 엔진: 가운데가 기준점(약 120×74). fresh면 신형, 아니면 낡은 구형.
function engineBlock(x, y, s, fresh, now) { const col = fresh ? '#2a8a76' : '#6b4b38', hi = fresh ? P.mint : '#b08a6a';
  c.save(); c.translate(x, y); c.scale(s, s); if (fresh) halo(0, 0, 120, P.mint, .4);
  box(-44, 24, 82, 12, shade(col, -.4), 3); line(-52, -4, -63, -4, '#56636f', 8, 'butt');
  rr(-52, -20, 100, 48, 7); c.fillStyle = grad(0, -20, 0, 28, [[0, shade(col, .16)], [1, shade(col, -.3)]]); c.fill(); c.strokeStyle = hi; c.lineWidth = 2; c.stroke();
  box(-44, -37, 84, 20, shade(col, .1), 5, hi, 1.6); for (let i = 0; i < 4; i++) box(-37 + i * 20, -33, 12, 11, shade(col, -.35), 2);
  if (!fresh) { c.fillStyle = 'rgba(44,24,14,.6)'; c.fillRect(-42, -12, 17, 12); c.fillRect(-8, 8, 24, 9); c.fillRect(-20, -35, 14, 6) } else { c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(-46, -18, 88, 2) }
  line(40, -8, 14, 8, '#11181f', 3); line(40, 24, 14, 24, '#11181f', 3);
  circ(40, 8, 16, '#151d25', hi, 2); for (let k = 0; k < 4; k++) { const a = now * (fresh ? 7 : 2.5) + k * Math.PI / 2; line(40, 8, 40 + Math.cos(a) * 12, 8 + Math.sin(a) * 12, hi, 2) } circ(40, 8, 4, hi); circ(14, 16, 8, '#151d25', hi, 1.5);
  c.restore() }
// 굴착기: 궤도 바닥 가운데가 기준점, 오른쪽이 앞. run: 작동 정도(0~1)
function excavator(x, y, s, now, o = {}) { const run = o.run ?? 1, Y = '#e3ab3c', D = shade(Y, -.34), a1 = -.46 + Math.sin(now * 1.3) * .05 * run, a2 = 1.4 + Math.sin(now * 1.3 + 1.1) * .13 * run, a3 = .55 + Math.sin(now * 1.3 + 2) * .3 * run;
  c.save(); c.translate(x, y); c.scale(s, s); ell(0, 4, 176, 9, 'rgba(0,0,0,.5)');
  box(-150, -48, 300, 48, '#121a22', 24, '#33434f', 2); c.save(); c.setLineDash([8, 6]); rr(-145, -43, 290, 38, 19); c.strokeStyle = '#4b5d6d'; c.lineWidth = 4; c.stroke(); c.restore();
  for (const wx of [-125, 125]) { circ(wx, -24, 16, '#27333f', '#5b7082', 2); circ(wx, -24, 5, '#8f9ea8') } for (let i = 0; i < 5; i++) circ(-76 + i * 38, -14, 8, '#27333f', '#46586a', 1.5);
  box(-52, -64, 120, 18, '#26323d', 5);
  // 엔진실(뒤쪽)
  c.beginPath(); c.moveTo(-140, -62); c.lineTo(-140, -116); c.quadraticCurveTo(-140, -148, -110, -148); c.lineTo(14, -148); c.lineTo(14, -62); c.closePath(); c.fillStyle = grad(0, -148, 0, -62, [[0, shade(Y, .14)], [1, shade(Y, -.24)]]); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-112, -147, 124, 2);
  box(-147, -100, 14, 38, '#2a3642', 4); line(-128, -156, 8, -156, '#2a3642', 3); for (const hx of [-128, -60, 8]) line(hx, -156, hx, -148, '#2a3642', 3);
  box(-98, -176, 13, 30, '#3a444e', 3); box(-101, -180, 19, 6, '#5a6772', 2);
  box(-124, -136, 104, 66, '#0b141d', 8); c.save(); c.setLineDash([6, 5]); rr(-124, -136, 104, 66, 8); c.strokeStyle = o.bayCol || '#b08a6a'; c.lineWidth = 2; c.stroke(); c.restore();
  // 운전실
  rr(10, -218, 90, 158, [10, 14, 4, 4]); c.fillStyle = grad(0, -218, 0, -60, [[0, shade(Y, .16)], [1, shade(Y, -.2)]]); c.fill(); box(18, -208, 72, 76, '#10202c', [6, 10, 3, 3], rgba(A, .45), 1.2); poly([[24, -202], [46, -202], [30, -170], [24, -170]], 'rgba(160,220,255,.14)'); box(18, -124, 72, 5, D, 2); box(24, -108, 12, 4, D, 2);
  const bl = Math.sin(now * 7) > 0; halo(30, -224, 22, P.amber, bl ? .85 : .2); box(22, -228, 16, 10, bl ? P.amber : '#6b4a16', 4);
  // 붐 · 암 · 버킷
  const hx = 96 + Math.cos(a1) * 118, hy = -118 + Math.sin(a1) * 118 + 4; line(66, -72, hx, hy, '#55626e', 12); line(lerp(66, hx, .45), lerp(-72, hy, .45), hx, hy, '#c3d0d8', 6);
  c.save(); c.translate(96, -118); c.rotate(a1); poly([[-12, -15], [110, -24], [204, -11], [208, 9], [110, 4], [-12, 15]], Y, D, 1.5); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(0, -16, 108, 2); line(118, -30, 200, -16, '#c3d0d8', 5); circ(0, 0, 9, '#2a3642');
  c.translate(202, 0); c.rotate(a2); poly([[-14, -11], [132, -8], [136, 8], [-14, 12]], shade(Y, -.06), D, 1.5); circ(0, 0, 8, '#2a3642');
  c.translate(132, 0); c.rotate(a3); c.beginPath(); c.moveTo(-8, -14); c.lineTo(30, -16); c.quadraticCurveTo(54, 6, 30, 36); c.lineTo(-2, 26); c.closePath(); c.fillStyle = '#5e4a2a'; c.fill(); c.strokeStyle = '#8c6a2a'; c.lineWidth = 2; c.stroke(); for (let i = 0; i < 3; i++) poly([[22 + i * 5, 36 - i * 1], [30 + i * 5, 34 - i * 2], [28 + i * 5, 46 - i * 2]], '#c3d0d8'); circ(0, 0, 6, '#2a3642');
  c.restore(); c.restore() }

CINE.story({
cams: [
  [[0, 440, 440, 1.2], [1.3, 470, 440, 1.2], [2.5, 600, 366, 1], [4.8, 612, 372, 1.05]],
  [[0, 400, 430, 1.15], [.9, 400, 430, 1.15], [2, 800, 430, 1.15], [3, 600, 362, 1], [4.8, 600, 366, 1.03]],
  [[0, 400, 440, 1.32], [1.3, 400, 440, 1.32], [2.9, 800, 440, 1.32], [3.8, 600, 362, 1], [4.8, 600, 366, 1.04]],
  [[0, 520, 440, 1.25], [1.4, 484, 432, 1.2], [2.6, 520, 410, 1.12], [3.5, 600, 362, 1], [4.8, 600, 366, 1.03]],
  [[0, 420, 440, 1.18], [1.7, 420, 440, 1.18], [2.6, 600, 366, 1], [4.8, 606, 370, 1.04]]
],
scenes: [
  // 1 노후 차량: 매연을 끌고 달리는 노후 경유차, 높게 올라가는 배출가스 계기.
  (u, T, now) => {
    street(now, {scroll: now * 330, pan: 70}); haze(seg(u, .8, 4.4) * .5, '128,116,130');
    for (let i = 0; i < 6; i++) { const q = (now * (.5 + i * .05) + i / 6) % 1, y = 300 + i * 36, x0 = W + 100 - q * (W + 400); alpha(Math.sin(q * Math.PI) * .32, () => line(x0, y, x0 + 150, y, 'rgba(214,226,236,.7)', 2)) }
    const S = 1.65, tx = lerp(-620, 290, eout(seg(u, 0, 1.5))) + Math.sin(now * .8) * 8, ty = RY + Math.sin(now * 13), ex = tx - 22, ey = ty - 62;
    smoke(ex, ey, now, 1, {len: 400, rise: 200, n: 30, r1: 84, a: .75});
    for (let j = 0; j < 28; j++) { const q = (now * .62 + j / 28) % 1; circ(ex - q * 380 + Math.sin(j * 2.1) * 10, ey - Math.pow(q, .72) * 180 + Math.sin(j * 3.3) * 36 * q, 2 + (j % 3), rgba('#17141a', .9 * (1 - q))) }
    for (const wx of [tx + 52 * S, tx + 236 * S]) for (let j = 0; j < 6; j++) { const q = (now * 1.7 + j / 6) % 1; circ(wx - 24 - q * 90, ty - 3 - Math.sin(q * Math.PI) * (8 + (j % 3) * 4), 2.3, rgba('#b9a98c', .8 * (1 - q))) }
    truck(tx, ty, S, {now, old: true, smoke: true, spin: now * 12, label: '노후 경유차'});
    const by = Math.sin(now * 1.7) * 4, pk = seg(u, 1.3, 1.8), nk = seg(u, 1.6, 2.1);
    alpha(pk, () => { line(128, 410 + by, 150, 476, rgba(P.red, .7), 2); circ(150, 476, 4, P.red) }); badge(120, 388 + by, 'PM', P.red, pk, {size: 23, al: 'center'}); burst(120, 388, seg(u, 1.5, 2.1), P.red, 10, 70);
    alpha(nk, () => { line(256, 378 - by, 226, 506, rgba(P.amber, .7), 2); circ(226, 506, 4, P.amber) }); badge(262, 356 - by, 'NOx', P.amber, nk, {size: 23, al: 'center'}); burst(262, 356, seg(u, 1.8, 2.4), P.amber, 10, 70);
    const f = curve(322, 350, 800, 326, -56); trace(f, seg(u, 2.2, 2.8), rgba(P.red, .7), 2, {dash: [6, 7], glow: 6}); if (u > 2.75) dots(f, now, P.red, 5, 3, .4);
    const k = seg(u, 2, 2.5), v = lerp(.1, .86, eout(seg(u, 2.4, 3.7))), col = v > .5 ? P.red : P.amber;
    pane(800, 176, 352, 284, '배출가스', 'PM · NOx', col, k);
    if (k > 0) alpha(k, () => { gauge(976, 350, 80, v, col); if (u > 3.4) rings(976, 350, now, P.red, 96, 126, 2, .7, .3 * seg(u, 3.4, 3.9)) });
    pop(seg(u, 3.1, 3.5), 976, 350, () => txt('높음', 976, 362, 34, P.red, 'center', 700)); burst(976, 350, seg(u, 3.3, 3.9), P.red, 14, 120);
    reveal('입자상 물질', 976, 430, 21, seg(u, 2.6, 3.1), P.text, 'center', 700);
  },
  // 2 조기폐차: 노후 차량이 폐차장으로 들어가 눌리고, 지원금이 돌아온다.
  (u, T, now) => {
    night(now, {ground: 610, city: .55, glow: 'rgba(255,90,90,.1)'});
    scrapBlock(1082, 576, 104, 34, 3); scrapBlock(1090, 542, 96, 34, 11); scrapBlock(1100, 508, 84, 34, 21); alpha(.6, () => { scrapBlock(14, 576, 96, 34, 31); scrapBlock(20, 542, 84, 34, 41) });
    const S = 1.36, X1 = 638, mv = eio(seg(u, .2, 2)), tx = lerp(-470, X1, mv), down = eio(seg(u, 2.15, 2.75)), up = eio(seg(u, 3.8, 5.3)), pb = lerp(318, 566, down) - 46 * up, hit = seg(u, 2.7, 3.1), sh = hit > 0 && hit < 1 ? Math.sin(now * 70) * 3 * (1 - hit) : 0;
    c.save(); c.translate(sh, 0); pressHall(pb, now, down > 0 && down < 1);
    const sy = clamp((610 - pb) / 164), flat = seg(down, .7, 1);
    if (flat < 1) alpha(1 - flat, () => { c.save(); c.translate(0, 610); c.scale(1, sy); c.translate(0, -610); smoke(tx - 18, 610 - 52, now, 1 - seg(u, 1.6, 2), {len: 260, rise: 120, n: 18, r1: 54, a: .7}); truck(tx, 610, S, {now, old: true, smoke: mv < .97, spin: tx / (22 * S), label: '노후 경유차'}); c.restore() });
    if (flat > 0) alpha(flat, () => scrapBlock(X1 + 4, 566, 376, 44, 7));
    c.restore();
    for (let i = 0; i < 10; i++) { const q = seg(u, 2.7, 3.5); if (q > 0 && q < 1) halo(650 + i * 40, 596 - q * 40 - hash(i) * 20, 30 + q * 40, '#8d8490', .4 * (1 - q), false) }
    burst(830, 566, seg(u, 2.7, 3.2), P.amber, 16, 170); stamp(830, 418, '폐차', seg(u, 2.85, 3.5), P.red, 60);
    const wk = seg(u, 2.2, 3.2), px = lerp(-80, 252, eout(wk)); person(px, 610, 1.9, {now, pose: wk < 1 ? 'walk' : 'wave', helmet: false, stripes: false, vest: '#4a6fa8'});
    const pk = seg(u, 2.6, 3.1); panel(60, 212, 440, 172, null, null, A, pk);
    if (pk > 0) { slide(pk, 0, 14, () => icon('won', 106, 262, 24, P.amber)); reveal('조기폐차 지원', 144, 273, 29, seg(u, 2.75, 3.2), A, 'left', 700); reveal('노후 차량 · 건설기계를 일찍 폐차하면', 84, 322, 20, seg(u, 3.05, 3.5), P.text, 'left', 700); reveal('지원금을 받을 수 있습니다', 84, 354, 20, seg(u, 3.35, 3.8), P.text, 'left', 700) }
    if (u > 3.3) { const cp = curve(664, 520, 322, 474, -120), ca = seg(u, 3.3, 3.7); alpha(ca * .5, () => trace(cp, 1, rgba(P.amber, .6), 2, {dash: [5, 8], glow: false, head: false})); for (let j = 0; j < 5; j++) { const q = (now * .42 + j / 5) % 1, [x, y] = along(cp, q); coin(x, y, 15, ca * Math.sin(q * Math.PI)) } }
  },
  // 3 저감장치: DPF 단면을 따라가며 매연 입자가 걸러지는 과정을 본다.
  (u, T, now) => {
    blueprint();
    alpha(eout(seg(u, 0, .6)), () => dpf(now, eout(seg(u, .8, 4.8)), seg(u, 1.3, 2.3)));
    callout(150, 450, 112, 566, '매연 입자', seg(u, 1, 1.7), '#c9b8bd', {al: 'left', size: 22});
    callout(600, 490, 566, 584, '필터가 입자를 붙잡음', seg(u, 1.9, 2.6), A, {al: 'left', size: 22});
    callout(1050, 450, 1090, 566, '깨끗해진 가스', seg(u, 2.6, 3.3), CLEAN, {al: 'right', size: 22, text: CLEAN});
    reveal('배출가스 저감장치 (DPF)', 600, 238, 30, seg(u, 3.45, 3.95), P.text, 'center', 700);
    // 차량에서의 위치
    const ik = seg(u, 3.6, 4.1); pop(ik, 971, 209, () => { box(846, 150, 250, 118, 'rgba(7,16,27,.78)', 14, rgba(A, .55), 1.4); c.save(); rr(846, 150, 250, 118, 14); c.clip(); c.fillStyle = 'rgba(225,235,240,.35)'; const off = -((now * 150) % 60); for (let x = 846 + off; x < 1100; x += 60) c.fillRect(x, 256, 30, 3);
      truck(868, 250, .72, {now, spin: now * 10, exhaust: false}); c.restore(); line(868, 236, 934, 236, '#56636f', 4, 'butt'); halo(958, 236, 30 + Math.sin(now * 4) * 5, CLEAN, .6); box(934, 229, 50, 13, '#1d5a4c', 5, CLEAN, 1.8) });
    const lf = curve(958, 246, 846, 322, 26); trace(lf, seg(u, 3.9, 4.3), rgba(CLEAN, .8), 2, {dash: [5, 6], glow: 6}); if (u > 4.25) dots(lf, now, CLEAN, 3, 3, .6);
    badge(600, 286, '입자상 물질 저감', CLEAN, seg(u, 4, 4.45), {al: 'center', size: 21}); burst(600, 286, seg(u, 4.2, 4.8), CLEAN, 14, 130);
  },
  // 4 엔진교체: 건설기계의 낡은 엔진을 꺼내고 배출가스가 적은 새 엔진을 넣는다.
  (u, T, now) => {
    night(now, {ground: 610, city: .45, glow: 'rgba(255,181,71,.13)'});
    c.fillStyle = grad(0, 536, 0, 612, [[0, '#4d3d2f'], [1, '#2a2019']]); c.beginPath(); c.moveTo(1004, 612); c.quadraticCurveTo(1090, 516, 1200, 556); c.lineTo(1200, 612); c.closePath(); c.fill();
    const EX = 600, ES = 1.35, BX = 503, BY = 471, SC = 1.08, oq = eio(seg(u, 1.7, 2.6)), nq = eio(seg(u, 2.5, 3.3)), done = seg(u, 3.3, 3.8), rough = 1 - seg(u, 1.5, 1.8), sx = EX - 91.5 * ES, sy = 610 - 180 * ES;
    const OP = [[BX, BY], [BX, 372]].concat(curve(BX, 372, 180, 546, -90)), NP = curve(230, 330, BX, 372, -60).concat([[BX, BY]]);
    if (rough > 0) plume(sx, sy, now, {col: 'rgba(120,110,116,', a: .6 * rough, len: 104, dx: -46, n: 14, r0: 6, r1: 30, speed: .5});
    if (done > 0) plume(sx, sy, now, {col: 'rgba(205,228,222,', a: .2 * done, len: 70, dx: -24, n: 8, r0: 3, r1: 12, speed: .4});
    excavator(EX + rough * Math.sin(now * 46) * 1.3, 610, ES, now, {run: .4 * rough + done, bayCol: done > 0 ? P.mint : '#b08a6a'});
    if (done > 0) { halo(BX, BY, 150, P.mint, .3 * done); rings(BX, BY, now, P.mint, 60, 124, 2, .7, .45 * done) }
    alpha(1 - seg(u, 2.7, 3.1), () => trace(OP, seg(u, 1.45, 1.9), rgba('#b08a6a', .7), 2, {dash: [6, 7], glow: false, head: false}));
    alpha(1 - seg(u, 3.3, 3.7), () => trace(NP, seg(u, 2.1, 2.55), rgba(P.mint, .75), 2, {dash: [6, 7], glow: 6, head: false}));
    // 구형 엔진: 엔진실에서 나와 왼쪽 받침대로
    pop(seg(u, 1.4, 1.8), 180, 592, () => { box(112, 586, 136, 9, '#4a382b', 2); for (const bx of [118, 172, 226]) box(bx, 595, 16, 13, '#3a2c22', 2) });
    const [ox, oy] = along(OP, oq); plume(ox - 36 * SC, oy - 36 * SC, now, {col: 'rgba(120,110,116,', a: .45, len: 46, dx: -12, n: 6, r0: 3, r1: 12, speed: .45}); engineBlock(ox, oy, SC, false, now);
    alpha(1 - seg(u, 1.6, 1.9), () => callout(446, 470, 404, 436, '구형 엔진', seg(u, 1, 1.6), RUST, {al: 'right', size: 21, text: RUST}));
    pop(seg(u, 2.6, 3), 180, 486, () => chip(180, 492, '구형 엔진', RUST, 'center', 20));
    // 신형 엔진: 왼쪽 위에서 엔진실로
    const [nx, ny0] = along(NP, nq), ny = ny0 + (nq <= 0 ? Math.sin(now * 2) * 4 : 0); pop(seg(u, 1.3, 1.8), 230, 330, () => engineBlock(nx, ny, SC, true, now));
    alpha(1 - seg(nq, .5, .8), () => pop(seg(u, 1.5, 1.9), 230, 274, () => chip(nx, ny - 52, '신형 엔진', P.mint, 'center', 20)));
    callout(446, 470, 404, 436, '신형 엔진', seg(u, 3.35, 3.95), P.mint, {al: 'right', size: 21, text: P.mint}); burst(BX, BY, seg(u, 3.3, 3.9), P.mint, 16, 130);
    const pk = seg(u, 3.4, 3.9); panel(770, 158, 384, 118, null, null, A, pk); reveal('건설기계 엔진교체', 796, 206, 28, seg(u, 3.5, 3.95), A, 'left', 700); reveal('배출가스가 적은 엔진으로 바꿉니다', 796, 248, 20, seg(u, 3.8, 4.3), P.text, 'left', 700);
  },
  // 5 사후관리: 저감장치를 단 차량이 들어와 서고, 매연 농도와 장치 상태를 확인한다.
  (u, T, now) => {
    street(now, {glow: 'rgba(95,224,181,.14)'}); cone(748, RY + 2, 1.2); cone(800, RY + 2, 1.2);
    const S = 1.6, tx = lerp(-600, 250, eout(seg(u, 0, 1.4))), ex = tx - 19, ey = RY - 59, wk = seg(u, .5, 1.7), ix = lerp(-90, 122, eout(wk)), probing = u >= 1.7 && u < 3.6;
    plume(ex, ey, now, {col: 'rgba(205,220,228,', a: .2, len: 64, dx: -46, n: 8, r0: 3, r1: 13, speed: .5});
    truck(tx, RY, S, {now, spin: tx / (22 * S), label: '저감장치 부착', col: '#dfe8ec'});
    const dx = tx + 92 * S, dy = RY - 25 * S; line(tx - 6 * S, RY - 37 * S, dx, dy + 8 * S, '#56636f', 6, 'butt'); halo(dx + 37 * S, dy + 8 * S, 60 + Math.sin(now * 4) * 8, CLEAN, .55); box(dx, dy, 74 * S, 16 * S, '#1d5a4c', 8, CLEAN, 2); for (let i = 1; i < 5; i++) line(dx + i * 14.8 * S, dy + 4, dx + i * 14.8 * S, dy + 16 * S - 4, rgba(CLEAN, .6), 2, 'butt');
    person(ix, RY + 4, 1.9, {now, pose: wk < 1 ? 'walk' : probing ? 'probe' : 'tablet', vest: '#2f6f9a', hat: '#e9eef0'});
    if (probing) { const hx = ix + 27 * 1.9, hy = RY + 4 - 42 * 1.9; line(hx, hy, ex, ey + 3, '#dbe6ee', 3.5); circ(ex, ey + 3, 4.5, CLEAN); box(hx - 16, hy - 12, 22, 28, '#0b1824', 4, CLEAN, 1.6); c.fillStyle = CLEAN; c.fillRect(hx - 12, hy - 7, 14, 4) }
    if (u > 1.7) rings(ex, ey + 3, now, CLEAN, 6, 48, 3, 1, .85 * seg(u, 1.7, 2.1) * (1 - seg(u, 3.6, 4)));
    const f = curve(150, 436, 800, 300, -110); trace(f, seg(u, 2.3, 2.9), rgba(CLEAN, .75), 2, {dash: [6, 7], glow: 6}); if (u > 2.85) dots(f, now, CLEAN, 5, 3, .4);
    const k = seg(u, 2.1, 2.6), g = lerp(.86, .18, eout(seg(u, 2.6, 3.6))), low = g < .5, col = low ? CLEAN : P.red;
    pane(800, 170, 356, 392, '사후관리', 'FOLLOW-UP', A, k);
    if (k > 0) alpha(k, () => { gauge(978, 340, 78, g, col); txt(low ? '낮음' : '높음', 978, 352, 34, col, 'center', 700); txt('매연 농도', 978, 416, 20, P.text, 'center', 700) });
    burst(978, 340, seg(u, 3.2, 3.8), CLEAN, 14, 120);
    checklist(826, 480, ['장치 정상 작동', '성능 유지 확인'], u, 3.4, {gap: 50, size: 21, col: P.green});
    shine(800, 170, 356, 392, seg(u, 4.4, 5.1), 16);
  }
]});
})();
