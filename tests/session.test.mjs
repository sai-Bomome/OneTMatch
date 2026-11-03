import test from 'node:test';
import assert from 'node:assert/strict';
import {applyMatch,finishingMove,gridNeighbor} from '../session.mjs';
import {generate,route} from '../engine.mjs';
import {createFeedbackScope} from '../presentation.mjs';

test('match commits independently of presentation and cannot clear the same cells twice',()=>{
 const cells=Array(16).fill(0);cells[0]=cells[3]=1;cells[4]=cells[7]=2;
 const result=applyMatch(cells,4,4,0,3);
 assert(result.ok);assert.equal(result.cells[0],0);assert.equal(result.cells[3],0);assert.equal(cells[0],1);
 assert(!result.complete);assert.deepEqual(result.event.path,[[0,0],[3,0]]);
 assert(!applyMatch(result.cells,4,4,0,3).ok);assert(applyMatch(result.cells,4,4,4,7).complete);
});
test('denial differentiates identity from blocked route without modifying the board',()=>{
 const cells=Array.from({length:36},(_,i)=>i+1);cells[7]=cells[28]=50;
 const copy=[...cells];assert.equal(applyMatch(cells,6,6,7,28).reason,'blocked');assert.equal(applyMatch(cells,6,6,0,1).reason,'identity');assert.deepEqual(cells,copy);
});
test('ending auto-clear uses legal routes and can clear certified three-pair tails',()=>{
 const board=generate(8,8,30,1083);let cells=[...board.cells];
 for(const {a,b}of board.solution.slice(0,-3)){cells[a]=cells[b]=0;}
 for(let n=0;n<3;n++){const move=finishingMove(cells,8,8);assert(move);assert(route(cells,8,8,move.a,move.b));cells=applyMatch(cells,8,8,move.a,move.b).cells;}
 assert(cells.every(v=>!v));assert.equal(finishingMove(board.cells,8,8),null);
});
test('keyboard movement skips empty cells without wrapping rows',()=>{
 const cells=Array(16).fill(1);cells[1]=0;assert.equal(gridNeighbor(cells,4,4,0,'ArrowRight'),2);assert.equal(gridNeighbor(cells,4,4,3,'ArrowRight'),3);
 assert.equal(gridNeighbor(cells,4,4,0,'ArrowDown'),4);assert.equal(gridNeighbor(cells,4,4,9,'Home'),0);assert.equal(gridNeighbor(cells,4,4,9,'End'),15);
});
test('cancellation releases pending waits without a presentation completion',async()=>{
 const scope=createFeedbackScope();const pending=scope.wait(10000);scope.cancel();assert.equal(await pending,false);assert.equal(await scope.wait(10),false);
});
test('reduced motion and unavailable animation APIs never block feedback completion',async()=>{
 const scope=createFeedbackScope(()=>true);assert.equal(await scope.wait(10000),true);await scope.animate(null,[],{duration:100});
 const ordinary=createFeedbackScope();await ordinary.animate({},[],{});ordinary.cancel();
});

test('animation rejection is contained and cancellation cleans up tracked handles',async()=>{
 let rejectFinished,cancelCount=0;
 const finished=new Promise((_,reject)=>{rejectFinished=reject;});
 const target={animate(){return {finished,cancel(){cancelCount++;rejectFinished(Error('cancelled'));}};}};
 const scope=createFeedbackScope();const pending=scope.animate(target,[],{duration:10000});scope.cancel();await pending;assert(cancelCount>=1);assert(scope.cancelled);
});

import {playUnlock} from '../presentation.mjs';
test('tile retains gray unlock presentation until the icon animation finishes',async()=>{
 const classes=new Set(),tile={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},querySelector:()=>({})};
 let complete;const pending=playUnlock(tile,[],{animate:()=>new Promise(resolve=>{complete=resolve;})},{});
 assert(classes.has('unlocking'));complete();await pending;assert(!classes.has('unlocking'));
});
test('an older unlock completion cannot reveal a newer unlock animation',async()=>{
 const classes=new Set(),tile={classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},querySelector:()=>({})};
 let finishA,finishB;const a=playUnlock(tile,[],{animate:()=>new Promise(resolve=>{finishA=resolve;})},{}),b=playUnlock(tile,[],{animate:()=>new Promise(resolve=>{finishB=resolve;})},{});
 finishA();await a;assert(classes.has('unlocking'));finishB();await b;assert(!classes.has('unlocking'));
});
