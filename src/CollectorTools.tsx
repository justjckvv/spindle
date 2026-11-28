import React,{useEffect,useRef,useState} from 'react';
import Scanner from './Scanner';
import {db} from './backend';
export function Burns({thread,me}){
 const [count,setCount]=useState(0),[mine,setMine]=useState(false),[busy,setBusy]=useState(true),[notice,setNotice]=useState('');
 async function load(){const [total,own]=await Promise.all([db.from('mixtape_burns').select('*',{count:'exact',head:true}).eq('thread_id',thread),db.from('mixtape_burns').select('member').eq('thread_id',thread).eq('member',me).maybeSingle()]);if(total.error||own.error)throw total.error||own.error;setCount(total.count);setMine(!!own.data)}
 useEffect(()=>{load().catch(e=>setNotice(e.message)).finally(()=>setBusy(false))},[thread,me]);
 async function toggle(){setBusy(true);try{const q=db.from('mixtape_burns');const {error}=await(mine?q.delete().eq('thread_id',thread).eq('member',me):q.insert({thread_id:thread}));if(error)throw error;await load();setNotice('')}catch(e){setNotice(e.code==='42501'?'Give kudos to another collector’s post.':e.message)}finally{setBusy(false)}}
 return <div className="px-3"><button className="bevel-btn px-2" disabled={busy} aria-pressed={mine} onClick={toggle}>{mine?'Undo burn':'Burn a CD'} · {count} Mixtape Points</button> <small role="status">{notice}</small></div>
}
export function BarcodeCheck(){
 const [camera,setCamera]=useState(false),[code,setCode]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 const control=useRef(null);
 useEffect(()=>()=>control.current?.abort(),[]);
 async function check(value){
   control.current?.abort();const job=new AbortController();control.current=job;setCamera(false);setCode(value);setBusy(true);
   try{
     if(!/^\d{8,14}$/.test(value))throw Error('Enter an 8–14 digit barcode.');
     let page=1,seen=false;
     while(page){setStatus('Checking Discogs page '+page+'…');const res=await fetch('/api/discogs?'+new URLSearchParams({kind:'barcode',q:value,page:String(page)}),{signal:job.signal});const data=await res.json();if(!res.ok)throw Error(data.error);
       const ids=data.results.map(r=>String(r.id));seen ||= !!ids.length;
       if(ids.length){const {data:matches,error}=await db.rpc('wanted_pressings',{release_ids:ids}).abortSignal(job.signal);if(error)throw error;if(matches.length){setStatus('On your wantlist: '+matches.map(m=>m.title+' (r'+m.release_id+')').join(', '));return}}
       page=data.nextPage;
     }setStatus(seen?'No matching Discogs pressing on your wantlist.':'Discogs has no match for this barcode.');
   }catch(e){if(!job.signal.aborted)setStatus(e.message||'Lookup failed. Please retry.')}finally{if(!job.signal.aborted)setBusy(false)}
 }
 return <section className="bevel-in p-2"><h3 className="font-bold">Check a shop barcode against my wantlist</h3><button className="bevel-btn p-1" disabled={busy} onClick={()=>setCamera(true)}>Scan a shop barcode</button>{camera&&<Scanner onClose={()=>setCamera(false)} onCode={check}/>}
 <input aria-label="Shop barcode" inputMode="numeric" value={code} onChange={e=>setCode(e.target.value)} placeholder="Barcode digits"/><button className="bevel-btn p-1" disabled={busy||!code.trim()} onClick={()=>check(code.trim())}>Check wantlist</button>{busy&&<button onClick={()=>{control.current.abort();setBusy(false);setStatus('Check canceled.')}}>Cancel</button>}<p role="status">{status}</p></section>
}
export function MatrixDirectory({releaseId=null}){
 const [mark,setMark]=useState(''),[rows,setRows]=useState([]),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 async function lookup(){let query=db.from('runouts').select('id,release_id,mark').order('mark').limit(100);
 if(releaseId)query=query.eq('release_id',releaseId);else query=query.ilike('mark',mark.trim().replace(/[\\%_]/g,'\\$&'));
 const {data,error}=await query;if(error)throw error;setRows(data);setNotice(data.length?'':'No contributed markings found.')}
 useEffect(()=>{if(releaseId)lookup().catch(e=>setNotice(e.message))},[releaseId]);
 async function submit(){setBusy(true);try{if(releaseId){const {error}=await db.from('runouts').insert({release_id:releaseId,mark:mark.trim()});if(error)throw error;setMark('')}await lookup()}catch(e){setNotice(e.code==='23505'?'This marking is already listed.':e.message)}finally{setBusy(false)}}
 return <div className="bevel-in p-2"><h3 className="font-bold">Matrix / runout {releaseId?'for r'+releaseId:'directory'}</h3><label>Exact marking <input maxLength={160} value={mark} placeholder="CRECD 060 MPO 01" onChange={e=>setMark(e.target.value)}/></label> <button type="button" className="bevel-btn px-2" disabled={busy||!mark.trim()} onClick={submit}>{releaseId?'Contribute marking':'Find pressing'}</button>
 {rows.map(row=><p key={row.id}>{row.mark} · <a className="underline" target="_blank" rel="noreferrer" href={'https://www.discogs.com/release/'+row.release_id}>r{row.release_id}</a></p>)}<p role="status">{notice}</p></div>
}
