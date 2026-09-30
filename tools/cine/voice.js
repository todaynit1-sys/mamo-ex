/* 음성 해설 모듈. 장면이 바뀌면 그 장면의 MP3를 재생한다.
   메인 화면(index.html) 안에 삽입되면 부모 창이 소리를 낸다: 부모는 사용자가 이미 클릭한 창이라
   콘텐츠를 바꿔도 브라우저 자동재생 차단에 걸리지 않는다. 단독 파일로 열면 스스로 재생한다. */
(() => {
'use strict';
const KEY = 'mamo-voice';
const embedded = new URLSearchParams(location.search).get('embed') === '1' && window.parent !== window;
const read = () => { try { return localStorage.getItem(KEY) === '1' } catch (e) { return false } };
const write = v => { try { localStorage.setItem(KEY, v ? '1' : '0') } catch (e) {} };
const ICON_ON = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 8v4h3l4 3.5V4.5L6 8H3z" fill="currentColor"/><path d="M13 7.2a4 4 0 0 1 0 5.6M15.3 5a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
const ICON_OFF = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 8v4h3l4 3.5V4.5L6 8H3z" fill="currentColor"/><path d="M13.5 7.5l4 5m0-5l-4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
window.MAMO_VOICE = {
  init(o) {
    const btn = o.button, clips = o.clips || [], audio = embedded ? null : new Audio();
    const api = {on: read() && clips.length > 0, scene, stop};
    function paint() { if (!btn) return; btn.setAttribute('aria-pressed', String(api.on)); btn.innerHTML = (api.on ? ICON_ON : ICON_OFF) + `<span>${api.on ? '음성 해설 켜짐' : '음성 해설 듣기'}</span>`; btn.classList.toggle('on', api.on) }
    function fail() { api.on = false; paint() }
    function scene(i) { if (!api.on || !clips[i]) return;
      if (embedded) parent.postMessage({type: 'mamo-voice', src: clips[i], topic: o.id, scene: i}, location.origin);
      else { audio.pause(); audio.src = clips[i]; audio.currentTime = 0; const p = audio.play(); if (p) p.catch(fail) } }
    function stop() { if (embedded) parent.postMessage({type: 'mamo-voice-stop'}, location.origin); else if (audio) audio.pause() }
    window.addEventListener('message', e => { if (e.origin === location.origin && e.source === parent && e.data?.type === 'mamo-voice-fail') fail() });
    if (btn) { if (!clips.length) btn.hidden = true;
      btn.onclick = () => { api.on = !api.on; write(api.on); paint(); if (api.on) o.onEnable && o.onEnable(); else stop() } }
    paint(); return api;
  }
};
})();
