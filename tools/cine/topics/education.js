// 기획과 · 대기환경 교육·홍보
(() => {
const {W, H, P, A, c, clamp, lerp, eio, eout, back, fade, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, grad, chip, panel, tick, arrow, dashed, rings, plume, dots,
  night, factory, truck, car, person, doc, bars, gauge, phone, tree, monitor} = CINE;
function hall(now) { c.fillStyle = grad(0, 0, 0, H, [[0, '#060d16'], [1, '#0e2031']]); c.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) { const x = 120 + i * 240; c.fillStyle = grad(x, 0, x, 400, [[0, 'rgba(61,224,255,.10)'], [1, 'rgba(61,224,255,0)']]); poly([[x - 20, 0], [x + 20, 0], [x + 120, 420], [x - 120, 420]], c.fillStyle) }
  c.fillStyle = '#0a1622'; c.fillRect(0, 590, W, 130); line(0, 590, W, 590, '#1d3448', 2) }
function audience(now, n = 9, y = 690) { for (let i = 0; i < n; i++) { const x = 90 + i * 128, b = Math.sin(now * 2 + i) * 2; circ(x, y - 70 + b, 20, '#1a2d3e'); box(x - 34, y - 50 + b, 68, 70, '#15283a', 18) } }
CINE.story({scenes: [
  // 1 교육 준비
  (u, T, now) => {
    hall(now); const k = eout(u / .8);
    monitor(300, 150, 600, 330, {stand: false}); alpha(k, () => { c.fillStyle = grad(300, 150, 900, 480, [[0, '#0c2a40'], [1, '#1a1030']]); c.fillRect(300, 150, 600, 330);
      disp('우리 동네 공기 이야기', 600, 280, 44, P.text, 'center'); txt('대기환경 교육 프로그램', 600, 324, 18, A, 'center', 600) });
    const cards = [['학생', '학교 방문 교육', A], ['주민', '생활 속 대기 이야기', P.mint], ['사업장', '배출 관리 교육', P.amber]];
    cards.forEach(([t, s, col], i) => { const kk = back((u - .8 - i * .25) / .45); if (kk <= 0) return; c.save(); c.translate(390 + i * 210, 420); c.scale(kk, kk);
      box(-90, -44, 180, 88, 'rgba(6,13,22,.94)', 14, col); txt(t, 0, -6, 22, col, 'center', 700); txt(s, 0, 22, 13, P.text, 'center', 500); c.restore() });
    audience(now);
  },
  // 2 발생 원인 (secondary formation)
  (u, T, now) => {
    CINE.blueprint();
    const src = [['자동차', 180, 330], ['공장', 180, 460], ['난방', 180, 590]];
    src.forEach(([s, x, y], i) => { alpha(eout((u - i * .2) / .4), () => { box(x - 80, y - 36, 160, 72, 'rgba(6,13,22,.9)', 12, '#2b4459'); txt(s, x, y + 7, 19, P.text, 'center', 700) }) });
    const gases = [['NOx', P.amber], ['SOx', P.mint], ['VOCs', P.violet], ['NH₃', P.cyan]];
    gases.forEach(([g, col], i) => { const k = eout((u - .6 - i * .15) / .5); alpha(k, () => { const x = 470, y = 280 + i * 100; box(x - 50, y - 24, 100, 48, 'rgba(6,13,22,.9)', 24, col); mono(g, x, y + 7, 18, col, 'center', 700); dots([[270, 330 + (i % 3) * 130], [x - 50, y]], now + i * .2, col, 3, 3) }) });
    // sun + reaction
    alpha(eout((u - 1.3) / .5), () => { glow(P.amber, 40, () => circ(660, 190, 34, '#ffcf6b')); for (let j = 0; j < 8; j++) { const a = j / 8 * 6.28 + now * .4; line(660 + Math.cos(a) * 46, 190 + Math.sin(a) * 46, 660 + Math.cos(a) * 60, 190 + Math.sin(a) * 60, P.amber, 3) } txt('햇빛', 660, 256, 14, P.amber, 'center', 600) });
    alpha(eout((u - 1.7) / .5), () => { dots([[520, 330], [700, 330], [820, 300]], now, P.amber, 4); dots([[520, 530], [700, 520], [820, 520]], now + .4, P.violet, 4);
      box(840, 250, 300, 100, 'rgba(61,224,255,.1)', 16, A); disp('오존 O₃', 990, 312, 36, A, 'center');
      box(840, 470, 300, 100, 'rgba(255,181,71,.1)', 16, P.amber); disp('초미세먼지', 990, 532, 36, P.amber, 'center');
      for (let j = 0; j < 14; j++) { const q = (now * .3 + j / 14) % 1; circ(860 + q * 260, 590 + Math.sin(j * 3) * 8, 2.5, 'rgba(255,181,71,.7)') } });
    alpha(eout((u - 2.4) / .5), () => txt('공기 중 화학반응으로 새로 생깁니다', 600, 660, 18, P.text, 'center', 600));
  },
  // 3 건강 보호 (phone air quality)
  (u, T, now) => {
    night(now, {ground: 640, city: .8}); const k = eout(u / .7);
    phone(lerp(400, 360, k), 390, 1.9, () => { c.fillStyle = '#081420'; c.fillRect(-52, -106, 104, 212); txt('오늘의 대기질', 0, -80, 9, P.muted, 'center', 600);
      const v = eout((u - .4) / 1.2); c.lineCap = 'round'; c.beginPath(); c.arc(0, -20, 34, Math.PI * .8, Math.PI * (.8 + 1.4 * .72 * v)); c.strokeStyle = P.amber; c.lineWidth = 7; c.stroke(); c.lineCap = 'butt';
      disp('나쁨', 0, -12, 18, P.amber, 'center'); mono('PM2.5 48', 0, 6, 7, P.text, 'center'); ['마스크 착용', '실외활동 줄이기', '환기는 짧게'].forEach((s, j) => alpha(eout((u - 1.2 - j * .3) / .3), () => { box(-44, 34 + j * 22, 88, 17, 'rgba(255,181,71,.12)', 6); txt(s, 0, 46 + j * 22, 8, P.text, 'center', 600) })) });
    alpha(eout((u - 1) / .5), () => { person(760, 640, 1.9, {now, helmet: false, vest: '#4a6fa8'}); box(745, 494, 30, 14, '#e9eef0', 5); txt('KF94', 900, 470, 20, P.text, 'left', 700); dashed(800, 500, 890, 470, 'rgba(232,241,245,.5)', 1.5, now) });
    alpha(eout((u - 1.8) / .5), () => { box(840, 180, 320, 110, 'rgba(6,13,22,.9)', 14, P.amber); txt('대기질 예보·경보를 확인하고', 862, 224, 17, P.text, 'left', 600); txt('상황에 맞게 대응합니다', 862, 256, 17, P.text, 'left', 600) });
  },
  // 4 생활 실천
  (u, T, now) => {
    night(now, {ground: 620, city: .9, gridSpeed: .6}); const x = (now * 120) % 1400 - 200;
    // bus
    c.save(); c.translate(x, 620); ell(170, 2, 180, 7, 'rgba(0,0,0,.45)'); box(0, -140, 340, 124, '#2d7d6a', 14); for (let i = 0; i < 5; i++) box(20 + i * 62, -122, 50, 42, '#0f2a2a', 5); box(0, -64, 340, 10, P.mint, 2); txt('대중교통', 170, -34, 18, '#e8fff5', 'center', 700);
    for (const wx of [70, 270]) { circ(wx, -14, 20, '#05080c'); circ(wx, -14, 8, '#8f9ea8') } c.restore();
    // bike
    const bx = (now * 70 + 600) % 1400 - 200; c.save(); c.translate(bx, 620); circ(0, -18, 18, null, '#9fb0bb', 3); circ(56, -18, 18, null, '#9fb0bb', 3); line(0, -18, 26, -46, '#9fb0bb', 3); line(26, -46, 56, -18, '#9fb0bb', 3); line(26, -46, 46, -46, '#9fb0bb', 3); c.restore(); person(bx + 26, 580, 1.1, {now, helmet: false, vest: P.violet, pose: 'stand'});
    const acts = [['대중교통 이용', P.mint], ['친환경 운전 · 공회전 줄이기', A], ['불법 소각 하지 않기', P.amber]];
    acts.forEach(([s, col], i) => { const k = back((u - .5 - i * .35) / .45); if (k <= 0) return; c.save(); c.translate(860, 190 + i * 76); c.scale(k, k); box(-160, -28, 320, 56, 'rgba(6,13,22,.92)', 28, col); tick(-128, -2, 1, col, .8); txt(s, -100, 7, 18, P.text, 'left', 600); c.restore() });
  },
  // 5 정보 전달
  (u, T, now) => {
    CINE.blueprint();
    const cx = 380, cy = 400; glow(A, 30, () => circ(cx, cy, 64, 'rgba(61,224,255,.14)', A, 2.5)); disp('교육 · 홍보', cx, cy + 12, 30, P.text, 'center');
    rings(cx, cy, now, A, 70, 260, 4, .5, .6, 2);
    const ch = [['누리집', 780, 200], ['SNS · 영상', 900, 330], ['현장 캠페인', 780, 460], ['지자체 · 학교', 900, 590]];
    ch.forEach(([s, x, y], i) => { const k = back((u - .5 - i * .25) / .45); if (k <= 0) return; alpha(clamp(k), () => { dots([[cx + 64, cy], [x - 90, y]], now + i * .25, i % 2 ? P.mag : A, 4); c.save(); c.translate(x, y); c.scale(k, k); box(-110, -28, 220, 56, 'rgba(6,13,22,.92)', 28, i % 2 ? P.mag : A); txt(s, 0, 7, 18, P.text, 'center', 700); c.restore() }) });
    alpha(eout((u - 1.8) / .5), () => { for (let i = 0; i < 6; i++) { const x = 1060 + (i % 2) * 60, y = 220 + Math.floor(i / 2) * 150; box(x, y, 44, 36, '#1d3748', 4); poly([[x - 6, y], [x + 22, y - 22], [x + 50, y]], '#244a5e'); alpha(.6 + .4 * Math.sin(now * 3 + i), () => box(x + 14, y + 12, 14, 12, '#ffd28a', 2)) } });
  }
]});
})();
