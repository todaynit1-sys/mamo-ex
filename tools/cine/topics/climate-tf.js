// 기획과 · 수도권 기후에너지 전담반(TF) — 모션그래픽 v2
(() => {
const {P, A, c, W, clamp, lerp, eio, eout, back, spring, seg, hash, rgba, box, line, poly, circ, ell, txt, glow, alpha, grad, halo, panel, chip, tick, rings, dots, pop, slide, reveal, trace, checklist, burst, badge, speech, beam, shine, night, blueprint, person, tree, curve, icon, pin, coin, card, hills} = CINE;

// ----- 공용 그림 -----
function solarHouse(x, y, s = 1, o = {}) { const now = CINE.now, lit = o.lit ?? .65;
  c.save(); c.translate(x, y); c.scale(s, s); ell(0, 2, 98, 8, 'rgba(0,0,0,.42)');
  c.fillStyle = grad(0, -100, 0, 0, [[0, '#2d5672'], [1, '#182f44']]); c.fillRect(-72, -100, 144, 100); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(34, -100, 38, 100);
  poly([[-92, -96], [92, -96], [68, -152], [-68, -152]], '#35627b'); poly([[-92, -96], [92, -96], [90, -89], [-90, -89]], '#13283a'); line(-68, -152, 68, -152, 'rgba(255,255,255,.3)', 2, 'butt');
  const hw = yy => 60 + (yy + 148) * .4;
  for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) { const y0 = -146 + r * 24, y1 = y0 + 21, a = (q - 2) / 2, b = (q - 1) / 2;
    poly([[a * hw(y0) + 2, y0], [b * hw(y0) - 2, y0], [b * hw(y1) - 2, y1], [a * hw(y1) + 2, y1]], r ? '#1c5a8e' : '#236aa3', rgba(A, .85), 1) }
  c.save(); c.beginPath(); c.moveTo(-64, -148); c.lineTo(64, -148); c.lineTo(82, -100); c.lineTo(-82, -100); c.closePath(); c.clip(); const gx = -140 + ((now * .35 + x * .003) % 1) * 300; c.fillStyle = grad(gx, 0, gx + 46, 0, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.4)'], [1, 'rgba(255,255,255,0)']]); c.transform(1, 0, -.5, 1, 0, 0); c.fillRect(gx - 60, -152, 46, 56); c.restore();
  for (const wx of [-54, 22]) { halo(wx + 16, -54, 40, '#ffc46e', .55 * lit); box(wx, -72, 32, 36, rgba('#ffd98a', .3 + .65 * lit), 3); line(wx + 16, -72, wx + 16, -36, 'rgba(18,36,54,.7)', 2, 'butt'); line(wx, -54, wx + 32, -54, 'rgba(18,36,54,.7)', 2, 'butt') }
  box(-14, -62, 28, 62, '#12263a', [4, 4, 0, 0]); circ(8, -30, 2, '#ffc46e'); c.restore() }
function turbine(x, y, s = 1, o = {}) { const now = CINE.now;
  c.save(); c.translate(x, y); c.scale(s, s); ell(0, 2, 26, 5, 'rgba(0,0,0,.42)');
  c.fillStyle = grad(-6, 0, 6, 0, [[0, '#86a8b6'], [.5, '#eaf4f7'], [1, '#7896a6']]); poly([[-6, 0], [6, 0], [3, -160], [-3, -160]], c.fillStyle);
  box(-9, -169, 23, 13, '#dbe8ec', 6); if (Math.sin(now * 3 + x) > .2) halo(6, -172, 11, '#ff5a5a', .9);
  c.translate(-2, -162); c.rotate(now * (o.speed ?? .9) + (o.ph || 0));
  for (let i = 0; i < 3; i++) { c.rotate(Math.PI * 2 / 3); c.beginPath(); c.moveTo(-1, 0); c.quadraticCurveTo(-10, -40, -3, -86); c.lineTo(2, -88); c.quadraticCurveTo(9, -36, 5, 0); c.closePath(); c.fillStyle = grad(0, 0, 0, -88, [[0, '#f4fafb'], [1, '#b6d5de']]); c.fill() }
  circ(0, 0, 7.5, '#f4fafb'); circ(0, 0, 3.2, A); c.restore() }
function pylon(x, y, s = 1, o = {}) { const col = o.col || '#8eaabb'; c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= o.a ?? 1; if (o.dash) c.setLineDash([7, 6]);
  const L = (x1, y1, x2, y2, w = 3) => line(x1, y1, x2, y2, col, w), ys = [0, -55, -110, -165, -215], hw = yy => 46 - 32 * (-yy / 250);
  L(-46, 0, -14, -250, 4); L(46, 0, 14, -250, 4);
  for (let i = 0; i < ys.length - 1; i++) { const a = hw(ys[i]), b = hw(ys[i + 1]); L(-a, ys[i], b, ys[i + 1], 2); L(a, ys[i], -b, ys[i + 1], 2); L(-b, ys[i + 1], b, ys[i + 1], 2.5) }
  L(-86, -215, 86, -215, 5); L(-66, -168, 66, -168, 4); L(-86, -215, -16, -240, 2); L(86, -215, 16, -240, 2); L(0, -250, 0, -270, 3);
  c.setLineDash([]); for (const xx of [-80, 80]) { L(xx, -215, xx, -198, 2); circ(xx, -193, 5, '#9ccbd8') } for (const xx of [-60, 60]) { L(xx, -168, xx, -153, 2); circ(xx, -148, 4.5, '#9ccbd8') }
  c.restore() }
function city(x, y, lit, now) { [[0, 150, 70], [78, 214, 88], [174, 122, 66]].forEach(([dx, h, w], i) => {
  c.fillStyle = grad(0, y - h, 0, y, [[0, '#1d3c55'], [1, '#0f2337']]); c.fillRect(x + dx, y - h, w, h); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x + dx, y - h, 3, h); c.fillStyle = '#274a66'; c.fillRect(x + dx, y - h, w, 4);
  for (let wy = 18; wy < h - 14; wy += 22) for (let wx = 10; wx < w - 14; wx += 18) { const id = hash(i * 31 + wx * 3 + wy), on = lit > id * .92; c.fillStyle = on ? `rgba(255,214,130,${(.78 + .2 * Math.sin(now * 2 + id * 20)).toFixed(3)})` : '#0a1826'; c.fillRect(x + dx + wx, y - h + wy, 10, 13); if (on && id > .55) halo(x + dx + wx + 5, y - h + wy + 6, 18, '#ffc46e', .45) } }) }
