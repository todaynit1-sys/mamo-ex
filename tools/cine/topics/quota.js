// 대기총량과 · 사업장 총량관리 — 모션그래픽 v2
(() => {
const {P, A, c, clamp, lerp, eio, eout, seg, hash, rgba, shade, box, line, poly, circ, ell, txt, mono, glow, alpha, grad, halo, panel, chip, tick, rings, dots, pop, slide, reveal, trace, burst, shine, counter, night, blueprint, factory, person, curve, icon} = CINE;
const DISP = '"Black Han Sans","IBM Plex Sans KR","Malgun Gothic",sans-serif';
const POLL = [['NOx', P.amber], ['SOx', P.mint], ['먼지', P.violet]], FX = [200, 600, 1000];
// 사업장 세 곳(A·B·C)이 나란히 선 배경
function plants(now, sm) { FX.forEach((cx, i) => { factory(cx - 104, 610, .8, {now: now + i * 1.7, smoke: true, smokeA: sm, w: 260, sh: 110}); txt('ABC'[i] + ' 사업장', cx - 90, 597, 20, '#b4c6d2', 'left', 700) }) }
const note = (s, x, y, col = P.muted) => txt(s, x, y, 16, col, 'left', 600);   // 패널 보조 설명(예시 표기)
// 저녹스버너: (x, y)는 바닥 가운데. k 0→1 동안 불꽃이 주황에서 푸른빛으로 낮고 고르게 바뀐다.
function burner(x, y, k, now) {
  ell(x, y + 2, 152, 9, 'rgba(0,0,0,.45)'); box(x - 112, y - 16, 26, 16, '#22384c', 3); box(x + 86, y - 16, 26, 16, '#22384c', 3);
  box(x - 196, y - 84, 70, 15, '#2a4a60', 5); box(x - 200, y - 90, 10, 27, '#7a97a8', 3);
  c.beginPath(); c.roundRect(x - 130, y - 228, 260, 214, 18); c.fillStyle = grad(x - 130, 0, x + 130, 0, [[0, '#1c3449'], [.3, '#38597a'], [.55, '#2a475f'], [1, '#122434']]); c.fill(); c.strokeStyle = 'rgba(150,200,230,.28)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(x - 112, y - 222, 10, 200);
  const vx = x, vy = y - 94, r = 66; circ(vx, vy, r + 10, '#4d6f88'); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + .39; circ(vx + Math.cos(a) * (r + 5), vy + Math.sin(a) * (r + 5), 2.4, '#9fb9c9') } circ(vx, vy, r, '#04090f');
  c.save(); c.beginPath(); c.arc(vx, vy, r - 2, 0, 6.2832); c.clip(); halo(vx, vy + 34, 130, k > .5 ? P.cyan : P.amber, .55);
  for (let j = 0; j < 6; j++) { const fx = vx - 50 + j * 20, h = (54 + 18 * Math.sin(now * 11 + j * 1.7) * (1 - k * .7)) * lerp(1, .58, k), w = 12;
    for (const [col, a] of [['#ffb547', 1 - k], ['#3de0ff', k]]) if (a > .01) alpha(a, () => { c.beginPath(); c.moveTo(fx - w, vy + 44); c.quadraticCurveTo(fx - w * .7, vy + 44 - h * .5, fx, vy + 44 - h); c.quadraticCurveTo(fx + w * .7, vy + 44 - h * .5, fx + w, vy + 44); c.closePath(); c.fillStyle = grad(0, vy + 44 - h, 0, vy + 44, [[0, rgba(col, .2)], [.55, col], [1, '#ffffff']]); c.fill() }) }
  box(vx - 62, vy + 42, 124, 11, '#5d7f96', 3); c.restore();
  c.beginPath(); c.arc(vx, vy, r - 8, Math.PI * 1.1, Math.PI * 1.45); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 3; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt' }

CINE.story({
cams: [
  [[0, 600, 400, 1.12], [1.3, 600, 400, 1.12], [2.4, 600, 360, 1], [4.8, 600, 366, 1.035]],
  [[0, 430, 400, 1.2], [1.2, 430, 400, 1.2], [2.3, 600, 360, 1], [4.8, 640, 366, 1.04]],
  [[0, 640, 360, 1.08], [1.9, 640, 360, 1.08], [2.5, 720, 335, 1.22], [3.4, 720, 335, 1.22], [4.3, 600, 360, 1]],
  [[0, 600, 360, 1], [1.6, 600, 360, 1], [3.2, 600, 372, 1.08], [4.8, 600, 372, 1.1]],
  [[0, 500, 420, 1.2], [1.6, 530, 428, 1.22], [2.8, 600, 360, 1], [4.8, 600, 366, 1.03]]
],
scenes: [
  // 1 총량 할당: 사업장마다 연도별·오염물질별 배출허용총량이 내려온다.
  (u, T, now) => {
    night(now, {ground: 610, city: .6}); plants(now, .32);
    reveal('연도별 · 오염물질별 배출허용총량', 600, 214, 30, seg(u, 1, 1.6), P.text, 'center', 700);
    const hk = eout(seg(u, 1.3, 1.9)); if (hk > 0) glow(A, 10, () => line(600 - 110 * hk, 231, 600 + 110 * hk, 231, A, 3));
    FX.forEach((cx, i) => { const t0 = 1.6 + i * .22, fy = Math.sin(now * 1.3 + i * 1.9) * 3, feed = curve(600, 233, cx, 251 + fy, cx === 600 ? 0 : -6, 14);
      trace(feed, seg(u, t0 - .2, t0 + .25), rgba(A, .8), 2, {dash: [5, 6], glow: 6}); if (u > t0 + .3) dots(feed, now + i * .3, A, 2, 3, .7);
      pop(seg(u, t0, t0 + .5), cx, 252, () => { box(cx - 112, 250 + fy, 224, 160, 'rgba(6,14,24,.94)', 16, rgba(A, .75), 1.7); alpha(.06, () => box(cx - 112, 250 + fy, 224, 160, A, 16)) }, {from: .7});
      POLL.forEach(([p, col], j) => { const rk = seg(u, t0 + .3 + j * .14, t0 + .8 + j * .14), y = 262 + j * 48 + fy, v = [420, 180, 60][j] - i * 20;
        slide(rk, -22, 0, () => { box(cx - 100, y, 200, 40, rgba(col, .13), 11, rgba(col, .85), 1.4); halo(cx - 82, y + 20, 12, col, .8); circ(cx - 82, y + 20, 5, col); txt(p, cx - 68, y + 27, 20, col, 'left', 700); mono(counter(Math.round(v * eout(rk))) + ' t', cx + 88, y + 27, 20, P.text, 'right', 700) }) });
      pop(seg(u, t0 + 1.3, t0 + 1.7), cx + 106, 252 + fy, () => { circ(cx + 106, 252 + fy, 15, '#0b2a20', P.green, 2); tick(cx + 105, 252 + fy, 1, P.green, .62) }); burst(cx + 106, 252 + fy, seg(u, t0 + 1.45, t0 + 2), P.green, 8, 40);
      shine(cx - 112, 250 + fy, 224, 160, seg(u, t0 + 1.9, t0 + 2.5), 16) });
  },
  // 2 배출량 산정: 가동·연료·자동측정 자료가 모여 누적 배출량이 된다.
  (u, T, now) => {
    night(now, {ground: 610, city: .6});
    factory(50, 610, 1.25, {now, smoke: true, smokeA: .3, w: 330, sx: 262, sh: 170}); txt('A 사업장', 74, 591, 22, '#b4c6d2', 'left', 700);
    const sx = 50 + 262 * 1.25, ty = 322, k = eout(seg(u, 1.7, 4.3)), v = 420 * .78 * k;
    pop(seg(u, .5, 1), sx + 44, ty, () => { rings(sx + 44, ty, now, A, 16, 60, 2, .9, .55); line(sx, ty, sx + 14, ty, '#8eaabb', 4, 'butt'); box(sx + 12, ty - 19, 64, 38, '#0b1824', 7, A, 2); mono('TMS', sx + 44, ty + 7, 19, A, 'center', 700) });
    const stream = curve(sx + 78, ty, 682, 399, -70);
    trace(stream, seg(u, 1, 1.7), rgba(A, .85), 2, {dash: [6, 7], glow: 6}); if (u > 1.6) dots(stream, now, A, 5, 3.4, .45);
    panel(660, 160, 480, 440, '누적 배출량', null, A, seg(u, 1, 1.6)); alpha(eout(seg(u, 1.2, 1.6)), () => note('NOx · 예시', 680, 222));
    [['clock', '가동시간'], ['drop', '연료 사용량'], ['gauge', '자동측정 자료']].forEach(([kind, label], i) => { const y = 252 + i * 62, rk = seg(u, 1.4 + i * .25, 1.9 + i * .25);
      slide(rk, -24, 0, () => { box(682, y, 200, 50, 'rgba(8,18,30,.92)', 12, rgba(A, .6), 1.4); icon(kind, 708, y + 25, 17, A); txt(label, 734, y + 32, 19, P.text, 'left', 700) });
      if (rk >= 1) dots(curve(882, y + 25, 934, 420, 0, 8), now + i * .4, A, 2, 2.6, .9) });
    alpha(eout(seg(u, 1.3, 1.9)), () => { const mx = 936, mw = 168, top = 270, base = 536, hgt = base - top, fh = hgt * .78 * k;
      box(mx, top, mw, hgt, 'rgba(3,8,14,.86)', [4, 4, 14, 14], '#2c4a63', 2);
      for (let j = 1; j < 4; j++) line(mx, base - hgt * j / 4, mx + 14, base - hgt * j / 4, '#3d5d77', 2, 'butt');
      if (fh > 2) { c.save(); c.beginPath(); c.roundRect(mx + 2, top, mw - 4, hgt - 2, [0, 0, 12, 12]); c.clip(); c.beginPath(); c.moveTo(mx, base); c.lineTo(mx, base - fh); for (let x = 0; x <= mw; x += 8) c.lineTo(mx + x, base - fh + Math.sin(x * .07 + now * 3) * 3.5); c.lineTo(mx + mw, base); c.closePath();
        c.fillStyle = grad(0, base - fh, 0, base, [[0, rgba(A, .85)], [1, rgba(A, .28)]]); glow(A, 14, () => c.fill());
        for (let j = 0; j < 7; j++) { const ph = (now * .4 + j / 7) % 1; circ(mx + 16 + hash(j) * (mw - 32), base - ph * fh, 2.5 + hash(j + 3) * 2.5, rgba('#fff3d6', .5 * (1 - ph))) } c.restore() }
      c.save(); c.setLineDash([8, 6]); line(mx - 10, top, mx + mw + 10, top, P.red, 2.5, 'butt'); c.restore(); txt('배출허용총량 420 t', mx + mw, top - 12, 17, P.red, 'right', 700);
      glow('rgba(0,0,0,.9)', 8, () => mono(Math.round(v) + ' t', mx + mw / 2, 432, 38, P.text, 'center', 700)) });
  },
  // 3 자료 확인: 산정결과를 한 줄씩 살피고, 맞지 않는 값은 조정한다.
  (u, T, now) => {
    blueprint();
    const R = [['1분기', '102.4', '102.4'], ['2분기', '98.7', '98.7'], ['3분기', '131.9', '109.2'], ['4분기', '88.1', '88.1']], X0 = 300, C1 = X0 + 400, C2 = X0 + 610, C3 = X0 + 752, TV = [1.5, 1.8, 0, 3.45];
    const flag = seg(u, 2.05, 2.4), fix = seg(u, 2.95, 3.4);
    person(170, 604, 2.1, {now, pose: 'tablet', helmet: false, stripes: false, vest: '#3a6ea8'});
    panel(X0, 165, 840, 430, '배출량 산정결과 검토', null, A, seg(u, .4, 1));
    alpha(eout(seg(u, .7, 1.1)), () => { ['기간', '제출값 (t)', '확인값 (t)', '판정'].forEach((h, j) => txt(h, [X0 + 44, C1, C2, C3][j], 254, 17, P.muted, ['left', 'right', 'right', 'center'][j], 700)); line(X0 + 28, 271, X0 + 812, 271, 'rgba(140,180,205,.25)', 1.5, 'butt') });
    R.forEach((r, j) => { const y = 322 + j * 62, bad = j === 2, rk = seg(u, .9 + j * .15, 1.35 + j * .15), sh = bad && flag > 0 && fix <= 0 ? Math.sin(now * 38) * 3 * (1 - seg(u, 2.05, 2.8)) : 0;
      slide(rk, -26, 0, () => { if (bad && flag > 0) { const col = fix > 0 ? P.mint : P.red; alpha(eout(flag) * (.8 + .2 * Math.sin(now * 4)), () => box(X0 + 22, y - 36, 796, 54, rgba(col, .1), 10, rgba(col, .9), 1.8)) }
        else if (j % 2) box(X0 + 22, y - 36, 796, 54, 'rgba(255,255,255,.022)', 10);
        txt(r[0], X0 + 44, y, 21, P.text, 'left', 700); mono(r[1], C1 + sh, y, 21, bad && flag > 0 ? P.red : P.text, 'right', 600);
        if (!bad) { alpha(seg(u, TV[j], TV[j] + .3), () => mono(r[2], C2, y, 21, P.text, 'right', 600)); tick(C3 - 2, y - 7, seg(u, TV[j] + .1, TV[j] + .5), P.green, .8); burst(C3, y - 7, seg(u, TV[j] + .3, TV[j] + .8), P.green, 8, 34) }
        else { if (fix <= 0) alpha(.6, () => mono('—', C2, y, 21, P.muted, 'right', 600));
          if (flag > 0 && fix <= 0) pop(flag, C3, y - 7, () => icon('warn', C3, y - 7, 17, P.red));
          if (fix > 0) { trace([[C1 - 78, y - 7], [C1 + 4, y - 7]], seg(u, 2.95, 3.2), P.red, 2.5, {head: false, glow: 6}); pop(fix, C2 - 34, y - 7, () => glow(P.mint, 12, () => mono(r[2], C2, y, 21, P.mint, 'right', 700)));
            pop(seg(u, 3.15, 3.55), C3, y - 7, () => chip(C3, y, '조정', P.mint, 'center', 19)); burst(C3, y - 7, seg(u, 3.3, 3.9), P.mint, 10, 50) } } }) });
    const row = u < 1.45 ? 0 : u < 1.75 ? eio(seg(u, 1.45, 1.75)) : u < 2.05 ? 1 + eio(seg(u, 1.75, 2.05)) : u < 3.1 ? 2 : 2 + eio(seg(u, 3.1, 3.4)), la = seg(u, 1.2, 1.45) * (1 - seg(u, 3.75, 4.15));
    alpha(la, () => { const lx = C1 - 38, ly = 322 + row * 62 - 8, pr = 1 + .06 * Math.sin(now * 5); halo(lx, ly, 72, A, .3); circ(lx, ly, 32 * pr, rgba(A, .08), A, 3); line(lx + 23, ly + 23, lx + 44, ly + 44, A, 6) });
    shine(X0, 165, 840, 430, seg(u, 4.05, 4.75), 16);
  },
  // 4 배출권 관리: 여유가 있는 사업장의 총량이 모자란 사업장으로 옮겨 간다.
  (u, T, now) => {
    night(now, {ground: 610, city: .6}); plants(now, .22);
    const mv = eio(seg(u, 2.3, 3.6)), ok = seg(u, 3.6, 4.05);
    const meter = (cx, label, col, r, cap, k, done) => slide(k, 0, -34, () => { const yb = 388, fh = 110 * r * eout(seg(u, 1, 1.7)), cy = yb - cap, bx = cx - 66, bw = 88;
      box(cx - 120, 186, 240, 222, 'rgba(6,14,24,.94)', 16, rgba(col, .8), 1.8); alpha(.06, () => box(cx - 120, 186, 240, 222, col, 16));
      alpha(1 - done, () => txt(label, cx, 224, 21, col, 'center', 700));
      box(bx, yb - 142, bw, 142, 'rgba(3,8,14,.86)', 8, '#27425a', 1.4);
      if (fh > 4) { glow(col, 12, () => { c.beginPath(); c.roundRect(bx + 3, yb - fh, bw - 6, fh - 2, [5, 5, 3, 3]); c.fillStyle = grad(0, yb - fh, 0, yb, [[0, shade(col, .15)], [1, rgba(col, .5)]]); c.fill() });
        if (fh > cap + 1) alpha(.45 + .45 * Math.sin(now * 8), () => box(bx + 3, yb - fh, bw - 6, fh - cap, '#ffb0b0', [5, 5, 0, 0])) }
      glow('rgba(0,0,0,.8)', 6, () => line(bx - 10, cy, bx + bw + 10, cy, '#ffffff', 2.5, 'butt')); txt('허용총량', bx + bw + 16, cy + 6, 16, P.text, 'left', 700) });
    meter(200, '여유', P.mint, .55, lerp(110, 92, mv), seg(u, .5, 1.1), 0); meter(1000, '초과 예상', ok > 0 ? P.mint : P.red, 1.08, lerp(110, 128, mv), seg(u, .7, 1.3), ok);
    pop(ok, 1000, 217, () => { circ(1000, 217, 17, '#0b2a20', P.green, 2); tick(999, 217, 1, P.green, .7) }); burst(1000, 217, seg(u, 3.75, 4.3), P.green, 10, 52);
    reveal('배출권 거래', 600, 226, 44, seg(u, 1.1, 1.7), A, 'center', 400, DISP); reveal('배출허용총량의 이전 · 거래를 관리합니다', 600, 268, 21, seg(u, 1.5, 2.1), P.text, 'center', 700);
    const path = curve(326, 334, 874, 334, -44, 40), gk = seg(u, 1.6, 2.2);
    trace(path, gk, rgba(A, .55), 2, {dash: [6, 8], glow: false, head: false}); if (gk >= 1) poly([[878, 336], [860, 332], [868, 320]], rgba(A, .8));
    for (let j = 0; j < 3; j++) { const q = clamp(seg(u, 2, 3.6) * 1.4 - j * .2); if (q <= 0 || q >= 1) continue; const at = t => { const f = clamp(t) * 40, a = Math.min(39, Math.floor(f)); return [lerp(path[a][0], path[a + 1][0], f - a), lerp(path[a][1], path[a + 1][1], f - a)] }, e = eio(q), [x, y] = at(e);
      for (let n = 1; n <= 4; n++) { const [tx, ty] = at(e - n * .03); halo(tx, ty, 20 - n * 3, A, .35 - n * .07) }
      halo(x, y, 46, A, .6); circ(x, y, 20, '#ffc23d', '#fff0b8', 2); mono('t', x, y + 7, 21, '#3a2400', 'center', 700) }
    if (u > 3.7) dots(path, now, A, 3, 3, .3);
  },
  // 5 저감 지원: 저녹스버너로 바꾸고 운영을 도와 질소산화물을 줄인다.
  (u, T, now) => {
    night(now, {ground: 610, city: .6});
    const k = eout(seg(u, 1.8, 3.6)), BX = 612;
    factory(40, 610, 1.15, {now, smoke: true, smokeA: lerp(.55, .1, k), w: 330, sh: 160}); txt('A 사업장', 62, 592, 22, '#b4c6d2', 'left', 700);
    pop(seg(u, .7, 1.3), BX, 600, () => burner(BX, 600, k, now), {from: .82, dy: 30});
    reveal('저녹스버너', BX, 412, 22, seg(u, 1.5, 2), P.mint, 'center', 700);
    const sw = seg(u, 1.8, 2.6); if (sw > 0 && sw < 1) { c.save(); c.translate(BX, 506); c.rotate(now * 2); c.beginPath(); c.arc(0, 0, 86, 0, 6.2832 * sw); c.strokeStyle = P.mint; c.lineWidth = 4; c.setLineDash([14, 9]); glow(P.mint, 12, () => c.stroke()); c.restore() }
    burst(BX, 506, seg(u, 2.5, 3.1), P.cyan, 14, 124);
    const wk = seg(u, .6, 1.4); person(lerp(300, 432, eout(wk)), 606, 1.95, {now, pose: wk < 1 ? 'walk' : 'tablet', hat: '#eef3f5', vest: '#e8913a'});
    panel(820, 170, 330, 330, '질소산화물 배출', null, P.mint, seg(u, 2, 2.6)); alpha(eout(seg(u, 2.2, 2.6)), () => note('개선 전 → 후 · 예시', 840, 232));
    const b0 = eout(seg(u, 2.4, 2.9)), b1 = eout(seg(u, 2.6, 3.1)), drop = eout(seg(u, 3, 3.9)), base = 452, H0 = 168, h1 = H0 * lerp(1, .45, drop);
    alpha(b0, () => { box(866, base - H0 * b0, 94, H0 * b0, '#3a566e', [6, 6, 2, 2]); txt('개선 전', 913, 482, 19, P.muted, 'center', 700) });
    alpha(b1, () => { glow(P.mint, 14, () => { c.beginPath(); c.roundRect(1008, base - h1 * b1, 94, h1 * b1, [6, 6, 2, 2]); c.fillStyle = grad(0, base - h1, 0, base, [[0, shade(P.mint, .2)], [1, rgba(P.mint, .55)]]); c.fill() }); txt('개선 후', 1055, 482, 19, P.mint, 'center', 700) });
    if (drop > 0) { c.save(); c.setLineDash([6, 6]); line(962, base - H0, 1104, base - H0, 'rgba(180,200,215,.5)', 1.5, 'butt'); c.restore(); const ax = 984; trace([[ax, base - H0 + 8], [ax, base - h1 - 10]], drop, P.mint, 3, {head: false}); poly([[ax, base - h1 + 2], [ax - 8, base - h1 - 12], [ax + 8, base - h1 - 12]], P.mint) }
    slide(seg(u, 3.3, 3.9), 0, 20, () => { box(752, 528, 400, 58, rgba(P.mint, .1), 14, P.mint, 1.6); txt('시설 개선과 기술 지원으로 저감을 돕습니다', 952, 564, 19, P.text, 'center', 700) }); shine(752, 528, 400, 58, seg(u, 4, 4.6), 14);
  }
]});
})();
