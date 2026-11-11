// 기획과 · 대기환경 교육·홍보 — 모션그래픽 v2
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, spring, seg, hash, rgba, rr, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, halo, chip, tick, rings, plume, dots, pop, slide, reveal, trace, callout, burst, beam, shine, night, blueprint, factory, car, person, phone, tree, curve, icon, layer} = CINE;
const DISP = '"Black Han Sans","IBM Plex Sans KR","Malgun Gothic",sans-serif';

// ----- 공용 그림 -----
function hall(now) {
  layer(0, () => { c.fillStyle = grad(0, 0, 0, H, [[0, '#050b14'], [.7, '#0d2034'], [1, '#0a1826']]); c.fillRect(0, 0, W, H) });
  layer(.6, () => { for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? 'rgba(120,200,255,.035)' : 'rgba(120,200,255,.012)'; c.fillRect(i * 140 - 60, 0, 140, 600) } });
  for (let i = 0; i < 4; i++) { const x = 150 + i * 300; beam(x, -10, Math.PI / 2 + Math.sin(now * .5 + i * 1.7) * .22, 640, 130, i % 2 ? '#ffd9a0' : '#bfe9ff', .11); halo(x, 0, 44, '#dff4ff', .7) }
  c.fillStyle = grad(0, 585, 0, 660, [[0, '#1a3348'], [1, '#0a1622']]); c.fillRect(0, 585, W, 135); c.fillStyle = grad(0, 585, 0, 720, [[0, rgba(A, .12)], [1, rgba(A, 0)]]); c.fillRect(0, 585, W, 135); line(0, 585, W, 585, rgba(A, .5), 2, 'butt') }
function audience(now) { layer(1.25, () => { for (let i = 0; i < 10; i++) { const x = 20 + i * 132, b = Math.sin(now * 1.8 + i * 1.3) * 3, y = 748; circ(x, y - 80 + b, 25, '#09141f'); box(x - 42, y - 58 + b, 84, 100, '#08121c', 24);
  c.beginPath(); c.arc(x, y - 80 + b, 25, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 2; c.strokeStyle = 'rgba(150,215,255,.28)'; c.stroke() } }) }
function heatHouse(x, y, now) { plume(x + 37, y - 132, now, {len: 96, dx: 28, n: 10, r1: 15, a: .4});
  c.save(); c.translate(x, y); ell(0, 2, 82, 7, 'rgba(0,0,0,.42)'); c.fillStyle = '#27506a'; c.fillRect(28, -130, 18, 44); c.fillStyle = '#c95a4e'; c.fillRect(27, -132, 20, 6);
  c.fillStyle = grad(0, -84, 0, 0, [[0, '#2d5672'], [1, '#182f44']]); c.fillRect(-60, -84, 120, 84); poly([[-76, -82], [0, -134], [76, -82]], '#3b6c80'); line(-76, -82, 0, -134, 'rgba(255,255,255,.22)', 2);
  for (const wx of [-45, 15]) { halo(wx + 15, -46, 36, '#ffb060', .65); box(wx, -62, 30, 32, '#ffcf8a', 3); line(wx + 15, -62, wx + 15, -30, 'rgba(18,36,54,.6)', 2, 'butt') }
  box(-11, -40, 22, 40, '#12263a', [3, 3, 0, 0]); c.restore() }
function sun(x, y, r, now) { halo(x, y, r * 5.5, P.amber, .5); halo(x, y, r * 2.4, '#fff1c9', .85); circ(x, y, r, '#ffd27a'); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + now * .25, q = r * 1.85 + 6 * Math.sin(now * 3 + i); line(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35, x + Math.cos(a) * q, y + Math.sin(a) * q, P.amber, 3) } }
function bus(x, y, now) { c.save(); c.translate(x, y + Math.sin(now * 9) * .8); ell(180, 3, 198, 8, 'rgba(0,0,0,.5)'); halo(180, 0, 180, P.mint, .1); beam(358, -40, 0, 250, 56, '#fff3cf', .15);
  rr(0, -148, 360, 130, [18, 32, 10, 10]); c.fillStyle = grad(0, -148, 0, -18, [[0, '#3fae92'], [.6, '#2a7f6b'], [1, '#1b574a']]); c.fill(); c.fillStyle = 'rgba(255,255,255,.32)'; c.fillRect(16, -146, 312, 3);
  for (let i = 0; i < 4; i++) { const wx = 22 + i * 62; box(wx, -128, 52, 44, '#0c232d', 6); if (i !== 1) { circ(wx + 26, -100, 9, '#2a5562'); box(wx + 13, -92, 26, 8, '#2a5562', [7, 7, 0, 0]) } poly([[wx + 6, -124], [wx + 20, -124], [wx + 10, -106], [wx + 6, -106]], 'rgba(160,220,255,.14)') }
  box(272, -128, 30, 98, '#14404a', 5, 'rgba(255,255,255,.16)', 1); line(287, -126, 287, -32, 'rgba(255,255,255,.14)', 1, 'butt');
  poly([[312, -130], [342, -130], [354, -86], [312, -86]], '#0c232d'); poly([[316, -126], [328, -126], [334, -104], [316, -104]], 'rgba(160,220,255,.16)');
  c.fillStyle = P.mint; c.fillRect(0, -72, 360, 8); txt('대중교통', 146, -36, 21, '#e8fff5', 'center', 700);
  halo(356, -40, 28, '#fff3cf', .9); box(351, -47, 8, 13, '#ffe9b0', 3); box(0, -54, 5, 14, '#ff4545', 2);
  for (const wx of [76, 284]) { circ(wx, -18, 22, '#05080c'); circ(wx, -18, 10.5, '#8f9ea8'); for (let k = 0; k < 5; k++) { const a = now * 8 + k * 1.2566; line(wx, -18, wx + Math.cos(a) * 9.5, -18 + Math.sin(a) * 9.5, '#3b4d59', 2.4) } circ(wx, -18, 3.4, '#1d2a33') }
  c.restore() }
