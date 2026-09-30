// 자동차관리과 · 도로 재비산먼지 저감
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, truck, car, person, spark, gauge, mapGrid, tree} = CINE;
const GRAINS = Array.from({length: 160}, (_, i) => ({x: CINE.hash(i) * W, y: 610 + CINE.hash(i + 50) * 100, r: 1.2 + CINE.hash(i + 9) * 2.2}));
function street(now, dust = 1, speed = 0, clear = 0) { night(now, {ground: 590, city: 1, glow: clear ? 'rgba(95,224,181,.12)' : 'rgba(255,181,71,.14)', gridSpeed: speed});
  c.fillStyle = '#10171f'; c.fillRect(0, 600, W, 120); c.fillStyle = '#1e2a33'; c.fillRect(0, 596, W, 8); const off = -((now * speed * 300) % 160);
  c.fillStyle = '#4a5a64'; for (let x = off - 160; x < W + 160; x += 160) c.fillRect(x, 660, 80, 4);
  for (const g of GRAINS) { if (CINE.hash(g.x) > dust) continue; const x = ((g.x + off * .999) % W + W) % W; circ(x, g.y, g.r, 'rgba(214,196,160,.7)') } }
function cloud(x, y, now, k, n = 26, col = '214,196,160') { for (let i = 0; i < n; i++) { const q = (now * .5 + i / n) % 1; circ(x - q * 160 + Math.sin(i * 3) * 20, y - q * 150 * k, 4 + q * 16 * k, `rgba(${col},${(.5 * k * (1 - q)).toFixed(2)})`) } }
function sweeper(x, y, s, now, on = 1) { c.save(); c.translate(x, y); c.scale(s, s); ell(150, 4, 160, 7, 'rgba(0,0,0,.5)');
  box(0, -130, 210, 104, '#e9eef0', 10); box(210, -110, 90, 84, '#d6e0e5', [4, 18, 4, 4]); poly([[222, -100], [270, -100], [290, -70], [222, -70]], '#10202c'); c.fillStyle = P.mint; c.fillRect(0, -44, 300, 8);
  txt('노면 청소차', 105, -70, 18, '#10202c', 'center', 700);
  for (const wx of [60, 250]) { circ(wx, -18, 20, '#05080c'); circ(wx, -18, 8, '#8f9ea8') }
  // brushes + vacuum + spray
  for (let k = 0; k < 2; k++) { const bx = 120 + k * 60; ell(bx, -6, 26, 8, '#6c7f8c'); for (let j = 0; j < 6; j++) { const a = now * 10 + j; line(bx, -6, bx + 26 * Math.cos(a), -6 + 8 * Math.sin(a), P.mint, 2) } }
  if (on) for (let j = 0; j < 14; j++) { const q = (now * 1.2 + j / 14) % 1; circ(300 + q * 60, -30 + q * 26 + Math.sin(j) * 6, 2.5, `rgba(120,200,255,${(.8 * (1 - q)).toFixed(2)})`) }
  c.restore() }
