// 대기총량과 · HAPs 비산배출시설 — 모션그래픽 v2
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, spring, seg, rgba, box, line, poly, circ, ell, txt, mono, glow, alpha, grad, halo, chip, panel, tick, rings, plume, dots, spark, pop, slide, reveal, typeOn, trace, callout, checklist, burst, stamp, shine,
  night, tank, pipe, flange, person, curve, icon, layer} = CINE;
const SANS = '"IBM Plex Sans KR","Malgun Gothic",sans-serif', GY = 600;
// 새는 지점: 앞의 다섯은 배관 이음부(플랜지), 뒤의 둘은 저장시설 환기구·공정 탑
const LEAKS = [[322, 452], [468, 452], [612, 452], [612, 380], [796, 520], [1020, 462], [800, 330]];

// 공장 전경: 왼쪽 굴뚝(모아서 배출) + 저장탱크 · 배관 · 공정 탑(여기서 새는 것이 비산배출)
function plant(now, leak = 1, sealed = 0) {
  night(now, {ground: GY, city: .7});
  plume(110, 230, now, {col: 'rgba(194,210,218,', a: .5, len: 120, dx: 44, n: 13, r1: 17});
  box(58, 536, 104, 64, '#17324a', 4); c.fillStyle = 'rgba(255,200,116,.6)'; for (let i = 0; i < 3; i++) c.fillRect(72 + i * 28, 556, 12, 12);
  c.fillStyle = grad(96, 0, 124, 0, [[0, '#1b3856'], [.4, '#2b5072'], [1, '#10243a']]); poly([[101, 236], [119, 236], [125, 540], [95, 540]], c.fillStyle); c.fillStyle = '#c95a4e'; c.fillRect(100.5, 250, 19, 10); c.fillStyle = 'rgba(235,242,246,.85)'; c.fillRect(100, 268, 20, 6); box(97, 231, 26, 7, '#33587a', 2);
  if (Math.sin(now * 4) > 0) halo(110, 228, 13, '#ff4a4a', .9);
  pipe([[250, 446], [250, 404], [122, 404]], '#2b5a70', 10);
  tank(250, GY, 1.1); tank(410, GY, .85); tank(1020, GY, .95, '#26435a');
  c.fillStyle = grad(740, 0, 800, 0, [[0, '#15293a'], [.35, '#2b4a60'], [.5, '#3a6079'], [1, '#101f2c']]); c.fillRect(740, 250, 60, 350); ell(770, 250, 30, 8, '#3a6079'); for (let y = 280; y < 600; y += 44) { line(740, y, 800, y, 'rgba(175,195,208,.34)', 2.5, 'butt'); line(740, y + 3, 800, y + 3, 'rgba(0,0,0,.25)', 1.5, 'butt') }
  line(800, 290, 850, 290, '#7a97a8', 3); line(850, 290, 850, 600, '#7a97a8', 3); line(860, 290, 860, 600, '#7a97a8', 3); for (let y = 304; y < 600; y += 22) line(850, y, 860, y, '#7a97a8', 1.5, 'butt');
  pipe([[300, 452], [680, 452], [680, 520], [930, 520], [930, 470], [990, 470]]); pipe([[612, 452], [612, 380], [740, 380]]);
  LEAKS.slice(0, 5).forEach(([x, y]) => flange(x, y, y === 380));
  for (const x of [540, 880]) { const y = x === 540 ? 452 : 520; poly([[x - 11, y - 9], [x + 11, y + 9], [x + 11, y - 9], [x - 11, y + 9]], '#a9bec9'); line(x, y - 9, x, y - 22, '#a9bec9', 3); line(x - 9, y - 22, x + 9, y - 22, '#a9bec9', 3.5) }
  LEAKS.forEach(([x, y], i) => { const a = leak * (1 - sealed); if (a > .02) alpha(a, () => plume(x, y - 6, now, {col: 'rgba(184,147,245,', a: .8, len: 96, dx: 26, n: 12, r0: 3, r1: 13, speed: .6, seed: i * .13, wob: 6})) });
}
// 포집 후드 → 덕트 → 처리시설 (k만큼 설치된 모습)
function capture(k, now) { if (k <= 0) return; const dk = seg(k, 0, .6), uk = seg(k, .5, 1);
  alpha(dk, () => { pipe([[410, 454], [410, 300], [474, 300]], '#2d6e60', 12); poly([[382, 472], [438, 472], [424, 452], [396, 452]], 'rgba(20,60,50,.9)', P.mint, 2) });
  if (dk >= 1) dots([[410, 470], [410, 300], [474, 300]], now, P.mint, 6, 3.4, .55);
  pop(uk, 548, 290, () => { halo(548, 290, 150, P.mint, .22); box(472, 248, 152, 84, '#12362e', 10, P.mint, 2); alpha(.12, () => box(472, 248, 152, 84, P.mint, 10));
    c.save(); c.translate(506, 290); circ(0, 0, 22, '#0b241f', rgba(P.mint, .7), 1.5); c.rotate(now * 5); for (let i = 0; i < 3; i++) { c.rotate(2.094); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -7, 4, -19); c.quadraticCurveTo(-3, -11, 0, 0); c.fillStyle = P.mint; c.fill() } c.restore(); circ(506, 290, 3.5, '#eafff7');
    txt('처리시설', 536, 297, 20, P.mint, 'left', 700) }, {ease: spring});
  if (uk >= 1) for (let i = 0; i < 5; i++) { const ph = (now * .4 + i / 5) % 1; halo(566 + Math.sin(i * 2.4) * 34, 244 - ph * 70, 7, P.mint, .7 * Math.sin(ph * Math.PI)) } }
