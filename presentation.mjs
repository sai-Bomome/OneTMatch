// Small cancellation scope shared by waits and Web Animations; no rule state here.
export function createFeedbackScope(reducedMotion=()=>false){
 const controller=new AbortController(),animations=new Set();
 return {
  get cancelled(){return controller.signal.aborted;},
  wait(ms){
   if(controller.signal.aborted)return Promise.resolve(false);
   if(reducedMotion()||ms<=0)return Promise.resolve(true);
   return new Promise(resolve=>{
    const finish=ok=>{clearTimeout(timer);controller.signal.removeEventListener('abort',abort);resolve(ok);};
    const abort=()=>finish(false),timer=setTimeout(()=>finish(true),ms);
    controller.signal.addEventListener('abort',abort,{once:true});
   });
  },
  async animate(target,frames,options={}){
   if(controller.signal.aborted||!target?.animate||reducedMotion())return;
   const animation=target.animate(frames,options);animations.add(animation);
   try{await animation.finished;}catch{}finally{animations.delete(animation);animation.cancel();}
  },
  cancel(){controller.abort();for(const animation of animations)animation.cancel();animations.clear();}
 };
}

// Quiet synthesized cues avoid asset downloads and fail silently if audio is unavailable.
export function createSound(settings){
 let context=null;const voices=new Set(),last=new Map();
 function stop(){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
 return {
  unlock(){
   if(!settings().enabled)return;
   try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;context??=new Audio();context.resume()?.catch(()=>{});}catch{}
  },
  stop,
  play(kind){
   const {enabled,volume}=settings();if(!enabled||!context||context.state!=='running')return;
   const now=context.currentTime;if(now-(last.get(kind)??-Infinity)<.075||voices.size>=4)return;last.set(kind,now);
   const notes={select:[600],match:[740,990],deny:[240,190],complete:[660,830,990]}[kind]||[500];
   const duration=kind==='complete'?.26:kind==='select'?.055:.12;
   notes.forEach((frequency,i)=>{
    if(voices.size>=4)return;
    const oscillator=context.createOscillator(),gain=context.createGain(),start=now+i*.055;
    oscillator.type='sine';oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(Math.min(.08,Math.max(0,volume)*.08)/notes.length,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain);gain.connect(context.destination);voices.add(oscillator);
    oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect();};
    oscillator.start(start);oscillator.stop(start+duration+.01);
   });
  }
 };
}

const unlockOwners=new WeakMap();
// Hold the enclosed visual until the icon has returned to full size/orientation.
export async function playUnlock(tile,frames,scope,options){
 if(!tile)return;
 const owner={};unlockOwners.set(tile,owner);tile.classList.add('unlocking');
 try{await scope.animate(tile.querySelector('.glyph'),frames,options);}
 finally{if(unlockOwners.get(tile)===owner){unlockOwners.delete(tile);tile.classList.remove('unlocking');}}
}
