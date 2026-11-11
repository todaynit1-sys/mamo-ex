// 조사분석과 · 국가대기오염측정망 — 모션그래픽 v2
(() => {
const {P, A, c, clamp, lerp, eio, eout, seg, hash, rgba, rr, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, rgrad, halo, chip, panel, tick, cross, rings, dots, pop, slide, reveal, trace, callout, checklist, burst, shine, spark, lineChart, curve, icon, pin, card, night, blueprint, lab, person, tree} = CINE;
const ITEMS = [['SO₂', 'ppm', .004, 3, P.mint], ['CO', 'ppm', .4, 1, P.cyan], ['NO₂', 'ppm', .021, 3, P.amber], ['O₃', 'ppm', .034, 3, P.violet], ['PM-10', 'µg/m³', 38, 0, '#cdc3b3'], ['PM-2.5', 'µg/m³', 19, 0, '#e9d5a0']];
const LEG = [['NO₂', P.amber], ['O₃', P.violet], ['PM-2.5', '#e9d5a0']];

// ----- 수도권 지도 판(0~100 좌표를 기울어진 판 위에 놓는다) -----
const GG = [[30, 8], [48, 4], [62, 10], [80, 14], [90, 30], [94, 50], [88, 68], [74, 84], [56, 94], [40, 92], [28, 80], [22, 66], [12, 63], [7, 52], [10, 45], [18, 44], [22, 28]];
const MP = (mx, my) => [96 + mx * 6.1 - my * 1.2, 196 + my * 4.2];
const OUT = GG.concat([GG[0]]).map(([mx, my]) => MP(mx, my));
const RIVER = [[93, 52], [80, 50], [68, 47], [58, 46.5], [50, 45.5], [42, 43], [34, 40], [26, 36], [20.5, 33]].map(([mx, my]) => MP(mx, my));
const mapPath = (dy = 0) => { c.beginPath(); OUT.forEach(([x, y], i) => i ? c.lineTo(x, y + dy) : c.moveTo(x, y + dy)); c.closePath() };
const TYPES = [['도시대기', A, 'home'], ['도로변', P.amber, 'car'], ['교외대기', P.violet, 'leaf']];
// 측정소: [지도 x, 지도 y, 종류]
const ST = [[46, 40, 0], [52, 37, 0], [57, 43, 0], [48, 48, 0], [55, 51, 0], [50, 43, 1], [44, 45, 1], [59, 48, 1], [15, 53, 0], [19, 60, 0], [27, 48, 0], [30, 40, 1],
  [33, 34, 0], [40, 24, 0], [52, 22, 0], [64, 28, 0], [72, 40, 0], [68, 54, 1], [62, 66, 0], [50, 66, 0], [38, 62, 0], [34, 74, 0], [46, 80, 0], [60, 80, 0], [78, 48, 0],
  [36, 14, 2], [57, 14, 2], [82, 24, 2], [88, 50, 2], [72, 78, 2], [52, 90, 2], [26, 70, 2], [82, 66, 2]].map(([mx, my, t]) => { const [x, y] = MP(mx, my); return {mx, my, t, x, y, d: Math.hypot(mx - 51, my - 45)} });
const LINKS = []; ST.forEach((a, i) => ST.map((b, j) => [Math.hypot(a.x - b.x, a.y - b.y), j]).filter(e => e[1] !== i).sort((p, q) => p[0] - q[0]).slice(0, 2).forEach(([, j]) => { const lo = Math.min(i, j), hi = Math.max(i, j); if (!LINKS.some(l => l[0] === lo && l[1] === hi)) LINKS.push([lo, hi]) }));
const FEAT = [[52, 37], [68, 54], [72, 78]].map(([mx, my]) => ST.findIndex(s => s.mx === mx && s.my === my)), ROWS = [362, 416, 470];
const STY = ST.slice().sort((a, b) => a.y - b.y);
// 지도 판: 그림자 → 면 → 격자·강 → inside(면 안쪽에만 그릴 것)
function region(now, k, inside) { alpha(k, () => { c.save(); c.translate(0, (1 - k) * 30);
  mapPath(18); c.fillStyle = '#04101c'; c.fill(); c.strokeStyle = rgba(A, .22); c.lineWidth = 1.5; c.stroke(); halo(350, 410, 430, A, .12);
  mapPath(); c.fillStyle = grad(90, 210, 620, 590, [[0, '#184562'], [1, '#0b2238']]); c.fill();
  c.save(); mapPath(); c.clip();
  const off = (now * 8) % 44; for (let i = -4; i < 19; i++) line(40 + i * 44 + off, 200, -74 + i * 44 + off, 600, rgba(A, .09), 1, 'butt'); for (let j = 0; j < 10; j++) line(40, 214 + j * 42, 660, 214 + j * 42, rgba(A, .09), 1, 'butt');
  c.beginPath(); RIVER.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineJoin = 'round'; c.strokeStyle = 'rgba(61,150,255,.28)'; c.lineWidth = 11; c.stroke(); c.strokeStyle = 'rgba(160,220,255,.3)'; c.lineWidth = 1.6; c.setLineDash([12, 18]); c.lineDashOffset = now * 14; c.stroke(); c.setLineDash([]); c.lineJoin = 'miter';
  if (inside) inside();
  c.restore(); c.restore() }) }

// ----- 측정소(벽을 걷어 내면 안쪽 장비가 보인다) -----
const IN = [240, 214], DROPS = [206, 300, 394], UCOL = [P.cyan, P.amber, P.violet];
function shelter(now, open, on) {
  ell(355, 627, 280, 10, 'rgba(0,0,0,.5)');
  line(520, 380, 520, 296, '#c8d4db', 4); for (let k = 0; k < 3; k++) { const a = now * 7 + k * 2.094, dx = Math.cos(a) * 17, dy = Math.sin(a) * 4; line(520, 296, 520 + dx, 296 + dy, '#c8d4db', 2); circ(520 + dx, 296 + dy, 4.6, '#eef4f7') }
  c.fillStyle = grad(232, 0, 248, 0, [[0, '#3d596a'], [.45, '#8fabb9'], [1, '#34505f']]); c.fillRect(232, 238, 16, 142); box(225, 300, 30, 7, '#8aa5b3', 2); box(225, 352, 30, 7, '#8aa5b3', 2);
  poly([[221, 214], [259, 214], [250, 240], [230, 240]], '#cfdbe2'); box(224, 207, 32, 7, '#0d1b28', 2); poly([[208, 208], [272, 208], [256, 195], [224, 195]], '#eef4f7'); line(224, 195, 256, 195, 'rgba(255,255,255,.7)', 2, 'butt');
  box(108, 376, 494, 15, '#a9bac4', 4); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(110, 376, 490, 2.5);
  rr(120, 391, 470, 233, [0, 0, 6, 6]); c.fillStyle = grad(0, 391, 0, 624, [[0, '#eef4f7'], [1, '#b4c5cf']]); c.fill();
  for (let x = 136; x < 590; x += 16) { c.fillStyle = 'rgba(40,70,90,.06)'; c.fillRect(x, 393, 1.5, 210) }
  c.fillStyle = A; c.fillRect(120, 604, 470, 5); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(120, 609, 470, 15);
  box(476, 432, 88, 172, '#9fb0b8', 4, '#8296a2', 1.5); box(486, 444, 68, 60, '#b4c3cb', 3); for (let j = 0; j < 4; j++) line(492, 456 + j * 12, 548, 456 + j * 12, '#8296a2', 2, 'butt'); circ(488, 536, 4.5, '#5d707a');
  txt('대기측정소', 520, 421, 19, '#27485c', 'center', 700);
  if (open <= 0) return;
  c.save(); c.beginPath(); c.arc(240, 400, 400 * open, 0, 6.2832); c.clip();
  box(142, 408, 314, 190, '#07121d', 10, rgba(A, .6), 1.8);
  c.save(); rr(142, 408, 314, 190, 10); c.clip(); c.fillStyle = grad(0, 408, 0, 598, [[0, rgba(A, .1)], [1, rgba(A, 0)]]); c.fillRect(142, 408, 314, 190); for (let x = 162; x < 456; x += 32) line(x, 408, x, 598, 'rgba(120,200,255,.05)', 1, 'butt'); c.restore();
  const glass = (x1, y1, x2, y2) => { line(x1, y1, x2, y2, '#1c394d', 9, 'butt'); line(x1, y1, x2, y2, 'rgba(150,210,235,.18)', 3, 'butt') };
  glass(240, 408, 240, 440); glass(172, 440, 428, 440); DROPS.forEach(x => glass(x, 440, x, 480));
  DROPS.forEach((x, i) => { const ux = x - 41, o = on[i], col = UCOL[i]; box(ux, 480, 82, 112, '#152838', 6, '#2c4a62'); box(ux + 8, 490, 66, 40, '#040b13', 4);
    if (o > 0) alpha(o, () => { for (let b = 0; b < 6; b++) { const h = 6 + 24 * Math.abs(Math.sin(now * 1.6 + b * .9 + i)); c.fillStyle = rgba(col, .88); c.fillRect(ux + 13 + b * 10, 526 - h, 6, h) } halo(ux + 41, 510, 50, col, .3); halo(ux + 14, 546, 10, P.green, .7) });
    circ(ux + 14, 546, 4.5, o > 0 && Math.sin(now * 5 + i * 2) > -.3 ? P.green : '#1b3a2a'); box(ux + 26, 541, 46, 10, '#0c1a27', 3); for (let j = 0; j < 3; j++) line(ux + 12, 564 + j * 8, ux + 70, 564 + j * 8, '#22394d', 2, 'butt') });
  c.restore();
}
// 표준가스 용기: x 가운데, y 바닥
function cylinder(x, y, now) { ell(x, y + 2, 66, 8, 'rgba(0,0,0,.45)');
  box(x - 14, y - 252, 28, 30, '#5d7b8c', 3); box(x - 24, y - 266, 48, 16, '#8aa5b3', 4); line(x - 18, y - 272, x + 18, y - 272, '#c8d4db', 5);
  rr(x - 52, y - 228, 104, 228, [36, 36, 8, 8]); c.fillStyle = grad(x - 52, 0, x + 52, 0, [[0, '#17303f'], [.3, '#3a6a86'], [.45, '#5a8ea8'], [.7, '#2b5068'], [1, '#132836']]); c.fill();
  c.fillStyle = A; c.fillRect(x - 52, y - 178, 104, 6); c.fillRect(x - 52, y - 82, 104, 6);
  box(x - 45, y - 156, 90, 46, '#e9eef0', 5); txt('표준가스', x, y - 126, 19, '#17303f', 'center', 700);
  line(x + 24, y - 258, x + 50, y - 258, '#8aa5b3', 6); circ(x + 62, y - 262, 17, '#0d1b28', '#c8d4db', 2.5); const a = -1.3 + .14 * Math.sin(now * 3); line(x + 62, y - 262, x + 62 + Math.cos(a) * 11, y - 262 + Math.sin(a) * 11, P.amber, 2.4); circ(x + 62, y - 262, 2.5, '#c8d4db') }
const QA = (q, s) => .42 + .13 * Math.sin(q * 20) + .04 * Math.sin(q * 53 + 1) + s * .42 * Math.exp(-Math.pow((q - .62) / .014, 2));
// 농도 분포(예시): [지도 x, 지도 y, 반경, 세기]
const HEAT = [[40, 38, 25, 1], [66, 62, 21, .85], [22, 57, 15, .6]];
const level = (mx, my) => clamp(HEAT.reduce((a, [x, y, r, w]) => a + w * Math.exp(-((mx - x) ** 2 + (my - y) ** 2) / (r * r * .5)), 0));
const lvCol = v => v > .6 ? P.mag : v > .32 ? P.amber : P.cyan;
const YEARS = [.72, .66, .6, .55, .5];

CINE.story({
cams: [
  [[0, 440, 390, 1.2], [2.2, 440, 390, 1.2], [3.1, 600, 360, 1], [4.8, 600, 364, 1.035]],
  [[0, 400, 330, 1.2], [1.5, 400, 330, 1.2], [2.6, 430, 362, 1.15], [3.4, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 300, 330, 1.12], [1.4, 300, 330, 1.12], [2.3, 600, 360, 1], [4.8, 610, 364, 1.03]],
  [[0, 500, 385, 1.14], [1.9, 500, 385, 1.14], [2.8, 700, 352, 1.14], [3.8, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 440, 395, 1.2], [1.9, 440, 395, 1.2], [2.8, 600, 360, 1], [4.8, 600, 364, 1.035]]
],
scenes: [
  // 1 측정망 운영: 수도권 지도 위에 측정소가 차례로 켜지고 서로 이어진다.
  (u, T, now) => {
    blueprint();
    region(now, eout(seg(u, .15, 1.1)), () => { const sx = 40 + ((now * .2) % 1.3) * 620; c.fillStyle = grad(sx - 150, 0, sx, 0, [[0, rgba(A, 0)], [1, rgba(A, .15)]]); c.fillRect(sx - 150, 200, 150, 400); line(sx, 200, sx, 600, rgba(A, .45), 1.5, 'butt') });
    trace(OUT, seg(u, .1, 1.3), A, 2.5);
    LINKS.forEach(([a, b], i) => { const t0 = 1.35 + Math.max(ST[a].d, ST[b].d) * .024, k = seg(u, t0, t0 + .45); if (k <= 0) return; const p = [[ST[a].x, ST[a].y], [ST[b].x, ST[b].y]];
      trace(p, k, rgba(A, .45), 1.5, {glow: false, head: false});
      if (k >= 1) { const q = (now * .45 + hash(i * 3.7)) % 1, d = i % 2 ? q : 1 - q; halo(lerp(p[0][0], p[1][0], d), lerp(p[0][1], p[1][1], d), 8, '#dffcf2', .85 * Math.sin(q * Math.PI)) } });
    ST.forEach((s, i) => { const t0 = 1 + s.d * .024, k = seg(u, t0, t0 + .4); if (k <= 0) return; const col = TYPES[s.t][1], pk = seg(u, t0 + .1, t0 + .8), ph = (now * .32 + hash(i * 1.9)) % 1;
      if (pk > 0 && pk < 1) alpha(1 - pk, () => circ(s.x, s.y, 6 + 28 * eout(pk), null, col, 1.8));
      if (k >= 1 && ph < .4) alpha(1 - ph / .4, () => circ(s.x, s.y, 6 + 24 * ph / .4, null, col, 1.4));
      pop(k, s.x, s.y, () => { halo(s.x, s.y, 18, col, .7); circ(s.x, s.y, 5.5, col, '#eafff7', 1.4) }) });
    FEAT.forEach((fi, i) => { const s = ST[fi], col = TYPES[i][1], t0 = 3.2 + i * .22, link = curve(s.x + 16, s.y - 36, 742, ROWS[i] - 8, [-26, 10, 30][i]);
      trace(link, seg(u, t0, t0 + .5), col, 2, {dash: [6, 7], glow: 6}); if (u > t0 + .45) dots(link, now + i * .3, col, 3, 3, .4);
      pin(s.x, s.y, col, TYPES[i][0], seg(u, 2.2 + i * .25, 2.85 + i * .25), now + i) });
    panel(740, 170, 410, 420, '국가대기오염측정망', null, A, seg(u, 2.7, 3.3)); alpha(seg(u, 3.1, 3.4), () => mono('NATIONAL MONITORING', 760, 231, 16, P.muted, 'left', 500));
    slide(seg(u, 3, 3.5), 0, 16, () => disp('수도권 곳곳', 764, 300, 46, P.text));
    const ul = eout(seg(u, 3.2, 3.8)); if (ul > 0) glow(A, 8, () => line(766, 318, 766 + 130 * ul, 318, A, 3));
    TYPES.forEach(([s, col, kind], i) => slide(seg(u, 3.35 + i * .22, 3.85 + i * .22), 30, 0, () => { icon(kind, 782, ROWS[i] - 8, 17, col); txt(i === 2 ? s + ' 등' : s, 812, ROWS[i], 23, P.text, 'left', 700) }));
    alpha(seg(u, 4, 4.3), () => line(764, 504, 1126, 504, '#1d3448', 1.5, 'butt'));
    reveal('측정소를 설치·운영합니다', 764, 550, 23, seg(u, 4, 4.5), A, 'left', 700); shine(740, 170, 410, 420, seg(u, 4.4, 5), 16);
  },
  // 2 공기 채취: 흡입구가 바깥 공기를 받아 시료관으로 측정 장비까지 보낸다.
  (u, T, now) => {
    night(now, {ground: 624, city: .8});
    tree(52, 624, 1.1); tree(668, 624, 1.25); tree(744, 624, .9);
    for (let i = 0; i < 5; i++) { const q = (now * .2 + i / 5) % 1, yy = 150 + i * 44, x0 = 780 - q * 420; alpha(Math.sin(q * Math.PI) * .5, () => { c.beginPath(); c.moveTo(x0, yy); c.bezierCurveTo(x0 - 26, yy - 9, x0 - 52, yy + 9, x0 - 82, yy); c.strokeStyle = rgba(P.cyan, .7); c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt' }) }
    shelter(now, eio(seg(u, 1.6, 2.4)), DROPS.map((_, i) => seg(u, 2.9 + i * .18, 3.25 + i * .18)));
    rings(IN[0], IN[1] - 4, now, A, 10, 64, 3, 1, .7);
    for (let n = 0; n < 26; n++) { const q = (now * .28 + n / 26) % 1, a = hash(n) * 6.2832 + q * 2.4, r = lerp(200, 8, q), col = ITEMS[n % 6][4], px = IN[0] + Math.cos(a) * r, py = IN[1] - 4 + Math.sin(a) * r * .7, al = Math.sin(q * Math.PI); halo(px, py, 12, col, .7 * al); alpha(al, () => circ(px, py, 3.2, col)) }
    trace([[240, 222], [240, 440]], seg(u, 1.7, 2.4), A, 3.5, {glow: 10});
    DROPS.forEach((x, i) => { trace([[240, 440], [x, 440], [x, 482]], seg(u, 2.35 + i * .1, 2.8 + i * .1), A, 3, {glow: 8}); burst(x, 510, seg(u, 2.95 + i * .18, 3.5 + i * .18), UCOL[i], 8, 44) });
    if (u > 2.4) alpha(seg(u, 2.4, 2.8), () => DROPS.forEach((x, i) => dots([[240, 222], [240, 440], [x, 440], [x, 482]], now + i * .33, '#eafff7', 3, 3, .4)));
    callout(262, 211, 322, 200, '흡입구', seg(u, 1, 1.6), A, {size: 22});
    callout(240, 316, 300, 298, '시료관', seg(u, 2.1, 2.7), A, {size: 22});
    callout(436, 536, 612, 480, '측정 장비', seg(u, 3.05, 3.65), P.amber, {size: 22});
    panel(800, 196, 352, 222, null, null, A, seg(u, 3.3, 3.9));
    reveal('흡입구 → 시료관', 824, 254, 27, seg(u, 3.55, 4.05), A, 'left', 700);
    const ul = eout(seg(u, 3.7, 4.2)); if (ul > 0) line(826, 272, 826 + 300 * ul, 272, '#1d3448', 1.5, 'butt');
    reveal('바깥 공기를', 824, 316, 23, seg(u, 3.85, 4.35), P.text, 'left', 700); reveal('측정 장비로 보냅니다', 824, 350, 23, seg(u, 4.05, 4.55), P.text, 'left', 700);
    alpha(seg(u, 4.2, 4.6), () => { line(828, 388, 1124, 388, rgba(A, .3), 2, 'butt'); dots([[828, 388], [1124, 388]], now, A, 4, 3, .35); [828, 976, 1124].forEach(x => circ(x, 388, 6, '#07121d', A, 2)) });
    shine(800, 196, 352, 222, seg(u, 4.5, 5.1), 16);
  },
  // 3 연속 측정: 여섯 항목을 쉬지 않고 재고, 시간별 값이 그래프로 쌓인다.
  (u, T, now) => {
    lab(590);
    const RX = 60, RY = 168, ph = seg(u, 2, 4.6);
    line(416, 0, 416, RY + 4, '#1c394d', 9, 'butt'); line(416, 0, 416, RY + 4, 'rgba(150,210,235,.18)', 3, 'butt'); dots([[416, 0], [416, RY + 6]], now, A, 4, 3, .5);
    slide(seg(u, .3, .9), 0, 26, () => { alpha(.45, () => box(RX + 5, RY + 10, 404, 412, 'rgba(0,0,0,.6)', 12)); box(RX + 24, RY + 408, 22, 14, '#22364a', 2); box(RX + 358, RY + 408, 22, 14, '#22364a', 2); box(RX, RY, 404, 412, '#0f1c29', 12, '#27425a');
      glow(A, 10, () => line(RX + 20, RY + 1, RX + 78, RY + 1, A, 3)); txt('측정 장비', RX + 20, RY + 30, 20, P.text, 'left', 700); txt('예시', RX + 384, RY + 30, 16, P.muted, 'right', 600) });
    ITEMS.forEach((it, i) => { const k = seg(u, 1 + i * .13, 1.45 + i * .13); if (k <= 0) return; const x = RX + 14, y = RY + 44 + i * 60, v = it[2] * (1 + .08 * Math.sin(now * 1.3 + i)), on = Math.sin(now * 4 + i) > 0;
      slide(k, -36, 0, () => { box(x, y, 376, 54, '#0c1926', 8, '#213a50'); c.fillStyle = it[4]; c.fillRect(x + 1, y + 11, 3, 32);
        if (on) halo(x + 16, y + 27, 11, P.green, .7); circ(x + 16, y + 27, 4.5, on ? P.green : '#1b3a2a'); mono(it[0], x + 28, y + 34, 20, it[4], 'left', 700);
        c.save(); c.beginPath(); c.rect(x + 114, y + 6, 66, 42); c.clip(); spark(x + 114, y + 41, 66, 28, q => .5 + .3 * Math.sin(q * 9 + now * 2.2 + i * 1.7) + .12 * Math.sin(q * 23 + now * 3 + i), 1, rgba(it[4], .9), 2); c.restore();
        box(x + 190, y + 9, 106, 36, '#050d15', 5, '#1d3448', 1); mono(v.toFixed(it[3]), x + 288, y + 34, 20, '#7ee0a0', 'right', 700); mono(it[1], x + 304, y + 33, 16, P.muted, 'left', 500) }) });
    [[2, P.amber], [3, P.violet], [5, '#e9d5a0']].forEach(([r, col], j) => { const y = RY + 44 + r * 60 + 27, k = seg(u, 1.7 + j * .1, 2.1 + j * .1), p = [[RX + 392, y], [516, y]]; trace(p, k, col, 2.2, {dash: [5, 6], glow: 6, head: false}); if (k >= 1) dots(p, now + j * .3, col, 2, 3, .9) });
    const pk = seg(u, 1.15, 1.75); panel(516, 168, 634, 412, '시간별 측정값', null, A, pk);
    alpha(seg(u, 1.5, 1.85), () => { txt('24시간 연속 · 예시', 536, 232, 16, P.muted, 'left', 600);
      LEG.forEach(([s, col], i) => { const lx = [906, 980, 1040][i]; halo(lx, 200, 12, col, .8); circ(lx, 200, 6, col); txt(s, lx + 12, 206, 17, P.text, 'left', 600) });
      for (let j = 0; j <= 4; j++) line(566, 526 - j * 60, 1106, 526 - j * 60, 'rgba(140,180,205,' + (j ? .08 : .22) + ')', 1, 'butt');
      for (let h = 0; h <= 24; h += 6) { line(566 + 540 * h / 24, 526, 566 + 540 * h / 24, 532, 'rgba(140,180,205,.3)', 1, 'butt'); mono(String(h).padStart(2, '0') + '시', 566 + 540 * h / 24, 556, 16, P.muted, 'center', 500) }
      LEG.forEach(([s, col], i) => lineChart(566, 526 - i * 10, 540, 360, q => .35 + .2 * Math.sin(q * 6.2832 * 1.5 + i) + .08 * Math.sin(q * 40 + i * 3), ph, {col, grid: false, lw: 2.6}));
      if (ph > 0) { const cx = 566 + 540 * ph; line(cx, 290, cx, 526, 'rgba(255,255,255,.3)', 1.5, 'butt'); chip(cx, 280, String(Math.floor(ph * 24)).padStart(2, '0') + '시', A, 'center', 16) } });
  },
  // 4 자료 점검: 표준가스로 장비를 교정하고, 측정자료에서 이상값을 찾아 제외한다.
  (u, T, now) => {
    lab(600);
    const cal = eio(seg(u, 1.3, 2.1)), ok = cal >= 1, tube = curve(179, 338, 340, 400, -110);
    cylinder(100, 600, now);
    trace(tube, 1, '#1c394d', 8, {glow: false, head: false}); trace(tube, 1, 'rgba(150,210,235,.2)', 2.5, {glow: false, head: false});
    trace(tube, seg(u, 1, 1.5), A, 2.5, {glow: 8}); if (u > 1.4) dots(tube, now, A, 4, 3.2, .5);
    box(310, 524, 250, 76, '#12222f', 6, '#27425a'); box(302, 514, 266, 12, '#2a4860', 3); box(328, 544, 100, 44, '#0d1a28', 4, '#1d3448'); box(442, 544, 100, 44, '#0d1a28', 4, '#1d3448');
    box(332, 394, 16, 12, '#8aa5b3', 2); box(318, 404, 234, 110, '#16283a', 8, '#35506a'); box(334, 420, 150, 62, '#040b13', 5, '#1d3448', 1);
    c.save(); rr(334, 420, 150, 62, 5); c.clip(); c.setLineDash([5, 5]); line(340, 451, 478, 451, 'rgba(255,255,255,.32)', 1.2, 'butt'); c.setLineDash([]);
    c.beginPath(); for (let i = 0; i <= 46; i++) { const q = i / 46, yy = 451 + (21 * (1 - cal) + 1.4) * Math.sin(q * 15 - now * 5) * (.6 + .4 * Math.sin(q * 5 + now)); i ? c.lineTo(340 + 138 * q, yy) : c.moveTo(340, yy) } c.strokeStyle = ok ? P.green : P.amber; c.lineWidth = 2.6; c.lineJoin = 'round'; c.stroke(); c.lineJoin = 'miter'; c.restore();
    const led = ok ? P.green : P.amber, bl = ok || Math.sin(now * 9) > 0; if (bl) halo(516, 438, 16, led, .8); circ(516, 438, 7, bl ? led : '#2a2a1c');
    circ(516, 478, 14, '#0d1b28', '#35506a', 2); line(516, 478, 516 + Math.cos(-2 + cal * 2.6) * 10, 478 + Math.sin(-2 + cal * 2.6) * 10, '#c8d4db', 2.5); for (let j = 0; j < 5; j++) line(338 + j * 30, 498, 356 + j * 30, 498, '#22394d', 3, 'butt');
    person(232, 600, 2.2, {now, pose: 'tablet', vest: '#3d8f6a', hat: '#e9eef0'});
    pop(seg(u, 2.1, 2.5), 436, 366, () => { halo(436, 366, 50, P.green, .45); circ(436, 366, 22, 'rgba(6,26,22,.96)', P.green, 3) }); tick(435, 366, seg(u, 2.25, 2.6), P.green, 1.1); burst(436, 366, seg(u, 2.2, 2.8), P.green, 12, 62);
    // 측정자료 점검 패널
    const pk = seg(u, 1.3, 1.9), X0 = 640, CW = 470, Y0 = 506, CH = 230, N = 160, s = 1 - eio(seg(u, 3.9, 4.4)), k1 = seg(u, 1.9, 2.8), n = Math.round(N * k1), py = (q, sp) => Y0 - CH * QA(q, sp), fx = X0 + CW * .62;
    panel(600, 160, 550, 440, '측정자료 품질 점검', null, A, pk);
    alpha(seg(u, 1.65, 1.95), () => { mono('QA / QC', 620, 221, 16, P.muted, 'left', 500); for (let j = 0; j <= 4; j++) line(X0, Y0 - CH * j / 4, X0 + CW, Y0 - CH * j / 4, 'rgba(140,180,205,' + (j ? .08 : .22) + ')', 1, 'butt') });
    const sq = u < 2.7 ? -1 : u < 3.3 ? .62 * eio(seg(u, 2.7, 3.3)) : u < 4.4 ? .62 : (.62 + (u - 4.4) * .28) % 1;
    if (sq >= 0) { const sx = X0 + CW * sq, w = Math.min(80, sx - X0); c.fillStyle = grad(sx - 80, 0, sx, 0, [[0, rgba(P.cyan, 0)], [1, rgba(P.cyan, .2)]]); c.fillRect(sx - w, Y0 - CH, w, CH); line(sx, Y0 - CH - 6, sx, Y0 + 6, rgba(P.cyan, .9), 2, 'butt') }
    if (n > 0) { const path = sp => { c.beginPath(); for (let i = 0; i <= n; i++) { const q = i / N; i ? c.lineTo(X0 + CW * q, py(q, sp)) : c.moveTo(X0, py(0, sp)) } };
      if (s < 1) alpha(.55 * (1 - s), () => { c.save(); c.beginPath(); c.rect(fx - 26, Y0 - CH, 52, CH); c.clip(); c.setLineDash([5, 5]); path(1); c.strokeStyle = P.red; c.lineWidth = 2; c.stroke(); c.restore() });
      path(s); c.strokeStyle = A; c.lineWidth = 3; c.lineJoin = 'round'; glow(A, 10, () => c.stroke());
      const fk = seg(u, 3.3, 3.6); if (fk > 0 && s > 0) alpha(fk * s, () => { c.save(); c.beginPath(); c.rect(fx - 22, Y0 - CH, 44, CH); c.clip(); path(s); c.strokeStyle = P.red; c.lineWidth = 3.4; glow(P.red, 12, () => c.stroke()); c.restore() });
      c.lineJoin = 'miter'; if (k1 < 1) { const hx = X0 + CW * n / N, hy = py(n / N, s); halo(hx, hy, 22, A, .9); circ(hx, hy, 5, '#fff', A, 2) } }
    pop(seg(u, 3.3, 3.65), fx, 390, () => box(fx - 27, Y0 - CH - 4, 54, CH + 10, rgba(P.red, .1), 8, rgba(P.red, s > .02 ? .55 + .45 * Math.sin(now * 8) : .4), 2));
    pop(seg(u, 3.4, 3.8), fx, 256, () => chip(fx, 262, '이상값', P.red, 'center', 19));
    const xk = seg(u, 3.7, 3.95); if (xk > 0) { c.save(); c.translate(fx, 330); c.scale(1.7, 1.7); cross(0, 0, xk, P.red); c.restore() } burst(fx, 330, seg(u, 3.75, 4.3), P.red, 10, 50);
    checklist(640, 566, ['교정 완료'], u, 2.15, {size: 22, col: P.green}); checklist(866, 566, ['이상값 제외'], u, 4.05, {size: 22, col: P.green});
    pop(seg(u, 4.35, 4.75), 1108, 198, () => circ(1108, 198, 19, rgba(P.green, .14), P.green, 2)); tick(1107, 198, eout(seg(u, 4.45, 4.8)), P.green, 1); burst(1108, 198, seg(u, 4.45, 5), P.green, 10, 46);
  },
  // 5 분석·평가: 측정자료로 농도 분포와 연도별 변화를 살핀다.
  (u, T, now) => {
    blueprint();
    region(now, eout(seg(u, .15, 1.1)), () => { c.save(); c.transform(6.1, 0, -1.2, 4.2, 96, 196); c.globalCompositeOperation = 'lighter';
      HEAT.forEach(([x, y, r, w], i) => { const k = eout(seg(u, 1 + i * .25, 1.9 + i * .25)); if (k <= 0) return; const R = r * k * (1 + .05 * Math.sin(now * 1.4 + i * 2));
        c.fillStyle = rgrad(x, y, 0, R, [[0, rgba(w > .8 ? P.mag : P.amber, .6 * w)], [.45, rgba(P.amber, .34 * w)], [.8, rgba(P.cyan, .14)], [1, rgba(P.cyan, 0)]]); c.beginPath(); c.arc(x, y, R, 0, 6.2832); c.fill();
        for (let j = 0; j < 3; j++) { const q = (now * .22 + j / 3) % 1; c.globalAlpha = (1 - q) * .55 * k; c.beginPath(); c.arc(x, y, r * (.15 + .85 * q), 0, 6.2832); c.strokeStyle = w > .8 ? P.mag : P.amber; c.lineWidth = .32; c.stroke() } c.globalAlpha = 1 });
      c.restore() });
    trace(OUT, seg(u, .1, 1.3), A, 2.5);
    STY.forEach((s, i) => { const v = level(s.mx, s.my), t0 = 1.3 + s.d * .02, k = eout(seg(u, t0, t0 + .6)); if (k <= 0) return; const col = lvCol(v), h = (12 + 88 * v) * k * (1 + .04 * Math.sin(now * 2.2 + i));
      ell(s.x, s.y, 10, 4.5, rgba(col, .45)); rr(s.x - 4.5, s.y - h, 9, h, 3); c.fillStyle = grad(0, s.y - h, 0, s.y, [[0, col], [1, rgba(col, .22)]]); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(s.x - 3.5, s.y - h + 2, 1.6, Math.max(0, h - 4));
      halo(s.x, s.y - h, 13, col, .85); circ(s.x, s.y - h, 3, '#fff') });
    const lk = curve(606, 398, 700, 316, -24); trace(lk, seg(u, 2.2, 2.7), A, 2, {dash: [6, 7], glow: 6}); if (u > 2.65) dots(lk, now, A, 3, 3, .6);
    const pk = seg(u, 2.1, 2.7); panel(700, 156, 450, 304, '연도별 대기질 평가', null, A, pk);
    alpha(seg(u, 2.45, 2.8), () => { txt('예시 자료', 720, 218, 16, P.muted, 'left', 600); for (let j = 0; j <= 3; j++) line(730, 418 - j * 50, 1120, 418 - j * 50, 'rgba(140,180,205,' + (j ? .08 : .25) + ')', 1, 'butt');
      YEARS.forEach((v, i) => { const k = eout(seg(u, 2.6 + i * .13, 3.2 + i * .13)), x = 746 + i * 76, h = 200 * v * k, last = i === 4;
        if (h > 1) { rr(x, 418 - h, 48, h, [6, 6, 1, 1]); c.fillStyle = last ? grad(0, 418 - h, 0, 418, [[0, '#a6f5d8'], [1, rgba(A, .6)]]) : grad(0, 418 - h, 0, 418, [[0, '#3f6d8c'], [1, '#1f3a50']]); if (last) glow(A, 14, () => c.fill()); else c.fill() }
        mono(String(2021 + i), x + 24, 444, 16, last ? P.text : P.muted, 'center', 600) }) });
    const tr = YEARS.map((v, i) => [770 + i * 76, 404 - 200 * v]); trace(tr, seg(u, 3.3, 3.9), P.amber, 2.5, {dash: [7, 6], glow: 8}); if (u > 3.9) dots(tr, now, P.amber, 2, 3.4, .35);
    card(700, 472, 450, 60, 'search', '대기환경 현황 파악', null, P.mint, seg(u, 3.6, 4.1)); card(700, 542, 450, 60, 'doc', '정책 자료로 활용', null, P.amber, seg(u, 3.9, 4.4));
    shine(700, 472, 450, 60, seg(u, 4.3, 4.8)); shine(700, 542, 450, 60, seg(u, 4.5, 5));
  }
]});
})();
