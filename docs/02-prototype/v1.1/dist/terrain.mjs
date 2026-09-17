/** Shared height field and movement constraints. Mesh vertices and feet use the same surface. */
export const locations={furnace:{x:-3,z:2,r:1.2},dig:{x:2,z:-12,r:1},ship:{x:8,z:-10,r:1.25}};
export function heightAt(x,z){
 const ridge=3.7*Math.exp(-((x-1)**2/42+(z+5)**2/12));
 const distant=2.8*Math.exp(-((x+20)**2/150+(z+30)**2/90));
 const farRidge=Math.exp(-(((z+49)/13)**2))*(7+4*Math.sin(x*.13)+2.5*Math.sin(x*.43)+1.4*Math.cos(x*.83));
 return ridge+distant+farRidge+.10*Math.sin(x*.65)*Math.cos(z*.51)+.045*Math.sin(x*2.1+z*1.2);
}
export function allowedStep(from,to,obstacles=Object.values(locations).filter(p=>p!==locations.dig)){
 if(to.x<-18||to.x>19||to.z<-21||to.z>12)return false;
 const d=Math.hypot(to.x-from.x,to.z-from.z);
 if(d&&Math.abs(heightAt(to.x,to.z)-heightAt(from.x,from.z))/d>1.25)return false;
 return !obstacles.some(p=>Math.hypot(to.x-p.x,to.z-p.z)<p.r+.3);
}
export function distanceTo(x,z,id){const p=locations[id];return Math.hypot(x-p.x,z-p.z)}
