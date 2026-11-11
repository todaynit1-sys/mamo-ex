// 자동차관리과 · 자동차 연료 품질관리 — 모션그래픽 v2
(() => {
const {P, A, c, clamp, lerp, eio, eout, spring, seg, hash, rgba, rr, box, line, poly, circ, ell, txt, mono, glow, alpha, grad, halo, panel, chip, tick, rings, dots, dashed, pop, slide, reveal, trace, burst, shine, badge, lineChart, night, blueprint, lab, car, person, phone, curve, icon} = CINE;
const FUEL = P.amber;
const note = (s, x, y, col = P.muted) => txt(s, x, y, 16, col, 'left', 600);   // 패널 보조 설명(예시 표기)

// ----- 공용 그림 -----
// 출렁이는 액체: 상자 (x, y, w, h)의 바닥부터 f(0~1)만큼 채운다. 용기 모양은 호출 전에 clip으로 잘라 둔다.
function liquid(x, y, w, h, f, col, now, o = {}) { const fh = h * clamp(f); if (fh < 2) return; const top = y + h - fh, amp = o.amp ?? 3.5, ph = o.ph || 0, sy = q => top + Math.sin(q * .08 + now * 3 + ph) * amp + Math.sin(q * .21 - now * 2.2 + ph) * amp * .35;
  c.beginPath(); c.moveTo(x, y + h); for (let q = 0; q <= w; q += 6) c.lineTo(x + q, sy(q)); c.lineTo(x + w, sy(w)); c.lineTo(x + w, y + h); c.closePath(); c.fillStyle = grad(0, top, 0, y + h, [[0, rgba(col, .95)], [1, rgba(col, .4)]]); c.fill();
  c.beginPath(); for (let q = 0; q <= w; q += 6) q ? c.lineTo(x + q, sy(q)) : c.moveTo(x, sy(0)); c.strokeStyle = 'rgba(255,246,220,.75)'; c.lineWidth = 2; c.stroke();
  for (let j = 0; j < (o.n ?? 5); j++) { const bp = (now * (.25 + hash(j + ph) * .3) + hash(j * 3 + ph)) % 1; circ(x + 8 + hash(j * 7 + ph) * (w - 16), y + h - bp * fh, 1.6 + hash(j + 9) * 2.6, rgba('#fff6dd', .55 * (1 - bp))) } }
// 시험관: (x, y)는 위 왼쪽. 아래가 둥글고 마개가 있다.
function vial(x, y, w, h, f, col, now, ph = 0) { const r = w / 2;
  c.save(); c.beginPath(); c.roundRect(x, y, w, h, [4, 4, r, r]); c.fillStyle = 'rgba(200,230,240,.08)'; c.fill(); c.clip(); liquid(x, y + 18, w, h - 18, f, col, now, {ph, amp: Math.min(3.5, w * .05)}); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + w * .12, y, w * .1, h); for (let g = 1; g < 6; g++) line(x + w * (g % 2 ? .78 : .66), y + h * g / 7, x + w, y + h * g / 7, 'rgba(225,240,248,.55)', 1.5, 'butt'); c.restore();
  c.beginPath(); c.roundRect(x, y, w, h, [4, 4, r, r]); c.strokeStyle = 'rgba(190,225,240,.75)'; c.lineWidth = 2; c.stroke(); box(x - 4, y - 12, w + 8, 16, '#b7b4d6', 4) }
// 연료 방울: 안에서 액체가 출렁인다.
function dropPath(s) { c.beginPath(); c.moveTo(0, -48 * s); c.bezierCurveTo(8 * s, -30 * s, 32 * s, -8 * s, 32 * s, 14 * s); c.arc(0, 14 * s, 32 * s, 0, Math.PI); c.bezierCurveTo(-32 * s, -8 * s, -8 * s, -30 * s, 0, -48 * s); c.closePath() }
function drop(x, y, s, col, now, f = .7) { c.save(); c.translate(x, y); halo(0, 8 * s, 76 * s, col, .32); dropPath(s); c.fillStyle = 'rgba(6,14,24,.92)'; c.fill();
  c.save(); dropPath(s); c.clip(); liquid(-34 * s, -48 * s, 68 * s, 94 * s, f, col, now, {ph: x * .01, amp: 4, n: 6}); c.restore();
  dropPath(s); c.strokeStyle = col; c.lineWidth = 3; glow(col, 14, () => c.stroke());
  c.beginPath(); c.arc(-2 * s, 12 * s, 22 * s, Math.PI * .68, Math.PI * 1.08); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3.5; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt'; c.restore() }
function star(x, y, r, col) { c.beginPath(); for (let q = 0; q < 10; q++) { const R = q % 2 ? r * .45 : r, a = -Math.PI / 2 + q * Math.PI / 5; c.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R) } c.closePath(); c.fillStyle = col; c.fill() }
// 주유기: (x, y)는 바닥 왼쪽. on이면 표시창 눈금이 차오른다.
function pump(x, y, now, on) { ell(x + 48, y + 2, 66, 6, 'rgba(0,0,0,.45)'); box(x - 10, y - 12, 116, 12, '#22384c', 3);
  rr(x, y - 192, 96, 182, 10); c.fillStyle = grad(x, 0, x + 96, 0, [[0, '#182b3d'], [.35, '#2e4d66'], [1, '#132434']]); c.fill(); c.strokeStyle = 'rgba(150,200,230,.3)'; c.lineWidth = 1.5; c.stroke();
  box(x, y - 192, 96, 20, A, [10, 10, 0, 0]); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(x + 4, y - 168, 6, 152);
  box(x + 12, y - 160, 72, 56, '#050d15', 6, 'rgba(126,224,160,.5)', 1.3); mono('₩', x + 30, y - 123, 24, '#7ee0a0', 'center', 700);
  for (let j = 0; j < 4; j++) { const lit = on && (now * 3.2) % 5 > j; box(x + 46 + j * 9, y - 150 + (3 - j) * 7, 6, 36 - (3 - j) * 7, lit ? '#7ee0a0' : '#163028', 2) }
  box(x + 14, y - 92, 68, 9, '#0c1620', 4); if (on) glow(FUEL, 8, () => box(x + 14, y - 92, Math.max(9, 68 * ((now * .45) % 1)), 9, FUEL, 4));
  box(x + 14, y - 72, 68, 48, 'rgba(0,0,0,.25)', 6); for (let j = 0; j < 3; j++) line(x + 22, y - 60 + j * 12, x + 74, y - 60 + j * 12, 'rgba(150,200,230,.18)', 2, 'butt');
  box(x + 96, y - 130, 12, 48, '#0c1620', 3) }
// 약품 용기: (x, y)는 바닥 가운데. kind 0 병 · 1 넓은 통 · 2 손잡이 달린 말통
function bottle(x, y, kind, col, label, now, f) {
  const R = kind === 0 ? 80 : 84, path = () => { c.beginPath(); c.moveTo(x - R, y - 8);
    if (kind === 0) { c.lineTo(x - 80, y - 186); c.quadraticCurveTo(x - 80, y - 224, x - 36, y - 234); c.lineTo(x - 36, y - 258); c.lineTo(x + 36, y - 258); c.lineTo(x + 36, y - 234); c.quadraticCurveTo(x + 80, y - 224, x + 80, y - 186) }
    else if (kind === 1) { c.lineTo(x - 84, y - 216); c.quadraticCurveTo(x - 84, y - 238, x - 62, y - 240); c.lineTo(x - 62, y - 256); c.lineTo(x + 62, y - 256); c.lineTo(x + 62, y - 240); c.quadraticCurveTo(x + 84, y - 238, x + 84, y - 216) }
    else { c.lineTo(x - 84, y - 216); c.quadraticCurveTo(x - 84, y - 242, x - 58, y - 242); c.lineTo(x + 28, y - 242); c.lineTo(x + 84, y - 190) }
    c.lineTo(x + R, y - 8); c.quadraticCurveTo(x + R, y, x + R - 8, y); c.lineTo(x - R + 8, y); c.quadraticCurveTo(x - R, y, x - R, y - 8); c.closePath() };
  ell(x, y + 3, 102, 8, 'rgba(0,0,0,.45)'); path(); c.fillStyle = 'rgba(9,20,33,.94)'; c.fill();
  c.save(); path(); c.clip(); liquid(x - 86, y - 244, 172, 244, f, col, now, {ph: x * .01, amp: 4, n: 7}); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x - 70, y - 236, 12, 230); c.restore();
  path(); c.strokeStyle = col; c.lineWidth = 2.5; glow(col, 12, () => c.stroke());
  const cap = kind === 0 ? [x - 42, y - 288, 84, 32] : kind === 1 ? [x - 68, y - 284, 136, 30] : [x - 64, y - 270, 54, 30];
  box(cap[0], cap[1], cap[2], cap[3], '#3a5266', 6, 'rgba(150,200,230,.35)', 1.2); for (let q = cap[0] + 9; q < cap[0] + cap[2] - 4; q += 9) line(q, cap[1] + 6, q, cap[1] + cap[3] - 6, 'rgba(255,255,255,.14)', 2, 'butt');
  if (kind === 2) box(x - 4, y - 222, 48, 16, 'rgba(4,10,18,.96)', 8, rgba(col, .6), 1.5);
  box(x - 68, y - 150, 136, 70, 'rgba(5,12,21,.92)', 10, rgba(col, .85), 1.6); txt(label, x, y - 107, 21, P.text, 'center', 700) }
