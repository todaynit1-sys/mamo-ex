// 대기총량과 · 통합환경관리 — 모션그래픽 v2
(() => {
const {P, A, c, W, H, clamp, lerp, eio, eout, back, spring, seg, fade, rgba, box, line, poly, circ, ell, txt, mono, glow, alpha, grad, halo, panel, chip, tick, rings, plume, dots, pop, slide, reveal, trace, checklist, burst, stamp, beam, shine, badge, lineChart, icon, curve, night, blueprint, factory, pipe, person} = CINE;
const DISP = '"Black Han Sans","IBM Plex Sans KR","Malgun Gothic",sans-serif';

// ----- 공용 그림 -----
function gear(x, y, r, a, col) { c.save(); c.translate(x, y); c.rotate(a); for (let i = 0; i < 8; i++) { c.rotate(Math.PI / 4); c.fillStyle = col; c.fillRect(-2.4, -r, 4.8, r * .36) } circ(0, 0, r * .72, 'rgba(8,20,32,.95)', col, 2.2); circ(0, 0, r * .22, col); c.restore() }
// 대상을 조여 잡는 모서리 꺾쇠
function bracket(x, y, w, h, k, col, a = 1) { if (k <= 0 || a <= 0) return; const m = (1 - eout(k)) * 28, L = 20; alpha(clamp(k * 2) * a, () => { for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const bx = x - m + sx * (w + 2 * m), by = y - m + sy * (h + 2 * m), dx = sx ? -1 : 1, dy = sy ? -1 : 1;
  glow(col, 8, () => { line(bx, by, bx + dx * L, by, col, 3); line(bx, by, bx, by + dy * L, col, 3) }) } }) }
// 원 안에 그려지는 체크
function okMark(x, y, k, col = P.green, r = 15) { if (k <= 0) return; pop(k, x, y, () => { halo(x, y, r * 2.2, col, .4); circ(x, y, r, 'rgba(6,26,22,.96)', col, 2); tick(x - 1, y, seg(k, .3, 1), col, r / 21) }) }
// 1장면 공정 그림 4종(기준점: 바닥 가운데)
function artRaw(now) { [[-70, 66], [-22, 92], [26, 58]].forEach(([bx, h], j) => { c.fillStyle = grad(bx, 0, bx + 44, 0, [[0, '#2a4256'], [.5, '#46657d'], [1, '#22384a']]); c.fillRect(bx, -h - 12, 44, h); poly([[bx, -12], [bx + 44, -12], [bx + 30, 0], [bx + 14, 0]], '#22384a');
    const lv = .45 + .22 * Math.sin(now * .8 + j * 2); c.fillStyle = 'rgba(201,162,106,.8)'; c.fillRect(bx + 4, -12 - h * lv, 36, h * lv - 2); ell(bx + 22, -h - 12, 22, 5, '#5c7d94') });
  line(-84, 7, 84, 7, '#5d7c92', 3); for (let j = 0; j < 5; j++) { const ph = (now * .5 + j / 5) % 1; circ(-80 + ph * 160, 1, 3.5, '#c9a26a') } }
function artProc(now) { line(-40, -104, -40, -118, '#5d7c92', 6); line(40, -104, 40, -118, '#5d7c92', 6); box(-62, -104, 124, 104, '#1b3547', 12, rgba(A, .75), 1.6); c.fillStyle = 'rgba(255,181,71,.08)'; c.fillRect(-60, -50, 120, 48);
  gear(-30, -64, 21, now * 1.6, A); gear(15, -43, 27, -now * 1.25, A); gear(-22, -22, 13, now * 2.4, A);
  for (let j = 0; j < 5; j++) { const ph = (now * .6 + j / 5) % 1; halo(44 + Math.sin(j * 3) * 8, -8 - ph * 84, 6, P.amber, .75 * Math.sin(ph * Math.PI)) } }
function artFilter(now) { box(-64, -112, 128, 80, '#143a31', 8, rgba(P.mint, .85), 1.6); for (const hx of [-42, 0, 42]) poly([[hx - 20, -32], [hx + 20, -32], [hx + 6, -4], [hx - 6, -4]], '#1c4a3f', rgba(P.mint, .5), 1.2); line(-66, 6, 66, 6, '#3f6a5e', 3); for (const lx of [-60, 60]) line(lx, -32, lx, 6, '#3f6a5e', 3);
  for (let j = 0; j < 6; j++) line(-48 + j * 19.2, -102, -48 + j * 19.2, -42, rgba(P.mint, .5 + .3 * Math.sin(now * 3 + j)), 5);
  const sy = -106 + ((now * .5) % 1) * 68; c.fillStyle = grad(0, sy - 16, 0, sy + 2, [[0, rgba(P.mint, 0)], [1, rgba(P.mint, .5)]]); c.fillRect(-61, sy - 16, 122, 18) }
function artStack(now) { box(-58, -26, 116, 32, '#1b3346', 5, '#4b6b82', 1.2); c.fillStyle = grad(-16, 0, 16, 0, [[0, '#1b3856'], [.4, '#35608a'], [1, '#10243a']]); poly([[-16, -26], [16, -26], [11, -108], [-11, -108]], c.fillStyle);
  c.fillStyle = '#c95a4e'; c.fillRect(-11.7, -98, 23.4, 8); box(-13, -112, 26, 6, '#3a5f80', 2); plume(0, -114, now, {a: .3, len: 40, dx: 20, n: 8, r0: 3, r1: 10}) }
const ST = [[195, '원료', '#a9bdca', artRaw], [465, '공정', A, artProc], [735, '방지시설', P.mint, artFilter], [1005, '굴뚝', P.cyan, artStack]], FLOW = ['#c9a26a', '#ff8f5a', P.mint];
// 3장면 여과 집진 시설(방지시설)과 계기
function dial(x, y, r, v, label) { const ok = v > .3 && v < .7, col = ok ? P.green : P.amber; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, Math.PI, 0); c.strokeStyle = '#27425a'; c.lineWidth = 4.5; c.stroke(); c.beginPath(); c.arc(x, y, r, Math.PI * 1.3, Math.PI * 1.7); c.strokeStyle = rgba(P.green, .85); c.stroke(); c.lineCap = 'butt';
  const a = Math.PI * (1 + v); line(x, y, x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3), col, 2.6); circ(x, y, 2.6, col); txt(label, x + r + 8, y + 2, 16, P.text, 'left', 700) }
