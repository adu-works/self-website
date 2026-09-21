import test from 'node:test';
import assert from 'node:assert/strict';
import {assemblyProgress,assemblyPose,assemblyStage,assemblyStops} from './dist/assembly.mjs';
test('progress clamps outside the scene and survives a zero span',()=>{assert.equal(assemblyProgress(100,2000,800),0);assert.equal(assemblyProgress(-600,2000,800),.5);assert.equal(assemblyProgress(-3000,2000,800),1);assert.equal(assemblyProgress(0,800,800),0)});
test('mechanical sequence explodes, changes material, then exactly reassembles',()=>{const start=assemblyPose(0),end=assemblyPose(1);delete start.progress;delete end.progress;assert.deepEqual(start,end);assert.equal(assemblyPose(.22).spread,1);assert.equal(assemblyPose(.43).ink,1);assert.equal(assemblyPose(1).shell,0);assert.deepEqual(assemblyStops.map(assemblyStage),[0,1,2,3,4,5]);});
test('reversing scroll restores all transforms and materials continuously',()=>{const before=assemblyPose(.3);assemblyPose(.8);assert.deepEqual(assemblyPose(.3),before);for(const stop of assemblyStops.slice(1,-1)){const a=assemblyPose(stop-.00001),b=assemblyPose(stop+.00001);for(const key of Object.keys(a))assert.ok(Math.abs(a[key]-b[key])<.001);}});
