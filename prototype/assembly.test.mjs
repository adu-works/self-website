import test from 'node:test';
import assert from 'node:assert/strict';
import {assemblyProgress,assemblyPose,assemblyStage,assemblyStops,assembly} from './dist/assembly.mjs';
import {caseChapters} from './dist/case-content.mjs';
test('progress clamps outside the scene and survives a zero span',()=>{assert.equal(assemblyProgress(100,2000,800),0);assert.equal(assemblyProgress(-600,2000,800),.5);assert.equal(assemblyProgress(-3000,2000,800),1);assert.equal(assemblyProgress(0,800,800),0)});
test('all 12 chapters reachable in order with non-recursive feature destinations',()=>{assert.equal(caseChapters.length,12);assert.deepEqual(assemblyStops.map(assemblyStage),caseChapters.map((_,i)=>i));for(const c of caseChapters){assert.ok(c.route);assert.notEqual(c.route,'project/website');assert.ok(assembly().includes(`href="#/${c.route}"`))}assert.equal(assemblyStage(-1),0);assert.equal(assemblyStage(2),11)});
test('scroll reverses deterministically and chapter positions remain continuous',()=>{const before=assemblyPose(.3);assemblyPose(.8);assert.deepEqual(assemblyPose(.3),before);assert.equal(assemblyPose(0).position,0);assert.equal(assemblyPose(1).position,11);for(const stop of assemblyStops.slice(1,-1))assert.ok(Math.abs(assemblyPose(stop-.00001).position-assemblyPose(stop+.00001).position)<.001)});
