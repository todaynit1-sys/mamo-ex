// 대기총량과 · 통합환경관리
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, factory, tank, pipe, person, doc, spark, monitor} = CINE;
// process flow cut-away: 원료 → 공정 → 방지시설 → 굴뚝
const NODES = [[150, '원료', P.muted], [390, '공정', A], [640, '방지시설', P.mint], [880, '굴뚝', P.amber]];
function flowline(now, u, hl = -1) {
  NODES.forEach(([x, s, col], i) => { const k = eout((u - i * .2) / .4); alpha(k, () => {
    box(x - 90, 300, 180, 150, i === hl ? 'rgba(61,224,255,.12)' : 'rgba(6,13,22,.9)', 16, i === hl ? P.text : col, i === hl ? 2.5 : 1.5);
    txt(s, x, 430, 18, col, 'center', 700);
    c.save(); c.translate(x, 390);
    if (i === 0) { for (let j = 0; j < 3; j++) box(-50 + j * 34, -40 - (j % 2) * 10, 30, 40 + (j % 2) * 10, '#3a5266', 4) }
    else if (i === 1) { box(-54, -64, 108, 64, '#1d3748', 6); for (let j = 0; j < 3; j++) { const a = now * 3 + j * 2; circ(-30 + j * 30, -32, 12, null, A, 2); line(-30 + j * 30, -32, -30 + j * 30 + Math.cos(a) * 10, -32 + Math.sin(a) * 10, A, 2) } }
    else if (i === 2) { box(-40, -70, 80, 70, '#16372f', 6); for (let j = 0; j < 5; j++) line(-30 + j * 15, -60, -30 + j * 15, -10, P.mint, 3) }
    else { c.fillStyle = '#16304a'; c.fillRect(-16, -80, 32, 80); c.fillStyle = '#b8554a'; c.fillRect(-16, -70, 32, 8); plume(0, -84, now, {a: .3, len: 60, dx: 30, n: 10}) }
    c.restore() }); if (i < 3) alpha(eout((u - .4 - i * .2) / .4), () => { arrow(x + 96, 375, NODES[i + 1][0] - 96, 375, '#35506a', 3, 10); dots([[x + 96, 375], [NODES[i + 1][0] - 100, 375]], now + i * .3, i === 2 ? P.mint : A, 3, 3, .9) }) });
}
function plant(now) { night(now, {ground: 610, city: .8}); factory(60, 610, 1.3, {now, smoke: true, smokeA: .25, w: 320, label: '통합관리사업장', sx: 250, sh: 200}); tank(620, 610, .9); pipe([[380, 520], [570, 520]]);
  c.fillStyle = '#16372f'; c.fillRect(700, 470, 150, 140); for (let j = 0; j < 6; j++) line(716 + j * 22, 486, 716 + j * 22, 590, 'rgba(95,224,181,.5)', 3); txt('방지시설', 775, 462, 15, P.mint, 'center', 700); pipe([[670, 540], [700, 540]]) }
