import test from 'node:test';
import assert from 'node:assert/strict';
import {assemblyProgress,assemblyPose,assemblyStage} from './dist/assembly.mjs';
test('scroll progress clamps outside the scene and survives a zero scroll span',()=>{assert.equal(assemblyProgress(100,2000,800),0);assert.equal(assemblyProgress(-600,2000,800),.5);assert.equal(assemblyProgress(-3000,2000,800),1);assert.equal(assemblyProgress(0,800,800),0)});
test('all modules assemble exactly and reverse scrolling reproduces the same pose',()=>{for(let i=0;i<3;i++){assert.ok(Object.values(assemblyPose(1,i)).every(value=>value===0));const before=assemblyPose(.3,i);assemblyPose(.8,i);assert.deepEqual(assemblyPose(.3,i),before);assert.ok(assemblyPose(0,i).depth>0)}});

test('chapters settle one panel before the next starts, and finish with an overview',()=>{assert.equal(assemblyPose(.26,0).depth,0);assert.ok(assemblyPose(.26,1).depth>0);assert.equal(assemblyPose(.54,1).depth,0);assert.ok(assemblyPose(.54,2).depth>0);assert.deepEqual([.26,.54,.82,1].map(assemblyStage),[0,1,2,3]);});
