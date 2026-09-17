/** Mars renderer: continuous terrain, grounded locomotion and deliberate object actions. UI owns journey stages. */
import * as T from './three.module.js';
import {createCharacterRig} from './character-rig.js';
import {digPose} from './motion.mjs';
import {createFlight} from './flight.js';
import {GLTFLoader} from './GLTFLoader.js';
import {heightAt,allowedStep,distanceTo,locations} from './terrain.mjs';
export function createWorld(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new T.Scene();scene.background=new T.Color(0x947361);scene.fog=new T.FogExp2(0x947361,.009);
 const camera=new T.PerspectiveCamera(48,1,.1,220);camera.position.set(9,6.5,14);
 scene.add(new T.HemisphereLight(0xe3d9c8,0x49322c,2));const sun=new T.DirectionalLight(0xffd8b1,3.4);sun.position.set(-18,30,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,far:90});sun.shadow.bias=-.0004;sun.shadow.normalBias=.025;scene.add(sun);
 const mat=(c,r=.9,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const texture=new T.TextureLoader().load('./mars-regolith.png');texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(32,32);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
 const soil=new T.MeshStandardMaterial({color:0xb5a99a,map:texture,bumpMap:texture,bumpScale:.15,roughness:1});
 const geometry=new T.PlaneGeometry(180,180,360,360);geometry.rotateX(-Math.PI/2);const pos=geometry.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,heightAt(pos.getX(i),pos.getZ(i)));geometry.computeVertexNormals();
 const ground=new T.Mesh(geometry,soil);ground.receiveShadow=true;scene.add(ground);
 function mesh(g,m,parent,xyz=[0,0,0]){const v=new T.Mesh(g,m);v.position.set(...xyz);v.castShadow=true;v.receiveShadow=true;parent.add(v);return v}
 const box=(w,h,d,m,p,xyz)=>mesh(new T.BoxGeometry(w,h,d),m,p,xyz),cyl=(a,b,h,m,p,xyz)=>mesh(new T.CylinderGeometry(a,b,h,32),m,p,xyz);
 const dark=mat(0x303331,.5,.7),metal=mat(0x8b8d82,.5,.6),white=mat(0xc9c9b5,.65,.3),rust=mat(0x6c4735),gold=mat(0xb39a64,.6,.5);
 let seed=123;function rand(){seed=seed*16807%2147483647;return(seed-1)/2147483646}
 const stoneTexture=texture.clone();stoneTexture.repeat.set(.6,.6);const stoneGeometry=new T.DodecahedronGeometry(1,1);const stonePos=stoneGeometry.attributes.position;for(let i=0;i<stonePos.count;i++){const f=.85+.18*Math.sin(stonePos.getX(i)*7+stonePos.getY(i)*9+stonePos.getZ(i)*4);stonePos.setXYZ(i,stonePos.getX(i)*f,stonePos.getY(i)*f,stonePos.getZ(i)*f)}stoneGeometry.computeVertexNormals();const rocks=new T.InstancedMesh(stoneGeometry,new T.MeshStandardMaterial({color:0x766b5e,map:stoneTexture,bumpMap:stoneTexture,bumpScale:.09,roughness:1}),480);const dummy=new T.Object3D();for(let i=0;i<480;i++){const x=(rand()-.5)*100,z=(rand()-.5)*100,r=.035+rand()**5*.9;dummy.position.set(x,heightAt(x,z)+r*.2,z);dummy.rotation.set(rand()*3,rand()*6,rand()*3);dummy.scale.set(r*1.6,r*.65,r);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix)}rocks.castShadow=true;rocks.receiveShadow=true;scene.add(rocks);
 // A photographic art backdrop supplies the distant skyline; the playable foreground remains continuous 3D terrain.
 const panorama=new T.TextureLoader().load('./mars-panorama.png');panorama.colorSpace=T.SRGBColorSpace;scene.background=panorama;
 const furnace=new T.Group();scene.add(furnace);furnace.scale.setScalar(.65);furnace.position.set(-3,heightAt(-3,2),2);
 cyl(1.1,1.2,.25,dark,furnace,[0,.13,0]);cyl(.83,.96,1.4,rust,furnace,[0,.9,0]);cyl(.89,.97,.12,dark,furnace,[0,.42,0]);cyl(.9,.9,.18,dark,furnace,[0,1.55,0]);cyl(.32,.43,1,dark,furnace,[0,2.1,0]);cyl(.4,.4,.1,metal,furnace,[0,2.65,0]);
 const firemat=new T.MeshStandardMaterial({color:0xffaa46,emissive:0xff5800,emissiveIntensity:3});box(.61,.6,.11,firemat,furnace,[0,.83,.89]);
 const door=new T.Group();door.position.set(-.38,.85,.98);furnace.add(door);box(.77,.77,.11,dark,door,[.38,0,0]);box(.06,.25,.14,metal,door,[.63,0,.1]);
 const glow=new T.PointLight(0xff6619,4,5);glow.position.set(0,.9,1.1);furnace.add(glow);
 const anvil=box(.85,.25,.45,dark,furnace,[1.15,.7,.3]);box(.45,.6,.35,dark,furnace,[1.15,.3,.3]);
 for(const x of [-.48,.48]){box(.13,.12,.65,dark,furnace,[x,.15,-.95])}
 const person=new T.Group();scene.add(person);person.position.set(-.8,heightAt(-.8,3.3),3.3);
 const body=new T.Group();person.add(body);let mixer,clips={},currentClip,rig,loaded=false;
 // The model includes authored walk cycles; a temporary capsule is replaced on asset load.
 const fallback=mesh(new T.CapsuleGeometry(.25,1,5,10),white,body,[0,.85,0]);
 new GLTFLoader().load('./astronaut.glb',g=>{body.remove(fallback);const model=g.scene;mixer=new T.AnimationMixer(model);for(const c of g.animations)clips[c.name.split('|')[1]]=mixer.clipAction(c);play('Idle_Neutral');mixer.update(.01);model.updateMatrixWorld(true);model.traverse(o=>{if(o.isSkinnedMesh)o.computeBoundingBox()});const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());model.scale.multiplyScalar(1.85/size.y);model.position.y=-bounds.min.y*(1.85/size.y);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});body.add(model);person.updateMatrixWorld(true);rig=createCharacterRig(model,person,shovel);loaded=true},undefined,()=>{canvas.dataset.assetError='角色模型未加载';});
 function play(name){const c=clips[name]||clips.Idle_Neutral;if(!c||c===currentClip)return;currentClip?.fadeOut(.18);c.reset().fadeIn(.18).play();currentClip=c}
 const shovel=new T.Group();shovel.position.set(.48,.7,.35);person.add(shovel);cyl(.03,.03,1.25,mat(0x9f805c),shovel,[0,.15,0]);const blade=box(.29,.4,.065,metal,shovel,[0,-.58,0]);blade.rotation.x=-.35;shovel.visible=false;
 const marker=new T.Group();marker.position.set(2,heightAt(2,-12),-12);scene.add(marker);const ring=mesh(new T.RingGeometry(.85,.9,40),new T.MeshBasicMaterial({color:0xe3cc83,side:T.DoubleSide}),marker,[0,.015,0]);ring.rotation.x=-Math.PI/2;marker.visible=false;
 const hole=mesh(new T.CircleGeometry(.8,40),mat(0x37281f),marker,[0,.02,0]);hole.rotation.x=-Math.PI/2;hole.scale.setScalar(.01);
 const chest=new T.Group();chest.position.set(2,heightAt(2,-12)-.4,-12);scene.add(chest);box(1.05,.46,.7,dark,chest,[0,.24,0]);for(const x of [-.38,.38])box(.065,.48,.72,gold,chest,[x,.24,0]);const lid=new T.Group();lid.position.set(0,.48,-.35);chest.add(lid);box(1.1,.14,.76,gold,lid,[0,.05,.36]);chest.visible=false;
 const ship=new T.Group();ship.position.set(8,heightAt(8,-10),-10);scene.add(ship);mesh(new T.CylinderGeometry(.85,1.03,3.4,32,1,true,.5,Math.PI*2-1),white,ship,[0,2.5,0]);cyl(.85,.94,1.55,white,ship,[0,3.425,0]);cyl(1,1.03,.5,white,ship,[0,1.05,0]);mesh(new T.ConeGeometry(.86,1.5,32),white,ship,[0,4.95,0]);cyl(1.05,1.05,.2,dark,ship,[0,1.1,0]);for(let i=0;i<4;i++){let leg=box(.15,1.4,.15,dark,ship,[Math.sin(i*Math.PI/2)*1.15,.6,Math.cos(i*Math.PI/2)*1.15]);leg.rotation.z=.22;}box(.7,1.3,.08,dark,ship,[0,1.95,.2]);const hatch=new T.Group();hatch.position.set(-.4,1.3,1.08);ship.add(hatch);box(.8,1.35,.1,white,hatch,[.4,.65,0]);box(.18,.3,.12,dark,hatch,[.62,.65,.08]);for(let i=0;i<4;i++)box(.65,.12,.2,metal,ship,[0,.2+i*.26,1.7-i*.13]);
 const engine=cyl(.6,.08,2,firemat,ship,[0,-.4,0]);engine.visible=false;
 const particles=[];for(let i=0;i<48;i++){const p=mesh(new T.SphereGeometry(.018+rand()*.035,5,4),firemat,scene);p.visible=false;particles.push({p,v:new T.Vector3((rand()-.5)*5,1+rand()*4,(rand()-.5)*5)})}
 let target=person.position.clone(),active=true,mode='idle',time=0,total=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,digs=0,doorOpen=false,hatchOpen=false,lidOpen=false,carried=false,smashed=false,burstTime=99,burstOrigin=new T.Vector3();const keys=new Set();
 function burst(point,dust=false){burstTime=0;burstOrigin.copy(point);for(const {p} of particles){p.material=dust?rust:firemat;p.visible=true}}
 function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}resize();window.addEventListener('resize',resize);
 const ray=new T.Raycaster(),pointer=new T.Vector2();canvas.addEventListener('pointerdown',e=>{if(!active||mode!=='idle')return;pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(ground)[0];if(hit){target.copy(hit.point);target.x=T.MathUtils.clamp(target.x,-18,19);target.z=T.MathUtils.clamp(target.z,-21,12)}});
 window.addEventListener('keydown',e=>{if(!active||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();keys.add(e.key)}});window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>keys.clear());
 function move(d){target.copy(person.position);if(d==='up')target.z-=1.8;if(d==='down')target.z+=1.8;if(d==='left')target.x-=1.8;if(d==='right')target.x+=1.8}
 const dropStart=new T.Vector3(),dropGoal=new T.Vector3(),pickupStart=new T.Vector3();
 const flight=createFlight({ship,person,hatch,engine,rig:()=>rig,play,mixer:()=>mixer,mars:scene,camera});
 const furnacePoint=()=>({x:furnace.position.x,z:furnace.position.z,r:1.1});
 const carryPoint=()=>person.localToWorld(new T.Vector3(0,1.08,1.1));
 function chooseDrop(){const p=person.localToWorld(new T.Vector3(0,0,2.4));p.y=heightAt(p.x,p.z);return Math.abs(p.x)<17&&p.z>-19&&p.z<10&&Math.hypot(p.x-8,p.z+10)>3?p:null}

 const clock=new T.Clock(),look=new T.Vector3(0,1,0);let walking=false,slope=0;
 function tick(){requestAnimationFrame(tick);const elapsed=clock.getDelta(),dt=Math.min(elapsed,.04);if(!active)return;total+=dt;time+=elapsed;walking=false;
 if(flight.running){const frame=flight.update(elapsed,reduced);if(frame)renderer.render(frame,camera);return}
 if(mode==='idle'){
 if(keys.size){target.copy(person.position);if(keys.has('w')||keys.has('ArrowUp'))target.z-=2;if(keys.has('s')||keys.has('ArrowDown'))target.z+=2;if(keys.has('a')||keys.has('ArrowLeft'))target.x-=2;if(keys.has('d')||keys.has('ArrowRight'))target.x+=2}
 const dx=target.x-person.position.x,dz=target.z-person.position.z,d=Math.hypot(dx,dz);
 if(d>.05){const step=Math.min(d,dt*(carried?1.15:2.8)/(1+Math.max(0,slope)*1.8)),nx=person.position.x+dx/d*step,nz=person.position.z+dz/d*step;
 if(allowedStep(person.position,{x:nx,z:nz},[...(!smashed&&!carried?[furnacePoint()]:[]),locations.ship])){const y=heightAt(nx,nz);slope=(y-person.position.y)/step;person.position.set(nx,y,nz);person.rotation.y=Math.atan2(dx,dz);walking=true}else target.copy(person.position);}
 play(walking?'Walk':'Idle_Neutral');body.rotation.x=walking?T.MathUtils.clamp(slope*.12,-.12,.15):0;
 }else{play(mode==='forge'?'Punch_Right':'Idle_Neutral');
 if(mode==='dig'){body.rotation.x=digPose(time).bend;if(time>.68&&time-elapsed<=.68)burst(new T.Vector3(2,heightAt(2,-12)+.1,-12),true)}
 if(mode==='forge'&&time>.3&&time-elapsed<=.3)burst(furnace.position.clone().add(new T.Vector3(1,.85,.3)));
 if(mode==='carry'){furnace.position.lerpVectors(pickupStart,carryPoint(),Math.min(1,time/.9));furnace.rotation.set(0,person.rotation.y,0)}
 if(mode==='put-down'){const t=Math.min(1,time/.9),ease=t*t*(3-2*t);furnace.position.lerpVectors(dropStart,dropGoal,ease);furnace.rotation.z=0}
 if(mode==='smash'){furnace.position.y=Math.max(heightAt(-3,2),furnace.position.y-dt*8);furnace.rotation.z+=dt*3;if(time>.4&&!smashed){smashed=true;furnace.visible=false;burst(person.position.clone().add(new T.Vector3(0,.3,1)))}}
 if(mode==='board'){const t=Math.min(1,time);person.position.lerp(new T.Vector3(8,heightAt(8,-10)+.85,-8.9),Math.min(1,dt*3));play('Walk')}if(mode==='launch'){ship.position.y+=dt*(3+time*7);engine.visible=true;person.visible=false}
 }
 mixer?.update(dt*(walking?(carried?.45:Math.max(.6,1-Math.max(0,slope)*.5)):1));
 rig?.pose(carried?'carry':mode==='dig'?'dig':'idle',time);
 if(carried&&mode==='idle'){furnace.position.copy(carryPoint());furnace.rotation.set(0,person.rotation.y,0)}
 door.rotation.y=T.MathUtils.damp(door.rotation.y,doorOpen?-1.8:0,8,dt);hatch.rotation.y=T.MathUtils.damp(hatch.rotation.y,hatchOpen?-1.9:0,6,dt);lid.rotation.x=T.MathUtils.damp(lid.rotation.x,lidOpen?-1.8:0,6,dt);
 burstTime+=dt;particles.forEach(({p,v})=>{if(burstTime<1.4){p.position.copy(burstOrigin).addScaledVector(v,burstTime);p.position.y-=3*burstTime*burstTime;p.visible=p.position.y>heightAt(p.position.x,p.position.z)}else p.visible=false});
 const follow=person.position.clone();const camGoal=follow.clone().add(new T.Vector3(innerWidth<700?7:8,6.2,11));if(mode==='launch')camGoal.set(15,12,5);camera.position.lerp(camGoal,reduced?1:1-Math.exp(-dt*2.5));look.lerp(follow.clone().add(new T.Vector3(0,1.1,-2)),reduced?1:1-Math.exp(-dt*3));camera.lookAt(look);renderer.render(scene,camera);
 }tick();
 return{move,startFlight(callbacks){shovel.visible=false;body.rotation.x=0;mode='flight';target.copy(person.position);keys.clear();flight.start(callbacks)},canDrop(){return !!chooseDrop()},setActive(v){active=v;keys.clear();target.copy(person.position)},reduce(v){reduced=v},near(id){const p=id==='furnace'?furnacePoint():locations[id];return Math.hypot(person.position.x-p.x,person.position.z-p.z)<(id==='ship'?3:id==='dig'?1.5:2.7)},go(id){const p=id==='furnace'?furnacePoint():locations[id];if(p){target.set(p.x+(id==='furnace'?1.9:0),0,p.z+(id==='dig'?1.15:2.1))}},action(kind){mode=kind;time=0;target.copy(person.position);const point=['forge','open-furnace','carry','put-down'].includes(kind)?furnacePoint():['dig','open-chest'].includes(kind)?locations.dig:locations.ship;if(!['put-down','smash'].includes(kind))person.rotation.y=Math.atan2(point.x-person.position.x,point.z-person.position.z);if(kind==='open-furnace')doorOpen=true;if(kind==='open-chest')lidOpen=true;if(kind==='open-hatch')hatchOpen=true;if(kind==='carry'){pickupStart.copy(furnace.position);carried=true}if(kind==='put-down'){dropStart.copy(furnace.position);dropGoal.copy(chooseDrop()||furnace.position)};},finish(kind){mode='idle';body.rotation.x=0;if(kind==='put-down'){carried=false;furnace.position.copy(dropGoal);furnace.rotation.set(0,0,0);target.copy(person.position)}if(kind==='forge'){shovel.visible=true;marker.visible=true}if(kind==='dig'){digs++;hole.scale.setScalar(Math.min(1,digs/5));chest.visible=digs>=3;chest.position.y=heightAt(2,-12)-.55+Math.min(5,digs)*.11}if(kind==='board'){person.visible=false}},reset(){flight.reset();person.position.set(-.8,heightAt(-.8,3.3),3.3);target.copy(person.position);person.visible=true;furnace.visible=true;furnace.position.set(-3,heightAt(-3,2),2);furnace.rotation.set(0,0,0);ship.position.set(8,heightAt(8,-10),-10);shovel.visible=chest.visible=marker.visible=engine.visible=false;doorOpen=hatchOpen=lidOpen=carried=smashed=false;digs=0;mode='idle';},snapshot(){return {position:person.position.toArray(),groundHeight:heightAt(person.position.x,person.position.z),mode,flightShot:flight.shot,shovelAttached:rig?.attached()||false,gripError:rig?.gripError()??null,carried,furnacePosition:furnace.position.toArray(),walking,slope,modelLoaded:loaded,shovel:shovel.visible,digs,chest:chest.visible,doorOpen,hatchOpen,lidOpen}}};
}
