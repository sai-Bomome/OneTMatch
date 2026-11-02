import {SHAPES,TYPE_COLORS,typeVisual,shapeMarkup} from './shapes.mjs';
export function iconTypeLimit(images=[]){return Math.min(640,(images.length||SHAPES.length)*TYPE_COLORS.length);}
export function iconVisual(type,images=[]){
 if(!images.length)return typeVisual(type);
 if(!Number.isInteger(type)||type<1||type>iconTypeLimit(images))throw Error('Type is outside the selected icon set.');
 const shapeIndex=(type-1)%images.length,variant=Math.floor((type-1)/images.length),colorIndex=(shapeIndex+variant)%TYPE_COLORS.length;
 return {shapeIndex,colorIndex,color:TYPE_COLORS[colorIndex],name:`Custom icon ${shapeIndex+1}`};
}
export function iconMarkup(type,images=[]){
 if(!images.length)return shapeMarkup(type);
 const {shapeIndex}=iconVisual(type,images),url=images[shapeIndex].replace(/[&"'<>]/g,c=>({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[c]));
 return `<span class="custom-icon" style="--icon-url:url(&quot;${url}&quot;)" aria-hidden="true"></span>`;
}
