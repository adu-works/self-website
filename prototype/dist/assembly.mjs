/** Scroll-driven product explanation. Pure progress math stays separate from DOM effects.
 * Sections remain real readable HTML; reduced motion and narrow screens use a static layout.
 */
export function assemblyProgress(top,height,viewport){return Math.max(0,Math.min(1,-top/Math.max(1,height-viewport)))}
export function assemblyPose(progress,index){const arrival=Math.max(0,Math.min(1,(progress-index*.28)/.23));const eased=1-(1-arrival)**3;return {x:(1-eased)*[70,-75,50][index],y:(1-eased)*[-55,10,45][index],rotation:(1-eased)*[-12,10,-8][index],depth:(1-eased)*[100,60,80][index]}}
export function assemblyStage(progress){return progress<.28?0:progress<.56?1:progress<.86?2:3}
export function assembly(){return `<section class="assembly" aria-label="个人空间的功能组装"><div class="assembly-sticky"><div class="assembly-copy"><span class="eyebrow">个人空间 / 交互设计原型</span><h2>把分散的表达，<br>组装成<span>自己的空间。</span></h2><p class="assembly-intro">一篇文字建立认识，一部作品提供依据，<br>一份清楚的介绍，让交流有了下一步。</p><ol class="assembly-steps"><li><button data-assembly-stop="0"><small>01 / 文字</small><b>找到一个关心的问题</b><span>从文章与专题开始，建立认识。</span></button></li><li><button data-assembly-stop="1"><small>02 / 作品</small><b>看见想法怎样落地</b><span>目标、过程与取舍，给表达以依据。</span></button></li><li><button data-assembly-stop="2"><small>03 / 小店</small><b>决定是否值得进一步了解</b><span>看目录与试读，再主动联系。</span></button></li></ol><div class="assembly-status"><span data-assembly-status>01 / 04 · 从文字开始</span><button data-assembly-stop="3">查看完整组装</button></div><p class="assembly-hint">向下滚动，看看它们如何组成一个网站。</p><a class="text-link" href="#/project/website">阅读完整项目说明 ↗</a><a class="assembly-skip" href="#/projects" data-section="project-directory">跳过动效，查看作品目录 ↓</a></div><div class="assembly-model"><div class="assembly-shell"><div class="assembly-browser"><i></i><i></i><i></i><span>LINGBO / PERSONAL SPACE</span></div><div class="assembly-header"><strong>黄凌波</strong><span>文字　作品　小店</span></div><div class="assembly-module module-writing"><small>文字 / IDEAS</small><h3>先做小，<br>再做长。</h3><p>从一个具体的问题开始。</p><div class="assembly-lines"><i></i><i></i><i></i></div></div><div class="assembly-module module-project"><small>作品 / PRACTICE</small><div class="assembly-diagram"><i></i><i></i><i></i></div><h3>让想法，有迹可循。</h3><p>目标、过程与选择。</p></div><div class="assembly-module module-shop"><small>小店 / NEXT STEP</small><h3>先了解，再决定。</h3><p>目录 · 试读 · 交付说明</p><span>查看内容与联系入口 ↗</span></div><div class="assembly-caption">DESIGN PROTOTYPE · 示例界面，非真实业务成果</div></div></div><div class="assembly-meter" aria-hidden="true"><i></i></div></div></section>`}
/** Owns only this section's listeners; native scroll remains interruptible and reversible. */
export function mountAssembly(root){
 const region=root.querySelector('.assembly');if(!region)return()=>{};
 const media=matchMedia('(max-width: 900px), (max-height: 680px), (prefers-reduced-motion: reduce)'),control=new AbortController();
 const sticky=region.querySelector('.assembly-sticky'),panels=[...region.querySelectorAll('.assembly-module')],steps=[...region.querySelectorAll('.assembly-steps li')];
 const stops=[.26,.54,.82,1],labels=['从文字开始','让实践提供依据','让交流有下一步','一个完整的个人空间'];let frame=0;
 function draw(){
  frame=0;const p=media.matches?1:assemblyProgress(region.getBoundingClientRect().top,region.offsetHeight,sticky.offsetHeight),stage=assemblyStage(p);
  panels.forEach((el,i)=>{const pose=assemblyPose(p,i);el.style.transform=media.matches?'none':`translate3d(${pose.x}px,${pose.y}px,${pose.depth}px) rotateZ(${pose.rotation}deg)`;el.classList.toggle('is-current',!media.matches&&stage===i);});
  region.querySelector('.assembly-shell').style.transform=media.matches?'none':`rotateX(${(1-p)*12}deg) rotateY(${(1-p)*-16}deg) rotateZ(${(1-p)*4}deg)`;
  steps.forEach((el,i)=>{el.classList.toggle('is-lit',media.matches||stage===3||stage===i);const b=el.querySelector('button');if(stage===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  region.querySelector('[data-assembly-status]').textContent=`0${stage+1} / 04 · ${labels[stage]}`;
  region.querySelector('.assembly-meter i').style.transform=`scaleX(${p})`;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw)}
 region.addEventListener('click',e=>{const b=e.target.closest('[data-assembly-stop]');if(!b)return;const i=Number(b.dataset.assemblyStop);if(media.matches){(panels[i]||region.querySelector('.assembly-model')).scrollIntoView({block:'center',behavior:'instant'});return;}const top=scrollY+region.getBoundingClientRect().top+(region.offsetHeight-sticky.offsetHeight)*stops[i];window.scrollTo({top,behavior:'smooth'});},{signal:control.signal});
 window.addEventListener('scroll',schedule,{passive:true,signal:control.signal});window.addEventListener('resize',schedule,{signal:control.signal});media.addEventListener('change',schedule,{signal:control.signal});draw();return()=>{control.abort();cancelAnimationFrame(frame)};
}
