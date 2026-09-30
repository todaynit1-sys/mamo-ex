'use strict';
const {departments,topics}=window.MAMO_CATALOG,byTopic=Object.fromEntries(topics.map(x=>[x.id,x])),byDept=Object.fromEntries(departments.map(x=>[x.id,x]));
const $=id=>document.getElementById(id),frame=$('lesson-frame'),tabs=[...document.querySelectorAll('.lesson-tab')];let selected='',timer;
function loading(){clearTimeout(timer);$('viewer').setAttribute('aria-busy','true');$('loading').hidden=false;$('load-error').hidden=true;frame.hidden=false;timer=setTimeout(()=>{if($('viewer').getAttribute('aria-busy')==='true'){$('loading').hidden=true;$('load-error').hidden=false;frame.hidden=true;$('viewer').setAttribute('aria-busy','false')}},20000)}
function resolve(){const hash=location.hash.slice(1);if(hash==='inventory')return'mobile-air';if(hash==='emissions')return'integrated';if(byTopic[hash])return hash;return'sift-ms'}
function select(key,force=false){const topic=byTopic[key]||byTopic['sift-ms'],dept=byDept[topic.dept],changed=selected!==topic.id;selected=topic.id;document.body.dataset.lesson=dept.id;
 $('page-title').textContent=topic.title;$('eyebrow').textContent=`0${dept.index} — ${dept.dept}`;$('intro-copy').textContent=topic.desc;$('duration').textContent='각 30초';$('scene-count').textContent='업무별 '+dept.topics.length+'편';document.querySelector('.topic-heading > span').textContent='각 30초 · '+dept.topics.length+'편';$('viewer-label').textContent=topic.title;
 $('department-name').textContent=dept.dept+' 주요 업무';$('duties').replaceChildren(...dept.duties.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));$('scope-note').textContent=topic.desc;$('source-link').href=topic.source;document.title=dept.dept+' · '+topic.title+' | 수도권대기환경청';
 tabs.forEach(tab=>{const active=tab.dataset.target===dept.id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});$('department-panel').setAttribute('aria-labelledby','tab-'+dept.id);$('topic-heading').textContent=dept.dept+' 업무 골라보기';
 if($('topic-list').dataset.dept!==dept.id){$('topic-list').dataset.dept=dept.id;$('topic-list').replaceChildren(...dept.topics.map((id,i)=>{const item=byTopic[id],b=document.createElement('button');b.className='topic';b.type='button';b.dataset.topic=id;b.innerHTML=`<span class="topic-no">0${i+1} / 30s</span><strong>${item.title}</strong><span class="topic-desc">${item.desc}</span><span class="topic-action">영상 보기 <span aria-hidden="true">↗</span></span>`;b.onclick=()=>{if(selected!==id)location.hash=id};return b}))}
 document.querySelectorAll('.topic').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.topic===topic.id)));
 frame.title=topic.title+' 30초 애니메이션';for(const id of['open-lesson','fallback-link','download-lesson'])$(id).href=topic.file+'?v=16';$('download-lesson').download=dept.dept+'-'+topic.title+'-30초.html';
 if(changed||force){loading();frame.src=topic.file+'?embed=1&v=16'}
}
tabs.forEach((tab,i)=>{tab.onclick=()=>{location.hash=byDept[tab.dataset.target].topics[0]};tab.onkeydown=e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowLeft')next=(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();tabs[next].focus();tabs[next].click()}});
window.addEventListener('hashchange',()=>{if(location.hash!=='#lessons')select(resolve())});
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='mamo-lesson-size')return;const h=Number(event.data.height);if(!Number.isFinite(h)||h<100||h>6000)return;frame.style.height=Math.ceil(h)+'px';clearTimeout(timer);$('loading').hidden=true;$('load-error').hidden=true;frame.hidden=false;$('viewer').setAttribute('aria-busy','false')});
frame.addEventListener('load',()=>{const doc=frame.contentDocument;if(!doc||doc.getElementById('compact-player-style'))return;const link=doc.createElement('link');link.id='compact-player-style';link.rel='stylesheet';link.href='assets/compact-player.css?v=16';doc.head.append(link);const friendly=doc.createElement('link');friendly.rel='stylesheet';friendly.href='assets/friendly-player.css?v=16';doc.head.append(friendly);const reading=doc.createElement("link");reading.rel="stylesheet";reading.href="assets/readability.css?v=16";doc.head.append(reading)});
$('retry').onclick=()=>select(selected,true);select(resolve(),true);

// 음성 해설: 영상(iframe)이 장면마다 보내는 음성을 이 창에서 재생한다.
// 사용자가 이미 누른 창이라 콘텐츠를 바꿔도 브라우저 자동재생 차단에 걸리지 않는다.
(()=>{const frame=document.getElementById('lesson-frame'),voice=new Audio();voice.preload='auto';
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;const d=e.data||{};
 if(d.type==='mamo-voice'&&typeof d.src==='string'&&d.src.startsWith('data:audio/')){voice.pause();voice.src=d.src;voice.currentTime=0;const p=voice.play();if(p)p.catch(()=>frame.contentWindow.postMessage({type:'mamo-voice-fail'},location.origin))}
 else if(d.type==='mamo-voice-stop')voice.pause()});
frame.addEventListener('load',()=>voice.pause());window.addEventListener('hashchange',()=>voice.pause())})();

// 읽기 모드 링크를 지금 보고 있는 업무로 맞춘다.
(()=>{const a=document.getElementById('read-mode');if(!a)return;const sync=()=>{const id=location.hash.slice(1);a.href='m.html'+(id&&id!=='lessons'?'#'+(id==='emissions'?'integrated':id):'')};window.addEventListener('hashchange',sync);sync()})();
