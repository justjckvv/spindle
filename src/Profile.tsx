import {Scores} from './TradeFeedback';
import React,{useState,useEffect} from 'react';
import {db} from './backend';

export default function Profile({account,onSave}) {
  const [name,setName]=useState(account.username);
  const [avatar,setAvatar]=useState(account.avatar_url||'');
  const [status,setStatus]=useState(account.now_spinning||'');
  const [away,setAway]=useState(account.away_message||'');
  const [message,setMessage]=useState('');
  const [members,setMembers]=useState([]);
  const [search,setSearch]=useState('');
  const [directoryError,setDirectoryError]=useState('');
  useEffect(()=>{
    let active=true;
    db.from('profiles').select('id,username,avatar_url,now_spinning,joined_at').order('username').limit(200).then(({data,error})=>{
      if(!active)return;
      if(error)setDirectoryError(error.message);else setMembers(data||[]);
    });
    return ()=>{active=false};
  },[account.id]);
  async function save(event){
    event.preventDefault();
    const {data,error}=await db.from('profiles').update({username:name.trim(),avatar_url:avatar.trim()||null,now_spinning:status.trim(),away_message:away.trim()}).eq('id',account.id).select().single();
    if(error){setMessage(error.code==='23505'?'That screen name is taken.':error.message);return;}
    onSave(data);setMessage('Profile saved.');
  }
  return <div className="space-y-4"><form onSubmit={save} className="bg-[#f4f1ea] bevel-out max-w-lg p-4 space-y-3">
    <h2 className="font-bold">Collector profile</h2><p>Member since {new Date(account.joined_at).toLocaleDateString()}</p>
    <label className="block">Screen name<input className="block bg-white bevel-in p-2 w-full" required pattern="[A-Za-z0-9_]{3,32}" value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className="block">Avatar image URL<input className="block bg-white bevel-in p-2 w-full" type="url" pattern="https://.+" placeholder="https://" value={avatar} onChange={e=>setAvatar(e.target.value)}/></label>
    <Scores member={account.id}/><label className="block">Away message or song quote<input className="block bg-white bevel-in p-2 w-full" maxLength={160} value={away} onChange={e=>setAway(e.target.value)}/></label>
    <label className="block">Now spinning<input className="block bg-white bevel-in p-2 w-full" maxLength={180} value={status} onChange={e=>setStatus(e.target.value)}/></label>
    <button className="bevel-btn px-3 py-1">Save profile</button><p role="status">{message}</p></form>
    <section className="bg-[#f4f1ea] bevel-out p-4 space-y-3">
      <h2 className="font-bold">Collector directory</h2>
      <label className="block">Find a collector<input className="block bg-white bevel-in p-2 w-full" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search screen names"/></label>
      {directoryError&&<p role="alert">{directoryError}</p>}
      <ul className="space-y-2">{members.filter(m=>m.username.toLowerCase().includes(search.toLowerCase())).map(m=><li key={m.id} className="border-b p-2">
        <details><summary className="cursor-pointer font-bold">@{m.username}</summary>
        {m.avatar_url?.startsWith('https://')&&<img src={m.avatar_url} alt="" referrerPolicy="no-referrer" className="w-12 h-12 object-cover" loading="lazy"/>}
        <p>Member since {new Date(m.joined_at).toLocaleDateString()}</p><p>Now spinning: {m.now_spinning||'Nothing listed'}</p></details>
      </li>)}</ul>
    </section></div>
}
