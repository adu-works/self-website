import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from './dist/three.module.js';
import {GLTFLoader} from './dist/GLTFLoader.js';
import {createCharacterRig} from './dist/character-rig.js';
import {shots,flightShot,ease} from './dist/flight-sequence.mjs';
globalThis.ProgressEvent=class{};
test('all journey shots contiguous and land before hatch, gaze ends in completion',()=>{
 for(let i=0;i<shots.length;i++){const [name,start,end]=shots[i];assert.equal(flightShot(start).name,name);assert.equal(flightShot(end-.001).name,name);if(i)assert.equal(start,shots[i-1][2])}
 assert.equal(flightShot(28.2).name,'complete');assert.equal(ease(0),0);assert.equal(ease(1),1);
});
test('real GLB socket stays in palm; carry preserves walking hips',async()=>{
 const bytes=fs.readFileSync(new URL('./dist/astronaut.glb',import.meta.url));const {scene:model,animations}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const person=new T.Group();person.add(model);const mixer=new T.AnimationMixer(model);mixer.clipAction(animations.find(a=>a.name.endsWith('|Idle_Neutral'))).play();mixer.update(.1);person.updateMatrixWorld(true);
 const tool=new T.Group();const rig=createCharacterRig(model,person,tool);mixer.stopAllAction();mixer.clipAction(animations.find(a=>a.name.endsWith('|Walk'))).play();const hips=model.getObjectByName('Hips');
 for(let i=0;i<30;i++){mixer.update(.05);person.position.x+=.03;person.rotation.y+=.05;person.updateMatrixWorld(true);const before=hips.getWorldPosition(new T.Vector3());rig.pose('carry');const after=hips.getWorldPosition(new T.Vector3());assert.ok(before.distanceTo(after)<1e-8);assert.ok(rig.gripError()<1e-8);assert.ok(rig.attached())}
});

test('unkeyed torso/head offsets do not accumulate during stretch or gaze',async()=>{
 const bytes=fs.readFileSync(new URL('./dist/astronaut.glb',import.meta.url));const {scene:model,animations}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');const person=new T.Group();person.add(model);const mixer=new T.AnimationMixer(model);mixer.clipAction(animations.find(a=>a.name.endsWith('|Idle_Neutral'))).play();mixer.update(.1);const rig=createCharacterRig(model,person,new T.Group());const arm=model.getObjectByName('UpperArmR'),neutral=arm.quaternion.clone();
 for(const pose of ['stretch','gaze']){rig.pose(pose,2);const first=['Abdomen','Chest','Head'].map(n=>model.getObjectByName(n).quaternion.clone());for(let i=0;i<120;i++)rig.pose(pose,2);first.forEach((q,i)=>assert.ok(q.clone().normalize().angleTo(model.getObjectByName(['Abdomen','Chest','Head'][i]).quaternion.clone().normalize())<1e-7))}
 rig.pose('stretch',2);rig.pose('gaze',0);assert.ok(neutral.clone().normalize().angleTo(arm.quaternion.clone().normalize())<1e-7);
});
