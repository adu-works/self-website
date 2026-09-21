/** WebGL product diagram, using the existing Three.js distribution.
 * Canvas textures are original UI mockups (not photography or fabricated project evidence).
 * render is demand-driven by scroll/resize, without a permanent animation loop.
 */
import * as T from './three.module.js';
export function createProjectScene(host,onLost){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
 host.append(renderer.domElement);const world=new T.Scene(),camera=new T.PerspectiveCamera(39,1,.1,80),model=new T.Group();world.add(model);
 world.add(new T.HemisphereLight(0xe7efff,0x1f3354,2));const key=new T.DirectionalLight(0xffffff,3);key.position.set(-3,7,9);world.add(key);const rim=new T.PointLight(0x6699ff,25);rim.position.set(5,2,2);world.add(rim);
 const resources=[],panels=[];let dead=false,lastPose=null,lastStage=0;
 const own=x=>(resources.push(x),x);
 function texture(kind){
  const c=document.createElement('canvas');c.width=kind==='header'?1600:kind==='article'?900:550;c.height=kind==='header'?140:kind==='source'?440:1000;
  const g=c.getContext('2d'),w=c.width,h=c.height;g.fillStyle=kind==='chat'?'#dbe6f7':'#f4f7fc';g.fillRect(0,0,w,h);
  const text=(str,x,y,size=28,color='#253f65',serif=false)=>{g.fillStyle=color;g.font=`${size}px ${serif?'serif':'sans-serif'}`;g.fillText(str,x,y);};
  const line=(x,y,len,color='#cbd5e4',thick=3)=>{g.fillStyle=color;g.fillRect(x,y,len,thick)};
  if(kind==='header'){text('凌  黄凌波',45,84,44);text('首页    文字    书籍    作品    小店    关于',530,82,30);text('个人空间',1370,82,25,'#6e829d');}
  if(kind==='toc'){text('专题目录',38,72,37);line(38,115,w-76);['01  从一个问题开始','02  看见具体需求','03  做出最小作品','04  记录过程','05  继续迭代'].forEach((x,i)=>{if(i===0){g.fillStyle='#d9e4ff';g.fillRect(18,151,510,76)}text(x,38,200+i*114,28,i===0?'#3159c5':'#72829b')});text('你正在读',38,863,23,'#72829b');text('第一章 / 独立实践',38,916,27);}
  if(kind==='article'){text('独立实践 / 示例文章',55,70,24,'#72829b');text('一个人的项目，',55,175,60,'#223b63',true);text('先做小，再做长。',55,260,60,'#3159c5',true);text('从一个具体的问题开始。',55,337,30);line(55,385,790);text('01  把想法放进真实的使用场景',55,452,33);[510,550,590,630].forEach((y,i)=>line(55,y,720-i%2*110,'#b9c8dc',7));g.fillStyle='#e3ebff';g.fillRect(45,693,810,163);g.fillStyle='#4169cc';g.fillRect(45,693,7,163);text('先完成一个能被使用的结果。',76,757,34,'#264b9f',true);text('这一段，作为问答中的引用来源。',76,815,24,'#617695');text('02  把选择和过程留下来',55,940,32);}
  if(kind==='source'){text('来源 01 ↗',35,76,36,'#3159c5');line(35,111,w-70);text('一个人的项目',35,177,35,'#253f65',true);text('第一章 · 具体段落',35,243,27);text('查看原文与上下文',35,339,25,'#3159c5');}
  if(kind==='chat'){text('问问本站',34,75,38);text('公开内容 · 模拟回答',34,122,23,'#71839f');g.fillStyle='#f5f8fd';g.fillRect(24,183,502,133);text('怎样开始自己的项目？',45,255,29);text('先选一个具体的问题，',34,401,27);text('做出可使用的最小结果。',34,451,27);text('再通过反馈继续改进。',34,501,27);g.fillStyle='#b9cdf7';g.fillRect(34,555,470,88);text('01  查看文章依据 ↗',55,608,27,'#3159c5');line(34,843,470);text('围绕公开内容继续提问…',34,907,23,'#71839f');}
  const tx=own(new T.CanvasTexture(c));tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return tx;
 }
 function slab(kind,w,h,x,y,z,explode){
  const group=new T.Group(),geometry=own(new T.BoxGeometry(w,h,.075));
  const metal=own(new T.MeshStandardMaterial({color:0x8a9bb8,metalness:.7,roughness:.3}));const face=own(new T.MeshBasicMaterial({map:texture(kind)}));
  const mesh=new T.Mesh(geometry,[metal,metal,metal,metal,face,metal]);group.add(mesh);
  const edge=new T.LineSegments(own(new T.EdgesGeometry(geometry)),own(new T.LineBasicMaterial({color:0x9bbaff,transparent:true,opacity:.45})));group.add(edge);
  const p={group,base:new T.Vector3(x,y,z),explode:new T.Vector3(...explode),edge,kind};panels.push(p);model.add(group);return p;
 }
 const baseGeo=own(new T.BoxGeometry(6.9,4.65,.16)),baseMat=own(new T.MeshStandardMaterial({color:0x263a58,metalness:.8,roughness:.25})),base=new T.Mesh(baseGeo,baseMat);base.position.z=-.16;model.add(base);
 const baseEdges=new T.LineSegments(own(new T.EdgesGeometry(baseGeo)),own(new T.LineBasicMaterial({color:0x7593bd})));base.add(baseEdges);
 slab('header',6.5,.57,0,1.88,.025,[0,.72,-.2]);
 slab('toc',1.34,3.43,-2.55,-.25,.03,[-1.20,.13,-1.05]);
 slab('article',3.3,3.43,-.11,-.25,.035,[-.18,.15,.85]);
 slab('source',1.55,1.24,2.49,.85,.04,[1.05,.8,1.55]);
 const chat=slab('chat',1.55,2.06,2.49,-.88,.04,[.6,-.6,1.1]);
 const linkGeo=own(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(),new T.Vector3(),new T.Vector3()]));const link=new T.Line(linkGeo,own(new T.LineDashedMaterial({color:0xaacbff,dashSize:.10,gapSize:.08,transparent:true,opacity:.9})));model.add(link);
 const endpoints=[0,1].map(()=>{const m=new T.Mesh(own(new T.SphereGeometry(.055,12,8)),own(new T.MeshBasicMaterial({color:0xd3e3ff})));model.add(m);return m});
 function render(p,stage){if(dead)return;lastPose=p;lastStage=stage;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.set(0,0,11.5);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
  model.rotation.set(p.rx,p.ry,p.rz);model.scale.setScalar(p.scale);base.position.z=-.16-p.spread*.55;
  panels.forEach(o=>{o.group.position.copy(o.base).addScaledVector(o.explode,p.spread);o.group.rotation.set(0,0,0);if(o.kind==='article')o.group.rotation.y=-p.ry*p.spread*.6;if(o.kind==='source')o.group.rotation.set(.08*p.spread,-.13*p.spread,.03*p.spread);if(o.kind==='chat')o.group.rotation.set(-.08*p.spread,-.08*p.spread,-.06*p.spread);const active=stage===2?o.kind==='article':stage===3?['source','chat'].includes(o.kind):false;o.edge.material.opacity=active?1:.35;o.edge.material.color.set(active?0xd7e7ff:0x93b6ff);});
  link.visible=stage===3;endpoints.forEach(e=>e.visible=stage===3);if(link.visible){const a=chat.group.position.clone().add(new T.Vector3(-.8,0,.08)),b=panels[2].group.position.clone().add(new T.Vector3(1.68,-.8,.08)),mid=(a.x+b.x)/2;const pos=link.geometry.attributes.position;[a,new T.Vector3(mid,a.y,a.z),new T.Vector3(mid,b.y,b.z),b].forEach((v,i)=>pos.setXYZ(i,v.x,v.y,v.z));pos.needsUpdate=true;link.computeLineDistances();endpoints[0].position.copy(a);endpoints[1].position.copy(b);}
  renderer.render(world,camera);
 }
 // WebGL loss leaves the text and static representation available.
 const lost=e=>{e.preventDefault();host.closest('.assembly').classList.remove('has-webgl');host.closest('.assembly').classList.add('case-unavailable');onLost();};renderer.domElement.addEventListener('webglcontextlost',lost);
 const resize=new ResizeObserver(()=>{if(lastPose)render(lastPose,lastStage)});resize.observe(host);
 return {render,dispose(){if(dead)return;dead=true;resize.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);resources.forEach(x=>x.dispose());renderer.dispose();renderer.domElement.remove();}};
}
