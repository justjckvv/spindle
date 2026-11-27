import CollectionExport from './CollectionExport';
import React,{useEffect,useState} from 'react';
import DiscogsLookup from './DiscogsLookup';
import {db} from './backend';

const blank={artist:'',title:'',format:'CD',pressing:'',budget:'',discogsId:null};
function TradeMatch({match, wanted, offers, onMessage}) {
  const [offerId, setOfferId] = useState('');
  const offer = offers.find(copy => copy.id === offerId);
  function compose() {
    const pressing = [wanted.format, match.item_condition, 'Discogs r' + wanted.discogsId].filter(Boolean).join(', ');
    const request = `Hi @${match.screen_name}, is your copy of ${wanted.artist} — ${wanted.title} (${pressing}) still available to trade?`;
    const details = offer && [offer.format, offer.condition, offer.discogsId && 'Discogs r' + offer.discogsId].filter(Boolean).join(', ');
    const proposal = offer ? ` I can offer ${offer.artist} — ${offer.title}${details ? ' (' + details + ')' : ''}.` : '';
    onMessage(match.buddy_id, request + proposal);
  }
  return <div className="my-2 bg-[#e6ecf2] p-2 space-y-2">
    <p>@{match.screen_name} has this pressing open to trade {match.item_condition && ('· '+match.item_condition)}</p>
    {offers.length > 0 && <label className="block">Offer a copy from your shelf
      <select className="block w-full bevel-in bg-white p-1" value={offer?.id || ''} onChange={e => setOfferId(e.target.value)}>
        <option value="">Ask about availability only</option>
        {offers.map(copy => <option key={copy.id} value={copy.id}>{[copy.artist, copy.title, copy.format, copy.condition, copy.pressing].filter(Boolean).join(' · ')}</option>)}
      </select>
    </label>}
    <button type="button" className="bevel-btn px-2" onClick={compose}>Draft trade message</button>
  </div>;
}

export default function Wantlist({userId,items,setItems,offers,onMessage}){
  const [draft,setDraft]=useState(blank);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    db.from('wantlist_items').select('id,payload').eq('user_id',userId).order('id')
      .then(({data,error})=>{
        if(!active)return;
        if(error)setMessage(error.message);
        else setItems(data.map(row=>({...row.payload,id:row.id})));
        setLoading(false);
      });
    return ()=>{active=false};
  },[userId]);

  const [matches,setMatches]=useState([]);
  const [matchError,setMatchError]=useState('');
  useEffect(()=>{
    let active=true,revision=0;
    async function refresh(){
      const request=++revision;
      const {data,error}=await db.rpc('my_trade_matches');
      if(!active||revision!==request)return;
      setMatchError(error?.message||'');
      setMatches(error?[]:data);
    }
    refresh();
    const timer=setInterval(refresh,15000);
    return ()=>{active=false;clearInterval(timer)};
  },[userId,items]);
  async function save(event){
    event.preventDefault();
    if(busy||!draft.artist.trim()||!draft.title.trim())return;
    setBusy(true);
    const item={...draft,artist:draft.artist.trim(),title:draft.title.trim(),id:crypto.randomUUID()};
    try{
      const {error}=await db.from('wantlist_items').insert({id:item.id,user_id:userId,payload:item});
      if(error)throw error;
      setItems(previous=>[item,...previous]);setDraft(blank);setMessage('Added to your wantlist.');
    }catch(error){setMessage(error.message)}finally{setBusy(false)}
  }
  async function remove(id){
    setBusy(true);
    try{
      const {error}=await db.from('wantlist_items').delete().eq('id',id).eq('user_id',userId);
      if(error)throw error;
      setItems(previous=>previous.filter(item=>item.id!==id));setMessage('Removed from your wantlist.');
    }catch(error){setMessage(error.message)}finally{setBusy(false)}
  }
  return <section className="grid md:grid-cols-2 gap-4 text-sm">
    <div className="bg-[#f4f1ea] bevel-out p-4"><h2 className="font-bold text-lg">My wantlist</h2>
      <CollectionExport kind="wantlist" userId={userId} items={items}/>
              {loading?<p>Loading your records…</p>:!items.length&&<p>Your wantlist is empty. Add a pressing you’re looking for.</p>}
      {matchError&&<p role="alert">{matchError}</p>}<ul>{items.map(item=><li key={item.id} className="border-b py-3">
        <strong>{item.artist} — {item.title}</strong><p>{[item.format,item.pressing,item.budget!==''&&item.budget!=null?'Budget: $'+item.budget:null].filter(Boolean).join(' · ')}</p>
        {item.discogsId&&<a className="underline mr-3" target="_blank" rel="noreferrer" href={'https://www.discogs.com/release/'+item.discogsId}>Discogs pressing</a>}
        {matches.filter(m=>m.wanted_id===item.id).map(m=><TradeMatch key={m.shelf_id} match={m} wanted={item} offers={offers} onMessage={onMessage}/>)}
        <button className="underline" disabled={busy} onClick={()=>remove(item.id)}>Remove</button></li>)}</ul></div>
    <form className="bg-[#ece9d8] bevel-out p-4 space-y-3" onSubmit={save}><h3 className="font-bold">Add a wanted release</h3>
      <DiscogsLookup onImport={data=>setDraft(prev=>({...prev,artist:data.artist,title:data.title,format:data.format,pressing:data.pressing,discogsId:data.discogsId}))}/>
      {Object.entries({artist:'Artist',title:'Album title',format:'Format',pressing:'Target pressing',budget:'Maximum budget ($, optional)'}).map(([key,label])=><label key={key} className="block">{label}
        <input className="block w-full bg-white bevel-in p-1" required={key==='artist'||key==='title'} type={key==='budget'?'number':'text'} min="0" step="0.01" value={draft[key]} onChange={e=>setDraft(prev=>({...prev,[key]:e.target.value,discogsId:key==='budget'?prev.discogsId:null}))}/></label>)}
      <button disabled={busy||loading} className="aqua-btn text-white px-4 py-2">Save to wantlist</button><p role="status">{message}</p></form></section>
}