CINE.story({scenes: [
  // 1 사업장 파악
  (u, T, now) => {
    CINE.blueprint(); flowline(now, u);
    alpha(eout((u - 1.4) / .5), () => { ['대기', '수질', '폐기물'].forEach((s, i) => chip(420 + i * 130, 540, s, [A, P.cyan, P.amber][i], 'center', 17)); txt('하나의 허가로 환경 영향을 통합 관리', 600, 600, 18, P.text, 'center', 600) });
    alpha(eout((u - 1) / .4), () => txt('배출 경로 추적', 150, 250, 15, P.muted, 'left', 600));
  },
  // 2 허가사항
  (u, T, now) => {
    CINE.blueprint(); const k = eout(u / .8);
    doc(lerp(700, 360, k), 150, 480, 460, {head: '#1f5a6e', title: '통합환경 허가서', rows: 0});
    const x0 = lerp(700, 360, k) + 30;
    [['배출시설', '공정별 설치 내역'], ['방지시설', '처리 방식 · 용량'], ['허가배출기준', '오염물질별 기준'], ['관리 조건', '측정 · 기록 · 보고']].forEach((r, j) => { const a = eout((u - .8 - j * .3) / .35); alpha(a, () => { const y = 250 + j * 74;
      box(x0, y - 30, 420, 56, j === 2 ? 'rgba(255,181,71,.12)' : '#e2ebe8', 8); txt(r[0], x0 + 18, y + 4, 18, j === 2 ? '#8a5a1a' : '#14323c', 'left', 700); txt(r[1], x0 + 400, y + 4, 15, '#4f6371', 'right', 500) }) });
    alpha(eout((u - 2.4) / .3), () => { c.save(); c.translate(x0 + 360, 560); c.rotate(-.2); const s = CINE.lerp(1.6, 1, eout((u - 2.4) / .3)); c.scale(s, s); circ(0, 0, 44, null, '#d0463c', 4); txt('허가', 0, 8, 22, '#d0463c', 'center', 700); c.restore() });
  },
  // 3 시설 확인
  (u, T, now) => {
    plant(now); const px = lerp(1000, 900, eio(u / 1)); person(px, 620, 1.6, {now, pose: u < 1 ? 'walk' : 'tablet', vest: '#2f6f9a', hat: '#e9eef0', flip: true});
    alpha(eout((u - .9) / .4), () => { c.save(); c.globalCompositeOperation = 'lighter'; const sy = 470 + ((now * 120) % 140); c.fillStyle = grad(0, sy - 20, 0, sy + 4, [[0, 'rgba(95,224,181,0)'], [1, 'rgba(95,224,181,.5)']]); c.fillRect(700, sy - 20, 150, 24); c.restore() });
    alpha(eout((u - 1.2) / .5), () => { panel(880, 150, 290, 230, '시설 상태', 'FACILITY CHECK', P.mint);
      [['배출시설 설치 내역', 1], ['방지시설 가동', 1], ['차압 · 온도 정상', 1]].forEach(([s], j) => { txt(s, 902, 236 + j * 46, 16, P.text, 'left', 600); tick(1140, 230 + j * 46, (u - 1.6 - j * .35) / .4, P.green, .8) }) });
  },
  // 4 운영 점검
  (u, T, now) => {
    CINE.blueprint(); panel(70, 150, 700, 440, '운영기록 · 굴뚝 자동측정 추이', '예시 자료', A);
    const x0 = 110, y0 = 540, w = 620, h = 300; line(x0, y0, x0 + w, y0, '#27425a', 1.5); for (let j = 1; j < 4; j++) line(x0, y0 - j * 75, x0 + w, y0 - j * 75, '#16293a', 1);
    const lim = .72; dashed(x0, y0 - h * lim, x0 + w, y0 - h * lim, P.red, 2, now, [10, 8], 10); txt('허가배출기준', x0 + w, y0 - h * lim - 10, 13, P.red, 'right', 600);
    const f = q => .42 + .12 * Math.sin(q * 18) + .05 * Math.sin(q * 51); c.save(); c.shadowColor = A; c.shadowBlur = 10; CINE.spark(x0, y0, w, h, f, eout((u - .2) / 2.2), A); c.restore();
    alpha(eout((u - 2.2) / .5), () => { panel(820, 150, 330, 260, '허가 이행', 'COMPLIANCE', P.mint); [['가동 기록', 1], ['측정 · 보고', 1], ['기준 준수', 1]].forEach(([s], j) => { txt(s, 842, 236 + j * 50, 17, P.text, 'left', 600); tick(1120, 230 + j * 50, (u - 2.4 - j * .3) / .4, P.green, .8) }) });
  },
  // 5 후속 관리 (loop)
  (u, T, now) => {
    CINE.blueprint(); const cx = 600, cy = 400, R = 200;
    const st = [['점검', -Math.PI / 2, A], ['결과 통보', Math.PI / 6, P.amber], ['개선 · 재확인', Math.PI * 5 / 6, P.mint]];
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2 * eout(u / 1.4)); c.strokeStyle = '#27425a'; c.lineWidth = 6; c.stroke();
    const a = -Math.PI / 2 + now * 1.2; glow(A, 20, () => circ(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 9, A));
    st.forEach(([s, ang, col], i) => { const k = back((u - .4 - i * .3) / .45); if (k <= 0) return; c.save(); c.translate(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); c.scale(k, k); box(-90, -30, 180, 60, 'rgba(6,13,22,.95)', 30, col, 2); txt(s, 0, 8, 19, col, 'center', 700); c.restore() });
    alpha(eout((u - 1.4) / .5), () => { disp('지속 관리', cx, cy + 14, 40, P.text, 'center') });
  }
]});
})();