// 점검 담당자 얼굴(여성, 긴 머리 · 흰 안전모 · 보라색 머리핀)
function portrait(k, now) { if (k <= 0) return; panel(60, 176, 244, 280, '현장 점검 담당자', 'VOC LEAK CHECK', P.violet, k);
  alpha(seg(k, .5, 1), () => { c.save(); c.beginPath(); c.roundRect(76, 246, 212, 196, 10); c.clip(); c.fillStyle = grad(0, 246, 0, 442, [[0, '#14283c'], [1, '#0c1826']]); c.fillRect(76, 246, 212, 196); halo(182, 330, 150, P.violet, .2);
    c.translate(-25, 30 + Math.sin(now * 1.6) * 1.5);
    ell(207, 406, 92, 28, '#244969'); box(148, 348, 118, 95, '#2f6f9a', 22); c.fillStyle = 'rgba(252,247,214,.9)'; c.fillRect(150, 388, 114, 7); box(196, 354, 22, 40, '#e8edf0', 4);
    ell(207, 276, 55, 43, '#75415a'); box(151, 274, 25, 105, '#75415a', 12); circ(163, 372, 19, '#75415a'); box(239, 274, 20, 92, '#75415a', 10); circ(249, 359, 12, '#75415a'); box(151, 306, 22, 7, '#a58bff', 3);
    c.beginPath(); c.moveTo(169, 280); c.quadraticCurveTo(207, 266, 245, 280); c.lineTo(243, 317); c.quadraticCurveTo(237, 346, 207, 351); c.quadraticCurveTo(177, 346, 171, 317); c.closePath(); c.fillStyle = '#f0c9a8'; c.fill();
    poly([[170, 281], [185, 270], [204, 281], [218, 270], [245, 282], [242, 291], [225, 282], [205, 292], [188, 282], [172, 292]], '#75415a');
    line(183, 301, 196, 299, '#573646', 2); line(217, 299, 230, 301, '#573646', 2);
    if (((now * .33) % 1) < .04) { line(186, 306, 194, 306, '#332927', 2); line(219, 306, 227, 306, '#332927', 2) } else { circ(190, 306, 2.9, '#332927'); circ(223, 306, 2.9, '#332927'); circ(191, 305, 1, '#fff'); circ(224, 305, 1, '#fff') }
    circ(181, 320, 5.5, 'rgba(226,130,128,.42)'); circ(232, 320, 5.5, 'rgba(226,130,128,.42)');
    c.beginPath(); c.arc(207, 320, 12, .18, Math.PI - .18); c.strokeStyle = '#9e5b5a'; c.lineWidth = 2.5; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt';
    ell(207, 255, 62, 26, '#eef3f5'); box(145, 254, 124, 10, '#d4e0e5', 4); c.beginPath(); c.arc(196, 252, 40, Math.PI * 1.15, Math.PI * 1.5); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.stroke();
    c.restore() }) }
