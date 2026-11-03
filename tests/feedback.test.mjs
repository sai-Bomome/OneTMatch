import test from 'node:test';import assert from 'node:assert/strict';
import {FEEDBACK,exposedTiles,newlyExposed,connectionMarkup,FLIP_KEYS} from '../feedback.mjs';
test('first exposure only; diagonal vacancy does not trigger',()=>{
 const state=Array(36).fill(1),initial=exposedTiles(state,6,6);assert(!initial.has(14));assert.deepEqual(newlyExposed(null,initial),[]);
 state[7]=0;const diagonal=exposedTiles(state,6,6);assert(!diagonal.has(14));
 state[13]=0;const open=exposedTiles(state,6,6);assert(newlyExposed(diagonal,open).includes(14));assert.deepEqual(newlyExposed(open,open),[]);
});
test('trace follows tap order and only overlay reverses',()=>{
 const path=[[0,0],[-1,0],[-1,3],[4,3]],normal=connectionMarkup(path,6,6,{matching:true}),reverse=connectionMarkup(path,6,6,{matching:true,reverse:true});
 const points=s=>[...s.matchAll(/points="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(points(normal)[0],points(normal)[1]);assert.equal(points(normal)[0],points(reverse)[0]);assert.equal(points(reverse)[1],points(normal)[0].split(' ').reverse().join(' '));assert.equal(path[0][0],0);
 assert(normal.includes(`animation-delay:${FEEDBACK.firstTraceMs+FEEDBACK.overlayDelayMs}ms`));assert(FEEDBACK.overlayTraceMs<FEEDBACK.firstTraceMs);
 assert(!connectionMarkup(path,6,6).includes('trace-overlay'));assert.equal(FLIP_KEYS.at(-1).offset,1);
});

import {pathTimings} from '../feedback.mjs';
test('constant duration vs constant pixel speed drives all trace durations',()=>{
 const short=[[0,0],[2,0]],long=[[0,0],[6,0]];
 assert.equal(pathTimings(short).firstTraceMs,pathTimings(long).firstTraceMs);
 const options={constantSpeed:true,scaleX:50,scaleY:50},a=pathTimings(short,options),b=pathTimings(long,options);
 const shortPixels=(2-.92)*50,longPixels=(6-.92)*50;
 assert(Math.abs(a.firstTraceMs-shortPixels/FEEDBACK.drawPixelsPerSecond*1000)<.001);
 assert(Math.abs(b.shrinkMs-longPixels/FEEDBACK.shrinkPixelsPerSecond*1000)<.001);
 assert(b.firstTraceMs>a.firstTraceMs&&b.overlayTraceMs>a.overlayTraceMs&&b.shrinkMs>a.shrinkMs);
 const markup=connectionMarkup(long,8,6,{matching:true,timing:b});assert(markup.includes(`--first-trace:${b.firstTraceMs}ms`));
});

import {spawnKeyframes,spawnDelay} from '../feedback.mjs';
test('spawn alternatives settle at full opacity and stagger across the board',()=>{
 for(const style of ['pop','drop','flip']){const frames=spawnKeyframes(style);assert.equal(frames[0].opacity,0);assert.equal(frames.at(-1).opacity,1);assert(frames.at(-1).transform.includes('scale(1)'));}
 assert.equal(spawnDelay(0,8,6),0);assert.equal(spawnDelay(47,8,6),460);assert(spawnDelay(8,8,6)>spawnDelay(0,8,6));assert(spawnDelay(47,8,6,220)<spawnDelay(47,8,6));
});

test('path heads follow draw, reverse overlay and shrink geometry',()=>{
 const path=[[0,0],[0,3],[4,3]],single=connectionMarkup(path,6,6,{matching:true,mode:'shrink'}),double=connectionMarkup(path,6,6,{matching:true,reverse:true});
 assert(single.includes('head-shrink-motion'));assert(single.includes('begin="indefinite"'));assert(double.includes('head-overlay-motion'));
 assert.equal((single.match(/<circle /g)||[]).length,2);assert(!connectionMarkup(path,6,6).includes('animateMotion'));
});

import {spawnDelays} from '../feedback.mjs';
test('reveal directions traverse rectangular boards and reverse consistently',()=>{
 for(const [a,b]of [['in-out','out-in'],['left-right','right-left'],['top-bottom','bottom-top'],['diagonal-tl','diagonal-br'],['diagonal-tr','diagonal-bl'],['spiral-in','spiral-out']]){
  const forward=spawnDelays(8,6,460,a),reverse=spawnDelays(8,6,460,b);
  assert.equal(forward.length,48);assert.equal(Math.min(...forward),0);assert.equal(Math.max(...forward),460);
  forward.forEach((value,i)=>assert(Math.abs(value+reverse[i]-460)<1e-8));
 }
 assert.equal(new Set(spawnDelays(8,6,460,'spiral-in')).size,48);
 assert(spawnDelays(5,5,460,'in-out')[12]<spawnDelays(5,5,460,'in-out')[0]);
});