function filterHouse(now, u) { line(486, 545, 486, 610, '#3f6a5e', 5); line(634, 545, 634, 610, '#3f6a5e', 5); box(470, 430, 180, 118, '#123229', 8, rgba(P.mint, .8), 1.8); halo(560, 490, 150, P.mint, .16);
  for (let j = 0; j < 8; j++) line(490 + j * 20, 444, 490 + j * 20, 534, rgba(P.mint, .45 + .3 * Math.sin(now * 3 + j * .8)), 5);
  box(492, 556, 136, 42, '#0b1c26', 6, '#35506a', 1.2); const v = lerp(.04, .5, eout(seg(u, 2.9, 3.6))); dial(512, 586, 13, v + Math.sin(now * 5) * .015, '차압'); dial(578, 586, 13, v * .96 + Math.cos(now * 4) * .015, '온도') }
function scanBox(x, y, w, h, k, now, col = P.mint) { if (k <= 0 || k >= 1) return; const a = Math.sin(k * Math.PI); bracket(x - 6, y - 6, w + 12, h + 12, clamp(k * 3), col, clamp((1 - k) * 4));
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.globalCompositeOperation = 'lighter'; const sy = y + ((k * 2.2) % 1) * h; c.fillStyle = grad(0, sy - 34, 0, sy + 3, [[0, rgba(col, 0)], [1, rgba(col, .6 * a)]]); c.fillRect(x, sy - 34, w, 37); c.restore() }

