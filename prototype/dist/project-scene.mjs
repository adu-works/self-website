/** Read-only cinematic views of the real local prototype, not screenshot facsimiles.
 * Only two adjacent chapters exist at once. Removing an iframe destroys its timers.
 * Child frames have no pointer/keyboard access: parent links open the real feature.
 * Mock presets only fill existing simulation forms; no confirm/save action is used.
 */
import {caseChapters} from './case-content.mjs?v=270';
export function createProjectScene(host){
 const mounted=new Map();let active=true,disposed=false;
 function createFrame(chapter,component=false){
  const frame=document.createElement('iframe');frame.tabIndex=-1;frame.title=`${chapter.label}原型展示`;frame.setAttribute('aria-hidden','true');
  // Only same-origin prototype routes from our fixed data are loaded. No supplied URLs.
  frame.src=`./index.html?case-preview=1#/${chapter.route}`;
  frame.addEventListener('load',()=>{if(disposed||!frame.isConnected)return;const doc=frame.contentDocument,win=frame.contentWindow;if(!doc?.querySelector('.preview-note'))return;
   const style=doc.createElement('style');style.textContent='html{scroll-behavior:auto!important}body{overflow:hidden!important}.preview-note,body>header,body>footer{display:none!important}.wrap{padding-top:36px!important}*{animation-duration:0s!important;transition-duration:0s!important}';doc.head.append(style);
   if(chapter.preset==='chat'){const input=doc.querySelector('#chat-form textarea');input.value='个人项目应该如何开始？';input.dispatchEvent(new win.Event('input',{bubbles:true}));doc.querySelector('#chat-form').requestSubmit()}
   if(chapter.preset==='agent'){doc.querySelector('[data-admin-tab="content"]').click();const input=doc.querySelector('#draft-input');input.value='把个人项目的实践整理成文章草稿，列出问题、行动与依据。';input.dispatchEvent(new win.Event('input',{bubbles:true}));doc.querySelector('#draft-form').requestSubmit()}
   if(component){const target=doc.querySelector(chapter.detail);if(target){const clone=target.cloneNode(true);doc.body.replaceChildren(clone);doc.body.style.cssText='margin:0;padding:36px;background:#f5f4ec;min-height:100%;';clone.style.cssText+=';margin:0;position:static;max-width:100%;width:auto;height:auto;min-height:0;overflow:visible;';win.scrollTo(0,0);}}
   else{const target=doc.querySelector(chapter.focus);if(target)win.scrollTo(0,Math.max(0,target.getBoundingClientRect().top+win.scrollY-32))}
   // Child preview must not take keyboard focus from the parent chapter controls.
   doc.activeElement?.blur();doc.querySelectorAll('a,button,input,textarea,select').forEach(el=>el.tabIndex=-1);
   doc.querySelectorAll('video').forEach(v=>v.pause());frame.closest('.case-screen')?.classList.add('is-loaded');
  },{once:true});return frame;
 }
 function mount(i){if(mounted.has(i))return mounted.get(i);const c=caseChapters[i],el=document.createElement('div');el.className=`case-world world-${c.mode}`;el.dataset.chapter=String(i);el.innerHTML=`<div class="case-orbit orbit-one"></div><div class="case-orbit orbit-two"></div><span class="case-giant-number">${String(i+1).padStart(2,'0')}</span><div class="case-screen case-primary"><div class="case-chrome"><i></i><i></i><i></i><span>黄凌波 / ${c.label}</span><b>↗</b></div><div class="case-viewport"></div></div><div class="case-caption">${c.en}<span>个人空间 / ${String(i+1).padStart(2,'0')}</span></div>`;
 el.querySelector('.case-viewport').append(createFrame(c));
 if(c.detail){const detail=document.createElement('div');detail.className='case-screen case-detail';detail.innerHTML=`<div class="case-chrome"><span>${{split:'持续更新',reading:'阅读的坐标',book:'一本自己的书',source:'阅读 → 协作',shop:'清楚地介绍',chat:'回答 → 原文',orders:'交付进度',agent:'确认之前，先看差异'}[c.mode]||c.label}</span></div><div class="case-viewport"></div>`;detail.querySelector('.case-viewport').append(createFrame(c,true));el.append(detail)}
 if(c.mode==='film'){const video=document.createElement('video');video.src='./media/live.mp4';video.poster='./media/live.jpg';video.muted=true;video.loop=true;video.playsInline=true;video.className='case-film';el.append(video);if(active)video.play().catch(()=>{})}
 host.append(el);mounted.set(i,el);return el;
 }
 function render({position}){if(disposed)return;host.style.setProperty('--frame-scale',String(host.clientWidth/1280));const base=Math.floor(position),fraction=position-base;const keep=[base,...(fraction>.001&&base<caseChapters.length-1?[base+1]:[])];
 for(const [i,el] of mounted)if(!keep.includes(i)){el.remove();mounted.delete(i)}
 for(const i of keep){const el=mount(i),distance=i-position,visibility=1-Math.abs(distance);el.style.opacity=String(Math.min(1,visibility*1.65));el.style.transform=`translate3d(${distance*85}%,${Math.abs(distance)*10}%,${-Math.abs(distance)*250}px) rotateY(${distance*-32}deg)`;el.style.setProperty('--reveal',String(visibility));el.style.zIndex=String(Math.round(visibility*10));const main=el.querySelector('.case-primary');main.style.translate=`${-distance*45}px ${distance*25}px`;const detail=el.querySelector('.case-detail');if(detail){detail.style.translate=`${distance*150}px ${-Math.abs(distance)*65}px`;detail.style.rotate=`${distance*(caseChapters[i].mode==='book'?55:12)}deg`;const virtualWidth=caseChapters[i].mode==='orders'?720:560;detail.style.setProperty('--frame-scale',String(detail.clientWidth/virtualWidth))}}
 }
 function setActive(value){active=value;host.querySelectorAll('video').forEach(v=>{if(value)v.play().catch(()=>{});else v.pause()})}
 return{render,setActive,dispose(){disposed=true;setActive(false);for(const el of mounted.values())el.remove();mounted.clear()}};
}
