// 자동차관리과 · 운행차 배출가스 저감
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, cross, arrow, dashed, rings, plume, dots,
  night, truck, car, person, doc, spark, gauge} = CINE;
function road(now, speed = 0) { night(now, {ground: 600, city: 1, gridSpeed: speed}); c.fillStyle = '#0a121a'; c.fillRect(0, 600, W, 120); const off = -((now * speed * 300) % 140); c.fillStyle = '#3a5264'; for (let x = off - 140; x < W + 140; x += 140) c.fillRect(x, 660, 70, 4) }
function excavator(x, y, s, now, newEngine = 0) { c.save(); c.translate(x, y); c.scale(s, s); ell(0, 4, 150, 8, 'rgba(0,0,0,.45)');
  box(-140, -40, 280, 40, '#1b2530', 16); for (let i = 0; i < 7; i++) circ(-120 + i * 40, -20, 14, '#2d3a46');
  box(-110, -130, 200, 90, '#e0a93a', 10); box(20, -200, 80, 72, '#e0a93a', 8); box(30, -190, 58, 44, '#10202c', 4);
  const arm = Math.sin(now * 1.5) * .15; c.save(); c.translate(90, -150); c.rotate(-.6 + arm); box(0, -12, 180, 24, '#d49a2c', 6); c.translate(180, 0); c.rotate(1.3 + arm); box(0, -9, 120, 18, '#d49a2c', 5); c.translate(120, 0); poly([[0, -20], [40, 0], [0, 30]], '#8c6a2a'); c.restore();
  // engine bay
  box(-100, -120, 90, 70, newEngine > .5 ? '#123a2f' : '#3a2a20', 6, newEngine > .5 ? P.mint : '#7a5a40', 2); txt(newEngine > .5 ? '신형 엔진' : '구형 엔진', -55, -78, 13, newEngine > .5 ? P.mint : '#d0b090', 'center', 700);
  c.restore() }