CINE.story({
cams: [
  [[0, 480, 370, 1.24], [1.3, 480, 370, 1.24], [3.1, 720, 372, 1.24], [3.8, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 440, 372, 1.14], [2.7, 450, 372, 1.14], [3.4, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 560, 420, 1.16], [1.5, 600, 410, 1.14], [2.3, 610, 376, 1.07], [4.8, 600, 360, 1]],
  [[0, 440, 372, 1.14], [2, 470, 372, 1.14], [2.9, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 600, 392, 1.1], [1.2, 600, 392, 1.1], [2.4, 600, 372, 1], [4.8, 600, 376, 1.04]]
],
scenes: [
  // 1 사업장 파악: 원료에서 굴뚝까지 배출 경로를 따라가며 살핀다.
  (u, T, now) => {
    blueprint();
    const head = lerp(80, 1120, eio(seg(u, 1.3, 3.1)));
    ST.forEach(([x], i) => { if (i > 2) return; const k = seg(u, .9 + i * .2, 1.3 + i * .2), nx = ST[i + 1][0]; alpha(k, () => { pipe([[x + 108, 350], [nx - 108, 350]], '#2a4a60', 14); dots([[x + 112, 350], [nx - 112, 350]], now + i * .3, FLOW[i], 2, 3.6, 1.1) }) });
    ST.forEach(([x, label, col, art], i) => { const hl = u < 1.3 ? 0 : u < 3.2 ? clamp(1 - Math.abs(head - x) / 170) : .22 + .18 * Math.sin(now * 2 - i * .9);
      pop(seg(u, .25 + i * .2, .85 + i * .2), x, 344, () => { box(x - 110, 236, 220, 216, 'rgba(7,16,27,.95)', 18, rgba(col, .4 + .6 * hl), 1.6 + hl * 1.6); alpha(.06 + .12 * hl, () => box(x - 110, 236, 220, 216, col, 18)); if (hl > .05) halo(x, 344, 190, col, .14 * hl);
        mono(`0${i + 1}`, x - 92, 266, 16, rgba(col, .9), 'left', 700); c.save(); c.translate(x, 396); art(now); c.restore(); txt(label, x, 438, 23, col, 'center', 700) }) });
    alpha(seg(u, 1, 1.3), () => { line(80, 478, 1120, 478, 'rgba(140,180,205,.2)', 2, 'butt'); ST.forEach(([x, , col]) => poly([[x, 471], [x + 7, 478], [x, 485], [x - 7, 478]], head >= x && u > 1.3 ? col : '#27425a')) });
    if (u > 1.3) { glow(A, 10, () => line(80, 478, head, 478, A, 3)); halo(head, 478, 24, A, .9); circ(head, 478, 4, '#fff') }
    pop(seg(u, 1.2, 1.7), 100, 516, () => { icon('search', 100, 516, 18, A); txt('배출 경로 추적', 128, 523, 21, A, 'left', 700) });
    [['대기', P.cyan], ['수질', '#6aa9ff'], ['폐기물', P.amber]].forEach(([s, col], i) => badge(lerp([360, 600, 840][i], [452, 600, 752][i], eio(seg(u, 3.9, 4.5))), 548, s, col, seg(u, 3.3 + i * .15, 3.8 + i * .15), {al: 'center', size: 20}));
    reveal('하나의 허가로 환경 영향을 통합 관리', 600, 603, 28, seg(u, 3.9, 4.5), P.text, 'center', 700);
  },
  // 2 허가사항: 허가서의 항목이 사업장의 각 시설에 연결된다.
  (u, T, now) => {
    blueprint();
    alpha(eout(seg(u, .5, 1.3)), () => { line(660, 562, 1150, 562, rgba(A, .4), 2, 'butt'); for (let x = 668; x < 1150; x += 16) line(x, 562, x - 8, 572, rgba(A, .18), 1, 'butt');
      factory(690, 560, 1, {now, stack: false, w: 240, h: 108}); pipe([[930, 520], [950, 520]], '#2a4a60', 10); pipe([[1032, 530], [1070, 530]], '#2a4a60', 10);
      box(950, 478, 82, 82, '#143a31', 6, rgba(P.mint, .8), 1.5); for (let j = 0; j < 4; j++) line(964 + j * 18, 488, 964 + j * 18, 550, rgba(P.mint, .55 + .3 * Math.sin(now * 3 + j)), 4);
      c.fillStyle = grad(1068, 0, 1100, 0, [[0, '#1b3856'], [.4, '#35608a'], [1, '#10243a']]); poly([[1068, 560], [1100, 560], [1094, 312], [1074, 312]], c.fillStyle); c.fillStyle = '#c95a4e'; c.fillRect(1073.4, 326, 21.2, 9); box(1071, 306, 26, 7, '#3a5f80', 2);
      box(1096, 430, 22, 20, '#0d1b28', 4, P.cyan, 1.5); plume(1084, 304, now, {a: .28, len: 86, dx: 26, n: 11, r1: 15}) });
    const ROWS = [['배출시설', '공정별 설치 내역', 'factory', A, 760, 462, 40], ['방지시설', '처리 방식 · 용량', 'shield', P.mint, 991, 476, -60], ['허가배출기준', '오염물질별 기준', 'gauge', P.red, 1072, 318, -80], ['관리 조건', '측정 · 기록 · 보고', 'doc', P.cyan, 1107, 440, 46]];
    const dk = seg(u, .3, 1.1), e = spring(dk);
    c.save(); c.translate(355, 398 + (1 - e) * 130); c.rotate((1 - e) * -.07); c.translate(-355, -398); c.globalAlpha *= clamp(dk * 3);
    alpha(.5, () => box(118, 202, 490, 415, 'rgba(0,0,0,.6)', 12)); box(110, 190, 490, 415, '#e9f0ed', 12); box(110, 190, 490, 48, '#1f5a6e', [12, 12, 0, 0]); txt('통합환경 허가서', 134, 223, 23, '#fff', 'left', 700); mono('PERMIT', 576, 222, 16, 'rgba(255,255,255,.7)', 'right', 600);
    ROWS.forEach(([t, s, kind], j) => { const y = 277 + j * 74; slide(seg(u, 1 + j * .35, 1.45 + j * .35), -34, 0, () => { box(134, y - 29, 442, 58, j === 2 ? '#fbe6c2' : '#dbe6e2', 10, j === 2 ? '#d9952b' : null, 1.6); circ(166, y, 19, j === 2 ? '#d9952b' : '#1f5a6e'); icon(kind, 166, y, 18, '#fff', {bare: true});
      txt(t, 198, y + 8, 22, j === 2 ? '#7a4a0a' : '#14323c', 'left', 700); txt(s, 562, y + 7, 17, '#4f6371', 'right', 500) }) });
    stamp(524, 568, '허가', seg(u, 2.5, 3.2), '#d0463c', 34, {size: 21});
    c.restore(); shine(110, 190, 490, 415, seg(u, 3.9, 4.6), 12);
    ROWS.forEach(([, , kind, col, tx, ty, bend], j) => { const k = seg(u, 3.3 + j * .2, 3.85 + j * .2), pts = curve(580, 277 + j * 74, tx, ty, bend); if (k <= 0) return;
      alpha(.75, () => trace(pts, k, col, 2, {dash: [6, 7], glow: 6})); if (k >= 1) dots(pts, now + j * .23, col, 2, 3, .35);
      pop(seg(k, .7, 1), tx, ty, () => { rings(tx, ty, now + j * .3, col, 8, 34, 2, .8, .7); halo(tx, ty, 26, col, .7); circ(tx, ty, 7, col, '#fff', 1.5) }) });
  },
  // 3 시설 확인: 배출시설과 방지시설을 현장에서 살핀다.
  (u, T, now) => {
    night(now, {ground: 610, city: .75});
    factory(20, 610, 1.2, {now, stack: false, w: 280, label: '통합관리사업장'});
    pipe([[356, 520], [470, 520]], '#2a4a60', 16); pipe([[650, 536], [704, 536]], '#2a4a60', 14); dots([[358, 520], [468, 520]], now, '#ff8f5a', 3, 3.6, .7); dots([[652, 536], [702, 536]], now, P.mint, 2, 3.4, .8);
    c.fillStyle = grad(702, 0, 730, 0, [[0, '#1b3856'], [.4, '#35608a'], [1, '#10243a']]); poly([[701, 610], [731, 610], [725, 300], [707, 300]], c.fillStyle); c.fillStyle = '#c95a4e'; c.fillRect(706.5, 314, 19, 10); box(704, 294, 24, 7, '#3a5f80', 2); if (Math.sin(now * 4) > 0) halo(716, 290, 13, '#ff4a4a', .9);
    plume(716, 290, now, {a: .22, len: 110, dx: -44, n: 12, r1: 17});
    filterHouse(now, u);
    pop(seg(u, 1.2, 1.7), 190, 398, () => chip(190, 402, '배출시설', A, 'center', 20)); pop(seg(u, 1.4, 1.9), 560, 406, () => chip(560, 410, '방지시설', P.mint, 'center', 20));
    const px = lerp(1190, 880, eout(seg(u, .3, 1.5))), scan = Math.max(fade(u, 2, 2.75, .2), fade(u, 2.75, 3.5, .2)), tx = u < 2.75 ? 190 : 560;
    if (scan > 0) alpha(scan, () => beam(px - 46, 508, Math.atan2(520 - 508, tx - (px - 46)), 720, 90, P.mint, .14));
    scanBox(24, 426, 330, 182, seg(u, 2, 2.75), now); scanBox(470, 430, 180, 178, seg(u, 2.75, 3.5), now);
    okMark(262, 395, seg(u, 2.6, 3)); okMark(634, 403, seg(u, 3.35, 3.75));
    person(px, 610, 2, {now, pose: u < 1.5 ? 'walk' : 'tablet', vest: '#2f6f9a', hat: '#e9eef0', flip: true});
    panel(850, 165, 300, 236, '시설 상태', 'FACILITY CHECK', P.mint, seg(u, 1.7, 2.3));
    checklist(874, 268, ['배출시설 설치 내역', '방지시설 가동', '차압 · 온도 정상'], u, 2.5, {gap: 48, size: 20, col: P.green, step: .6});
  },
  // 4 운영 점검: 운영기록과 자동측정 추이로 허가사항 이행을 확인한다.
  (u, T, now) => {
    blueprint();
    const pk = seg(u, .3, .9), x0 = 104, y0 = 548, w = 652, h = 240, lim = .72, f = q => .42 + .12 * Math.sin(q * 18) + .05 * Math.sin(q * 51);
    panel(60, 196, 740, 394, '운영기록 · 굴뚝 자동측정 추이', null, A, pk);
    alpha(clamp(pk * 2 - 1), () => { chip(776, 236, '예시 자료', P.muted, 'right', 16);
      c.fillStyle = grad(0, y0 - h, 0, y0 - h * lim, [[0, rgba(P.red, .13)], [1, rgba(P.red, .03)]]); c.fillRect(x0, y0 - h, w, h * (1 - lim));
      const hd = lineChart(x0, y0, w, h, f, seg(u, 1, 3), {col: A, limit: lim, limitCol: P.red}); txt('허가배출기준', x0 + w, y0 - h * lim - 11, 19, P.red, 'right', 700);
      if (hd && u > 1) { line(hd[0], hd[1] + 8, hd[0], y0, rgba(A, .35), 1.5, 'butt'); if (u > 3) rings(hd[0], hd[1], now, A, 8, 30, 2, .8, .7) }
      for (let j = 0; j <= 6; j++) line(x0 + w * j / 6, y0, x0 + w * j / 6, y0 + 7, 'rgba(140,180,205,.35)', 1.5, 'butt') });
    slide(seg(u, 2.4, 2.9), 46, 0, () => { box(840, 436, 310, 154, 'rgba(7,16,27,.96)', 14, rgba(A, .8), 1.6); icon('doc', 880, 474, 22, A); txt('운영기록', 914, 482, 22, A, 'left', 700);
      for (let j = 0; j < 3; j++) { const y = 520 + j * 22, ph = (now * .3 + j * .31) % 1; box(866, y, 250, 9, 'rgba(140,180,205,.12)', 4); box(866, y, 250 * (j === Math.floor((now * .3) % 3) ? eout(ph) : 1) * [.92, .7, .82][j], 9, rgba(A, .55), 4); okMark(1128, y + 4, 1, P.green, 8) } });
    panel(840, 196, 310, 222, '허가 이행', 'COMPLIANCE', P.mint, seg(u, 2.7, 3.3));
    checklist(864, 300, ['가동 기록', '측정 · 보고', '기준 준수'], u, 3.2, {gap: 46, size: 21, col: P.green, step: .4});
  },
  // 5 후속 관리: 점검 → 결과 통보 → 개선·재확인이 끊기지 않고 이어진다.
  (u, T, now) => {
    blueprint();
    const CX = 600, CY = 405, R = 180, ang = -Math.PI / 2 + now * 1.1, ST5 = [['점검', -90, A, 'search', 600, 225, 156], ['결과 통보', 30, P.cyan, 'send', 818, 495, 210], ['개선 · 재확인', 150, P.mint, 'tool', 374, 495, 250]];
    const arc = (a0, a1) => Array.from({length: 25}, (_, i) => { const a = (a0 + (a1 - a0) * i / 24) * Math.PI / 180; return [CX + Math.cos(a) * R, CY + Math.sin(a) * R] });
    const rk = eout(seg(u, .4, 1.4)); c.beginPath(); c.arc(CX, CY, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rk); c.strokeStyle = '#1b3147'; c.lineWidth = 12; c.stroke();
    c.save(); c.translate(CX, CY); c.rotate(-now * .2); c.setLineDash([3, 13]); circ(0, 0, R + 34, null, rgba(P.mag, .4 * rk), 1.6); c.restore();
    c.save(); c.translate(CX, CY); c.rotate(now * .3); c.setLineDash([12, 10]); circ(0, 0, R - 34, null, rgba(A, .3 * rk), 1.6); c.restore();
    ST5.forEach(([, a, col], i) => { const k = seg(u, 1.3 + i * .45, 1.9 + i * .45), pts = arc(a + 22, a + 98), end = trace(pts, k, col, 4, {glow: 10}); if (k >= 1) { const t = (a + 100) * Math.PI / 180, ex = CX + Math.cos(t) * R, ey = CY + Math.sin(t) * R, d = t + Math.PI / 2;
      poly([[ex + Math.cos(d) * 9, ey + Math.sin(d) * 9], [ex - Math.cos(d) * 9 + Math.cos(t) * 9, ey - Math.sin(d) * 9 + Math.sin(t) * 9], [ex - Math.cos(d) * 9 - Math.cos(t) * 9, ey - Math.sin(d) * 9 - Math.sin(t) * 9]], col) } });
    if (rk > .2) { for (let j = 6; j > 0; j--) halo(CX + Math.cos(ang - j * .07) * R, CY + Math.sin(ang - j * .07) * R, 18 - j * 1.6, A, .5 * (1 - j / 7)); halo(CX + Math.cos(ang) * R, CY + Math.sin(ang) * R, 30, A, .95); circ(CX + Math.cos(ang) * R, CY + Math.sin(ang) * R, 6, '#fff') }
    ST5.forEach(([label, a, col, kind, x, y, w], i) => { let d = Math.abs(((ang - a * Math.PI / 180) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI); const act = clamp(1 - d / .7);
      pop(seg(u, 1 + i * .45, 1.5 + i * .45), x, y, () => { c.save(); c.translate(x, y); c.scale(1 + act * .06, 1 + act * .06); c.translate(-x, -y); if (act > 0) halo(x, y, w * .7, col, .3 * act);
        box(x - w / 2, y - 35, w, 70, 'rgba(7,16,27,.97)', 35, col, 1.8 + act * 1.4); alpha(.1 + .14 * act, () => box(x - w / 2, y - 35, w, 70, col, 35)); icon(kind, x - w / 2 + 38, y, 23, col); txt(label, x - w / 2 + 72, y + 8, 23, P.text, 'left', 700); c.restore() }, {ease: spring}) });
    halo(CX, CY, 150, A, .12 * rk); reveal('지속 관리', CX, CY + 16, 48, seg(u, 2.4, 3), P.text, 'center', 400, DISP);
    const ul = eout(seg(u, 2.8, 3.4)); if (ul > 0) glow(A, 10, () => line(CX - 60 * ul, CY + 36, CX + 60 * ul, CY + 36, A, 3));
    if (u > 3.2) rings(CX, CY, now, A, R + 20, R + 150, 2, .3, .28 * seg(u, 3.2, 3.8));
  }
]});
})();
