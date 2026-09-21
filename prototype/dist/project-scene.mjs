/** Original procedural instrument for the personal-space case study.
 * Each mechanical group stands for a product capability, not real hardware.
 * No model or texture is copied from the reference site. Geometry is instanced;
 * a small HDR bloom pass supplies light spill, and an ivory mode exposes edges.
 * The controller owns time, visibility and lifetime; this module owns GPU objects.
 */
import * as T from './three.module.js';
const TAU=Math.PI*2;
export function createProjectScene(host,onLost){
 const resources=new Set(),owned=o=>(resources.add(o),o),solids=[],edges=[],emitters=[],modules=[],shells=[],rotors=[];
 const renderer=new T.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,100),root=new T.Group();scene.add(root);root.rotation.order='ZYX';
 const dark=new T.Color('#1b1e20'),paper=new T.Color('#dedbd5'),blueprint={value:0};scene.background=dark.clone();
 const ambient=new T.HemisphereLight(0xd9e9f1,0x101217,2.3);scene.add(ambient);
 for(const [color,power,pos] of [[0xffffff,5,[-5,7,6]],[0x89c9eb,3,[5,-2,4]],[0xffcfa8,7,[-4,1,-5]]]){const light=new T.DirectionalLight(color,power);light.position.set(...pos);scene.add(light)}
 // Softboxes become real environment reflections, keeping black metal readable.
 const envScene=new T.Scene();envScene.background=new T.Color('#343a40');
 for(const [x,y,z,w,h,intensity] of [[0,5,0,12,3,5],[-5,0,2,3,10,3],[5,-1,-3,2,10,4]]){const m=new T.Mesh(owned(new T.PlaneGeometry(w,h)),owned(new T.MeshBasicMaterial({color:new T.Color().setScalar(intensity),side:T.DoubleSide})));m.position.set(x,y,z);m.lookAt(0,0,0);envScene.add(m)}
 const pmrem=new T.PMREMGenerator(renderer),environment=owned(pmrem.fromScene(envScene,.05));scene.environment=environment.texture;pmrem.dispose();
 function metal(color,roughness=.36,metalness=.83){const m=owned(new T.MeshStandardMaterial({color,roughness,metalness}));m.polygonOffset=true;m.polygonOffsetFactor=1;m.polygonOffsetUnits=1;m.onBeforeCompile=shader=>{shader.uniforms.caseInk=blueprint;shader.uniforms.casePaper={value:paper};shader.fragmentShader='uniform float caseInk;uniform vec3 casePaper;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\ngl_FragColor.rgb=mix(gl_FragColor.rgb,casePaper,caseInk);')};solids.push({m,color:m.color.clone(),roughness,metalness});return m}
 const graphite=metal('#293139'),black=metal('#101519',.42),steel=metal('#929ca5',.28),titanium=metal('#53636a',.3),copper=metal('#bd9471',.32),ceramic=metal('#d5d8d3',.42,.32);
 function light(color,strength=2.6){const m=owned(new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(strength),toneMapped:false}));emitters.push({m,color:m.color.clone()});return m}
 const cyan=light('#78e1cd'),gold=light('#edb780',2),blue=light('#6cb9ee'),green=light('#b8d798',2);
 const lineMat=owned(new T.LineBasicMaterial({color:0x778692,transparent:true,opacity:.18}));
 function mesh(g,m,parent,pos=[0,0,0],outline=true){owned(g);const o=new T.Mesh(g,m);o.position.set(...pos);parent.add(o);if(outline){const edge=new T.LineSegments(owned(new T.EdgesGeometry(g,32)),lineMat);o.add(edge);edges.push(edge)}return o}
 // Bevelled annuli supply machined rims instead of flat discs.
 function ringGeometry(ro,ri,depth,start=0,length=TAU){const s=new T.Shape();s.absarc(0,0,ro,start,start+length,false);if(length<TAU-.001){s.lineTo(Math.cos(start+length)*ri,Math.sin(start+length)*ri);s.absarc(0,0,ri,start+length,start,true);s.closePath()}else{const hole=new T.Path();hole.absarc(0,0,ri,0,TAU,true);s.holes.push(hole)}const g=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.022,bevelThickness:.018,curveSegments:64});g.translate(0,0,-depth/2);return g}
 function ring(parent,ro,ri,depth,z,mat=graphite){return mesh(ringGeometry(ro,ri,depth),mat,parent,[0,0,z])}
 function torus(parent,r,t,z,mat=steel,arc=TAU,start=0){const o=mesh(new T.TorusGeometry(r,t,8,128,arc),mat,parent,[0,0,z],false);o.rotation.z=start;return o}
 const dummy=new T.Object3D();
 function radial(parent,count,radius,z,size,mat,offset=0){const g=owned(new T.BoxGeometry(...size)),o=new T.InstancedMesh(g,mat,count);for(let i=0;i<count;i++){const a=i/count*TAU+offset;dummy.position.set(Math.cos(a)*radius,Math.sin(a)*radius,z);dummy.rotation.set(0,0,a);dummy.scale.set(1,1,1);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix)}o.instanceMatrix.needsUpdate=true;parent.add(o);return o}
 function bolts(parent,z,radius,count=12){const g=owned(new T.CylinderGeometry(.052,.052,.058,6));g.rotateX(Math.PI/2);const o=new T.InstancedMesh(g,steel,count);for(let i=0;i<count;i++){const a=i*TAU/count;dummy.position.set(Math.cos(a)*radius,Math.sin(a)*radius,z);dummy.rotation.set(0,0,a);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix)}parent.add(o)}
 function module(z,travel){const group=new T.Group();group.position.z=z;root.add(group);const o={group,z,travel};modules.push(o);return group}
 // Rear reservoir: pages arranged as a dense physical archive.
 const archive=module(-1.65,-3.65);ring(archive,1.52,.64,.30,0);ring(archive,1.59,1.38,.08,-.2,steel);ring(archive,1.60,1.43,.12,.19,black);bolts(archive,.27,1.49,16);radial(archive,72,1.47,0,[.15,.043,.28],titanium);
 for(let k=0;k<5;k++)ring(archive,1.27,.70,.035,-.12+k*.062,k%2?copper:steel);
 torus(archive,1.59,.018,.25,cyan);radial(archive,24,.87,.25,[.23,.07,.035],ceramic);
 // Index: two toothed encoder rings, with small luminous segments.
 const index=module(-1.04,-2.0);ring(index,1.44,1.07,.19,0,graphite);radial(index,80,1.43,0,[.18,.042,.16],steel);ring(index,1.28,1.1,.11,.18,copper);radial(index,40,1.3,.2,[.16,.022,.05],black);for(let i=0;i<8;i++)torus(index,1.48,.017,.05,i%2?gold:cyan,.52,i*TAU/8);bolts(index,.18,1.17,12);
 // Public retrieval core, nested gimbals and axial signal channels.
 const core=module(-.35,-.35);ring(core,1.47,1.24,.55,0,black);for(let z=-.28;z<=.30;z+=.07)ring(core,1.54,1.43,.022,z,titanium);const reactor=mesh(new T.IcosahedronGeometry(.63,1),metal('#245b5d',.21,.65),core,[0,0,.1]);const cage=new T.LineSegments(owned(new T.EdgesGeometry(reactor.geometry)),owned(new T.LineBasicMaterial({color:0xa2ffe5,toneMapped:false})));reactor.add(cage);rotors.push({o:reactor,speed:.17,axis:'y'});
 for(let i=0;i<3;i++){const pivot=new T.Group();core.add(pivot);pivot.rotation.set(.7+i*.45,i*.8,i*.4);torus(pivot,.78+i*.15,.024,0,i===1?gold:cyan);rotors.push({o:pivot,speed:(i%2?-.12:.1),axis:'z',base:pivot.rotation.z});}
 for(let i=0;i<6;i++){const a=i*TAU/6;const strut=mesh(new T.CylinderGeometry(.055,.055,3.45,8),titanium,root,[Math.cos(a)*1.05,Math.sin(a)*1.05,-.1]);strut.rotation.x=Math.PI/2;}
 // Main housing: curved plates lift radially away to reveal the core.
 const housing=module(.18,.65);ring(housing,1.54,1.37,.16,-.34);ring(housing,1.54,1.37,.16,.34);bolts(housing,.45,1.46,12);
 for(let i=0;i<6;i++){const a=i*TAU/6;const group=new T.Group();housing.add(group);const panel=mesh(ringGeometry(1.57,1.40,.57,a+.055,TAU/6-.11),i%2?graphite:titanium,group);const trim=mesh(ringGeometry(1.582,1.568,.32,a+.12,.1),copper,group,[0,0,0],false);shells.push({group,angle:a+Math.PI/6});}
 // Citation encoder: precision fins and paired source markers.
 const citation=module(.95,2.12);ring(citation,1.48,1.11,.16,0,black);radial(citation,96,1.46,0,[.19,.032,.20],titanium);ring(citation,1.28,1.12,.10,.16,steel);for(let k=0;k<3;k++)torus(citation,1.33+k*.05,.014,.22,k===1?gold:blue);bolts(citation,-.18,1.30,16);
 const citationRotor=new T.Group();citation.add(citationRotor);radial(citationRotor,12,.94,0,[.18,.06,.055],copper);rotors.push({o:citationRotor,speed:-.07,axis:'z'});
 // Front reading lens: rotating aperture, tick marks, luminous segmented bezel.
 const reader=module(1.51,3.5);ring(reader,1.65,1.31,.28,0,graphite);ring(reader,1.70,1.57,.08,.18,titanium);ring(reader,1.47,1.31,.07,.22,black);radial(reader,144,1.60,.25,[.075,.012,.022],steel);bolts(reader,.255,1.51,12);
 for(let i=0;i<6;i++)torus(reader,1.713,.023,.22,[cyan,blue,gold,green,cyan,gold][i],.87,i*TAU/6+.085);
 const aperture=new T.Group();reader.add(aperture);rotors.push({o:aperture,speed:.035,axis:'z'});
 for(let i=0;i<12;i++){const s=new T.Shape();s.moveTo(.48,-.18);s.lineTo(1.29,-.21);s.quadraticCurveTo(1.41,.23,1.11,.53);s.lineTo(.22,.63);s.closePath();const blade=mesh(new T.ExtrudeGeometry(s,{depth:.018,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:1,steps:1}),i%3===0?titanium:graphite,aperture,[0,0,.11+i*.003]);blade.rotation.z=i*TAU/12;}
 const face=mesh(new T.CircleGeometry(.72,96),owned(new T.MeshPhysicalMaterial({color:0x173033,metalness:.18,roughness:.1,transparent:true,opacity:.76,clearcoat:1,side:T.DoubleSide})),reader,[0,0,.29],false);
 const words=document.createElement('canvas');words.width=512;words.height=512;const ctx=words.getContext('2d');ctx.clearRect(0,0,512,512);ctx.textAlign='center';ctx.fillStyle='#c8f5e7';ctx.font='500 63px sans-serif';ctx.fillText('个人空间',256,241);ctx.font='20px monospace';ctx.fillStyle='#7aa79c';ctx.fillText('READ · ASK · TRACE',256,286);const texture=owned(new T.CanvasTexture(words));texture.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(1.18,1.18),owned(new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false})),reader,[0,0,.31],false);
 // Individual photons make the connection between parts visible in the exploded view.
 const signal=new T.Group();root.add(signal);const signalMat=owned(new T.MeshBasicMaterial({color:new T.Color('#80e8cd').multiplyScalar(3),transparent:true,opacity:.65,toneMapped:false}));const photons=mesh(new T.SphereGeometry(.035,6,6),signalMat,signal,[0,0,0],false);const particles=new T.InstancedMesh(photons.geometry,signalMat,30);signal.add(particles);photons.visible=false;
 const axis=mesh(new T.CylinderGeometry(.007,.007,12,6),signalMat,signal,[0,0,0],false);axis.rotation.x=Math.PI/2;
 // Four HTML labels are projected from actual part positions; content stays selectable.
 const labels=[['内容档案',archive,[-1.6,0,0]],['阅读界面',reader,[1.5,0,.2]],['公开问答',core,[0,-1.5,0]],['引用来源',citation,[0,1.5,0]]].map(([name,group,point])=>{const el=document.createElement('span');el.className='engine-label';el.textContent=name;host.append(el);return {el,group,point:new T.Vector3(...point)}});
 // A half-resolution, separable bloom pass; highlights only, no full-scene blur.
 const size=new T.Vector2(),target=owned(new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:true})),blurA=owned(new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false})),blurB=owned(new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false}));
 const vertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 target.samples=4;
 const blurMat=owned(new T.ShaderMaterial({uniforms:{map:{value:null},stepUV:{value:new T.Vector2()},threshold:{value:0}},vertexShader:vertex,fragmentShader:`varying vec2 vUv;uniform sampler2D map;uniform vec2 stepUV;uniform float threshold;vec3 read(vec2 p){vec3 c=texture2D(map,p).rgb;return max(c-vec3(threshold),vec3(0.));}void main(){vec3 c=read(vUv)*.227027;c+=(read(vUv+stepUV*1.384615)+read(vUv-stepUV*1.384615))*.316216;c+=(read(vUv+stepUV*3.230769)+read(vUv-stepUV*3.230769))*.070270;gl_FragColor=vec4(c,1.);}`,depthTest:false,depthWrite:false}));
 const combine=owned(new T.ShaderMaterial({uniforms:{base:{value:target.texture},bloom:{value:blurB.texture},strength:{value:.4}},vertexShader:vertex,fragmentShader:`varying vec2 vUv;uniform sampler2D base;uniform sampler2D bloom;uniform float strength;void main(){vec3 c=texture2D(base,vUv).rgb+texture2D(bloom,vUv).rgb*strength;gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`,depthTest:false,depthWrite:false}));
 const postScene=new T.Scene(),postCamera=new T.Camera(),quad=new T.Mesh(owned(new T.PlaneGeometry(2,2)),blurMat);postScene.add(quad);
 let dead=false,lastW=0,lastH=0;const projected=new T.Vector3();
 function render(p,stage,time=0){if(dead)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  if(w!==lastW||h!==lastH){lastW=w;lastH=h;renderer.setSize(w,h,false);renderer.getDrawingBufferSize(size);target.setSize(size.x,size.y);blurA.setSize(Math.ceil(size.x/2),Math.ceil(size.y/2));blurB.setSize(Math.ceil(size.x/2),Math.ceil(size.y/2));camera.aspect=w/h;camera.updateProjectionMatrix();}
  const narrow=w<950;camera.position.set(0,0,narrow?Math.max(13,10.8/camera.aspect):13.7);camera.lookAt(0,0,0);
  root.position.set(narrow?0:1.6,narrow?-.30:0,0);root.rotation.set(p.rx,p.ry,p.rz);root.scale.setScalar(p.scale*(narrow?.66:1));
  modules.forEach(({group,z,travel},i)=>{group.position.z=z+travel*p.spread;group.rotation.z=p.twist*(i-2.5)*.10});
  shells.forEach(({group,angle},i)=>{group.position.set(Math.cos(angle)*p.shell,Math.sin(angle)*p.shell,0);group.rotation.z=p.shell*(i%2?.08:-.08)});
  rotors.forEach(r=>r.o.rotation[r.axis]=(r.base||0)+time*r.speed+p.progress*.9);
  scene.background.copy(dark).lerp(paper,p.ink);blueprint.value=p.ink;lineMat.color.set(p.ink>.5?'#20282c':'#8d9da7');lineMat.opacity=.12+p.ink*.80;
  solids.forEach(({m,color,roughness,metalness})=>{m.color.copy(color).lerp(paper,p.ink);m.metalness=metalness*(1-p.ink);m.roughness=roughness+(1-roughness)*p.ink});
  emitters.forEach(({m,color})=>m.color.copy(color).multiplyScalar(1-p.ink*.93));face.opacity=.76*(1-p.ink);combine.uniforms.strength.value=.38*(1-p.ink);
  signal.visible=p.spread>.25&&p.ink<.8;signalMat.opacity=(1-p.ink)*.55;for(let i=0;i<30;i++){const phase=(i/30+time*.06)%1;dummy.position.set(Math.sin(i*2.4)*.3,Math.cos(i*2.4)*.3,phase*11-5.5);dummy.rotation.set(0,0,0);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix)}particles.instanceMatrix.needsUpdate=true;
  root.updateMatrixWorld(true);labels.forEach(({el,group,point},i)=>{projected.copy(point);group.localToWorld(projected);projected.project(camera);const show=p.spread>.5;el.style.opacity=show?String(Math.min(1,(p.spread-.5)*3)):0;el.style.transform=`translate(${(projected.x*.5+.5)*w}px,${(-projected.y*.5+.5)*h}px)`;el.style.color=p.ink>.5?'#303638':'#c9dcd6';});
  renderer.setRenderTarget(target);renderer.render(scene,camera);quad.material=blurMat;blurMat.uniforms.map.value=target.texture;blurMat.uniforms.threshold.value=.9;blurMat.uniforms.stepUV.value.set(2/size.x,0);renderer.setRenderTarget(blurA);renderer.render(postScene,postCamera);blurMat.uniforms.map.value=blurA.texture;blurMat.uniforms.threshold.value=0;blurMat.uniforms.stepUV.value.set(0,2/size.y);renderer.setRenderTarget(blurB);renderer.render(postScene,postCamera);quad.material=combine;renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
 }
 const lost=e=>{e.preventDefault();onLost()};renderer.domElement.addEventListener('webglcontextlost',lost);
 return {render,dispose(){if(dead)return;dead=true;renderer.domElement.removeEventListener('webglcontextlost',lost);labels.forEach(({el})=>el.remove());resources.forEach(r=>r.dispose());renderer.dispose();renderer.domElement.remove();}};
}
