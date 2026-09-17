/** Shared action curves: anticipation, contact, effort, recovery. Seconds, radians and local metres. */
export const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export const DIG_DURATION=1.85;
export function sample(keys,t){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){const [end,value]=keys[i],[start,prior]=keys[i-1];if(t<=end)return prior+(value-prior)*smooth((t-start)/(end-start))}return keys.at(-1)[1]}
export function digPose(t){return{
 bend:sample([[0,0],[.3,.08],[.68,.48],[1.1,.42],[1.5,.12],[DIG_DURATION,0]],t),
 reach:sample([[0,0],[.3,-.08],[.68,.32],[1.1,.2],[1.5,-.06],[DIG_DURATION,0]],t),
 lift:sample([[0,0],[.3,.11],[.68,-.18],[1.1,-.13],[1.5,.13],[DIG_DURATION,0]],t),
 pitch:sample([[0,0],[.3,-.25],[.68,.2],[1.1,.42],[1.5,-.42],[DIG_DURATION,0]],t),
 support:sample([[0,0],[.3,1],[1.45,1],[DIG_DURATION,0]],t)
}}
export function stretchPose(t){return{
 raise:sample([[0,0],[.3,0],[1.65,1],[2.45,1],[4.05,0],[4.2,0]],t),
 arch:sample([[0,0],[.8,0],[1.8,.025],[2.45,.025],[3.9,0],[4.2,0]],t),
 tilt:sample([[0,0],[4.2,0]],t)
}}
// The orbit crosses around the character's side, ending behind their shoulder, never through their face.
export function landingCamera(phase,p){
 if(phase==='hatch')return {at:[5,3.6,7],look:[0,2,1]};
 if(phase==='emerge'){const t=smooth(p),angle=Math.atan2(5,6.35)+(2.55-Math.atan2(5,6.35))*t,radius=Math.hypot(5,6.35)+(3.2-Math.hypot(5,6.35))*t,z=.65+2.8*p;return{at:[Math.sin(angle)*radius,3.6-1.25*t,z+Math.cos(angle)*radius],look:[0,2-.45*t,1+(z-1)*t]}}
 if(phase==='stretch'){const t=smooth(p),angle=2.55+.28*t,radius=3.2-.7*t;return{at:[Math.sin(angle)*radius,2.35-.3*t,3.45+Math.cos(angle)*radius],look:[0,1.55,3.45]}}
 return null;
}

/** Eyeline match: cut between two cameras; never interpolate through the actor. */
export function gazeCamera(p){
 const end=landingCamera('stretch',1),target=[-6,1.8,24];
 if(p<.45){const t=smooth(p/.45);return{at:end.at,look:end.look.map((v,i)=>v+(target[i]-v)*t),subjectVisible:true,shot:'shoulder'}}
 return{at:[-.16,1.77,4.02],look:target,subjectVisible:false,shot:'pov'};
}
