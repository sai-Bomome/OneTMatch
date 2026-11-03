import {FEEDBACK,exposedTiles,newlyExposed,connectionMarkup,pathTimings,FLIP_KEYS,spawnKeyframes,spawnDelays} from './feedback.mjs';
import {generate,moves,route,verify,rng,shuffled,hasOpenEdge} from './engine.mjs';
import {iconVisual,iconMarkup,iconTypeLimit} from './icons.mjs';
const $=id=>document.getElementById(id);
let deal,state,history=[],selected=null,hinted=[],connection=null,busy=false,paused=false,finished=false,elapsed=0,started=performance.now(),matches=0,shuffleCount=0,hintCount=0,mistakes=0,mistakeLimit=5,lost=false,available=[],epoch=0;
let iconPacks=[],preferredIconSet='primitives';
let exposed=null,flipStarts=new Map(),matchingTrace=false,traceStarted=0,traceReverse=false,traceMode='shrink',traceConstantSpeed=false,traceTiming=FEEDBACK,traceSpeed=1,traceHeadSize=1;
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefKey='onet.workbench.settings.v1';
function save(){localStorage.setItem(prefKey,JSON.stringify(Object.fromEntries(['seed','cols','rows','types','mistakeLimit','advance','numbers','paths','pathMode','spawnStyle','spawnDirection','constantSpeed','pathSpeed','headSize','reverseOverlay','iconSet','autoShuffle','theme'].map(k=>[k,$(k).type==='checkbox'?$(k).checked:$(k).value]))));}
try{const p=JSON.parse(localStorage.getItem(prefKey)||'{}');preferredIconSet=p.iconSet||'primitives';for(const [k,v]of Object.entries(p))if($(k)){if($(k).type==='checkbox')$(k).checked=v;else $(k).value=v;}}catch{}
const say=text=>$('status').textContent=text;
function seconds(){return elapsed+(!paused&&!finished?(performance.now()-started)/1000:0);}
function snapshot(){return {cells:[...state],matches,solution:deal.solution.map(p=>({...p})),shuffleCount};}
function updateMoves(){available=moves(state,deal.cols,deal.rows);}
function render(){
 const {cols,rows}=deal;$('board').style.setProperty('--cols',cols);$('board').style.setProperty('--rows',rows);$('board').style.setProperty('--outer-cols',cols+2);$('board').style.setProperty('--ratio',`${cols+2}/${rows+2}`);
 $('board').innerHTML=state.map((v,i)=>`<button class="tile ${v&&!hasOpenEdge(state,cols,rows,i)?'enclosed':''} ${!v?'empty':''} ${selected===i?'selected':''} ${hinted.includes(i)?'hinted':''}" data-cell="${i}" aria-label="Row ${Math.floor(i/cols)+1}, column ${i%cols+1}, type ${v}${v?', '+iconVisual(v,deal.iconImages).name:''}" ${!v||paused||finished||busy?'disabled':''}><span class="glyph" style="color:${v?iconVisual(v,deal.iconImages).color:'transparent'}">${v?iconMarkup(v,deal.iconImages):''}</span>${$('numbers').checked&&v?`<small>${v}</small>`:''}</button>`).join('');
 const now=performance.now(),nextExposed=exposedTiles(state,cols,rows);
 for(const i of newlyExposed(exposed,nextExposed))flipStarts.set(i,now);
 exposed=nextExposed;
 for(const [i,start]of flipStarts){
  const age=now-start;
  if(age>=FEEDBACK.flipMs||!state[i]||!nextExposed.has(i)||reducedMotion()){flipStarts.delete(i);continue;}
  const icon=$('board').querySelector(`[data-cell="${i}"] .glyph`);
  if(icon){const animation=icon.animate(FLIP_KEYS,{duration:FEEDBACK.flipMs,easing:'cubic-bezier(.22,.65,.35,1)',fill:'none'});animation.currentTime=age;}
 }
 if(connection){
  const bounds=$('board').getBoundingClientRect();
  const inset=point=>{const index=point[1]*cols+point[0],tile=$('board').querySelector(`[data-cell="${index}"]`),rect=tile?.getBoundingClientRect();return rect?[rect.width/bounds.width*(cols+2)/2,rect.height/bounds.height*(rows+2)/2]:[.46,.46];};
  const startInset=inset(connection[0]),endInset=inset(connection.at(-1));
  if(matchingTrace)traceTiming=pathTimings(connection,{constantSpeed:traceConstantSpeed,speed:traceSpeed,scaleX:bounds.width/(cols+2),scaleY:bounds.height/(rows+2),startInset,endInset});
  if($('paths').checked)$('board').insertAdjacentHTML('beforeend',connectionMarkup(connection,cols,rows,{matching:matchingTrace,reverse:traceReverse,mode:traceMode,age:matchingTrace?now-traceStarted:0,startInset,endInset,timing:matchingTrace?traceTiming:FEEDBACK,headSize:traceHeadSize}));
 }
 for(const motion of $('board').querySelectorAll('animateMotion[data-start-ms]')){
  if(motion.dataset.startMs!=='indefinite')motion.beginElementAt?.(parseFloat(motion.dataset.startMs)/1000);
 }
 const total=state.length/2,cleared=total-state.filter(Boolean).length/2,percent=Math.round(cleared/total*100);
 $('collected').textContent=`${cleared} / ${total}`;$('available').textContent=available.length;$('progressText').textContent=percent+'%';$('progressFill').style.width=percent+'%';
 $('boardTitle').textContent=`${cols} × ${rows} · a little connection`;
 for(const k of ['hint','shuffle','solution'])$(k).disabled=busy||paused||finished; $('undo').disabled=busy||paused||lost||!history.length;$('pause').disabled=busy||finished;
 $('pause').textContent=paused?'▷ Resume':'Ⅱ Pause';$('cover').hidden=!paused&&!finished;
 $('lives').textContent=`${Math.max(0,mistakeLimit-mistakes)} / ${mistakeLimit}`;
 $('lives').classList.toggle('low-lives',mistakeLimit-mistakes<=1);
 $('coverIcon').textContent=lost?'!':finished?'✧':'Ⅱ';$('coverTitle').textContent=lost?'Out of tries.':finished?'Beautifully connected.':'A little breather';$('coverText').textContent=lost?`${mistakes} wrong moves. Replay this deal and try a different approach.`:finished?`${total} pairs cleared - ${hintCount} hints - ${shuffleCount} shuffles`:'Your board will be right here.';$('coverAction').textContent=lost?'Retry this deal':finished?'Next board':'Resume';
 $('inspector').textContent=`Seed ${deal.seed} · ${deal.types} types · ${state.filter(Boolean).length} / ${state.length} tiles left · ${available.length} legal pairs · ${hintCount} hints · ${shuffleCount} shuffles. Original clearing certificate: ${deal.certified?'verified':'INVALID'}. Replay returns to this deal. Solution step uses a surviving certificate move, or any legal pair after a different play route.`;
}
async function spawnTiles(shuffling=false){
 const style=$('spawnStyle').value;
 if(style==='off'||reducedMotion()){render();return;}
 const generation=epoch;busy=true;render();
 const duration=shuffling?300:430,spread=shuffling?220:460;
 try{
  const animations=[],delays=spawnDelays(deal.cols,deal.rows,spread,$('spawnDirection').value);
  for(const tile of $('board').querySelectorAll('.tile:not(.empty)')){
   if(typeof tile.animate!=='function')continue;
   const index=Number(tile.dataset.cell);
   animations.push(tile.animate(spawnKeyframes(style),{duration,delay:delays[index],easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}).finished.catch(()=>{}));
  }
  await Promise.all(animations);
 }finally{if(generation===epoch){busy=false;render();}}
}
function setDeal(board){board.certified=verify(board);board.originalSolution=board.solution.map(p=>({...p}));epoch++;exposed=null;flipStarts.clear();matchingTrace=false;deal=board;state=[...deal.cells];history=[];selected=null;hinted=[];connection=null;busy=paused=finished=false;elapsed=0;started=performance.now();matches=shuffleCount=hintCount=mistakes=0;lost=false;mistakeLimit=board.mistakeLimit??Number($('mistakeLimit').value);updateMoves();say('Select a matching pair to begin.');spawnTiles();}
function newBoard(){if(busy)return;try{const seed=Number($('seed').value);if(!Number.isInteger(seed)||seed< -2147483648||seed>2147483647)throw Error('Use a 32-bit integer seed.');const limit=Number($('mistakeLimit').value);if(!Number.isInteger(limit)||limit<1||limit>20)throw Error('Use a wrong-move limit from 1 to 20.');const pack=iconPacks.find(p=>p.id===$('iconSet').value),images=pack?.images||[];if(Number($('types').value)>iconTypeLimit(images))throw Error('Reduce tile types for this icon set.');const board=generate(Number($('cols').value),Number($('rows').value),Number($('types').value),seed);board.mistakeLimit=limit;board.iconImages=[...images];board.iconSet=pack?.id||'primitives';setDeal(board);if($('advance').checked)$('seed').value=seed===2147483647?-2147483648:seed+1;save();}catch(e){say(e.message);}}
async function match(a,b){if(busy||paused||finished)return;const path=route(state,deal.cols,deal.rows,a,b);
 if(!path){
  mistakes++;selected=null;hinted=[];connection=null;
  if(mistakes>=mistakeLimit){elapsed=seconds();lost=true;finished=true;paused=false;}
  render();$('board').querySelector(`[data-cell="${b}"]`)?.classList.add('invalid');
  say(lost?'Wrong-move limit reached. Retry this deal.':`${mistakeLimit-mistakes} tries left. ${state[a]===state[b]?'Path blocked or more than two turns.':'Both shape and color must match.'}`);
  return;
 }
 history.push(snapshot());busy=true;selected=null;hinted=[];connection=path;matchingTrace=true;traceMode=$('pathMode').value;traceConstantSpeed=$('constantSpeed').checked;traceSpeed=Number($('pathSpeed').value);traceHeadSize=Number($('headSize').value);traceTiming=FEEDBACK;traceReverse=$('reverseOverlay').checked;traceStarted=performance.now();render();const generation=epoch;
 const wait=ms=>new Promise(r=>setTimeout(r,reducedMotion()?0:ms));
 if(traceMode==='shrink'){
  await wait(traceTiming.firstTraceMs);if(generation!==epoch)return;
  const first=$('board').querySelector(`[data-cell="${a}"]`);first?.classList.add('removing');
  await wait(FEEDBACK.removeMs);if(generation!==epoch)return;if(first)first.style.visibility='hidden';
  const line=$('board').querySelector('.single-route');line?.classList.add('shrinking');
  line?.querySelector('.head-shrink-motion')?.beginElement?.();
  const stroke=line?.querySelector('polyline');if(stroke)stroke.style.animationDelay='0ms';
  await wait(traceTiming.shrinkMs);if(generation!==epoch)return;
  $('board').querySelector(`[data-cell="${b}"]`)?.classList.add('removing');
  await wait(FEEDBACK.removeMs);if(generation!==epoch)return;
 }else{
  await wait(traceTiming.firstTraceMs+traceTiming.overlayDelayMs+traceTiming.overlayTraceMs+traceTiming.overlayHoldMs);if(generation!==epoch)return;
  for(const i of [a,b])$('board').querySelector(`[data-cell="${i}"]`)?.classList.add('removing');
  await wait(FEEDBACK.removeMs);if(generation!==epoch)return;
 }
 state[a]=state[b]=0;matches++;connection=null;matchingTrace=false;busy=false;updateMoves();
 if(!state.some(Boolean)){elapsed=seconds();finished=true;say('All pairs collected. Nicely done.');}
 else if(!available.length){say('No available pair. Shuffle to open another route.');if($('autoShuffle').checked){shuffle();return;}}
 else say(`${path.length-2} turn${path.length===3?'':'s'} · pair connected.`);render();
 // Finish the small remaining tail through the same animated, undoable match flow.
 if(!finished&&!paused&&state.filter(Boolean).length<=6&&available.length){
  const next=deal.solution.find(({a,b})=>state[a]&&state[b]&&route(state,deal.cols,deal.rows,a,b))||available[0];
  await match(next.a,next.b);
 }
}
function clearSelection(){if(selected===null)return;selected=null;if(!busy)render();}
// Capture outside clicks before a control's own action; valid tile clicks retain pairing.
document.addEventListener('click',e=>{
 const tile=e.target.closest?.('[data-cell]');
 if(tile&&$('board').contains(tile)&&!tile.disabled&&state[Number(tile.dataset.cell)])return;
 clearSelection();
},true);
$('board').onclick=e=>{const tile=e.target.closest('[data-cell]');if(!tile){clearSelection();return;}if(busy||paused||finished)return;const i=Number(tile.dataset.cell);if(!state[i]){clearSelection();return;}hinted=[];connection=null;if(selected===null||selected===i){selected=selected===i?null:i;render();return;}match(selected,i);};
function shuffle(){if(busy||paused||finished)return;try{const slots=state.map((v,i)=>v?i:-1).filter(i=>i>=0);const counts=new Map();for(const v of state)if(v)counts.set(v,(counts.get(v)||0)+1);const types=[];for(const [v,n]of counts){if(n%2)throw Error('Cannot shuffle an odd type count.');for(let i=0;i<n/2;i++)types.push(v);}
 const next=generate(deal.cols,deal.rows,deal.types,deal.seed+shuffleCount*7919+449,slots);const random=rng(deal.seed+shuffleCount*113+89),allocation=shuffled(types,random);for(let i=0;i<next.solution.length;i++){const {a,b}=next.solution[i];next.cells[a]=next.cells[b]=allocation[i];}
 if(!verify(next))throw Error('Shuffle certificate failed.');history.push(snapshot());state=[...next.cells];deal.solution=next.solution;shuffleCount++;selected=null;hinted=[];connection=null;updateMoves();say('A fresh arrangement. Tile counts preserved.');spawnTiles(true);}catch(e){say(e.message);}}
