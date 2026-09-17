/** Bone-space tool sockets and arm posing. Walking clips keep their authored hips and legs. */
import * as T from './three.module.js';
import {digPose,stretchPose,smooth} from './motion.mjs';
const vec=()=>new T.Vector3(),quat=()=>new T.Quaternion();
export function createCharacterRig(model,person,shovel){
 const bones={};model.traverse(o=>{if(o.isBone)bones[o.name]=o});
 const wrist=bones.WristR;
 const armNames=['UpperArmR','LowerArmR','WristR','UpperArmL','LowerArmL','WristL'],armRest=Object.fromEntries(armNames.map(name=>[name,bones[name].quaternion.clone()])),armPoses=new Set(['carry','dig','stretch','open-hatch']);let previousPose='idle';
 const rest=Object.fromEntries(['Abdomen','Chest','Head'].map(name=>[name,bones[name].quaternion.clone()]));
 model.updateMatrixWorld(true);
 // Convert a palm grip into bone-local coordinates; the GLB skeleton has a 100× scale.
 const palm=wrist.getWorldPosition(vec()).add(new T.Vector3(0,-.085,.025));
 const socket=new T.Group();socket.name='shovel-palm-socket';wrist.add(socket);
 socket.position.copy(wrist.worldToLocal(palm));
 socket.quaternion.copy(wrist.getWorldQuaternion(quat()).invert().multiply(person.getWorldQuaternion(quat())));
 socket.scale.setScalar(1/wrist.getWorldScale(vec()).x);
 socket.add(shovel);shovel.position.set(0,0,0);shovel.rotation.set(0,0,-.12);
 function aim(bone,child,point){
  model.updateMatrixWorld(true);
  const origin=bone.getWorldPosition(vec());
  const from=child.getWorldPosition(vec()).sub(origin).normalize(),to=point.clone().sub(origin).normalize();
  const world=quat().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(quat()));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(quat()).invert().multiply(world));
  bone.updateMatrixWorld(true);
 }
 function hand(side,targetLocal,poleLocal){
  const upper=bones['UpperArm'+side],lower=bones['LowerArm'+side],end=bones['Wrist'+side];
  model.updateMatrixWorld(true);
  const a=upper.getWorldPosition(vec()),b=lower.getWorldPosition(vec()),c=end.getWorldPosition(vec());
  const l1=a.distanceTo(b),l2=b.distanceTo(c),target=person.localToWorld(targetLocal.clone());
  const direction=target.clone().sub(a),distance=T.MathUtils.clamp(direction.length(),Math.abs(l1-l2)+.001,l1+l2-.001);direction.normalize();
  const pole=person.localToWorld(poleLocal.clone()).sub(a);pole.addScaledVector(direction,-pole.dot(direction)).normalize();
  const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
  const elbow=a.clone().addScaledVector(direction,along).addScaledVector(pole,Math.sqrt(Math.max(0,l1*l1-along*along)));
  aim(upper,lower,elbow);aim(lower,end,a.clone().addScaledVector(direction,distance));
 }
 return{
  pose(kind,t=0){
   if(armPoses.has(kind)||armPoses.has(previousPose))for(const [name,rotation] of Object.entries(armRest))bones[name].quaternion.copy(rotation);
   previousPose=kind;
   // These joints are not keyed in every source clip. Rebase offsets so they never accumulate per frame.
   for(const [name,rotation] of Object.entries(rest))bones[name].quaternion.copy(rotation);
   if(kind==='carry'){
    hand('R',new T.Vector3(-.32,1.25,.36),new T.Vector3(-.65,1.12,.25));
    hand('L',new T.Vector3(.32,1.25,.36),new T.Vector3(.65,1.12,.25));
   }
   if(kind==='dig'){
    const d=digPose(t);
    hand('R',new T.Vector3(-.22,1.05+d.lift,.1+d.reach),new T.Vector3(-.6,1,.25));
    // Keep the tool in the palm, while orienting the shaft through the digging arc.
    model.updateMatrixWorld(true);
    shovel.quaternion.copy(socket.getWorldQuaternion(quat()).invert().multiply(person.getWorldQuaternion(quat())).multiply(quat().setFromEuler(new T.Euler(d.pitch,0,-.12))));
    model.updateMatrixWorld(true);
    const support=person.worldToLocal(shovel.localToWorld(new T.Vector3(0,.26,0)));
    hand('L',new T.Vector3(.22,1.05,.08).lerp(support,d.support),new T.Vector3(.6,1.15,.2));
   }else shovel.rotation.set(0,0,-.12);
   if(kind==='open-hatch'){hand('R',new T.Vector3(-.24,1.28,.39),new T.Vector3(-.6,1.2,.2))}
   if(kind==='gaze'){bones.Head.rotation.y-=.1*smooth(t/1.6)}
   if(kind==='stretch'){
    const {raise,arch,tilt}=stretchPose(t);
    bones.Abdomen.rotation.x-=arch; bones.Chest.rotation.z+=tilt;
    bones.Head.rotation.x-=arch*.6;
    // Solve the comfortable end pose, then rotate joints along arcs. Moving wrists
    // vertically through the shoulder creates an elbow singularity and a mechanical shrug.
    hand('R',new T.Vector3(-.25,1.82,.09),new T.Vector3(-.62,1.62,.24));
    hand('L',new T.Vector3(.25,1.82,.09),new T.Vector3(.62,1.62,.24));
    for(const name of armNames){const raised=bones[name].quaternion.clone();bones[name].quaternion.copy(armRest[name]).slerp(raised,raise)}
   }
   model.updateMatrixWorld(true);
  },
  eyes(){return bones.Head.getWorldPosition(vec()).add(person.localToWorld(new T.Vector3(0,.06,.14)).sub(person.getWorldPosition(vec())))},
  handPosition(){return socket.getWorldPosition(vec())},
  gripError(){return socket.getWorldPosition(vec()).distanceTo(shovel.getWorldPosition(vec()))},
  attached(){return shovel.parent===socket&&socket.parent===wrist}
 };
}