// 수도권 지도(0~100 좌표를 기울어진 판 위에 놓는다)
const GG = [[30, 8], [48, 4], [62, 10], [80, 14], [90, 30], [94, 50], [88, 68], [74, 84], [56, 94], [40, 92], [28, 80], [22, 66], [26, 54], [18, 44], [22, 28]];
const SEOUL = [[42, 38], [52, 33], [61, 39], [61, 50], [51, 56], [42, 50]], INCHEON = [[18, 44], [26, 54], [22, 66], [12, 63], [7, 52], [10, 45]];
const MP = (mx, my) => [150 + mx * 5.6 - my * 1.1, 215 + my * 3.9];
const PINS = [[15, 55, '인천', P.cyan], [51, 45, '서울', P.mint], [73, 70, '경기', P.amber]], ISSUES = [['wind', 33, 22, P.cyan], ['grid', 80, 38, P.amber], ['sun', 48, 80, P.amber]];
const mapPath = (pts, dy = 0) => { c.beginPath(); pts.forEach(([mx, my], i) => { const [x, y] = MP(mx, my); i ? c.lineTo(x, y + dy) : c.moveTo(x, y + dy) }); c.closePath() };

CINE.story({
cams: [
  [[0, 420, 400, 1.22], [1.7, 420, 400, 1.22], [2.7, 600, 360, 1], [4.8, 600, 364, 1.035]],
  [[0, 600, 360, 1], [4.8, 770, 400, 1.13]],
  [[0, 500, 400, 1.2], [1.2, 560, 400, 1.2], [2.6, 640, 392, 1.15], [3.6, 700, 384, 1.1], [4.6, 600, 360, 1]],
  [[0, 520, 420, 1.16], [2.1, 540, 420, 1.16], [3.1, 600, 360, 1], [4.8, 600, 366, 1.03]],
  [[0, 600, 372, 1.22], [1.3, 600, 372, 1.22], [2.4, 600, 362, 1], [4.8, 600, 366, 1.04]]
],
scenes: [
  // 1 현안 파악: 수도권 지도 위에 현안이 떠오르고 TF로 모인다.
  (u, T, now) => {
    blueprint();
    alpha(eout(seg(u, .15, 1.2)), () => { mapPath(GG, 20); c.fillStyle = '#04101c'; c.fill(); c.strokeStyle = rgba(A, .22); c.lineWidth = 1.5; c.stroke(); halo(380, 430, 400, A, .12);
      mapPath(GG); c.fillStyle = grad(130, 230, 620, 580, [[0, '#184562'], [1, '#0b2238']]); c.fill();
      c.save(); mapPath(GG); c.clip(); const o = (now * 8) % 44; for (let i = -4; i < 17; i++) line(60 + i * 44 + o, 220, -60 + i * 44 + o, 600, rgba(A, .09), 1, 'butt'); for (let j = 0; j < 9; j++) line(100, 240 + j * 44, 660, 240 + j * 44, rgba(A, .09), 1, 'butt');
      const [cx, cy] = MP(52, 48), ang = now * 1.2; for (let i = 0; i < 14; i++) { const a = ang - i * .05; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 430, cy + Math.sin(a) * 300); c.lineTo(cx + Math.cos(a - .05) * 430, cy + Math.sin(a - .05) * 300); c.closePath(); c.fillStyle = rgba(A, .14 * (1 - i / 14)); c.fill() }
      c.restore() });
    trace(GG.concat([GG[0]]).map(([mx, my]) => MP(mx, my)), seg(u, .1, 1.25), A, 2.5);
    alpha(eout(seg(u, .9, 1.4)), () => { mapPath(SEOUL); c.fillStyle = rgba(P.mint, .22); c.fill(); c.strokeStyle = rgba(P.mint, .9); c.lineWidth = 1.6; c.stroke(); mapPath(INCHEON); c.fillStyle = rgba(P.cyan, .2); c.fill(); c.strokeStyle = rgba(P.cyan, .9); c.stroke() });
    ISSUES.forEach(([kind, mx, my, col], i) => { const [x, y] = MP(mx, my); pop(seg(u, 1.9 + i * .2, 2.4 + i * .2), x, y, () => { rings(x, y, now + i * .37, col, 22, 46, 2, .7, .5); icon(kind, x, y, 21, col) }) });
    PINS.forEach(([mx, my, label, col], i) => { const [x, y] = MP(mx, my); pin(x, y, col, label, seg(u, 1.15 + i * .25, 1.8 + i * .25), now + i) });
    panel(780, 170, 360, 420, '기후에너지 TF', '수도권대기환경청', P.mint, seg(u, 2, 2.6));
    const [sx, sy] = MP(51, 45), [gx, gy] = MP(73, 70), f1 = curve(sx + 14, sy - 34, 800, 316, -70), f2 = curve(gx + 14, gy - 34, 800, 454, 60);
    trace(f1, seg(u, 2.5, 3.1), P.cyan, 2, {dash: [6, 7], glow: 6}); trace(f2, seg(u, 3, 3.6), P.mint, 2, {dash: [6, 7], glow: 6});
    if (u > 3.05) dots(f1, now, P.cyan, 4, 3, .4); if (u > 3.55) dots(f2, now, P.mint, 4, 3, .4);
    card(804, 262, 312, 108, 'talk', '현장 목소리', '지역 현안을 듣고 정리', P.cyan, seg(u, 2.8, 3.3));
    card(804, 402, 312, 108, 'check', '대응 과제', '협력이 필요한 문제 선별', P.mint, seg(u, 3.3, 3.8));
    if (u > 3.6) dots([[960, 372], [960, 400]], now, P.mint, 2, 3, .9); shine(804, 402, 312, 108, seg(u, 3.9, 4.5));
  },
  // 2 주민 소통: 사업 초기부터 주민·지자체와 마주 앉는다.
  (u, T, now) => {
    night(now, {ground: 610, city: .5, glow: 'rgba(61,224,255,.12)'});
    tree(86, 610, 1.3); solarHouse(210, 610, 1.22, {lit: .75}); turbine(430, 610, 1.1); tree(338, 610, .95);
    reveal('사업 초기부터 함께 논의', 620, 214, 38, seg(u, 1.05, 1.65), P.text, 'left', 700);
    const ul = eout(seg(u, 1.4, 2)); if (ul > 0) glow(A, 8, () => line(622, 230, 622 + 150 * ul, 230, A, 3));
    reveal('우려를 듣고 해결 방향을 함께 찾습니다', 620, 268, 24, seg(u, 3.4, 4), P.mint, 'left', 700);
    const folk = [[650, 520, '#3a86a8', {woman: true, helmet: false, stripes: false, pose: 'wave'}, '주민 의견', P.cyan, 'talk', 1.7], [840, 1300, '#e8913a', {pose: 'tablet', hat: '#eef3f5'}, '대안', P.mint, 'bulb', 2.9], [1030, 1340, '#8a5a86', {helmet: false, stripes: false, pose: 'point', flip: true}, '지역 여건', P.amber, 'map', 2.2]];
    folk.forEach(([x, from, vest, o, label, col, kind, t0], i) => { const k = seg(u, .3 + i * .2, 1.15 + i * .2), px = lerp(from, x, eout(k)); person(px, 606, 2.3, Object.assign({now: now + i, vest}, o, k < 1 ? {pose: 'walk'} : null));
      const bk = seg(u, t0, t0 + .5), by = 300 + Math.sin(now * 1.6 + i) * 4; speech(x - 88, by, 176, 62, bk, col, {tailX: 88});
      pop(bk, x, by + 62, () => { icon(kind, x - 58, by + 31, 19, col); txt(label, x - 30, by + 39, 22, P.text, 'left', 700) }); burst(x, by + 31, seg(u, t0 + .25, t0 + .8), col, 10, 110) });
    if (u > 3.3) { const a = seg(u, 3.3, 3.7); alpha(a, () => { dots([[742, 331], [750, 331]], now, P.cyan, 1, 3, .001); dots([[738, 331], [752, 331]], now, P.cyan, 2, 3.2, .9); dots([[942, 331], [928, 331]], now, P.amber, 2, 3.2, .9) }) }
  },
  // 3 전력망 조정: 막힌 구간의 갈등을 조정해 전기가 흐르게 한다.
  (u, T, now) => {
    night(now, {ground: 610, skyline: false, glow: 'rgba(61,224,255,.1)', back: () => hills(610)});
    const rk = seg(u, 2.7, 3.5), done = eout(seg(u, 2.6, 3)), S = [300, 446], P1L = [404, 427], P1R = [556, 427], P2L = [644, 427], P2R = [796, 427], C = [908, 474], MID = [600, 449];
    solarHouse(150, 610, 1); turbine(300, 610, 1.02, {speed: 1.3}); city(905, 610, seg(u, 3.5, 4.5), now);
    box(884, 560, 22, 50, '#1b3449', 3); line(895, 560, 895, 474, '#8eaabb', 3); circ(908, 474, 5, '#9ccbd8');
    pylon(480, 610, .95); pylon(720, 610, .95, {a: lerp(.4, 1, done), dash: done < .5});
    const a1 = curve(S[0], S[1], P1L[0], P1L[1], 10, 10), a2 = curve(P1R[0], P1R[1], P2L[0], P2L[1], 24, 14), a3 = curve(P2R[0], P2R[1], C[0], C[1], 18, 12), b2 = curve(540, 469, 660, 469, 22, 12);
    trace(a1, seg(u, .5, 1.1), P.cyan, 2.5, {glow: 8}); alpha(.35, () => { trace(a2, 1, '#8eaabb', 1.6, {dash: [6, 7], glow: false, head: false}); trace(a3, 1, '#8eaabb', 1.6, {dash: [6, 7], glow: false, head: false}); trace(b2, 1, '#8eaabb', 1.4, {dash: [6, 7], glow: false, head: false}) });
    trace(a2, seg(u, 2.8, 3.25), P.cyan, 2.5, {glow: 8}); trace(b2, seg(u, 2.85, 3.3), rgba(P.cyan, .7), 2, {glow: 6}); trace(a3, seg(u, 3.2, 3.6), P.cyan, 2.5, {glow: 8});
    if (u > 1.05) dots(u < 3.25 ? a1.concat([P1R], a2.slice(0, 7)) : a1.concat([P1R], a2, [P2R], a3), now, P.cyan, u < 3.25 ? 4 : 8, 3.6, u < 3.25 ? .55 : .3);
    pop(seg(u, .8, 1.3), 222, 330, () => chip(222, 334, '재생에너지', P.cyan, 'center', 20)); pop(seg(u, 1, 1.5), 480, 322, () => chip(480, 326, '전력망', P.amber, 'center', 20)); pop(seg(u, 3.5, 4), 1014, 370, () => chip(1014, 374, '수요 지역', P.text, 'center', 20));
    // 갈등 → 조정
    const wk = seg(u, 1.3, 1.8), wx = MID[0], wy = 398;
    if (done < 1) alpha(1 - done, () => pop(wk, wx, wy, () => { rings(wx, wy, now, P.red, 30, 70, 2, 1, .6); halo(wx, wy, 80, P.red, .45); poly([[wx, wy - 34], [wx + 34, wy + 24], [wx - 34, wy + 24]], 'rgba(40,8,10,.95)', P.red, 3); txt('!', wx, wy + 15, 34, P.red, 'center', 700); chip(wx, wy - 52, '갈등·지연', P.red, 'center', 20) }));
    const mk = seg(u, 1.9, 2.7); if (mk > 0 && done < 1) alpha(1 - done, () => { c.save(); c.translate(wx, wy); c.rotate(now * 1.5); c.setLineDash([12, 9]); c.beginPath(); c.arc(0, 0, 58, 0, 6.2832 * mk); c.strokeStyle = P.mint; c.lineWidth = 3; glow(P.mint, 10, () => c.stroke()); c.restore() });
    reveal('관계기관과 대안을 협의합니다', 600, 222, 32, seg(u, 1.8, 2.4), P.mint, 'center', 700);
    pop(seg(u, 2.6, 3.1), wx, wy, () => { halo(wx, wy, 90, P.mint, .5); circ(wx, wy, 34, 'rgba(6,26,22,.96)', P.mint, 3); tick(wx - 2, wy, seg(u, 2.75, 3.15), P.mint, 1.2); chip(wx, wy - 52, '조정 방안', P.mint, 'center', 20) }, {ease: spring}); burst(wx, wy, seg(u, 2.7, 3.3), P.mint, 14, 96);
  },
  // 4 소득마을 지원: 햇빛과 바람이 마을의 소득이 되도록 입지와 준비를 돕는다.
  (u, T, now) => {
    night(now, {ground: 610, city: .32, glow: 'rgba(255,181,71,.2)', haze: '#2b2542'});
    const sk = eout(seg(u, .2, 1.3)), sx = 566, sy = lerp(340, 262, sk), on = seg(u, 1, 1.6);
    alpha(sk, () => { halo(sx, sy, 210, P.amber, .5); halo(sx, sy, 90, '#fff1c9', .85); circ(sx, sy, 34, '#ffd27a'); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + now * .25, r = 62 + 7 * Math.sin(now * 3 + i); line(sx + Math.cos(a) * 46, sy + Math.sin(a) * 46, sx + Math.cos(a) * r, sy + Math.sin(a) * r, P.amber, 3) } });
    alpha(on * (.75 + .25 * Math.sin(now * 2)), () => { beam(sx, sy, Math.atan2(446 - sy, 200 - sx), 430, 50, '#ffd27a', .2); beam(sx, sy, Math.atan2(480 - sy, 430 - sx), 290, 40, '#ffd27a', .18) });
    turbine(770, 610, .72, {speed: 1.5, ph: 1}); tree(60, 610, 1.1); solarHouse(196, 610, 1.2, {lit: .4 + .5 * on}); solarHouse(424, 610, .95, {lit: .4 + .5 * on}); turbine(652, 610, 1.15, {speed: 1.7});
    for (let i = 0; i < 6; i++) { const ph = (now * .5 + i / 6) % 1, yy = 368 + i * 30, x0 = 480 + ph * 330; alpha(Math.sin(ph * Math.PI) * on * .9, () => { c.beginPath(); c.moveTo(x0, yy); c.bezierCurveTo(x0 + 30, yy - 12, x0 + 62, yy + 12, x0 + 96, yy); c.strokeStyle = rgba(P.cyan, .75); c.lineWidth = 2.6; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt' }) }
    pop(seg(u, 1.1, 1.6), sx + 92, sy - 26, () => chip(sx + 60, sy - 22, '햇빛', P.amber, 'left', 20)); pop(seg(u, 1.3, 1.8), 742, 392, () => chip(742, 396, '바람', P.cyan, 'center', 20));
    reveal('햇빛·바람 소득마을', 90, 262, 36, seg(u, 1.05, 1.65), P.mint, 'left', 700);
    [[196, 424], [424, 462], [652, 404]].forEach(([x, y], i) => { for (let j = 0; j < 2; j++) { const ph = (now * .42 + i * .31 + j * .5) % 1; if (u > 1.7) coin(x + Math.sin(ph * 5 + i) * 10, y - ph * 78, 13 * back(clamp(ph * 5)), Math.sin(ph * Math.PI)) } });
    const pk = seg(u, 1.9, 2.5); if (pk > 0) { alpha(1 - seg(u, 2.2, 2.6), () => { c.save(); c.translate(540, 606); c.scale(1, .3); circ(0, 0, 150 * eout(seg(u, 1.7, 2.3)), null, rgba(P.mint, .8), 4); c.restore() }); pin(540, 604, P.mint, '입지 발굴', pk, now) }
    panel(850, 196, 292, 256, '현장 지원', '햇빛·바람 소득마을', P.mint, seg(u, 2.5, 3.1));
    checklist(876, 306, ['입지 발굴', '주민 참여', '사업 준비 지원'], u, 3, {gap: 50, size: 22, col: P.mint});
  },
  // 5 협의·개선: 관계기관이 한자리에 모여 개선 과제로 잇는다.
  (u, T, now) => {
    blueprint();
    const HX = 600, HY = 372, nodes = [[262, 228, '수도권대기환경청', A, 'talk'], [262, 516, '지자체', P.mint, 'home'], [938, 228, '한국전력', P.amber, 'grid'], [938, 516, '에너지공단', P.violet, 'sun']];
    nodes.forEach(([x, y, label, col, kind], i) => { const sxn = x < HX ? -1 : 1, syn = y < HY ? -1 : 1, link = [[x - sxn * 140, y - syn * 14], [HX + sxn * 104, HY + syn * 56]], lk = seg(u, 1.3 + i * .12, 1.9 + i * .12);
      trace(link, lk, rgba(col, .8), 2, {dash: [7, 7], glow: 6}); if (lk >= 1) dots(link, now + i * .2, col, 3, 3.4, .55);
      const k = seg(u, .35 + i * .16, 1.1 + i * .16), e = spring(k); c.save(); c.translate(sxn * 300 * (1 - e), syn * 130 * (1 - e)); c.globalAlpha *= clamp(k * 3);
      box(x - 140, y - 42, 280, 84, 'rgba(7,16,27,.96)', 16, col, 1.8); alpha(.1, () => box(x - 140, y - 42, 280, 84, col, 16)); icon(kind, x - 96, y, 24, col); txt(label, x - 58, y + 8, 22, P.text, 'left', 700); c.restore() });
    pop(seg(u, .6, 1.4), HX, HY, () => { halo(HX, HY, 230, A, .32); circ(HX, HY, 96, 'rgba(8,24,40,.96)', A, 2.5);
      c.save(); c.translate(HX, HY); c.rotate(now * .4); c.setLineDash([10, 9]); circ(0, 0, 112, null, rgba(A, .6), 2); c.setLineDash([]); for (let i = 0; i < 3; i++) { const a = i * 2.094; halo(Math.cos(a) * 112, Math.sin(a) * 112, 13, A, .9); circ(Math.cos(a) * 112, Math.sin(a) * 112, 4, '#fff') } c.restore();
      c.save(); c.translate(HX, HY); c.rotate(-now * .25); c.setLineDash([3, 12]); circ(0, 0, 130, null, rgba(P.mag, .45), 1.6); c.restore() }, {ease: spring});
    reveal('현장 현안', HX, HY - 2, 29, seg(u, 1.2, 1.7), P.text, 'center', 700); reveal('협의·조정', HX, HY + 34, 23, seg(u, 1.5, 2), A, 'center', 700);
    if (u > 3.3) rings(HX, HY, now, P.mint, 100, 330, 2, .32, .3 * seg(u, 3.3, 3.8));
    const ak = seg(u, 2.7, 3.15); trace([[HX, 506], [HX, 542]], ak, P.mint, 3.5); if (ak > .6) poly([[HX, 552], [HX - 9, 538], [HX + 9, 538]], P.mint);
    badge(HX, 578, '개선 과제 연결', P.mint, seg(u, 3.05, 3.55), {al: 'center', size: 23}); burst(HX, 578, seg(u, 3.3, 3.9), P.mint, 14, 84);
  }
]});
})();
