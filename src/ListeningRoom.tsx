import React,{useEffect,useRef,useState} from 'react';
import {db} from './backend';
const emotes=['💿','♫','💔'];
export default function ListeningRoom({me}){
  const [tracks,setTracks]=useState([]),[slots,setSlots]=useState([]),[queue,setQueue]=useState([]),[now,setNow]=useState(Date.now()),[listening,listen]=useState(false),[notice,setNotice]=useState(''),[reaction,setReaction]=useState(null),[revision,reload]=useState(0),[busy,setBusy]=useState(false);
  const offset=useRef(0),player=useRef(null),room=useRef(null);
  useEffect(()=>{
    let active=true,running=false;
    async function refresh(){
      if(running)return;running=true;
      try{
        const start=Date.now(),clock=await db.rpc('room_clock');if(clock.error)throw clock.error;
        const server=Date.parse(clock.data),delta=server-(start+Date.now())/2,cutoff=new Date(server-2000).toISOString();
        const [a,b,c]=await Promise.all([db.from('room_tracks').select('*').order('title'),db.from('dj_slots').select('*,profiles(username)').gt('ends',cutoff).order('starts'),db.from('room_queue').select('*,room_tracks(title)').gt('ends',cutoff).order('starts')]);
        if(!active)return;if(a.error||b.error||c.error)throw a.error||b.error||c.error;
        offset.current=delta;setTracks(a.data);setSlots(b.data);setQueue(c.data);setNow(Date.now()+delta);
      }catch(e){if(active)setNotice(e.message)}finally{running=false}
    }
    refresh();const poll=setInterval(refresh,3000),tick=setInterval(()=>setNow(Date.now()+offset.current),300);
    return ()=>{active=false;clearInterval(poll);clearInterval(tick)};
  },[revision]);
  useEffect(()=>{const channel=db.channel('spindle-listening-party').on('broadcast',{event:'reaction'},({payload})=>{if(emotes.includes(payload.icon))setReaction({icon:payload.icon,id:crypto.randomUUID()})}).subscribe();room.current=channel;return ()=>{db.removeChannel(channel)}},[]);
  useEffect(()=>{if(reaction){const timer=setTimeout(()=>setReaction(null),2200);return ()=>clearTimeout(timer)}},[reaction]);
  const current=queue.find(q=>Date.parse(q.starts)<=now && Date.parse(q.ends)>now);
  const dj=slots.find(s=>Date.parse(s.starts)<=now && Date.parse(s.ends)>now);
  useEffect(()=>{
    if(!current)return;
    const audio=player.current;
    function sync(){const t=(Date.now()+offset.current-Date.parse(current.starts))/1000;if(t>=0&&t<audio.duration&&Math.abs(audio.currentTime-t)>.5)audio.currentTime=t}
    function start(){sync();if(listening)audio.play().catch(()=>{listen(false);setNotice('Select Listen to enable audio in this browser.')})}
    audio.addEventListener('loadedmetadata',start);
    if(audio.readyState>=1)start();
    const timer=setInterval(sync,1000);
    return ()=>{clearInterval(timer);audio.removeEventListener('loadedmetadata',start)};
  },[current?.id,listening]);
  function toggleAudio(){
    if(listening){player.current.pause();listen(false);return}
    listen(true);
    if(current)player.current.play().catch(()=>{listen(false);setNotice('Audio could not start. Select Listen to retry.')});
  }
  async function action(name,args={}){setBusy(true);try{const {error}=await db.rpc(name,args);if(error)throw error;setNotice('');reload(n=>n+1)}catch(e){setNotice(e.message)}finally{setBusy(false)}}
  return <section className="bevel-out bg-[#ece9d8] p-4 space-y-3"><h2 className="font-bold">Listening Party Room</h2>
    <p>{current?'Now playing · '+current.room_tracks.title:'The room queue is empty.'} {current && Math.floor((now-Date.parse(current.starts))/1000)+'s / 48s'}</p>
    <audio ref={player} preload="auto" src={current?'/api/room-audio?track='+encodeURIComponent(current.track):undefined} onError={()=>setNotice('Room audio could not load.')}/>
    <button className="bevel-btn p-1" onClick={toggleAudio}>{listening?'Mute room':'Listen to room'}</button>
    <h3 className="font-bold">DJ rotation</h3><p>{dj?'On deck · @'+dj.profiles.username:'The DJ booth is open.'}</p>
    {slots.filter(s=>s!==dj).map(s=><p key={s.starts}>@{s.profiles.username} · {new Date(s.starts).toLocaleTimeString()}</p>)}
    <button className="bevel-btn p-1" disabled={busy||slots.some(s=>s.member===me && Date.parse(s.ends)>now)} onClick={()=>action('join_dj_rotation')}>Join one-hour DJ rotation</button>
    {dj?.member===me && <div><h3>Queue an original Spindle track</h3>{tracks.map(t=><button className="bevel-btn p-1 m-1" key={t.id} disabled={busy} onClick={()=>action('queue_room_track',{track_id:t.id})}>+ {t.title}</button>)}</div>}
    <ol>{queue.filter(q=>Date.parse(q.starts)>now).map(q=><li key={q.id}>{q.room_tracks.title} · {new Date(q.starts).toLocaleTimeString()}</li>)}</ol>
    <div className="pt-6 relative">{reaction&&<span key={reaction.id} className="floating-note absolute top-0 text-xl">{reaction.icon}</span>}{emotes.map(icon=><button className="bevel-btn px-2" key={icon} aria-label={'React '+icon} onClick={async()=>{setReaction({icon,id:crypto.randomUUID()});const result=await room.current?.send({type:'broadcast',event:'reaction',payload:{icon}});if(result!=='ok')setNotice('Reaction could not reach the room.')}}>{icon}</button>)}</div>
    <p role="status">{notice}</p></section>
}