function cyclist(x, y, s, now) { const a = now * 7, F = P.cyan; c.save(); c.translate(x, y); c.scale(s, s); ell(31, 3, 56, 5, 'rgba(0,0,0,.45)');
  for (const wx of [0, 62]) { circ(wx, -20, 20, null, '#b8c8d2', 3); for (let k = 0; k < 6; k++) line(wx, -20, wx + Math.cos(a + k * 1.047) * 19, -20 + Math.sin(a + k * 1.047) * 19, 'rgba(184,200,210,.4)', 1) }
  line(0, -20, 28, -18, F, 3); line(28, -18, 20, -50, F, 3); line(20, -50, 50, -48, F, 3); line(28, -18, 50, -48, F, 3); line(50, -48, 62, -20, F, 3); line(50, -48, 53, -61, '#b8c8d2', 3); line(46, -62, 59, -61, '#b8c8d2', 3.5); line(13, -51, 27, -51, '#22303c', 4.5);
  const leg = (fx, fy, col) => { const hx = 20, hy = -55, mx = (hx + fx) / 2 + 10, my = (hy + fy) / 2 - 4; line(hx, hy, mx, my, col, 6.5); line(mx, my, fx, fy, col, 5.5); box(fx - 5, fy - 2, 11, 4, '#0c141d', 2) };
  leg(28 - Math.cos(a) * 9, -18 - Math.sin(a) * 9, '#1a2c40'); line(20, -55, 39, -80, P.violet, 10); line(38, -78, 55, -63, '#8f78e0', 5.5); circ(55, -62, 3.2, '#f2cba6'); leg(28 + Math.cos(a) * 9, -18 + Math.sin(a) * 9, '#243a52');
  circ(43, -91, 8.6, '#f2cba6'); circ(46.5, -91.5, 1.1, '#2b2523'); c.fillStyle = '#f5c542'; c.beginPath(); c.arc(43, -93, 9.6, Math.PI, 0); c.closePath(); c.fill(); c.restore() }