$('shuffle').onclick=shuffle;
$('hint').onclick=()=>{if(!available.length){say('No legal pairs remain. Try Shuffle.');return;}const m=available[0];hintCount++;hinted=[m.a,m.b];connection=m.path;matchingTrace=false;render();say('These two can connect. Follow the highlighted route.');};
$('undo').onclick=()=>{if(busy||paused||lost||!history.length)return;const s=history.pop();state=s.cells;matches=s.matches;deal.solution=s.solution;shuffleCount=s.shuffleCount;if(finished){finished=false;started=performance.now();}selected=null;hinted=[];connection=null;updateMoves();render();say('One step back. Try another connection.');};
$('solution').onclick=()=>{const next=deal.solution.find(({a,b})=>state[a]&&state[b]&&route(state,deal.cols,deal.rows,a,b))||available[0];if(next)match(next.a,next.b);else say('No legal pair. Shuffle to continue.');};
function togglePause(){if(busy||finished)return;if(!paused){elapsed=seconds();paused=true;}else{paused=false;started=performance.now();}render();}
$('pause').onclick=togglePause;$('coverAction').onclick=()=>lost?setDeal({...deal,solution:deal.originalSolution.map(p=>({...p}))}):finished?newBoard():togglePause();$('generate').onclick=newBoard;$('restart').onclick=()=>{if(!busy)setDeal({...deal,cells:[...deal.cells],solution:deal.originalSolution.map(p=>({...p}))});};
$('types').oninput=()=>{$('typeLabel').textContent=$('types').value;};
for(const k of ['cols','rows','seed','types','mistakeLimit','advance','autoShuffle'])$(k).onchange=save;
for(const k of ['numbers','paths','pathMode','spawnStyle','spawnDirection','constantSpeed','reverseOverlay','theme'])$(k).onchange=()=>{document.body.classList.toggle('dark',$('theme').value==='dark');save();if(!busy)render();};
$('export').onclick=()=>{const data={version:'onet-workbench-v1',board:{...deal,solution:deal.originalSolution},currentCells:state,elapsedSeconds:Math.round(seconds()),hints:hintCount,shuffles:shuffleCount,mistakes,mistakeLimit};const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));link.href=url;link.download=`onet-${deal.seed}.json`;link.click();URL.revokeObjectURL(url);};
setInterval(()=>{const s=Math.floor(seconds());$('timer').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;},250);
function updateIconLimit(){const images=iconPacks.find(p=>p.id===$('iconSet').value)?.images||[];const limit=iconTypeLimit(images);$('types').max=limit;if(Number($('types').value)>limit)$('types').value=limit;$('typeLabel').textContent=$('types').value;}
async function refreshIconPacks(){
 const response=await fetch('icons/catalog.json',{cache:'no-store'});if(!response.ok)throw Error('Could not load icon catalog.');
 const catalog=await response.json();iconPacks=catalog.packs||[];const selected=preferredIconSet;
 $('iconSet').replaceChildren(new Option('Colored primitives','primitives'));
 for(const pack of iconPacks)$('iconSet').add(new Option(`${pack.name} (${pack.images.length} icons)`,pack.id));
 $('iconSet').value=iconPacks.some(p=>p.id===selected)?selected:'primitives';updateIconLimit();
}
$('iconSet').onchange=()=>{preferredIconSet=$('iconSet').value;updateIconLimit();save();say('Icon set selected. Generate a new board to use it.');};
$('refreshIcons').onclick=async()=>{try{await refreshIconPacks();say(`Found ${iconPacks.length} icon packs. Choose one, then generate a new board.`);}catch(e){say(e.message);}};
document.body.classList.toggle('dark',$('theme').value==='dark');$('typeLabel').textContent=$('types').value;
(async()=>{try{await refreshIconPacks();}catch(e){say(e.message);}newBoard();})();

function updatePathControls(){$('pathSpeedValue').textContent=Number($('pathSpeed').value).toFixed(2)+'x';$('headSizeValue').textContent=Math.round(Number($('headSize').value)*100)+'%';}
for(const k of ['pathSpeed','headSize'])$(k).oninput=()=>{updatePathControls();save();};
updatePathControls();
