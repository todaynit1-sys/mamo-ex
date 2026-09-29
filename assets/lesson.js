(() => {
  'use strict';
  if(new URLSearchParams(location.search).get('embed')!=='1')return;
  document.documentElement.classList.add('embedded');
  const style=document.createElement('style');style.textContent=`
    html.embedded,html.embedded body{background:#080e16;margin:0;padding:0;overflow-x:hidden}
    .embedded .wrap{max-width:none;margin:0;padding:0 0 8px;gap:16px;min-width:0}
    .embedded .wrap>header{display:none}
    .embedded .stage{box-shadow:none;border-color:#2b3d4f;border-radius:12px}
    .embedded .step,.embedded .fact{background:#101a27;border-color:#2b3d4f}
    .embedded .step{color:#adbecd;min-height:52px}
    .embedded .step[aria-current=step]{color:#f2f6fa}
    .embedded .fact{border-radius:8px}
    .embedded .fact p{color:#d2dde5;font-size:13px;line-height:1.7}
    .embedded .note{color:#adbecd;font-size:11px;line-height:1.8}
    .embedded .play{min-height:52px}
    @media(max-width:640px){.embedded .facts{grid-template-columns:1fr}.embedded .controls{gap:9px}.embedded .steps{grid-template-columns:repeat(3,minmax(0,1fr));flex-basis:100%}.embedded .step{padding:10px;min-height:48px}.embedded .step .t{font-size:12px}.embedded .cap{min-height:95px}.embedded .cap p{font-size:13px}.embedded .play{min-height:44px}.embedded .hud.tl{max-width:72%;font-size:8px;padding:3px 6px}}
  `;document.head.append(style);
  const wrap=document.querySelector('main.wrap');let sent=0;
  function report(){const height=Math.ceil(wrap.getBoundingClientRect().height)+2;if(height!==sent){sent=height;parent.postMessage({type:'mamo-lesson-size',height},location.origin)}}
  new ResizeObserver(report).observe(wrap);window.addEventListener('load',report);document.fonts.ready.then(report);report();
})();
