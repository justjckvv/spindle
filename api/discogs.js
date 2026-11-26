export default async function handler(req,res) {
  if(req.method!=='GET') return res.status(405).end();
  const {id,q,kind}=req.query;
  const token=process.env.DISCOGS_TOKEN;
  let url;
  if(typeof id==='string' && /^\d{1,10}$/.test(id)) {
    url=new URL('https://api.discogs.com/releases/'+id);
  } else if(typeof q==='string' && q.trim() && q.length<=100 && ['barcode','catno'].includes(kind)) {
    if(!token) return res.status(503).json({error:'Barcode and catalog search need the site’s Discogs token. You can import by release ID now.'});
    url=new URL('https://api.discogs.com/database/search');
    url.search=new URLSearchParams({type:'release',per_page:'10',[kind]:q.trim()});
  } else return res.status(400).json({error:'Enter a valid release ID or search term.'});
  try {
    const upstream=await fetch(url,{headers:{'User-Agent':'Spindle/1.0 (+https://spindle-seven.vercel.app)',...(token?{Authorization:'Discogs token='+token}:{})},signal:AbortSignal.timeout(10000)});
    if(!upstream.ok) return res.status(upstream.status).json({error:upstream.status===429?'Discogs is busy. Try again shortly.':upstream.status===404?'Release not found.':'Discogs could not complete the lookup.'});
    const data=await upstream.json();
    res.setHeader('Cache-Control','public, s-maxage=300');
    if(!id) return res.json({results:data.results.map(r=>({id:r.id,title:r.title,year:r.year,country:r.country,format:r.format}))});
    return res.json({discogsId:data.id,title:data.title,artist:data.artists_sort,year:data.year||'',format:data.formats?.[0]?.name||'Other',pressing:data.labels?.[0]?.catno||'',cover:data.images?.[0]?.uri||'',tracks:(data.tracklist||[]).map(t=>({position:t.position,title:t.title,duration:t.duration}))});
  } catch {return res.status(502).json({error:'Discogs is temporarily unavailable.'});}
}
