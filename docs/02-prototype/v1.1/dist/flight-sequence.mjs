/** One deterministic flight clock drives shots, labels and landing poses. */
export const shots=[['launch',0,3],['cruise',3,7],['entry',7,11],['descent',11,15],['hatch',15,17],['emerge',17,20],['stretch',20,24.2],['gaze',24.2,28.2]];
export function flightShot(time){const row=shots.find(([,start,end])=>time>=start&&time<end);return row?{name:row[0],progress:(time-row[1])/(row[2]-row[1]),elapsed:time-row[1]}:{name:time<0?'launch':'complete',progress:time<0?0:1,elapsed:0}}
export const ease=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t)};
