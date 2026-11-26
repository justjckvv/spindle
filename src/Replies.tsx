import React, {useEffect, useState} from 'react';
import {db} from './backend';

const fields = 'id,body,created_at,profiles(username)';
export default function Replies({threadId, userId}) {
  const [open,setOpen] = useState(false);
  const [rows,setRows] = useState([]);
  const [draft,setDraft] = useState('');
  const [error,setError] = useState('');
  const [sending,setSending] = useState(false);
  useEffect(() => {
    if (!open) return;
    let active = true;
    async function load() {
      const result = await db.from('comments').select(fields).eq('thread_id',threadId).order('created_at');
      if (!active) return;
      if (result.error) setError(result.error.message);
      else setRows(previous => {
        const merged = new Map([...previous,...result.data].map(row=>[row.id,row]));
        return [...merged.values()].sort((a,b)=>a.created_at.localeCompare(b.created_at));
      });
    }
    load();
    const channel = db.channel('replies-'+threadId).on('postgres_changes',
      {event:'INSERT',schema:'public',table:'comments',filter:'thread_id=eq.'+threadId}, load
    ).subscribe(status=>{if(status==='SUBSCRIBED')load()});
    return () => { active=false; db.removeChannel(channel); };
  },[open,threadId]);

  async function send(event) {
    event.preventDefault();
    if(sending || !draft.trim()) return;
    setSending(true); setError('');
    try {
      const result = await db.from('comments').insert({thread_id:threadId,user_id:userId,body:draft.trim()}).select(fields).single();
      if(result.error) throw result.error;
      setRows(previous=>previous.some(row=>row.id===result.data.id)?previous:[...previous,result.data]);
      setDraft('');
    } catch(e) { setError(e.message); }
    finally { setSending(false); }
  }
  return <section className="border-t border-[#bcccdc] p-3 text-sm">
    <button aria-expanded={open} onClick={()=>setOpen(!open)} className="bevel-btn px-3 py-1">{open?'Hide replies':(userId?'View replies / Reply':'View replies')}</button>
    {open && <div className="mt-2 space-y-2">{rows.map(row=><div key={row.id} className="border-l-2 border-[#829ab1] pl-2">
      <strong>@{row.profiles?.username || 'Member'}</strong> <time className="text-xs" dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
      <p className="whitespace-pre-wrap break-words">{row.body}</p></div>)}
      {userId && <form onSubmit={send}><textarea aria-label="Your reply" required maxLength={10000} disabled={sending} placeholder="Reply to this thread…" className="w-full bevel-in bg-white p-2" value={draft} onChange={e=>setDraft(e.target.value)}/>
      <button disabled={sending||!draft.trim()} className="bevel-btn px-3 py-1">{sending?'Posting…':'Post reply'}</button></form>}
      {error && <p role="alert">{error}</p>}</div>}
  </section>;
}