CINE.story({scenes: [
  // 1 노후 차량
  (u, T, now) => {
    road(now, .8); truck(lerp(-80, 380, eout(u / 2.4)), 640, 1.35, {now, old: true, smoke: true, spin: now * 5, label: '노후 경유차'});
    for (let i = 0; i < 26; i++) { const q = (now * .4 + i / 26) % 1; circ(lerp(380, -100, q) + Math.sin(i) * 30, 560 - q * 200 + Math.sin(i * 3) * 30, 3 + q * 4, `rgba(30,30,34,${(.7 * (1 - q)).toFixed(2)})`) }
    alpha(eout((u - 1) / .5), () => { panel(820, 150, 340, 240, '배출가스', 'PM · NOx', P.red); gauge(990, 310, 76, .86, P.red, '입자상 물질', '높음') });
  },
  // 2 조기폐차
  (u, T, now) => {
    night(now, {ground: 620, city: .7}); const lift = eio(clamp((u - .6) / 1.4));
    // crane
    line(700, 620, 700, 150, '#e0a93a', 12); line(700, 160, 380, 160, '#e0a93a', 10); line(420, 160, 420, lerp(300, 200, lift), '#9fb0bb', 2);
    truck(280, lerp(620, 520, lift), 1, {now, old: true, label: '노후 경유차', exhaust: false});
    // compactor
    box(820, 470, 300, 150, '#1b2530', 10, '#3a5266'); disp('폐차', 970, 560, 26, '#9fb0bb', 'center'); const sq = eout((u - 2.2) / .8); box(830, 480, 280 * sq, 130, 'rgba(255,90,90,.18)', 6);
    alpha(eout((u - 1.8) / .5), () => { box(780, 180, 380, 150, 'rgba(6,13,22,.9)', 14, P.violet); txt('조기폐차 지원', 802, 222, 22, P.violet, 'left', 700); txt('노후 차량 · 건설기계를 일찍 폐차하면', 802, 258, 15, P.text, 'left', 600); txt('지원금을 받을 수 있습니다', 802, 284, 15, P.text, 'left', 600) });
    alpha(eout((u - 2.4) / .4), () => { for (let j = 0; j < 3; j++) { const y = 400 - ((now * 60 + j * 40) % 120); glow(P.amber, 16, () => circ(1060 + j * 30, y, 13, '#ffcf6b')); mono('₩', 1060 + j * 30, y + 5, 12, '#1a1004', 'center', 700) } });
  },
  // 3 저감장치 (DPF cutaway)
  (u, T, now) => {
    CINE.blueprint(); const x0 = 180, y0 = 330, w = 840, h = 180;
    box(x0, y0, w, h, '#101f2c', 90, '#3a5266', 3); txt('배출가스 저감장치 (DPF)', 600, 270, 22, A, 'center', 700);
    for (let j = 0; j < 16; j++) { const x = x0 + 260 + j * 20; line(x, y0 + 22, x, y0 + h - 22, j % 2 ? '#3a5266' : '#2b4459', 12, 'butt') }
    // soot in (dark) → trapped, clean out (cyan)
    for (let j = 0; j < 30; j++) { const q = (now * .5 + j / 30) % 1, x = lerp(x0 - 120, x0 + 280, q), y = y0 + 40 + (j * 37 % 100); circ(x, y, 4 + (j % 3), `rgba(40,40,44,${(.9).toFixed(2)})`) }
    const trap = eout(u / 3); for (let j = 0; j < 60 * trap; j++) circ(x0 + 262 + (j % 16) * 20 + ((j * 7) % 5) - 2, y0 + 30 + (j * 13 % 120), 3, '#2a2a2e');
    for (let j = 0; j < 20; j++) { const q = (now * .6 + j / 20) % 1, x = lerp(x0 + 600, x0 + w + 140, q), y = y0 + 40 + (j * 29 % 100); glow(A, 8, () => circ(x, y, 3, A)) }
    txt('매연 입자', x0 + 60, y0 + h + 44, 16, '#9fb0bb', 'center', 600); txt('필터가 입자를 붙잡음', 600, y0 + h + 44, 16, P.text, 'center', 600); txt('깨끗해진 가스', x0 + w - 40, y0 + h + 44, 16, A, 'center', 600);
    alpha(eout((u - 1.6) / .5), () => chip(600, 620, '입자상 물질 저감', P.mint, 'center', 17));
  },
  // 4 엔진교체
  (u, T, now) => {
    night(now, {ground: 620, city: .7}); const swap = eio(clamp((u - .8) / 1.6));
    excavator(420, 620, 1.3, now, swap);
    // old engine out / new engine in (hoist)
    alpha(1 - swap, () => { const y = lerp(470, 200, swap); box(740, y - 50, 120, 90, '#3a2a20', 8, '#7a5a40', 2); txt('구형', 800, y + 5, 16, '#d0b090', 'center', 700); plume(800, y - 50, now, {col: 'rgba(40,40,44,', a: .5, len: 40, n: 6}) });
    alpha(swap, () => { const y = lerp(200, 470, swap); glow(P.mint, 20, () => box(940, y - 50, 120, 90, '#123a2f', 8, P.mint, 2)); txt('신형', 1000, y + 5, 16, P.mint, 'center', 700) });
    alpha(eout((u - 2.6) / .4), () => { box(760, 150, 400, 100, 'rgba(6,13,22,.9)', 14, P.violet); txt('건설기계 엔진교체', 782, 190, 22, P.violet, 'left', 700); txt('배출가스가 적은 엔진으로 바꿉니다', 782, 224, 15, P.text, 'left', 600) });
  },
  // 5 사후관리
  (u, T, now) => {
    road(now, 0); truck(160, 640, 1.3, {now, smoke: true, spin: 0, label: '저감장치 부착', col: '#dfe8ec'});
    person(620, 640, 1.7, {now, pose: 'tablet', vest: '#2f6f9a', hat: '#e9eef0', flip: true});
    alpha(eout((u - .4) / .4), () => { dashed(560, 560, 150, 600, 'rgba(61,224,255,.6)', 2, now); rings(140, 602, now, A, 6, 40, 3, 1, .8) });
    alpha(eout((u - .8) / .5), () => { panel(790, 150, 370, 330, '사후관리', 'FOLLOW-UP', P.violet); const g = lerp(.86, .18, eout((u - 1) / 1.6)); gauge(975, 310, 72, g, g > .5 ? P.red : P.mint, '매연 농도', g > .5 ? '높음' : '낮음');
      ['장치 정상 작동', '성능 유지 확인'].forEach((s, j) => { txt(s, 812, 420 + j * 36, 16, P.text, 'left', 600); tick(1130, 414 + j * 36, (u - 2.4 - j * .3) / .4, P.green, .8) }) });
  }
]});
})();
