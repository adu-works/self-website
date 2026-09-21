import test from 'node:test';
import assert from 'node:assert/strict';
import {assemblyProgress,assemblyPose,assemblyStage} from './dist/assembly.mjs';
test('progress clamps outside the scene and survives a zero span',()=>{assert.equal(assemblyProgress(100,2000,800),0);assert.equal(assemblyProgress(-600,2000,800),.5);assert.equal(assemblyProgress(-3000,2000,800),1);assert.equal(assemblyProgress(0,800,800),0)});
test('the same product explodes and reassembles front-facing',()=>{assert.equal(assemblyPose(0).spread,0);assert.equal(assemblyPose(.23).spread,1);assert.deepEqual(assemblyPose(1),{spread:0,rx:0,ry:0,rz:0,scale:1.1});assert.deepEqual([0,.23,.48,.73,1].map(assemblyStage),[0,1,2,3,4]);});
test('reversing scroll restores the pose without jumps between keyframes',()=>{const before=assemblyPose(.3);assemblyPose(.8);assert.deepEqual(assemblyPose(.3),before);for(const stop of [.23,.48,.73]){const a=assemblyPose(stop-.00001),b=assemblyPose(stop+.00001);for(const key of Object.keys(a))assert.ok(Math.abs(a[key]-b[key])<.001);}});
