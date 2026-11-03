import {hasOpenEdge} from './engine.mjs';
export const FEEDBACK={flipMs:360,invalidMs:240,firstTraceMs:280,overlayTraceMs:145,overlayDelayMs:30,overlayHoldMs:80,shrinkMs:210,removeMs:130,drawPixelsPerSecond:1050,overlayPixelsPerSecond:1950,shrinkPixelsPerSecond:1425};
export function exposedTiles(cells,cols,rows){return new Set(cells.map((v,i)=>v&&hasOpenEdge(cells,cols,rows,i)?i:-1).filter(i=>i>=0));}
export function newlyExposed(previous,current){return previous?[...current].filter(i=>!previous.has(i)):[];}
export function edgePath(points,startInset=[.46,.46],endInset=[.46,.46]){
 const result=points.map(p=>[...p]);if(result.length<2)return result;
 for(const [index,neighbor,inset]of [[0,1,startInset],[result.length-1,result.length-2,endInset]]){
  const source=points[index],target=points[neighbor];result[index]=[source[0]+Math.sign(target[0]-source[0])*inset[0],source[1]+Math.sign(target[1]-source[1])*inset[1]];
 }
 return result;
}
export function pathTimings(points,{constantSpeed=false,scaleX=1,scaleY=1,startInset,endInset,speed=1}={}){
 speed=Math.max(.25,Math.min(3,Number(speed)||1));
 const fixed={...FEEDBACK,firstTraceMs:FEEDBACK.firstTraceMs/speed,overlayTraceMs:FEEDBACK.overlayTraceMs/speed,shrinkMs:FEEDBACK.shrinkMs/speed};
 if(!constantSpeed)return fixed;
 const clipped=edgePath(points,startInset,endInset);let pixels=0;
 for(let i=1;i<clipped.length;i++)pixels+=Math.hypot((clipped[i][0]-clipped[i-1][0])*scaleX,(clipped[i][1]-clipped[i-1][1])*scaleY);
 return {...FEEDBACK,firstTraceMs:pixels/FEEDBACK.drawPixelsPerSecond*1000/speed,overlayTraceMs:pixels/FEEDBACK.overlayPixelsPerSecond*1000/speed,shrinkMs:pixels/FEEDBACK.shrinkPixelsPerSecond*1000/speed};
}
export function connectionMarkup(points,cols,rows,{matching=false,reverse=false,age=0,mode='double',startInset,endInset,timing=FEEDBACK,headSize=1}={}){
 points=edgePath(points,startInset,endInset);
 const encode=list=>list.map(([x,y])=>`${x+1.5},${y+1.5}`).join(' ');
 const base=`<polyline class="trace-base" pathLength="1" points="${encode(points)}" style="animation-delay:${-age}ms"/>`;
 const overlay=matching&&mode!=='shrink'?`<polyline class="trace-overlay" pathLength="1" points="${encode(reverse?[...points].reverse():points)}" style="animation-delay:${timing.firstTraceMs+timing.overlayDelayMs-age}ms"/>`:'';
 const motionPath=list=>list.map(([x,y],i)=>`${i?'L':'M'}${x+1.5} ${y+1.5}`).join(' ');
 const head=(kind,list,duration,begin)=>`<circle class="path-head ${kind}" r="${.121*Math.max(.5,Math.min(2.5,Number(headSize)||1))}" style="animation:head-appear 1ms step-start ${begin==='indefinite'?0:parseFloat(begin)}ms both"><animateMotion id="${kind}-motion" class="${kind}-motion" path="${motionPath(list)}" dur="${duration}ms" begin="indefinite" data-start-ms="${begin}" calcMode="paced" fill="freeze"/></circle>`;
 const heads=!matching?'':mode==='shrink'?head('head-draw',points,timing.firstTraceMs,`${-age}ms`)+head('head-shrink',points,timing.shrinkMs,'indefinite'):head('head-draw',points,timing.firstTraceMs,`${-age}ms`)+head('head-overlay',reverse?[...points].reverse():points,timing.overlayTraceMs,`${timing.firstTraceMs+timing.overlayDelayMs-age}ms`);
 return `<svg style="--first-trace:${timing.firstTraceMs}ms;--overlay-trace:${timing.overlayTraceMs}ms;--shrink-trace:${timing.shrinkMs}ms" class="route ${matching?mode==='shrink'?'single-route':'matching-route':'hint-route'}" viewBox="0 0 ${cols+2} ${rows+2}" preserveAspectRatio="none" aria-hidden="true">${base}${overlay}${heads}</svg>`;
}
export const FLIP_KEYS=[
 {transform:'scale(1) rotateY(0deg)',offset:0},
 {transform:'scale(.52) rotateY(150deg)',offset:.4},
 {transform:'scale(.5) rotateY(200deg)',offset:.55},
 {transform:'scale(.8) rotateY(300deg)',offset:.8},
 {transform:'scale(1) rotateY(360deg)',offset:1}
];

