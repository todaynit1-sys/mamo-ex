// 조사분석과 · 이동측정차량을 활용한 대기질 조사
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, factory, van, person, spark, mapGrid, tree} = CINE;
const ITEMS = [['PM-10', 'µg/m³', 46, 0, '#cdc3b3'], ['PM-2.5', 'µg/m³', 24, 0, '#e9d5a0'], ['SO₂', 'ppm', .004, 3, P.mint], ['CO', 'ppm', .5, 1, P.cyan], ['NO₂', 'ppm', .026, 3, P.amber], ['O₃', 'ppm', .041, 3, P.violet]];
function site(now, o = {}) { night(now, {ground: 620, city: .9, ...o}); factory(700, 620, .8, {now, smoke: true, smokeA: .3, w: 240, label: '산업단지'}); factory(980, 620, .7, {now, smoke: true, smokeA: .25, w: 200}); box(60, 520, 170, 100, '#1d3748', 6); poly([[50, 520], [145, 470], [240, 520]], '#244a5e'); txt('학교', 145, 580, 16, '#9db2bf', 'center', 700); tree(270, 620, 1) }
CINE.story({scenes: [
  // 1 지역 선정
  (u, T, now) => {
    CINE.blueprint(); mapGrid(80, 150, 640, 470, {block: 100, river: true});
    const st = [[160, 220], [620, 250], [180, 560], [640, 560]]; st.forEach(([x, y]) => { circ(x, y, 7, P.dim); rings(x, y, now, P.dim, 7, 90, 1, .3, .35) });
    const Z = [[400, 300, 90, '측정망 공백', P.amber], [520, 470, 80, '산업단지', P.mag], [300, 460, 60, '학교 주변', A]];
    Z.forEach(([x, y, r, s, col], i) => { const k = eout((u - .5 - i * .35) / .5); if (k <= 0) return; c.save(); c.setLineDash([8, 6]); c.lineDashOffset = -now * 20; circ(x, y, r * k, `rgba(255,255,255,.03)`, col, 2.5); c.restore(); alpha(k, () => chip(x, y + 6, s, col, 'center', 15)) });
    alpha(eout((u - 1.8) / .5), () => { panel(770, 180, 390, 260, '조사 지역 선정', 'SITE SELECTION', A); txt('측정소가 없거나', 792, 270, 18, P.text, 'left', 600); txt('대기질 확인이 필요한 곳', 792, 300, 18, P.text, 'left', 600); chip(792, 360, '지자체 요청 지역 포함', P.muted, 'left', 14) });
  },
  // 2 차량 배치
  (u, T, now) => {
    site(now); const x = lerp(-360, 330, eout(u / 1.8)), mast = eout((u - 1.9) / .8) * 80;
    van(x, 640, 1.25, {now, spin: -eout(u / 1.8) * 30, intake: u > 2.6, mastH: 20 + mast, label: '수도권대기환경청', sub: '대기환경 이동측정차량', beam: u < 2});
    alpha(eout((u - 2.2) / .4), () => { box(820, 180, 330, 110, 'rgba(6,13,22,.9)', 14, A); txt('현장 도착 · 측정 준비', 842, 222, 19, A, 'left', 700); txt('흡입구 올리고 장비 가동', 842, 256, 15, P.text, 'left', 600) });
  },
  // 3 연속 측정 (day/night cycle)
  (u, T, now) => {
    const ph = (u / 4) % 1, day = Math.sin(ph * Math.PI);
    site(now, {haze: `rgb(${lerp(27, 90, day) | 0},${lerp(34, 120, day) | 0},${lerp(56, 150, day) | 0})`});
    const sx = lerp(80, 760, ph), sy = 360 - Math.sin(ph * Math.PI) * 220; glow(P.amber, 40, () => circ(sx, sy, 26, `rgba(255,207,107,${(.4 + .6 * day).toFixed(2)})`));
    van(330, 640, 1.25, {now, intake: true, mastH: 100, label: '수도권대기환경청', sub: '대기환경 이동측정차량'});
    panel(820, 130, 340, 420, '연속 측정 · 6개 항목', '24H · 예시', A);
    ITEMS.forEach((it, i) => { const y = 206 + i * 50, v = it[2] * (1 + .1 * Math.sin(now * 1.5 + i)); mono(it[0], 842, y, 16, it[4], 'left', 700); mono(v.toFixed(it[3]), 1080, y, 18, P.text, 'right', 700); mono(it[1], 1086, y, 11, P.muted); line(842, y + 14, 1138, y + 14, '#16293a', 1) });
    mono(String(Math.floor(ph * 24)).padStart(2, '0') + ':00', 842, 526, 20, P.amber, 'left', 700); txt('풍향 · 풍속 · 기온 함께 측정', 1138, 526, 13, P.muted, 'right', 600);
  },
  // 4 자료 분석 (pollution rose + series)
  (u, T, now) => {
    CINE.blueprint(); panel(70, 150, 520, 450, '풍향별 농도 분포', 'POLLUTION ROSE · 예시', A);
    const cx = 330, cy = 400, k = eout((u - .2) / 1.4); for (let r = 50; r <= 170; r += 40) circ(cx, cy, r, null, '#16293a', 1);
    ['N', 'E', 'S', 'W'].forEach((d, i) => mono(d, cx + Math.cos(-Math.PI / 2 + i * Math.PI / 2) * 190, cy + 6 + Math.sin(-Math.PI / 2 + i * Math.PI / 2) * 190, 13, P.muted, 'center'));
    const val = [.3, .35, .5, .9, .75, .4, .3, .25, .2, .25, .3, .28, .22, .25, .28, .3];
    val.forEach((v, i) => { const a0 = -Math.PI / 2 + i / 16 * Math.PI * 2 - .17, a1 = a0 + .34, r = 170 * v * k, col = v > .6 ? P.mag : v > .4 ? P.amber : A; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, a1); c.closePath(); c.fillStyle = col; c.globalAlpha = .75; c.fill(); c.globalAlpha = 1 });
    alpha(eout((u - 1.4) / .4), () => chip(cx + 120, cy - 110, '동북동풍일 때 높음', P.mag, 'left', 14));
    panel(630, 150, 530, 450, '시간대별 NO₂ · O₃', '예시', A);
    spark(670, 540, 450, 280, q => .3 + .45 * Math.exp(-Math.pow((q - .35) / .1, 2)) + .05 * Math.sin(q * 30), eout((u - .6) / 2), P.amber);
    spark(670, 540, 450, 280, q => .2 + .6 * Math.exp(-Math.pow((q - .62) / .14, 2)), eout((u - .8) / 2), P.violet);
    [['NO₂', P.amber], ['O₃', P.violet]].forEach(([s, col], i) => { box(1000 + i * 70, 184, 12, 12, col, 3); txt(s, 1018 + i * 70, 195, 13, P.muted, 'left', 600) });
    for (let h = 0; h <= 24; h += 6) mono(h + '시', 670 + 450 * h / 24, 568, 11, P.muted, 'center', 500);
  },
  // 5 관리 활용
  (u, T, now) => {
    CINE.blueprint(); const cx = 330, cy = 400; glow(A, 26, () => box(cx - 150, cy - 90, 300, 180, 'rgba(6,13,22,.92)', 16, A, 2)); disp('측정 결과', cx, cy - 10, 36, P.text, 'center'); txt('지역 대기질 특성', cx, cy + 34, 16, A, 'center', 600);
    const out = [['지자체 · 관계기관 공유', A], ['배출원 관리', P.amber], ['오존 저감 대책', P.violet], ['누리집 공개', P.mint]];
    out.forEach(([s, col], i) => { const y = 200 + i * 110, k = back((u - .5 - i * .3) / .45); if (k <= 0) return; dots([[cx + 150, cy], [760, y]], now + i * .25, col, 4); c.save(); c.translate(930, y); c.scale(k, k); box(-190, -34, 380, 68, 'rgba(6,13,22,.92)', 34, col, 2); txt(s, 0, 8, 20, P.text, 'center', 700); c.restore() });
  }
]});
})();
