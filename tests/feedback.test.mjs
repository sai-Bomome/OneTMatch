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