// 검사 빛줄기(가로로 훑는 선)
function scan(x, y, hw, col, a = 1) { alpha(a, () => { c.fillStyle = grad(0, y - 36, 0, y, [[0, rgba(col, 0)], [1, rgba(col, .28)]]); c.fillRect(x - hw + 6, y - 36, hw * 2 - 12, 36); glow(col, 14, () => line(x - hw, y, x + hw, y, col, 3)); halo(x - hw, y, 12, col, .9); halo(x + hw, y, 12, col, .9) }) }

CINE.story({
cams: [
  [[0, 492, 420, 1.22], [1.6, 492, 420, 1.22], [2.7, 600, 360, 1], [4.8, 600, 366, 1.035]],
  [[0, 480, 432, 1.25], [1.5, 480, 432, 1.25], [2.5, 600, 360, 1], [4.8, 640, 366, 1.04]],
  [[0, 540, 313, 1.15], [1.4, 540, 313, 1.15], [3, 640, 313, 1.15], [3.9, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 522, 313, 1.15], [2, 522, 313, 1.15], [3, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 500, 420, 1.2], [1.4, 500, 420, 1.2], [2.9, 700, 420, 1.2], [3.7, 600, 360, 1], [4.8, 600, 366, 1.03]]
],
scenes: [
  // 1 연료 확인: 주유소에 들어온 차가 연료를 넣고, 그 연료(휘발유·경유)를 살핀다.
  (u, T, now) => {
    night(now, {ground: 610, city: .7});
    const GY = 610, S = 1.7, fl = .86 + .14 * Math.sin(now * 2.3), fueling = u > 2.1;
    c.fillStyle = grad(0, 292, 0, GY, [[0, rgba(A, .24 * fl)], [1, rgba(A, 0)]]); poly([[90, 292], [756, 292], [816, GY], [30, GY]], c.fillStyle);
    for (const x of [96, 730]) { c.fillStyle = grad(x, 0, x + 26, 0, [[0, '#1b3148'], [.5, '#2c4862'], [1, '#132536']]); c.fillRect(x, 290, 26, GY - 290) }
    glow(A, 28, () => box(62, 246, 722, 46, '#0f1f2c', 8, A, 2.5)); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(70, 251, 706, 5);
    txt('주유소', 423, 278, 24, P.white, 'center', 700);
    for (const x of [190, 310, 536, 656]) { halo(x, 297, 30, '#fff3cf', .75 * fl); box(x - 16, 292, 32, 5, '#fff0bd', 2) }
    person(150, GY - 3, 1.9, {now, pose: 'tablet', hat: '#eef3f5'}); pump(196, GY, now, fueling); pump(604, GY, now, u > 2.4);
    const carX = lerp(-330, 306, eout(seg(u, .2, 1.6))); car(carX, GY, S, '#4d7bd6', {spin: (carX + 330) / (14 * S)});
    // 주유 호스: 차가 서면 주유구로 이어지고 연료가 흐른다.
    const port = [carX + 18 * S, GY - 30 * S], hose = curve(302, 500, port[0], port[1], 56, 18), hk = seg(u, 1.6, 2.1);
    if (hk <= 0) box(299, 486, 8, 30, '#c8d4db', 3);
    else { trace(hose, hk, '#0a121b', 8, {glow: false, head: false}); trace(hose, hk, 'rgba(150,200,230,.3)', 2, {glow: false, head: false}) }
    if (fueling) { box(port[0] - 10, port[1] - 7, 20, 14, '#c8d4db', 4); rings(port[0], port[1], now, FUEL, 8, 36, 2, 1.1, .7); dots(hose, now, FUEL, 3, 3, .9) }
    // 오른쪽: 살펴볼 연료
    const feed = curve(718, 486, 838, 368, -50); trace(feed, seg(u, 1.9, 2.4), rgba(FUEL, .8), 2, {dash: [6, 7], glow: 6}); if (u > 2.4) dots(feed, now, FUEL, 3, 3, .6);
    [[905, '휘발유', FUEL, 2.2], [1075, '경유', P.mint, 2.5]].forEach(([x, label, col, t0], i) => { const fy = Math.sin(now * 1.4 + i * 2) * 5;
      pop(seg(u, t0, t0 + .55), x, 340, () => drop(x, 336 + fy, 2.1, col, now, .72), {ease: spring}); burst(x, 336, seg(u, t0 + .25, t0 + .8), col, 12, 120);
      pop(seg(u, t0 + .3, t0 + .7), x, 468, () => chip(x, 476, label, col, 'center', 20)) });
    const mk = seg(u, 3.3, 3.8); alpha(mk, () => { const mx = lerp(905, 1075, eio(.5 + .5 * Math.sin(now * 1.1))), my = 344 + Math.sin(now * 2.3) * 8;
      halo(mx, my, 90, A, .35); glow('rgba(0,0,0,.7)', 10, () => { line(mx + 31, my + 31, mx + 58, my + 58, P.white, 8); circ(mx, my, 42, 'rgba(255,255,255,.12)', P.white, 4.5) }); c.beginPath(); c.arc(mx, my, 32, Math.PI * 1.1, Math.PI * 1.45); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt' });
    slide(seg(u, 3.1, 3.6), 0, 18, () => { box(824, 510, 334, 56, 'rgba(6,13,22,.9)', 14, A, 1.6); txt('자동차 연료의 품질을 관리합니다', 991, 546, 20, P.text, 'center', 700) }); shine(824, 510, 334, 56, seg(u, 3.9, 4.5), 14);
  },
  // 2 시료 검사: 시험관에 담긴 연료 시료를 하나씩 뽑아 분석 장비로 보낸다.
  (u, T, now) => {
    lab(560);
    const VX = [118, 200, 282, 364], LV = [.8, .87, .76, .83];
    for (const x of [98, 440]) box(x, 276, 10, 284, '#2c4a62', 3);
    box(98, 272, 352, 12, '#4d6f88', 6); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(104, 274, 340, 2); box(92, 548, 364, 14, '#33506a', 4);
    VX.forEach((x, i) => { const t0 = 1 + i * .2, f = eout(seg(u, t0, t0 + .8)), cx = x + 28, top = 546 - 192 * LV[i] * f;
      box(cx - 5, 284, 10, 10, '#7a97a8', 2); if (f > 0 && f < 1) alpha(Math.min(1, (1 - f) * 6), () => { line(cx, 294, cx, top, rgba(FUEL, .9), 4, 'butt'); halo(cx, top, 18, FUEL, .7) });
      vial(x, 336, 56, 210, LV[i] * f, FUEL, now, i * 1.7) });
    box(92, 452, 364, 8, 'rgba(160,200,225,.2)', 4);
    pop(seg(u, 1.5, 2), 274, 584, () => chip(274, 592, '연료 시료', FUEL, 'center', 20));
    // 시료 채취기: 시험관을 차례로 오가며 바늘을 담근다.
    const tt = u - 2, step = .8, idx = tt < 0 ? 0 : Math.floor(tt / step) % 4, q = tt < 0 ? 0 : (tt / step) % 1, prev = tt < step ? 0 : (idx + 3) % 4;
    const hx = lerp(VX[prev], VX[idx], eio(seg(q, 0, .3))) + 28, dip = tt < 0 || q < .3 ? 0 : q < .5 ? eio((q - .3) / .2) : q < .82 ? 1 : 1 - eio((q - .82) / .18), ny = lerp(300, 412, dip);
    const tube = [[hx + 18, 278], [466, 278], [466, 320], [480, 320]]; trace(tube, 1, 'rgba(190,225,240,.55)', 5, {glow: false, head: false}); if (u > 2.3) dots(tube, now, FUEL, 3, 2.8, 1);
    line(hx, 290, hx, ny, '#dfe8ec', 3, 'butt'); box(hx - 18, 264, 36, 28, '#c8d4db', 6, '#7a97a8', 1.5); circ(hx, 278, 5, dip > .9 ? FUEL : '#4d6f88'); if (dip > .9) { halo(hx, 278, 18, FUEL, .8); rings(hx, ny, now, FUEL, 4, 22, 2, 1.6, .7) }
    // 분석 장비
    const AX = 486, AY = 262, ck = seg(u, 2.2, 3.9), pk = v => .07 + .78 * Math.exp(-Math.pow((v - .26) / .045, 2)) + .5 * Math.exp(-Math.pow((v - .58) / .06, 2)) + .33 * Math.exp(-Math.pow((v - .82) / .04, 2)) + .012 * Math.sin(v * 46 + now * 7);
    alpha(.4, () => box(AX + 6, AY + 10, 420, 298, '#000', 14)); rr(AX, AY, 420, 298, 14); c.fillStyle = grad(AX, 0, AX + 420, 0, [[0, '#c3d1d9'], [.45, '#eef4f6'], [1, '#aebdc6']]); c.fill(); box(AX, AY, 420, 14, A, [14, 14, 0, 0]);
    box(AX - 8, 308, 12, 24, '#7a97a8', 3); box(506, 292, 268, 176, '#050d15', 8, '#35506a', 2);
    lineChart(522, 454, 236, 140, pk, ck, {col: P.cyan, lw: 2.5});
    if (ck >= 1) { const sx = 522 + ((now * .45) % 1) * 236; line(sx, 314, sx, 454, rgba(P.cyan, .4), 1.5, 'butt') }
    [[.26, FUEL], [.58, A], [.82, P.mint]].forEach(([v, col], i) => { const t0 = 2.2 + v * 1.7, x = 522 + 236 * v, y = 454 - 140 * pk(v); pop(seg(u, t0, t0 + .3), x, y, () => { rings(x, y, now + i * .3, col, 6, 20, 1, 1, .7); circ(x, y, 6, col, '#fff', 2) }) });
    box(790, 292, 100, 44, '#1d3748', 8); alpha(.72 + .28 * Math.sin(now * 6), () => mono('ANALYZING', 840, 320, 16, P.cyan, 'center', 700));
    circ(840, 396, 36, '#0d1b28', '#35506a', 2); c.save(); c.translate(840, 396); c.rotate(now * 2.4); c.beginPath(); c.arc(0, 0, 28, 0, 4.2); c.strokeStyle = A; c.lineWidth = 4; c.lineCap = 'round'; glow(A, 8, () => c.stroke()); c.lineCap = 'butt'; c.restore(); icon('drop', 840, 396, 16, FUEL, {bare: true});
    for (let j = 0; j < 4; j++) { const on = j === Math.floor(now * 3) % 4; if (on) halo(804 + j * 24, 456, 15, P.green, .8); circ(804 + j * 24, 456, 7, on ? P.green : '#9fb0bb') }
    box(506, 492, 268, 12, '#b3c2ca', 6); if (ck > 0) { const pw = Math.max(12, 268 * ck); box(506, 492, pw, 12, A, 6); c.save(); rr(506, 492, pw, 12, 6); c.clip(); const gx = 506 + ((now * .6) % 1) * 330 - 30; c.fillStyle = grad(gx - 30, 0, gx + 30, 0, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.6)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(gx - 30, 492, 60, 12); c.restore() }
    for (let j = 0; j < 3; j++) circ(518 + j * 26, 530, 8, '#9fb0bb', '#7a8f9b', 1.5); for (let j = 0; j < 4; j++) line(796, 498 + j * 12, 886, 498 + j * 12, '#9fb0bb', 3);
    // 분석 결과를 받아 보는 검사원
    const wk = seg(u, .3, 1.3); person(lerp(1320, 1048, eout(wk)), 600, 2.2, {now, pose: wk < 1 ? 'walk' : 'tablet', vest: '#e9eef0', hat: '#e9eef0', flip: true});
    const res = curve(908, 400, 992, 482, -34, 12), rk = seg(u, 3.9, 4.3); trace(res, rk, rgba(A, .85), 2, {dash: [5, 6], glow: 6}); if (rk >= 1) dots(res, now, A, 3, 3, .9);
    reveal('품질 확인을 위한 시료 검사', 1150, 214, 30, seg(u, 2.5, 3.1), P.text, 'right', 700);
    const ul = eout(seg(u, 2.8, 3.4)); if (ul > 0) glow(A, 8, () => line(1150 - 150 * ul, 231, 1150, 231, A, 3));
  },
  // 3 기준 확인: 항목마다 기준선 안쪽인지 한 줄씩 확인한다.
  (u, T, now) => {
    blueprint();
    const R = [['황 함량', .32], ['벤젠 함량', .55], ['방향족 화합물', .7], ['증기압', .62], ['산소 함량', .44]], PX = 350, PW = 790, BX = 582, BW = 420, LX = BX + BW, TK = i => 2.3 + i * .24, RY = i => 286 + i * 58;
    pop(seg(u, .3, .9), 190, 420, () => { halo(190, 420, 200, FUEL, .2); box(118, 548, 144, 14, '#33506a', 5); vial(132, 292, 116, 256, .78, FUEL, now, 2); scan(190, 322 + (.5 + .5 * Math.sin(now * 1.7)) * 206, 76, A) }, {from: .8});
    pop(seg(u, 1, 1.5), 190, 250, () => chip(190, 257, '연료 시료', FUEL, 'center', 20));
    const feed = curve(266, 420, PX - 2, 420, -22, 10); trace(feed, seg(u, 1.1, 1.5), rgba(FUEL, .85), 2, {dash: [5, 6], glow: 6}); if (u > 1.5) dots(feed, now, FUEL, 3, 3, .9);
    panel(PX, 165, PW, 440, '제조기준 적합 여부', null, A, seg(u, .5, 1.1)); alpha(eout(seg(u, .8, 1.2)), () => note('예시 자료 · 기준 대비 비율', PX + 20, 228));
    const row = clamp((u - TK(0)) / .24, 0, 4), ri = Math.floor(row), ry = lerp(RY(ri), RY(Math.min(4, ri + 1)), eio(seg(row - ri, .55, 1))), la = seg(u, 2.05, 2.3) * (1 - seg(u, 3.5, 3.8));
    alpha(la, () => box(PX + 18, ry - 27, PW - 36, 54, rgba(A, .1), 10, rgba(A, .75), 1.6));
    R.forEach(([s, v], i) => { const y = RY(i), rk = seg(u, 1 + i * .15, 1.45 + i * .15), k = eout(seg(u, 1.4 + i * .2, 2.2 + i * .2)), tk = TK(i);
      slide(rk, -26, 0, () => { if (i % 2) box(PX + 18, y - 27, PW - 36, 54, 'rgba(255,255,255,.022)', 10);
        txt(s, PX + 34, y + 7, 21, P.text, 'left', 700); box(BX, y - 13, BW, 26, '#16293a', 13);
        if (k > 0) { const bw = Math.max(26, BW * v * k); glow(P.mint, 12, () => { rr(BX, y - 13, bw, 26, 13); c.fillStyle = grad(BX, 0, BX + bw, 0, [[0, rgba(P.mint, .5)], [1, P.mint]]); c.fill() });
          c.save(); rr(BX, y - 13, bw, 26, 13); c.clip(); const sx = BX + ((now * .5 + i * .17) % 1) * (BW + 120) - 60; c.fillStyle = grad(sx - 40, 0, sx + 40, 0, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(sx - 40, y - 13, 80, 26); c.restore();
          halo(BX + bw - 9, y, 20, '#ffffff', .55); circ(BX + bw - 13, y, 4, '#ffffff') }
        pop(seg(u, tk, tk + .3), LX + 62, y, () => { circ(LX + 62, y, 17, '#0b2a20', P.green, 2); tick(LX + 61, y, seg(u, tk + .05, tk + .4), P.green, .75) }); burst(LX + 62, y, seg(u, tk + .2, tk + .75), P.green, 8, 38) }) });
    alpha(seg(u, 1.2, 1.7), () => { glow(P.red, 8, () => dashed(LX, 262, LX, 544, P.red, 2.5, now, [7, 6], 14)); txt('기준', LX, 252, 19, P.red, 'center', 700) });
    badge(PX + PW / 2, 575, '모든 항목 기준 이내', P.mint, seg(u, 3.75, 4.2), {al: 'center', size: 21}); burst(PX + PW / 2, 575, seg(u, 3.95, 4.55), P.mint, 14, 150);
    shine(PX, 165, PW, 440, seg(u, 4.2, 4.9), 16);
  },
  // 4 등급 공개: 별점으로 매긴 환경품질등급을 누리집에 공개한다.
  (u, T, now) => {
    blueprint();
    const R = [['A 정유사', 5], ['B 정유사', 5], ['C 정유사', 4], ['D 정유사', 4]], PX = 70, PW = 590, SX = PX + 276;
    panel(PX, 165, PW, 418, '자동차 연료 환경품질등급', null, FUEL, seg(u, .4, 1)); alpha(eout(seg(u, .7, 1.1)), () => note('정유사별 · 예시', PX + 20, 228));
    R.forEach(([s, n], i) => { const y = 298 + i * 72, t0 = 1 + i * .2, rk = seg(u, t0, t0 + .45);
      slide(rk, -26, 0, () => { box(PX + 18, y - 31, PW - 36, 62, i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(255,255,255,.014)', 12); icon('drop', PX + 52, y, 17, FUEL); txt(s, PX + 82, y + 8, 22, P.text, 'left', 700);
        for (let j = 0; j < 5; j++) { const ts = t0 + .25 + j * .09, on = j < n, x = SX + j * 60, w = Math.sin(now * 3.4 + i * 1.3 + j * .9), gl = Math.max(0, 1 - Math.abs(((now * 7) % 30) - (i * 5 + j)));
          pop(seg(u, ts, ts + .35), x, y, () => { if (on) { halo(x, y, 36, FUEL, .3 + .16 * w); glow(FUEL, 14, () => star(x, y, 21 * (1 + .06 * w), FUEL)); star(x, y, 9, '#ffe2ad'); halo(x - 6, y - 7, 16, '#ffffff', gl) } else { star(x, y, 20, '#22394e'); star(x, y, 14, '#0f2032') } }, {from: .2});
          if (on && j === n - 1) burst(x, y, seg(u, ts + .25, ts + .85), FUEL, 10, 46) } }) });
    const link = curve(PX + PW + 8, 385, 818, 385, -26, 12), lk = seg(u, 2.3, 2.8); trace(link, lk, rgba(A, .9), 2.5, {dash: [6, 7], glow: 6}); if (lk >= 1) { poly([[830, 385], [813, 376], [813, 394]], A); dots(link, now, A, 3, 3.2, .9) }
    if (u > 3.5) rings(935, 402, now, A, 150, 250, 2, .4, .4 * seg(u, 3.5, 4));
    slide(seg(u, 2.5, 3.1), 0, 70, () => phone(935, 402, 1.7, () => { c.fillStyle = '#081420'; c.fillRect(-52, -106, 104, 212); box(-52, -106, 104, 32, rgba(A, .3), 0); txt('연료 품질등급', 0, -85, 12, P.text, 'center', 700);
      const hi = Math.floor(now * 1.1) % 4; R.forEach(([s, n], j) => slide(seg(u, 3 + j * .14, 3.4 + j * .14), 0, 12, () => { const y = -66 + j * 41; box(-46, y, 92, 34, '#10202c', 6, j === hi ? rgba(FUEL, .85) : 'rgba(120,170,200,.2)', 1); txt(s[0], -38, y + 22, 12, P.text, 'left', 700); for (let q = 0; q < 5; q++) star(-17 + q * 11.6, y + 17, 5, q < n ? FUEL : '#22394e') }));
      const sy = -130 + ((now * .3) % 1) * 290; c.fillStyle = grad(0, sy, 0, sy + 50, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.08)'], [1, 'rgba(255,255,255,0)']]); c.fillRect(-52, sy, 104, 50) }));
    badge(935, 166, '누리집 공개', FUEL, seg(u, 3.5, 4), {al: 'center', size: 21}); burst(935, 166, seg(u, 3.7, 4.3), FUEL, 12, 84);
    [['eye', 330, P.cyan], ['people', 474, P.mint]].forEach(([kind, y, col], i) => { const t0 = 3.7 + i * .2, ln = curve(1040, 402, 1096, y, 0, 8); trace(ln, seg(u, t0 - .2, t0 + .2), rgba(col, .8), 2, {dash: [5, 6], glow: 6}); if (u > t0 + .2) dots(ln, now + i * .4, col, 2, 2.8, 1);
      pop(seg(u, t0, t0 + .45), 1124, y, () => { rings(1124, y, now + i * .5, col, 28, 46, 1, .7, .5); icon(kind, 1124, y, 27, col) }) });
    shine(PX, 165, PW, 418, seg(u, 4.2, 4.9), 16);
  },
  // 5 사후관리: 첨가제·촉매제 등이 제조·수입 기준에 맞는지 하나씩 훑어 확인한다.
  (u, T, now) => {
    lab(560);
    const BY = 558, B = [['연료 첨가제', FUEL, 250, .74], ['촉매제', A, 520, .8], ['요소수 등', P.mint, 790, .77]];
    B.forEach(([s, col, x, lv], i) => { const k = seg(u, 1 + i * .2, 1.5 + i * .2), ts = 1.7 + i * .55, sk = seg(u, ts, ts + .6), ck = seg(u, ts + .55, ts + .95), bx = x + 94, by = BY - 248, ph = (now * .4 + i * .33) % 1;
      pop(k, x, BY, () => bottle(x, BY, i, col, s, now, lv * eout(seg(u, 1.1 + i * .2, 1.9 + i * .2))), {from: .7, dy: 24});
      if (sk > 0 && sk < 1) scan(x, lerp(BY - 276, BY - 6, eio(sk)), 104, P.cyan); else if (sk >= 1) scan(x, BY - 268 + ph * 262, 104, P.cyan, .36 * Math.sin(ph * Math.PI));
      if (ck >= 1) rings(bx, by, now + i * .3, P.green, 24, 46, 1, .6, .5);
      pop(ck, bx, by, () => { halo(bx, by, 48, P.green, .45); circ(bx, by, 24, '#0b2a20', P.green, 2.5); tick(bx - 1, by, seg(u, ts + .65, ts + 1), P.green, 1) }, {ease: spring}); burst(bx, by, seg(u, ts + .7, ts + 1.3), P.green, 12, 50) });
    const wk = seg(u, .3, 1.3); person(lerp(1320, 1046, eout(wk)), 600, 2.2, {now, pose: wk < 1 ? 'walk' : 'tablet', vest: '#e9eef0', hat: '#e9eef0', flip: true});
    const res = curve(910, 318, 990, 478, -22, 12), rk = seg(u, 3.6, 4); trace(res, rk, rgba(P.green, .8), 2, {dash: [5, 6], glow: 6}); if (rk >= 1) dots(res, now, P.green, 3, 3, .8);
    slide(seg(u, 3.6, 4.1), 0, -18, () => { box(290, 176, 560, 62, 'rgba(6,13,22,.92)', 31, A, 1.8); icon('shield', 332, 207, 19, A); txt('제조·수입 기준 적합 여부를 사후 확인합니다', 594, 215, 22, P.text, 'center', 700) }); shine(290, 176, 560, 62, seg(u, 4.2, 4.8), 31);
  }
]});
})();
