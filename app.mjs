import {FEEDBACK,isVisuallyEnclosed,exposedTiles,newlyExposed,connectionMarkup,pathTimings,FLIP_KEYS,INVALID_KEYS,spawnKeyframes,spawnDelays} from './feedback.mjs';
import {generate,moves,route,verify,rng,shuffled,hasOpenEdge} from './engine.mjs';
import {iconVisual,iconMarkup,iconTypeLimit,iconDescription} from './icons.mjs';
import {applyMatch,finishingMove,gridNeighbor} from './session.mjs';
import {createFeedbackScope,createSound,playUnlock} from './presentation.mjs';
const $=id=>document.getElementById(id);
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let deal,state=[],history=[],selected=null,hinted=[],busy=false,paused=false,finished=false,lost=false;
let elapsed=0,started=performance.now(),matches=0,shuffleCount=0,hintCount=0,mistakes=0,mistakeLimit=5,available=[],epoch=0;
let iconPacks=[],preferredIconSet='primitives',tiles=[],focusCell=0,exposed=null,activeMatch=null,revealPending=false,finishing=false;
let effects=createFeedbackScope(reducedMotion),accents=createFeedbackScope(reducedMotion),panelEffects=createFeedbackScope(reducedMotion),coverVisible=false;
const prefKey='onet.workbench.settings.v1';
const preferenceIds=['seed','cols','rows','types','mistakeLimit','advance','numbers','paths','pathMode','spawnStyle','spawnDirection','constantSpeed','pathSpeed','headSize','reverseOverlay','iconSet','autoShuffle','theme','sound','soundVolume'];
function save(){try{localStorage.setItem(prefKey,JSON.stringify(Object.fromEntries(preferenceIds.map(k=>[k,$(k).type==='checkbox'?$(k).checked:$(k).value]))));}catch{}}
try{const p=JSON.parse(localStorage.getItem(prefKey)||'{}');preferredIconSet=p.iconSet||'primitives';for(const k of preferenceIds)if(k in p){if($(k).type==='checkbox')$(k).checked=p[k];else $(k).value=p[k];}}catch{}
const sound=createSound(()=>({enabled:$('sound').checked,volume:Number($('soundVolume').value)}));
document.addEventListener('pointerdown',()=>sound.unlock(),{capture:true});
document.addEventListener('keydown',()=>sound.unlock(),{capture:true});
const say=text=>$('status').textContent=text;
function seconds(){return !deal?0:elapsed+(!paused&&!finished&&!revealPending&&!$('rulesDialog').open&&!document.hidden?(performance.now()-started)/1000:0);}
function snapshot(){return {cells:[...state],matches,solution:deal.solution.map(p=>({...p})),shuffleCount};}
function updateMoves(){available=moves(state,deal.cols,deal.rows);}
function pulse(target,kind='positive'){
 const frames=kind==='deny'?[{opacity:.55},{opacity:1}]:[{transform:'scale(1)'},{transform:'scale(1.09)',offset:.35},{transform:'scale(1)'}];
 void accents.animate(target,frames,{duration:kind==='deny'?220:240,easing:'ease-out'});
}
function cancelPresentation(){
 epoch++;effects.cancel();effects=createFeedbackScope(reducedMotion);accents.cancel();accents=createFeedbackScope(reducedMotion);sound.stop();
 activeMatch=null;busy=false;finishing=false;for(const tile of tiles)tile.classList.remove('removing','denied-identity','denied-blocked','unlocking');$('board').querySelectorAll('.route').forEach(el=>el.remove());
}
function setCover(show){
 if(show===coverVisible)return;coverVisible=show;panelEffects.cancel();panelEffects=createFeedbackScope(reducedMotion);
 const cover=$('cover'),scope=panelEffects;
 if(show){
  cover.hidden=false;cover.inert=false;
  void scope.animate(cover,[{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'});
  void scope.animate($('coverIcon'),[{transform:'scale(.7)',opacity:0},{transform:'scale(1.12)',opacity:1,offset:.7},{transform:'scale(1)',opacity:1}],{duration:400,easing:'ease-out'});
  if(!$('rulesDialog').open&&(document.activeElement===$('pause')||$('board').contains(document.activeElement)||(finished&&document.activeElement?.closest('.play-tools'))))$('coverAction').focus({preventScroll:true});
 }else{
  cover.inert=true;
  void scope.animate(cover,[{opacity:1},{opacity:0}],{duration:130,easing:'ease-in'}).then(()=>{if(!scope.cancelled)cover.hidden=true;});
 }
}
function ensureTiles(){
 if(tiles.length===state.length)return;
 $('board').replaceChildren();tiles=state.map((_,i)=>{
  const tile=document.createElement('button');tile.className='tile';tile.dataset.cell=i;
  tile.innerHTML='<span class="tile-face"><span class="glyph"></span><small hidden></small></span>';
  $('board').append(tile);return tile;
 });
}
function render(){
 if(!deal)return;const {cols,rows}=deal;ensureTiles();
 for(const [name,value]of Object.entries({cols,rows,'outer-cols':cols+2,ratio:`${cols+2}/${rows+2}`}))$('board').style.setProperty('--'+name,value);
 $('board').style.setProperty('--remove-time',FEEDBACK.removeMs+'ms');
 if(!state[focusCell])focusCell=state.findIndex(Boolean);
 tiles.forEach((tile,i)=>{
  const ghost=activeMatch&&(i===activeMatch.a||i===activeMatch.b),v=state[i]||(ghost?activeMatch.type:0),enclosed=isVisuallyEnclosed(state,cols,rows,i,exposed,!!activeMatch);
  tile.classList.toggle('empty',!v);tile.classList.toggle('enclosed',!!enclosed);tile.classList.toggle('selected',selected===i);tile.classList.toggle('queued',busy&&selected===i);
  tile.classList.toggle('hinted',hinted.includes(i));tile.classList.toggle('matched',!!ghost);
  tile.disabled=!state[i]||paused||finished||revealPending||(busy&&!activeMatch);tile.tabIndex=i===focusCell?0:-1;
  tile.setAttribute('aria-pressed',String(selected===i));tile.setAttribute('aria-label',`Row ${Math.floor(i/cols)+1}, column ${i%cols+1}${v?', '+iconDescription(v,deal.iconImages)+', type '+v:''}${enclosed?', enclosed; adjacent matches may still work':''}${selected===i?', selected':''}`);
  const glyph=tile.querySelector('.glyph');
  if(tile.dataset.visual!==String(v)){tile.dataset.visual=v;glyph.style.color=v?iconVisual(v,deal.iconImages).color:'transparent';glyph.innerHTML=v?iconMarkup(v,deal.iconImages):'';}
  const number=tile.querySelector('small');number.textContent=v;number.hidden=!$('numbers').checked||!v;
 });
 if(!activeMatch){
  const nextExposed=exposedTiles(state,cols,rows),newTiles=newlyExposed(exposed,nextExposed);exposed=nextExposed;
  for(const i of newTiles)void playUnlock(tiles[i],FLIP_KEYS,accents,{duration:FEEDBACK.flipMs*(newTiles.length>3?.8:1),easing:'cubic-bezier(.22,.65,.35,1)'});
 }
 const total=state.length/2,cleared=total-state.filter(Boolean).length/2,percent=Math.round(cleared/total*100);
 $('collected').textContent=`${cleared} / ${total}`;$('available').textContent=available.length;$('progressText').textContent=percent+'%';$('progressFill').style.width=percent+'%';
 $('boardTitle').textContent=`${cols} x ${rows} - a little connection`;
 for(const k of ['hint','shuffle','solution'])$(k).disabled=busy||paused||finished||revealPending;
 $('undo').disabled=paused||lost||!history.length||revealPending||(busy&&!activeMatch);
 $('pause').disabled=finished||revealPending;$('howToPlay').disabled=!deal;
 $('pause').textContent=paused?'Resume':'Pause';
 $('lives').textContent=`${Math.max(0,mistakeLimit-mistakes)} / ${mistakeLimit}`;$('lives').classList.toggle('low-lives',mistakeLimit-mistakes<=1);
 $('coverIcon').textContent=lost?'!':finished?'✧':'Ⅱ';$('coverTitle').textContent=lost?'Out of tries.':finished?'Beautifully connected.':'A little breather';
 $('coverText').textContent=lost?`${mistakes} wrong moves. Replay this deal and try a different approach.`:finished?`${total} pairs cleared | ${Math.floor(seconds())} seconds | ${mistakes} wrong moves | ${hintCount} hint${hintCount===1?'':'s'} | ${shuffleCount} shuffle${shuffleCount===1?'':'s'}`:'Your board will be right here.';
 $('coverAction').textContent=lost?'Retry this deal':finished?'Next board':'Resume';
 $('cover').classList.toggle('completed',finished&&!lost);setCover(paused||(finished&&!activeMatch));
 $('inspector').textContent=`Seed ${deal.seed} | ${deal.types} types | ${state.filter(Boolean).length} / ${state.length} tiles left | ${available.length} legal pairs. Original clearing certificate: ${deal.certified?'verified':'INVALID'}. Solution step uses a surviving certificate move, or any legal pair after a different play route.`;
}
function focusTile(index=focusCell){if(index<0||!state[index])return;focusCell=index;render();tiles[index]?.focus({preventScroll:true});}
async function spawnTiles(shuffling=false){
 revealPending=false;started=performance.now();const generation=epoch,scope=effects;busy=true;render();
 const style=$('spawnStyle').value,duration=shuffling?260:360,spread=shuffling?180:320;
 if(style!=='off'){
  const delays=spawnDelays(deal.cols,deal.rows,spread,$('spawnDirection').value);
  await Promise.all(tiles.map((tile,i)=>state[i]?scope.animate(tile.querySelector('.tile-face'),spawnKeyframes(style),{duration,delay:delays[i],easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}):null));
 }
 if(generation!==epoch)return;busy=false;render();
}
function setDeal(board){
 cancelPresentation();board.certified=verify(board);board.originalSolution=board.solution.map(p=>({...p}));deal=board;state=[...board.cells];history=[];selected=null;hinted=[];exposed=null;
 for(const tile of tiles){tile.classList.remove('removing','hidden-ghost','denied-identity','denied-blocked');}
 paused=finished=lost=false;elapsed=0;started=performance.now();matches=shuffleCount=hintCount=mistakes=0;mistakeLimit=board.mistakeLimit??Number($('mistakeLimit').value);focusCell=state.findIndex(Boolean);
 updateMoves();say('Select a matching pair to begin.');revealPending=$('rulesDialog').open;render();if(!revealPending)void spawnTiles();
}
function newBoard(){
 try{
  const seed=Number($('seed').value),limit=Number($('mistakeLimit').value);
  if(!Number.isInteger(seed)||seed< -2147483648||seed>2147483647)throw Error('Use a 32-bit integer seed.');
  if(!Number.isInteger(limit)||limit<1||limit>20)throw Error('Use a wrong-move limit from 1 to 20.');
  const pack=iconPacks.find(p=>p.id===$('iconSet').value),images=pack?.images||[];
  if(Number($('types').value)>iconTypeLimit(images))throw Error('Reduce tile types for this icon set.');
  const board=generate(Number($('cols').value),Number($('rows').value),Number($('types').value),seed);board.mistakeLimit=limit;board.iconImages=[...images];board.iconSet=pack?.id||'primitives';setDeal(board);
  if($('advance').checked)$('seed').value=seed===2147483647?-2147483648:seed+1;save();
 }catch(e){say(e.message);}
}
function clearHint(){hinted=[];$('board').querySelector('.hint-route')?.remove();}
function routeVisual(event){
 const {cols,rows}=deal,bounds=$('board').getBoundingClientRect();
 const inset=index=>{const rect=tiles[index].getBoundingClientRect();return [rect.width/bounds.width*(cols+2)/2,rect.height/bounds.height*(rows+2)/2];};
 const startInset=inset(event.a),endInset=inset(event.b),mode=$('pathMode').value;
 const timing=pathTimings(event.path,{constantSpeed:$('constantSpeed').checked,speed:Number($('pathSpeed').value),scaleX:bounds.width/(cols+2),scaleY:bounds.height/(rows+2),startInset,endInset});
 let svg=null;
 if(!$('paths').checked)return {svg,timing:{...timing,firstTraceMs:0,overlayTraceMs:0,overlayDelayMs:0,overlayHoldMs:0,shrinkMs:0},mode:'double'};
 if(!reducedMotion()){
  $('board').insertAdjacentHTML('beforeend',connectionMarkup(event.path,cols,rows,{matching:true,reverse:$('reverseOverlay').checked,mode,startInset,endInset,timing,headSize:Number($('headSize').value)}));
  svg=$('board').querySelector('.route');for(const motion of svg.querySelectorAll('animateMotion[data-start-ms]'))if(motion.dataset.startMs!=='indefinite')motion.beginElementAt?.(parseFloat(motion.dataset.startMs)/1000);
 }
 return {svg,timing,mode};
}
async function deny(a,b,reason){
 selected=null;clearHint();mistakes++;if(mistakes>=mistakeLimit){elapsed=seconds();lost=finished=true;paused=false;}
 render();sound.play('deny');pulse($('lives'),'deny');const generation=epoch;
 for(const i of [a,b]){tiles[i].classList.add('denied-'+reason);void accents.animate(tiles[i].querySelector('.tile-face'),INVALID_KEYS,{duration:FEEDBACK.invalidMs,easing:'ease-out'});}
 say(lost?'Wrong-move limit reached. Retry this deal.':`${mistakeLimit-mistakes} tries left. ${reason==='identity'?'Different shape or color.':'Matching tiles, but no clear path within two turns.'}`);
 if(await effects.wait(650)&&generation===epoch)for(const i of [a,b]){tiles[i].classList.remove('denied-'+reason);}
}
async function match(a,b,{automatic=false}={}){
 if(busy||paused||finished||revealPending)return;
 const result=applyMatch(state,deal.cols,deal.rows,a,b);if(!result.ok){if(!automatic)void deny(a,b,result.reason);return;}
 history.push(snapshot());const wasFocused=tiles.includes(document.activeElement),generation=epoch,scope=effects;
 state=result.cells;matches++;selected=null;clearHint();activeMatch=result.event;busy=true;updateMoves();
 if(result.complete){elapsed=seconds();finished=true;}
 render();sound.play('match');pulse($('collected'));
 if(wasFocused&&state.some(Boolean))focusTile(state.findIndex(Boolean));
 const {svg,timing,mode}=routeVisual(result.event);
 const first=tiles[a],second=tiles[b];
 // Rules already committed. These waits affect presentation only; next selection stays available.
 if(mode==='shrink'){
  await scope.wait(timing.firstTraceMs);if(generation!==epoch)return;
  first.classList.add('removing');svg?.classList.add('shrinking');svg?.querySelector('.head-shrink-motion')?.beginElement?.();
  const stroke=svg?.querySelector('polyline');if(stroke)stroke.style.animationDelay='0ms';
  await scope.wait(Math.max(timing.shrinkMs,FEEDBACK.removeMs));if(generation!==epoch)return;second.classList.add('removing');
 }else{
  await scope.wait(timing.firstTraceMs+timing.overlayDelayMs+timing.overlayTraceMs+timing.overlayHoldMs);if(generation!==epoch)return;
  first.classList.add('removing');second.classList.add('removing');
 }
 await scope.wait(FEEDBACK.removeMs);if(generation!==epoch)return;
 svg?.remove();first.classList.remove('removing');second.classList.remove('removing');activeMatch=null;busy=false;render();
 if(finished){finishing=false;sound.play('complete');say('All pairs collected. Nicely done.');return;}
 if(selected!==null){finishing=false;say('Next tile selected. Choose its matching partner.');return;}
 if(!available.length){finishing=false;say('No legal pairs remain. Shuffle to open another route.');if($('autoShuffle').checked)shuffle();return;}
 const next=finishingMove(state,deal.cols,deal.rows);
 if(next){finishing=true;say('Finishing the remaining clear pairs...');await scope.wait(automatic?90:180);if(generation===epoch&&!paused&&selected===null&&!finished&&state[next.a]&&state[next.b]&&route(state,deal.cols,deal.rows,next.a,next.b))await match(next.a,next.b,{automatic:true});}
 else{finishing=false;say(`${result.event.path.length-2} turn${result.event.path.length===3?'':'s'} - pair connected.`);}
}
function selectTile(i){
 if(!state[i]||paused||finished||revealPending||(busy&&!activeMatch))return;
 clearHint();sound.play('select');focusCell=i;
 if(busy){selected=selected===i?null:i;render();say(selected===null?'Next selection cleared.':'Next tile selected. Choose its partner after this connection.');return;}
 if(selected===null||selected===i){selected=selected===i?null:i;render();return;}
 void match(selected,i);
}
function clearSelection(){if(selected===null)return;selected=null;render();}
document.addEventListener('click',e=>{const tile=e.target.closest?.('[data-cell]');if(tile&&$('board').contains(tile)&&!tile.disabled&&state[Number(tile.dataset.cell)])return;clearSelection();},true);
$('board').onclick=e=>{const tile=e.target.closest('[data-cell]');if(tile)selectTile(Number(tile.dataset.cell));else clearSelection();};
$('board').onfocusin=e=>{if(e.target.dataset.cell){focusCell=Number(e.target.dataset.cell);for(const tile of tiles)tile.tabIndex=Number(tile.dataset.cell)===focusCell?0:-1;}};
$('board').onkeydown=e=>{
 const tile=e.target.closest('[data-cell]');if(!tile)return;
 if(e.key==='Escape'){clearSelection();return;}
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)){e.preventDefault();focusTile(gridNeighbor(state,deal.cols,deal.rows,Number(tile.dataset.cell),e.key));}
};
function shuffle(){
 if(busy||paused||finished||revealPending)return;
 try{
  const slots=state.map((v,i)=>v?i:-1).filter(i=>i>=0),counts=new Map();for(const v of state)if(v)counts.set(v,(counts.get(v)||0)+1);
  const types=[];for(const [v,n]of counts){if(n%2)throw Error('Cannot shuffle an odd type count.');for(let i=0;i<n/2;i++)types.push(v);}
  const next=generate(deal.cols,deal.rows,deal.types,deal.seed+shuffleCount*7919+449,slots),allocation=shuffled(types,rng(deal.seed+shuffleCount*113+89));
  for(let i=0;i<next.solution.length;i++){const {a,b}=next.solution[i];next.cells[a]=next.cells[b]=allocation[i];}
  if(!verify(next))throw Error('Shuffle certificate failed.');history.push(snapshot());cancelPresentation();state=[...next.cells];deal.solution=next.solution;shuffleCount++;selected=null;clearHint();exposed=null;updateMoves();say('A fresh arrangement. Tile counts preserved.');void spawnTiles(true);
 }catch(e){say(e.message);}
}
$('shuffle').onclick=shuffle;
$('hint').onclick=()=>{
 if(busy||paused||finished)return;if(!available.length){say('No legal pairs remain. Try Shuffle.');return;}
 clearHint();const m=available[0];hintCount++;hinted=[m.a,m.b];render();$('board').insertAdjacentHTML('beforeend',connectionMarkup(m.path,deal.cols,deal.rows));say('These two can connect. Follow the highlighted route.');
};
$('undo').onclick=()=>{
 if(paused||lost||!history.length||revealPending)return;cancelPresentation();const previous=history.pop();state=previous.cells;matches=previous.matches;deal.solution=previous.solution;shuffleCount=previous.shuffleCount;
 if(finished){finished=false;started=performance.now();}selected=null;clearHint();for(const tile of tiles)tile.classList.remove('removing','denied-identity','denied-blocked');exposed=null;updateMoves();render();say('One step back. Try another connection.');
};
$('solution').onclick=()=>{if(busy||paused||finished)return;const next=deal.solution.find(({a,b})=>state[a]&&state[b]&&route(state,deal.cols,deal.rows,a,b))||available[0];if(next)void match(next.a,next.b);else say('No legal pair. Shuffle to continue.');};
function togglePause(){
 if(finished||revealPending)return;
 if(!paused){elapsed=seconds();cancelPresentation();for(const tile of tiles)tile.classList.remove('removing');paused=true;}
 else{paused=false;started=performance.now();}
 render();if(!paused)focusTile();
}
$('pause').onclick=togglePause;
$('coverAction').onclick=()=>lost?setDeal({...deal,solution:deal.originalSolution.map(p=>({...p}))}):finished?newBoard():togglePause();
$('generate').onclick=newBoard;$('restart').onclick=()=>setDeal({...deal,cells:[...deal.cells],solution:deal.originalSolution.map(p=>({...p}))});
$('types').oninput=()=>{$('typeLabel').textContent=$('types').value;};
for(const k of ['cols','rows','seed','types','mistakeLimit','advance','autoShuffle'])$(k).onchange=save;
for(const k of ['numbers','paths','pathMode','spawnStyle','spawnDirection','constantSpeed','reverseOverlay','theme'])$(k).onchange=()=>{document.body.classList.toggle('dark',$('theme').value==='dark');save();render();};
$('sound').onchange=()=>{save();sound.unlock();if(!$('sound').checked)sound.stop();else sound.play('select');};
function updatePathControls(){
 $('pathSpeedValue').textContent=Number($('pathSpeed').value).toFixed(2)+'x';$('headSizeValue').textContent=Math.round(Number($('headSize').value)*100)+'%';$('soundVolumeValue').textContent=Math.round(Number($('soundVolume').value)*100)+'%';
}
for(const k of ['pathSpeed','headSize','soundVolume'])$(k).oninput=()=>{updatePathControls();save();};
$('export').onclick=()=>{const data={version:'onet-workbench-v1',board:{...deal,solution:deal.originalSolution},currentCells:state,elapsedSeconds:Math.round(seconds()),hints:hintCount,shuffles:shuffleCount,mistakes,mistakeLimit};const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));link.href=url;link.download=`onet-${deal.seed}.json`;link.click();URL.revokeObjectURL(url);};
setInterval(()=>{const s=Math.floor(seconds());$('timer').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;},250);
function updateIconLimit(){const images=iconPacks.find(p=>p.id===$('iconSet').value)?.images||[],limit=iconTypeLimit(images);$('types').max=limit;if(Number($('types').value)>limit)$('types').value=limit;$('typeLabel').textContent=$('types').value;}
async function refreshIconPacks(){
 const response=await fetch('icons/catalog.json',{cache:'no-store'});if(!response.ok)throw Error('Could not load icon catalog.');
 const catalog=await response.json();iconPacks=catalog.packs||[];const selected=preferredIconSet;
 $('iconSet').replaceChildren(new Option('Colored primitives','primitives'));
 for(const pack of iconPacks)$('iconSet').add(new Option(`${pack.name} (${pack.images.length} icons)`,pack.id));
 $('iconSet').value=iconPacks.some(p=>p.id===selected)?selected:'primitives';updateIconLimit();
}

