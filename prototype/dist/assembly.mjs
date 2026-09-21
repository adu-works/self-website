/** Cinematic case-study controller. Scroll controls an original mechanical metaphor
 * of this project's public reading capabilities; it does not claim real hardware.
 * Pure keyframes are testable. GPU work runs only while this section is visible;
 * reduced motion, very small screens and WebGL failure keep readable HTML.
 */
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t)};
const mix=(a,b,t)=>t===0?a:t===1?b:a+(b-a)*t;
export function assemblyProgress(top,height,viewport){return clamp(-top/Math.max(1,height-viewport))}
export const assemblyStops=[0,.22,.43,.63,.81,1];
const frames=[
 {spread:0,shell:0,rx:.18,ry:-.36,rz:-.16,scale:1.42,ink:0,twist:0},
 {spread:1,shell:.60,rx:.10,ry:-1.08,rz:.40,scale:.90,ink:0,twist:1},
 {spread:1,shell:1.0,rx:.12,ry:-1.08,rz:-.35,scale:.91,ink:1,twist:0},
 {spread:.63,shell:1.45,rx:.36,ry:-.70,rz:.16,scale:1.02,ink:0,twist:2},
 {spread:.85,shell:.85,rx:-.20,ry:.98,rz:-.42,scale:.92,ink:0,twist:-1},
 {spread:0,shell:0,rx:.18,ry:-.36,rz:-.16,scale:1.42,ink:0,twist:0}
];
export function assemblyPose(progress){const p=clamp(progress);let i=0;while(i<frames.length-2&&p>assemblyStops[i+1])i++;const t=smooth((p-assemblyStops[i])/(assemblyStops[i+1]-assemblyStops[i]));return {...Object.fromEntries(Object.keys(frames[0]).map(k=>[k,mix(frames[i][k],frames[i+1][k],t)])),progress:p}}
export function assemblyStage(p){return p<.11?0:p<.325?1:p<.53?2:p<.72?3:p<.905?4:5}
const chapters=[
 ['让知识<br>运转起来。','把内容、阅读与问答，连接成一个人的知识空间。','THE WHOLE'],
 ['拆开，<br>看见全貌。','每一层各司其职：保存内容，组织路径，再把问题带回原文。','EXPLODED VIEW'],
 ['结构清楚，<br>阅读才自由。','专题与目录提供方向。可以循序读，也可以从一个问题开始。','UNDER THE SURFACE'],
 ['问题进入，<br>线索浮现。','公开内容构成检索范围，围绕问题找到相关段落。','FIND THE SIGNAL'],
 ['每个回答，<br>都有来处。','引用连接回答与原文。点到具体段落，才能核对上下文。','FOLLOW THE SOURCE'],
 ['重新合拢，<br>回到使用。','所有结构，最终只为一次顺畅的阅读与发现。','BACK TO THE WHOLE']
];
export function assembly(){return `<section class="assembly" aria-label="个人空间作品的机械拆解演示"><div class="assembly-sticky"><div class="assembly-top"><span>LINGBO / PERSONAL SPACE</span><a href="#/project/website" data-section="project-overview">跳过演示 ↘</a></div><div class="assembly-model" aria-hidden="true"><div class="case-static"><svg viewBox="0 0 600 330"><g fill="none" stroke="currentColor" stroke-width="2" transform="translate(300 165) rotate(-25)">${[0,1,2,3,4,5].map(i=>`<ellipse cx="${(i-2.5)*54}" cy="0" rx="50" ry="112"/><ellipse cx="${(i-2.5)*54}" cy="0" rx="38" ry="96"/>`).join('')}<path d="M-180 0H180" stroke-dasharray="4 9"/></g></svg><p>内容 → 阅读 → 公开问答 → 引用来源</p></div></div><div class="assembly-copy"><p class="case-fallback-note" data-case-fallback hidden></p>${chapters.map((c,i)=>`<div class="case-chapter" ${i?'hidden':''} data-case-chapter="${i}"><span class="assembly-kicker">${String(i+1).padStart(2,'0')} / ${c[2]}</span><h2>${c[0]}</h2><p>${c[1]}</p></div>`).join('')}</div><div class="assembly-bottom"><div class="case-control"><span data-case-status>向下滚动 · 探索作品内部</span><button data-case-pause aria-pressed="false">暂停运转</button></div><div class="case-stops" aria-label="作品演示镜头">${['整体','拆解','透视','检索','引用','归位'].map((x,i)=>`<button data-assembly-stop="${i}" ${i===0?'aria-current="step"':''}>${String(i+1).padStart(2,'0')}<span>${x}</span></button>`).join('')}</div><small>功能结构的概念模型 · AI 与内容均为原型演示</small></div><div class="assembly-meter" aria-hidden="true"><i></i></div></div></section>`}
export function mountAssembly(root){
 const region=root.querySelector('.assembly');if(!region)return()=>{};
 const media=matchMedia('(max-width: 480px), (max-height: 420px), (prefers-reduced-motion: reduce)'),control=new AbortController(),sticky=region.querySelector('.assembly-sticky'),chaptersDOM=[...region.querySelectorAll('[data-case-chapter]')];
 let frame=0,disposed=false,scene=null,loading=false,failed=false,visible=false,paused=false,lastTime=0,time=0,lastPaint=0,displayProgress=null;
 function fail(){failed=true;region.classList.add('case-unavailable');schedule()}
 async function loadScene(){if(loading||scene||failed||media.matches||!visible)return;loading=true;try{const {createProjectScene}=await import('./project-scene.mjs');if(disposed||media.matches)return;scene=createProjectScene(region.querySelector('.assembly-model'),fail);if(disposed){scene.dispose();scene=null;return}region.classList.add('has-webgl');schedule()}catch{fail()}finally{loading=false}}
 function draw(now){frame=0;if(disposed)return;
  const quiet=media.matches||failed;region.classList.toggle('case-quiet',quiet);const note=region.querySelector('[data-case-fallback]');note.hidden=!quiet;note.textContent=failed?'三维暂不可用，以下保留完整功能说明。':matchMedia('(prefers-reduced-motion: reduce)').matches?'已遵循“减少动效”设置，当前为静态阅读。':'当前为小屏静态阅读；在较宽窗口中可体验三维拆解。';
  const target=quiet?1:assemblyProgress(region.getBoundingClientRect().top,region.offsetHeight,sticky.offsetHeight);
  const delta=lastTime?Math.min(.05,(now-lastTime)/1000):0;lastTime=now;
  if(displayProgress===null||quiet)displayProgress=target;else displayProgress=mix(displayProgress,target,1-Math.exp(-delta*14));if(Math.abs(displayProgress-target)<.0001)displayProgress=target;
  const pose=assemblyPose(displayProgress),stage=assemblyStage(displayProgress);region.classList.toggle('case-blueprint',pose.ink>.5);
  chaptersDOM.forEach((el,i)=>el.hidden=!quiet&&i!==stage);region.querySelectorAll('[data-assembly-stop]').forEach((b,i)=>{if(i===stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});region.querySelector('.assembly-meter i').style.transform=`scaleX(${displayProgress})`;
  if(quiet&&scene){scene.dispose();scene=null;region.classList.remove('has-webgl')}
  if(!quiet&&visible){loadScene();if(!paused)time+=delta;if(now-lastPaint>=32){scene?.render(pose,stage,time);lastPaint=now}if(!paused||displayProgress!==target)schedule()}
 }
 function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(draw)}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0;schedule()});observer.observe(region);
 region.addEventListener('click',e=>{const pause=e.target.closest('[data-case-pause]');if(pause){paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'继续运转':'暂停运转';schedule();return}const b=e.target.closest('[data-assembly-stop]');if(!b)return;window.scrollTo({top:scrollY+region.getBoundingClientRect().top+(region.offsetHeight-sticky.offsetHeight)*assemblyStops[Number(b.dataset.assemblyStop)],behavior:'smooth'});},{signal:control.signal});
 window.addEventListener('scroll',schedule,{passive:true,signal:control.signal});window.addEventListener('resize',schedule,{signal:control.signal});media.addEventListener('change',schedule,{signal:control.signal});
 document.addEventListener('visibilitychange',()=>{visible=!document.hidden&&region.getBoundingClientRect().bottom>0&&region.getBoundingClientRect().top<innerHeight;lastTime=0;schedule()},{signal:control.signal});schedule();
 return()=>{disposed=true;control.abort();observer.disconnect();cancelAnimationFrame(frame);scene?.dispose()};
}