function bracket(x, y, w, h, k, col) { if (k <= 0) return; const e = back(k), g = 16, dx = (1 - e) * w * .2, dy = (1 - e) * h * .2; alpha(clamp(k * 2), () => { alpha(.07, () => box(x, y, w, h, col, 4));
  for (const [cx, cy, sx, sy] of [[x + dx, y + dy, 1, 1], [x + w - dx, y + dy, -1, 1], [x + dx, y + h - dy, 1, -1], [x + w - dx, y + h - dy, -1, -1]]) { glow(col, 8, () => { line(cx, cy, cx + sx * g, cy, col, 3); line(cx, cy, cx, cy + sy * g, col, 3) }) } }) }

CINE.story({
cams: [
  [[0, 480, 350, 1.25], [1.9, 480, 350, 1.25], [2.9, 700, 350, 1.2], [3.6, 600, 360, 1], [4.8, 600, 362, 1.03]],
  [[0, 520, 400, 1.14], [1.9, 660, 400, 1.14], [2.8, 600, 360, 1], [4.8, 600, 362, 1.03]],
  [[0, 480, 420, 1.1], [1.5, 560, 440, 1.3], [3.2, 590, 440, 1.36], [4.8, 580, 432, 1.28]],
  [[0, 470, 440, 1.25], [1.9, 480, 440, 1.25], [2.9, 520, 380, 1.22], [3.8, 600, 360, 1], [4.8, 600, 362, 1.03]],
  [[0, 600, 360, 1.05], [4.8, 600, 360, 1]]
],
scenes: [
  // 1 비산배출: 굴뚝으로 모아 내보내는 배출과, 시설·공정에서 바로 새는 비산배출을 구분한다.
  (u, T, now) => {
    plant(now, 1);
    if (u > .8) dots([[250, 440], [250, 404], [122, 404], [110, 404], [110, 246]], now, P.cyan, 6, 3.2, .45);
    rings(110, 236, now, P.cyan, 8, 42, 2, .7, .75 * seg(u, .9, 1.4));
    callout(120, 240, 180, 198, '굴뚝·배출구', seg(u, 1, 1.8), P.cyan, {size: 25, sub: '배출구로 모아 배출', text: P.cyan});
    const lk = seg(u, 2, 2.5); LEAKS.forEach(([x, y], i) => rings(x, y, now + i * .2, P.violet, 6, 38, 2, 1, .9 * lk));
    callout(612, 372, 670, 206, '시설·공정의 비산배출', seg(u, 2.2, 3), P.violet, {size: 25, sub: '이음부 등에서 직접 누출', text: P.violet});
    [[468, 410, '배관'], [1020, 430, '저장시설'], [912, 330, '공정']].forEach(([x, y, s], i) => pop(seg(u, 3.4 + i * .22, 3.8 + i * .22), x, y, () => chip(x, y + 4, s, P.violet, 'center', 20)));
  },
  // 2 시설 신고: 대상 시설을 하나씩 파악하고 신고 사항을 확인한다.
  (u, T, now) => {
    plant(now, .5);
    const sx = lerp(100, 1140, eio(seg(u, .5, 1.9))); if (u > .5 && u < 1.95) { c.fillStyle = grad(sx - 110, 0, sx, 0, [[0, rgba(P.amber, 0)], [1, rgba(P.amber, .18)]]); c.fillRect(sx - 110, 190, 110, 410); glow(P.amber, 14, () => line(sx, 190, sx, 600, P.amber, 2.5)) }
    [[190, 438, 120, 164, '저장시설', .95], [296, 424, 396, 54, '배관·밸브', 1.15], [728, 240, 86, 362, '공정시설', 1.38], [964, 458, 112, 144, '저장시설', 1.62, 6]].forEach(([x, y, w, h, s, t0, dy = 0]) => { bracket(x, y, w, h, seg(u, t0, t0 + .4), P.amber);
      pop(seg(u, t0 + .15, t0 + .55), x + w / 2, y - 22, () => chip(x + w / 2, y - 16 + dy, s, P.amber, 'center', 20)) });
    layer(0, () => { const dk = seg(u, 2.1, 2.7); slide(dk, 90, 0, () => { alpha(.5, () => box(858, 166, 290, 250, 'rgba(0,0,0,.6)', 8)); box(850, 156, 290, 250, '#eef3f1', 8); box(850, 156, 290, 40, '#8a5a1a', [8, 8, 0, 0]); txt('비산배출시설 설치·운영 신고', 866, 183, 17, '#fff', 'left', 700);
        ['대상 시설', '설치 신고 사항', '운영 신고 사항'].forEach((s, j) => { const y = 234 + j * 46, a = seg(u, 2.7 + j * .3, 3.1 + j * .3); c.fillStyle = '#dde6e3'; c.fillRect(866, y + 12, 258, 2); alpha(a, () => txt(s, 868, y, 20, '#22343c', 'left', 700)); tick(1106, y - 8, seg(u, 2.9 + j * .3, 3.3 + j * .3), '#1f9d62', .8) }) });
      shine(850, 156, 290, 250, seg(u, 2.7, 3.4), 8); stamp(1088, 368, '확인', seg(u, 3.8, 4.5), '#d8453c', 30, {size: 19}) });
  },
  // 3 누출 점검: 여성 점검 담당자가 휴대용 측정기로 이음부 누출을 확인한다.
  (u, T, now) => {
    plant(now, 1);
    const walking = u < 1.5, px = lerp(300, 522, eio(seg(u, .2, 1.5))), det = seg(u, 1.8, 3), fx = 612, fy = 452, hit = det > .1;
    rings(fx, fy, now, hit ? P.red : P.violet, 6, 46, 3, 1.3, .9); if (hit) halo(fx, fy, 60, P.red, .35 + .15 * Math.sin(now * 8));
    person(px, 606, 2.4, {now, pose: walking ? 'walk' : 'probe', vest: '#2f6f9a', hat: '#eef3f5', woman: true});
    if (!walking) { const by = Math.sin(now * 2.1 + px * .013) * .7 * 2.4, hx = px + 64, hy = 505 - by; line(hx + 4, hy - 6, fx - 7, fy + 9, '#c8d4db', 4); line(hx + 4, hy - 6, fx - 7, fy + 9, 'rgba(255,255,255,.5)', 1.2); halo(fx - 6, fy + 8, 18, P.cyan, .9); circ(fx - 7, fy + 9, 5, P.cyan);
      box(hx - 30, hy - 8, 38, 24, '#152635', 6, hit ? P.red : A, 1.6); alpha(.6 + .4 * Math.sin(now * (hit ? 12 : 4)), () => box(hx - 25, hy - 3, 20, 10, hit ? P.red : A, 2)); burst(fx, fy, seg(u, 1.9, 2.6), P.red, 12, 70) }
    layer(0, () => { portrait(seg(u, .9, 1.5), now);
      const pk = seg(u, 1.6, 2.1); panel(850, 170, 300, 266, '휴대용 VOC 측정기', 'LEAK DETECTION', P.red, pk);
      alpha(seg(pk, .6, 1), () => { const v = 12 + 4800 * eout(det); mono(CINE.counter(Math.round(v)), 1096, 292, 56, v > 500 ? P.red : P.text, 'right', 700); mono('ppm', 1104, 292, 17, P.muted, 'left', 600);
        line(872, 408, 1128, 408, 'rgba(140,180,205,.22)', 1, 'butt'); spark(872, 408, 256, 56, q => q < .6 ? .06 + .03 * Math.sin(q * 40) : .06 + .9 * eout((q - .6) / .3), seg(u, 1.7, 3.1), P.red, 3) });
      pop(seg(u, 3, 3.4), 960, 332, () => chip(872, 338, '누출 확인 · 플랜지', P.red, 'left', 19)); burst(960, 332, seg(u, 3.1, 3.7), P.red, 10, 120) });
  },
  // 4 저감 관리: 새는 곳을 밀폐하고, 포집해 처리한다.
  (u, T, now) => {
    plant(now, 1, eout(seg(u, 1, 2.6)));
    LEAKS.slice(0, 4).forEach(([x, y], i) => { const t0 = 1 + i * .28, k = seg(u, t0, t0 + .45); if (k <= 0) return; circ(x, y, 15 * back(k), rgba(P.mint, .16)); glow(P.mint, 14, () => circ(x, y, 15 * back(k), null, P.mint, 3.5)); burst(x, y, seg(u, t0 + .1, t0 + .7), P.mint, 8, 42);
      pop(seg(u, t0 + .2, t0 + .6), x, y - 36, () => { circ(x, y - 36, 12, 'rgba(6,26,22,.95)', P.mint, 1.6); tick(x - 1, y - 37, 1, P.mint, .6) }) });
    capture(seg(u, 2.1, 3.3), now);
    layer(0, () => { panel(860, 170, 290, 232, '저감 관리', 'SEAL · CAPTURE · TREAT', P.mint, seg(u, .9, 1.4)); ['밀폐', '포집', '처리'].forEach((s, j) => checklist(886, 272 + j * 48, [s], u, [1.4, 2.4, 3.1][j], {size: 23, col: P.mint})) });
  },
  // 5 기록·보고: 점검 결과와 이행 내용을 기록하고 보고한다.
  (u, T, now) => {
    plant(now, .05, 1); capture(1, now);
    layer(0, () => { c.fillStyle = 'rgba(3,7,12,.58)'; c.fillRect(0, 0, W, H) });
    const ik = seg(u, .2, 1); slide(ik, -80, 0, () => person(170, 606, 2.1, {now, pose: 'tablet', vest: '#2f6f9a', hat: '#eef3f5', woman: true}));
    layer(0, () => { const pk = seg(u, .5, 1.1); panel(330, 168, 540, 396, '비산배출 관리 기록', 'LDAR LOG · 2026', A, pk); if (u > 1.1) dots(curve(232, 498, 330, 430, -24, 10), now, A, 3, 3, .8);
      [['플랜지 F-12', '누출 → 보수 완료', P.amber], ['밸브 V-03', '이상 없음', P.mint], ['저장탱크 T-2', '포집 설비 정상', P.mint], ['공정 배관', '정기 점검 완료', P.mint]].forEach(([a, b, col], j) => { const t0 = 1.2 + j * .38, y = 272 + j * 50, k = seg(u, t0, t0 + .4); if (k <= 0) return;
        alpha(k, () => line(354, y + 17, 846, y + 17, '#1b3246', 1, 'butt')); typeOn(a, 374, y, 20, seg(u, t0, t0 + .35), '#d3dfe5', 'left', 600, SANS); circ(360, y - 7, 4, col); reveal(b, 846, y, 20, seg(u, t0 + .25, t0 + .65), col, 'right', 700) });
      const bk = seg(u, 2.9, 3.3), press = 1 - .04 * Math.sin(seg(u, 3.4, 3.7) * Math.PI); pop(bk, 600, 512, () => { c.save(); c.translate(600, 512); c.scale(press, press); c.translate(-600, -512); box(354, 484, 492, 56, 'rgba(95,224,181,.14)', 12, P.mint, 1.8); txt('점검 결과 보고', 378, 520, 21, P.mint, 'left', 700); icon('send', 812, 512, 17, P.mint, {bare: true}); c.restore() }); shine(354, 484, 492, 56, seg(u, 3.3, 3.9), 12);
      const fl = curve(840, 508, 1012, 352, -60, 20), fk = seg(u, 3.6, 4.3); pop(seg(u, 3.1, 3.6), 1012, 300, () => { icon('doc', 1012, 300, 44, P.mint); chip(1012, 376, '보고', P.mint, 'center', 20) }, {ease: spring});
      trace(fl, fk, P.mint, 2, {dash: [6, 7], glow: 6, head: false}); if (fk > 0 && fk < 1) { const [x, y] = fl[Math.round(eio(fk) * 20)]; icon('send', x, y, 15, '#eafff7', {bare: true}); halo(x, y, 26, P.mint, .8) }
      if (fk >= 1) { dots(fl, now, P.mint, 3, 3, .6); pop(seg(u, 4.3, 4.6), 1048, 266, () => { circ(1048, 266, 15, '#0b241f', P.mint, 2); tick(1047, 265, 1, P.mint, .7) }) } burst(1012, 300, seg(u, 4.3, 4.9), P.mint, 14, 90) });
  }
]});
})();
