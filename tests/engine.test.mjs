import test from 'node:test';import assert from 'node:assert/strict';import {route,generate,verify,moves} from '../engine.mjs';
test('straight, one turn, outside two-turn connections',()=>{
 const cells=Array(16).fill(0);cells[0]=cells[3]=1;assert.equal(route(cells,4,4,0,3).length,2);
 cells[3]=0;cells[5]=1;assert.equal(route(cells,4,4,0,5).length,3);
 const full=Array.from({length:16},(_,i)=>i+2);full[0]=full[3]=1;assert.equal(route(full,4,4,0,3).length,4);
});
test('reject mismatch, self, blocked interior and too many turns',()=>{
 const cells=Array.from({length:36},(_,i)=>i+2);cells[7]=cells[28]=1;
 assert.equal(route(cells,6,6,7,28),null);assert.equal(route(cells,6,6,7,7),null);assert.equal(route(cells,6,6,7,8),null);
});
test('fixed seeds generate deterministic fully clearable boards with even type counts',()=>{
 for(const [cols,rows]of [[6,6],[8,6],[10,8],[12,10]])for(let seed=0;seed<4;seed++){
  const b=generate(cols,rows,8,seed);assert(verify(b));assert.equal(b.cells.filter(Boolean).length,cols*rows);assert(moves(b.cells,cols,rows).length>0);
  const counts=new Map();b.cells.forEach(v=>counts.set(v,(counts.get(v)||0)+1));for(const n of counts.values())assert.equal(n%2,0);
  assert.deepEqual(generate(cols,rows,8,seed),b);
 }
});
test('rebuild remaining positions and replay all cuts',()=>{
 const b=generate(8,6,8,91);const state=[...b.cells];for(const {a,b:other} of b.solution.slice(0,8))state[a]=state[other]=0;
 const slots=state.map((v,i)=>v?i:-1).filter(i=>i>=0),next=generate(8,6,8,92,slots);assert(verify(next));assert.deepEqual(next.cells.map((v,i)=>v?i:-1).filter(i=>i>=0),slots);
});
test('invalid dimensions are rejected',()=>{assert.throws(()=>generate(5,5,4,0));assert.throws(()=>generate(3,6,4,0));});

import {SHAPES,shapeMarkup} from '../shapes.mjs';
test('40 unique reference silhouettes and high-type deals',()=>{assert.equal(SHAPES.length,40);assert.equal(new Set(SHAPES.map(s=>s.name)).size,40);assert.equal(new Set(SHAPES.map(s=>s.body)).size,40);for(let type=1;type<=40;type++)assert(shapeMarkup(type).includes('viewBox="0 0 64 64"'));assert(verify(generate(12,12,40,19)));assert.throws(()=>generate(6,6,641,0));});

import {typeVisual,MAX_TILE_TYPES} from '../shapes.mjs';
test('all shape-color identities are distinct and matching requires both',()=>{
 assert.equal(MAX_TILE_TYPES,640);const identities=new Set();
 for(let type=1;type<=MAX_TILE_TYPES;type++){const v=typeVisual(type);identities.add(v.shapeIndex+':'+v.colorIndex);}
 assert.equal(identities.size,640);
 assert.equal(typeVisual(1).shapeIndex,typeVisual(41).shapeIndex);assert.notEqual(typeVisual(1).color,typeVisual(41).color);
 const cells=Array(36).fill(0);cells[0]=1;cells[1]=41;assert.equal(route(cells,6,6,0,1),null);
 cells[1]=1;assert(route(cells,6,6,0,1));assert(verify(generate(12,12,640,23)));
});
