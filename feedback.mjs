import {hasOpenEdge} from './engine.mjs';
export const FEEDBACK={flipMs:560,firstTraceMs:420,overlayTraceMs:220,overlayDelayMs:50,overlayHoldMs:130,removeMs:160};
export function exposedTiles(cells,cols,rows){return new Set(cells.map((v,i)=>v&&hasOpenEdge(cells,cols,rows,i)?i:-1).filter(i=>i>=0));}
export function newlyExposed(previous,current){return previous?[...current].filter(i=>!previous.has(i)):[];}
export function connectionMarkup(points,cols,rows,{matching=false,reverse=false,age=0}={}){
 const encode=list=>list.map(([x,y])=>`${x+1.5},${y+1.5}`).join(' ');
 const base=`<polyline class="trace-base" pathLength="1" points="${encode(points)}" style="animation-delay:${-age}ms"/>`;
 const overlay=matching?`<polyline class="trace-overlay" pathLength="1" points="${encode(reverse?[...points].reverse():points)}" style="animation-delay:${FEEDBACK.firstTraceMs+FEEDBACK.overlayDelayMs-age}ms"/>`:'';
 return `<svg style="--first-trace:${FEEDBACK.firstTraceMs}ms;--overlay-trace:${FEEDBACK.overlayTraceMs}ms" class="route ${matching?'matching-route':'hint-route'}" viewBox="0 0 ${cols+2} ${rows+2}" preserveAspectRatio="none" aria-hidden="true">${base}${overlay}</svg>`;
}
export const FLIP_KEYS=[
 {transform:'translateY(0) scale(1) rotateY(0deg)',offset:0},
 {transform:'translateY(-8px) scale(1.22) rotateY(110deg)',offset:.3},
 {transform:'translateY(-13px) scale(1.32) rotateY(210deg)',offset:.52},
 {transform:'translateY(-4px) scale(1.12) rotateY(335deg)',offset:.82},
 {transform:'translateY(0) scale(1) rotateY(360deg)',offset:1}
];
