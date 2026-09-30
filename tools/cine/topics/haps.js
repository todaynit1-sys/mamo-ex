// 대기총량과 · HAPs 비산배출시설
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, tank, pipe, flange, person, doc, spark, monitor} = CINE;
const LEAKS = [[322, 452], [468, 452], [612, 452], [612, 380], [796, 520]];
function plant(now, leak = 1, sealed = 0) {
  night(now, {ground: 600, city: .7});
  tank(250, 600, 1.1); tank(410, 600, .85); tank(1020, 600, .95, '#26435a');
  // process column
  c.fillStyle = grad(740, 0, 800, 0, [[0, '#15293a'], [.5, '#2b4a60'], [1, '#101f2c']]); c.fillRect(740, 250, 60, 350); for (let y = 280; y < 600; y += 44) line(740, y, 800, y, 'rgba(159,176,187,.3)', 2);
  line(800, 290, 850, 290, '#6b8797', 3); line(850, 290, 850, 600, '#6b8797', 3); for (let y = 300; y < 600; y += 22) line(844, y, 856, y, '#6b8797', 1.5);
  pipe([[300, 452], [680, 452], [680, 520], [930, 520], [930, 470], [990, 470]]); pipe([[612, 452], [612, 380], [740, 380]]);
  for (const [x, y] of LEAKS) flange(x, y, y === 380 && x === 612 ? true : false);
  // valves
  for (const x of [540, 880]) { poly([[x - 10, 444], [x + 10, 460], [x + 10, 444], [x - 10, 460]], '#9fb0bb'); line(x, 444, x, 432, '#9fb0bb', 3); line(x - 8, 432, x + 8, 432, '#9fb0bb', 3) }
  // leaks (violet wisps)
  LEAKS.forEach(([x, y], i) => { const a = leak * (1 - sealed * (i < 4 ? 1 : .6));
    if (a > .02) alpha(a, () => plume(x, y - 6, now, {col: 'rgba(184,147,245,', a: .75, len: 90, dx: 25, n: 12, r0: 3, r1: 12, speed: .6, seed: i * .13, wob: 6})) });
}
CINE.story({scenes: [
  // 1 비산배출
  (u, T, now) => {
    plant(now, 1);
    alpha(fade(u, .8, 4.5), () => { chip(440, 360, '굴뚝', P.muted, 'center'); cross(440, 340 - 24, eout((u - 1) / .4), P.muted) });
    alpha(eout((u - 1.2) / .5), () => { LEAKS.slice(0, 4).forEach(([x, y], i) => rings(x, y, now + i * .2, P.violet, 6, 34, 2, 1, .8));
      box(860, 150, 300, 110, 'rgba(6,13,22,.9)', 12, 'rgba(184,147,245,.6)'); txt('비산배출', 882, 188, 22, P.violet, 'left', 700);
      txt('배관 · 밸브 · 저장시설 · 공정에서', 882, 218, 15, P.text); txt('새어 나오는 유해대기오염물질', 882, 242, 15, P.text) });
  },
  // 2 시설 신고
  (u, T, now) => {
    plant(now, .5);
    const tags = [[250, 440, '저장시설'], [450, 470, '배관·밸브'], [770, 240, '공정시설'], [1020, 440, '저장시설']];
    tags.forEach(([x, y, s], i) => { const k = back((u - .4 - i * .25) / .45); if (k <= 0) return; alpha(clamp(k), () => { dashed(x, y, x, y - 60, P.amber, 1.5, now); c.save(); c.translate(x, y - 70); c.scale(k, k); chip(0, 0, s, P.amber, 'center', 15); c.restore() }) });
    alpha(eout((u - 1.6) / .5), () => { const x = lerp(1220, 880, eout((u - 1.6) / .6));
      doc(x, 150, 270, 250, {head: '#8a5a1a', title: '비산배출시설 설치·운영 신고', rows: 6});
      [0, 1, 2].forEach(j => tick(x + 240, 214 + j * 44, (u - 2.2 - j * .3) / .4, P.green, .8)) });
  },
  // 3 누출 점검
  (u, T, now) => {
    plant(now, 1);
    const px = lerp(360, 560, eio(u / 1.6));
    person(px, 610, 1.6, {now, pose: u < 1.6 ? 'walk' : 'probe', vest: '#2f6f9a', hat: '#e9eef0'});
    // detector probe to flange
    if (u > 1.4) { line(px + 36, 540, 600, 470, '#c8d4db', 3); circ(604, 466, 5, P.cyan); rings(612, 452, now, P.red, 6, 40, 3, 1.4, .9) }
    alpha(eout((u - 1.6) / .4), () => { panel(840, 150, 320, 250, '휴대용 VOC 측정기', 'LEAK DETECTION', P.red);
      const v = u < 1.8 ? 0 : 12 + 4800 * eout((u - 1.8) / 1.2);
      mono(CINE.counter(v), 1010, 262, 58, v > 500 ? P.red : P.text, 'right', 700); mono('ppm', 1022, 262, 16, P.muted);
      spark(862, 360, 276, 60, q => q < .6 ? .05 + .03 * Math.sin(q * 40) : .05 + .9 * eout((q - .6) / .3), clamp((u - 1.4) / 1.6), P.red);
      if (u > 3) chip(862, 300, '누출 확인 · 플랜지', P.red, 'left', 15) });
  },
  // 4 저감 관리
  (u, T, now) => {
    const s = eout((u - .6) / 1.4); plant(now, 1, s);
    // capture hood over tank vent to treatment unit
    alpha(eout((u - .3) / .5), () => { pipe([[250, 440], [250, 330], [560, 330], [560, 300]], '#2d5e53', 14); box(520, 230, 110, 72, '#16372f', 8, P.mint);
      txt('처리시설', 575, 272, 15, P.mint, 'center', 700); dots([[250, 430], [250, 330], [560, 330], [560, 300]], now, P.mint, 7, 3.5, .6) });
    LEAKS.slice(0, 4).forEach(([x, y], i) => { const k = eout((u - .8 - i * .25) / .4); if (k > 0) { glow(P.mint, 16, () => circ(x, y, 13 * k, null, P.mint, 3)); tick(x, y - 30, (u - 1.1 - i * .25) / .4, P.mint, .8) } });
    alpha(eout((u - 2) / .5), () => { panel(860, 150, 300, 200, '저감 관리', 'SEAL · CAPTURE · TREAT', P.mint);
      ['밀폐', '포집', '처리'].forEach((s2, j) => { txt(s2, 884, 234 + j * 36, 18, P.text, 'left', 600); tick(1130, 228 + j * 36, (u - 2.3 - j * .3) / .4, P.mint, .8) }) });
  },
  // 5 기록·보고
  (u, T, now) => {
    plant(now, .08, 1);
    alpha(.55, () => { c.fillStyle = '#03070c'; c.fillRect(0, 0, W, H) });
    const k = eout(u / .8);
    monitor(lerp(700, 330, k), 190, 540, 320, {stand: false});
    const x0 = lerp(700, 330, k) + 30;
    txt('비산배출 관리 기록', x0, 236, 22, P.text, 'left', 700); mono('LDAR LOG · 2026', x0 + 510 - 30, 236, 12, P.muted, 'right');
    const rows = [['플랜지 F-12', '누출 → 보수 완료'], ['밸브 V-03', '이상 없음'], ['저장탱크 T-2', '포집 설비 정상'], ['공정 배관', '정기 점검 완료']];
    rows.forEach((r, j) => { const a = eout((u - .8 - j * .3) / .35); if (a <= 0) return; alpha(a, () => { const y = 290 + j * 48; line(x0, y + 16, x0 + 480, y + 16, '#16293a', 1);
      txt(r[0], x0, y, 17, '#c9d6dd', 'left', 600); txt(r[1], x0 + 480, y, 17, j === 0 ? P.amber : P.mint, 'right', 600) }) });
    alpha(eout((u - 2.6) / .5), () => { const y = 530; box(x0, y - 4, 480, 52, 'rgba(95,224,181,.1)', 10, P.mint); txt('점검 결과 보고', x0 + 20, y + 29, 19, P.mint, 'left', 700); arrow(x0 + 380, y + 22, x0 + 450, y + 22, P.mint, 3, 12, eout((u - 2.8) / .5)) });
  }
]});
})();
