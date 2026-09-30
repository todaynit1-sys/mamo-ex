// 조사분석과 · 배출원·배출량 조사
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, factory, truck, car, person, doc, spark, monitor, mapGrid} = CINE;
const SRC = [[180, 250, '점', P.amber, '공장 · 발전소'], [360, 420, '선', A, '도로 · 항만'], [250, 540, '면', P.mint, '주거 · 농촌'], [520, 300, '점', P.amber, '사업장'], [560, 520, '선', A, '도로'], [440, 220, '면', P.mint, '생활']];
function icon(kind, x, y, col, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); if (kind === '점') { c.fillStyle = '#16304a'; c.fillRect(-6, -30, 12, 30); plume(0, -32, performance.now() / 1000, {a: .4, len: 30, dx: 12, n: 6, r0: 2, r1: 6}) }
  else if (kind === '선') { line(-26, 10, 26, -10, col, 6) } else { poly([[-22, -4], [0, -22], [22, -4]], col); box(-16, -4, 32, 22, '#1d3748', 3) } c.restore() }
CINE.story({scenes: [
  // 1 배출원 파악
  (u, T, now) => {
    CINE.blueprint(); mapGrid(80, 150, 620, 470, {block: 96, river: true});
    SRC.forEach(([x, y, k0, col, s], i) => { const k = back((u - .3 - i * .22) / .45); if (k <= 0) return; alpha(clamp(k), () => { glow(col, 18, () => circ(x, y, 26 * clamp(k), 'rgba(6,13,22,.9)', col, 2)); icon(k0, x, y + (k0 === '점' ? 14 : 0), col, clamp(k) * .9); rings(x, y, now + i * .3, col, 26, 56, 1, .8, .5) }) });
    alpha(eout((u - 1.4) / .5), () => { panel(760, 180, 400, 330, '배출원 유형', 'SOURCE TYPE', A);
      [['점 배출원', '굴뚝이 있는 사업장', P.amber], ['선 배출원', '도로 · 철도 · 선박', A], ['면 배출원', '주거 난방 · 농업 등', P.mint]].forEach(([a, b, col], j) => { const y = 270 + j * 76; circ(800, y - 6, 8, col); txt(a, 820, y, 19, col, 'left', 700); txt(b, 820, y + 26, 15, P.text, 'left', 500) }) });
  },
  // 2 자료 수집
  (u, T, now) => {
    CINE.blueprint(); const cx = 880, cy = 400;
    glow(A, 26, () => { box(cx - 110, cy - 130, 220, 260, 'rgba(6,13,22,.9)', 16, A, 2) }); for (let j = 0; j < 4; j++) { ell(cx, cy - 90 + j * 60, 80, 16, 'rgba(61,224,255,.12)'); c.beginPath(); c.ellipse(cx, cy - 90 + j * 60, 80, 16, 0, 0, 6.28); c.strokeStyle = A; c.lineWidth = 1.5; c.stroke() }
    txt('배출량 자료', cx, cy + 160, 18, A, 'center', 700);
    const D2 = [['시설 현황', 150, 200], ['연료 사용량', 150, 330], ['가동 시간', 150, 460], ['차량 통행량', 150, 590]];
    D2.forEach(([s, x, y], i) => { const q = eio(clamp((u - .3 - i * .3) / 1.1)); const X = lerp(x + 200, cx - 60, q), Y = lerp(y, cy - 80 + i * 40, q);
      alpha(1 - q * .8, () => { doc(X - 70, Y - 34, 140, 68, {rows: 2, fill: '#dde6e3'}); txt(s, X, Y + 50, 15, P.text, 'center', 600) }); if (q > .98) tick(cx + 130, cy - 80 + i * 40, 1, P.green, .6) });
  },
  // 3 배출량 조사 (formula)
  (u, T, now) => {
    CINE.blueprint(); const k = i => eout((u - .2 - i * .45) / .45);
    const parts = [['활동량', '연료 1,200 kL', A, 190], ['×', '', P.muted, 400], ['배출계수', 'kg / kL', P.amber, 600], ['=', '', P.muted, 800], ['배출량', '', P.mint, 990]];
    parts.forEach(([a, b, col, x], i) => alpha(k(i), () => { if (a.length > 1) { box(x - 130, 280, 260, 150, 'rgba(6,13,22,.92)', 16, col, 2); disp(a, x, 350, 38, col, 'center'); if (b) mono(b, x, 396, 15, P.text, 'center', 500) } else disp(a, x, 372, 60, col, 'center') }));
    alpha(eout((u - 2.2) / .4), () => { const v = Math.round(lerp(0, 8420, eout((u - 2.2) / 1.2))); mono(CINE.counter(v) + ' kg', 990, 400, 24, P.text, 'center', 700); glow(P.mint, 30, () => box(860, 280, 260, 150, null, 16, P.mint, 3)) });
    alpha(eout((u - 1) / .4), () => txt('배출원별로 계산해 모두 더합니다', 600, 520, 18, P.text, 'center', 600));
  },
  // 4 자료 검토
  (u, T, now) => {
    CINE.blueprint(); const k = eout(u / .6); monitor(lerp(400, 160, k), 160, 880, 400, {stand: false}); const x0 = lerp(400, 160, k) + 30;
    txt('배출량 조사자료 검토', x0, 204, 22, P.text, 'left', 700);
    const R = [['사업장 A', '연료 사용량', '정상'], ['사업장 B', '가동 시간', '누락'], ['도로 구간 12', '통행량', '정상'], ['사업장 C', '단위 오류', '오류']];
    R.forEach((r, j) => alpha(eout((u - .5 - j * .25) / .3), () => { const y = 270 + j * 64, bad = r[2] !== '정상'; if (bad) box(x0 - 12, y - 32, 820, 50, 'rgba(255,181,71,.08)', 8, u > 2.4 ? P.mint : P.amber);
      txt(r[0], x0, y, 18, P.text, 'left', 600); txt(r[1], x0 + 300, y, 17, P.muted, 'left', 500);
      if (bad) chip(x0 + 800, y, u > 2.4 ? '보완 완료' : r[2], u > 2.4 ? P.mint : P.amber, 'right', 14); else tick(x0 + 780, y - 6, (u - 1 - j * .2) / .4, P.green, .7) }));
    // scanning line
    alpha(fade(u, .4, 2.4, .3), () => { const y = 230 + ((now * 160) % 280); c.fillStyle = grad(0, y - 20, 0, y, [[0, 'rgba(61,224,255,0)'], [1, 'rgba(61,224,255,.35)']]); c.fillRect(x0 - 12, y - 20, 820, 20) });
  },
  // 5 자료관리 → 활용
  (u, T, now) => {
    CINE.blueprint(); panel(80, 150, 520, 450, '부문별 배출 비중', '예시 자료', A);
    const seg = [['산업', .38, P.amber], ['수송', .3, A], ['생활', .2, P.mint], ['기타', .12, P.violet]]; let a0 = -Math.PI / 2; const k = eout((u - .2) / 1.4);
    seg.forEach(([s, v, col], i) => { const a1 = a0 + Math.PI * 2 * v * k; c.beginPath(); c.arc(340, 390, 150, a0, a1); c.strokeStyle = col; c.lineWidth = 46; c.stroke(); const am = (a0 + a1) / 2; if (k > .95) txt(s, 340 + Math.cos(am) * 220, 396 + Math.sin(am) * 200, 16, col, 'center', 700); a0 = a1 });
    disp('배출량', 340, 402, 30, P.text, 'center');
    const uses = [['대기환경 관리 계획', A], ['오염물질 저감 대책', P.amber], ['대기질 예측 · 모델링', P.mint]];
    uses.forEach(([s, col], i) => { const kk = back((u - 1.4 - i * .3) / .45); if (kk <= 0) return; c.save(); c.translate(900, 250 + i * 110); c.scale(kk, kk); box(-220, -36, 440, 72, 'rgba(6,13,22,.92)', 36, col, 2); txt(s, 0, 8, 20, P.text, 'center', 700); c.restore(); dots([[600, 390], [680, 250 + i * 110]], now + i * .3, col, 3) });
  }
]});
})();
