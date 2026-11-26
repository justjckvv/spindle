import React,{useEffect,useState} from 'react';
import {db} from './backend';
import Replies from './Replies';
export default function PublicForum({onBack}){
 const [rows,setRows]=useState([]),[notice,setNotice]=useState('Loading discussions…');
 useEffect(()=>{
   let active=true;
   async function refresh(){
     const {data,error}=await db.from('threads').select('id,crate,title,body,created_at,profiles(username)').order('created_at',{ascending:false});
     if(active){setRows(data||[]);setNotice(error?.message||(data?.length?'':'No topics yet.'))}
   }
   refresh();
   const channel=db.channel('public-discussions').on('postgres_changes',{event:'*',schema:'public',table:'threads'},refresh).subscribe(state=>{if(state==='SUBSCRIBED')refresh()});
   return ()=>{active=false;db.removeChannel(channel)};
 },[]);
 return <main className="min-h-screen bg-[#e7e2d8] p-4"><section className="mx-auto max-w-3xl"><header className="bg-[#243b53] p-3 text-white flex justify-between"><h1 className="font-bold">Spindle · Public crates</h1><button className="underline" onClick={onBack}>Member access</button></header>
 <p role="status">{notice}</p>{rows.map(post=><article key={post.id} className="bg-white border my-3 p-3"><small>{post.crate} · @{post.profiles?.username}</small><h2 className="font-bold">{post.title}</h2><p className="whitespace-pre-wrap">{post.body}</p><Replies threadId={post.id} userId={null}/></article>)}</section></main>
}
