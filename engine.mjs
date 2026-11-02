export const DIRECTIONS=[[1,0],[0,1],[-1,0],[0,-1]];
export function rng(seed){let a=seed|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function shuffled(items,random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// One empty padded lane around the board is part of the legal route space.
export function route(cells,cols,rows,a,b,requireMatch=true){
 if(a===b||a<0||b<0||a>=cells.length||b>=cells.length||!cells[a]||!cells[b]||(requireMatch&&cells[a]!==cells[b]))return null;
 const w=cols+2,h=rows+2,sx=a%cols+1,sy=Math.floor(a/cols)+1,tx=b%cols+1,ty=Math.floor(b/cols)+1;
 const best=new Int8Array(w*h*4).fill(9),queue=[{x:sx,y:sy,d:-1,t:0,p:null}];let head=0;
 while(head<queue.length){const current=queue[head++];
  for(let d=0;d<4;d++){
   const turns=current.t+(current.d!==-1&&current.d!==d?1:0);if(turns>2)continue;
   const x=current.x+DIRECTIONS[d][0],y=current.y+DIRECTIONS[d][1];if(x<0||x>=w||y<0||y>=h)continue;
   if(x===sx&&y===sy)continue;
   const target=x===tx&&y===ty;
   if(!target&&x>0&&x<=cols&&y>0&&y<=rows&&cells[(y-1)*cols+x-1])continue;
   const key=(y*w+x)*4+d;if(best[key]<=turns)continue;best[key]=turns;
   const next={x,y,d,t:turns,p:current};
   if(target){const all=[];for(let n=next;n;n=n.p)all.push([n.x-1,n.y-1]);all.reverse();const points=[all[0]];for(let i=1;i<all.length-1;i++)if((all[i][0]-all[i-1][0])!==(all[i+1][0]-all[i][0])||(all[i][1]-all[i-1][1])!==(all[i+1][1]-all[i][1]))points.push(all[i]);points.push(all.at(-1));return points;}
   queue.push(next);
  }
 }
 return null;
}
export function moves(cells,cols,rows){const result=[];for(let a=0;a<cells.length;a++)if(cells[a])for(let b=a+1;b<cells.length;b++)if(cells[a]===cells[b]){const path=route(cells,cols,rows,a,b);if(path)result.push({a,b,path});}return result;}
export function verify(board){const state=[...board.cells];for(const {a,b} of board.solution){if(!route(state,board.cols,board.rows,a,b))return false;state[a]=state[b]=0;}return state.every(v=>!v);}
export function generate(cols,rows,types,seed,positions=null){
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<4||cols>12||rows<4||rows>12||cols*rows%2||!Number.isInteger(types)||types<2||types>640)throw Error('Use 4-12 rows/columns, an even cell count and 2-640 types');
 const random=rng(seed),slots=positions??Array.from({length:cols*rows},(_,i)=>i);
 if(slots.length%2||new Set(slots).size!==slots.length||slots.some(i=>!Number.isInteger(i)||i<0||i>=cols*rows))throw Error('Use distinct in-bounds positions with an even tile count.');
 // Construct a geometric removal certificate first, then assign pair identities.
 // Later removals may use spaces opened by earlier cuts.
 const working=Array(cols*rows).fill(0),cells=Array(cols*rows).fill(0),solution=[];
 for(const i of slots)working[i]=1;
 while(working.some(Boolean)){
  const remaining=shuffled(slots.filter(i=>working[i]),random);let pair=null;
  let adjacentFallback=null;
  for(let i=0;i<remaining.length&&!pair;i++)for(let j=i+1;j<remaining.length;j++){
   const a=remaining[i],b=remaining[j];
   if(!route(working,cols,rows,a,b,false))continue;
   const touching=Math.max(Math.abs(a%cols-b%cols),Math.abs(Math.floor(a/cols)-Math.floor(b/cols)))<=1;
   if(!touching){pair={a,b};break;}
   adjacentFallback??={a,b};
  }
  pair??=adjacentFallback;
  if(!pair)throw Error('Could not construct a clearing route for these positions.');
  const neighbors=new Set();for(const cell of [pair.a,pair.b])for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const x=cell%cols+dx,y=Math.floor(cell/cols)+dy;if((dx||dy)&&x>=0&&x<cols&&y>=0&&y<rows)neighbors.add(y*cols+x);
  }
  neighbors.delete(pair.a);neighbors.delete(pair.b);
  let type=1,best=Infinity;
  for(const candidate of shuffled(Array.from({length:types},(_,i)=>i+1),random)){
   let score=0;for(const i of neighbors)if(cells[i]){if(cells[i]===candidate)score+=2;else if((cells[i]-1)%40===(candidate-1)%40)score++;}
   if(score<best){best=score;type=candidate;}if(best===0)break;
  }
  cells[pair.a]=cells[pair.b]=type;
  working[pair.a]=working[pair.b]=0;solution.push(pair);
 }
 const board={cols,rows,types,seed,cells,solution,method:'spread-pair-layout-v2'};
 if(!verify(board))throw Error('Generated certificate failed.');return board;
}

// Visual exposure only: this does not determine whether a pair is a legal match.
export function hasOpenEdge(cells,cols,rows,index){
 if(!cells[index])return false;
 const x=index%cols,y=Math.floor(index/cols);
 return x===0||x===cols-1||y===0||y===rows-1||!cells[index-1]||!cells[index+1]||!cells[index-cols]||!cells[index+cols];
}
