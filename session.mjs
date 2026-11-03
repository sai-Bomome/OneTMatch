import {route,moves} from './engine.mjs';

// A match is a rules transaction. Presentation never owns or delays this result.
export function applyMatch(cells,cols,rows,a,b){
 const path=route(cells,cols,rows,a,b);
 if(!path)return {ok:false,reason:cells[a]===cells[b]?'blocked':'identity'};
 const next=[...cells];next[a]=next[b]=0;
 return {ok:true,cells:next,event:{a,b,type:cells[a],path},complete:!next.some(Boolean)};
}

// Only three pairs are searched; choose a safe ending when one exists.
export function finishingMove(cells,cols,rows){
 if(cells.filter(Boolean).length>6)return null;
 function search(state){
  if(!state.some(Boolean))return [];
  for(const move of moves(state,cols,rows)){
   const next=[...state];next[move.a]=next[move.b]=0;
   const tail=search(next);if(tail)return [move,...tail];
  }
  return null;
 }
 return search(cells)?.[0]??moves(cells,cols,rows)[0]??null;
}

export function gridNeighbor(cells,cols,rows,index,key){
 const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols};
 if(key==='Home')return cells.findIndex(Boolean);
 if(key==='End')return cells.findLastIndex(Boolean);
 const step=offsets[key];if(!step)return index;
 for(let i=index+step;i>=0&&i<cols*rows;i+=step){
  if(Math.abs(step)===1&&Math.floor(i/cols)!==Math.floor(index/cols))break;
  if(cells[i])return i;
 }
 return index;
}
