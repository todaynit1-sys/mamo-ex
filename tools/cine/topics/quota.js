// 대기총량과 · 사업장 총량관리
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, factory, person, doc, spark, monitor, gauge} = CINE;
const POLL = [['NOx', P.amber], ['SOx', P.mint], ['먼지', P.violet]];
function row(now, sm = .35) { night(now, {ground: 620, city: .7}); [['A', 90], ['B', 470], ['C', 850]].forEach(([n, x]) => factory(x, 620, .95, {now, smoke: true, smokeA: sm, w: 260, label: n + ' 사업장'})) }
CINE.story({scenes: [
  // 1 총량 할당
  (u, T, now) => {
    row(now);
    [['A', 210], ['B', 590], ['C', 970]].forEach(([n, x], i) => POLL.forEach(([p, col], j) => { const k = back((u - .5 - i * .25 - j * .12) / .45); if (k <= 0) return;
      const y = lerp(120, 230 + j * 52, clamp(k)); c.save(); c.translate(x, y); c.scale(clamp(k), clamp(k)); glow(col, 14, () => box(-70, -20, 140, 40, 'rgba(6,13,22,.9)', 20, col, 2)); mono(p, -52, 6, 15, col); mono([420, 180, 60][j] - i * 20 + ' t', 58, 6, 14, P.text, 'right'); c.restore() }));
    alpha(eout((u - 2) / .5), () => txt('연도별 · 오염물질별 배출허용총량', 600, 180, 18, P.text, 'center', 600));
  },
  // 2 배출량 산정 (TMS → cumulative)
  (u, T, now) => {
    night(now, {ground: 620, city: .7}); factory(80, 620, 1.3, {now, smoke: true, smokeA: .3, w: 330, sx: 260, sh: 220, label: 'A 사업장'});
    // TMS sensor on stack
    glow(A, 16, () => box(282, 250, 34, 24, '#0d1b28', 4, A, 2)); mono('TMS', 299, 267, 10, A, 'center', 700);
    dots([[316, 262], [520, 262], [520, 300], [700, 300]], now, A, 6, 3, .8);
    panel(700, 150, 460, 420, '누적 배출량', 'NOx · 예시', A);
    const k = eout((u - .4) / 3), cap = 420, v = cap * .78 * k; const bx = 740, by = 520, bw = 380, bh = 40;
    box(bx, by - 200, bw, 200, null, 8, '#27425a'); glow(P.amber, 14, () => box(bx, by - 200 * v / cap * 1, bw * 1, 200 * v / cap, 'rgba(255,181,71,.25)', 8)); line(bx, by - 200, bx + bw, by - 200, P.red, 2);
    txt('배출허용총량 ' + cap + ' t', bx + bw, by - 208, 13, P.red, 'right', 600); mono(Math.round(v) + ' t', bx + bw / 2, by - 200 * v / cap / 2 + 8, 34, P.text, 'center', 700);
    ['가동시간', '연료 사용량', '자동측정 자료'].forEach((s, j) => alpha(eout((u - .8 - j * .3) / .4), () => chip(740 + j * 130, 250, s, A, 'left', 13)));
  },
  // 3 자료 확인
  (u, T, now) => {
    CINE.blueprint(); const k = eout(u / .7);
    monitor(lerp(500, 180, k), 160, 840, 400, {stand: false}); const x0 = lerp(500, 180, k) + 30;
    txt('배출량 산정결과 검토', x0, 204, 22, P.text, 'left', 700);
    const R = [['1분기', '102.4', '102.4'], ['2분기', '98.7', '98.7'], ['3분기', '131.9', '109.2'], ['4분기', '88.1', '88.1']];
    ['기간', '제출값 (t)', '확인값 (t)', '판정'].forEach((h, j) => txt(h, x0 + [0, 280, 480, 700][j], 250, 14, P.muted, j ? 'right' : 'left', 600));
    R.forEach((r, j) => { const a = eout((u - .6 - j * .25) / .3); alpha(a, () => { const y = 300 + j * 56, bad = j === 2; if (bad && u > 1.8) box(x0 - 12, y - 28, 790, 44, 'rgba(255,90,90,.1)', 8, P.red);
      txt(r[0], x0, y, 18, P.text, 'left', 600); mono(r[1], x0 + 280, y, 18, bad && u > 1.8 ? P.red : P.text, 'right'); mono(bad && u < 2.6 ? '—' : r[2], x0 + 480, y, 18, bad ? P.mint : P.text, 'right');
      if (!bad) tick(x0 + 690, y - 6, (u - 1 - j * .2) / .4, P.green, .7); else if (u > 2.6) chip(x0 + 720, y, '조정', P.mint, 'right', 14) }) });
  },
  // 4 배출권 관리 (trade)
  (u, T, now) => {
    row(now, .2);
    const L = [210, 970]; [[L[0], '여유', P.mint, .55], [L[1], '초과 예상', P.red, 1.08]].forEach(([x, s, col, r]) => { box(x - 90, 170, 180, 200, 'rgba(6,13,22,.9)', 14, col); txt(s, x, 204, 16, col, 'center', 700);
      box(x - 50, 350 - 140 * Math.min(r, 1), 100, 140 * Math.min(r, 1), col, 4); line(x - 60, 210, x + 60, 210, P.text, 1.5) });
    const k = eio((u - .8) / 1.6); for (let j = 0; j < 3; j++) { const q = clamp(k - j * .12), x = lerp(260, 920, q), y = 250 - Math.sin(q * Math.PI) * 120; if (q > 0 && q < 1) glow(P.amber, 20, () => { circ(x, y, 22, 'rgba(255,181,71,.9)'); mono('t', x, y + 6, 14, '#1a1004', 'center', 700) }) }
    alpha(eout((u - 1) / .4), () => { disp('배출권 거래', 600, 170, 40, P.amber, 'center'); txt('배출허용총량의 이전 · 거래를 관리합니다', 600, 206, 16, P.text, 'center', 600) });
    alpha(eout((u - 2.6) / .4), () => { tick(1090, 200, 1, P.green, 1) });
  },
  // 5 저감 지원
  (u, T, now) => {
    night(now, {ground: 620, city: .7}); const k = eout((u - .8) / 2); factory(80, 620, 1.3, {now, smoke: true, smokeA: lerp(.5, .1, k), w: 330, label: 'A 사업장'});
    alpha(eout((u - .3) / .5), () => { box(520, 360, 220, 150, 'rgba(6,13,22,.92)', 14, P.mint); txt('저녹스버너', 630, 400, 20, P.mint, 'center', 700);
      for (let j = 0; j < 5; j++) { const h = 40 + 20 * Math.sin(now * 10 + j); glow(lerp(0, 1, k) > .5 ? A : P.amber, 14, () => poly([[570 + j * 22, 490], [580 + j * 22, 490 - h * lerp(1, .6, k)], [590 + j * 22, 490]], k > .5 ? 'rgba(61,224,255,.8)' : 'rgba(255,181,71,.8)')) } });
    panel(800, 150, 360, 300, '질소산화물 배출', '개선 전 → 후 · 예시', P.mint);
    box(850, 420 - 220, 90, 220, '#27425a', 6); glow(P.mint, 14, () => box(1000, 420 - 220 * lerp(1, .45, k), 90, 220 * lerp(1, .45, k), P.mint, 6)); txt('개선 전', 895, 440, 14, P.muted, 'center', 600); txt('개선 후', 1045, 440, 14, P.mint, 'center', 600);
    alpha(eout((u - 2.4) / .4), () => { box(520, 540, 640, 56, 'rgba(95,224,181,.1)', 12, P.mint); txt('시설 개선과 기술 지원으로 저감을 돕습니다', 840, 576, 18, P.text, 'center', 600) });
  }
]});
})();
