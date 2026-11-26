import React,{useState} from 'react';
import {db} from './backend';

export default function Profile({account,onSave}) {
  const [name,setName]=useState(account.username);
  const [avatar,setAvatar]=useState(account.avatar_url||'');
  const [status,setStatus]=useState(account.now_spinning||'');
  const [message,setMessage]=useState('');
  async function save(event){
    event.preventDefault();
    const {data,error}=await db.from('profiles').update({username:name.trim(),avatar_url:avatar.trim()||null,now_spinning:status.trim()}).eq('id',account.id).select().single();
    if(error){setMessage(error.code==='23505'?'That screen name is taken.':error.message);return;}
    onSave(data);setMessage('Profile saved.');
  }
  return <form onSubmit={save} className="bg-[#f4f1ea] bevel-out max-w-lg p-4 space-y-3">
    <h2 className="font-bold">Collector profile</h2><p>Member since {new Date(account.joined_at).toLocaleDateString()}</p>
    <label className="block">Screen name<input className="block bg-white bevel-in p-2 w-full" required pattern="[A-Za-z0-9_]{3,32}" value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className="block">Avatar image URL<input className="block bg-white bevel-in p-2 w-full" type="url" pattern="https://.+" placeholder="https://" value={avatar} onChange={e=>setAvatar(e.target.value)}/></label>
    <label className="block">Now spinning<input className="block bg-white bevel-in p-2 w-full" maxLength={180} value={status} onChange={e=>setStatus(e.target.value)}/></label>
    <button className="bevel-btn px-3 py-1">Save profile</button><p role="status">{message}</p></form>
}
