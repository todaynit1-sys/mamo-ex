// 자동차관리과 · 도로 재비산먼지 저감 — 모션그래픽 v2
(() => {
const {P, A, c, W, H, clamp, lerp, eio, eout, spring, seg, hash, rgba, box, line, poly, circ, ell, txt, alpha, grad, halo, panel, chip, dots, pop, slide, reveal, trace, callout, burst, beam, icon, pin, curve, layer, night, blueprint, truck, car, person, gauge, mapGrid, tree, haze, glow} = CINE;
const GY = 520, DUST = '#d6c4a0', DISPF = '"Black Han Sans","IBM Plex Sans KR","Malgun Gothic",sans-serif';
const GRAINS = Array.from({length: 240}, (_, i) => ({x: hash(i) * W, y: 542 + Math.pow(hash(i + 50), 1.3) * 168, r: 1.4 + hash(i + 9) * 2.6, id: hash(i + 77)}));

// ----- 공용 그림 -----
function lamp(x, y) { line(x, y, x, y - 190, '#2a3d4e', 5); line(x, y - 190, x + 46, y - 198, '#2a3d4e', 4); box(x + 34, y - 204, 30, 9, '#3b5468', 4); beam(x + 49, y - 194, Math.PI / 2, 196, 80, '#ffe2a8', .12); halo(x + 49, y - 194, 56, '#ffe2a8', .5); circ(x + 49, y - 195, 4, '#fff3cf') }
// 옆에서 본 도로: 연석(GY) 아래가 아스팔트. scroll은 왼쪽으로 흘러간 거리(달리는 느낌), dust는 쌓인 정도, from은 그 x부터만 먼지를 그린다.
function street(now, o = {}) { const scroll = o.scroll || 0;
  night(now, {ground: GY, city: 1, grid: false, glow: o.glow || 'rgba(255,181,71,.14)', pan: o.pan || 0, tint: o.tint});
  for (let i = 0; i < 5; i++) lamp((((i * 320 + 60 - scroll) % 1600) + 1600) % 1600 - 200, GY + 6);
  c.fillStyle = grad(0, GY, 0, GY + 18, [[0, '#32475a'], [1, '#1b2a36']]); c.fillRect(0, GY, W, 18); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(0, GY, W, 1.5);
  c.fillStyle = grad(0, GY + 18, 0, H, [[0, '#141e28'], [1, '#080d13']]); c.fillRect(0, GY + 18, W, H - GY - 18);
  const off = -(scroll % 180); c.fillStyle = 'rgba(225,235,240,.4)'; for (let x = off - 180; x < W + 180; x += 180) c.fillRect(x, 574, 86, 4);
  const off2 = -((scroll * 1.2) % 230); c.fillStyle = 'rgba(225,235,240,.55)'; for (let x = off2 - 230; x < W + 230; x += 230) c.fillRect(x, 668, 118, 6);
  const d = o.dust ?? 1, from = o.from ?? -1e9; for (const g of GRAINS) { const k = clamp((d - g.id) / .06); if (k <= 0) continue; const x = (((g.x - scroll * (1 + (g.y - 542) / 800)) % W) + W) % W; if (x < from) continue; c.globalAlpha = k; circ(x, g.y - (1 - k) * 14, g.r, 'rgba(214,196,160,.8)') } c.globalAlpha = 1 }
// 뒤로 길게 끌리며 피어오르는 흙먼지
function dustCloud(x, y, now, k = 1, o = {}) { const n = o.n || 22, len = o.len || 190, rise = o.rise || 120;
  for (let i = 0; i < n; i++) { const q = (now * (o.speed || .6) + i / n) % 1, wob = Math.sin(i * 3.1 + q * 5) * 14; halo(x - q * len + wob, y - Math.pow(q, .8) * rise * k - Math.sin(i) * 6, (12 + q * 50) * k, DUST, .5 * k * (1 - q) * clamp(q * 6), false) } }
function pane(x, y, w, h, title, sub, col, k) { panel(x, y, w, h, null, null, col, k); if (k <= 0) return; slide(k, 0, 16, () => { txt(title, x + 24, y + 46, 25, P.text, 'left', 700); if (sub) txt(sub, x + 24, y + 72, 16, P.muted, 'left', 500) }) }
function pmGauge(x, y, v, good) { const bad = v > 80, col = bad ? P.amber : good; gauge(x, y, 80, v / 150, col, null, String(Math.round(v))); txt(bad ? '나쁨' : '보통', x, y + 64, 23, col, 'center', 700) }
function dumpTruck(x, y, s, now) { truck(x, y, s, {now, spin: x / (22 * s), exhaust: false, col: '#e2a93e', cab: '#efc15a'}); c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(6, -117); c.quadraticCurveTo(46, -162, 96, -146); c.quadraticCurveTo(150, -166, 184, -117); c.closePath(); c.fillStyle = grad(0, -164, 0, -117, [[0, '#a8824f'], [1, '#6c5130']]); c.fill(); c.restore() }
// 돋보기: 도로 표면에 먼지 알갱이가 쌓이는 모습을 크게 보여 준다. d는 쌓인 정도(0~1).
function lens(x, y, r, d) { line(x + r * .72, y + r * .72, x + r * 1.2, y + r * 1.2, '#2c4257', 18); line(x + r * .76, y + r * .76, x + r * 1.16, y + r * 1.16, '#55748c', 6); halo(x, y, r * 1.6, A, .22);
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.clip(); c.fillStyle = grad(0, y - r, 0, y + r, [[0, '#0b141e'], [1, '#17222d']]); c.fillRect(x - r, y - r, r * 2, r * 2);
  const base = y + r * .56; c.fillStyle = grad(0, base, 0, y + r, [[0, '#2a3743'], [1, '#161f28']]); c.fillRect(x - r, base, r * 2, r); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(x - r, base, r * 2, 2);
  for (let i = 0; i < 30; i++) circ(x - r + hash(i + 300) * r * 2, base + 6 + hash(i + 340) * r * .4, 1.5 + hash(i) * 2, 'rgba(255,255,255,.05)');
  for (let i = 0; i < 52; i++) { const k = clamp((d - hash(i + 400) * .9) / .07); if (k <= 0) continue; const gx = x - r * .9 + hash(i + 410) * r * 1.8, gr = 5 + hash(i + 450) * 7, gy = base - gr * .6 - Math.floor(hash(i + 420) * 3) * 11 * hash(i + 430), fy = gy - (1 - eout(k)) * 120;
    circ(gx, fy, gr, i % 5 ? '#d6c4a0' : '#a8946e'); circ(gx - gr * .3, fy - gr * .3, gr * .3, 'rgba(255,255,255,.28)') }
  c.restore(); circ(x, y, r, null, rgba(A, .95), 4.5); circ(x, y, r - 6, null, 'rgba(255,255,255,.2)', 1.5);
  c.beginPath(); c.arc(x, y, r - 14, Math.PI * 1.1, Math.PI * 1.45); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 4; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt' }
// 노면 청소차: 왼쪽 아래(뒤 범퍼)가 기준점, 오른쪽을 본다.
function sweeper(x, y, s, now, spin = 0) { c.save(); c.translate(x, y); c.scale(s, s); ell(165, 3, 184, 8, 'rgba(0,0,0,.5)');
  c.beginPath(); c.roundRect(0, -142, 214, 108, 14); c.fillStyle = grad(0, -142, 0, -34, [[0, '#f5f9fb'], [1, '#b7c6cf']]); c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(10, -138, 194, 3);
  line(72, -138, 72, -38, 'rgba(20,40,60,.14)', 2, 'butt'); line(144, -138, 144, -38, 'rgba(20,40,60,.14)', 2, 'butt');
  c.beginPath(); c.moveTo(220, -34); c.lineTo(220, -122); c.lineTo(272, -122); c.quadraticCurveTo(286, -120, 294, -106); c.lineTo(312, -72); c.quadraticCurveTo(318, -64, 318, -54); c.lineTo(318, -34); c.closePath(); c.fillStyle = grad(0, -122, 0, -34, [[0, '#eaf1f4'], [1, '#acbbc5']]); c.fill();
  poly([[230, -112], [272, -112], [300, -72], [230, -72]], '#10202c'); poly([[234, -108], [252, -108], [262, -92], [234, -92]], 'rgba(160,220,255,.18)');
  c.fillStyle = P.mint; c.fillRect(0, -52, 318, 9); txt('노면 청소차', 107, -80, 22, '#10202c', 'center', 700);
  const bl = Math.sin(now * 8) > 0; halo(250, -128, 24, P.amber, bl ? .9 : .25); box(240, -133, 20, 11, bl ? P.amber : '#6b4a16', 4);
  c.fillStyle = '#182733'; c.fillRect(6, -37, 310, 11); box(126, -34, 76, 20, '#33485a', 4); poly([[118, -14], [210, -14], [218, -2], [110, -2]], '#202f3b');
  for (const wx of [56, 266]) { circ(wx, -21, 21, '#05080c'); circ(wx, -21, 10.5, '#8f9ea8'); for (let k = 0; k < 5; k++) { const a = spin + k * 1.2566; line(wx, -21, wx + Math.cos(a) * 9.5, -21 + Math.sin(a) * 9.5, '#3b4d59', 2.5) } circ(wx, -21, 3.5, '#1d2a33') }
  for (const bx of [232, 300]) { ell(bx, -5, 26, 7.5, '#56697a'); for (let j = 0; j < 8; j++) { const a = now * 11 + j * .785; line(bx, -5, bx + 26 * Math.cos(a), -5 + 7.5 * Math.sin(a), P.mint, 2) } }
  halo(316, -50, 22, '#fff3cf', .85); box(311, -56, 8, 10, '#ffe9b0', 2); box(-4, -60, 6, 14, '#ff4545', 2);
  c.restore() }
const sweepX = u => lerp(-430, 420, eio(clamp(u / 4.3))) + Math.max(0, u - 4.3) * 70;

CINE.story({
cams: [
  [[0, 560, 420, 1.13], [1.4, 540, 424, 1.15], [3.2, 620, 392, 1.07], [4.8, 600, 362, 1]],
  [[0, 520, 430, 1.18], [1.4, 520, 430, 1.18], [2.6, 600, 372, 1], [4.8, 624, 378, 1.05]],
  [[0, 390, 372, 1.2], [1.5, 390, 372, 1.2], [2.5, 600, 366, 1], [4.8, 600, 372, 1.04]],
  u => ({x: sweepX(u) + 330, y: 420, z: 1.16}),
  [[0, 560, 410, 1.14], [2.2, 530, 410, 1.14], [3.4, 600, 362, 1], [4.8, 600, 366, 1.03]]
],
scenes: [
  // 1 먼지 쌓임: 차가 오가는 도로에 세 갈래로 먼지가 쌓인다.
  (u, T, now) => {
    const d = lerp(.1, 1, eout(seg(u, .4, 4.5)));
    street(now, {dust: d});
    const fall = seg(u, 2.7, 3.4); for (let i = 0; i < 34; i++) { const q = (now * (.1 + hash(i + 610) * .08) + hash(i + 600)) % 1; halo(hash(i + 620) * 760 + 20 + Math.sin(now + i) * 12, 190 + q * 420, 5 + hash(i + 630) * 5, DUST, (.15 + .6 * fall) * Math.sin(q * Math.PI), false) }
    pop(seg(u, .9, 1.5), 330, 372, () => { c.save(); c.setLineDash([6, 7]); line(330, 492, 330, 596, rgba(A, .7), 2, 'butt'); c.restore(); c.save(); c.translate(330, 600); c.scale(1, .4); circ(0, 0, 30, null, rgba(A, .8), 3); c.restore(); lens(330, 372, 116, d) }, {ease: spring});
    const cx = lerp(-300, 1420, seg(u, .2, 2.7)); if (cx < 1400) { for (const wx of [cx + 46, cx + 169]) for (let j = 0; j < 7; j++) { const q = (now * 1.6 + j / 7) % 1; circ(wx - q * 96, 606 + q * 13 + Math.sin(j * 2) * 3, 2.4, rgba('#b9a98c', .9 * (1 - q))) } car(cx, 618, 1.3, '#c24d62', {spin: cx / 18.2}) }
    const tx = lerp(-420, 1480, seg(u, 1.4, 4.4)); if (u > 1.4 && tx < 1460) { for (let j = 0; j < 12; j++) { const q = (now * 1.1 + j / 12) % 1; circ(tx - 4 - q * 74 + Math.sin(j * 1.7) * 6, 496 + q * q * 122, 3.3, rgba('#b08a55', .95 * (1 - q * .8))) } dumpTruck(tx, 622, 1.1, now) }
    layer(0, () => { pane(800, 180, 352, 290, '도로 위 먼지', 'ROAD DUST', P.amber, seg(u, 1, 1.5));   // 화면에 고정(확대 중에도 잘리지 않게)
      [['car', '타이어 · 브레이크 마모', 1.35], ['truck', '공사장 토사', 2.25], ['cloud', '대기 중 먼지 침적', 3.1]].forEach(([kind, s, t0], i) => { const y = 296 + i * 60; slide(seg(u, t0, t0 + .45), 30, 0, () => { icon(kind, 846, y, 22, P.amber); txt(s, 882, y + 7, 20, P.text, 'left', 700) }); burst(846, y, seg(u, t0 + .2, t0 + .75), P.amber, 8, 40) }) });
  },
  // 2 다시 날림: 달리는 바퀴와 바람이 먼지를 다시 띄운다.
  (u, T, now) => {
    street(now, {dust: 1, scroll: now * 340, pan: 80}); haze(seg(u, 1.2, 3.8) * .5);
    const tx = lerp(-400, 960, u / 5.6); dustCloud(tx + 20, 576, now + .5, .7, {len: 150, rise: 80}); truck(tx, 586, .92, {now, spin: now * 14, exhaust: false});
    for (let i = 0; i < 7; i++) { const q = (now * (.5 + i * .04) + i / 7) % 1, y = 396 + i * 24, x0 = W + 100 - q * (W + 400); alpha(Math.sin(q * Math.PI) * .5, () => { c.beginPath(); c.moveTo(x0, y); c.bezierCurveTo(x0 + 50, y - 14, x0 + 110, y + 14, x0 + 170, y); c.strokeStyle = 'rgba(214,226,236,.7)'; c.lineWidth = 2.4; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt' }) }
    const cx = 400 + Math.sin(now * .7) * 16, cy = 624 + Math.sin(now * 9) * .6;
    dustCloud(cx + 40, 612, now, 1, {len: 270, rise: 150, n: 26}); car(cx, cy, 1.5, '#c24d62', {spin: now * 16});
    for (let j = 0; j < 12; j++) { const q = (now * 1.8 + j / 12) % 1; circ(cx + 50 - q * 120 - Math.sin(j * 2) * 8, 612 - Math.sin(q * Math.PI) * (20 + (j % 4) * 9), 2.4, rgba(DUST, .9 * (1 - q))) }
    callout(262, 500, 150, 394, '다시 날리는 먼지', seg(u, 1.5, 2.3), P.amber, {al: 'left', size: 21});
    const f = curve(330, 400, 826, 330, -80), col = u > 2.6 ? P.amber : A; trace(f, seg(u, 1.9, 2.5), rgba(DUST, .7), 2, {dash: [6, 7], glow: false}); if (u > 2.45) dots(f, now, DUST, 5, 3, .35);
    pane(826, 176, 326, 292, 'PM-10', 'µg/m³ · 예시', col, seg(u, 1.1, 1.6));
    if (u > 1.2) alpha(seg(u, 1.2, 1.6), () => pmGauge(989, 352, lerp(40, 96, eout(seg(u, 1.5, 3.5))), A));
  },
  // 3 저감사업: 집중관리도로를 정하고, 청소차를 보내고, 효과를 확인한다.
  (u, T, now) => {
    blueprint(); mapGrid(70, 190, 640, 420, {block: 107});
    const ROADS = [[[70, 287], [710, 287]], [[381, 190], [381, 610]], [[70, 501], [710, 501]]], ALL = ROADS.concat([[[167, 190], [167, 610]], [[595, 190], [595, 610]], [[70, 394], [710, 394]]]);
    const prog = ROADS.map((_, i) => seg(u, 2.7 + i * .25, 4.3 + i * .2));
    c.save(); c.beginPath(); c.roundRect(70, 190, 640, 420, 14); c.clip();
    ROADS.forEach(([a, b], i) => { const k = seg(u, 1.4 + i * .3, 2.1 + i * .3); alpha(.55, () => trace([a, b], k, P.mint, 6, {glow: 12})); if (prog[i] > 0) trace([a, b], prog[i], '#c9fff0', 3, {glow: 14, head: false}) });
    for (let i = 0; i < 44; i++) { const r = i % ALL.length, [a, b] = ALL[r], q = .04 + hash(i + 800) * .92, x = lerp(a[0], b[0], q), y = lerp(a[1], b[1], q), gone = r < 3 ? clamp((prog[r] - q) / .05) : 0; halo(x, y, 13 + 5 * Math.sin(now * 2 + i), P.amber, eout(seg(u, .5 + hash(i) * .6, 1.2 + hash(i) * .6)) * (1 - gone) * (.55 + .25 * Math.sin(now * 3 + i))); alpha(1 - gone, () => circ(x, y, 2.6, rgba(P.amber, .9))) }
    ROADS.forEach(([a, b], i) => { if (prog[i] > 0 && prog[i] < 1) { const x = lerp(a[0], b[0], prog[i]), y = lerp(a[1], b[1], prog[i]); icon('truck', x, y, 17, P.mint) } });
    c.restore();
    ROADS.forEach(([a, b], i) => { const k = seg(u, 4.25 + i * .2, 4.6 + i * .2), ex = b[0] - (i === 1 ? 0 : 34), ey = b[1] - (i === 1 ? 34 : 0); pop(k, ex, ey, () => icon('check', ex, ey, 17, P.green), {ease: spring}) });
    pin(381, 287, P.mint, '집중관리도로', seg(u, 1.9, 2.5), now, 20);
    pane(772, 190, 380, 300, '재비산먼지 저감사업', 'ROAD DUST PROGRAM', P.mint, seg(u, 1.3, 1.8));
    [['pin', '집중관리도로 지정', P.mint, 1.7], ['truck', '청소차 운행 지원', A, 2.75], ['check', '청소 효과 확인', P.amber, 3.9]].forEach(([kind, s, col, t0], i) => { const y = 308 + i * 62, k = seg(u, t0, t0 + .45), on = fadeIn(u, t0, i < 2 ? [2.75, 3.9][i] : 9);
      if (on > 0) alpha(on * .9, () => box(790, y - 28, 344, 56, rgba(col, .13), 12, rgba(col, .5), 1.2)); slide(k, 30, 0, () => { icon(kind, 824, y, 22, col); txt(s, 860, y + 7, 21, P.text, 'left', 700) }); burst(824, y, seg(u, t0 + .2, t0 + .75), col, 8, 40) });
  },
  // 4 도로 청소: 청소차가 지나가며 빨아들이고 물로 씻는다.
  (u, T, now) => {
    const sx = sweepX(u), S = 1.42, brush = sx + 232 * S;
    street(now, {dust: 1, from: brush + 30, glow: 'rgba(95,224,181,.13)'});
    if (sx > -300) { c.save(); c.beginPath(); c.rect(0, 538, Math.max(0, sx + 30), 182); c.clip(); c.fillStyle = grad(0, 538, 0, H, [[0, 'rgba(120,200,255,.17)'], [1, 'rgba(120,200,255,.04)']]); c.fillRect(0, 538, W, 182);
      for (let i = 0; i < 18; i++) { const x = hash(i + 700) * Math.max(60, sx + 20), y = 548 + hash(i + 710) * 150; line(x - 26, y, x + 26, y, 'rgba(190,230,255,.16)', 2, 'butt'); halo(x, y, 10, '#bfe6ff', .6 * Math.max(0, Math.sin(now * 3 + i * 2))) } c.restore() }
    for (let j = 0; j < 18; j++) { const q = (now * 1.5 + j / 18) % 1; circ(sx + 6 - q * 52 + Math.sin(j) * 6, 622 - 40 * S + q * q * 58, 2.7, rgba('#8fd4ff', .95 * (1 - q * .7))) }
    for (let j = 0; j < 16; j++) { const q = (now * 1.3 + j / 16) % 1, x0 = brush + 80 + hash(j + 720) * 110, x1 = sx + 166 * S; circ(lerp(x0, x1, q), lerp(612, 622 - 20 * S, q * q) - Math.sin(q * Math.PI) * 9, 3 * (1 - q * .5), rgba(DUST, .95 * (1 - q * .6))) }
    sweeper(sx, 622, S, now, sx / (21 * S));
    pop(seg(u, 1.6, 2.1), sx - 74, 586, () => { chip(sx - 74, 590, '살수', '#8fd4ff', 'center', 21); line(sx - 40, 592, sx - 14, 600, '#8fd4ff', 2) });
    pop(seg(u, 2.2, 2.7), brush + 150, 586, () => { chip(brush + 150, 590, '흡입', P.amber, 'center', 21); line(brush + 114, 592, brush + 78, 604, P.amber, 2) });
    layer(0, () => { const k = seg(u, 1.1, 1.6); slide(k, 40, 0, () => { box(782, 152, 372, 128, 'rgba(6,14,24,.93)', 16, P.mint, 1.8); alpha(.1, () => box(782, 152, 372, 128, P.mint, 16)); icon('drop', 826, 216, 26, P.mint) });
      reveal('흡입 · 살수 청소', 868, 208, 28, seg(u, 1.3, 1.8), P.mint, 'left', 700); reveal('쌓인 먼지를 빨아들이고 물로 씻습니다', 868, 246, 17, seg(u, 1.6, 2.2), P.text, 'left', 600) });
  },
  // 5 생활환경: 깨끗해진 도로, 맑아진 공기.
  (u, T, now) => {
    street(now, {dust: 0, glow: 'rgba(95,224,181,.18)', tint: P.mint});
    for (let i = 0; i < 6; i++) tree(64 + i * 216, GY + 8, 1.28);
    for (let i = 0; i < 14; i++) { const q = (now * (.07 + hash(i + 900) * .05) + hash(i + 910)) % 1; halo(hash(i + 920) * 760 + 20 + Math.sin(now * .6 + i) * 24, 560 - q * 330, 5 + hash(i + 930) * 5, P.mint, .5 * Math.sin(q * Math.PI)) }
    for (let i = 0; i < 12; i++) { const x = hash(i + 940) * W, y = 548 + hash(i + 950) * 150; halo(x, y, 9, '#c9fff0', .5 * Math.max(0, Math.sin(now * 2.4 + i * 1.7))) }
    const px = 230 + u * 30; person(px, 538, 1.5, {now, pose: 'walk', helmet: false, stripes: false, woman: true, vest: '#4a6fa8'}); person(px + 82, 540, 1.1, {now: now + 1, pose: 'walk', helmet: false, stripes: false, vest: '#c77d3a'});
    const cx = lerp(-340, 1500, seg(u, .6, 5.4)); car(cx, 624, 1.4, '#4d7bd6', {spin: cx / 19.6});
    reveal('깨끗한 도로, 맑은 공기', 90, 262, 44, seg(u, 2.6, 3.3), P.text, 'left', 400, DISPF);
    const ul = eout(seg(u, 3, 3.6)); if (ul > 0) glow(P.mint, 10, () => line(94, 282, 94 + 230 * ul, 282, P.mint, 4)); burst(330, 244, seg(u, 3.1, 3.8), P.mint, 14, 150);
    const v = lerp(96, 38, eout(seg(u, 1.3, 3.3))); pane(826, 176, 326, 292, 'PM-10', '청소 후 · 예시', v > 80 ? P.amber : P.mint, seg(u, 1, 1.5));
    if (u > 1.1) alpha(seg(u, 1.1, 1.5), () => pmGauge(989, 352, v, P.mint));
  }
]});
// 지금 진행 중인 항목만 밝히는 구간 함수
function fadeIn(u, a, b) { return clamp(Math.min((u - a) / .3, (b - u) / .3)) }
})();
