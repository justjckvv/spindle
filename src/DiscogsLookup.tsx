import { discogsGenres } from '../shared/discogsGenres.js';
import React,{useState} from 'react';
import Scanner from "./Scanner";
export default function DiscogsLookup({onImport}) {
  const [mode,setMode]=useState('text'),[query,setQuery]=useState(''),[results,setResults]=useState([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const [camera,setCamera]=useState(false);
  const [format,setFormat]=useState(''),[country,setCountry]=useState(''),[nextPage,setNextPage]=useState(null);
  const [genre,setGenre]=useState(''),[style,setStyle]=useState('');
  function clearResults(){setResults([]);setNextPage(null);setMessage('')}
  async function lookup(id?,barcode?,page=1) {
    setBusy(true);setMessage('');
    if(!id && page===1) clearResults();
    try {
      const params=id?{id:String(id)}:{kind:barcode?"barcode":mode,q:barcode||query.trim()};
      const searchParams=new URLSearchParams(params);
      if(!id){
        searchParams.set('page',String(page));
        if(!barcode && genre)searchParams.set('genre',genre);
        if(!barcode && style.trim())searchParams.set('style',style.trim());
        if(!barcode && format)searchParams.set('format',format);
        if(!barcode && country.trim())searchParams.set('country',country.trim());
      }
      const response=await fetch('/api/discogs?'+searchParams);
      const data=await response.json();
      if(!response.ok) throw Error(data.error||'Lookup failed.');
      if(data.results){setResults(previous=>page===1?data.results:[...new Map([...previous,...data.results].map(result=>[result.id,result])).values()]);setNextPage(data.nextPage);if(page===1 && !data.results.length)setMessage('No matching releases.');}
      else {clearResults();onImport(data);setMessage('Imported from Discogs. Review the pressing before saving.');}
    }catch(error){setMessage(error.message)}finally{setBusy(false)}
  }
  function search(){
    if (!query.trim() && !(mode==='text' && (genre || style.trim()))) { setMessage('Enter a search term first.'); return; }
    if(mode!=='id')return lookup();
    const match=query.trim().match(/^(?:https?:\/\/(?:www\.)?discogs\.com\/release\/|\[?r)?(\d{1,10})(?:-[^\s]*)?\]?\/?$/i);
    if(match)return lookup(match[1]);
    setMessage('Enter a Discogs release ID, r-number or release URL.');
  }
  return <fieldset disabled={busy} className="bg-white bevel-in p-3 space-y-2"><legend className="font-bold">Import from Discogs</legend>
    <select aria-label="Lookup type" value={mode} onChange={e=>{setMode(e.target.value);setQuery('');clearResults()}}><option value="text">Artist or album</option><option value="id">Release ID or link</option><option value="barcode">Barcode</option><option value="catno">Catalog number</option></select>
    <button type="button" className="bevel-btn p-1" onClick={()=>setCamera(true)}>Scan barcode</button>
    {mode!=='id' && <div className="flex flex-wrap gap-2">
      <label>Genre <select value={genre} onChange={e=>{setGenre(e.target.value);clearResults()}}>
        <option value="">All genres</option>{discogsGenres.map(name=><option key={name} value={name}>{name==='Hip Hop'?'Hip-Hop':name}</option>)}
      </select></label>
      <label>Style <input value={style} maxLength={100} placeholder="e.g. Shoegaze" onChange={e=>{setStyle(e.target.value);clearResults()}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search()}}}/></label>
      <label>Format <select value={format} onChange={e=>{setFormat(e.target.value);clearResults()}}>
        <option value="">All formats</option>{['CD','Vinyl','Cassette'].map(value=><option key={value}>{value}</option>)}
      </select></label>
      <label>Release country <input className="border px-2" value={country} maxLength={80} placeholder="e.g. UK" onChange={e=>{setCountry(e.target.value);clearResults()}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search()}}}/></label>
    </div>}
    {camera&&<Scanner onClose={()=>setCamera(false)} onCode={code=>{setCamera(false);setMode("barcode");setFormat("");setCountry("");setStyle("");setGenre("");setQuery(code);lookup(undefined,code)}}/>}
    <div className="flex gap-2"><input aria-label="Discogs lookup" placeholder={mode==='text'?'e.g. Radiohead OK Computer':undefined} className="border px-2 min-w-0 flex-1" value={query} onChange={e=>{setQuery(e.target.value);clearResults()}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search()}}}/><button type="button" className="bevel-btn p-1" onClick={search}>{busy?'Loading…':'Look up'}</button></div>
    <p role="status">{message}</p>{results.map(r=><button type="button" key={r.id} className="block text-left underline" onClick={()=>lookup(r.id)}>{[r.title, r.year, r.country, r.format?.join(', '), r.catalogNumber, r.genres?.join(' / '), 'r'+r.id].filter(Boolean).join(' · ')}</button>)}
    {nextPage && <button type="button" className="bevel-btn px-2" onClick={()=>lookup(undefined,undefined,nextPage)}>Show more pressings</button>}</fieldset>
}
