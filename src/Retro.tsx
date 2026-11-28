import React,{useState,useEffect} from 'react';
import {db} from './backend';
let context;
export function retroSound(kind){
  try{
    if(localStorage.getItem('spindle:sounds')!=='on')return;
    context ||= new AudioContext();
    if(context.state!=='running')context.resume().catch(()=>{});
    const notes=kind==='im'?[660,440]:kind==='tray'?[110,155,210]:[830];
    notes.forEach((note,i)=>{
      const tone=context.createOscillator(),gain=context.createGain(),start=context.currentTime+i*.09;
      tone.type=kind==='tray'?'sawtooth':'sine';tone.frequency.value=note;
      gain.gain.setValueAtTime(.035,start);gain.gain.exponentialRampToValueAtTime(.001,start+.09);
      tone.connect(gain).connect(context.destination);tone.start(start);tone.stop(start+.1);
    });
  }catch{}
}
function preference(key,fallback){
  const [value,set]=useState(()=>{try{return localStorage.getItem('spindle:'+key)||fallback}catch{return fallback}});
  function change(v){set(v);try{localStorage.setItem('spindle:'+key,v)}catch{}}
  return [value,change];
}
export function RetroPlayer({track,toggle,me}){
  const [skin,setSkin]=preference('skin','Classic'),[visual,setVisual]=preference('visual','Bars'),[sounds,setSounds]=preference('sounds','off');
  useEffect(()=>{
    if(!me||sounds!=='on')return;
    const channel=db.channel('retro-chime-'+me).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:'recipient_id=eq.'+me},()=>retroSound('im')).subscribe();
    return ()=>{db.removeChannel(channel)};
  },[me,sounds]);
  return <div className={'retro-panel skin-'+skin.toLowerCase()}><strong>WINAMP</strong>
    <span className="retro-display">{track.title}</span>
    <button type="button" aria-label={track.playing?'Pause display':'Resume display'} onClick={toggle}>{track.playing?'Ⅱ':'▶'}</button>
    {visual!=='Off' && <svg aria-hidden="true" viewBox="0 0 60 22" className={'retro-vis '+(track.playing?'animating':'')}>
      {visual==='Scope'?<path className="scope" d="M0 12h7l3 -6 4 12 5 -16 5 18 4 -12 4 5h7l4 -8 5 13 4 -7h8" fill="none" stroke="currentColor"/>:Array.from({length:12},(_,i)=><rect key={i} x={i*5} y={3+(i*7)%13} width="3" height={19-(i*7)%13} style={{animationDelay:(i*-.13)+'s'}}/>)}
    </svg>}
    <label>Skin <select value={skin} onChange={e=>setSkin(e.target.value)}>{['Classic','Metallic','Dark'].map(s=><option key={s}>{s}</option>)}</select></label>
    <label>Visual <select value={visual} onChange={e=>setVisual(e.target.value)}>{['Bars','Scope','Off'].map(s=><option key={s}>{s}</option>)}</select></label>
    <button type="button" aria-pressed={sounds==='on'} onClick={()=>{setSounds(sounds==='on'?'off':'on');if(sounds==='off')retroSound('im')}}>Sounds {sounds}</button>
  </div>
}