function miniHouse(x, y, lit, now, i) { c.save(); c.translate(x, y); ell(0, 2, 40, 4, 'rgba(0,0,0,.4)'); c.fillStyle = grad(0, -46, 0, 0, [[0, '#2d5672'], [1, '#182f44']]); c.fillRect(-30, -46, 60, 46); poly([[-39, -44], [0, -74], [39, -44]], '#3b6c80');
  if (lit > 0) halo(0, -24, 46, '#ffc46e', .7 * lit); box(-19, -34, 16, 16, lit > 0 ? rgba('#ffd98a', .35 + .65 * lit * (.9 + .1 * Math.sin(now * 3 + i))) : '#0e2233', 2); box(4, -34, 16, 16, lit > 0 ? rgba('#ffd98a', .35 + .65 * lit) : '#0e2233', 2); c.restore() }

CINE.story({
cams: [
  [[0, 600, 372, 1], [1, 600, 372, 1], [4.8, 610, 342, 1.1]],
  [[0, 430, 420, 1.2], [1.4, 470, 410, 1.2], [2.6, 660, 372, 1.08], [4.8, 600, 360, 1]],
  [[0, 540, 380, 1.08], [2.1, 550, 380, 1.08], [3.1, 610, 366, 1.02], [4.8, 600, 360, 1]],
  [[0, 520, 420, 1.15], [1.2, 520, 420, 1.15], [2.4, 600, 380, 1.03], [4.8, 606, 366, 1]],
  [[0, 400, 385, 1.2], [1.3, 430, 385, 1.2], [2.7, 650, 372, 1.06], [4.8, 600, 362, 1]]
],
scenes: [
  // 1 교육 준비: 강의장 화면에 대상별 프로그램이 뜬다.
  (u, T, now) => {
    hall(now); const sk = eout(seg(u, .2, .9));
    box(244, 144, 712, 332, '#1c2f42', 12, '#35506a', 1.5); halo(600, 310, 560, A, .14 * sk);
    c.save(); c.beginPath(); c.rect(250, 150 + 160 * (1 - sk), 700, 320 * sk); c.clip(); c.fillStyle = grad(250, 150, 950, 470, [[0, '#0d3350'], [.6, '#122447'], [1, '#2a1640']]); c.fillRect(250, 150, 700, 320);
    for (let i = 0; i < 10; i++) halo(250 + hash(i) * 700 + Math.sin(now * .4 + i) * 30, 170 + hash(i + 5) * 280, 40 + hash(i + 9) * 50, i % 2 ? A : P.mag, .13);
    for (let i = 0; i < 18; i++) { const ph = (now * .08 + hash(i + 20)) % 1; halo(260 + hash(i + 30) * 680, 470 - ph * 330, 5, '#dff4ff', .5 * Math.sin(ph * Math.PI)) } c.restore();
    if (sk < 1) glow(A, 16, () => line(250, 310, 950, 310, rgba('#ffffff', 1 - sk), 3));
    reveal('우리 동네 공기 이야기', 600, 262, 52, seg(u, .9, 1.5), P.text, 'center', 400, DISP);
    reveal('대기환경 교육 프로그램', 600, 304, 21, seg(u, 1.2, 1.7), A, 'center', 700);
    [['people', '학생', '학교 방문 교육', A], ['home', '주민', '생활 속 대기 이야기', P.mint], ['factory', '사업장', '배출 관리 교육', P.amber]].forEach(([kind, t, s, col], i) => { const cx = 372 + i * 228, t0 = 1.6 + i * .32, k = seg(u, t0, t0 + .5);
      pop(k, cx, 394, () => { box(cx - 104, 344, 208, 100, 'rgba(5,13,22,.93)', 14, col, 1.8); alpha(.1, () => box(cx - 104, 344, 208, 100, col, 14)); icon(kind, cx - 66, 380, 22, col); txt(t, cx - 32, 389, 25, col, 'left', 700); txt(s, cx, 428, 17, P.text, 'center', 500) }, {ease: spring}); shine(cx - 104, 344, 208, 100, seg(u, t0 + .5, t0 + 1.1)) });
    const lp = clamp(Math.floor((u - 1.6) / .32), 0, 2), lx = 372 + lp * 228 + Math.sin(now * 3) * 30, ly = 338 + Math.cos(now * 2.3) * 5; if (u > 1.6) { halo(lx, ly, 14, P.red, .9); circ(lx, ly, 3, '#fff') }
    const pk = seg(u, .5, 1.3), px = lerp(1280, 1040, eout(pk)); person(px, 583, 2.1, {now, pose: pk < 1 ? 'walk' : 'point', flip: true, helmet: false, vest: '#3a7fa8', stripes: false});
    audience(now);
  },
  // 2 발생 원인: 배출된 기체가 햇빛 아래 반응해 오존과 초미세먼지가 된다.
  (u, T, now) => {
    night(now, {ground: 610, city: .45, glow: 'rgba(255,181,71,.14)'});
    slide(seg(u, .3, .9), -70, 0, () => car(70, 606, 1.05, '#4d7bd6', {spin: now * 4})); slide(seg(u, .45, 1.05), 0, 50, () => factory(292, 610, .85, {w: 240, h: 110, sh: 110, smoke: true, now})); slide(seg(u, .6, 1.2), 0, 50, () => heatHouse(604, 610, now));
    pop(seg(u, 1, 1.4), 157, 504, () => chip(157, 508, '자동차', P.text, 'center', 20)); pop(seg(u, 1.1, 1.5), 356, 462, () => chip(356, 466, '공장', P.text, 'center', 20)); pop(seg(u, 1.2, 1.6), 590, 446, () => chip(590, 450, '난방', P.text, 'center', 20));
    const V = [836, 338], react = seg(u, 2, 2.6);
    pop(seg(u, 1.5, 2.1), 836, 196, () => sun(836, 196, 32, now)); pop(seg(u, 1.8, 2.2), 920, 178, () => chip(898, 184, '햇빛', P.amber, 'left', 20));
    alpha(react * (.7 + .3 * Math.sin(now * 2.4)), () => beam(836, 226, Math.PI / 2, 150, 70, '#ffd27a', .22));
    [['NOx', P.amber, 176, 548], ['SOx', P.mint, 440, 430], ['VOCs', P.violet, 372, 498], ['NH₃', P.cyan, 640, 472]].forEach(([g, col, x0, y0], i) => { const t0 = 1.2 + i * .22, k = seg(u, t0, t0 + 1.3); if (k <= 0) return;
      const ang = now * 1.5 + i * Math.PI / 2, ox = V[0] + Math.cos(ang) * 48, oy = V[1] + Math.sin(ang) * 36, path = curve(x0, y0, ox, oy, -110), [x, y] = path[Math.round(eio(k) * 26)];
      if (k > .25) dots(path, now + i * .3, col, 3, 2.6, .32);
      pop(clamp(k * 4), x, y, () => { halo(x, y, 52, col, .4); circ(x, y, 27, 'rgba(6,14,24,.92)', col, 2.2); mono(g, x, y + 6, 17, col, 'center', 700) }) });
    if (react > 0) { alpha(react, () => { halo(V[0], V[1], 120, '#fff1c9', .28 + .12 * Math.sin(now * 9)); c.save(); c.translate(V[0], V[1]); c.rotate(now * 2.2); for (let j = 0; j < 3; j++) { c.rotate(2.094); c.beginPath(); c.arc(0, 0, 78, 0, 1.25); c.strokeStyle = rgba('#fff1c9', .7); c.lineWidth = 3; c.lineCap = 'round'; c.stroke() } c.restore(); c.lineCap = 'butt' });
      burst(V[0], V[1], (now * .9) % 1, '#fff1c9', 8, 66); pop(seg(u, 2.3, 2.7), V[0], 446, () => chip(V[0], 450, '화학반응', P.text, 'center', 20)) }
    [['오존 O₃', A, 246, 2.8], ['초미세먼지', P.amber, 372, 3.2]].forEach(([s, col, y, t0], i) => { const k = seg(u, t0, t0 + .5), f = curve(V[0] + 70, V[1] + (i ? 20 : -20), 944, y + 46, i ? 30 : -30, 14);
      trace(f, seg(u, t0 - .25, t0 + .2), col, 2.4, {glow: 8}); if (u > t0 + .2) dots(f, now, col, 3, 3, .7);
      pop(k, 1058, y + 46, () => { halo(1058, y + 46, 150, col, .22); box(946, y, 224, 92, 'rgba(6,14,24,.94)', 16, col, 2); alpha(.12, () => box(946, y, 224, 92, col, 16)); disp(s, 1058, y + 59, 36, col, 'center');
        if (i) { c.save(); rr(946, y, 224, 92, 16); c.clip(); for (let j = 0; j < 16; j++) { const q = (now * .25 + j / 16) % 1; circ(950 + q * 220, y + 14 + hash(j) * 70 + Math.sin(now * 2 + j) * 3, 2 + hash(j + 4) * 2, rgba(P.amber, .5)) } c.restore() } }, {ease: spring}); burst(1058, y + 46, seg(u, t0 + .2, t0 + .8), col, 12, 150) });
    reveal('공기 중 화학반응으로 새로 생깁니다', 290, 212, 28, seg(u, 3.5, 4.1), P.text, 'left', 700); const ul = eout(seg(u, 3.8, 4.4)); if (ul > 0) glow(A, 8, () => line(292, 228, 292 + 170 * ul, 228, A, 3));
  },
  // 3 건강 보호: 대기질 정보를 확인하고 상황에 맞게 대응한다.
  (u, T, now) => {
    night(now, {ground: 620, city: .8, glow: 'rgba(255,181,71,.18)', haze: '#2a2438'});
    for (let i = 0; i < 44; i++) { const ph = (now * (.03 + hash(i) * .04) + hash(i + 3)) % 1; halo(1250 - ph * 1300, 170 + hash(i + 7) * 420 + Math.sin(now + i) * 10, 4 + hash(i + 1) * 7, '#d9a45a', .5 * Math.sin(ph * Math.PI)) }
    const v = eout(seg(u, 1, 2.1)), bad = seg(v, .55, 1), gc = v < .5 ? P.green : P.amber;
    slide(seg(u, .3, 1.1), 0, 70, () => phone(330, 402, 1.9, () => { c.fillStyle = grad(0, -106, 0, 106, [[0, '#0b1c2c'], [1, '#07121d']]); c.fillRect(-52, -106, 104, 212); txt('오늘의 대기질', 0, -84, 10, P.muted, 'center', 700);
      c.lineCap = 'round'; c.beginPath(); c.arc(0, -34, 31, Math.PI * .8, Math.PI * 2.2); c.strokeStyle = '#16293a'; c.lineWidth = 7; c.stroke(); c.beginPath(); c.arc(0, -34, 31, Math.PI * .8, Math.PI * (.8 + 1.4 * .72 * v)); c.strokeStyle = gc; c.lineWidth = 7; glow(gc, 8, () => c.stroke()); c.lineCap = 'butt';
      disp(bad > .5 ? '나쁨' : '보통', 0, -28, 19, gc, 'center'); mono('PM2.5 ' + Math.round(48 * v), 0, -10, 8.5, P.text, 'center', 700);
      ['마스크 착용', '실외활동 줄이기', '환기는 짧게'].forEach((s, j) => slide(seg(u, 2.1 + j * .28, 2.5 + j * .28), 24, 0, () => { box(-45, 20 + j * 25, 90, 21, 'rgba(255,181,71,.14)', 6, 'rgba(255,181,71,.5)', .8); circ(-34, 30.5 + j * 25, 4.6, P.amber); txt(s, -24, 33.6 + j * 25, 9.4, P.text, 'left', 700) })) }));
    if (u > 2 && u < 2.8) { rings(424, 208, now * 2, P.amber, 10, 54, 2, 1, .8); burst(424, 208, seg(u, 2, 2.6), P.amber, 10, 58) }
    const pk = seg(u, .8, 1.6), px = lerp(1300, 790, eout(pk)), by = -Math.sin(now * 2.1 + px * .013) * .7 * 3;
    person(px, 618, 3, {now, helmet: false, vest: '#4a6fa8', stripes: false, pose: pk < 1 ? 'walk' : 'stand'});
    if (pk >= 1) { pop(seg(u, 1.7, 2.1), 800, 396, () => { box(784, 386 + by, 35, 22, '#f1f5f7', 7, '#c9d6dd', 1); line(789, 393 + by, 814, 393 + by, '#c9d6dd', 1.2, 'butt'); line(789, 400 + by, 814, 400 + by, '#c9d6dd', 1.2, 'butt'); line(784, 391 + by, 768, 384 + by, '#f1f5f7', 2) });
      callout(823, 396, 928, 342, 'KF94', seg(u, 2.1, 2.8), P.text, {size: 26, sub: '마스크 착용'}); dots(curve(446, 330, 748, 410, -50), now, P.amber, 4, 3.2, .4) }
    pop(seg(u, 3, 3.5), 1000, 236, () => { box(846, 184, 308, 108, 'rgba(6,13,22,.93)', 16, P.amber, 1.8); alpha(.08, () => box(846, 184, 308, 108, P.amber, 16)) });
    reveal('대기질 예보·경보를 확인하고', 868, 230, 21, seg(u, 3.2, 3.7), P.text, 'left', 700); reveal('상황에 맞게 대응합니다', 868, 266, 21, seg(u, 3.5, 4), P.amber, 'left', 700);
  },
  // 4 생활 실천: 대중교통·친환경 운전 등 생활 속 실천을 알린다.
  (u, T, now) => {
    night(now, {ground: 600, city: .9, pan: 46, grid: false});
    for (let i = 0; i < 5; i++) { const x = ((i * 310 - now * 240) % 1550 + 1550) % 1550 - 150; tree(x, 600, 1.25) }
    c.fillStyle = grad(0, 600, 0, 720, [[0, '#0d1823'], [1, '#060c13']]); c.fillRect(0, 600, W, 120); line(0, 601, W, 601, rgba(A, .45), 2, 'butt');
    for (let i = -1; i < 9; i++) box(i * 160 - ((now * 240) % 160), 658, 82, 5, 'rgba(232,241,245,.34)', 2);
    const bx = lerp(-440, 96, eout(seg(u, .2, 1.3))) + Math.sin(now * .7) * 6, cx = lerp(1290, 570, eout(seg(u, .4, 1.6))) + Math.sin(now * .9 + 2) * 8;
    for (let i = 0; i < 6; i++) { const ph = (now * .5 + i / 6) % 1; alpha(Math.sin(ph * Math.PI) * .9, () => icon('leaf', bx - 14 - ph * 150, 540 - ph * 90 + Math.sin(ph * 9 + i) * 10, 11, P.mint, {bare: true})) }
    bus(bx, 648, now); cyclist(cx, 646, 1.35, now);
    [['대중교통 이용', P.mint], ['친환경 운전 · 공회전 줄이기', A], ['불법 소각 하지 않기', P.amber]].forEach(([s, col], i) => { const t0 = 1.4 + i * .5, y = 204 + i * 78;
      pop(seg(u, t0, t0 + .5), 965, y, () => { box(790, y - 31, 352, 62, 'rgba(6,13,22,.94)', 31, col, 1.8); alpha(.08, () => box(790, y - 31, 352, 62, col, 31)); circ(823, y, 17, rgba(col, .16), col, 1.6); tick(822, y - 1, seg(u, t0 + .25, t0 + .65), col, .8); txt(s, 853, y + 7, 21, P.text, 'left', 700) }, {ease: spring}); burst(823, y, seg(u, t0 + .3, t0 + .9), col, 8, 36) });
  },
  // 5 정보 전달: 교육·홍보가 여러 통로로 주민에게 닿는다.
  (u, T, now) => {
    blueprint(); const HX = 250, HY = 385;
    const ch = [['누리집', 'search', A, 610, 212], ['SNS · 영상', 'send', P.mag, 662, 327], ['현장 캠페인', 'people', P.mint, 662, 443], ['지자체 · 학교', 'home', P.amber, 610, 558]], homes = [[1010, 262], [1100, 262], [1010, 407], [1100, 407], [1010, 552], [1100, 552]];
    ch.forEach(([s, kind, col, x, y], i) => { const f = curve(HX + 92, HY + (i - 1.5) * 16, x - 125, y, (i - 1.5) * -14), lk = seg(u, 1.1 + i * .2, 1.7 + i * .2), g = curve(x + 125, y, 972, homes[Math.min(5, Math.round(i * 1.4))][1] - 30, 0, 12);
      trace(f, lk, rgba(col, .85), 2, {dash: [7, 7], glow: 6}); if (lk >= 1) dots(f, now + i * .21, col, 3, 3.2, .5);
      trace(g, seg(u, 2.3 + i * .15, 2.8 + i * .15), rgba(col, .6), 1.8, {dash: [5, 7], glow: false}); if (u > 2.8 + i * .15) dots(g, now + i * .13, col, 2, 3, .7);
      pop(seg(u, 1.5 + i * .2, 2 + i * .2), x, y, () => { box(x - 125, y - 33, 250, 66, 'rgba(7,16,27,.96)', 33, col, 1.8); alpha(.1, () => box(x - 125, y - 33, 250, 66, col, 33)); icon(kind, x - 88, y, 22, col); txt(s, x - 54, y + 8, 22, P.text, 'left', 700) }, {ease: spring}) });
    pop(seg(u, .4, 1.1), HX, HY, () => { rings(HX, HY, now, A, 92, 250, 3, .45, .5, 2); halo(HX, HY, 220, A, .3); circ(HX, HY, 90, 'rgba(8,24,40,.96)', A, 2.5);
      c.save(); c.translate(HX, HY); c.rotate(now * .4); c.setLineDash([10, 9]); circ(0, 0, 106, null, rgba(A, .6), 2); c.setLineDash([]); for (let i = 0; i < 3; i++) { const a = i * 2.094; halo(Math.cos(a) * 106, Math.sin(a) * 106, 13, A, .9); circ(Math.cos(a) * 106, Math.sin(a) * 106, 4, '#fff') } c.restore() }, {ease: spring});
    reveal('교육·홍보', HX, HY + 12, 33, seg(u, .8, 1.3), P.text, 'center', 400, DISP);
    homes.forEach(([x, y], i) => { const t0 = 2.9 + i * .16, lit = seg(u, t0, t0 + .4); pop(seg(u, 2.2 + i * .08, 2.7 + i * .08), x, y, () => miniHouse(x, y, lit, now, i)); burst(x, y - 30, seg(u, t0, t0 + .6), '#ffc46e', 8, 50) });
    pop(seg(u, 2.6, 3), 1055, 160, () => chip(1055, 164, '주민', P.text, 'center', 20));
  }
]});
})();
