// 조사분석과 · 국가대기오염측정망
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, station, person, spark, monitor, mapGrid, bars} = CINE;
const ST = Array.from({length: 26}, (_, i) => ({x: 120 + CINE.hash(i * 2.3) * 640, y: 170 + CINE.hash(i * 5.1) * 440}));
const ITEMS = [['SO₂', 'ppm', .004, 3, P.mint], ['CO', 'ppm', .4, 1, P.cyan], ['NO₂', 'ppm', .021, 3, P.amber], ['O₃', 'ppm', .034, 3, P.violet], ['PM-10', 'µg/m³', 38, 0, '#cdc3b3'], ['PM-2.5', 'µg/m³', 19, 0, '#e9d5a0']];
CINE.story({scenes: [
  // 1 측정망 운영 (map of stations)
  (u, T, now) => {
    CINE.blueprint(); mapGrid(90, 150, 700, 480, {river: true, block: 100});
    ST.forEach((s, i) => { const k = back((u - .2 - i * .05) / .4); if (k <= 0) return; ST.forEach((o, j) => { if (j > i && Math.hypot(o.x - s.x, o.y - s.y) < 140) alpha(k * .4, () => line(s.x, s.y, o.x, o.y, A, 1)) });
      glow(A, 14, () => circ(s.x, s.y, 6 * clamp(k), A)); if ((i + Math.floor(now * 2)) % 7 === 0) rings(s.x, s.y, now + i, A, 6, 26, 1, 1.2, .8) });
    alpha(eout((u - 1.2) / .5), () => { panel(840, 180, 320, 220, '국가대기오염측정망', 'NATIONAL MONITORING', A); disp('수도권 곳곳', 862, 290, 34, P.text); txt('도시대기 · 도로변 · 교외대기 등', 862, 330, 15, P.muted, 'left', 600); txt('측정소를 설치·운영합니다', 862, 356, 15, P.muted, 'left', 600) });
  },
  // 2 공기 채취
  (u, T, now) => {
    night(now, {ground: 620, city: 1}); station(380, 620, 2.2, {now, intake: true, label: '대기측정소'});
    for (let j = 0; j < 22; j++) { const q = (now * .5 + j / 22) % 1, a = j * 2.4, r = lerp(260, 10, q); const x = 380 + 130 * 2.2 + Math.cos(a) * r, y = 620 - 192 * 2.2 + Math.sin(a) * r * .6; circ(x, y, 3, `rgba(61,224,255,${(.8 * q).toFixed(2)})`) }
    alpha(eout((u - 1) / .5), () => { const ix = 380 + 130 * 2.2; dots([[ix, 620 - 186 * 2.2], [ix, 620 - 120 * 2.2], [380 + 60 * 2.2, 620 - 110 * 2.2]], now, A, 6, 3.5, .9);
      box(860, 200, 300, 120, 'rgba(6,13,22,.9)', 14, A); txt('흡입구 → 시료관', 882, 244, 18, A, 'left', 700); txt('바깥 공기를 측정 장비로 보냅니다', 882, 276, 15, P.text, 'left', 600) });
  },
  // 3 연속 측정 (rack + live values)
  (u, T, now) => {
    CINE.lab(); const rackX = 90; box(rackX, 150, 380, 410, '#0f1c29', 10, '#27425a');
    ITEMS.forEach((it, i) => { const y = 170 + i * 64; box(rackX + 16, y, 348, 52, '#152838', 6, '#1d3448'); mono(it[0], rackX + 32, y + 32, 17, it[4], 'left', 700);
      box(rackX + 150, y + 14, 120, 24, '#050d15', 4); const v = it[2] * (1 + .08 * Math.sin(now * 1.3 + i)); mono(v.toFixed(it[3]), rackX + 262, y + 32, 15, '#7ee0a0', 'right', 600); circ(rackX + 336, y + 26, 5, Math.sin(now * 4 + i) > 0 ? P.green : '#1b3a2a') });
    panel(520, 150, 640, 410, '시간별 측정값', '24시간 연속 · 예시', A);
    const f = (q, i) => .35 + .2 * Math.sin(q * 6.28 * 1.5 + i) + .08 * Math.sin(q * 40 + i * 3);
    [P.amber, P.violet, '#e9d5a0'].forEach((col, i) => spark(560, 520 - i * 10, 560, 260, q => f(q, i), eout((u - .2) / 3.4), col, 2.2));
    for (let h = 0; h <= 24; h += 6) mono(String(h).padStart(2, '0') + '시', 560 + 560 * h / 24, 548, 11, P.muted, 'center', 500);
    [['NO₂', P.amber], ['O₃', P.violet], ['PM-2.5', '#e9d5a0']].forEach(([s, col], i) => { box(900 + i * 90, 184, 12, 12, col, 3); txt(s, 918 + i * 90, 195, 13, P.muted, 'left', 600) });
  },
  // 4 자료 점검 (QA/QC)
  (u, T, now) => {
    CINE.lab(); person(250, 560, 1.7, {now, pose: 'tablet', vest: '#3d8f6a', hat: '#e9eef0'});
    box(330, 380, 70, 180, '#2b4a60', 10); box(342, 350, 46, 34, '#6b8797', 6); txt('표준가스', 365, 590, 13, P.muted, 'center', 600); dots([[365, 380], [365, 330], [480, 330]], now, P.mint, 4);
    panel(500, 150, 660, 410, '측정자료 품질 점검', 'QA / QC', P.mint);
    const f = q => .45 + .15 * Math.sin(q * 20) + (Math.abs(q - .62) < .02 ? .45 : 0);
    spark(540, 500, 580, 250, f, eout((u - .2) / 1.4), A, 2.5);
    alpha(eout((u - 1.6) / .4), () => { const x = 540 + 580 * .62; box(x - 22, 230, 44, 280, 'rgba(255,90,90,.12)', 6, P.red); chip(x, 222, '이상값', P.red, 'center', 14) });
    alpha(eout((u - 2.4) / .4), () => { const x = 540 + 580 * .62; cross(x, 250, 1, P.red); chip(560, 540, '교정 완료', P.mint, 'left', 14); chip(700, 540, '이상값 제외', P.mint, 'left', 14); tick(1110, 200, eout((u - 2.8) / .4), P.green, 1) });
  },
  // 5 분석·평가
  (u, T, now) => {
    CINE.blueprint(); mapGrid(70, 150, 520, 440, {river: true, block: 90});
    // heat blobs
    const blobs = [[240, 320, 110, 'rgba(255,181,71,'], [430, 470, 90, 'rgba(255,61,154,'], [180, 520, 80, 'rgba(61,224,255,']];
    blobs.forEach(([x, y, r, col], i) => { const k = eout((u - .2 - i * .2) / .8); const g = c.createRadialGradient(x, y, 0, x, y, r * k); g.addColorStop(0, col + '.45)'); g.addColorStop(1, col + '0)'); c.fillStyle = g; c.fillRect(70, 150, 520, 440) });
    panel(630, 150, 530, 440, '연도별 대기질 평가', '예시 자료', A);
    const v = [.72, .66, .6, .55, .5], k = eout((u - .5) / 1.6); v.forEach((h, i) => { const x = 680 + i * 92; glow(A, 12, () => box(x, 540 - 300 * h * k, 54, 300 * h * k, i === 4 ? A : '#27425a', 5)); mono(String(2021 + i), x + 27, 566, 13, P.muted, 'center', 500) });
    alpha(eout((u - 2.2) / .5), () => { chip(680, 212, '대기환경 현황 파악', P.mint, 'left', 15); chip(880, 212, '정책 자료로 활용', P.amber, 'left', 15) });
  }
]});
})();
