// 조사분석과 · 대기환경이동측정차량을 활용한 대기질 조사 — 모션그래픽 v2
(() => {
const {W, P, A, c, clamp, lerp, eio, eout, seg, hash, rgba, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, halo, chip, panel, rings, dots, pop, slide, reveal, trace, callout, checklist, burst, badge, shine, spark, lineChart, curve, icon, pin, card, night, blueprint, factory, van, tree, mapGrid} = CINE;
const ITEMS = [['PM-10', 'µg/m³', 46, 0, '#cdc3b3'], ['PM-2.5', 'µg/m³', 24, 0, '#e9d5a0'], ['SO₂', 'ppm', .004, 3, P.mint], ['CO', 'ppm', .5, 1, P.cyan], ['NO₂', 'ppm', .026, 3, P.amber], ['O₃', 'ppm', .041, 3, P.violet]];
const VX = 300, VY = 628, VS = 1.4, MX = VX + 48 * VS;   // 측정 위치에 선 차량과 흡입구 기둥
const LABEL = {label: '수도권대기환경청', sub: '대기환경 이동측정차량'};

// ----- 공용 그림 -----
function school(x, y, s = 1) { const now = CINE.now; c.save(); c.translate(x, y); c.scale(s, s); ell(0, 2, 112, 8, 'rgba(0,0,0,.4)');
  c.fillStyle = grad(0, -104, 0, 0, [[0, '#2a5067'], [1, '#172f40']]); c.fillRect(-98, -104, 196, 104); c.fillStyle = '#35627b'; c.fillRect(-104, -112, 208, 10);
  c.fillStyle = grad(0, -150, 0, 0, [[0, '#33607a'], [1, '#1b3649']]); c.fillRect(-30, -150, 60, 150); poly([[-36, -150], [0, -172], [36, -150]], '#3d6f88');
  circ(0, -128, 11, '#e9f3f6', '#9db8c4', 2); line(0, -128, 0, -135, '#24465a', 2); line(0, -128, 5, -126, '#24465a', 2);
  for (const wx of [-84, -60, 44, 68]) for (const wy of [-90, -56]) { c.fillStyle = `rgba(255,214,140,${(.5 + .12 * Math.sin(now + wx)).toFixed(3)})`; c.fillRect(wx, wy, 16, 20) }
  box(-13, -44, 26, 44, '#10222f', [5, 5, 0, 0]); line(78, -112, 78, -166, '#9db8c4', 2); poly([[78, -166], [104, -159 + Math.sin(now * 3) * 2], [78, -152]], P.mag);
  txt('학교', 0, -66, 18, '#e3eef3', 'center', 700); c.restore() }
function site(now, o = {}) { night(now, {ground: 624, city: .85, ...o});
  factory(790, 624, .85, {now, smoke: true, smokeA: .3, w: 240}); txt('산업단지', 806, 606, 18, '#b4c7d3', 'left', 700); factory(1030, 624, .7, {now, smoke: true, smokeA: .25, w: 200});
  tree(30, 624, .95); school(150, 624, 1); tree(262, 624, 1.05) }
function windSensor(x, y, now) { line(x, y, x, y - 46, '#c8d4db', 3);
  for (let k = 0; k < 3; k++) { const a = now * 6 + k * 2.094, dx = Math.cos(a) * 15, dy = Math.sin(a) * 3; line(x, y - 46, x + dx, y - 46 + dy, '#c8d4db', 2); circ(x + dx, y - 46 + dy, 4.2, '#eef4f7') }
  c.save(); c.translate(x, y - 28); c.rotate(Math.sin(now * .8) * .22); line(-15, 0, 12, 0, '#c8d4db', 2); poly([[11, -5], [22, 0], [11, 5]], P.cyan); poly([[-15, 0], [-23, -6], [-23, 6]], '#c8d4db'); c.restore() }
// 지도 판(기울여 놓은 평면). MP: 판 위 좌표 → 화면 좌표
const MP = (mx, my) => [176 + mx - .2 * my, 196 + .92 * my];
const plate = fn => { c.save(); c.transform(1, 0, -.2, .92, 176, 196); fn(); c.restore() };
const STATIONS = [[60, 60], [505, 55], [55, 375], [515, 385]], ZONES = [[285, 150, 74, '측정망 공백', P.amber], [415, 300, 62, '산업단지', P.mag], [190, 285, 54, '학교 주변', A]];
const ROSE = [.3, .35, .5, .9, .75, .4, .3, .25, .2, .25, .3, .28, .22, .25, .28, .3];
const NO2 = q => .3 + .45 * Math.exp(-Math.pow((q - .35) / .1, 2)) + .05 * Math.sin(q * 30), O3 = q => .2 + .6 * Math.exp(-Math.pow((q - .62) / .14, 2));

CINE.story({
cams: [
  [[0, 526, 370, 1.14], [2.5, 526, 370, 1.14], [3.3, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 560, 400, 1.1], [1.7, 520, 420, 1.2], [3.1, 520, 420, 1.2], [3.9, 600, 360, 1], [4.8, 600, 364, 1.02]],
  [[0, 500, 400, 1.18], [1, 500, 400, 1.18], [2, 600, 360, 1], [4.8, 600, 366, 1.04]],
  [[0, 536, 335, 1.12], [1.9, 536, 335, 1.12], [2.8, 664, 335, 1.12], [3.7, 600, 360, 1], [4.8, 600, 364, 1.03]],
  [[0, 500, 385, 1.2], [1.3, 500, 385, 1.2], [2.3, 600, 360, 1], [4.8, 600, 366, 1.04]]
],
scenes: [
  // 1 지역 선정: 측정소 사이의 빈 곳, 산업단지·학교 주변을 고른다.
  (u, T, now) => {
    blueprint();
    const mk = eout(seg(u, .15, 1));
    alpha(mk, () => { c.save(); c.translate(0, (1 - mk) * 36);
      c.save(); c.transform(1, 0, -.2, .92, 176, 214); box(0, 0, 560, 420, '#030a12', 14, rgba(A, .28), 1.5); c.restore(); halo(400, 420, 420, A, .1);
      plate(() => { mapGrid(0, 0, 560, 420, {block: 93, river: true});
        STATIONS.forEach(([x, y], i) => { const k = eout(seg(u, .9 + i * .12, 1.5 + i * .12)); if (k <= 0) return; circ(x, y, 92 * k, 'rgba(143,179,199,.07)', 'rgba(143,179,199,.3)', 1.2); rings(x, y, now + i * .3, '#8fb3c7', 8, 60, 1, .35, .4 * k) });
        const sw = seg(u, 1, 2); if (sw > 0 && sw < 1) { const x = sw * 560; c.fillStyle = grad(x - 90, 0, x, 0, [[0, rgba(A, 0)], [1, rgba(A, .28)]]); c.fillRect(x - 90, 0, 90, 420); line(x, 0, x, 420, A, 2, 'butt') }
        ZONES.forEach(([x, y, r, s, col], i) => { const k = eout(seg(u, 1.7 + i * .4, 2.3 + i * .4)); if (k <= 0) return; circ(x, y, r * k, rgba(col, .12)); c.save(); c.setLineDash([9, 7]); c.lineDashOffset = -now * 22; circ(x, y, r * k, null, col, 2.6); c.restore() }) });
      STATIONS.forEach(([x, y], i) => { const [sx, sy] = MP(x, y); pop(seg(u, .9 + i * .12, 1.4 + i * .12), sx, sy, () => { halo(sx, sy, 20, '#8fb3c7', .6); circ(sx, sy, 7, '#8fb3c7', '#dbe8ee', 1.5) }) });
      c.restore() });
    pop(seg(u, 1.4, 1.9), 156, 584, () => chip(156, 588, '기존 측정소', '#9bb7c7', 'center', 16));
    ZONES.forEach(([x, y, r, s, col], i) => { const [px, py] = MP(x, y); pin(px, py, col, s, seg(u, 1.9 + i * .4, 2.55 + i * .4), now + i) });
    panel(780, 200, 370, 236, '조사 지역 선정', 'SITE SELECTION', A, seg(u, 2.7, 3.3));
    const [ax, ay] = MP(285, 150), [bx, by] = MP(415, 300), f1 = curve(ax + 16, ay - 36, 782, 286, -50), f2 = curve(bx + 16, by - 36, 782, 392, 46);
    trace(f1, seg(u, 3, 3.5), P.amber, 2, {dash: [6, 7], glow: 6}); trace(f2, seg(u, 3.2, 3.7), P.mag, 2, {dash: [6, 7], glow: 6});
    if (u > 3.45) dots(f1, now, P.amber, 3, 3, .4); if (u > 3.65) dots(f2, now, P.mag, 3, 3, .4);
    reveal('측정소가 없거나', 804, 300, 23, seg(u, 3.2, 3.7), P.text, 'left', 700); reveal('대기질 확인이 필요한 곳', 804, 334, 23, seg(u, 3.45, 3.95), P.text, 'left', 700);
    badge(804, 394, '지자체 요청 지역 포함', '#9bb7c7', seg(u, 3.9, 4.4), {size: 17}); shine(780, 200, 370, 236, seg(u, 4.3, 4.9), 16);
  },
  // 2 차량 배치: 조사 지역에 도착해 흡입구를 올리고 장비를 켠다.
  (u, T, now) => {
    site(now);
    const dk = eout(seg(u, 0, 1.7)), x = lerp(-470, VX, dk), mh = 20 + eio(seg(u, 1.9, 2.8)) * 80, up = seg(u, 1.9, 2.8) >= 1;
    alpha(1 - seg(u, 1.5, 2), () => { c.save(); c.translate(VX + 220, VY + 4); c.scale(1, .22); rings(0, 0, now, A, 40, 240, 3, .6, .7); circ(0, 0, 250, null, rgba(A, .5), 3); c.restore() });
    van(x, VY, VS, {now, spin: (x + 470) / (23 * VS), intake: up, mastH: mh, beam: u < 1.9, ...LABEL});
    callout(MX, VY - (128 + mh) * VS, MX + 62, 262, '흡입구', seg(u, 2.5, 3.1), A, {size: 21});
    const bk = seg(u, 2.9, 3.6), hk = seg(u, 2.7, 3.1);
    pop(hk, 566, 440, () => { line(566, 418, 566, 444, rgba(A, .7), 2); box(470, 352, 192, 66, 'rgba(6,14,24,.94)', 12, A, 1.6); txt('측정 장비', 488, 380, 18, P.text, 'left', 700);
      box(488, 392, 156, 10, '#16293a', 5); glow(A, 8, () => box(488, 392, Math.max(10, 156 * eout(bk)), 10, A, 5)); if (bk >= 1) txt('가동', 644, 380, 18, A, 'right', 700); else mono(Math.round(bk * 100) + '%', 644, 380, 16, P.muted, 'right', 600) });
    burst(566, 385, seg(u, 3.55, 4.1), A, 10, 80);
    if (up) for (let n = 0; n < 6; n++) { const q = (now * .5 + n / 6) % 1; alpha(Math.sin(q * Math.PI), () => circ(MX, lerp(VY - 228 * VS + 14, VY - 122 * VS, q), 2.6, A)) }
    panel(800, 180, 352, 210, '현장 도착 · 측정 준비', 'DEPLOY', A, seg(u, 3.2, 3.8));
    checklist(826, 292, ['흡입구 올리기', '측정 장비 가동'], u, 3.7, {gap: 50, size: 22, col: A});
  },
  // 3 연속 측정: 하루가 지나는 동안 여섯 항목과 기상을 쉬지 않고 잰다.
  (u, T, now) => {
    const ph = clamp(u / 4.8, 0, .999), day = Math.max(0, Math.sin(ph * Math.PI)), sp = seg(ph, .22, .78), sa = Math.sin(sp * Math.PI);
    site(now, {haze: `rgb(${lerp(27, 96, day) | 0},${lerp(34, 128, day) | 0},${lerp(56, 168, day) | 0})`, back: () => {
      const ma = clamp(1 - day * 1.8); if (ma > 0) alpha(ma, () => { halo(660, 214, 100, '#cfe6ff', .35); circ(660, 214, 22, '#e6f1fb'); circ(652, 208, 4, '#c9d9e8'); circ(667, 221, 3, '#c9d9e8') });
      if (sa > 0) { const sx = lerp(130, 770, sp), sy = 430 - sa * 250; halo(sx, sy, 240, P.amber, .45 * sa); halo(sx, sy, 96, '#fff1c9', .8 * sa); alpha(clamp(sa * 2), () => circ(sx, sy, 30, '#ffd98a')) } }});
    if (day > 0) { c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(70,130,200,${(.3 * day).toFixed(3)})`; c.fillRect(0, 0, W, 624); c.restore() }
    for (let i = 0; i < 5; i++) { const q = (now * .22 + i / 5) % 1, yy = 250 + i * 46, x0 = 380 + q * 400; alpha(Math.sin(q * Math.PI) * .55, () => { c.beginPath(); c.moveTo(x0, yy); c.bezierCurveTo(x0 + 26, yy - 9, x0 + 52, yy + 9, x0 + 82, yy); c.strokeStyle = rgba(P.cyan, .7); c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt' }) }
    const sxw = VX + 215 * VS, syw = VY - 126 * VS; windSensor(sxw, syw, now);
    van(VX, VY, VS, {now, intake: true, mastH: 100, ...LABEL});
    const ix = MX, iy = VY - 228 * VS;
    for (let n = 0; n < 18; n++) { const q = (now * .3 + n / 18) % 1, a = hash(n) * 6.2832 + q * 2.2, r = lerp(175, 8, q), col = ITEMS[n % 6][4], px = ix + Math.cos(a) * r, py = iy + Math.sin(a) * r * .72, al = Math.sin(q * Math.PI); halo(px, py, 11, col, .7 * al); alpha(al, () => circ(px, py, 3, col)) }
    for (let n = 0; n < 6; n++) { const q = (now * .5 + n / 6) % 1; alpha(Math.sin(q * Math.PI), () => circ(MX, lerp(iy + 14, VY - 122 * VS, q), 2.6, A)) }
    callout(sxw, syw - 44, sxw + 40, syw - 96, '풍향·풍속', seg(u, 1.6, 2.2), P.cyan, {size: 19});
    panel(800, 150, 352, 440, '연속 측정 · 6개 항목', '24H · 예시', A, seg(u, .7, 1.2));
    ITEMS.forEach((it, i) => { const k = seg(u, .95 + i * .12, 1.4 + i * .12); if (k <= 0) return; const y = 232 + i * 48, v = it[2] * (1 + .16 * Math.sin(ph * 9.4 + i * 1.3) + .04 * Math.sin(now * 1.5 + i));
      slide(k, 30, 0, () => { mono(it[0], 822, y, 19, it[4], 'left', 700); c.save(); c.beginPath(); c.rect(902, y - 22, 80, 28); c.clip(); spark(902, y + 2, 78, 20, q => .5 + .32 * Math.sin(q * 9 + i * 1.7) + .12 * Math.sin(q * 23 + i), ph, it[4], 2); c.restore();
        mono(v.toFixed(it[3]), 1066, y, 20, P.text, 'right', 700); mono(it[1], 1072, y, 16, P.muted, 'left', 500); line(822, y + 16, 1132, y + 16, '#16293a', 1, 'butt') }) });
    alpha(seg(u, 1.5, 1.9), () => { const cx = 846, cy = 548; circ(cx, cy, 22, 'rgba(4,10,18,.6)', '#16293a', 5); c.beginPath(); c.arc(cx, cy, 22, -Math.PI / 2, -Math.PI / 2 + ph * 6.2832); c.strokeStyle = P.amber; c.lineWidth = 5; c.lineCap = 'round'; glow(P.amber, 8, () => c.stroke()); c.lineCap = 'butt';
      const ha = -Math.PI / 2 + ph * 6.2832 * 2; line(cx, cy, cx + Math.cos(ha) * 13, cy + Math.sin(ha) * 13, '#fff', 2.4);
      mono(String(Math.floor(ph * 24)).padStart(2, '0') + ':00', 882, 557, 26, P.amber, 'left', 700); txt('풍향 · 풍속 · 기온', 1132, 556, 16, P.muted, 'right', 600) });
  },
  // 4 자료 분석: 풍향별 농도와 시간대별 변화를 함께 본다.
  (u, T, now) => {
    blueprint();
    panel(60, 160, 520, 440, '풍향별 농도 분포', 'POLLUTION ROSE · 예시', A, seg(u, .3, .9));
    const cx = 320, cy = 405, R = 165, rk = seg(u, .7, 1.3);
    alpha(rk, () => { for (let r = 45; r <= R; r += 40) circ(cx, cy, r * eout(rk), null, 'rgba(140,180,205,.16)', 1); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 'rgba(140,180,205,.08)', 1, 'butt') }
      ['N', 'E', 'S', 'W'].forEach((d, i) => mono(d, cx + Math.cos(-Math.PI / 2 + i * Math.PI / 2) * (R + 20), cy + 6 + Math.sin(-Math.PI / 2 + i * Math.PI / 2) * (R + 20), 16, P.muted, 'center')) });
    ROSE.forEach((v, i) => { const k = eout(seg(u, .95 + i * .07, 1.5 + i * .07)); if (k <= 0) return; const a0 = -Math.PI / 2 + i / 16 * Math.PI * 2 - .17, a1 = a0 + .34, r = R * v * k * (1 + .03 * Math.sin(now * 2 + i)), col = v > .6 ? P.mag : v > .4 ? P.amber : A;
      c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, a1); c.closePath(); c.fillStyle = rgba(col, .78); if (v > .6) glow(col, 14, () => c.fill()); else c.fill(); c.strokeStyle = 'rgba(4,10,18,.7)'; c.lineWidth = 1; c.stroke() });
    const nk = seg(u, .95, 2.3), na = lerp(-Math.PI / 2, -Math.PI / 2 + 3.5 / 16 * Math.PI * 2, eio(nk)) + (nk >= 1 ? Math.sin(now * 2.2) * .05 : 0);
    alpha(seg(u, .9, 1.2), () => { line(cx, cy, cx + Math.cos(na) * (R + 4), cy + Math.sin(na) * (R + 4), 'rgba(255,255,255,.75)', 2); halo(cx + Math.cos(na) * (R + 4), cy + Math.sin(na) * (R + 4), 16, '#fff', .8); circ(cx, cy, 5, '#fff') });
    pop(seg(u, 2.3, 2.8), 500, 250, () => chip(430, 254, '풍향별 농도 차이', P.mag, 'left', 17));
    panel(620, 160, 520, 440, '시간대별 NO₂ · O₃', '예시', A, seg(u, 1.6, 2.2));
    const ck = seg(u, 2, 2.4);
    alpha(ck, () => { [['NO₂', P.amber], ['O₃', P.violet]].forEach(([s, col], i) => { halo(986 + i * 76, 190, 12, col, .8); circ(986 + i * 76, 190, 6, col); txt(s, 998 + i * 76, 196, 17, P.text, 'left', 600) });
      for (let h = 0; h <= 24; h += 6) mono(h + '시', 665 + 435 * h / 24, 568, 16, P.muted, 'center', 500) });
    if (ck > 0) { const k1 = seg(u, 2.3, 3.5), k2 = seg(u, 2.6, 3.8); lineChart(665, 540, 435, 270, NO2, k1, {col: P.amber}); lineChart(665, 540, 435, 270, O3, k2, {col: P.violet, grid: false});
      pop(seg(u, 3.3, 3.7), 665 + 435 * .35, 540 - 270 * NO2(.35), () => chip(665 + 435 * .35, 540 - 270 * NO2(.35) - 18, 'NO₂', P.amber, 'center', 17));
      pop(seg(u, 3.7, 4.1), 665 + 435 * .62, 540 - 270 * O3(.62), () => chip(665 + 435 * .62, 540 - 270 * O3(.62) - 18, 'O₃', P.violet, 'center', 17)) }
    pop(seg(u, 3.9, 4.4), 600, 380, () => { halo(600, 380, 46, A, .5); circ(600, 380, 17, 'rgba(5,14,24,.96)', A, 2); line(592, 380, 608, 380, A, 3); line(600, 372, 600, 388, A, 3) }); burst(600, 380, seg(u, 4.1, 4.7), A, 10, 54);
  },
  // 5 관리 활용: 측정 결과가 관계기관과 대책으로 이어진다.
  (u, T, now) => {
    blueprint();
    const CX = 300, CY = 385, ck = seg(u, .4, 1.1);
    pop(ck, CX, CY, () => { halo(CX, CY, 300, A, .2); c.save(); c.translate(CX, CY); c.rotate(now * .3); c.setLineDash([10, 10]); circ(0, 0, 214, null, rgba(A, .35), 1.6); c.restore();
      glow(A, 22, () => box(CX - 160, CY - 100, 320, 200, 'rgba(6,15,25,.95)', 18, A, 2)); alpha(.08, () => box(CX - 160, CY - 100, 320, 200, A, 18));
      for (let i = 0; i < 9; i++) { const h = 10 + 22 * (.5 + .5 * Math.sin(now * 2 + i * .8)); c.fillStyle = rgba(i % 3 ? A : P.amber, .55); c.fillRect(CX - 128 + i * 30, CY + 82 - h, 16, h) } });
    van(CX - 82, CY - 100, .52, {now, intake: true, mastH: 60, ...LABEL});
    alpha(seg(u, .9, 1.3), () => { disp('측정 결과', CX, CY - 8, 42, P.text, 'center'); txt('지역 대기질 특성', CX, CY + 30, 21, A, 'center', 700) });
    if (u > 1.2) rings(CX, CY, now, A, 170, 300, 2, .3, .25 * seg(u, 1.2, 1.8));
    const out = [['people', '지자체 · 관계기관 공유', A], ['factory', '배출원 관리', P.amber], ['shield', '오존 저감 대책', P.violet], ['doc', '누리집 공개', P.mint]];
    out.forEach(([kind, s, col], i) => { const y = 168 + i * 108, t0 = 1.5 + i * .36, link = curve(CX + 162, CY + (i - 1.5) * 26, 728, y + 42, (i - 1.5) * -16, 22);
      trace(link, seg(u, t0 - .25, t0 + .3), rgba(col, .85), 2, {dash: [7, 7], glow: 6}); if (u > t0 + .3) dots(link, now + i * .23, col, 3, 3.4, .5);
      card(730, y, 410, 84, kind, s, null, col, seg(u, t0, t0 + .5)); shine(730, y, 410, 84, seg(u, 3.4 + i * .22, 3.95 + i * .22)) });
  }
]});
})();
