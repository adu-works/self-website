import test from 'node:test';import assert from 'node:assert/strict';import {digPose,stretchPose,DIG_DURATION,landingCamera,gazeCamera} from './dist/motion.mjs';
test('dig and stretch settle to neutral without stopping at a bent pose',()=>{for(const t of [0,DIG_DURATION])for(const v of Object.values(digPose(t)))assert.equal(v,0);for(const t of [0,4.2])for(const v of Object.values(stretchPose(t)))assert.equal(v,0);assert.ok(digPose(.68).bend>.4);assert.equal(stretchPose(2).raise,1)});
test('exit camera orbits to rear shoulder, continuous into stretch',()=>{const exit=landingCamera('emerge',1),stretch=landingCamera('stretch',0);for(let i=0;i<3;i++)assert.ok(Math.abs(exit.at[i]-stretch.at[i])<1e-8);assert.ok(stretch.at[2]<3.45);assert.ok(landingCamera('stretch',1).at[2]<3.45)});

test('hatch to exit camera is continuous',()=>{const a=landingCamera('hatch',1),b=landingCamera('emerge',0);for(const key of ['at','look'])for(let i=0;i<3;i++)assert.ok(Math.abs(a[key][i]-b[key][i])<1e-8)});

test('eyeline cut never pushes the camera through the head',()=>{
 const head=[0,1.77,3.45];
 for(let i=0;i<=100;i++){const frame=gazeCamera(i/100);if(frame.subjectVisible)assert.ok(Math.hypot(...frame.at.map((v,j)=>v-head[j]))>2);else assert.ok(frame.at[2]>head[2]+.5)}
 assert.deepEqual(gazeCamera(0).at,landingCamera('stretch',1).at);
 assert.ok(Math.hypot(...gazeCamera(.4499).at.map((v,i)=>v-gazeCamera(.45).at[i]))>2);
 assert.deepEqual(gazeCamera(.4499).look.map(v=>Math.round(v*100)),gazeCamera(.45).look.map(v=>Math.round(v*100)));
});
