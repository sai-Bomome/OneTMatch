import test from 'node:test';import assert from 'node:assert/strict';
import {iconVisual,iconMarkup,iconTypeLimit} from '../icons.mjs';
test('custom icons have distinct colored identities and valid markup',()=>{
 const images=['icons/Animals/cat.svg','icons/Animals/dog.png'];assert.equal(iconTypeLimit(images),32);
 const seen=new Set();for(let type=1;type<=32;type++){const visual=iconVisual(type,images);seen.add(visual.shapeIndex+':'+visual.colorIndex);}
 assert.equal(seen.size,32);assert.notEqual(iconVisual(1,images).color,iconVisual(3,images).color);assert.equal(iconVisual(1,images).shapeIndex,iconVisual(3,images).shapeIndex);
 assert(iconMarkup(1,images).includes('cat.svg'));assert(iconMarkup(2,images).includes('dog.png'));assert.throws(()=>iconVisual(33,images));
 assert.equal(iconTypeLimit(),640);assert(iconMarkup(1).includes('<svg'));assert(iconMarkup(1,['icons/X/a"b.svg']).includes('&quot;'));
});

import {iconDescription} from '../icons.mjs';
test('accessible identities include color as well as shape',()=>{
 assert.notEqual(iconDescription(1),iconDescription(41));assert(iconDescription(1).includes('rose'));assert(iconDescription(1,['icons/Test/cat.svg']).includes('Custom icon 1'));
});