export function spawnKeyframes(style){
 if(style==='drop')return [{opacity:0,transform:'translateY(-30px) scale(.9)'},{opacity:1,transform:'translateY(3px) scale(1.02)',offset:.75},{opacity:1,transform:'translateY(0) scale(1)'}];
 if(style==='flip')return [{opacity:0,transform:'perspective(450px) rotateY(-100deg) scale(.7)'},{opacity:1,transform:'perspective(450px) rotateY(12deg) scale(1.04)',offset:.75},{opacity:1,transform:'perspective(450px) rotateY(0) scale(1)'}];
 return [{opacity:0,transform:'translateY(16px) scale(.45)'},{opacity:1,transform:'translateY(-3px) scale(1.08)',offset:.7},{opacity:1,transform:'translateY(0) scale(1)'}];
}
export function spawnDelays(cols,rows,spread=460,direction='diagonal-tl'){
 const scores=Array.from({length:cols*rows},(_,i)=>{
  const x=i%cols,y=Math.floor(i/cols),radius=Math.hypot(x-(cols-1)/2,y-(rows-1)/2);
  switch(direction){
   case 'in-out':return radius;
   case 'out-in':return -radius;
   case 'left-right':return x;
   case 'right-left':return cols-1-x;
   case 'top-bottom':return y;
   case 'bottom-top':return rows-1-y;
   case 'diagonal-tr':return cols-1-x+y;
   case 'diagonal-bl':return x+rows-1-y;
   case 'diagonal-br':return cols+rows-2-x-y;
   default:return x+y;
  }
 });
 if(direction==='spiral-in'||direction==='spiral-out'){
  let left=0,right=cols-1,top=0,bottom=rows-1,rank=0;
  while(left<=right&&top<=bottom){
   for(let x=left;x<=right;x++)scores[top*cols+x]=rank++;top++;
   for(let y=top;y<=bottom;y++)scores[y*cols+right]=rank++;right--;
   if(top<=bottom){for(let x=right;x>=left;x--)scores[bottom*cols+x]=rank++;bottom--;}
   if(left<=right){for(let y=bottom;y>=top;y--)scores[y*cols+left]=rank++;left++;}
  }
  if(direction==='spiral-out')for(let i=0;i<scores.length;i++)scores[i]=scores.length-1-scores[i];
 }
 const min=Math.min(...scores),range=Math.max(...scores)-min;
 return scores.map(score=>range?(score-min)/range*spread:0);
}
export function spawnDelay(index,cols,rows,spread=460,direction='diagonal-tl'){return spawnDelays(cols,rows,spread,direction)[index];}

export const INVALID_KEYS=[
 {transform:'translateX(0)'},
 {transform:'translateX(-4px)',offset:.18},
 {transform:'translateX(4px)',offset:.38},
 {transform:'translateX(-3px)',offset:.58},
 {transform:'translateX(2px)',offset:.78},
 {transform:'translateX(0)'}
];

// Rules can expose a tile before the blocker-removal presentation finishes.
export function isVisuallyEnclosed(cells,cols,rows,index,shownExposure,holdNewExposure){
 return !!cells[index]&&(!hasOpenEdge(cells,cols,rows,index)||!!(holdNewExposure&&shownExposure&&!shownExposure.has(index)));
}