$('iconSet').onchange=()=>{preferredIconSet=$('iconSet').value;updateIconLimit();save();say('Icon set selected. Generate a new board to use it.');};
$('refreshIcons').onclick=async()=>{try{await refreshIconPacks();say(`Found ${iconPacks.length} icon packs. Choose one, then generate a new board.`);}catch(e){say(e.message);}};
function showRules(){
 if($('rulesDialog').open)return;elapsed=seconds();if(busy&&activeMatch){cancelPresentation();for(const tile of tiles)tile.classList.remove('removing');render();}$('rulesDialog').showModal();
}
$('howToPlay').onclick=showRules;
$('rulesDialog').addEventListener('close',()=>{started=performance.now();try{localStorage.setItem('onet.rules.seen.v1','1');}catch{}if(revealPending)void spawnTiles();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!paused&&!finished&&!revealPending&&!$('rulesDialog').open){elapsed+=(performance.now()-started)/1000;cancelPresentation();for(const tile of tiles)tile.classList.remove('removing');paused=true;render();}}else started=performance.now();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(busy){cancelPresentation();for(const tile of tiles)tile.classList.remove('removing');render();}});
document.body.classList.toggle('dark',$('theme').value==='dark');updatePathControls();
(async()=>{try{await refreshIconPacks();}catch(e){say(e.message);}try{if(!localStorage.getItem('onet.rules.seen.v1'))showRules();}catch{showRules();}newBoard();})();

window.addEventListener('resize',()=>{if(activeMatch){cancelPresentation();render();}});
