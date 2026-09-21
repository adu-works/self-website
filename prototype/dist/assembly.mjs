/** A project-specific exploded view, mounted only inside the personal-site case study.
 * The scroll math is pure; WebGL is lazy-loaded and released when leaving this page.
 * The HTML narrative remains available when motion or WebGL is unavailable.
 */
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
export function assemblyProgress(top,height,viewport){return clamp(-top/Math.max(1,height-viewport))}
// Each stop is a camera/composition state of the SAME product, not another website section.
const frames=[
 {at:0,spread:0,rx:-.12,ry:-.48,rz:-.06,scale:1},
 {at:.23,spread:1,rx:-.55,ry:.52,rz:-.18,scale:.92},
 {at:.48,spread:1,rx:.20,ry:-.30,rz:.10,scale:.98},
 {at:.73,spread:.76,rx:-.08,ry:.22,rz:-.03,scale:1.05},
 {at:1,spread:0,rx:0,ry:0,rz:0,scale:1.1}
];
export function assemblyPose(progress){const p=clamp(progress);let i=0;while(i<frames.length-2&&p>frames[i+1].at)i++;const a=frames[i],b=frames[i+1],t=smooth((p-a.at)/(b.at-a.at));return Object.fromEntries(['spread','rx','ry','rz','scale'].map(k=>[k,mix(a[k],b[k],t)]))}
export function assemblyStage(p){return p<.15?0:p<.36?1:p<.60?2:p<.88?3:4}
const chapters=[
 ['一个知识空间。','先看完整的阅读界面。专题、正文和来源各在其位。'],
 ['把界面拆开看。','目录退到侧后方，正文向前展开。读者能看清自己在哪里、接下来读什么。'],
 ['专注于阅读。','文章层转向读者。目录保持在旁边，长文阅读有清楚的路径。'],
 ['回答，有据可查。','问答与来源卡靠近正文；引用连接到具体段落。这是公开问答的设计演示。'],
 ['合拢，继续阅读。','界面重新合拢。找到问题、读懂内容、核对来源，组成这件作品的阅读体验。']
];
export function assembly(){return `<section class="assembly" aria-label="个人空间作品的三维拆解"><div class="assembly-sticky"><div class="assembly-top"><span>PERSONAL SPACE / INTERACTIVE CASE STUDY</span><a href="#/project/website" data-section="project-overview">跳过演示，阅读项目说明 ↓</a></div><div class="assembly-copy"><p class="case-fallback-note" data-case-fallback hidden></p><span class="assembly-kicker" data-case-count>01 / 05</span>${chapters.map((c,i)=>`<div class="case-chapter" ${i?'hidden':''} data-case-chapter="${i}"><h2>${c[0]}</h2><p>${c[1]}</p></div>`).join('')}<small>示例作品 · 界面与 AI 均为原型</small></div><div class="assembly-model" aria-hidden="true"><div class="case-static"><span>个人空间 / 阅读体验</span><h3>一个人的项目，<br>先做小，再做长。</h3><p>专题目录 · 分章正文 · 可定位来源</p><div>公开问答　→　文章来源　→　具体段落</div></div></div><div class="assembly-bottom"><span data-case-status>向下滚动，旋转并拆开这件作品</span><div class="case-stops" aria-label="作品演示镜头">${['全貌','拆解','阅读','引用','归位'].map((x,i)=>`<button data-assembly-stop="${i}" ${i===0?'aria-current="step"':''}>${String(i+1).padStart(2,'0')} ${x}</button>`).join('')}</div></div><div class="assembly-meter" aria-hidden="true"><i></i></div></div></section>`}
export function mountAssembly(root){
 const region=root.querySelector('.assembly');if(!region)return()=>{};
 const media=matchMedia('(max-width: 480px), (max-height: 420px), (prefers-reduced-motion: reduce)'),control=new AbortController(),sticky=region.querySelector('.assembly-sticky');
 let frame=0,disposed=false,scene=null,loading=false,failed=false;
 const stops=[0,.23,.48,.73,1],chaptersDOM=[...region.querySelectorAll('[data-case-chapter]')];
 // Avoid importing Three.js into the works list, home or reduced-motion presentation.
 async function loadScene(){if(loading||scene||failed||media.matches)return;loading=true;try{const {createProjectScene}=await import('./project-scene.mjs');if(disposed||media.matches)return;scene=await createProjectScene(region.querySelector('.assembly-model'),()=>{failed=true;schedule();});if(disposed){scene.dispose();scene=null;return;}region.classList.add('has-webgl');schedule();}catch{failed=true;region.classList.add('case-unavailable');schedule();}finally{loading=false;}}
 function draw(){frame=0;if(disposed)return;const quiet=media.matches||failed;region.classList.toggle('case-quiet',quiet);const note=region.querySelector('[data-case-fallback]');note.hidden=!quiet;note.textContent=failed?'当前浏览器未能加载三维画面，以下保留静态说明。':matchMedia('(prefers-reduced-motion: reduce)').matches?'已遵循系统“减少动效”设置，当前展示静态内容。':'当前窗口较小，展示静态内容；加宽至 480px 以上且高度超过 420px 可查看三维演示。';const p=quiet?1:assemblyProgress(region.getBoundingClientRect().top,region.offsetHeight,sticky.offsetHeight),stage=assemblyStage(p);
  chaptersDOM.forEach((el,i)=>el.hidden=!quiet&&i!==stage);region.querySelector('[data-case-count]').textContent=`0${stage+1} / 05`;
  region.querySelectorAll('[data-assembly-stop]').forEach((b,i)=>{if(i===stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  region.querySelector('[data-case-status]').textContent=stage===4?'继续向下，阅读项目说明':'滚动探索 · 也可点击选择镜头';region.querySelector('.assembly-meter i').style.transform=`scaleX(${p})`;
  if(quiet&&scene){scene.dispose();scene=null;region.classList.remove('has-webgl');}else if(!quiet){loadScene();scene?.render(assemblyPose(p),stage);}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
 region.addEventListener('click',e=>{const b=e.target.closest('[data-assembly-stop]');if(!b)return;const i=Number(b.dataset.assemblyStop);window.scrollTo({top:scrollY+region.getBoundingClientRect().top+(region.offsetHeight-sticky.offsetHeight)*stops[i],behavior:media.matches?'instant':'smooth'});},{signal:control.signal});
 window.addEventListener('scroll',schedule,{passive:true,signal:control.signal});window.addEventListener('resize',schedule,{signal:control.signal});media.addEventListener('change',schedule,{signal:control.signal});draw();
 return()=>{disposed=true;control.abort();cancelAnimationFrame(frame);scene?.dispose();};
}
