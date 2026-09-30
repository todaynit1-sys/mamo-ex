// 자동차관리과 · 자동차 연료 품질관리
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, car, person, doc, spark, monitor, lab, phone} = CINE;
function stationScene(now) { night(now, {ground: 620, city: .9});
  // canopy
  glow(A, 30, () => box(160, 250, 720, 34, '#0f1f2c', 6, A, 2)); c.fillStyle = grad(0, 284, 0, 620, [[0, 'rgba(61,224,255,.14)'], [1, 'rgba(61,224,255,0)']]); c.fillRect(170, 284, 700, 336);
  for (const x of [220, 800]) box(x, 284, 24, 336, '#15283a', 3); txt('주유소', 520, 274, 18, A, 'center', 700);
  for (const x of [380, 600]) { box(x, 460, 80, 160, '#1d3748', 8, '#3a5266'); box(x + 10, 474, 60, 36, '#050d15', 4); mono('₩', x + 40, 498, 16, '#7ee0a0', 'center'); line(x + 80, 520, x + 110, 540, '#0c1620', 6) } }
function drop(x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, -40); c.bezierCurveTo(26, -8, 30, 10, 0, 28); c.bezierCurveTo(-30, 10, -26, -8, 0, -40); c.fillStyle = col; c.fill(); c.restore() }
CINE.story({scenes: [
  // 1 연료 확인
  (u, T, now) => {
    stationScene(now); const carX = lerp(-200, 440, eout(u / 1.6)); car(carX, 640, 1.4, '#4d7bd6', {spin: (carX + 200) / 14});
    alpha(eout((u - 1.4) / .5), () => { glow(P.amber, 30, () => drop(990, 380, 2.4, 'rgba(255,181,71,.9)')); txt('휘발유 · 경유', 990, 500, 20, P.text, 'center', 700); txt('자동차 연료의 품질을 관리합니다', 990, 530, 15, P.muted, 'center', 600) });
  },
  // 2 시료 검사
  (u, T, now) => {
    lab(); const k = eout(u / .8);
    // vials
    for (let i = 0; i < 4; i++) { const x = 170 + i * 70, f = eout((u - .3 - i * .2) / .6); box(x, 390, 40, 150, 'rgba(200,230,240,.08)', 8, '#8fb0bd', 1.5); box(x + 3, 537 - 120 * f, 34, 120 * f, 'rgba(255,181,71,.75)', 6); box(x - 2, 380, 44, 14, '#b7b4d6', 3) }
    txt('연료 시료', 275, 590, 15, P.muted, 'center', 600);
    // analyzer
    box(520, 330, 300, 230, '#dfe8ec', 10); box(540, 350, 150, 90, '#050d15', 5); spark(548, 432, 134, 70, q => .15 + .7 * Math.exp(-Math.pow((q - .3) / .05, 2)) + .5 * Math.exp(-Math.pow((q - .62) / .06, 2)), eout((u - .6) / 2), A, 2);
    box(710, 360, 90, 40, '#1d3748', 5); mono('ANALYZING', 755, 386, 10, P.cyan, 'center'); for (let j = 0; j < 4; j++) circ(560 + j * 36, 500, 8, j === Math.floor(now * 3) % 4 ? P.green : '#9fb0bb');
    dots([[450, 460], [520, 460]], now, P.amber, 3);
    person(960, 560, 1.7, {now, pose: 'tablet', vest: '#e9eef0', hat: '#e9eef0', flip: true});
  },
  // 3 기준 확인
  (u, T, now) => {
    CINE.blueprint(); panel(90, 150, 1020, 430, '제조기준 적합 여부', '예시 자료 · 기준 대비 비율', P.violet);
    const R = [['황 함량', .32], ['벤젠 함량', .55], ['방향족 화합물', .7], ['증기압', .62], ['산소 함량', .44]];
    R.forEach(([s, v], i) => { const y = 240 + i * 64, k = eout((u - .2 - i * .2) / .8); txt(s, 130, y + 6, 18, P.text, 'left', 600);
      box(330, y - 12, 620, 24, '#16293a', 12); glow(P.mint, 12, () => box(330, y - 12, 620 * v * k, 24, P.mint, 12)); line(330 + 620, y - 20, 330 + 620, y + 20, P.red, 3);
      if (k > .98) tick(1000, y, (u - 1 - i * .2) / .3, P.green, .8) });
    txt('기준', 950, 222, 13, P.red, 'center', 600);
    alpha(eout((u - 2.6) / .4), () => chip(600, 640, '모든 항목 기준 이내', P.mint, 'center', 17));
  },
  // 4 등급 공개
  (u, T, now) => {
    CINE.blueprint(); panel(80, 150, 560, 440, '자동차 연료 환경품질등급', '정유사별 · 예시', P.amber);
    const R = [['A 정유사', 5], ['B 정유사', 5], ['C 정유사', 4], ['D 정유사', 4]];
    R.forEach(([s, n], i) => { const y = 250 + i * 80; txt(s, 120, y + 8, 19, P.text, 'left', 600); for (let j = 0; j < 5; j++) { const k = back((u - .3 - i * .15 - j * .08) / .35); const on = j < n; c.save(); c.translate(330 + j * 52, y); c.scale(clamp(k), clamp(k));
      c.beginPath(); for (let q = 0; q < 10; q++) { const r = q % 2 ? 9 : 20, a = -Math.PI / 2 + q * Math.PI / 5; q ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r) } c.closePath(); c.fillStyle = on ? P.amber : '#1d3448'; on ? glow(P.amber, 14, () => c.fill()) : c.fill(); c.restore() } });
    alpha(eout((u - 1.6) / .5), () => { phone(900, 380, 1.5, () => { c.fillStyle = '#081420'; c.fillRect(-52, -106, 104, 212); txt('연료 품질등급', 0, -80, 9, P.text, 'center', 700); for (let j = 0; j < 4; j++) { box(-44, -64 + j * 38, 88, 30, '#10202c', 6); txt(['A', 'B', 'C', 'D'][j], -32, -44 + j * 38, 9, P.muted, 'left', 700); mono('★'.repeat(R[j][1]), 38, -44 + j * 38, 8, P.amber, 'right') } }); txt('누리집 공개', 900, 610, 16, P.amber, 'center', 700) });
  },
  // 5 사후관리 (첨가제·촉매제)
  (u, T, now) => {
    lab(); const B = [['연료 첨가제', P.amber, 280], ['촉매제', A, 560], ['요소수 등', P.mint, 840]];
    B.forEach(([s, col, x], i) => { const k = back((u - .2 - i * .25) / .45); if (k <= 0) return; c.save(); c.translate(x, 560); c.scale(clamp(k), clamp(k));
      box(-50, -170, 100, 170, '#152838', 12, col, 2); box(-26, -196, 52, 30, '#3a5266', 5); alpha(.8, () => box(-40, -120, 80, 70, col, 6)); txt(s, 0, 36, 17, P.text, 'center', 700); c.restore();
      if (u > 1.4 + i * .3) { glow(P.green, 14, () => circ(x + 46, 400, 18, 'rgba(6,13,22,.9)', P.green, 2)); tick(x + 46, 400, (u - 1.5 - i * .3) / .4, P.green, .7) } });
    alpha(eout((u - 2.4) / .4), () => { box(300, 170, 600, 70, 'rgba(6,13,22,.9)', 35, P.violet); txt('제조·수입 기준 적합 여부를 사후 확인합니다', 600, 214, 19, P.text, 'center', 600) });
  }
]});
})();
