import React, {useState,useEffect} from 'react';
import {db} from './backend';

function Conversation({me,peer,initialDraft}) {
  const [rows,setRows]=useState([]), [draft,setDraft]=useState(initialDraft), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  useEffect(()=>{
    let active=true, version=0;
    async function refresh(){
      const request=++version;
      const result=await db.from('messages').select('id,sender_id,body,created_at')
        .or(`and(sender_id.eq.${me},recipient_id.eq.${peer.id}),and(sender_id.eq.${peer.id},recipient_id.eq.${me})`)
        .order('created_at',{ascending:false}).limit(100);
      if(!active || request!==version)return;
      if(result.error)setError(result.error.message);else setRows(result.data.reverse());
    }
    refresh();
    const channel=db.channel('im-'+me+'-'+peer.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},refresh)
      .subscribe(status=>{if(status==='SUBSCRIBED')refresh()});
    const timer=setInterval(refresh,15000);
    return ()=>{active=false;clearInterval(timer);db.removeChannel(channel)};
  },[me,peer.id]);
  async function send(e){
    e.preventDefault();if(busy||!draft.trim())return;
    setBusy(true);setError('');
    try{
      const {data,error}=await db.from('messages').insert({sender_id:me,recipient_id:peer.id,body:draft.trim()}).select('id,sender_id,body,created_at').single();
      if(error)throw error;
      setRows(prev=>prev.some(m=>m.id===data.id)?prev:[...prev,data]);setDraft('');
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  return <section className="bg-[#ece9d8] bevel-out p-3"><h3 className="aim-header-bar text-white p-2 font-bold">Instant message with @{peer.username}</h3>
    <div role="log" className="bevel-in bg-white p-3 my-2 max-h-80 min-h-44 overflow-y-auto">{rows.map(m=><p key={m.id} className="break-words whitespace-pre-wrap"><strong>{m.sender_id===me?'You':peer.username}</strong> <small>{new Date(m.created_at).toLocaleString()}</small> {m.body}</p>)}</div>
    <form onSubmit={send} className="flex gap-2"><input aria-label="Private message" placeholder="Write an IM…" maxLength={4000} value={draft} disabled={busy} onChange={e=>setDraft(e.target.value)} className="bevel-in bg-white min-w-0 flex-1 p-2"/><button disabled={busy||!draft.trim()} className="bevel-btn px-3">Send IM</button></form>{error&&<p role="alert">{error}</p>}</section>
}

export default function Messenger({me,tradeChat=null}){
  const [links,setLinks]=useState([]),[peer,setPeer]=useState(tradeChat?.peer),[term,setTerm]=useState(''),[result,setResult]=useState(null),[notice,setNotice]=useState(''),[tick,setTick]=useState(0);
  const [tradeDraft,setTradeDraft]=useState(tradeChat?.draft || '');
  useEffect(()=>{
    let active=true,version=0;
    async function refresh(){
      const request=++version;
      const {data,error}=await db.from('buddies').select('id,requester,recipient,accepted,from:profiles!requester(id,username,avatar_url,now_spinning,last_active_at),to:profiles!recipient(id,username,avatar_url,now_spinning,last_active_at)');
      if(!active||request!==version)return;
      if(error)setNotice(error.message);else setLinks(data);
    }
    refresh();
    const channel=db.channel('roster-'+me).on('postgres_changes',{event:'*',schema:'public',table:'buddies'},refresh).subscribe(status=>{if(status==='SUBSCRIBED')refresh()});
    const timer=setInterval(refresh,15000);
    return ()=>{active=false;clearInterval(timer);db.removeChannel(channel)};
  },[me,tick]);
  async function search(e){
    e.preventDefault();setNotice('');setResult(null);
    const {data,error}=await db.from('profiles').select('id,username').eq('username',term.trim()).neq('id',me).maybeSingle();
    if(error||!data)setNotice(error?.message||'No other member has that screen name.');else setResult(data);
  }
  async function change(operation){
    const {error}=await operation;
    setNotice(error?.code==='23505'?'A buddy request already exists.':error?.message||'Buddy list updated.');
    if(!error)setResult(null);
    setTick(n=>n+1);
  }
  const buddies=links.map(link=>({...link,person:link.requester===me?link.to:link.from}));
  const selected=buddies.find(b=>b.accepted&&b.person.id===peer);
  return <div className="grid gap-4 md:grid-cols-[320px_1fr] text-sm"><aside className="bg-[#ece9d8] bevel-out p-3"><h2 className="aim-header-bar text-white font-bold p-2">AIM Buddy List</h2>
    <form onSubmit={search} className="flex gap-2 my-3"><input aria-label="Member screen name" className="bg-white bevel-in p-2 min-w-0 flex-1" placeholder="Exact screen name" required value={term} onChange={e=>{setTerm(e.target.value);setResult(null)}}/><button className="bevel-btn px-2">Find</button></form>
    {result&&<p>@{result.username} <button className="bevel-btn px-2" disabled={buddies.some(b=>b.person.id===result.id)} onClick={()=>change(db.from('buddies').insert({requester:me,recipient:result.id}))}>Add buddy</button></p>}
    {notice&&<p role="status">{notice}</p>}<ul className="bg-white bevel-in p-2">{buddies.map(b=><li className="py-2 border-b" key={b.id}>
      {b.accepted && <div>{b.person.avatar_url && <img src={b.person.avatar_url} alt="" className="w-8 h-8 inline object-cover" referrerPolicy="no-referrer"/>} <small>{Date.now()-Date.parse(b.person.last_active_at)<120000?"Online":"Offline"}</small>{b.person.now_spinning && <p>Now spinning: {b.person.now_spinning}</p>}</div>}
      {b.accepted?<button className="text-blue-800 underline" onClick={()=>{if(peer!==b.person.id)setTradeDraft('');setPeer(b.person.id)}}>Message @{b.person.username}</button>:<><b>@{b.person.username}</b> {b.recipient===me?<button className="bevel-btn px-2" onClick={()=>change(db.from('buddies').update({accepted:true}).eq('id',b.id))}>Accept</button>:'Request sent'}</>}
      <button className="text-xs ml-2 underline" onClick={()=>change(db.from('buddies').delete().eq('id',b.id))}>{b.accepted?'Remove':b.recipient===me?'Decline':'Cancel request'}</button></li>)}
      {!buddies.length&&<li>Find a member by screen name to add your first buddy.</li>}</ul></aside>
    {selected?<Conversation key={selected.person.id} me={me} peer={selected.person} initialDraft={tradeDraft}/>:<section className="bg-white bevel-in p-4">Select an accepted buddy to open a private conversation.</section>}</div>
}
