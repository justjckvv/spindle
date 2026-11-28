import React,{useEffect,useState} from 'react';
import {db} from './backend';
const ratings=['Positive','Neutral','Negative'];
export function Scores({member,revision=0}){
 const [score,set]=useState(null);
 useEffect(()=>{let active=true;db.rpc('collector_scores',{who:member}).then(({data})=>{if(active)set(data)});return ()=>{active=false}},[member,revision]);
 return score&&<p className="text-xs">{score.points} Mixtape Points · Trade feedback: {ratings.map(r=>score[r]+' '+r.toLowerCase()).join(' / ')}</p>
}
export default function TradeFeedback({me,peer}){
 const [terms,setTerms]=useState(''),[rows,setRows]=useState([]),[given,setGiven]=useState([]),[revision,reload]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;async function refresh(){
   const a=await db.from('trade_receipts').select('*').or('and(sender.eq.'+me+',recipient.eq.'+peer+'),and(sender.eq.'+peer+',recipient.eq.'+me+')').order('created_at',{ascending:false});
   if(!active)return;if(a.error){setError(a.error.message);return}
   const b=a.data.length?await db.from('trade_feedback').select('receipt_id,rating').eq('reviewer',me).in('receipt_id',a.data.map(t=>t.id)):{data:[]};
   if(active){setRows(a.data);setGiven(b.data||[]);if(b.error)setError(b.error.message)}
 }refresh();const timer=setInterval(refresh,8000);return ()=>{active=false;clearInterval(timer)}},[me,peer,revision]);
 async function act(query){setBusy(true);try{const {error}=await query;if(error)throw error;setError('');reload(n=>n+1);return true}catch(e){setError(e.message);return false}finally{setBusy(false)}}
 return <details className="mt-3 bevel-in p-2"><summary>Trade receipts &amp; feedback</summary><Scores member={peer} revision={revision}/>
 <form onSubmit={async e=>{e.preventDefault();if(await act(db.from('trade_receipts').insert({recipient:peer,terms:terms.trim()})))setTerms('')}}><label>Items exchanged <input required maxLength={240} value={terms} onChange={e=>setTerms(e.target.value)}/></label><button className="bevel-btn p-1" disabled={busy||!terms.trim()}>Record completed trade</button></form>
 {rows.map(t=>{const rating=given.find(r=>r.receipt_id===t.id);return <div className="border-t p-1" key={t.id}><strong>{t.terms}</strong> · {t.confirmed?'Confirmed':t.recipient===me?<button className="bevel-btn p-1" disabled={busy} onClick={()=>act(db.from('trade_receipts').update({confirmed:true}).eq('id',t.id))}>Confirm exchange</button>:'Awaiting buddy confirmation'}
 {t.confirmed&&(rating?<p>Your feedback: {rating.rating}</p>:<div>Rate your buddy {ratings.map(r=><button className="bevel-btn p-1" key={r} disabled={busy} onClick={()=>act(db.from('trade_feedback').insert({receipt_id:t.id,subject:peer,rating:r}))}>{r}</button>)}</div>)}</div>})}<p role="status">{error}</p></details>
}
