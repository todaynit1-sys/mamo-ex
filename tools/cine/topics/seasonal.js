// 기획과 · 미세먼지 계절관리제
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, arrow, dashed, rings, plume, dots,
  night, factory, truck, car, person, doc, bars, spark, gauge, haze, mapGrid} = CINE;
const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const DUST = Array.from({length: 90}, (_, i) => ({x: CINE.hash(i) * W, y: 160 + CINE.hash(i + 40) * 440, r: 1 + CINE.hash(i + 9) * 2.4, s: .2 + CINE.hash(i + 3) * .5}));
function dust(now, k, col = '214,196,160') { for (const d of DUST) { const x = (d.x + now * 18 * d.s) % W, y = d.y + Math.sin(now * d.s + d.x) * 8; circ(x, y, d.r, `rgba(${col},${(.55 * k).toFixed(3)})`) } }
function city(now, k) { night(now, {ground: 610, city: 1.1, glow: 'rgba(255,181,71,.14)'}); haze(k); dust(now, k) }
function ring(cx, cy, r, u) { // calendar ring with Dec–Mar highlighted
  MONTHS.forEach((m, i) => { const a = -Math.PI / 2 + i / 12 * Math.PI * 2, on = i === 11 || i <= 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, k = eout((u - .3 - i * .04) / .3);
    alpha(k, () => { if (on) glow(A, 18, () => circ(x, y, 22, 'rgba(61,224,255,.16)', A, 2)); else circ(x, y, 18, null, '#1d3448', 1.5); txt(m + '월', x, y + 6, on ? 15 : 13, on ? P.text : P.dim, 'center', 700) }) });
  const k = eout((u - 1) / .8); c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2 - Math.PI / 6 - .15, -Math.PI / 2 - Math.PI / 6 - .15 + (Math.PI * 2 / 3 + .3) * k); c.strokeStyle = A; c.lineWidth = 5; glow(A, 16, () => c.stroke());
}
CINE.story({scenes: [
  // 1 고농도 시기
  (u, T, now) => {
    const k = .35 + .65 * eout(u / 3); city(now, k);
    for (let i = 0; i < 4; i++) factory(90 + i * 280, 610, .75, {now, smoke: true, smokeA: .35, w: 220});
    alpha(eout((u - .4) / .5), () => { panel(820, 150, 340, 290, '초미세먼지 PM-2.5', 'µg/m³ · 예시', P.amber);
      const v = lerp(18, 68, eout((u - .5) / 2.6)); gauge(990, 330, 88, v / 100, v > 35 ? P.amber : P.cyan, v > 35 ? '나쁨' : '보통', Math.round(v)) });
    alpha(eout((u - 1) / .6), () => { box(60, 470, 360, 80, 'rgba(6,13,22,.85)', 12, 'rgba(255,181,71,.5)'); txt('겨울 · 봄', 84, 506, 24, P.amber, 'left', 700); txt('대기 정체와 난방으로 농도가 높아지는 시기', 84, 534, 15, P.text) });
  },
  // 2 계획 수립 (network of agencies)
  (u, T, now) => {
    CINE.blueprint();
    const cx = 420, cy = 400; ring(cx, cy, 170, u);
    alpha(eout((u - .2) / .5), () => { glow(A, 30, () => circ(cx, cy, 70, 'rgba(61,224,255,.12)', A, 2.5)); disp('12 → 3월', cx, cy + 14, 36, P.text, 'center') });
    const nodes = [[830, 220, '서울'], [1010, 300, '인천'], [830, 420, '경기'], [1010, 520, '관계기관'], [830, 600, '수도권대기환경청']];
    nodes.forEach(([x, y, s], i) => { const k = back((u - .9 - i * .2) / .4); if (k <= 0) return; alpha(clamp(k), () => {
      dashed(cx + 180, cy, x - 60, y, 'rgba(61,224,255,.5)', 1.5, now); c.save(); c.translate(x, y); c.scale(k, k); box(-86, -26, 172, 52, i === 4 ? A : 'rgba(6,13,22,.9)', 26, A, 1.5); txt(s, 0, 7, 17, i === 4 ? '#04101a' : P.text, 'center', 700); c.restore() }) });
    dots([[cx + 180, cy], [770, 220]], now, A, 3); dots([[cx + 180, cy], [950, 520]], now + .3, P.mag, 3);
  },
  // 3 배출 저감 (three sectors)
  (u, T, now) => {
    CINE.blueprint();
    const S = [['산업', P.amber, 280], ['수송', A, 600], ['생활', P.mint, 920]];
    S.forEach(([name, col, x], i) => { const k = eout((u - .2 - i * .15) / .5);
      alpha(k, () => { box(x - 140, 180, 280, 420, 'rgba(6,13,22,.85)', 16, col); disp(name, x, 240, 34, col, 'center');
        c.save(); c.translate(x, 450); if (i === 0) factory(-100, 60, .7, {now, smoke: true, w: 200, smokeA: lerp(.5, .1, eout((u - 1.4) / 1.6))});
        else if (i === 1) { truck(-110, 60, .7, {now, smoke: true, spin: now * 6, old: u < 2}); } else { box(-60, -40, 120, 100, '#1d3748', 6); poly([[-72, -40], [0, -96], [72, -40]], '#244a5e'); plume(30, -80, now, {a: lerp(.45, .08, eout((u - 1.4) / 1.6)), len: 80, n: 10}) } c.restore();
        const r = lerp(1, .55, eout((u - 1.4) / 1.8)); box(x - 100, 560 - 60 * r, 200, 60 * r, col, 4); mono(Math.round(r * 100) + '%', x, 590, 18, P.text, 'center');
        arrow(x + 112, 500, x + 112, 560, col, 3, 10, eout((u - 1.6) / .5)) }) });
  },
  // 4 현장 점검
  (u, T, now) => {
    city(now, .45); factory(80, 610, 1.2, {now, smoke: true, smokeA: .25, label: '사업장', w: 300});
    const px = lerp(620, 520, eio(u / 1.2)); person(px, 620, 1.6, {now, pose: u < 1.2 ? 'walk' : 'tablet', vest: '#2f6f9a', hat: '#e9eef0', flip: true});
    person(px + 90, 620, 1.5, {now: now + 1, pose: u < 1.2 ? 'walk' : 'point', vest: '#3d8f6a', flip: true});
    alpha(eout((u - .8) / .4), () => { dashed(450, 380, 330, 300, 'rgba(61,224,255,.6)', 2, now); rings(300, 300, now, A, 6, 60, 3, 1, .8) });
    alpha(eout((u - 1.2) / .5), () => { panel(820, 150, 340, 300, '이행 점검', 'CHECKLIST', A);
      ['비상저감조치 이행', '방지시설 정상 가동', '운영기록 확인', '자발적 감축 협약'].forEach((s, j) => { txt(s, 842, 236 + j * 50, 17, P.text, 'left', 600); tick(1128, 230 + j * 50, (u - 1.6 - j * .35) / .4, P.green, .8) }) });
  },
  // 5 실적 확인
  (u, T, now) => {
    CINE.blueprint();
    panel(80, 150, 700, 460, '계절관리제 기간 월평균 PM-2.5', '예시 자료 · µg/m³', A);
    const prev = [.62, .7, .74, .6], now2 = [.48, .52, .55, .44], L = ['12월', '1월', '2월', '3월'], k = eout((u - .3) / 1.4);
    L.forEach((m, i) => { const x = 160 + i * 160; box(x, 560 - 300 * prev[i], 50, 300 * prev[i], '#27425a', 4); glow(A, 14, () => box(x + 58, 560 - 300 * now2[i] * k, 50, 300 * now2[i] * k, A, 4)); txt(m, x + 54, 590, 15, P.muted, 'center', 600) });
    box(560, 186, 14, 10, '#27425a', 2); txt('이전', 580, 196, 13, P.muted); box(630, 186, 14, 10, A, 2); txt('올해', 650, 196, 13, P.muted);
    alpha(eout((u - 1.6) / .5), () => { box(840, 220, 300, 150, 'rgba(6,13,22,.9)', 14, P.mint); txt('추진 실적 점검', 864, 258, 16, P.muted); disp('전년보다 낮게', 864, 318, 34, P.mint); txt('월별 농도 비교 · 예시', 864, 350, 13, P.muted) });
    alpha(eout((u - 2.3) / .5), () => { c.beginPath(); c.arc(990, 490, 60, -Math.PI * .1, Math.PI * 1.55 * eout((u - 2.3) / 1)); c.strokeStyle = A; c.lineWidth = 4; c.stroke(); txt('다음 대책에', 990, 488, 15, P.text, 'center', 600); txt('반영', 990, 510, 15, P.text, 'center', 600) });
  }
]});
})();
