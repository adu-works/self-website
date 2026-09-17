import assert from 'node:assert/strict';
import {heightAt,allowedStep,locations} from './dist/terrain.mjs';
// A traversal crosses a real elevation peak and returns to the far side.
let p={x:2,z:4},peak=0,up=0,down=0;
for(let z=3.9;z>=-14;z-=.1){const q={x:2,z};assert(allowedStep(p,q,[]));const d=heightAt(q.x,q.z)-heightAt(p.x,p.z);if(d>0)up+=d;else down-=d;peak=Math.max(peak,heightAt(q.x,q.z));p=q;}
assert(peak>3.4);assert(up>3);assert(down>3);assert(heightAt(2,-14)<.4);
assert(!allowedStep({x:-3,z:4},{x:-3,z:2.3}));
assert(!allowedStep({x:8,z:-7},{x:8,z:-9.5}));
assert(!allowedStep(p,{x:20,z:0}));
console.log('PASS: continuous uphill/downhill traversal, furnace/ship collision, world bounds');
