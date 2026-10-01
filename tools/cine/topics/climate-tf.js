// 기획과 · 수도권 기후에너지 전담반(TF)
(() => {
const {P, A, c, clamp, lerp, eio, eout, box, line, poly, circ, ell, txt, mono, disp, glow, alpha, panel, chip, tick, arrow, dashed, rings, dots, night, blueprint, person, tree} = CINE;
const sky = now => night(now, {ground: 620, city: .55, glow: 'rgba(61,224,255,.12)'});

function solarHouse(x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  box(-72, -100, 144, 100, '#24445b', 5); poly([[-88, -102], [0, -150], [88, -102]], '#38677a');
  poly([[-55, -111], [-17, -131], [4, -119], [-34, -100]], '#2c6f9c', A, 1);
  poly([[7, -121], [34, -136], [64, -120], [36, -104]], '#2c6f9c', A, 1);
  line(-25, -127, -4, -116, 'rgba(220,246,255,.5)', 1); line(35, -134, 34, -107, 'rgba(220,246,255,.5)', 1);
  box(-55, -72, 32, 36, '#a8cad4', 3); box(18, -72, 32, 36, '#a8cad4', 3); box(-14, -65, 28, 65, '#172b3b', 3);
  c.restore();
}
function turbine(x, y, s, now) {
  c.save(); c.translate(x, y); c.scale(s, s); line(0, 0, 0, -160, '#adc7ce', 6);
  c.translate(0, -160); c.rotate(now * .65); for (let i = 0; i < 3; i++) { c.rotate(Math.PI * 2 / 3); poly([[0, 0], [-7, -70], [2, -78], [7, -6]], '#b8dce2') }
  circ(0, 0, 8, A); c.restore();
}
function tower(x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(-52, 0, -17, -250, '#7892a5', 4); line(52, 0, 17, -250, '#7892a5', 4);
  for (const yy of [-205, -150, -95, -40]) { const w = 17 + (yy + 250) * .15; line(-w, yy, w, yy, '#7892a5', 3) }
  line(-88, -216, 88, -216, '#7892a5', 5); line(-72, -165, 72, -165, '#7892a5', 5);
  for (const xx of [-65, 65]) { line(xx, -216, xx, -195, '#acc4ce', 2); circ(xx, -190, 5, '#9ccbd8') }
  c.restore();
}
function badge(x, y, title, sub, col = A) {
  box(x, y, 270, 92, 'rgba(6,13,22,.94)', 12, col, 1.6);
  txt(title, x + 20, y + 38, 20, col, 'left', 700); txt(sub, x + 20, y + 68, 14, P.text, 'left', 500);
}

CINE.story({scenes: [
  // 1 현장 현안 파악: 수도권만 표시한다.
  (u, T, now) => {
    CINE.blueprint();
    panel(72, 160, 625, 420, '수도권 현안', '서울 · 인천 · 경기', A);
    const places = [[220, 420, '인천', P.cyan], [390, 315, '서울', P.mint], [520, 465, '경기', P.amber]];
    poly([[130, 382], [190, 282], [290, 250], [350, 295], [445, 245], [575, 310], [610, 452], [495, 530], [345, 515], [220, 540]], 'rgba(61,224,255,.07)', 'rgba(61,224,255,.35)', 2);
    places.forEach(([x, y, label, col], i) => alpha(eout((u - .35 - i * .27) / .5), () => {
      rings(x, y, now + i * .3, col, 8, 36, 2, .8, .45); glow(col, 12, () => circ(x, y, 10, col)); chip(x, y - 22, label, col, 'center', 15)
    }));
    alpha(eout((u - 1.2) / .6), () => { dashed(615, 365, 775, 365, A, 2, now); arrow(700, 365, 765, 365, A, 3, 10, 1) });
    panel(770, 160, 360, 420, '기후에너지 TF', '수도권대기환경청', P.mint);
    alpha(eout((u - 1.2) / .6), () => {
      badge(815, 270, '현장 목소리', '지역 현안을 듣고 정리', P.cyan);
      badge(815, 388, '대응 과제', '협력이 필요한 문제 선별', P.mint);
      dots([[950, 360], [950, 386]], now, P.mint, 3, 3, .7);
    });
  },
  // 2 주민과 먼저 소통한다.
  (u, T, now) => {
    sky(now); solarHouse(210, 575, 1.15); turbine(465, 575, .9, now);
    box(635, 185, 495, 355, 'rgba(6,13,22,.91)', 16, 'rgba(61,224,255,.32)');
    txt('사업 초기부터 함께 논의', 672, 235, 25, P.text, 'left', 700);
    const people = [[715, '#337e9a', true], [850, '#3d8f6a', false], [985, '#88577b', true]];
    people.forEach(([x, vest, woman], i) => alpha(eout((u - .25 - i * .2) / .5), () => person(x, 490, 1.65, {now: now + i, pose: i === 1 ? 'point' : 'tablet', vest, woman, hat: '#e9eef0'})));
    alpha(eout((u - 1.4) / .5), () => { chip(704, 305, '주민 의견', P.cyan, 'left', 16); chip(858, 305, '지역 여건', P.amber, 'left', 16); chip(1012, 305, '대안', P.mint, 'left', 16) });
    alpha(eout((u - 2.4) / .6), () => { box(130, 205, 430, 100, 'rgba(6,13,22,.9)', 14, P.mint); txt('우려를 듣고', 155, 245, 22, P.text, 'left', 700); txt('해결 방향을 함께 찾습니다', 155, 282, 20, P.mint, 'left', 700) });
  },
  // 3 전력망 구축 과정의 갈등 조정.
  (u, T, now) => {
    CINE.blueprint();
    solarHouse(175, 580, 1.1); turbine(390, 580, .95, now); tower(655, 590, 1.08);
    box(915, 390, 190, 195, '#183449', 8); for (let j = 0; j < 4; j++) box(934 + j * 41, 420, 26, 54, '#9ec2d0', 3);
    txt('재생에너지', 280, 245, 21, P.cyan, 'center', 700); txt('전력망', 655, 245, 21, P.amber, 'center', 700); txt('수요 지역', 1010, 245, 21, P.text, 'center', 700);
    const k = eout((u - .6) / 1.5); dashed(430, 355, 590, 355, P.cyan, 3, now); dashed(720, 355, 908, 355, P.cyan, 3, now);
    alpha(k, () => { glow(P.red, 16, () => circ(655, 355, 34, 'rgba(255,90,90,.18)', P.red, 2)); txt('!', 655, 368, 34, P.red, 'center', 700); chip(655, 302, '갈등·지연', P.red, 'center', 16) });
    alpha(eout((u - 1.7) / .6), () => { box(428, 160, 455, 64, 'rgba(6,13,22,.94)', 12, P.mint); txt('관계기관과 대안을 협의합니다', 655, 202, 21, P.mint, 'center', 700) });
    alpha(eout((u - 2.7) / .6), () => { arrow(585, 420, 730, 420, P.mint, 3, 13, 1); chip(658, 459, '조정 방안', P.mint, 'center', 15) });
  },
  // 4 햇빛·바람 소득마을 사업 준비 지원.
  (u, T, now) => {
    sky(now); box(65, 160, 1070, 430, 'rgba(6,13,22,.69)', 18, 'rgba(95,224,181,.26)');
    txt('햇빛·바람 소득마을', 105, 220, 27, P.mint, 'left', 700);
    solarHouse(235, 550, 1.15); solarHouse(465, 550, .9); turbine(670, 560, 1.05, now);
    alpha(eout((u - .6) / .5), () => { chip(225, 330, '햇빛', P.amber, 'center', 17); chip(670, 330, '바람', P.cyan, 'center', 17) });
    alpha(eout((u - 1.3) / .5), () => { dashed(690, 405, 845, 405, P.mint, 3, now); arrow(770, 405, 835, 405, P.mint, 3, 12, 1) });
    panel(840, 255, 245, 250, '현장 지원', '입지 발굴 · 사업 준비', P.mint);
    alpha(eout((u - 2) / .5), () => { txt('주민 참여', 870, 355, 20, P.text, 'left', 600); tick(1040, 348, 1, P.mint, .9); txt('지역 여건', 870, 410, 20, P.text, 'left', 600); tick(1040, 403, 1, P.mint, .9) });
  },
  // 5 수도권 관계기관 협의와 제도개선 연결.
  (u, T, now) => {
    CINE.blueprint();
    const nodes = [[110, 205, '수도권대기환경청', A], [110, 445, '지자체', P.mint], [820, 205, '한국전력', P.amber], [820, 445, '에너지공단', P.violet]];
    nodes.forEach(([x, y, label, col], i) => alpha(eout((u - .3 - i * .18) / .5), () => {
      box(x, y, 270, 105, 'rgba(6,13,22,.94)', 14, col, 1.5); circ(x + 35, y + 52, 12, col); txt(label, x + 61, y + 61, 20, P.text, 'left', 700);
    }));
    alpha(eout((u - 1.2) / .6), () => {
      [[380, 258], [380, 498], [820, 258], [820, 498]].forEach(([x, y]) => dashed(x, y, 600, 375, 'rgba(61,224,255,.45)', 2, now));
      glow(A, 24, () => circ(600, 375, 96, 'rgba(61,224,255,.13)', A, 2));
      txt('현장 현안', 600, 364, 24, P.text, 'center', 700); txt('협의·조정', 600, 400, 20, A, 'center', 700);
    });
    alpha(eout((u - 2.5) / .6), () => { box(430, 540, 340, 60, 'rgba(6,13,22,.93)', 12, P.mint); txt('개선 과제 연결', 600, 578, 21, P.mint, 'center', 700); arrow(600, 474, 600, 535, P.mint, 3, 12, 1) });
  }
]});
})();
