/** Scroll-driven product tour. Progress is deterministic and reversible.
 * The scene lazily presents actual prototype pages; it never executes real writes.
 * Listeners, iframe contexts and animation frames are released on route exit. */
import {caseChapters} from './case-content.mjs?v=270';
const clamp=x=>Math.max(0,Math.min(1,x));
export const assemblyStops=caseChapters.map((_,i)=>i/(caseChapters.length-1));
export function assemblyProgress(top,height,viewport){return clamp(-top/Math.max(1,height-viewport))}
export function assemblyPose(progress){const p=clamp(progress);return {progress:p,position:p*(caseChapters.length-1)}}
export function assemblyStage(p){return Math.round(clamp(p)*(caseChapters.length-1))}
export function assembly(){return `<section class="assembly" aria-label="个人网站的十二段产品展示"><div class="assembly-sticky"><div class="assembly-top"><span>LINGBO / THE PERSONAL WEBSITE</span><a href="#/project/website" data-section="project-overview">跳过展示 ↘</a></div><div class="assembly-model" aria-hidden="true"></div><div class="assembly-copy"><p class="case-fallback-note" hidden>静态阅读模式 · 每个功能均可直接打开体验。</p>${caseChapters.map((c,i)=>`<div class="case-chapter" ${i?'hidden':''}><span class="assembly-kicker">${String(i+1).padStart(2,'0')} / ${c.en}</span><h2>${c.title.replace('\n','<br>')}</h2><p>${c.text}</p><a class="case-open" href="#/${c.route}">打开${c.label} <span>↗</span></a></div>`).join('')}</div><div class="assembly-bottom"><span class="case-scroll-note">向下滚动，逐层走进这个项目</span><div class="case-controls"><button class="case-media-control" data-case-media aria-pressed="false" hidden>暂停影像</button><button data-case-step="-1" aria-label="上一段">←</button><label><span class="sr-only">选择展示章节</span><select aria-label="选择展示章节">${caseChapters.map((c,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} / ${c.label}</option>`).join('')}</select></label><button data-case-step="1" aria-label="下一段">→</button></div><small>真实原型页面 · 示例内容 · AI 与后台均为模拟</small></div><div class="assembly-meter"><i></i></div></div></section>`}
export function mountAssembly(root){
 const region=root.querySelector('.assembly');if(!region)return()=>{};
 const media=matchMedia('(max-width:480px), (max-height:420px), (prefers-reduced-motion:reduce)'),events=new AbortController(),sticky=region.querySelector('.assembly-sticky');
 let raf=0,scene=null,loading=false,disposed=false,visible=false,progress=null,last=0,failed=false,paused=false;
 function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(draw)}
 async function load(){if(scene||loading||disposed)return;loading=true;try{const {createProjectScene}=await import('./project-scene.mjs?v=270');if(!disposed&&!media.matches){scene=createProjectScene(region.querySelector('.assembly-model'));scene.setActive(visible&&!document.hidden&&!paused);schedule()}}catch{failed=true;schedule()}finally{loading=false}}
 function draw(now){raf=0;if(disposed)return;const quiet=media.matches||failed;region.classList.toggle('case-quiet',quiet);region.querySelector('.case-fallback-note').hidden=!quiet;
 const target=assemblyProgress(region.getBoundingClientRect().top,region.offsetHeight,sticky.offsetHeight),dt=last?Math.min(.05,(now-last)/1000):.016;last=now;
 progress=progress===null?target:progress+(target-progress)*(1-Math.exp(-dt*15));if(Math.abs(progress-target)<.00005)progress=target;
 const stage=assemblyStage(progress),chapter=caseChapters[stage];region.dataset.tone=chapter.tone;region.querySelector('[data-case-media]').hidden=quiet||stage!==7;
 region.querySelectorAll('.case-chapter').forEach((el,i)=>el.hidden=!quiet&&i!==stage);
 region.querySelector('select').value=String(stage);region.querySelector('[data-case-step="-1"]').disabled=stage===0;region.querySelector('[data-case-step="1"]').disabled=stage===caseChapters.length-1;
 region.querySelector('.assembly-meter i').style.transform=`scaleX(${progress})`;
 if(quiet){scene?.dispose();scene=null}else if(visible&&!document.hidden){load();scene?.render(assemblyPose(progress));if(progress!==target)schedule()}
 }
 function move(i,smooth=false){i=Math.max(0,Math.min(caseChapters.length-1,i));window.scrollTo({top:scrollY+region.getBoundingClientRect().top+(region.offsetHeight-sticky.offsetHeight)*assemblyStops[i],behavior:smooth?'smooth':'instant'})}
 region.addEventListener('change',e=>{if(e.target.matches('select'))move(Number(e.target.value))},{signal:events.signal});region.addEventListener('click',e=>{const mediaButton=e.target.closest('[data-case-media]');if(mediaButton){paused=!paused;mediaButton.textContent=paused?'播放影像':'暂停影像';mediaButton.setAttribute('aria-pressed',String(paused));scene?.setActive(visible&&!document.hidden&&!paused);return}const b=e.target.closest('[data-case-step]');if(b)move(assemblyStage(progress||0)+Number(b.dataset.caseStep),true)},{signal:events.signal});
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;scene?.setActive(visible&&!document.hidden&&!paused);last=0;schedule()});observer.observe(region);
 for(const event of ['scroll','resize'])window.addEventListener(event,schedule,{passive:true,signal:events.signal});media.addEventListener('change',schedule,{signal:events.signal});document.addEventListener('visibilitychange',()=>{scene?.setActive(visible&&!document.hidden&&!paused);schedule()},{signal:events.signal});schedule();
 return()=>{disposed=true;events.abort();observer.disconnect();cancelAnimationFrame(raf);scene?.dispose()};
}
