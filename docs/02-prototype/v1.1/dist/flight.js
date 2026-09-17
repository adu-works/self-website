/** Continuous return journey, using the same rocket and character throughout every shot. */
import * as T from './three.module.js';
import {landingCamera,gazeCamera} from './motion.mjs';
import {flightShot,ease} from './flight-sequence.mjs';
export function createFlight({ship,person,hatch,engine,rig,play,mixer,mars,camera}){
 const earth=new T.Scene();earth.background=new T.Color(0x07121e);
 earth.add(new T.HemisphereLight(0xe1f0ff,0x68737a,3));const sun=new T.DirectionalLight(0xffe8cb,4);sun.position.set(-12,20,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,far:60});sun.shadow.normalBias=.02;earth.add(sun);
 const orbit=new T.TextureLoader().load('./earth-orbit.png');orbit.colorSpace=T.SRGBColorSpace;
 const ground=new T.Mesh(new T.PlaneGeometry(400,400),new T.MeshStandardMaterial({color:0x929c8e,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;earth.add(ground);
 const pad=new T.Mesh(new T.CylinderGeometry(5,5.2,.2,64),new T.MeshStandardMaterial({color:0x626b6b,roughness:.9}));pad.receiveShadow=true;earth.add(pad);
 const ring=new T.Mesh(new T.RingGeometry(3.9,4,80),new T.MeshBasicMaterial({color:0xe9dfbd,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.12;earth.add(ring);
 const clouds=new T.Group();earth.add(clouds);const cloudMat=new T.MeshBasicMaterial({color:0xe9f3ff,transparent:true,opacity:.1,depthWrite:false});
 for(let i=0;i<24;i++){const c=new T.Mesh(new T.SphereGeometry(1,12,8),cloudMat);c.position.set(Math.sin(i*7)*35,12+i*5,Math.cos(i*4)*28);c.scale.set(9,1.3,4);clouds.add(c)}
 const plasma=new T.Mesh(new T.SphereGeometry(1.6,24,16),new T.MeshBasicMaterial({color:0xff9b55,transparent:true,opacity:.22,wireframe:true,depthWrite:false}));plasma.scale.y=2;ship.add(plasma);plasma.position.y=2.4;plasma.visible=false;
 let running=false,elapsed=0,last='',onPhase,onComplete,startY=ship.position.y,shot='idle';
 const point=(x,y,z)=>new T.Vector3(x,y,z);
 function view(at,look){camera.position.copy(at);camera.lookAt(look)}
 function reset(){running=false;onComplete=null;onPhase=null;mars.add(ship);mars.add(person);ship.rotation.set(0,0,0);ship.position.set(8,startY,-10);person.visible=true;engine.visible=false;plasma.visible=false;camera.far=220;camera.updateProjectionMatrix()}
 return{
  start(callbacks){elapsed=0;last='';running=true;startY=ship.position.y;onPhase=callbacks.onPhase;onComplete=callbacks.onComplete;person.visible=false;engine.visible=true;hatch.rotation.y=0;camera.far=600;camera.updateProjectionMatrix()},
  reset,
  get running(){return running},get shot(){return shot},
  update(dt,reduced){
   if(!running)return null;
   elapsed+=dt*(reduced?2:1);const s=flightShot(elapsed),p=ease(s.progress);shot=s.name;
   if(s.name!==last){last=s.name;onPhase?.(s.name)}
   if(s.name==='complete'){running=false;const done=onComplete;onComplete=null;done?.();return earth}
   play(s.name==='emerge'?'Walk':'Idle_Neutral');mixer()?.update(dt);rig()?.pose(s.name==='hatch'?'open-hatch':s.name,s.elapsed);
   if(s.name==='launch'){
    ship.position.y=startY+Math.pow(s.progress,2)*60;engine.scale.y=.8+Math.sin(elapsed*24)*.1;
    view(point(17,ship.position.y+7,6),ship.position.clone().add(point(0,2,0)));return mars;
   }
   earth.add(ship);ground.visible=pad.visible=ring.visible=['descent','hatch','emerge','stretch','gaze'].includes(s.name);clouds.visible=['entry','descent'].includes(s.name);plasma.visible=s.name==='entry';
   if(s.name==='cruise'){
    earth.background=orbit;earth.fog=null;ship.position.set(-7+14*p,24,-4);ship.rotation.z=-.85;engine.visible=true;
    view(point(14,29,22),point(0,26,0));
   }else if(s.name==='entry'){
    earth.background=new T.Color().lerpColors(new T.Color(0x132b4a),new T.Color(0x91b8cc),p);earth.fog=new T.FogExp2(0xc5dce7,.001+p*.005);
    ship.position.set(3*(1-p),100-70*p,0);ship.rotation.z=-.85*(1-p);engine.visible=true;plasma.material.opacity=.15+Math.sin(p*Math.PI)*.3;
    view(ship.position.clone().add(point(10,4,18)),ship.position.clone().add(point(0,2,0)));
   }else{
    earth.background=new T.Color(0xadc7d1);earth.fog=new T.FogExp2(0xadc7d1,.012);ship.rotation.set(0,0,0);ship.position.set(0,s.name==='descent'?30*(1-p):.1,0);engine.visible=s.name==='descent';
    if(s.name==='descent'){view(point(12,7,17),point(0,Math.max(2,ship.position.y+1),0))}
    if(s.name==='hatch'){earth.add(person);person.visible=true;person.position.set(0,1.05,.65);person.rotation.set(0,0,0);hatch.rotation.y=-1.9*p;view(point(5,3.6,7),point(0,2,1))}
    if(['emerge','stretch','gaze'].includes(s.name)){
     earth.add(person);person.visible=true;hatch.rotation.y=-1.9;person.rotation.set(0,0,0);
     if(s.name==='emerge'){
      const walk=s.progress;person.position.set(0,Math.max(.1,1.05-walk*2),.65+walk*2.8);
      const frame=landingCamera('emerge',s.progress);view(point(...frame.at),point(...frame.look));
     }else{
      person.position.set(0,.1,3.45);
      if(s.name==='stretch'){const frame=landingCamera('stretch',s.progress);view(point(...frame.at),point(...frame.look))}
      else{
       person.rotation.y=-.18*ease(Math.min(1,s.progress/.4));
       const frame=gazeCamera(s.progress);person.visible=frame.subjectVisible;
       view(point(...frame.at),point(...frame.look));
      }
     }
    }
   }
   return earth;
  }
 };
}
