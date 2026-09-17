/** Session-scoped browser history. Back pops an entry; destinations never masquerade as Back. */
export function createNavigation(host,readView,render){
 const session=Math.random().toString(36).slice(2),entries=new Map();let next=0;
 const route=()=>host.location.hash.slice(2)||'scene';
 let current={id:next++,route:route(),from:null,view:null};entries.set(current.id,current);
 const stamp=()=>({...(host.history.state||{}),fieldnotes:{session,id:current.id}});
 host.history.replaceState(stamp(),'');host.history.scrollRestoration='manual';
 function capture(){current.view=readView()}
 function draw(){render(current.route,current.view)}
 function go(to,{replace=false}={}){
  if(to===current.route){draw();return}
  capture();const from=replace?current.from:current.id;
  current={id:next++,route:to,from,view:null};entries.set(current.id,current);
  host.history[replace?'replaceState':'pushState'](stamp(),'','#/'+to);draw();
 }
 host.addEventListener('popstate',e=>{capture();const mark=e.state?.fieldnotes;
  if(mark?.session===session&&entries.has(mark.id))current=entries.get(mark.id);
  else{current={id:next++,route:route(),from:null,view:null};entries.set(current.id,current);host.history.replaceState(stamp(),'')}
  draw();
 });
 host.addEventListener('hashchange',()=>{if(route()!==current.route){capture();current={id:next++,route:route(),from:current.id,view:null};entries.set(current.id,current);host.history.replaceState(stamp(),'');draw()}});
 return{go,start:draw,previous(){return entries.get(current.from)?.route||null},back(fallback='home'){if(entries.has(current.from))host.history.back();else go(fallback,{replace:true})}};
}
export function routeLabel(route){const root=route?.split('/')[0];return({scene:'火星',home:'主站',projects:'项目列表',articles:'文章列表',project:'项目详情',article:'文章',chat:'对话',about:'关于',contact:'联系',social:'社媒主页',admin:'工作台'})[root]||'上一页'};