CINE.story({scenes: [
  // 1 먼지 쌓임
  (u, T, now) => {
    const d = .25 + .75 * eout(u / 3); street(now, d);
    for (let i = 0; i < 22; i++) { const q = (now * .6 + i / 22) % 1; circ(80 + i * 50, lerp(560, 640, q), 2, `rgba(214,196,160,${(.6 * (1 - q)).toFixed(2)})`) }
    alpha(eout((u - .8) / .5), () => { panel(820, 150, 340, 250, '도로 위 먼지', 'ROAD DUST', P.amber); ['타이어 · 브레이크 마모', '공사장 토사', '대기 중 먼지 침적'].forEach((s, j) => { circ(848, 238 + j * 44, 5, P.amber); txt(s, 864, 244 + j * 44, 17, P.text, 'left', 600) }) });
  },
  // 2 다시 날림
  (u, T, now) => {
    street(now, 1, .9); const cx = ((now * 360) % (W + 400)) - 200;
    car(cx, 650, 1.4, '#c24d62', {spin: now * 360 / 14}); cloud(cx, 640, now, 1); truck(((now * 260 + 600) % (W + 500)) - 300, 700, 1, {now, spin: now * 6, exhaust: false}); cloud(((now * 260 + 600) % (W + 500)) - 300, 690, now + .5, .8);
    alpha(eout((u - .6) / .5), () => { panel(820, 150, 340, 240, 'PM-10', 'µg/m³ · 예시', P.amber); const v = lerp(40, 96, eout((u - .7) / 2)); gauge(990, 310, 72, v / 150, v > 80 ? P.amber : A, v > 80 ? '나쁨' : '보통', Math.round(v)) });
  },
  // 3 저감사업 (map dispatch)
  (u, T, now) => {
    CINE.blueprint(); mapGrid(80, 150, 640, 470, {block: 110});
    const R = [[[100, 260], [700, 260]], [[300, 170], [300, 600]], [[520, 480], [700, 480]], [[100, 480], [520, 480]]];
    R.forEach(([a, b], i) => { const k = eout((u - .3 - i * .3) / .6); if (k <= 0) return; glow(P.mint, 16, () => line(a[0], a[1], lerp(a[0], b[0], k), lerp(a[1], b[1], k), P.mint, 8)) });
    for (let i = 0; i < 3; i++) { const q = (now * .15 + i / 3) % 1; glow('#fff', 12, () => circ(lerp(100, 700, q), 260, 7, '#fff')) }
    alpha(eout((u - 1.4) / .5), () => { panel(770, 180, 390, 290, '재비산먼지 저감사업', 'ROAD DUST PROGRAM', P.mint); [['집중관리도로 지정', P.mint], ['청소차 운행 지원', A], ['청소 효과 확인', P.amber]].forEach(([s, col], j) => { circ(800, 268 + j * 56, 6, col); txt(s, 818, 274 + j * 56, 18, P.text, 'left', 600) }) });
  },
  // 4 도로 청소
  (u, T, now) => {
    const x = lerp(-320, 460, eio(u / 4.2)); street(now, 1, 0);
    // cleaned area behind sweeper: overdraw clean asphalt
    c.fillStyle = '#10171f'; c.fillRect(0, 604, Math.max(0, x + 120), 116); for (let xx = -160; xx < x + 120; xx += 160) { c.fillStyle = '#4a5a64'; c.fillRect(xx, 660, 80, 4) }
    c.fillStyle = 'rgba(120,200,255,.08)'; c.fillRect(0, 604, Math.max(0, x + 120), 116);
    sweeper(x, 690, 1.3, now);
    for (let j = 0; j < 18; j++) { const q = (now * 1.6 + j / 18) % 1; circ(x + 160 + 60 * (1 - q), 680 - 40 * q, 2.4, `rgba(214,196,160,${(.8 * (1 - q)).toFixed(2)})`) }
    alpha(eout((u - .8) / .5), () => { box(820, 170, 340, 120, 'rgba(6,13,22,.9)', 14, P.mint); txt('흡입 · 살수 청소', 842, 212, 22, P.mint, 'left', 700); txt('쌓인 먼지를 빨아들이고 물로 씻습니다', 842, 248, 15, P.text, 'left', 600) });
  },
  // 5 생활환경
  (u, T, now) => {
    street(now, 0, .3, 1); for (let i = 0; i < 6; i++) tree(80 + i * 220, 596, 1.2);
    person(360, 690, 1.6, {now, pose: 'walk', helmet: false, vest: '#4a6fa8'}); person(470, 700, 1.3, {now: now + 1, pose: 'walk', helmet: false, vest: '#c77d3a'});
    car(((now * 200) % (W + 300)) - 200, 668, 1.3, '#4d7bd6', {spin: now * 200 / 14});
    alpha(eout((u - .4) / .5), () => { panel(820, 150, 340, 260, 'PM-10', '청소 후 · 예시', P.mint); const v = lerp(96, 38, eout((u - .5) / 1.8)); gauge(990, 310, 72, v / 150, v > 80 ? P.amber : P.mint, v > 80 ? '나쁨' : '보통', Math.round(v)) });
    alpha(eout((u - 2) / .5), () => disp('깨끗한 도로, 맑은 공기', 400, 200, 34, P.text, 'center'));
  }
]});
})();
